import { NextResponse } from "next/server";
import {
  getCustomers,
  getCustomersPage,
  createCustomer,
} from "@/lib/server/customer";
import { getBikesByNumbers } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { getPaginationParams } from "@/lib/server/pagination";

export async function GET(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const url = new URL(req.url);
    const paginated = url.searchParams.has("page") || url.searchParams.has("pageSize");
    const result = paginated
      ? await getCustomersPage(getPaginationParams(url.searchParams))
      : { items: await getCustomers(), pagination: undefined };
    const bikes = await getBikesByNumbers(
      result.items.map((customer: any) => customer.bikeId)
    );

    const data = result.items.map((customer: any) => {
      const bike = bikes.find((b: any) => b.number === customer.bikeId);

      return {
        ...customer,
        bike,
      };
    });

    return NextResponse.json(
      paginated ? { items: data, pagination: result.pagination } : data
    );
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
    const authError = await verifyAdmin();
    if (authError) return authError;

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
