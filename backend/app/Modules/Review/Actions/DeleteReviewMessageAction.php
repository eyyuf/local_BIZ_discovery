<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\ReviewMessage;

class DeleteReviewMessageAction
{
    /**
     * Delete an existing message.
     *
     * @param ReviewMessage $message
     * @return bool
     */
    public function execute(ReviewMessage $message): bool
    {
        return (bool) $message->delete();
    }
}
