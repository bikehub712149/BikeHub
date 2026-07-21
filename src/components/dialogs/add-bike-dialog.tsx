"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BikeGallery from "../bike-details/bike-gallery";
import imageCompression from "browser-image-compression";
import jsPDF from "jspdf";

export default function AddBikeDialog() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(Date.now());
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    number: "",
    model: "",
    year: "",
    kms: "",
    expectedSellingPrice: "",
    engineNumber: "",

    sellerName: "",
    sellerPhone: "",
    purchasePrice: "",
    chassisNumber: "",
    sellerAddress: "",
    ownerSerial: "1",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 4) {
      alert("Maximum 4 images allowed.");
      return;
    }

    setImages([...images, ...files]);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
    setSelectedImage(0);
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);

      // 1. Create your structured payload
      const payload = {
        bike: {
          id: crypto.randomUUID(),
          number: form.number,
          model: form.model,
          year: form.year,
          kms: form.kms,
          expectedSellingPrice: Number(form.expectedSellingPrice),
          status: "Available",
          engineNumber: form.engineNumber,
          chassisNumber: form.chassisNumber,
          image: "", // Backend handles this
          images: [], // Backend handles this
          ownerSerial: form.ownerSerial,
        },
        customer: {
          id: crypto.randomUUID(),
          bikeId: form.number,
          seller: {
            name: form.sellerName,
            phone: form.sellerPhone,
            address: form.sellerAddress,
            documents: [], // Backend handles this
          },
          purchasePrice: Number(form.purchasePrice),
        },
        mainImageIndex: selectedImage,
      };

      // 2. Initialize FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      // ---------------------------------------------------------
      // 3. COMPRESS BIKE IMAGES (Target ~1MB & HD)
      // ---------------------------------------------------------
      const compressedBikeFiles = await Promise.all(
        images.map(async (file) => {
          const compressedBlob = await imageCompression(file, {
            maxSizeMB: 0.5, // 500KB
            maxWidthOrHeight: 1600, // still HD enough
            useWebWorker: true,
            initialQuality: 0.8,
            alwaysKeepResolution: false,
          });
          return new File([compressedBlob], file.name, { type: file.type });
        })
      );

      compressedBikeFiles.forEach((file) => formData.append("images", file));

      // ---------------------------------------------------------
      // 4. COMPRESS DOCS & BUNDLE TO PDF (Target ~1MB per doc & HD)
      // ---------------------------------------------------------
      const docImages = sellerDocs.filter((f) => f.type.startsWith("image/"));
      const docPdfs = sellerDocs.filter((f) => f.type === "application/pdf");

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
              maxSizeMB: 0.2, // 200KB
              maxWidthOrHeight: 1400,
              fileType: "image/jpeg",
              useWebWorker: true,
              initialQuality: 0.7,
              alwaysKeepResolution: false,
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

          pdf.addImage(
            base64Str,
            "JPEG",
            0,
            0,
            pdfWidth,
            pdfHeight,
            undefined,
            "SLOW"
          );
        });

        const pdfBlob = pdf.output("blob");
        const combinedPdfFile = new File(
          [pdfBlob],
          `${form.number}-seller-docs.pdf`,
          { type: "application/pdf" }
        );

        formData.append("sellerDocs", combinedPdfFile);
      }

      // Append any files that were already PDFs
      docPdfs.forEach((pdf) => formData.append("sellerDocs", pdf));

      // ---------------------------------------------------------
      // 5. SEND TO API
      // ---------------------------------------------------------
      const res = await fetch("/api/bike", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save bike");
      }

      toast.success("Bike added successfully.");

      // Reset Form
      setForm({
        number: "",
        model: "",
        year: "",
        kms: "",
        expectedSellingPrice: "",
        engineNumber: "",
        sellerName: "",
        sellerPhone: "",
        purchasePrice: "",
        chassisNumber: "",
        sellerAddress: "",
        ownerSerial: "1",
      });

      setImages([]);
      setSellerDocs([]);
      setSelectedImage(0);
      setFileKey(Date.now());

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button className="h-12 rounded-xl px-6">
            <Plus className="mr-2 h-4 w-4" />
            Add Bike
          </Button>
        }
      />

      <DialogContent className="!max-w-[82vw] max-h-[90vh] overflow-hidden rounded-3xl gap-0">
        <DialogHeader className="border-b py-4 px-5">
          <DialogTitle className="text-3xl leading-3">Add New Bike</DialogTitle>

          <p className="text-sm text-slate-500">
            Enter bike details and seller information.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-12 h-[75vh] py-5">
          {/* LEFT */}
          <div className="col-span-5 border-r">
            <BikeGallery
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              editable
              onAddImages={handleImages}
              onRemoveImage={removeImage}
            />
          </div>

          {/* RIGHT */}
          <div className="col-span-7 overflow-y-auto p-8">
            <h3 className="mb-5 text-lg font-semibold">Bike Details</h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="number"
                value={form.number}
                placeholder="Registration Number"
                onChange={handleChange}
              />
              <Input
                name="model"
                value={form.model}
                placeholder="Bike Model"
                onChange={handleChange}
              />
              <Input
                type="month"
                name="year"
                value={form.year}
                onChange={handleChange}
              />
              <Input
                name="kms"
                value={form.kms}
                placeholder="Kilometers"
                onChange={handleChange}
              />
              <Input
                name="expectedSellingPrice"
                value={form.expectedSellingPrice}
                placeholder="Expected Selling Price"
                type="number"
                onChange={handleChange}
              />
              <Input
                name="engineNumber"
                value={form.engineNumber}
                placeholder="Engine Number"
                onChange={handleChange}
              />

              <div>
                <p className="mb-2 text-sm font-medium">Owner Series</p>

                <Select
                  value={form.ownerSerial}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      ownerSerial: value ?? "1",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Owner" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="1">1st Owner</SelectItem>
                    <SelectItem value="2">2nd Owner</SelectItem>
                    <SelectItem value="3">3rd Owner</SelectItem>
                    <SelectItem value="4">4th Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h3 className="mt-10 mb-5 text-lg font-semibold">
              Seller Information
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="sellerName"
                value={form.sellerName}
                placeholder="Seller Name"
                onChange={handleChange}
              />
              <Input
                name="sellerPhone"
                value={form.sellerPhone}
                placeholder="Phone Number (Alt: 9876543210 / 9123456789)"
                onChange={(e) => {
                  let value = e.target.value;

                  // Allow only digits, slash and spaces
                  value = value.replace(/[^\d/\s]/g, "");

                  // Allow only one slash
                  const parts = value.split("/");
                  if (parts.length > 2) {
                    value = `${parts[0]}/${parts.slice(1).join("")}`;
                  }

                  setForm((prev) => ({
                    ...prev,
                    sellerPhone: value,
                  }));
                }}
              />
              <Input
                name="purchasePrice"
                value={form.purchasePrice}
                placeholder="Purchase Price"
                type="number"
                onChange={handleChange}
              />
              <Input
                name="chassisNumber"
                value={form.chassisNumber}
                placeholder="Chassis Number"
                onChange={handleChange}
              />

              <div className="col-span-2">
                <Textarea
                  rows={4}
                  name="sellerAddress"
                  value={form.sellerAddress}
                  placeholder="Seller Address"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Seller Documents</p>
              <p className="mb-3 text-xs text-slate-500">
                Upload Aadhaar / PAN / Voter ID / Driving License (Multiple
                files allowed)
              </p>

              <Input
                type="file"
                key={fileKey}
                multiple
                accept="image/*,.pdf"
                onChange={(e) =>
                  setSellerDocs(Array.from(e.target.files ?? []))
                }
              />

              {sellerDocs.length > 0 && (
                <div className="mt-4 space-y-2 rounded-xl border bg-slate-50 p-4">
                  {sellerDocs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border"
                    >
                      <span className="truncate text-sm">{file.name}</span>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setSellerDocs((docs) =>
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

            <div className="mt-8 flex justify-end gap-4">
              <Button
                className="min-w-[150px]"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Bike"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
