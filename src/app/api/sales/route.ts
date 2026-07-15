import { NextResponse } from "next/server";

import { getAllBikes } from "@/lib/server/bike";
import { getCustomers } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const bikes = await getAllBikes();
    const customers = await getCustomers();

    const sales = bikes
      .filter((bike) => bike.status === "Sold")
      .map((bike) => {
        const customer = customers.find((c: any) => c.bikeId === bike.number);

        return {
          ...bike,
          buyer: customer?.buyer,
          sellingPrice: customer?.sellingPrice,
          purchasePrice: customer?.purchasePrice,
          receipt: customer?.receipt,
        };
      });

    return NextResponse.json(sales);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}
