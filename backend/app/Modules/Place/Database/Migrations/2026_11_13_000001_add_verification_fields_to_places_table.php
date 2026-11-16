<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            if (!Schema::hasColumn('places', 'verification_status')) {
                $table->string('verification_status')->default('unverified')->after('is_active');
            }
            if (!Schema::hasColumn('places', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('verification_status');
            }
            if (!Schema::hasColumn('places', 'tax_id')) {
                $table->string('tax_id')->nullable()->after('is_verified');
            }
            if (!Schema::hasColumn('places', 'telebirr_merchant_id')) {
                $table->string('telebirr_merchant_id')->nullable()->after('tax_id');
            }
            if (!Schema::hasColumn('places', 'verification_document')) {
                $table->string('verification_document')->nullable()->after('telebirr_merchant_id');
            }
            if (!Schema::hasColumn('places', 'verification_notes')) {
                $table->text('verification_notes')->nullable()->after('verification_document');
            }
            if (!Schema::hasColumn('places', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verification_notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn([
                'verification_status',
                'is_verified',
                'tax_id',
                'telebirr_merchant_id',
                'verification_document',
                'verification_notes',
                'verified_at',
            ]);
        });
    }
};
