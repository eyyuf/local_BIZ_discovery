<?php

namespace App\Modules\Identity\Controllers;
use App\Modules\Identity\Models\OAuthAccount;
use App\Modules\Identity\Models\User;
use Illuminate\Support\Str;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
class AuthController extends Controller
{
    public function redirectToGoogle()
    {
        $url= Socialite::driver('google')->Stateless()->redirect()->getTargetUrl();
        return response()->json([
            'url'=> $url,
        ]);

    }
    public function handleGoogleCallback(){
        $user = Socialite::driver('google')->stateless()->user();
        $oauthAccount= OauthAccount::where('provider','google')->
            where('provider_id',$googleUser=getId())->first();
        if($oauthAccount){
            $user = $oauthAccount->user;
        }
        else{
            $user = User::where('email',$googleUser->getEmail())->first();
            if(!$user){
                $user= User::create([
                    'name'=>$googleUser->getName(),
                    'email'=>$googleUser->getEmail(),
                    'email_verified_at'=>now(),
                    'password'=>bcrypt(str::random(16)),
                ]);

            }
            $user->oauthAccounts()->create([
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),        
                ]);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Logged in successfully',
            'token' => $token,
            'user' => $user,
        ]);

    }

}
