import { NextRequest, NextResponse } from "next/server";
import { getAllBikes } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");

    let bikes = await getAllBikes();

    if (status) {
      bikes = bikes.filter((bike) => bike.status === status);
    }

    return NextResponse.json(bikes);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
