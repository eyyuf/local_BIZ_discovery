<?php

namespace App\Modules\Identity\Controllers;
use App\Http\Controllers\Controller; 
use App\Modules\Identity\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request){
        return new UserResource($request->user());
    }
}
