import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
  getCustomerByBikeId,
} from "@/lib/server/customer";
import { updateCustomer } from "@/lib/server/customer";
import { getAllBikes, markBikeAsSold } from "@/lib/server/bike";

export async function GET() {
  try {
    const customers = await getCustomers();
    const bikes = await getAllBikes();

    const data = customers.map((customer: any) => {
      const bike = bikes.find(
        (b: any) => b.number === customer.bikeId
      );

      return {
        ...customer,
        bike,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

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
