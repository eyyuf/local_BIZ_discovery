<?php

namespace App\Modules\Discovery\Models;

use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
    ];

    public function places(): BelongsToMany
    {
        return $this->belongsToMany(Place::class, 'amenity_place');
    }
}
