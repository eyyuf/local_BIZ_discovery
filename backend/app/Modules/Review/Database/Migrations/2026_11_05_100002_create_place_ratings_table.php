<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('place_ratings')) {
            Schema::create('place_ratings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('place_id')->constrained('places')->cascadeOnDelete();
                $table->unsignedTinyInteger('rating');
                $table->timestamps();

                $table->unique(['user_id', 'place_id']);
                $table->index('place_id');
            });

            DB::statement('ALTER TABLE place_ratings ADD CONSTRAINT check_place_ratings_rating_range CHECK (rating BETWEEN 1 AND 5);');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('place_ratings');
    }
};
