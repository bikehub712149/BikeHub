"use client";

import { useEffect, useRef, useState } from "react";
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
import { warmUploadImages } from "@/lib/prepare-upload-image";
import {
  clearDialogDraft,
  loadDialogDraft,
  saveDialogDraft,
} from "@/lib/draft-store";

type Props = {
  bikeNumber: string;
  type: "seller" | "buyer";
};

type UploadDocsDraft = {
  open: boolean;
  docs: File[];
};

export default function UploadDocumentsDialog({ bikeNumber, type }: Props) {
  const draftKey = `upload-docs-${bikeNumber}-${type}`;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(0);
  const draftRestoredRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    loadDialogDraft<UploadDocsDraft>(draftKey).then((draft) => {
      if (!active) return;
      draftRestoredRef.current = true;
      if (draft?.open) {
        const restoredDocs = Array.isArray(draft.docs) ? draft.docs : [];
        setDocs(restoredDocs);
        setOpen(true);
        warmUploadImages(restoredDocs);
      }
    });
    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;
    if (open) {
      saveDialogDraft<UploadDocsDraft>(draftKey, {
        open: true,
        docs,
      });
    }
  }, [draftKey, open, docs]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      clearDialogDraft(draftKey);
    }
  };

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
      await clearDialogDraft(draftKey);
      setOpen(false);

      // Refresh the page to reflect the updated documents
      router.refresh();
    } catch {
      toast.error("Failed to upload documents.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="max-sm:h-8 max-sm:!px-2.5 max-sm:text-xs">
            <Plus className="mr-2 max-sm:mr-1 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Add Documents
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] max-sm:w-[95vw] overflow-y-auto p-7 max-sm:p-4 sm:max-w-lg max-sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="max-sm:text-base">
            Upload More {type === "seller" ? "Seller" : "Buyer"} Documents
          </DialogTitle>

          <DialogDescription className="max-sm:text-xs">
            Upload document images only. They will automatically be combined into a PDF and merged with the existing document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-sm:space-y-4">
          <div className="space-y-2 max-sm:space-y-1.5">
            <label htmlFor={`documents-${type}`} className="text-sm max-sm:text-xs font-medium">
              Choose Files {docs.length > 0 ? `(${docs.length} selected)` : ""}
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
            <div className="space-y-2 max-sm:space-y-1.5">
              <label className="text-sm max-sm:text-xs font-medium">Selected Files</label>
              <div className="rounded-xl border bg-slate-50 p-4 max-sm:p-2.5 space-y-2 max-h-44 overflow-y-auto">
                {docs.map((file) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 max-sm:px-2.5 max-sm:py-1.5"
                  >
                    <span className="truncate text-sm max-sm:text-xs">{file.name}</span>

                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      className="max-sm:size-7 max-sm:!p-0"
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
            className="w-full max-sm:h-10 max-sm:text-xs"
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
