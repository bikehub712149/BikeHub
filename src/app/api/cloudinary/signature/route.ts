import crypto from "crypto";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/server/admin-auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { bikeNumber, type } = await req.json();

    if (
      typeof bikeNumber !== "string" ||
      !bikeNumber ||
      (type !== "seller" && type !== "buyer")
    ) {
      return NextResponse.json(
        { message: "Invalid document upload request" },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `bike-hub/${bikeNumber}/${type}`;
    const publicId = `pending-${crypto.randomUUID()}`;
    const paramsToSign = { folder, public_id: publicId, timestamp };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
      timestamp,
      signature,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to prepare upload" },
      { status: 500 }
    );
  }
}