"use client";

import { useEffect, useState, useTransition } from "react";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  bikeNumber: string;

  purchasePrice: number;

  sellingPrice?: number | null;
};

function formatNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("en-IN") : "";
}

export default function EditFinancialDialog({
  open,
  onOpenChange,
  bikeNumber,
  purchasePrice,
  sellingPrice,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [waitingForRefresh, setWaitingForRefresh] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    purchasePrice: "",
    sellingPrice: "",
  });

  useEffect(() => {
    setForm({
      purchasePrice: formatNumber(String(purchasePrice)),

      sellingPrice:
        sellingPrice != null
          ? formatNumber(String(sellingPrice))
          : "",
    });
  }, [purchasePrice, sellingPrice]);

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: formatNumber(e.target.value),
    }));
  }

  async function saveChanges() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/customers/edit/${encodeURIComponent(bikeNumber)}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            purchasePrice: Number(form.purchasePrice.replace(/,/g, "")),

            sellingPrice:
              form.sellingPrice === ""
                ? null
                : Number(form.sellingPrice.replace(/,/g, "")),
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      toast.success(
        "Financial information updated."
      );

      setWaitingForRefresh(true);
      startTransition(() => router.refresh());
    } catch {
      toast.error(
        "Failed to update financial information."
      );
      setLoading(false);
    }
  }

  const profit =
    form.sellingPrice === ""
      ? null
      : Number(form.sellingPrice.replace(/,/g, "")) -
        Number(form.purchasePrice.replace(/,/g, ""));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-hidden rounded-3xl p-0">

        <DialogHeader className="shrink-0 border-b bg-muted/20 px-7 py-6 gap-0">

          <DialogTitle className="flex items-center text-xl font-bold!">

            Edit Financial Information

          </DialogTitle>

          <DialogDescription>
            Update purchase and selling prices.
          </DialogDescription>

        </DialogHeader>

        <div className="min-h-0 space-y-6 overflow-y-auto px-7 py-6">

          <div className="space-y-2">

            <label className="mb-2 block text-sm font-medium">
              Purchase Price
            </label>

            <Input
              className="h-11"
              name="purchasePrice"
              type="text"
              inputMode="numeric"
              value={form.purchasePrice}
              onChange={handleChange}
            />

          </div>

          <div className="space-y-2">

            <label className="mb-2 block text-sm font-medium">
              Selling Price
            </label>

            <Input
              className="h-11"
              name="sellingPrice"
              type="text"
              inputMode="numeric"
              placeholder="Leave empty if bike isn't sold"
              value={form.sellingPrice}
              onChange={handleChange}
            />

          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

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

        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-7 py-4">

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={saveChanges}
            disabled={loading || waitingForRefresh || isPending}
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