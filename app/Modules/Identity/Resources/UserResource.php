<?php

namespace App\Modules\Identity\Resources;
use Illuminate\Http\Request;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array{
        return [
            'id'=>$this->id,
            'name'=>$this->name,
            'email'=>$this->email,
            'email_verified_at'=>$this->email_verified_at,
            'created_at'=>$this->created_at,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : $this->oauthAccounts->first()?->avatar,
        ];

    }
}
