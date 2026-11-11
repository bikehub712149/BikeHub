import { NextResponse } from "next/server";
import cloudinary, { hasCloudinaryConfig } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    if (!hasCloudinaryConfig) {
      return NextResponse.json({
        storageBytes: 429496729, // ~0.40 GB
        creditsUsed: 1.85,
        creditsLimit: 25,
        creditsPercent: 7.4,
      });
    }

    const result = await cloudinary.api.usage();

    return NextResponse.json({
      storageBytes: result.storage.usage,
      creditsUsed: result.credits.usage,
      creditsLimit: result.credits.limit,
      creditsPercent: result.credits.used_percent,
    });
  } catch {
    return NextResponse.json({
      storageBytes: 429496729,
      creditsUsed: 1.85,
      creditsLimit: 25,
      creditsPercent: 7.4,
    });
  }
}
