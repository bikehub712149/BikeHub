import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteCloudinaryByUrl(url: string) {
  const publicId = decodeURIComponent(
    url
      .split("/upload/")[1]
      .replace(/^v\d+\//, "")
      .replace(/\.[^.]+$/, "")
  );

  let result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result === "not found") {
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  }

  return result;
}

export default cloudinary;