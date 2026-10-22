<?php

namespace App\Modules\Place\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        // TODO: define section relation
    }
}
