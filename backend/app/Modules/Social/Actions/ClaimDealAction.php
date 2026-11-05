<?php

namespace App\Modules\Social\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Social\DTOs\ClaimDealDTO;
use App\Modules\Social\Models\Post;

class ClaimDealAction
{
    /**
     * Execute deal claiming logic.
     */
    public function execute(Post $post, User $user): ClaimDealDTO
    {
        // TODO: Implement deal claim voucher logic
    }
}
