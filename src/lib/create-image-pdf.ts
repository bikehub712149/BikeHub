import jsPDF from "jspdf";
import { prepareUploadImage } from "./prepare-upload-image";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function createImagePdf(files: File[], name: string) {
  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not a supported image file.`);
    }

    if (index > 0) pdf.addPage();

    const preparedFile = await prepareUploadImage(file);
    const dataUrl = await readFileAsDataUrl(preparedFile);
    const properties = pdf.getImageProperties(dataUrl);
    const scale = Math.min(
      maxWidth / properties.width,
      maxHeight / properties.height
    );
    const width = properties.width * scale;
    const height = properties.height * scale;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;
    const format = preparedFile.type.includes("png") ? "PNG" : "JPEG";

    pdf.addImage(dataUrl, format, x, y, width, height, undefined, "SLOW");
  }

  return new File([pdf.output("blob")], name, { type: "application/pdf" });
}
