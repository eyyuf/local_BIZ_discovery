<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\DTOs\CreateReviewDTO;
use App\Modules\Review\Models\Review;

class CreateReviewAction
{
    /**
     * Execute review creation logic.
     */
    public function execute(Place $place, User $author, CreateReviewDTO $dto): Review
    {
        // TODO: Implement review creation and rating recalculation logic
    }
}
