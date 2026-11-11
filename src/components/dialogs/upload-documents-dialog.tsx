"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
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
import FilePicker from "@/components/ui/file-picker";
import { createImagePdf } from "@/lib/create-image-pdf";

type Props = {
  bikeNumber: string;
  type: "seller" | "buyer";
};

export default function UploadDocumentsDialog({ bikeNumber, type }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(0);
  const router = useRouter();
  async function uploadDocuments() {
    try {
      setLoading(true);

      const imageFiles = docs;
      const imagePdf = await createImagePdf(
        imageFiles,
        `${type}-images.pdf`
      );

      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bikeNumber, type }),
      });
      const signatureData = await signatureResponse.json();
      if (!signatureResponse.ok) {
        throw new Error(signatureData.message || "Failed to prepare upload");
      }

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", imagePdf);
      cloudinaryData.append("api_key", signatureData.apiKey);
      cloudinaryData.append("timestamp", String(signatureData.timestamp));
      cloudinaryData.append("folder", signatureData.folder);
      cloudinaryData.append("public_id", signatureData.publicId);
      cloudinaryData.append("signature", signatureData.signature);

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/raw/upload`,
        { method: "POST", body: cloudinaryData }
      );
      const cloudinaryResult = await cloudinaryResponse.json();
      if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryResult.error?.message || "Failed to upload PDF");
      }

      const res = await fetch(
        `/api/customers/documents/${encodeURIComponent(bikeNumber)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, documentUrl: cloudinaryResult.secure_url }),
        }
      );

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Failed to update documents");
      }

      toast.success("Documents updated.");

      setDocs([]);
      setFileKey((key) => key + 1);
      setOpen(false);

      // Refresh the page to reflect the updated documents
      router.refresh();
    } catch (err) {

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

      <DialogContent className="max-h-[90vh] overflow-y-auto p-7 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Upload More {type === "seller" ? "Seller" : "Buyer"} Documents
          </DialogTitle>

          <DialogDescription>
  Upload document images only. They will automatically be combined into a PDF and merged with the existing document.
</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor={`documents-${type}`} className="text-sm font-medium">
              Choose Files {docs.length > 0 ? `${docs.length} FILES` : ""}
            </label>
            <FilePicker
              id={`documents-${type}`}
              resetKey={fileKey}
              multiple
              accept="image/*"
              label="Choose documents"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);

                setDocs((prev) => {
                  const all = [...prev, ...files];

                  return all.filter(
                    (file, index, self) =>
                      index ===
                      self.findIndex(
                        (f) =>
                          f.name === file.name &&
                          f.size === file.size &&
                          f.lastModified === file.lastModified
                      )
                  );
                });
                setFileKey((key) => key + 1);
              }}
            />
          </div>

          {docs.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Files</label>
              <div className="rounded-xl border bg-slate-50 p-4 space-y-2 max-h-44 overflow-y-auto">
                {docs.map((file) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
                  >
                    <span className="truncate text-sm">{file.name}</span>

                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        setDocs((docs) => docs.filter((candidate) => candidate !== file))
                      }
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
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
