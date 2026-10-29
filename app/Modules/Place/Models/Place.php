<?php

namespace App\Modules\Place\Models;

use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Facades\DB;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'address',
        'latitude',
        'longitude',
        'location',
        'phone',
        'website',
        'is_active',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $place) {
            if ($place->latitude !== null && $place->longitude !== null) {
                $place->location = DB::raw(
                    "ST_SetSRID(ST_MakePoint({$place->longitude}, {$place->latitude}), 4326)"
                );
            }
        });
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function operatingHours(): HasMany
    {
        return $this->hasMany(OperatingHour::class, 'place_id');
    }

    public function menuSections(): HasMany
    {
        return $this->hasMany(MenuSection::class, 'place_id');
    }

    public function menuItems(): HasManyThrough
    {
        return $this->hasManyThrough(MenuItem::class, MenuSection::class);
    }
}
