import { NextRequest, NextResponse } from "next/server";
import { deleteBike, getBikeById, updateBike } from "@/lib/server/bike";
import { deleteCustomerByBikeId } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";
import {
  deleteCloudinaryByUrl,
  deleteCloudinaryFolder,
} from "@/lib/cloudinary";
import { getCustomerByBikeId } from "@/lib/server/customer";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { id } = await params;

    // Resolve related records before cleanup because their URLs are needed for asset deletion.
    const bike = await getBikeById(id);

    if (!bike) {
      return NextResponse.json({ message: "Bike not found" }, { status: 404 });
    }

    const customer = await getCustomerByBikeId(bike.number);

    // Remove individual assets before deleting their now-empty Cloudinary folders.
    for (const image of bike.images ?? []) {
      await deleteCloudinaryByUrl(image);
    }

    // Delete seller docs
    for (const doc of customer?.seller?.documents ?? []) {
      await deleteCloudinaryByUrl(doc);
    }

    // Delete buyer docs
    for (const doc of customer?.buyer?.documents ?? []) {
      await deleteCloudinaryByUrl(doc);
    }

    // Delete receipt
    await deleteCloudinaryByUrl(customer?.receipt);

    // Customer history is keyed by registration number, while the bike record uses its id.
    await deleteCustomerByBikeId(bike.number);

    // Delete bike
    await deleteBike(id);

    await deleteCloudinaryFolder(`bike-hub/${bike.number}/images`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/seller`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/buyer`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/receipt`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}`);

    return NextResponse.json({
      message: "Bike deleted successfully",
    });
  } catch (err) {

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
      year: body.year,
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
