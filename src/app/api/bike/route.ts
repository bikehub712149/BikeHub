import { NextResponse } from "next/server";
import { createBike, getAllBikes } from "@/lib/server/bike";
import { createCustomer } from "@/lib/server/customer";
// Adjust this import path to exactly where your uploadFile function lives!
import { uploadFile } from "@/lib/server/upload";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET() {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

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
    const authError = await verifyAdmin();
    if (authError) return authError;

    const formData = await req.formData();

    // Extract the JSON payload
    const dataString = formData.get("data") as string;
    const { bike, customer, mainImageIndex } = JSON.parse(dataString);

    const bikeNumber = bike.number;
    const imageUrls: string[] = [];
    const docUrls: string[] = [];

    // Process Bike Images
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // We cast to 'any' here so TypeScript knows .secure_url exists
      const uploadResult: any = await uploadFile(
        buffer,
        bikeNumber,
        "images", // matches your strict type
        file.name.split(".")[0]
      );

      imageUrls.push(uploadResult.secure_url);
    }

    // Process Seller Documents
    const docFiles = formData.getAll("sellerDocs") as File[];
    for (const file of docFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await uploadFile(
        buffer,
        bikeNumber,
        "seller", // Changed from "documents" to match your strict type!
        file.name.split(".")[0]
      );

      docUrls.push(uploadResult.secure_url);
    }

    // Attach URLs to payload
    if (imageUrls.length > 0) {
      // Safely apply the index, falling back to 0 if anything goes wrong
      bike.image = imageUrls[mainImageIndex] || imageUrls[0];
    }
    bike.images = imageUrls;
    customer.seller.documents = docUrls;

    // Save to DB
    const createdBike = await createBike(bike);
    const createdCustomer = await createCustomer(customer);

    return NextResponse.json(
      { bike: createdBike, customer: createdCustomer },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Upload error:", err);

    // Catch MongoDB duplicate key error specifically
    if (err.code === 11000) {
      // Find out which key caused the duplicate (usually the bike number)
      const duplicateKey = Object.keys(err.keyPattern || {})[0];

      return NextResponse.json(
        { message: `A bike with this ${duplicateKey} already exists.` },
        { status: 409 } // 409 Conflict is the correct HTTP status for duplicates
      );
    }

    // Default error response for anything else
    return NextResponse.json(
      { message: err.message || "Failed to create bike" },
      { status: 500 }
    );
  }
}
