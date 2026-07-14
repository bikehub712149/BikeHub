"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Bike = {
  id: string;
  number: string;
  model: string;
  year: number;
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

  const [form, setForm] = useState({
    model: "",
    year: "",
    kms: "",
    engineNumber: "",
    chassisNumber: "",
    ownerSerial: "",
    expectedSellingPrice: "",
  });

  useEffect(() => {
    if (!bike) return;

    setForm({
      model: bike.model,
      year: String(bike.year),
      kms: bike.kms,
      engineNumber: bike.engineNumber ?? "",
      chassisNumber: bike.chassisNumber ?? "",
      ownerSerial: bike.ownerSerial ?? "",
      expectedSellingPrice: String(bike.expectedSellingPrice),
    });
  }, [bike]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
          model: form.model,
          year: Number(form.year),
          kms: form.kms,
          engineNumber: form.engineNumber,
          chassisNumber: form.chassisNumber,
          ownerSerial: form.ownerSerial,
          expectedSellingPrice: Number(
            form.expectedSellingPrice
          ),
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Bike updated successfully.");

      onOpenChange(false);

      router.refresh();
    } catch {
      toast.error("Failed to update bike.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl rounded-3xl">

        <DialogHeader>

          <DialogTitle className="text-2xl">
            Edit Technical Information
          </DialogTitle>

          <DialogDescription>
            Update bike specifications and
            registration details.
          </DialogDescription>

        </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-5">

          <Input
            name="model"
            placeholder="Model"
            value={form.model}
            onChange={handleChange}
          />

          <Input
            name="year"
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={handleChange}
          />

          <Input
            name="kms"
            placeholder="Kilometers"
            value={form.kms}
            onChange={handleChange}
          />

          <Input
            name="ownerSerial"
            placeholder="Owner Serial"
            value={form.ownerSerial}
            onChange={handleChange}
          />

          <Input
            name="engineNumber"
            placeholder="Engine Number"
            value={form.engineNumber}
            onChange={handleChange}
          />

          <Input
            name="chassisNumber"
            placeholder="Chassis Number"
            value={form.chassisNumber}
            onChange={handleChange}
          />

          <div className="col-span-2">

            <Input
              name="expectedSellingPrice"
              type="number"
              placeholder="Expected Selling Price"
              value={form.expectedSellingPrice}
              onChange={handleChange}
            />

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={saveChanges}
            disabled={loading}
            className="min-w-[140px]"
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