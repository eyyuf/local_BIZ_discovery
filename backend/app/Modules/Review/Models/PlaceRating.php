<?php

namespace App\Modules\Review\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaceRating extends Model
{
    use HasFactory;

    protected $table = 'place_ratings';

    protected $fillable = [
        'user_id',
        'place_id',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }
}
