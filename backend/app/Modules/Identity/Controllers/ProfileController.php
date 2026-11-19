<?php

namespace App\Modules\Identity\Controllers;

use App\Http\Controllers\Controller; 
use App\Modules\Identity\Actions\UpdateProfileAction;
use App\Modules\Identity\DTOs\UpdateProfileDTO;
use App\Modules\Identity\Requests\UpdateProfileRequest;
use App\Modules\Identity\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request){
        return (new UserResource($request->user()))
            ->response()
            ->setStatusCode(200);
    }

    public function update(UpdateProfileRequest $request, UpdateProfileAction $action){
        $updateUser = $action->execute($request->user(), UpdateProfileDTO::fromRequest($request));
        return response()->json([
            'message' => 'profile updated successfully',
            'user'    => new UserResource($updateUser),
        ]);
    }
}
