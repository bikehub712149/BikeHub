import { NextRequest, NextResponse } from "next/server";
import { getCustomerByBikeId, updateCustomer } from "@/lib/server/customer";
import { markBikeAsSold } from "@/lib/server/bike";
import { uploadFile } from "@/lib/server/upload";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { uppercaseDbText } from "@/lib/utils";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ bikeNumber: string }>;
  }
) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { bikeNumber } = await context.params;

    const normalizedBikeNumber = uppercaseDbText(bikeNumber);

    const formData = await req.formData();

    const dataString = formData.get("data") as string;
    const { buyer, sellingPrice, saleDate } = JSON.parse(dataString);

    buyer.name = uppercaseDbText(buyer.name || "");
    buyer.address = uppercaseDbText(buyer.address || "");

    let receiptUrl = null;
    const buyerDocsUrls: string[] = [];

    // Upload optional receipt and buyer documents before saving their URLs to the transaction.
    const receiptFile = formData.get("receipt") as File | null;
    if (receiptFile) {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());

      const uploadResult: any = await uploadFile(
        buffer,
        normalizedBikeNumber,
        "receipt",
        receiptFile.name.split(".")[0]
      );

      receiptUrl = uploadResult.secure_url;
    }

    const buyerDocsFile = formData.get("buyerDocs") as File | null;
    const buyerDocsUrl = String(formData.get("buyerDocsUrl") || "");
    if (buyerDocsUrl) {
      buyerDocsUrls.push(buyerDocsUrl);
    } else if (buyerDocsFile) {
      const buffer = Buffer.from(await buyerDocsFile.arrayBuffer());

      const uploadResult: any = await uploadFile(
        buffer,
        normalizedBikeNumber,
        "buyer",
        buyerDocsFile.name.split(".")[0]
      );

      buyerDocsUrls.push(uploadResult.secure_url);
    }

    // Attach the Cloudinary URLs back to the buyer object
    buyer.documents = buyerDocsUrls;

    // Verify the transaction exists before uploading assets or changing sale state.
    const customer = await getCustomerByBikeId(normalizedBikeNumber);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = await updateCustomer(normalizedBikeNumber, {
      $set: {
        buyer,
        sellingPrice,
        receipt: receiptUrl,
        saleDate,
      },
    });

    const soldBike = await markBikeAsSold(normalizedBikeNumber);
    if (!soldBike) {
      return NextResponse.json(
        { message: "Bike not found or could not be marked as sold" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {

    return NextResponse.json(
      { message: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
