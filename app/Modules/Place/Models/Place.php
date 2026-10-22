<?php

namespace App\Modules\Place\Models;

use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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
        'phone',
        'website',
        'is_active',
    ];

    public function owner(): BelongsTo
    {
        // TODO: define owner relation
    }

    public function operatingHours(): HasMany
    {
        // TODO: define operating hours relation
    }

    public function menuSections(): HasMany
    {
        // TODO: define menu sections relation
    }

    public function menuItems(): HasManyThrough
    {
        // TODO: define menu items relation
    }
}
