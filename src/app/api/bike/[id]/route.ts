import { NextResponse } from "next/server";
import { deleteBike, getBikeById } from "@/lib/server/bike";
import { deleteCustomerByBikeId } from "@/lib/server/customer";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the bike first
    const bike = await getBikeById(id);

    if (!bike) {
      return NextResponse.json(
        { message: "Bike not found" },
        { status: 404 }
      );
    }

    // Delete customer history using registration number
    await deleteCustomerByBikeId(bike.number);

    // Delete bike
    await deleteBike(id);

    return NextResponse.json({
      message: "Bike deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Failed to delete bike" },
      { status: 500 }
    );
  }
}