<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

/**
 * Auto-records create/update/delete audit entries for a model.
 * Only fires when a user is authenticated (see ActivityLog::record).
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            ActivityLog::record('created', static::activityLabel('Membuat', $model), $model);
        });

        static::updated(function (Model $model) {
            $changes = collect($model->getChanges())
                ->except(['updated_at', 'password', 'remember_token'])
                ->toArray();

            if (empty($changes)) {
                return;
            }

            ActivityLog::record('updated', static::activityLabel('Mengubah', $model), $model, [
                'changed' => array_keys($changes),
                'values' => $changes,
            ]);
        });

        static::deleted(function (Model $model) {
            ActivityLog::record('deleted', static::activityLabel('Menghapus', $model), $model);
        });
    }

    protected static function activityLabel(string $verb, Model $model): string
    {
        $name = $model->name ?? $model->title ?? $model->description ?? ('#'.$model->getKey());

        return $verb.' '.class_basename($model).': '.$name;
    }
}
