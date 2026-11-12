"use client";
import { Pencil, IndianRupee, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FinancialCardProps = {
  purchasePrice: number;
  sellingPrice?: number | null;
  onEdit?: () => void;
};

export default function FinancialCard({
  purchasePrice,
  sellingPrice,
  onEdit,
}: FinancialCardProps) {
  const sold =
    sellingPrice !== undefined &&
    sellingPrice !== null &&
    sellingPrice > 0;

  const profit = sold
    ? sellingPrice - purchasePrice
    : null;

  return (
    <Card className="rounded-3xl max-sm:rounded-2xl shadow-sm">
      <CardContent className="p-8 max-sm:p-4">
        <div className="mb-8 max-sm:mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl max-sm:text-base font-bold flex items-center gap-2 max-sm:gap-1.5">
              <IndianRupee className="h-5 w-5 max-sm:h-4 max-sm:w-4 text-blue-600" />
              Financial Information
            </h2>

            <p className="text-sm max-sm:text-xs text-slate-500">
              Purchase &amp; selling summary
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="max-sm:h-8 max-sm:text-xs"
          >
            <Pencil className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Edit
          </Button>
        </div>

        <div className="space-y-6 max-sm:space-y-3.5">
          <Row
            label="Purchase Price"
            value={`₹${purchasePrice.toLocaleString("en-IN")}`}
          />

          <Row
            label="Selling Price"
            value={
              sold
                ? `₹${sellingPrice.toLocaleString("en-IN")}`
                : "Not Sold"
            }
          />

          <div className="rounded-2xl max-sm:rounded-xl bg-emerald-50 border border-emerald-200 p-5 max-sm:p-3.5">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp size={18} className="max-sm:h-4 max-sm:w-4" />

              <span className="font-medium max-sm:text-xs">
                Estimated Profit
              </span>
            </div>

            <p className="mt-2 max-sm:mt-1 text-3xl max-sm:text-xl font-bold text-emerald-700">
              {sold
                ? `₹${profit?.toLocaleString("en-IN")}`
                : "--"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-3 max-sm:pb-2.5 max-sm:text-xs">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}