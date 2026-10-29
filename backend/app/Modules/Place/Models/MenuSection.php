<?php

namespace App\Modules\Place\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'place_id',
        'name',
        'display_order',
    ];

    public function place(): BelongsTo
    {
        return $this->BelongsTO(Place::class,'place_id');
    }

    public function items(): HasMany
    {
        return $this->HasMany(MenuItem::class,'menu_section_id');
    }
}
