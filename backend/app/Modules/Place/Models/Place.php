<?php

namespace App\Modules\Place\Models;

use App\Modules\Discovery\Models\Amenity;
use App\Modules\Discovery\Models\Category;
use App\Modules\Discovery\Models\PlaceBookmark;
use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    /**
     * PostGIS: calculate distance in kilometers using ST_Distance.
     */
    public function scopeWithDistanceTo(Builder $query, float $lat, float $lng): Builder
    {
        return $query->select('places.*')
            ->selectRaw(
                'ST_Distance(places.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000.0 AS distance_km',
                [$lng, $lat]
            );
    }

    /**
     * PostGIS: filter places within radius in kilometers using spatial index (ST_DWithin).
     */
    public function scopeWithinRadius(Builder $query, float $lat, float $lng, float $radiusKm): Builder
    {
        $radiusMeters = $radiusKm * 1000;

        return $query->whereNotNull('location')
            ->whereRaw(
                'ST_DWithin(places.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)',
                [$lng, $lat, $radiusMeters]
            );
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

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_place');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'amenity_place');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(PlaceBookmark::class);
    }
}
