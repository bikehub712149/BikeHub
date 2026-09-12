import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Delete a Cloudinary asset from its URL.
 */
export async function deleteCloudinaryByUrl(url?: string) {
  // Ignore empty/local URLs; only Cloudinary upload URLs contain a removable public ID.
  if (!url || !url.includes("/upload/")) {
    return null;
  }

  const uploadPart = url.split("/upload/")[1];

  if (!uploadPart) {
    return null;
  }

  const publicId = decodeURIComponent(
    uploadPart
      .replace(/^v\d+\//, "")
      .replace(/\.[^.]+$/, "")
  );

  // The same URL can represent an image, PDF (raw), or video, so try each resource type.
  let result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  // Try raw (PDF)
  if (result.result === "not found") {
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  }

  // Try video
  if (result.result === "not found") {
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
      invalidate: true,
    });
  }

  return result;
}

/**
 * Delete an empty folder.
 */
export async function deleteCloudinaryFolder(folder: string) {
  try {
    return await cloudinary.api.delete_folder(folder);
  } catch {
    // Ignore if folder isn't empty or doesn't exist.
    return null;
  }
}

export default cloudinary;