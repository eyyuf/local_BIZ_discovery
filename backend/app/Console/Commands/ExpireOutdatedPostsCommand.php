<?php

namespace App\Console\Commands;

use App\Modules\Social\Actions\ExpireOutdatedPostsAction;
use Illuminate\Console\Command;

class ExpireOutdatedPostsCommand extends Command
{
    protected $signature = 'social:expire-posts';

    protected $description = 'Expire outdated social posts and unclaimed deals';

    public function handle(ExpireOutdatedPostsAction $action): int
    {
        $count = $action->execute();

        $this->info("Expired {$count} outdated post(s).");

        return Command::SUCCESS;
    }
}

