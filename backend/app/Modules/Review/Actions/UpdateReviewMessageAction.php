<?php

namespace App\Modules\Review\Actions;

use App\Modules\Review\Models\ReviewMessage;

class UpdateReviewMessageAction
{
    /**
     * Update an existing message.
     *
     * @param ReviewMessage $message
     * @param string $messageText
     * @return ReviewMessage
     */
    public function execute(ReviewMessage $message, string $messageText): ReviewMessage
    {
        $message->update([
            'message' => $messageText,
        ]);

        return $message;
    }
}
