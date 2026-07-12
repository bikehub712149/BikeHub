// app/api/settings/storage/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const result = await cloudinary.api.usage();
    
    return NextResponse.json({
      storageBytes: result.storage.usage,         // Your specific storage used in bytes
      creditsUsed: result.credits.usage,          // Total credits consumed this month
      creditsLimit: result.credits.limit,         // Your actual account limit (e.g. 25, 225, etc.)
      creditsPercent: result.credits.used_percent // Your overall percentage used
    });
  } catch (error) {
    console.error("Cloudinary usage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage usage" },
      { status: 500 }
    );
  }
}