"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import jsPDF from "jspdf";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  bikeNumber: string;
  type: "seller" | "buyer";
};

export default function UploadDocumentsDialog({ bikeNumber, type }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<File[]>([]);
  const router = useRouter();
  async function uploadDocuments() {
    try {
      setLoading(true);

      const imageFiles = docs.filter((f) => f.type.startsWith("image/"));

      const pdfFiles = docs.filter((f) => f.type === "application/pdf");

      const formData = new FormData();

      formData.append("type", type);

      // ----------------------------
      // Images -> One PDF
      // ----------------------------

      if (imageFiles.length > 0) {
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const processedImages = await Promise.all(
          imageFiles.map(async (file) => {
            const compressed = await imageCompression(file, {
              maxSizeMB: 0.2,
              maxWidthOrHeight: 1400,
              fileType: "image/jpeg",
              initialQuality: 0.7,
              useWebWorker: true,
            });

            return new Promise<string>((resolve) => {
              const reader = new FileReader();

              reader.readAsDataURL(compressed);

              reader.onloadend = () => resolve(reader.result as string);
            });
          })
        );

        processedImages.forEach((img, index) => {
          if (index > 0) {
            pdf.addPage();
          }

          const props = pdf.getImageProperties(img);

          const width = pdf.internal.pageSize.getWidth();

          const height = (props.height * width) / props.width;

          pdf.addImage(img, "JPEG", 0, 0, width, height, undefined, "SLOW");
        });

        const blob = pdf.output("blob");

        const imagePdf = new File([blob], `${type}-images.pdf`, {
          type: "application/pdf",
        });

        formData.append("document", imagePdf);
      }

      // ----------------------------
      // Additional PDFs
      // ----------------------------

      pdfFiles.forEach((file) => {
        formData.append("document", file);
      });

      const res = await fetch(`/api/customers/documents/${bikeNumber}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Documents updated.");

      setDocs([]);
      setOpen(false);

      // Refresh the page to reflect the updated documents
      router.refresh();
    } catch (err) {
      console.error(err);

      toast.error("Failed to upload documents.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Documents
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Upload More {type === "seller" ? "Seller" : "Buyer"} Documents
          </DialogTitle>

          <DialogDescription>
            Upload Images or PDFs. They will be merged with the existing PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Input
            multiple
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setDocs(Array.from(e.target.files ?? []))}
          />

          {docs.length > 0 && (
            <div className="rounded-xl border p-3 space-y-2 max-h-44 overflow-y-auto">
              {docs.map((file, i) => (
                <div key={i} className="text-sm truncate">
                  {file.name}
                </div>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            disabled={loading || docs.length === 0}
            onClick={uploadDocuments}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Documents"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
