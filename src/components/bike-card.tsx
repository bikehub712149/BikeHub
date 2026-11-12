import Link from "next/link";
import { Bike } from "@/types/bike";
import { Calendar, Gauge } from "lucide-react";
import Image from "@/components/ui/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function BikeCard({
  id,
  number,
  model,
  year,
  kms,
  expectedSellingPrice,
  status,
  image,
}: Bike) {
  return (
    <Link href={`/inventory/${id}`} className="group block h-full">
      {/* 
        Added p-0 here! This forces the card to have NO padding, 
        ensuring the image touches the absolute top and side borders. 
      */}
      <Card className="p-0 flex h-full flex-col overflow-hidden rounded-2xl max-sm:rounded-xl !gap-0 border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl cursor-pointer">
        
        {/* Simplified Image Container */}
        <div className="h-50 max-sm:h-40 w-full relative shrink-0 bg-muted/20">
          <Image
            fill
            sizes="100vw"
            src={image}
            alt={model}
            className="h-full w-full object-cover block"
          />
        </div>

        <CardContent className="flex flex-1 flex-col space-y-2 max-sm:space-y-2.5 p-5 max-sm:p-3.5 uppercase!">
          {/* Header Info */}
          <div className="space-y-1 max-sm:space-y-0.5">
            <h3 className="text-xl max-sm:text-sm font-extrabold uppercase tracking-tight text-foreground line-clamp-1">
              {number.toUpperCase()}
            </h3>
            <p className="text-sm max-sm:text-xs font-medium text-muted-foreground line-clamp-1">
              {model.toUpperCase()}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 space-y-2 max-sm:space-y-0 gap-3 max-sm:gap-2 rounded-xl max-sm:rounded-lg border border-border/5 bg-slate-100 p-3 max-sm:p-2.5">
            <div className="flex flex-col gap-1 max-sm:gap-0.5">
              <span className="flex items-center gap-1.5 text-[10px] max-sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar size={14} className="text-primary/70 max-sm:size-3" />
                Year
              </span>
              <span className="text-sm max-sm:text-xs font-semibold text-foreground">
                {year}
              </span>
            </div>

            <div className="flex flex-col gap-1 max-sm:gap-0.5">
              <span className="flex items-center gap-1.5 text-[10px] max-sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                <Gauge size={14} className="text-primary/70 max-sm:size-3" />
                KMS
              </span>
              <span className="text-sm max-sm:text-xs font-semibold text-foreground">
                {kms}
              </span>
            </div>
          </div>

          {/* Footer: Price & Status */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] max-sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Expected Price
              </span>
              <span className="text-xl max-sm:text-sm font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                ₹{expectedSellingPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {String(status).toLowerCase() === "sold" ? (
              <Badge variant="sold" className="text-xs max-sm:text-[10px] font-bold tracking-wider">
                Sold
              </Badge>
            ) : (
              <Badge variant="available" className="text-xs max-sm:text-[10px] font-bold tracking-wider">
                Available
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}