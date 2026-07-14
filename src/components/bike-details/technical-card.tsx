"use client";
import { Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TechnicalCardProps = {
  bikeData: {
    number: string;
    model: string;
    year: number;
    kms: string;
    status: string;
    expectedSellingPrice: number;

    engineNumber?: string;
    chassisNumber?: string;
    ownerSerial?: string;
  };

  onEdit?: () => void;
};

export default function TechnicalCard({
  bikeData,
  onEdit,
}: TechnicalCardProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Technical Information</h2>

            <p className="text-sm text-slate-500">Bike specifications</p>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-x-10 gap-y-8">
          <Info title="Registration" value={bikeData.number} />

          <Info title="Model" value={bikeData.model} />

          <Info title="Manufacturing Year" value={bikeData.year} />

          <Info title="Kilometers" value={bikeData.kms} />

          <Info title="Engine Number" value={bikeData.engineNumber ?? "--"} />

          <Info title="Chassis Number" value={bikeData.chassisNumber ?? "--"} />

          <Info
            title="Owner Series"
            value={
              bikeData.ownerSerial === "1"
                ? "1st Owner"
                : bikeData.ownerSerial === "2"
                ? "2nd Owner"
                : bikeData.ownerSerial === "3"
                ? "3rd Owner"
                : bikeData.ownerSerial === "4"
                ? "4th Owner"
                : "--"
            }
          />

          <Info
            title="Expected Selling Price"
            value={`₹${bikeData.expectedSellingPrice}`}
          />

          <div>
            <p className="mb-2 text-sm text-slate-500">Status</p>

            <Badge
              className={
                bikeData.status === "Sold"
                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                  : "bg-green-100 text-green-700 hover:bg-green-100"
              }
            >
              {bikeData.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-sm text-slate-500">{title}</p>

      <h4 className="text-lg font-semibold text-slate-900">{value}</h4>
    </div>
  );
}
