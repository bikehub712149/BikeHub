"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capitalizeInputText, uppercaseDbText } from "@/lib/utils";

type Bike = {
  id: string;
  number: string;
  model: string;
  year: string;
  kms: string;
  engineNumber?: string;
  chassisNumber?: string;
  ownerSerial?: string;
  expectedSellingPrice: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: Bike;
};

export default function EditTechnicalDialog({
  open,
  onOpenChange,
  bike,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [waitingForRefresh, setWaitingForRefresh] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    model: "",
    year: "",
    kms: "",
    ownerSerial: "",
    engineNumber: "",
    chassisNumber: "",
    expectedSellingPrice: "",
  });

  useEffect(() => {
    if (!bike) return;

    setForm({
      model: uppercaseDbText(bike.model),
      year: String(bike.year),
      kms: bike.kms,
      ownerSerial: bike.ownerSerial ?? "",
      engineNumber: uppercaseDbText(bike.engineNumber ?? ""),
      chassisNumber: uppercaseDbText(bike.chassisNumber ?? ""),
      expectedSellingPrice: String(bike.expectedSellingPrice),
    });
  }, [bike]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && (loading || waitingForRefresh || isPending)) return;
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (waitingForRefresh && !isPending) {
      const timeoutId = window.setTimeout(() => {
        setWaitingForRefresh(false);
        setLoading(false);
        onOpenChange(false);
      });

      return () => window.clearTimeout(timeoutId);
    }
  }, [isPending, onOpenChange, waitingForRefresh]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    const formatField = (fieldName: string, rawValue: string) => {
      if (["year", "kms", "expectedSellingPrice"].includes(fieldName)) {
        return rawValue;
      }

      if (["engineNumber", "chassisNumber"].includes(fieldName)) {
        return uppercaseDbText(rawValue);
      }

      return capitalizeInputText(rawValue);
    };

    setForm((prev) => ({
      ...prev,
      [name]: formatField(name, value),
    }));
  }

  async function saveChanges() {
    try {
      setLoading(true);

      const res = await fetch(`/api/bike/${bike.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: uppercaseDbText(form.model),
          year: form.year,
          kms: form.kms,
          ownerSerial: form.ownerSerial,
          engineNumber: uppercaseDbText(form.engineNumber),
          chassisNumber: uppercaseDbText(form.chassisNumber),
          expectedSellingPrice: Number(form.expectedSellingPrice),
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Bike information updated successfully.");

      setWaitingForRefresh(true);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Failed to update bike.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-background p-0 shadow-xl">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-7 pb-5 pt-7 !gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit Bike Information
          </DialogTitle>
          <DialogDescription className="text-sm">
            Update registration, technical details, and pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-7 overflow-y-auto px-6 py-6">
          {/* Section 1: Registration (3 Columns) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 underline pb-1">
              Registration Details
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Model spans 2 columns because names can be long */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Bike Model</label>
                <Input
                  className="h-10"
                  name="model"
                  placeholder="Royal Enfield Classic 350"
                  value={form.model}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mfg. Year</label>
                <Input
                  className="h-10"
                  name="year"
                  type="month"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Kilometers</label>
                <Input
                  className="h-10"
                  name="kms"
                  placeholder="18,450 km"
                  value={form.kms}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Owner Serial</label>

                <select
                  name="ownerSerial"
                  value={form.ownerSerial}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ownerSerial: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Owner</option>
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4">4th Owner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Technical & Pricing (3 Columns) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary/80 underline pb-1">
              Technical & Pricing
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Engine Number</label>
                <Input
                  className="h-10"
                  name="engineNumber"
                  placeholder="Enter engine no."
                  value={form.engineNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Chassis Number</label>
                <Input
                  className="h-10"
                  name="chassisNumber"
                  placeholder="Enter chassis no."
                  value={form.chassisNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Expected Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    ₹
                  </span>
                  <Input
                    className="h-10 pl-7"
                    name="expectedSellingPrice"
                    type="number"
                    placeholder="1,50,000"
                    value={form.expectedSellingPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            className="h-9 px-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            className="h-9 min-w-[140px]"
            disabled={loading || waitingForRefresh || isPending}
            onClick={saveChanges}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
