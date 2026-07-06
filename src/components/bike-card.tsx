import Link from "next/link";
import Image from "next/image";
import { Bike } from "@/types/bike";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";


export default function BikeCard({
  id,
  number,
  model,
  year,
  kms,
  price,
  status,
  image,
}: Bike) {
  return (
    <Link href={`/inventory/${id}`}>
      <Card className="overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer">
        <img
          src={image}
          alt={model}
          width={500}
          height={300}
          className="h-48 w-full object-cover"
        />

        <CardContent className="space-y-3 p-5">
          <div>
            <h3 className="text-xl font-bold">{number}</h3>

            <p className="text-muted-foreground">{model}</p>
          </div>

          <div className="grid grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Year</p>
              <p>{year}</p>
            </div>

            <div>
              <p className="text-muted-foreground">KMS</p>
              <p>{kms}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">₹{price}</span>

            <Badge variant={status === "Available" ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
