import { NextRequest, NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/server/admin-auth";
import { getCustomerByBikeId, updateCustomer } from "@/lib/server/customer";

import { uploadFile } from "@/lib/server/upload";
import { downloadPdf, mergePdfBuffers } from "@/lib/server/mergePdf";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";

export async function POST(
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

    const customer = await getCustomerByBikeId(bikeNumber);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const type = formData.get("type") as "seller" | "buyer";

    const files = formData.getAll("document") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Document missing" },
        { status: 400 }
      );
    }

    const existingUrl =
      type === "seller"
        ? customer.seller?.documents?.[0]
        : customer.buyer?.documents?.[0];

    const buffers: Buffer[] = [];

    for (const file of files) {
      buffers.push(Buffer.from(await file.arrayBuffer()));
    }

    let finalBuffer: Buffer;

    if (existingUrl) {
      const oldPdf = await downloadPdf(existingUrl);

      finalBuffer = await mergePdfBuffers([oldPdf, ...buffers]);
    } else {
      finalBuffer = await mergePdfBuffers(buffers);
    }

    const upload: any = await uploadFile(
      finalBuffer,
      bikeNumber,
      type,
      `${type}-merged`
    );

    if (existingUrl) {
      await deleteCloudinaryByUrl(existingUrl);
    }

    await updateCustomer(bikeNumber, {
      $set: {
        [`${type}.documents`]: [upload.secure_url],
      },
    });

    return NextResponse.json({
      success: true,
      url: upload.secure_url,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        message: err.message,
      },
      {
        status: 500,
      }
    );
  }
}
