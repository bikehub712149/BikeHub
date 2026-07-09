import { NextResponse } from "next/server";
import {
  getCustomers,
  createCustomer,
} from "@/lib/server/coustomer";

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