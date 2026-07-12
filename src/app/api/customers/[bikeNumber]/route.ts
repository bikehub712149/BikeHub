import { NextRequest, NextResponse } from "next/server";
import { getCustomerByBikeId, updateCustomer } from "@/lib/server/customer";
import { markBikeAsSold } from "@/lib/server/bike";
// Make sure to import your Cloudinary uploader!
import { uploadFile } from "@/lib/server/upload"; // Adjust path if necessary

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ bikeNumber: string }>;
  }
) {
  try {
    const { bikeNumber } = await context.params;
    console.log("Bike number:", bikeNumber);

    // 1. Parse FormData instead of JSON
    const formData = await req.formData();
    
    // 2. Extract the JSON payload we sent from the frontend
    const dataString = formData.get("data") as string;
    const { buyer, sellingPrice } = JSON.parse(dataString);

    let receiptUrl = null;
    const buyerDocsUrls: string[] = [];

    // 3. Process Receipt Upload (if the user attached one)
    const receiptFile = formData.get("receipt") as File | null;
    if (receiptFile) {
      const buffer = Buffer.from(await receiptFile.arrayBuffer());
      
      const uploadResult: any = await uploadFile(
        buffer,
        bikeNumber,
        "receipt", // matches your Cloudinary folder structure
        receiptFile.name.split(".")[0]
      );
      
      receiptUrl = uploadResult.secure_url;
    }

    // 4. Process Buyer Documents PDF (if the user attached docs)
    const buyerDocsFile = formData.get("buyerDocs") as File | null;
    if (buyerDocsFile) {
      const buffer = Buffer.from(await buyerDocsFile.arrayBuffer());
      
      const uploadResult: any = await uploadFile(
        buffer,
        bikeNumber,
        "buyer", // matches your Cloudinary folder structure
        buyerDocsFile.name.split(".")[0]
      );
      
      buyerDocsUrls.push(uploadResult.secure_url);
    }

    // Attach the Cloudinary URLs back to the buyer object
    buyer.documents = buyerDocsUrls;

    // 5. Database Updates
    const customer = await getCustomerByBikeId(bikeNumber);
    console.log("Customer found:", customer);

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
        receipt: receiptUrl, // Save the Cloudinary URL here!
      },
    });

    await markBikeAsSold(bikeNumber);

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Failed to process sale:", error);

    return NextResponse.json(
      { message: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}