import { NextResponse } from "next/server";

import { createBike, getAllBikes } from "@/lib/server/bike";
import { createCustomer } from "@/lib/server/customer";

export async function GET() {
  try {
    const bikes = await getAllBikes();

    return NextResponse.json(bikes);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch bikes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { bike, customer } = await req.json();

    const createdBike = await createBike(bike);

    const createdCustomer = await createCustomer(customer);

    return NextResponse.json(
      {
        bike: createdBike,
        customer: createdCustomer,
      },
      {
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "Failed to create bike",
      },
      {
        status: 500,
      }
    );
  }
}