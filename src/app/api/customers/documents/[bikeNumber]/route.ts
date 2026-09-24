import { NextRequest, NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/server/admin-auth";
import { getCustomerByBikeId, updateCustomer } from "@/lib/server/customer";
import { uppercaseDbText } from "@/lib/utils";

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
    const normalizedBikeNumber = uppercaseDbText(bikeNumber);

    const customer = await getCustomerByBikeId(normalizedBikeNumber);

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let type: "seller" | "buyer";
    let documentUrl: string | undefined;
    let files: File[] = [];

    if (contentType.includes("application/json")) {
      const body = await req.json();
      type = body.type;
      documentUrl = body.documentUrl;
    } else {
      const formData = await req.formData();
      type = formData.get("type") as "seller" | "buyer";
      files = formData.getAll("document") as File[];
    }

    if ((type !== "seller" && type !== "buyer") || (!documentUrl && files.length === 0)) {
      return NextResponse.json({ message: "Document missing" }, { status: 400 });
    }

    const existingUrl =
      type === "seller"
        ? customer.seller?.documents?.[0]
        : customer.buyer?.documents?.[0];

      // Each side stores one merged PDF URL; append new pages before replacing the old asset.

    const buffers: Buffer[] = documentUrl
      ? [await downloadPdf(documentUrl)]
      : await Promise.all(
          files.map(async (file) => Buffer.from(await file.arrayBuffer()))
        );

    let finalBuffer: Buffer;

    if (existingUrl) {
      const oldPdf = await downloadPdf(existingUrl);

      finalBuffer = await mergePdfBuffers([oldPdf, ...buffers]);
    } else {
      finalBuffer = await mergePdfBuffers(buffers);
    }

    const upload: any = existingUrl
      ? await uploadFile(finalBuffer, normalizedBikeNumber, type, `${type}-merged`)
      : { secure_url: documentUrl };

    if (!upload.secure_url) {
      throw new Error("Document upload URL missing");
    }

    // Remove the temporary direct upload after it has been merged into the stored PDF.
    if (documentUrl && existingUrl) {
      await deleteCloudinaryByUrl(documentUrl);
    }

    // Delete the previous PDF only after the replacement upload succeeds.
    if (existingUrl) {
      await deleteCloudinaryByUrl(existingUrl);
    }

    await updateCustomer(normalizedBikeNumber, {
      $set: {
        [`${type}.documents`]: [upload.secure_url],
      },
    });

    return NextResponse.json({
      success: true,
      url: upload.secure_url,
    });
  } catch (err: any) {

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
