<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            if (!Schema::hasColumn('places', 'claimed_by_id')) {
                $table->foreignId('claimed_by_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('places', 'claim_role')) {
                $table->string('claim_role', 50)->nullable()->after('claimed_by_id');
            }
            if (!Schema::hasColumn('places', 'claim_contact_phone')) {
                $table->string('claim_contact_phone', 30)->nullable()->after('claim_role');
            }
            if (!Schema::hasColumn('places', 'claim_notes')) {
                $table->text('claim_notes')->nullable()->after('claim_contact_phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            if (Schema::hasColumn('places', 'claimed_by_id')) {
                $table->dropForeign(['claimed_by_id']);
                $table->dropColumn('claimed_by_id');
            }
            $columns = ['claim_role', 'claim_contact_phone', 'claim_notes'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('places', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
