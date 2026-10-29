<?php

namespace App\Modules\Identity\Models;

use Illuminate\Database\Eloquent\Model;

class OAuthAccount extends Model
{
    protected $table = 'oauth_accounts';

    protected $fillable=[
        'user_id',
        'provider',
        'provider_id',
        'avatar',
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
}
