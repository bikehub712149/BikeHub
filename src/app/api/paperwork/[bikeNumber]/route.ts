import { NextRequest, NextResponse } from "next/server";
import { updateBikePaperwork } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ bikeNumber: string }>;
  }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { bikeNumber } = await context.params;

    await updateBikePaperwork(bikeNumber, "Completed");

    return NextResponse.json({
      message: "Paperwork completed",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update paperwork" },
      { status: 500 }
    );
  }
}
