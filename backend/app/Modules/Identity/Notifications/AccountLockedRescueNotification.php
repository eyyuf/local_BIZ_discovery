<?php

namespace App\Modules\Identity\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class AccountLockedRescueNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        $magicUrl = URL::temporarySignedRoute(
            'auth.magic-login',
            now()->addMinutes(30),
            ['id' => $notifiable->id]
        );

        $resetUrl = "{$frontendUrl}/forgot-password?email=" . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Account Locked: Secure Access Link')
            ->greeting("Hello {$notifiable->name},")
            ->line('Your account was temporarily locked after 5 unsuccessful password attempts.')
            ->line('If this was you, you can log in instantly with the one-click magic link below:')
            ->action('Sign In with One Click', $magicUrl)
            ->line('If you forgot your password, you can reset it here:')
            ->line($resetUrl)
            ->line('If you did not attempt this, your account is safe and password login remains locked.');
    }
}
