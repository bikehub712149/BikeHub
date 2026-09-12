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

export async function downloadPdf(url: string) {
  // The existing Cloudinary PDF is downloaded before new pages are appended to it.
  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();

  return Buffer.from(arrayBuffer);
}