import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const result = await cloudinary.api.usage();

    return NextResponse.json({
      storageBytes: result.storage.usage,
      creditsUsed: result.credits.usage,
      creditsLimit: result.credits.limit,
      creditsPercent: result.credits.used_percent,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}
