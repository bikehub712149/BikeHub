import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { uploadFile } from "@/lib/server/upload";

export async function POST(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file");
    const bikeNumber = String(formData.get("bikeNumber") || "");
    const folder = formData.get("folder");

    if (!(file instanceof File) || !bikeNumber || !["images", "seller"].includes(String(folder))) {
      return NextResponse.json({ message: "Invalid upload request" }, { status: 400 });
    }

    const result: any = await uploadFile(
      Buffer.from(await file.arrayBuffer()),
      bikeNumber,
      folder as "images" | "seller",
      file.name.split(".")[0]
    );

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}