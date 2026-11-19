<?php

namespace App\Support\Storage;

use Cloudinary\Cloudinary;
use League\Flysystem\ChecksumProvider;
use League\Flysystem\Config;
use League\Flysystem\FileAttributes;
use League\Flysystem\FilesystemAdapter;
use League\Flysystem\UnableToDeleteFile;
use League\Flysystem\UnableToSetVisibility;
use League\Flysystem\UnableToWriteFile;
use League\MimeTypeDetection\FinfoMimeTypeDetector;
use League\MimeTypeDetection\MimeTypeDetector;

class CloudinaryStorageAdapter implements ChecksumProvider, FilesystemAdapter
{
    private Cloudinary $cloudinary;
    private MimeTypeDetector $mimeTypeDetector;
    private string $prefix;

    public function __construct(
        Cloudinary $cloudinary,
        ?MimeTypeDetector $mimeTypeDetector = null,
        ?string $prefix = null
    ) {
        $this->cloudinary = $cloudinary;
        $this->mimeTypeDetector = $mimeTypeDetector ?: new FinfoMimeTypeDetector();
        $this->prefix = $prefix ? str_replace('\\', '/', trim($prefix, '/')) : '';
    }

    /**
     * Generate permanent delivery HTTPS URL using Cloudinary SDK builder.
     * Does NOT query the rate-limited Admin API.
     */
    public function getUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        [$id, $type] = $this->prepareResource($path);

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $target = $extension ? "{$id}.{$extension}" : $id;

        return match ($type) {
            'video' => $this->cloudinary->video($target)->analytics(false)->toUrl(),
            'raw'   => $this->cloudinary->raw($target)->analytics(false)->toUrl(),
            default => $this->cloudinary->image($target)->analytics(false)->toUrl(),
        };
    }

    public function write(string $path, string $contents, Config $config): void
    {
        [$id, $type] = $this->prepareResource($path);

        $options = [
            'public_id'     => $id,
            'resource_type' => $type,
            'filename'      => basename($path),
        ];

        try {
            $this->cloudinary->uploadApi()->upload($contents, $options);
        } catch (\Throwable $e) {
            throw UnableToWriteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function writeStream(string $path, $contents, Config $config): void
    {
        [$id, $type] = $this->prepareResource($path);

        if (is_resource($contents)) {
            rewind($contents);
        }

        $options = [
            'public_id'     => $id,
            'resource_type' => $type,
            'filename'      => basename($path),
        ];

        try {
            $this->cloudinary->uploadApi()->upload($contents, $options);
        } catch (\Throwable $e) {
            throw UnableToWriteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function delete(string $path): void
    {
        [$id, $type] = $this->prepareResource($path);

        try {
            $result = $this->cloudinary->uploadApi()->destroy($id, ['resource_type' => $type]);
            if (isset($result['result']) && $result['result'] !== 'ok' && $result['result'] !== 'not found') {
                throw UnableToDeleteFile::atLocation($path, $result['error'] ?? 'Delete failed');
            }
        } catch (\Throwable $e) {
            throw UnableToDeleteFile::atLocation($path, $e->getMessage(), $e);
        }
    }

    public function deleteDirectory(string $path): void
    {
        try {
            $this->cloudinary->adminApi()->deleteAssetsByPrefix($this->applyPrefixToPath($path));
        } catch (\Throwable) {
            // Ignore directory deletion errors
        }
    }

    public function copy(string $source, string $destination, Config $config): void
    {
        [$sourceId] = $this->prepareResource($source);
        [$destId] = $this->prepareResource($destination);

        $this->cloudinary->uploadApi()->explicit($sourceId, [
            'public_id' => $destId,
            'type'      => 'upload',
        ]);
    }

    public function move(string $source, string $destination, Config $config): void
    {
        $this->copy($source, $destination, $config);
        $this->delete($source);
    }

    public function createDirectory(string $path, Config $config): void
    {
        try {
            $this->cloudinary->adminApi()->createFolder($this->applyPrefixToPath($path));
        } catch (\Throwable) {
            // Folders in Cloudinary are virtual; ignore creation errors
        }
    }

    public function directoryExists(string $path): bool
    {
        return $this->fileExists($path);
    }

    public function fileExists(string $path): bool
    {
        [$id, $type] = $this->prepareResource($path);

        try {
            $this->cloudinary->adminApi()->asset($id, ['resource_type' => $type]);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    public function fileSize(string $path): FileAttributes
    {
        [$id, $type] = $this->prepareResource($path);
        $resource = $this->cloudinary->adminApi()->asset($id, ['resource_type' => $type]);

        return new FileAttributes($path, $resource->offsetGet('bytes'));
    }

    public function lastModified(string $path): FileAttributes
    {
        [$id, $type] = $this->prepareResource($path);
        $resource = $this->cloudinary->adminApi()->asset($id, ['resource_type' => $type]);
        $dateTime = new \DateTime($resource->offsetGet('created_at'));

        return new FileAttributes($path, null, null, $dateTime->getTimestamp());
    }

    public function mimeType(string $path): FileAttributes
    {
        return new FileAttributes(
            $path,
            null,
            null,
            null,
            $this->mimeTypeDetector->detectMimeTypeFromPath($path)
        );
    }

    public function read(string $path): string
    {
        $url = $this->getUrl($path);
        $contents = @file_get_contents($url);

        if ($contents === false) {
            throw new \RuntimeException("Unable to read file at {$path}");
        }

        return $contents;
    }

    public function readStream(string $path)
    {
        $url = $this->getUrl($path);
        $stream = @fopen($url, 'rb');

        if ($stream === false) {
            throw new \RuntimeException("Unable to open read stream for {$path}");
        }

        return $stream;
    }

    public function setVisibility(string $path, string $visibility): void
    {
        throw UnableToSetVisibility::atLocation($path, 'Cloudinary does not support visibility changes.');
    }

    public function visibility(string $path): FileAttributes
    {
        return new FileAttributes($path);
    }

    public function checksum(string $path, Config $config): string
    {
        $algo = $config->get('checksum_algo', 'sha256');
        return hash($algo, $this->read($path));
    }

    public function listContents(string $path, bool $deep): array|\Traversable
    {
        $resources = [];
        $response = null;

        do {
            $response = $this->cloudinary->adminApi()->assets([
                'type'        => 'upload',
                'prefix'      => $this->applyPrefixToPath($path),
                'max_results' => 500,
                'next_cursor' => isset($response) ? $response->offsetGet('next_cursor') : null,
            ]);
            $resources = array_merge($resources, $response->offsetGet('resources'));
        } while ($response->offsetExists('next_cursor'));

        return array_map(
            fn ($resource) => new FileAttributes(
                $resource['public_id'],
                $resource['bytes'],
                null,
                (new \DateTime($resource['created_at']))->getTimestamp()
            ),
            $resources
        );
    }

    public function prepareResource(string $path): array
    {
        $info = pathinfo($path);

        $dirname = str_replace('\\', '/', $info['dirname'] ?? '');
        $filename = $info['filename'] ?? '';
        $id = ($dirname !== '.' && $dirname !== '') ? "{$dirname}/{$filename}" : $filename;

        $mimeType = $this->mimeTypeDetector->detectMimeTypeFromPath($path);

        if ($mimeType && str_starts_with($mimeType, 'image/')) {
            $type = 'image';
        } elseif ($mimeType && str_starts_with($mimeType, 'video/')) {
            $type = 'video';
        } else {
            $type = 'raw';
        }

        if ($this->prefix !== '') {
            $normalizedId = ltrim($id, './\\/');
            $id = $this->prefix . ($normalizedId !== '' ? '/' . $normalizedId : '');
        }

        return [$id, $type];
    }

    private function applyPrefixToPath(string $path): string
    {
        if ($this->prefix === '') {
            return $path;
        }

        $trimmed = ltrim(str_replace('\\', '/', $path), '\/');

        return $this->prefix . ($trimmed !== '' ? '/' . $trimmed : '');
    }
}

