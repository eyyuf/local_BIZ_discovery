<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->constrained('places')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('content');
            $table->string('deal_type')->default('deal');
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->string('discount_code')->nullable();
            $table->string('image_url')->nullable();
            $table->unsignedInteger('max_claims')->nullable();
            $table->unsignedInteger('claims_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
            $table->index('place_id');
            $table->index('user_id');
            $table->index('deal_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
