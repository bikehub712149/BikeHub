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
      update["seller.phone"] = String(body.seller.phone || "").trim();
      update["seller.address"] = uppercaseDbText(body.seller.address || "");
    }

    if (body.buyer) {
      update["buyer.name"] = uppercaseDbText(body.buyer.name || "");
      update["buyer.phone"] = String(body.buyer.phone || "").trim();
      update["buyer.address"] = uppercaseDbText(body.buyer.address || "");
    }

    if (body.broker) {
      update["broker.name"] = uppercaseDbText(body.broker.name || "");
      update["broker.phone"] = String(body.broker.phone || "").trim();
    }

    if (body.purchasePrice !== undefined) {
      const parsedPurchase = Number(body.purchasePrice);
      if (!Number.isFinite(parsedPurchase) || parsedPurchase < 0) {
        return NextResponse.json(
          { message: "Invalid purchase price" },
          { status: 400 }
        );
      }
      update.purchasePrice = parsedPurchase;
    }

    if (body.sellingPrice !== undefined) {
      if (body.sellingPrice === null || body.sellingPrice === "") {
        update.sellingPrice = null;
      } else {
        const parsedSelling = Number(body.sellingPrice);
        if (!Number.isFinite(parsedSelling) || parsedSelling < 0) {
          return NextResponse.json(
            { message: "Invalid selling price" },
            { status: 400 }
          );
        }
        update.sellingPrice = parsedSelling;
      }
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
