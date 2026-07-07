"use client";

import { useState } from "react";
import { Plus, Upload, X } from "lucide-react";

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

export default function AddBikeDialog() {
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerDocs, setSellerDocs] = useState<File[]>([]);

  const [form, setForm] = useState({
    number: "",
    model: "",
    year: "",
    kms: "",
    purchasePrice: "",

    sellerName: "",
    sellerPhone: "",
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

  function handleSubmit() {
    const bikePayload = {
      bike: {
        id: crypto.randomUUID(),

        number: form.number,
        model: form.model,
        year: Number(form.year),
        kms: form.kms,

        price: Number(form.purchasePrice),

        status: "Available",

        images: images.map((file) => file.name),
      },

      transaction: {
        seller: {
          name: form.sellerName,
          phone: form.sellerPhone,
          address: form.sellerAddress,
        },

        buyer: null,

        purchasePrice: Number(form.purchasePrice),

        sellingPrice: 0,

        receiptId: null,
      },
    };

    console.log(bikePayload);
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

          <div className="col-span-5 border-r bg-slate-200 p-8 rounded-tl-lg rounded-bl-lg">
            <h3 className="mb-5 text-lg font-semibold">Bike Photos</h3>

            <div className="h-80 overflow-hidden rounded-2xl border bg-white">
              {images.length ? (
                <img
                  src={URL.createObjectURL(images[selectedImage])}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No image selected
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-5 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition

            ${selectedImage === index ? "border-blue-600" : "border-slate-200"}
          `}
                >
                  <img
                    src={URL.createObjectURL(img)}
                    className="h-20 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);

                      if (selectedImage >= images.length - 1)
                        setSelectedImage(0);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500">
                  <Plus className="mb-1 h-5 w-5" />

                  <span className="text-xs">Add</span>

                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImages}
                  />
                </label>
              )}
            </div>
          </div>

          {/* RIGHT */}

          <div className="col-span-7 overflow-y-auto p-8">
            <h3 className="mb-5 text-lg font-semibold">Bike Details</h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="number"
                placeholder="Registration Number"
                onChange={handleChange}
              />

              <Input
                name="model"
                placeholder="Bike Model"
                onChange={handleChange}
              />

              <Input
                name="year"
                placeholder="Manufacturing Year"
                type="number"
                onChange={handleChange}
              />

              <Input
                name="kms"
                placeholder="Kilometers"
                onChange={handleChange}
              />

              <Input
                name="purchasePrice"
                placeholder="Purchase Price"
                type="number"
                onChange={handleChange}
              />
            </div>

            <h3 className="mt-10 mb-5 text-lg font-semibold">
              Seller Information
            </h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="sellerName"
                placeholder="Seller Name"
                onChange={handleChange}
              />

              <Input
                name="sellerPhone"
                placeholder="Phone Number"
                onChange={handleChange}
              />

              <div className="col-span-2">
                <Textarea
                  rows={4}
                  name="sellerAddress"
                  placeholder="Seller Address"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-2 text-sm font-medium">Seller Documents</p>

              <p className="mb-3 text-xs text-slate-500">
                Aadhaar / PAN / Voter ID / Driving License
              </p>

              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) =>
                  setSellerDocs(Array.from(e.target.files ?? []))
                }
              />
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" className="px-8">
                Cancel
              </Button>

              <Button className="px-8" onClick={handleSubmit}>
                Save Bike
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
