<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('place_id')->constrained('places')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedTinyInteger('rating');
                $table->text('comment');
                $table->boolean('is_published')->default(true);
                $table->timestamps();

                $table->index(['place_id', 'is_published']);
                $table->index('user_id');
            });
        } elseif (!Schema::hasColumn('reviews', 'is_published')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->boolean('is_published')->default(true);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
