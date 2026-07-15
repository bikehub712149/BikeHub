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
import imageCompression from "browser-image-compression";
import jsPDF from "jspdf";

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit() {
    try {
      if (!selectedBike) {
        toast.error("Please select a bike.");
        return;
      }

      setIsSubmitting(true);

      // 1. Create your structured payload
      const payload = {
        buyer: {
          name: form.buyerName,
          phone: form.buyerPhone,
          address: form.buyerAddress,
          documents: [], // Backend will inject Cloudinary URL
        },
        saleDate: form.saleDate,
        sellingPrice: Number(form.sellingPrice),
        receipt: "", // Backend will inject Cloudinary URL
      };

      // 2. Initialize FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      // ---------------------------------------------------------
      // 3. COMPRESS RECEIPT (Target ~1MB)
      // ---------------------------------------------------------
      if (receipt) {
        const compressedReceiptBlob = await imageCompression(receipt, {
          maxSizeMB: 1, 
          maxWidthOrHeight: 1920, // Full HD width
          useWebWorker: true,
          initialQuality: 0.85,
        });
        const compressedReceipt = new File([compressedReceiptBlob], receipt.name, { type: receipt.type });
        formData.append("receipt", compressedReceipt);
      }

      // ---------------------------------------------------------
      // 4. COMPRESS BUYER DOCS & BUNDLE TO PDF
      // ---------------------------------------------------------
      const docImages = buyerDocs.filter((f) => f.type.startsWith("image/"));
      const docPdfs = buyerDocs.filter((f) => f.type === "application/pdf");

      if (docImages.length > 0) {
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const processedDocs = await Promise.all(
          docImages.map(async (file) => {
            const compressedBlob = await imageCompression(file, {
              maxSizeMB: 1, // Target ~1MB per document page
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: "image/jpeg",
              initialQuality: 0.85,
            });

            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(compressedBlob);
              reader.onloadend = () => resolve(reader.result as string);
            });
          })
        );

        processedDocs.forEach((base64Str, i) => {
          if (i > 0) pdf.addPage();
          const imgProps = pdf.getImageProperties(base64Str);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(base64Str, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        });

        const pdfBlob = pdf.output("blob");
        const combinedPdfFile = new File(
          [pdfBlob],
          `${selectedBike.number}-buyer-docs.pdf`,
          { type: "application/pdf" }
        );

        formData.append("buyerDocs", combinedPdfFile);
      }

      // Append any files that were already PDFs
      docPdfs.forEach((pdf) => formData.append("buyerDocs", pdf));

      // ---------------------------------------------------------
      // 5. SEND TO API
      // ---------------------------------------------------------
      const res = await fetch(`/api/customers/${selectedBike.number}`, {
        method: "PATCH",
        body: formData, 
      });

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

      <DialogContent
        className="!max-w-[80vw] max-h-[90vh] overflow-hidden rounded-3xl p-5 gap-0"
      >
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
              }}
            />

            {selectedBike && (
              <>
                <img
                  src={selectedBike.image}
                  alt={selectedBike.model}
                  width={600}
                  height={400}
                  className="mt-8 h-60 w-full rounded-2xl border object-cover bg-muted/20"
                />

                <div className="mt-8 grid grid-cols-2 gap-5">
                  <Input value={selectedBike.number} readOnly className="bg-slate-50 text-slate-700" />
                  <Input value={selectedBike.model} readOnly className="bg-slate-50 text-slate-700" />
                  <Input value={selectedBike.year.toString()} readOnly className="bg-slate-50 text-slate-700" />
                  <Input value={selectedBike.kms} readOnly className="bg-slate-50 text-slate-700" />
                  <Input value={`₹ ${selectedBike.expectedSellingPrice.toLocaleString()}`} readOnly className="bg-slate-50 text-slate-700 font-semibold" />
                  <Input value={selectedBike.status} readOnly className="bg-slate-50 text-slate-700" />
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
                <Input
                  key={`receipt-${fileKey}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-medium">Buyer Documents</p>
                <p className="mb-3 text-xs text-slate-500">
                  Upload Aadhaar / PAN / Voter ID / Driving License (Multiple files allowed)
                </p>
                <Input
                  key={`docs-${fileKey}`}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setBuyerDocs(Array.from(e.target.files ?? []))
                  }
                />

                {buyerDocs.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-xl border bg-slate-50 p-4">
                    {buyerDocs.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border shadow-sm"
                      >
                        <span className="truncate text-sm font-medium text-slate-700">{file.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() =>
                            setBuyerDocs((docs) =>
                              docs.filter((_, i) => i !== index)
                            )
                          }
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