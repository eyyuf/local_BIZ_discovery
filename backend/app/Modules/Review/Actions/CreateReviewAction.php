<?php

namespace App\Modules\Review\Actions;

use App\Modules\Identity\Models\User;
use App\Modules\Place\Models\Place;
use App\Modules\Review\Models\PlaceRating;
use App\Modules\Review\Models\Review;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateReviewAction
{
    /**
     * Execute review creation logic.
     *
     * @param Place $place
     * @param User $author
     * @param array $data Validated data containing 'rating' and 'comment'
     * @return Review
     *
     * @throws AuthorizationException
     * @throws ValidationException
     */
    public function execute(Place $place, User $author, array $data): Review
    {
        if ((int) $author->id === (int) $place->user_id) {
            throw new AuthorizationException('You cannot review your own place.');
        }

        if (! $place->is_active) {
            throw ValidationException::withMessages([
                'place' => ['Cannot submit reviews for an inactive place.'],
            ]);
        }

        // Prevent duplicate submissions before hitting the database constraint
        if (Review::where('place_id', $place->id)->where('user_id', $author->id)->exists()) {
            throw ValidationException::withMessages([
                'review' => ['You have already reviewed this place. You can edit your existing review instead.'],
            ]);
        }

        $rating = (int) $data['rating'];

        try {
            return DB::transaction(function () use ($place, $author, $rating, $data) {
                // Synchronize or update the place_ratings table to keep aggregation in sync
                PlaceRating::updateOrCreate(
                    [
                        'place_id' => $place->id,
                        'user_id'  => $author->id,
                    ],
                    [
                        'rating'   => $rating,
                    ]
                );

                return Review::create([
                    'place_id'     => $place->id,
                    'user_id'      => $author->id,
                    'rating'       => $rating,
                    'comment'      => $data['comment'],
                    'is_published' => true,
                ]);
            });
        } catch (UniqueConstraintViolationException $e) {
            throw ValidationException::withMessages([
                'review' => ['You have already reviewed this place. You can edit your existing review instead.'],
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23505' || str_contains($e->getMessage(), 'uq_reviews_place_user')) {
                throw ValidationException::withMessages([
                    'review' => ['You have already reviewed this place. You can edit your existing review instead.'],
                ]);
            }
            throw $e;
        }
    }
}
