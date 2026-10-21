<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Actions\LoginUserAction;
use App\Modules\Identity\Actions\RegisterUserAction;
use App\Modules\Identity\Models\OAuthAccount;
use App\Modules\Identity\Models\User;
use App\Modules\Identity\Requests\LoginRequest;
use App\Modules\Identity\Requests\RegisterRequest;
use App\Modules\Identity\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterUserAction $action)
        {
            $user = $action->execute($request->validated());
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registered successfully',
            'token'   => $token,
            'user'    => new UserResource($user),
        ], 201);
        }

    public function login(LoginRequest $request, LoginUserAction $action)
        {
        $user = $action->execute($request->validated());
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }

    public function redirectToGoogle()
    {
        $url= Socialite::driver('google')->Stateless()->redirect()->getTargetUrl();
        return response()->json([
            'url'=> $url,
        ]);

    }
    public function handleGoogleCallback(){
        $googleUser = Socialite::driver('google')->stateless()->user();

        $oauthAccount = OAuthAccount::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        if ($oauthAccount) {
            $user = $oauthAccount->user;
        } else {
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                    'password' => bcrypt(Str::random(16)),
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
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
