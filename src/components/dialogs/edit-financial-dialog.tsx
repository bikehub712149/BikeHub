"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, IndianRupee } from "lucide-react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  bikeNumber: string;

  purchasePrice: number;

  sellingPrice?: number | null;
};

export default function EditFinancialDialog({
  open,
  onOpenChange,
  bikeNumber,
  purchasePrice,
  sellingPrice,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    purchasePrice: "",
    sellingPrice: "",
  });

  useEffect(() => {
    setForm({
      purchasePrice: String(purchasePrice),

      sellingPrice:
        sellingPrice != null
          ? String(sellingPrice)
          : "",
    });
  }, [purchasePrice, sellingPrice]);

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

      const res = await fetch(
        `/api/customer/${bikeNumber}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            purchasePrice: Number(form.purchasePrice),

            sellingPrice:
              form.sellingPrice === ""
                ? null
                : Number(form.sellingPrice),
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      toast.success(
        "Financial information updated."
      );

      onOpenChange(false);

      router.refresh();
    } catch {
      toast.error(
        "Failed to update financial information."
      );
    } finally {
      setLoading(false);
    }
  }

  const profit =
    form.sellingPrice === ""
      ? null
      : Number(form.sellingPrice) -
        Number(form.purchasePrice);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl rounded-3xl">

        <DialogHeader>

          <DialogTitle className="flex items-center gap-2 text-2xl">

            <IndianRupee className="h-6 w-6" />

            Edit Financial Information

          </DialogTitle>

          <DialogDescription>
            Update purchase and selling prices.
          </DialogDescription>

        </DialogHeader>

        <div className="mt-6 space-y-5">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Purchase Price
            </label>

            <Input
              name="purchasePrice"
              type="number"
              value={form.purchasePrice}
              onChange={handleChange}
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Selling Price
            </label>

            <Input
              name="sellingPrice"
              type="number"
              placeholder="Leave empty if bike isn't sold"
              value={form.sellingPrice}
              onChange={handleChange}
            />

          </div>

          <div className="rounded-2xl border bg-emerald-50 p-5">

            <p className="text-sm text-slate-500">
              Estimated Profit
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-700">

              {profit == null
                ? "--"
                : `₹${profit.toLocaleString()}`}

            </h2>

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
            className="min-w-[150px]"
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