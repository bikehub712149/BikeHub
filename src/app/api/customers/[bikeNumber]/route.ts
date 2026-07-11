import { NextRequest, NextResponse } from "next/server";

import { getCustomerByBikeId, updateCustomer } from "@/lib/server/customer";
import { markBikeAsSold } from "@/lib/server/bike";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bikeNumber: string } }
) {
  try {
    const { bikeNumber } = params;

    const { buyer, sellingPrice, receipt } = await req.json();

    const customer = await getCustomerByBikeId(bikeNumber);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = await updateCustomer(customer.id, {
      $set: {
        buyer,
        sellingPrice,
        receipt,
      },
    });

    await markBikeAsSold(bikeNumber);

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 }
    );
  }
}