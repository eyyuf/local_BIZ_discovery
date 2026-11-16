<?php

namespace App\Modules\Place\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_section_id',
        'name',
        'description',
        'price',
        'image_url',
        'is_available',
    ];

    public function section(): BelongsTo
    {
        return $this->BelongsTo(MenuSection::class, 'menu_section_id');
    }

    public function getImageUrlAttribute(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        try {
            return Storage::disk('cloudinary')->url($value);
        } catch (\Throwable) {
            return $value;
        }
    }
}
