import imageCompression from "browser-image-compression";

export const MAX_UPLOAD_IMAGE_SIZE = 1 * 1024 * 1024;
const COMPRESSION_TARGET_MB = 0.9;

export async function prepareUploadImage(file: File) {
  // Compress only oversized images in the browser so normal uploads keep their original quality.
  if (file.size <= MAX_UPLOAD_IMAGE_SIZE) return file;

  const compressed = await imageCompression(file, {
    maxSizeMB: COMPRESSION_TARGET_MB,
    maxWidthOrHeight: 3000,
    initialQuality: 0.92,
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
}
