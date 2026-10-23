<?php

namespace App\Modules\Place\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperatingHour extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'day_of_week',
        'opens_at',
        'closes_at',
        'is_closed',
    ];

    public function place(): BelongsTo
    {
        return $this->BelongsTo(Place::class,'place_id');
    }
}
