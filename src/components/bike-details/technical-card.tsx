"use client";
import { Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TechnicalCardProps = {
  bikeData: {
    number: string;
    model: string;
    year: string;
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
    <Card className="rounded-3xl max-sm:rounded-2xl shadow-sm">
      <CardContent className="p-8 max-sm:p-4">
        <div className="mb-8 max-sm:mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl max-sm:text-base font-bold">Technical Information</h2>

            <p className="text-sm max-sm:text-xs text-slate-500">Bike specifications</p>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit} className="max-sm:h-8 max-sm:text-xs">
            <Pencil className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-10 max-sm:gap-x-4 gap-y-8 max-sm:gap-y-4 uppercase!">
          <Info title="Registration" value={bikeData.number.toUpperCase()} />

          <Info title="Model" value={bikeData.model.toUpperCase()} />

          <Info title="Registration Year" value={bikeData.year} />

          <Info title="Kilometers" value={bikeData.kms} />

          <Info title="Engine Number" value={(bikeData.engineNumber ?? "--").toUpperCase()} />

          <Info title="Chassis Number" value={(bikeData.chassisNumber ?? "--").toUpperCase()} />

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
            value={`₹${bikeData.expectedSellingPrice.toLocaleString("en-IN")}`}
          />

          <div>
            <p className="mb-2 max-sm:mb-1 text-sm max-sm:text-[11px] text-slate-500">Status</p>

            {bikeData.status === "Sold" ? (
              <Badge variant="sold" className="text-xs max-sm:text-[10px] font-bold tracking-wider">
                Sold
              </Badge>
            ) : (
              <Badge variant="available" className="text-xs max-sm:text-[10px] font-bold tracking-wider">
                Available
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 max-sm:mb-0.5 text-sm max-sm:text-[11px] text-slate-500">{title}</p>

      <div className="overflow-x-auto">
        <h4 className="text-lg max-sm:text-sm font-semibold text-slate-900">
          {value}
        </h4>
      </div>
    </div>
  );
}
