import Link from "next/link";
import { Bike } from "@/types/bike";
import { Calendar, Gauge } from "lucide-react";
import Image from "next/image";

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
      <Card className="p-0 flex h-full flex-col overflow-hidden rounded-2xl !gap-0 border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl cursor-pointer">
        
        {/* Simplified Image Container */}
        <div className="h-50 w-full relative shrink-0 bg-muted/20">
          <Image
            fill
            src={image}
            alt={model}
            className="h-full w-full object-cover block"
          />
        </div>

        <CardContent className="flex flex-1 flex-col space-y-2 p-5">
          {/* Header Info */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-foreground line-clamp-1">
              {number}
            </h3>
            <p className="text-sm font-medium text-muted-foreground line-clamp-1">
              {model}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 space-y-2 gap-3 rounded-xl border border-border/5 bg-slate-100 p-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar size={14} className="text-primary/70" />
                Year
              </span>
              <span className="text-sm font-semibold text-foreground">
                {year}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Gauge size={14} className="text-primary/70" />
                KMS
              </span>
              <span className="text-sm font-semibold text-foreground">
                {kms}
              </span>
            </div>
          </div>

          {/* Footer: Price & Status */}
          <div className=" flex items-end justify-between">
            <div className="flex flex-col">
              <span className=" text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Expected Price
              </span>
              <span className="text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
                ₹{expectedSellingPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <Badge
              variant={status === "Available" ? "default" : "secondary"}
              className="px-5 py-3.5 rounded-md text-xs font-bold tracking-wide shadow-sm"
            >
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}