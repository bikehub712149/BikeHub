import cloudinary, { hasCloudinaryConfig } from "@/lib/cloudinary";
import crypto from "crypto";
import { uppercaseDbText } from "@/lib/utils";

export async function uploadFile(
  file: Buffer,
  bikeNumber: string,
  folder: "images" | "seller" | "buyer" | "receipt",
  fileName: string
) {
  if (!hasCloudinaryConfig) {
    const isPdf =
      file.length >= 4 &&
      file.subarray(0, 4).toString("ascii") === "%PDF";
    const mime = isPdf ? "application/pdf" : "image/jpeg";
    return {
      secure_url: `data:${mime};base64,${file.toString("base64")}`,
    };
  }

  // Keep assets grouped by bike and use unique IDs to avoid collisions during retries.
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `bike-hub/${uppercaseDbText(bikeNumber)}/${folder}`,
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
