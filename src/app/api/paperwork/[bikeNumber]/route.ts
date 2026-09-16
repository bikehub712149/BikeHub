import { NextRequest, NextResponse } from "next/server";
import { updateBikePaperwork } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { uppercaseDbText } from "@/lib/utils";

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

    const result = await updateBikePaperwork(uppercaseDbText(bikeNumber), "Completed");
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Bike not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Paperwork completed",
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to update paperwork" },
      { status: 500 }
    );
  }
}
