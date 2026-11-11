<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
       
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');

        Schema::table('places', function (Blueprint $table) {
            $table->geography('location', subtype: 'point', srid: 4326)->nullable();
            $table->spatialIndex('location');
        });
    }


    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropSpatialIndex(['location']);
            $table->dropColumn('location');
        });
    }
};
