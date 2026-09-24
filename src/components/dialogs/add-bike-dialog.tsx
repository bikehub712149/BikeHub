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
import { validateBike } from "@/types/zod";
import { capitalizeInputText, uppercaseDbText } from "@/lib/utils";
import FilePicker from "@/components/ui/file-picker";
import { createImagePdf } from "@/lib/create-image-pdf";
import { prepareUploadImage } from "@/lib/prepare-upload-image";

const NUMERIC_FIELDS = ["kms", "expectedSellingPrice", "purchasePrice"];

function formatNumberInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("en-IN") : "";
}

function unformatNumberInput(value: string) {
  return value.replace(/,/g, "");
}
export default function AddBikeDialog() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(() => Date.now());
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    number: "",
    model: "",
    year: "",
    kms: "",
    expectedSellingPrice: "",
    engineNumber: "",

    brokerName: "",
    brokerPhone: "",

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
    const { name, value } = e.target;

    const formatField = (fieldName: string, rawValue: string) => {
      if (["sellerPhone", "brokerPhone", "year", "ownerSerial"].includes(fieldName)) {
        return rawValue;
      }

      if (NUMERIC_FIELDS.includes(fieldName)) {
        return formatNumberInput(rawValue);
      }

      if (["number", "engineNumber", "chassisNumber"].includes(fieldName)) {
        return uppercaseDbText(rawValue);
      }

      return capitalizeInputText(rawValue);
    };

    setForm({
      ...form,
      [name]: formatField(name, value),
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

      // The client prepares files; the API uploads assets, applies fallbacks, and writes records.
      const values = validateBike({
        ...form,
        kms: unformatNumberInput(form.kms),
        expectedSellingPrice: unformatNumberInput(form.expectedSellingPrice),
        purchasePrice: unformatNumberInput(form.purchasePrice),
      });
      const normalizedNumber = uppercaseDbText(values.number);
      const normalizedModel = uppercaseDbText(values.model);
      const normalizedSellerName = uppercaseDbText(values.sellerName);
      const normalizedSellerAddress = uppercaseDbText(values.sellerAddress);
      const normalizedBrokerName = uppercaseDbText(values.brokerName || "");
      const normalizedEngineNumber = uppercaseDbText(values.engineNumber);
      const normalizedChassisNumber = uppercaseDbText(values.chassisNumber);

      const payload = {
        bike: {
          id: crypto.randomUUID(),
          number: normalizedNumber,
          model: normalizedModel,
          year: values.year,
          kms: values.kms,
          expectedSellingPrice: Number(values.expectedSellingPrice),
          status: "Available",
          engineNumber: normalizedEngineNumber,
          chassisNumber: normalizedChassisNumber,
          image: "", // Backend handles this
          images: [], // Backend handles this
          ownerSerial: values.ownerSerial,
        },
        customer: {
          id: crypto.randomUUID(),
          bikeId: normalizedNumber,
          seller: {
            name: normalizedSellerName,
            phone: values.sellerPhone,
            address: normalizedSellerAddress,
            documents: [], // Backend handles this
          },
          broker: {
            name: normalizedBrokerName,
            phone: values.brokerPhone || "",
          },
          purchasePrice: Number(values.purchasePrice),
        },
        mainImageIndex: selectedImage,
      };

      // Keep the selected image index separate so the server can choose the main image URL.
      const preparedImages = await Promise.all(images.map(prepareUploadImage));

      let docUrls: string[] = [];
      if (sellerDocs.length > 0) {
        const combinedPdfFile = await createImagePdf(
          sellerDocs,
          `${values.number}-seller-docs.pdf`
        );
        const signatureResponse = await fetch("/api/cloudinary/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bikeNumber: normalizedNumber, type: "seller" }),
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

        docUrls = [cloudinaryResult.secure_url];
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify({ ...payload, docUrls }));
      preparedImages.forEach((file) => formData.append("images", file));

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

        brokerName: "",
        brokerPhone: "",

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

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-12 rounded-xl px-6">
            <Plus className="mr-2 h-4 w-4" />
            Add Bike
          </Button>
        }
      />

      <DialogContent className="!max-w-[82vw] max-h-[90vh] flex flex-col gap-0 overflow-hidden rounded-3xl p-7">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-6 py-5">
          <DialogTitle className="text-2xl font-bold tracking-tight">Add New Bike</DialogTitle>

          <p className="text-sm text-slate-500">
            Enter bike details and seller information.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 grid grid-cols-1 md:grid-cols-12">
          {/* LEFT */}
          <div className="min-h-[240px] border-b md:col-span-5 md:min-h-0 md:border-b-0 md:border-r">
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
          <div className="min-h-0 overflow-y-auto p-5 sm:p-8 md:col-span-7">
            <h3 className="mb-5 text-lg font-semibold">Bike Details</h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="number"
                value={form.number}
                placeholder="Registration Number"
                required
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
                type="text"
                inputMode="numeric"
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
                type="text"
                inputMode="numeric"
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

              <div className="col-span-2">
                <p className="mb-3 text-sm font-medium">
                  Broker Information{" "}
                  <span className="text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-5">
                  <Input
                    name="brokerName"
                    value={form.brokerName}
                    placeholder="Broker Name"
                    onChange={handleChange}
                  />

                  <Input
                    name="brokerPhone"
                    value={form.brokerPhone}
                    placeholder="Broker Phone"
                    onChange={(e) => {
                      let value = e.target.value;

                      value = value.replace(/[^\d/\s]/g, "");

                      const parts = value.split("/");
                      if (parts.length > 2) {
                        value = `${parts[0]}/${parts.slice(1).join("")}`;
                      }

                      setForm((prev) => ({
                        ...prev,
                        brokerPhone: value,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Seller Documents</p>
              <p className="mb-3 text-xs text-slate-500">
                Upload document images only. They will be converted into a
                single PDF automatically.
              </p>

              <FilePicker
                id="seller-documents"
                multiple
                accept="image/*"
                label="Choose seller documents"
                resetKey={fileKey}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);

                  setSellerDocs((prev) => {
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

              {sellerDocs.length > 0 && (
                <div className="mt-4 space-y-2 rounded-xl border bg-slate-50 p-4">
                  {sellerDocs.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border"
                    >
                      <span className="truncate text-sm">{file.name}</span>

                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setSellerDocs((docs) =>
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
