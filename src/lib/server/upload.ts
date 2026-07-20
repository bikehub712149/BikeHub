import cloudinary from "@/lib/cloudinary";

export async function uploadFile(
  file: Buffer,
  bikeNumber: string,
  folder: "images" | "seller" | "buyer" | "receipt",
  fileName: string
) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `bike-hub/${bikeNumber}/${folder}`,
          public_id: fileName,
          overwrite: false,
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