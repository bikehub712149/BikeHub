import { PDFDocument } from "pdf-lib";

export async function mergePdfBuffers(
  buffers: Buffer[]
) {
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
  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();

  return Buffer.from(arrayBuffer);
}