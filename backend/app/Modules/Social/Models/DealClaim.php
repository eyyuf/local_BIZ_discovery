<?php

namespace App\Modules\Social\Models;

use App\Modules\Identity\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealClaim extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'voucher_code',
        'status',
        'claimed_at',
        'redeemed_at',
        'expires_at',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeClaimed(Builder $query): Builder
    {
        return $query->where('status', 'claimed');
    }

    public function scopeRedeemed(Builder $query): Builder
    {
        return $query->where('status', 'redeemed');
    }

    public function isRedeemed(): bool
    {
        return $this->status === 'redeemed';
    }

    public function isClaimed(): bool
    {
        return $this->status === 'claimed';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired'
            || ($this->expires_at && $this->expires_at->isPast());
    }
}

