"use client";

import { useEffect, useState } from "react";
import { Loader2, BadgeCheck, X } from "lucide-react";
import Image from "next/image";
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

export default function SoldBikeDialog() {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [buyerDocs, setBuyerDocs] = useState<File[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBikes() {
      try {
        const res = await fetch("/api/bike");

        if (!res.ok) {
          throw new Error("Failed to fetch bikes");
        }

        const data: Bike[] = await res.json();

        // Only Available bikes
        setBikes(data.filter((bike) => bike.status === "Available"));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bikes");
      }
    }

    fetchBikes();
  }, []);

  const [form, setForm] = useState({
    bikeNumber: "",

    buyerName: "",
    buyerPhone: "",
    buyerAddress: "",

    sellingPrice: "",

    saleDate: new Date().toISOString().split("T")[0],
  });

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
      setIsSubmitting(true);

      const payload = {
        bikeId: form.bikeNumber,

        buyer: {
          name: form.buyerName,
          phone: form.buyerPhone,
          address: form.buyerAddress,
          // documents later
        },

        sellingPrice: Number(form.sellingPrice),

        receipt: receipt?.name ?? null,
      };
      console.log(payload);
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to complete sale");
      }

      toast.success("Bike sold successfully.");

      setForm({
        bikeNumber: "",
        buyerName: "",
        buyerPhone: "",
        buyerAddress: "",
        sellingPrice: "",
        saleDate: new Date().toISOString().split("T")[0],
      });

      setSelectedBike(null);
      setReceipt(null);
      setBuyerDocs([]);

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
          <Button variant="secondary" className="h-12 rounded-xl px-6">
            <BadgeCheck className="mr-2 h-4 w-4" />
            Sold Bike
          </Button>
        }
      />

      <DialogContent
        className="
    !max-w-[80vw]
    max-h-[90vh]
    overflow-hidden
    rounded-3xl
    p-5
    gap-0
  "
      >
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-3xl font-bold leading-5">
            Complete Bike Sale
          </DialogTitle>

          <p className="text-slate-500 text-xs ">
            Select a bike and enter buyer information.
          </p>
        </DialogHeader>

        <div className="grid h-[75vh] grid-cols-12 py-5">
          {/* LEFT */}

          <div className="col-span-5 border-r px-8">
            <h3 className="mb-4 text-xs font-semibold">Bike Information</h3>

            <BikeSelector
              bikes={bikes}
              value={selectedBike ?? undefined}
              onChange={(bike) => {
                console.log(bike);

                setSelectedBike(bike);

                setForm((prev) => ({
                  ...prev,
                  bikeNumber: bike.number,
                }));
              }}
            />

            {selectedBike && (
              <>
                <img
                  src={selectedBike.image}
                  alt={selectedBike.model}
                  width={600}
                  height={400}
                  className="mt-8 h-60 w-full rounded-2xl border object-cover"
                />

                <div className="mt-8 grid grid-cols-2 gap-5">
                  <Input
                    value={selectedBike.number}
                    readOnly
                    className="bg-slate-100"
                  />

                  <Input
                    value={selectedBike.model}
                    readOnly
                    className="bg-slate-100"
                  />

                  <Input
                    value={selectedBike.year}
                    readOnly
                    className="bg-slate-100"
                  />

                  <Input
                    value={selectedBike.kms}
                    readOnly
                    className="bg-slate-100"
                  />

                  <Input
                    value={`₹ ${selectedBike.expectedSellingPrice.toLocaleString()}`}
                    readOnly
                    className="bg-slate-100"
                  />

                  <Input
                    value={selectedBike.status}
                    readOnly
                    className="bg-slate-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}

          <div className="col-span-7 overflow-y-auto px-10 py-2 pr-6">
            <h3 className="mb-4 text-lg font-semibold">Buyer Information</h3>

            <div className="grid grid-cols-2 gap-5">
              <Input
                name="buyerName"
                placeholder="Buyer Name"
                onChange={handleChange}
              />

              <Input
                name="buyerPhone"
                placeholder="Phone Number"
                onChange={handleChange}
              />

              <Input
                name="sellingPrice"
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
                  rows={5}
                  placeholder="Buyer Address"
                  name="buyerAddress"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium">Upload Receipt</p>

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
              />

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium">Buyer Documents</p>

                <p className="mb-3 text-xs text-slate-500">
                  Upload Aadhaar / PAN / Voter ID / Driving License (Multiple
                  files allowed)
                </p>

                <Input
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
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border"
                      >
                        <span className="truncate text-sm">{file.name}</span>

                        <Button
                          size="icon"
                          variant="ghost"
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

            <div className="mt-10 flex justify-end gap-4">
              <Button variant="outline">Cancel</Button>

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
