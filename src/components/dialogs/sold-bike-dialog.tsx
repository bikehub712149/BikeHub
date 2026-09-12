"use client";

import { useEffect, useState } from "react";
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
import { prepareUploadImage } from "@/lib/prepare-upload-image";

export default function SoldBikeDialog() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [buyerDocs, setBuyerDocs] = useState<File[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const router = useRouter();

  // Control the open state of the dialog
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBikes, setIsLoadingBikes] = useState(false); // Added loading state
  const [isLoadingImage, setIsLoadingImage] = useState(true); // Added image loading state

  // Use a key to force file inputs to reset on success
  const [fileKey, setFileKey] = useState(Date.now());

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
    setFileKey(Date.now()); // Resets the file inputs
  };

  // Triggered every time the modal is opened
  async function fetchBikes() {
    try {
      setIsLoadingBikes(true); // Start loading
      const res = await fetch("/api/bike");
      if (!res.ok) {
        throw new Error("Failed to fetch bikes");
      }
      const data: Bike[] = await res.json();
      setBikes(data.filter((bike) => bike.status === "Available"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bikes");
    } finally {
      setIsLoadingBikes(false); // Stop loading regardless of success/fail
    }
  }

  // Handle dialog open/close properly to fix the dropdown issue
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchBikes(); // Fetch fresh data when opening
    } else {
      resetForm(); // Clean up when closing
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

      // ---------------------------------------------------------
      if (buyerDocs.length > 0) {
        const combinedPdfFile = await createImagePdf(
          buyerDocs,
          `${selectedBike.number}-buyer-docs.pdf`
        );

        formData.append("buyerDocs", combinedPdfFile);
      }

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
          <Button variant="secondary" className="h-12 rounded-xl px-6">
            <BadgeCheck className="mr-2 h-4 w-4" />
            Sold Bike
          </Button>
        }
      />

      <DialogContent className="!max-w-[80vw] max-h-[90vh] overflow-hidden rounded-3xl p-7 gap-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-3xl font-bold leading-5">
            Complete Bike Sale
          </DialogTitle>
          <p className="text-slate-500 text-xs mt-1">
            Select a bike and enter buyer information.
          </p>
        </DialogHeader>

        <div className="grid h-[75vh] grid-cols-12 py-5">
          {/* LEFT: Added overflow-y-auto and pb-10 so the 3 rows don't get cut off */}
          <div className="col-span-5 border-r px-8 overflow-y-auto pb-10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bike Information
              </h3>

              {/* Dropdown Loading Indicator */}
              {isLoadingBikes && (
                <div className="flex items-center text-xs font-medium text-primary">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Loading bikes...
                </div>
              )}
            </div>

            {/* If BikeSelector supports a 'disabled' prop, you can add disabled={isLoadingBikes} here */}
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
                <div className="mt-8 relative h-60 w-full overflow-hidden rounded-2xl border bg-muted/20 flex items-center justify-center">
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

                <div className="mt-8 grid grid-cols-2 gap-5">
                  <Input
                    value={uppercaseDbText(selectedBike.number)}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                  <Input
                    value={uppercaseDbText(selectedBike.model)}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                  <Input
                    value={selectedBike.year.toString()}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                  <Input
                    value={selectedBike.kms}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                  <Input
                    value={`₹ ${selectedBike.expectedSellingPrice.toLocaleString()}`}
                    readOnly
                    className="bg-slate-50 text-slate-700 font-semibold"
                  />
                  <Input
                    value={selectedBike.status}
                    readOnly
                    className="bg-slate-50 text-slate-700"
                  />
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="col-span-7 overflow-y-auto px-10 py-2 pb-10 pr-6">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Buyer Information
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="buyerName"
                value={form.buyerName}
                placeholder="Buyer Name"
                onChange={handleChange}
              />
              <Input
                name="buyerPhone"
                value={form.buyerPhone}
                placeholder="Phone Number"
                onChange={handleChange}
              />
              <Input
                name="sellingPrice"
                value={form.sellingPrice}
                type="number"
                placeholder="Selling Price"
                onChange={handleChange}
              />
              <Input
                type="date"
                name="saleDate"
                value={form.saleDate}
                onChange={handleChange}
              />
              <div className="col-span-2">
                <Textarea
                  name="buyerAddress"
                  value={form.buyerAddress}
                  placeholder="Buyer Address"
                  onChange={handleChange}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium">Upload Receipt</p>
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
                <p className="mb-1 text-sm font-medium">Buyer Documents</p>
                <p className="mb-3 text-xs text-slate-500">
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
                  <div className="mt-4 space-y-2 rounded-xl border bg-slate-50 p-4">
                    {buyerDocs.map((file) => (
                      <div
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
                      >
                        <span className="truncate text-sm">{file.name}</span>

                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          onClick={() => {
                            setBuyerDocs((docs) =>
                              docs.filter((candidate) => candidate !== file)
                            );
                            setFileKey(Date.now()); // reset file input
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

            <div className="mt-10 flex justify-end">
              <Button
                className="min-w-[150px] h-11"
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
