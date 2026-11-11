<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('place_images')) {
            Schema::create('place_images', function (Blueprint $table) {
                $table->id();
                $table->foreignId('place_id')->constrained('places')->cascadeOnDelete();
                $table->string('image_path');
                $table->boolean('is_cover')->default(false);
                $table->integer('display_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('place_images');
    }
};

