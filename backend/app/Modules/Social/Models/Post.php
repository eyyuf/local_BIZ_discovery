<?php

namespace App\Modules\Social\Models;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'user_id',
        'title',
        'content',
        'deal_type',
        'discount_percentage',
        'image_url',
        'expires_at',
        'is_active',
        'likes_count',
    ];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        // TODO: Scope active and non-expired deals
    }
}
