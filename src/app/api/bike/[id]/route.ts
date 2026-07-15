import { NextRequest, NextResponse } from "next/server";
import { deleteBike, getBikeById, updateBike } from "@/lib/server/bike";
import { deleteCustomerByBikeId } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { id } = await params;

    // Find the bike first
    const bike = await getBikeById(id);

    if (!bike) {
      return NextResponse.json({ message: "Bike not found" }, { status: 404 });
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

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { id } = await params;

    const body = await req.json();

    const bike = await updateBike(id, {
      number: body.number,
      model: body.model,
      year: Number(body.year),
      kms: body.kms,
      engineNumber: body.engineNumber,
      chassisNumber: body.chassisNumber,
      ownerSerial: body.ownerSerial,
      expectedSellingPrice: Number(body.expectedSellingPrice),
    });

    return NextResponse.json(bike);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
