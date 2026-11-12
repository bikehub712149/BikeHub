"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, BadgeCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BikeSelector from "@/components/bike-selector";
import { Bike } from "@/types/bike";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateSoldBike } from "@/types/zod";
import { capitalizeInputText, uppercaseDbText } from "@/lib/utils";
import FilePicker from "@/components/ui/file-picker";
import { createImagePdf } from "@/lib/create-image-pdf";
import { prepareUploadImage, warmUploadImages } from "@/lib/prepare-upload-image";
import {
  clearDialogDraft,
  loadDialogDraft,
  saveDialogDraft,
} from "@/lib/draft-store";

const SOLD_BIKE_DRAFT_KEY = "sold-bike-dialog";

type SoldBikeDraft = {
  open: boolean;
  form: {
    buyerName: string;
    buyerPhone: string;
    buyerAddress: string;
    sellingPrice: string;
    saleDate: string;
  };
  selectedBike: Bike | null;
  receipt: File | null;
  buyerDocs: File[];
};

export default function SoldBikeDialog() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [buyerDocs, setBuyerDocs] = useState<File[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const draftRestoredRef = useRef(false);
  const router = useRouter();

  // Control the open state of the dialog
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBikes, setIsLoadingBikes] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  // Use a key to force file inputs to reset on success
  const [fileKey, setFileKey] = useState(() => Date.now());

  const initialForm = {
    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",
    sellingPrice: "",
    saleDate: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState(initialForm);

  const resetForm = () => {
    setForm(initialForm);
    setSelectedBike(null);
    setReceipt(null);
    setBuyerDocs([]);
    setFileKey(Date.now());
  };

  // Triggered every time the modal is opened
  async function fetchBikes() {
    try {
      // Refresh on every open so bikes sold elsewhere are not left in a stale selector.
      setIsLoadingBikes(true);
      const res = await fetch("/api/bike");
      if (!res.ok) {
        throw new Error("Failed to fetch bikes");
      }
      const data: Bike[] = await res.json();
      setBikes(data.filter((bike) => bike.status === "Available"));
    } catch {
      toast.error("Failed to load bikes");
    } finally {
      setIsLoadingBikes(false);
    }
  }

  // Restore draft if the mobile browser tab was reloaded during a camera/file action
  useEffect(() => {
    let active = true;
    loadDialogDraft<SoldBikeDraft>(SOLD_BIKE_DRAFT_KEY).then((draft) => {
      if (!active) return;
      draftRestoredRef.current = true;
      if (draft?.open) {
        setForm(draft.form);
        setSelectedBike(draft.selectedBike ?? null);
        setReceipt(draft.receipt ?? null);
        const restoredDocs = Array.isArray(draft.buyerDocs) ? draft.buyerDocs : [];
        setBuyerDocs(restoredDocs);
        setOpen(true);
        fetchBikes();
        warmUploadImages([
          ...(draft.receipt ? [draft.receipt] : []),
          ...restoredDocs,
        ]);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Save draft while open so mobile OS memory eviction never loses user input or documents
  useEffect(() => {
    if (!draftRestoredRef.current) return;
    if (open) {
      saveDialogDraft<SoldBikeDraft>(SOLD_BIKE_DRAFT_KEY, {
        open: true,
        form,
        selectedBike,
        receipt,
        buyerDocs,
      });
    }
  }, [open, form, selectedBike, receipt, buyerDocs]);

  // Handle dialog open/close properly to fix the dropdown issue
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchBikes();
    } else {
      // Closing resets files and fields so the next sale starts from a clean form.
      resetForm();
      clearDialogDraft(SOLD_BIKE_DRAFT_KEY);
    }
  };

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    const formatField = (fieldName: string, rawValue: string) => {
      if (["buyerPhone", "sellingPrice", "saleDate"].includes(fieldName)) {
        return rawValue;
      }

      return capitalizeInputText(rawValue);
    };

    setForm({
      ...form,
      [name]: formatField(name, value),
    });
  }

  async function handleSubmit() {
    try {
      if (!selectedBike) {
        toast.error("Please select a bike.");
        return;
      }

      setIsSubmitting(true);

      const values = validateSoldBike(form);
      const normalizedBuyerName = uppercaseDbText(values.buyerName);
      const normalizedBuyerAddress = uppercaseDbText(values.buyerAddress);

      const payload = {
        buyer: {
          name: normalizedBuyerName,
          phone: values.buyerPhone,
          address: normalizedBuyerAddress,
          documents: [], // Backend will inject Cloudinary URL
        },
        saleDate: values.saleDate,
        sellingPrice: Number(values.sellingPrice),
        receipt: "", // Backend will inject Cloudinary URL
      };

      // 2. Initialize FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      if (receipt) {
        formData.append("receipt", await prepareUploadImage(receipt));
      }

      let buyerDocsUrl = "";
      if (buyerDocs.length > 0) {
        const combinedPdfFile = await createImagePdf(
          buyerDocs,
          `${selectedBike.number}-buyer-docs.pdf`
        );

        const signatureResponse = await fetch("/api/cloudinary/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bikeNumber: selectedBike.number, type: "buyer" }),
        });
        const signatureData = await signatureResponse.json();
        if (!signatureResponse.ok) {
          throw new Error(signatureData.message || "Failed to prepare PDF upload");
        }

        const cloudinaryData = new FormData();
        cloudinaryData.append("file", combinedPdfFile);
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

        buyerDocsUrl = cloudinaryResult.secure_url;
      }

      formData.append("buyerDocsUrl", buyerDocsUrl);

      // ---------------------------------------------------------
      // 5. SEND TO API
      // ---------------------------------------------------------
      const res = await fetch(
        `/api/customers/${encodeURIComponent(selectedBike.number)}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to complete sale");
      }

      toast.success("Bike sold successfully.");

      await clearDialogDraft(SOLD_BIKE_DRAFT_KEY);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="lg" variant="secondary" className="h-11 rounded-xl px-5 max-sm:h-8 max-sm:!px-2.5 max-sm:!py-0 max-sm:text-xs max-sm:rounded-lg">
            <BadgeCheck className="mr-2 max-sm:mr-1 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Sold Bike
          </Button>
        }
      />

      <DialogContent className="!max-w-5xl max-sm:w-[95vw] max-h-[92vh] flex flex-col overflow-hidden rounded-3xl max-sm:rounded-2xl p-5 max-sm:p-0 gap-0">
        <DialogHeader className="shrink-0 border-b px-5 py-4 max-sm:px-4 max-sm:py-3.5">
          <DialogTitle className="text-3xl max-sm:text-base font-bold">
            Complete Bike Sale
          </DialogTitle>
          <p className="text-slate-500 text-xs max-sm:text-[11px] mt-1">
            Select a bike and enter buyer information.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 py-5 max-sm:py-3">
          {/* LEFT */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r px-8 max-sm:px-4 md:overflow-y-auto pb-10 max-sm:pb-4">
            <div className="mb-4 max-sm:mb-2.5 flex items-center justify-between">
              <h3 className="text-xs max-sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bike Information
              </h3>

              {/* Dropdown Loading Indicator */}
              {isLoadingBikes && (
                <div className="flex items-center text-xs max-sm:text-[11px] font-medium text-primary">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Loading bikes...
                </div>
              )}
            </div>

            <BikeSelector
              bikes={bikes}
              value={selectedBike ?? undefined}
              onChange={(bike) => {
                setSelectedBike(bike);
                setIsLoadingImage(true);
              }}
            />

            {selectedBike && (
              <>
                <div className="mt-8 max-sm:mt-4 relative h-60 max-sm:h-44 w-full overflow-hidden rounded-2xl border bg-muted/20 flex items-center justify-center">
                  {isLoadingImage && (
                    <div
                      className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
                      style={{
                        animation: "shimmer 2s infinite",
                      }}
                    />
                  )}
                  <img
                    src={selectedBike.image}
                    alt={selectedBike.model}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                    onLoad={() => setIsLoadingImage(false)}
                    onError={() => setIsLoadingImage(false)}
                  />
                </div>

                <div className="mt-8 max-sm:mt-4 grid grid-cols-2 max-sm:grid-cols-2 gap-5 max-sm:gap-2.5">
                  <Input
                    value={uppercaseDbText(selectedBike.number)}
                    readOnly
                    className="bg-slate-50 text-slate-700 max-sm:h-8 max-sm:text-xs"
                  />
                  <Input
                    value={uppercaseDbText(selectedBike.model)}
                    readOnly
                    className="bg-slate-50 text-slate-700 max-sm:h-8 max-sm:text-xs"
                  />
                  <Input
                    value={selectedBike.year.toString()}
                    readOnly
                    className="bg-slate-50 text-slate-700 max-sm:h-8 max-sm:text-xs"
                  />
                  <Input
                    value={selectedBike.kms}
                    readOnly
                    className="bg-slate-50 text-slate-700 max-sm:h-8 max-sm:text-xs"
                  />
                  <Input
                    value={`₹ ${selectedBike.expectedSellingPrice.toLocaleString()}`}
                    readOnly
                    className="bg-slate-50 text-slate-700 font-semibold max-sm:h-8 max-sm:text-xs"
                  />
                  <Input
                    value={selectedBike.status}
                    readOnly
                    className="bg-slate-50 text-slate-700 max-sm:h-8 max-sm:text-xs"
                  />
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7 md:overflow-y-auto px-10 max-sm:px-4 pt-2 max-sm:pt-4 pb-8 max-sm:pb-4 pr-6 max-sm:pr-4">
            <h3 className="mb-5 max-sm:mb-3 text-xs max-sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Buyer Information
            </h3>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5 max-sm:gap-3">
              <Input
                name="buyerName"
                value={form.buyerName}
                placeholder="Buyer Name"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="buyerPhone"
                value={form.buyerPhone}
                placeholder="Phone Number"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="sellingPrice"
                value={form.sellingPrice}
                type="number"
                placeholder="Selling Price"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                type="date"
                name="saleDate"
                value={form.saleDate}
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <div className="col-span-2 max-sm:col-span-1">
                <Textarea
                  name="buyerAddress"
                  value={form.buyerAddress}
                  placeholder="Buyer Address"
                  onChange={handleChange}
                  className="resize-none max-sm:text-xs"
                />
              </div>
            </div>

            <div className="mt-8 max-sm:mt-5 space-y-6 max-sm:space-y-4">
              <div>
                <p className="mb-2 max-sm:mb-1.5 text-sm max-sm:text-xs font-medium">
                  Upload Receipt
                </p>
                <FilePicker
                  id="sale-receipt"
                  accept="image/*"
                  label="Choose receipt"
                  resetKey={fileKey}
                  selectedFileName={receipt?.name}
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                />
              </div>

              <div>
                <p className="mb-1 text-sm max-sm:text-xs font-medium">
                  Buyer Documents
                </p>
                <p className="mb-3 max-sm:mb-2 text-xs max-sm:text-[11px] text-slate-500">
                  Upload document images only. They will be converted into a
                  single PDF automatically.
                </p>
                <FilePicker
                  id="buyer-documents"
                  multiple
                  accept="image/*"
                  label="Choose buyer documents"
                  resetKey={fileKey}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);

                    setBuyerDocs((prev) => {
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

                    setFileKey(Date.now());
                  }}
                />

                {buyerDocs.length > 0 && (
                  <div className="mt-4 max-sm:mt-3 space-y-2 rounded-xl border bg-slate-50 p-4 max-sm:p-2.5">
                    {buyerDocs.map((file) => (
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
                          onClick={() => {
                            setBuyerDocs((docs) =>
                              docs.filter((candidate) => candidate !== file)
                            );
                            setFileKey(Date.now());
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 max-sm:mt-6 flex justify-end">
              <Button
                className="min-w-[150px] h-11 max-sm:w-full max-sm:h-10 max-sm:text-xs"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Sale"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
