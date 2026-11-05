<?php

namespace App\Modules\Review\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'user_id',
        'rating',
        'comment',
        'is_published',
    ];

    protected $casts = [
        'rating'       => 'integer',
        'is_published' => 'boolean',
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function response(): HasOne
    {
        return $this->hasOne(ReviewResponse::class);
    }
}
