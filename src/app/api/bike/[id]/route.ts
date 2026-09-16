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

    // Customer history is keyed by registration number, while the bike record uses its id.
    await deleteCustomerByBikeId(bike.number);

    // Delete bike
    const deletedBike = await deleteBike(id);
    if (!deletedBike) {
      return NextResponse.json({ message: "Bike not found" }, { status: 404 });
    }

    // Asset cleanup is best effort and must not prevent database records from being removed.
    const imageUrls = new Set([bike.image, ...(bike.images ?? [])]);
    await Promise.allSettled([
      ...[...imageUrls].map((image) => deleteCloudinaryByUrl(image)),
      ...(customer?.seller?.documents ?? []).map((doc: string) => deleteCloudinaryByUrl(doc)),
      ...(customer?.buyer?.documents ?? []).map((doc: string) => deleteCloudinaryByUrl(doc)),
      deleteCloudinaryByUrl(customer?.receipt),
    ]);

    await deleteCloudinaryFolder(`bike-hub/${bike.number}/images`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/seller`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/buyer`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}/receipt`);
    await deleteCloudinaryFolder(`bike-hub/${bike.number}`);

    return NextResponse.json({
      message: "Bike deleted successfully",
    });
  } catch {

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

    // Registration is intentionally not editable in the technical dialog.
    // Do not include the absent field in the update or MongoDB can clear it.
    const bike = await updateBike(id, {
      model: body.model,
      year: body.year,
      kms: body.kms,
      engineNumber: body.engineNumber,
      chassisNumber: body.chassisNumber,
      ownerSerial: body.ownerSerial,
      expectedSellingPrice: Number(body.expectedSellingPrice),
    });

    if (!bike) {
      return NextResponse.json({ message: "Bike not found" }, { status: 404 });
    }

    return NextResponse.json(bike);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
