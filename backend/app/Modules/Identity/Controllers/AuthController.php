<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Actions\LoginUserAction;
use App\Modules\Identity\Actions\RegisterUserAction;
use App\Modules\Identity\Actions\ResetPasswordAction;
use App\Modules\Identity\Actions\SendPasswordResetLinkAction;
use App\Modules\Identity\Models\OAuthAccount;
use App\Modules\Identity\Models\User;
use App\Modules\Identity\Requests\ForgotPasswordRequest;
use App\Modules\Identity\Requests\LoginRequest;
use App\Modules\Identity\Requests\RegisterRequest;
use App\Modules\Identity\Requests\ResetPasswordRequest;
use App\Modules\Identity\Resources\UserResource;
use Illuminate\Auth\Events\Verified;
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

    public function forgotPassword(ForgotPasswordRequest $request, SendPasswordResetLinkAction $action)
    {
        $message = $action->execute($request->validated());

        return response()->json([
            'message' => $message,
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $action)
    {
        $message = $action->execute($request->validated());

        return response()->json([
            'message' => $message,
        ]);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully!']);
    }

    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent!']);
    }
}
