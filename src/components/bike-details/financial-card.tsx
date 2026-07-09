"use client"
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
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-600" />
              Financial Information
            </h2>

            <p className="text-sm text-slate-500">
              Purchase & selling summary
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">

          <Row
            label="Purchase Price"
            value={`₹${purchasePrice.toLocaleString()}`}
          />

          <Row
            label="Selling Price"
            value={
              sold
                ? `₹${sellingPrice.toLocaleString()}`
                : "Not Sold"
            }
          />

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">

            <div className="flex items-center gap-2 text-emerald-700">

              <TrendingUp size={18} />

              <span className="font-medium">
                Estimated Profit
              </span>

            </div>

            <p className="mt-2 text-3xl font-bold text-emerald-700">

              {sold
                ? `₹${profit?.toLocaleString()}`
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
    <div className="flex items-center justify-between border-b pb-3">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}