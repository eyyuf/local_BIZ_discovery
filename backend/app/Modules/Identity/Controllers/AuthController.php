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
use Illuminate\Support\Facades\Auth;
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
        Auth::guard('web')->login($user, $request->boolean('remember', true));
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }

    public function redirectToGoogle(Request $request)
    {
        $redirect = Socialite::driver('google')->stateless()->redirect();

        if ($request->wantsJson() && ! $request->acceptsHtml()) {
            return response()->json([
                'url' => $redirect->getTargetUrl(),
            ]);
        }

        return $redirect;
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Unable to authenticate with Google: ' . $e->getMessage(),
            ], 422);
        }

        $oauthAccount = OAuthAccount::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        if ($oauthAccount) {
            $user = $oauthAccount->user;
            if ($googleUser->getAvatar()) {
                $oauthAccount->update(['avatar' => $googleUser->getAvatar()]);
            }
        } else {
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name'              => $googleUser->getName() ?? 'Google User',
                    'email'             => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                    'password'          => bcrypt(Str::random(16)),
                    'avatar'            => $googleUser->getAvatar(),
                ]);
            }

            $user->oauthAccounts()->create([
                'provider'    => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar'      => $googleUser->getAvatar(),
            ]);
        }

        // 1. Sign in really (session authentication)
        Auth::guard('web')->login($user, true);

        // 2. Generate Sanctum bearer token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 3. If explicit API client requests JSON without HTML acceptance
        if ($request->wantsJson() && ! $request->acceptsHtml()) {
            return response()->json([
                'message'      => 'Logged in successfully',
                'token'        => $token,
                'user'         => new UserResource($user),
                'redirect_url' => url('/api/v1/auth/me?token=' . $token),
            ]);
        }

        // 4. Redirect to the right API endpoint (/api/v1/auth/me) with token cookie & query param
        return redirect()->to('/api/v1/auth/me?token=' . $token)
            ->withCookie(cookie('auth_token', $token, 60 * 24 * 7, '/', null, false, false));
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ])->withoutCookie('auth_token');
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
