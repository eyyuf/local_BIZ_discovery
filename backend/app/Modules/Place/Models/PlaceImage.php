<?php

namespace App\Modules\Place\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PlaceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'image_path',
        'is_cover',
        'display_order',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = ['url'];

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    /**
     * Get the full Cloudinary or remote URL for this image.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->image_path)) {
            return '';
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        try {
            return Storage::disk('cloudinary')->url($this->image_path);
        } catch (\Throwable) {
            return $this->image_path;
        }
    }
}

