"use client";

import { useEffect, useRef, useState } from "react";
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
import { prepareUploadImage, warmUploadImages } from "@/lib/prepare-upload-image";
import {
  clearDialogDraft,
  loadDialogDraft,
  saveDialogDraft,
} from "@/lib/draft-store";

const NUMERIC_FIELDS = ["kms", "expectedSellingPrice", "purchasePrice"];
const ADD_BIKE_DRAFT_KEY = "add-bike-dialog";

function formatNumberInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("en-IN") : "";
}

function unformatNumberInput(value: string) {
  return value.replace(/,/g, "");
}

type AddBikeDraft = {
  open: boolean;
  form: {
    number: string;
    model: string;
    year: string;
    kms: string;
    expectedSellingPrice: string;
    engineNumber: string;
    brokerName: string;
    brokerPhone: string;
    sellerName: string;
    sellerPhone: string;
    purchasePrice: string;
    chassisNumber: string;
    sellerAddress: string;
    ownerSerial: string;
  };
  images: File[];
  selectedImage: number;
  sellerDocs: File[];
};

export default function AddBikeDialog() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);
  const [fileKey, setFileKey] = useState(() => Date.now());
  const draftRestoredRef = useRef(false);
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

  // Restore any active draft if the mobile browser tab was reloaded during a camera/file action
  useEffect(() => {
    let active = true;
    loadDialogDraft<AddBikeDraft>(ADD_BIKE_DRAFT_KEY).then((draft) => {
      if (!active) return;
      draftRestoredRef.current = true;
      if (draft?.open) {
        setForm(draft.form);
        const restoredImages = Array.isArray(draft.images) ? draft.images : [];
        const restoredDocs = Array.isArray(draft.sellerDocs) ? draft.sellerDocs : [];
        setImages(restoredImages);
        setSelectedImage(
          restoredImages.length > 0
            ? Math.min(draft.selectedImage || 0, restoredImages.length - 1)
            : 0
        );
        setSellerDocs(restoredDocs);
        setOpen(true);
        warmUploadImages([...restoredImages, ...restoredDocs]);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Save draft while open so mobile OS memory eviction never loses user input or photos
  useEffect(() => {
    if (!draftRestoredRef.current) return;
    if (open) {
      saveDialogDraft<AddBikeDraft>(ADD_BIKE_DRAFT_KEY, {
        open: true,
        form,
        images,
        selectedImage,
        sellerDocs,
      });
    }
  }, [open, form, images, selectedImage, sellerDocs]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      clearDialogDraft(ADD_BIKE_DRAFT_KEY);
    }
  };

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
    if (files.length === 0) return;

    setImages((prev) => {
      if (files.length + prev.length > 4) {
        toast.error("Maximum 4 images allowed.");
        return prev;
      }
      const next = [...prev, ...files];
      setSelectedImage(next.length - 1);
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setSelectedImage((curr) =>
        next.length === 0 ? 0 : Math.min(curr, next.length - 1)
      );
      return next;
    });
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

      await clearDialogDraft(ADD_BIKE_DRAFT_KEY);
      router.refresh();
      setOpen(false);
      window.dispatchEvent(new Event("inventory-updated"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="lg" className="h-11 rounded-xl px-5 max-sm:h-8 max-sm:!px-2.5 max-sm:!py-0 max-sm:text-xs max-sm:rounded-lg">
            <Plus className="mr-2 max-sm:mr-1 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Add Bike
          </Button>
        }
      />

      <DialogContent className="!max-w-5xl max-sm:w-[95vw] max-h-[92vh] flex flex-col gap-0 overflow-hidden rounded-3xl max-sm:rounded-2xl p-5 max-sm:p-0">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-6 py-5 max-sm:px-4 max-sm:py-3.5">
          <DialogTitle className="text-2xl max-sm:text-base font-bold tracking-tight">
            Add New Bike
          </DialogTitle>

          <p className="text-sm max-sm:text-[11px] text-slate-500">
            Enter bike details and seller information.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* LEFT */}
          <div className="border-b md:col-span-5 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r">
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
          <div className="min-h-0 md:overflow-y-auto p-8 max-sm:p-4 md:col-span-7">
            <h3 className="mb-5 max-sm:mb-3 text-lg max-sm:text-sm font-semibold">
              Bike Details
            </h3>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5 max-sm:gap-3">
              <Input
                name="number"
                value={form.number}
                placeholder="Registration Number"
                required
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="model"
                value={form.model}
                placeholder="Bike Model"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                type="month"
                name="year"
                value={form.year}
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="kms"
                value={form.kms}
                placeholder="Kilometers"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="expectedSellingPrice"
                value={form.expectedSellingPrice}
                placeholder="Expected Selling Price"
                type="text"
                inputMode="numeric"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="engineNumber"
                value={form.engineNumber}
                placeholder="Engine Number"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />

              <div>
                <p className="mb-2 max-sm:mb-1.5 text-sm max-sm:text-xs font-medium">
                  Owner Series
                </p>

                <Select
                  value={form.ownerSerial}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      ownerSerial: value ?? "1",
                    })
                  }
                >
                  <SelectTrigger className="max-sm:h-9 max-sm:text-xs">
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

            <h3 className="mt-10 max-sm:mt-6 mb-5 max-sm:mb-3 text-lg max-sm:text-sm font-semibold">
              Seller Information
            </h3>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5 max-sm:gap-3">
              <Input
                name="sellerName"
                value={form.sellerName}
                placeholder="Seller Name"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="sellerPhone"
                value={form.sellerPhone}
                placeholder="Phone Number (Alt: 9876543210 / 9123456789)"
                className="max-sm:h-9 max-sm:text-xs"
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
                className="max-sm:h-9 max-sm:text-xs"
              />
              <Input
                name="chassisNumber"
                value={form.chassisNumber}
                placeholder="Chassis Number"
                onChange={handleChange}
                className="max-sm:h-9 max-sm:text-xs"
              />

              <div className="col-span-2 max-sm:col-span-1">
                <Textarea
                  rows={3}
                  name="sellerAddress"
                  value={form.sellerAddress}
                  placeholder="Seller Address"
                  onChange={handleChange}
                  className="max-sm:text-xs"
                />
              </div>

              <div className="col-span-2 max-sm:col-span-1">
                <p className="mb-3 max-sm:mb-2 text-sm max-sm:text-xs font-medium">
                  Broker Information{" "}
                  <span className="text-xs max-sm:text-[11px] font-normal text-slate-400">
                    (Optional)
                  </span>
                </p>

                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5 max-sm:gap-3">
                  <Input
                    name="brokerName"
                    value={form.brokerName}
                    placeholder="Broker Name"
                    onChange={handleChange}
                    className="max-sm:h-9 max-sm:text-xs"
                  />

                  <Input
                    name="brokerPhone"
                    value={form.brokerPhone}
                    placeholder="Broker Phone"
                    className="max-sm:h-9 max-sm:text-xs"
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

            <div className="mt-8 max-sm:mt-6">
              <p className="mb-2 max-sm:mb-1 text-sm max-sm:text-xs font-medium">
                Seller Documents
              </p>
              <p className="mb-3 max-sm:mb-2.5 text-xs max-sm:text-[11px] text-slate-500">
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
                <div className="mt-4 max-sm:mt-3 space-y-2 rounded-xl border bg-slate-50 p-4 max-sm:p-2.5">
                  {sellerDocs.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 max-sm:px-2.5 max-sm:py-1.5 border"
                    >
                      <span className="truncate text-sm max-sm:text-xs">{file.name}</span>

                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        className="max-sm:size-7 max-sm:!p-0"
                        onClick={() => {
                          setSellerDocs((docs) =>
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

            <div className="mt-8 max-sm:mt-6 flex justify-end gap-4 pb-2">
              <Button
                className="min-w-[150px] max-sm:w-full max-sm:h-10 max-sm:text-xs"
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
