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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BikeGallery from "../bike-details/bike-gallery";


export default function AddBikeDialog() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);
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
  }

async function handleSubmit() {
  try {
    setIsSubmitting(true);

    const payload = {
  bike: {
    id: crypto.randomUUID(),

    number: form.number,
    model: form.model,
    year: Number(form.year),
    kms: form.kms,

    expectedSellingPrice: Number(form.expectedSellingPrice),

    status: "Available",

    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80",

    engineNumber: form.engineNumber,
    chassisNumber: form.chassisNumber,

    // images: [] // Cloudinary later
  },

  customer: {
    id: crypto.randomUUID(),

    bikeId: form.number, // see note below

    seller: {
      name: form.sellerName,
      phone: form.sellerPhone,
      address: form.sellerAddress,

      // documents: [] // Cloudinary later
    },

    purchasePrice: Number(form.purchasePrice),
  },
};

    const res = await fetch("/api/bike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();

      throw new Error(error.message || "Failed to save bike");
    }

    toast.success("Bike added successfully.");

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
    });

    setImages([]);
    setSellerDocs([]);
    setSelectedImage(0);

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
                name="year"
                value={form.year}
                placeholder="Manufacturing Year"
                type="number"
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
                placeholder="Phone Number"
                onChange={handleChange}
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
              <Button variant="outline" className="px-8">
                Cancel
              </Button>

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
