import { NextResponse } from "next/server";
import { createBike, getAllBikes, getBikesPage } from "@/lib/server/bike";
import { createCustomer } from "@/lib/server/customer";
import { uploadFile } from "@/lib/server/upload";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { uppercaseDbText } from "@/lib/utils";
import { getPaginationParams } from "@/lib/server/pagination";

export async function GET(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const url = new URL(req.url);
    const hasPagination = url.searchParams.has("page") || url.searchParams.has("pageSize");

    if (!hasPagination) {
      return NextResponse.json(await getAllBikes());
    }

    const statusParam = url.searchParams.get("status")?.toLowerCase();
    const status = statusParam === "available" ? "Available" : statusParam === "sold" ? "Sold" : undefined;
    return NextResponse.json(
      await getBikesPage({ ...getPaginationParams(url.searchParams), status })
    );
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

    const contentType = req.headers.get("content-type") || "";
    let bike: any;
    let customer: any;
    let mainImageIndex: number;
    let imageUrls: string[] = [];
    let docUrls: string[] = [];

    if (contentType.includes("application/json")) {
      const payload = await req.json();
      ({ bike, customer, mainImageIndex, imageUrls, docUrls } = payload);
    } else {
      const formData = await req.formData();
      const dataString = formData.get("data") as string;
      ({ bike, customer, mainImageIndex, docUrls = [] } = JSON.parse(dataString));

      const imageFiles = formData.getAll("images") as File[];
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult: any = await uploadFile(
          buffer,
          bike.number,
          "images",
          file.name.split(".")[0]
        );
        imageUrls.push(uploadResult.secure_url);
      }

      const docFiles = formData.getAll("sellerDocs") as File[];
      for (const file of docFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResult: any = await uploadFile(
          buffer,
          bike.number,
          "seller",
          file.name.split(".")[0]
        );
        docUrls.push(uploadResult.secure_url);
      }
    }

    bike.number = uppercaseDbText(bike.number || "");
    bike.model = uppercaseDbText(bike.model || "");
    bike.engineNumber = uppercaseDbText(bike.engineNumber || "");
    bike.chassisNumber = uppercaseDbText(bike.chassisNumber || "");
    customer.bikeId = uppercaseDbText(customer.bikeId || "");
    customer.seller.name = uppercaseDbText(customer.seller.name || "");
    customer.seller.address = uppercaseDbText(customer.seller.address || "");
    customer.broker.name = uppercaseDbText(customer.broker?.name || "");

    // Preserve the selected main image, with a local fallback when no image was uploaded.
    const FALLBACK_IMAGE = "/fallback.bikehub.png"; // Define a fallback image path

    // Attach URLs to payload
    bike.image = imageUrls[mainImageIndex] ?? imageUrls[0] ?? FALLBACK_IMAGE;

    bike.images = imageUrls.length > 0 ? imageUrls : [FALLBACK_IMAGE];

    customer.seller.documents = docUrls;

    // A database failure after uploads can leave orphaned Cloudinary assets for later cleanup.
    const createdBike = await createBike(bike);
    const createdCustomer = await createCustomer(customer);

    return NextResponse.json(
      { bike: createdBike, customer: createdCustomer },
      { status: 201 }
    );
  } catch (err: any) {

    // Convert duplicate registration numbers into a useful conflict response.
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
