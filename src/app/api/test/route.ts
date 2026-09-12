import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully.",
    });
  } catch (error) {
    console.error("Database health check failed", error);

    return NextResponse.json({
      success: false,
      message: "Database health check failed.",
    }, { status: 500 });
  }
}