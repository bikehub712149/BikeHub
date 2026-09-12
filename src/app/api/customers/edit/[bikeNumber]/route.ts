import { NextRequest, NextResponse } from "next/server";
import { updateCustomer } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { uppercaseDbText } from "@/lib/utils";

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

    const normalizedBikeNumber = uppercaseDbText(bikeNumber);
    const update: Record<string, any> = {};

    if (body.seller) {
      update["seller.name"] = uppercaseDbText(body.seller.name || "");
      update["seller.phone"] = body.seller.phone;
      update["seller.address"] = uppercaseDbText(body.seller.address || "");
    }

    if (body.buyer) {
      update["buyer.name"] = uppercaseDbText(body.buyer.name || "");
      update["buyer.phone"] = body.buyer.phone;
      update["buyer.address"] = uppercaseDbText(body.buyer.address || "");
    }

    if (body.broker) {
      update["broker.name"] = uppercaseDbText(body.broker.name || "");
      update["broker.phone"] = body.broker.phone;
    }

    if (body.purchasePrice !== undefined) {
      update.purchasePrice = body.purchasePrice;
    }

    if (body.sellingPrice !== undefined) {
      update.sellingPrice = body.sellingPrice;
    }

    if (body.saleDate !== undefined) {
      update.saleDate = body.saleDate;
    }

    if (body.receipt !== undefined) {
      update.receipt = body.receipt;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    const customer = await updateCustomer(normalizedBikeNumber, {
      $set: update,
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
