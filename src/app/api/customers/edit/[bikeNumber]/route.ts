import { NextRequest, NextResponse } from "next/server";
import { updateCustomer } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ bikeNumber: string }>;
  }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { bikeNumber } = await params;
    const body = await req.json();

    const update =
      body.type === "seller"
        ? {
            "seller.name": body.name,
            "seller.phone": body.phone,
            "seller.address": body.address,
          }
        : {
            "buyer.name": body.name,
            "buyer.phone": body.phone,
            "buyer.address": body.address,
          };

    const customer = await updateCustomer(bikeNumber, {
      $set: update,
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
