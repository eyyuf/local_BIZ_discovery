<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithQueryToken
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken() && $token = ($request->query('token') ?: $request->cookie('auth_token'))) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        return $next($request);
    }
}

