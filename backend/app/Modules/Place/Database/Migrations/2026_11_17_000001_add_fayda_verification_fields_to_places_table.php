<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            if (!Schema::hasColumn('places', 'manager_name')) {
                $table->string('manager_name', 150)->nullable()->after('tax_id');
            }
            if (!Schema::hasColumn('places', 'fayda_fin')) {
                $table->string('fayda_fin', 30)->nullable()->after('manager_name');
            }
            if (!Schema::hasColumn('places', 'fayda_document')) {
                $table->string('fayda_document', 255)->nullable()->after('verification_document');
            }
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $columns = ['manager_name', 'fayda_fin', 'fayda_document'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('places', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
