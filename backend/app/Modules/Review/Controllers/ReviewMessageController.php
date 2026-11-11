<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Review\Actions\CreateReviewMessageAction;
use App\Modules\Review\Actions\DeleteReviewMessageAction;
use App\Modules\Review\Actions\ListReviewMessagesAction;
use App\Modules\Review\Actions\UpdateReviewMessageAction;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewMessage;
use App\Modules\Review\Requests\StoreReviewMessageRequest;
use App\Modules\Review\Requests\UpdateReviewMessageRequest;
use App\Modules\Review\Resources\ReviewMessageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReviewMessageController extends Controller
{
    /**
     * Display a paginated listing of discussion messages for a published review (Public).
     */
    public function index(
        Request $request,
        Review $review,
        ListReviewMessagesAction $action
    ): JsonResponse {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);
        $messages = $action->execute($review, $perPage);

        return ReviewMessageResource::collection($messages)
            ->additional(['message' => 'Messages retrieved successfully.'])
            ->response();
    }

    /**
     * Send a new message in the review discussion (Authenticated participant).
     */
    public function store(
        StoreReviewMessageRequest $request,
        Review $review,
        CreateReviewMessageAction $action
    ): JsonResponse {
        Gate::authorize('create', [ReviewMessage::class, $review]);

        $message = $action->execute($review, $request->user(), $request->validated('message'));
        $message->loadMissing('author');

        return (new ReviewMessageResource($message))
            ->additional(['message' => 'Message sent successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Edit a message in the review discussion (Authenticated message author).
     */
    public function update(
        UpdateReviewMessageRequest $request,
        Review $review,
        ReviewMessage $message,
        UpdateReviewMessageAction $action
    ): JsonResponse {
        if ((int) $message->review_id !== (int) $review->id) {
            abort(404, 'Message not found for this review.');
        }

        Gate::authorize('update', [$message, $review]);

        $message = $action->execute($message, $request->validated('message'));
        $message->loadMissing('author');

        return (new ReviewMessageResource($message))
            ->additional(['message' => 'Message updated successfully.'])
            ->response();
    }

    /**
     * Delete a message in the review discussion (Authenticated message author).
     */
    public function destroy(
        Request $request,
        Review $review,
        ReviewMessage $message,
        DeleteReviewMessageAction $action
    ): JsonResponse {
        if ((int) $message->review_id !== (int) $review->id) {
            abort(404, 'Message not found for this review.');
        }

        Gate::authorize('delete', [$message, $review]);

        $action->execute($message);

        return response()->json([
            'message' => 'Message deleted successfully.',
        ], 200);
    }
}
