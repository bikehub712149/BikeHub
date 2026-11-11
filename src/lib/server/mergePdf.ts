import { PDFDocument } from "pdf-lib";

export async function mergePdfBuffers(
  buffers: Buffer[]
) {
  // PDFs must be parsed and copied page-by-page; raw byte concatenation is not a valid merge.
  const merged = await PDFDocument.create();

  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer);

    const pages = await merged.copyPages(
      pdf,
      pdf.getPageIndices()
    );

    pages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save();

  return Buffer.from(bytes);
}

const ALLOWED_PDF_HOSTS = new Set(["res.cloudinary.com"]);

export async function downloadPdf(url: string) {
  if (url.startsWith("data:application/pdf;base64,")) {
    const base64 = url.slice("data:application/pdf;base64,".length);
    return Buffer.from(base64, "base64");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid document URL");
  }

  if (parsed.protocol !== "https:" || !ALLOWED_PDF_HOSTS.has(parsed.hostname)) {
    throw new Error("Untrusted document URL host");
  }

  // The existing Cloudinary PDF is downloaded before new pages are appended to it.
  const res = await fetch(parsed.toString());
  if (!res.ok) {
    throw new Error("Failed to download existing PDF document");
  }

  const arrayBuffer = await res.arrayBuffer();

  return Buffer.from(arrayBuffer);
}