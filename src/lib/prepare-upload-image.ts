import imageCompression from "browser-image-compression";

export const MAX_UPLOAD_IMAGE_SIZE = 1 * 1024 * 1024;
const COMPRESSION_TARGET_MB = 0.8;

// Cache in-flight and completed compressions so background warming makes submit instant.
const preparedCache = new WeakMap<File, Promise<File>>();

export async function prepareUploadImage(file: File): Promise<File> {
  // Compress only oversized images in the browser so normal uploads keep their original quality.
  if (file.size <= MAX_UPLOAD_IMAGE_SIZE) return file;

  const existing = preparedCache.get(file);
  if (existing) return existing;

  const task = (async () => {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: COMPRESSION_TARGET_MB,
        maxWidthOrHeight: 1920,
        initialQuality: 0.82,
        maxIteration: 4,
        useWebWorker: true,
        alwaysKeepResolution: false,
      });

      const preparedFile = new File([compressed], file.name, {
        type: compressed.type || file.type,
        lastModified: file.lastModified,
      });

      // Compression is best-effort; enforce the hard upload limit after it completes.
      if (preparedFile.size > MAX_UPLOAD_IMAGE_SIZE) {
        throw new Error(
          `${file.name} is too large. Please choose an image under 1 MB.`
        );
      }

      return preparedFile;
    } catch (err) {
      preparedCache.delete(file);
      throw err;
    }
  })();

  preparedCache.set(file, task);
  return task;
}

/**
 * Warm up compression in the background as soon as a user captures or selects files
 * so the UI stays snappy and final form submission does not have to wait.
 */
export function warmUploadImages(files: File[]) {
  for (const file of files) {
    if (file.type.startsWith("image/") && file.size > MAX_UPLOAD_IMAGE_SIZE) {
      void prepareUploadImage(file).catch(() => {});
    }
  }
}
