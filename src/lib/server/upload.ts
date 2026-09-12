import cloudinary from "@/lib/cloudinary";
import crypto from "crypto";

export async function uploadFile(
  file: Buffer,
  bikeNumber: string,
  folder: "images" | "seller" | "buyer" | "receipt",
  fileName: string
) {
  // Keep assets grouped by bike and use unique IDs to avoid collisions during retries.
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `bike-hub/${bikeNumber}/${folder}`,
          public_id: `${Date.now()}-${crypto.randomUUID()}`,
          overwrite: false,
          // PDFs are uploaded as raw assets while images use Cloudinary's image type.
          resource_type: "auto",
        },
        (err, result) => {
          if (err) return reject(err);

          resolve(result);
        }
      )
      .end(file);
  });
}
