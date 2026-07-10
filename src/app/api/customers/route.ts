import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
  getCustomerByBikeId,
} from "@/lib/server/customer";
import { updateCustomer } from "@/lib/server/customer";
import { markBikeAsSold } from "@/lib/server/bike";

export async function GET() {
  try {
    const customers = await getCustomers();

    return NextResponse.json(customers);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer = await createCustomer(body);

    return NextResponse.json(customer, {
      status: 201,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { bikeId, buyer, sellingPrice, receipt } = await req.json();

    const customer = await getCustomerByBikeId(bikeId);

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

    await markBikeAsSold(bikeId);

    return NextResponse.json(updatedCustomer);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Failed to complete sale" },
      { status: 500 }
    );
  }
}
