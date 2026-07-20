import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Delete a Cloudinary asset from its URL.
 */
export async function deleteCloudinaryByUrl(url: string) {
  const publicId = decodeURIComponent(
    url
      .split("/upload/")[1]
      .replace(/^v\d+\//, "")
      .replace(/\.[^.]+$/, "")
  );

  // Try image
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
  } catch (err: any) {
    // Ignore if folder isn't empty or doesn't exist
    console.log(`Folder "${folder}" not deleted: ${err.message}`);
    return null;
  }
}

export default cloudinary;