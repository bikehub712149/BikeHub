import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bike, Calendar, Gauge, IndianRupee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const bikes = {
  WB15XX1234: {
    id: "WB15XX1234",
    number: "WB-15-XX-1234",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2021,
    kms: "12,450 km",
    price: "1,45,000",
    status: "Available",
    image: "/bikes/bike1.jpg",
    owner: "Rahul Das",
    color: "Black",
    engine: "ENG7823423",
    chassis: "CHS9283723",
  },

  WB18AA4587: {
    id: "WB18AA4587",
    number: "WB-18-AA-4587",
    brand: "TVS",
    model: "Raider",
    year: 2023,
    kms: "4,300 km",
    price: "95,000",
    status: "Available",
    image: "/bikes/bike2.jpg",
    owner: "Sourav Pal",
    color: "Red",
    engine: "ENG923823",
    chassis: "CHS293823",
  },
};

export default async function BikeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = bikes[id as keyof typeof bikes];

  if (!bike) {
    return (
      <div className="text-center text-red-500">
        Bike not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Link
        href="/inventory"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-black"
      >
        <ArrowLeft size={18} />
        Back to Inventory
      </Link>

      <div>
        <h1 className="text-3xl font-bold">
          {bike.brand} {bike.model}
        </h1>

        <p className="text-muted-foreground">
          {bike.number}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        <Card className="rounded-2xl">

          <CardContent className="p-6">

            <Image
              src={bike.image}
              alt={bike.model}
              width={700}
              height={500}
              className="h-[420px] w-full rounded-xl object-cover"
            />

          </CardContent>

        </Card>

        <Card className="rounded-2xl">

          <CardContent className="space-y-5 p-6">

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Registration
              </span>

              <span className="font-semibold">
                {bike.number}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Brand
              </span>

              <span>{bike.brand}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Model
              </span>

              <span>{bike.model}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Year
              </span>

              <span>{bike.year}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Kilometers
              </span>

              <span>{bike.kms}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Price
              </span>

              <span>₹{bike.price}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Owner
              </span>

              <span>{bike.owner}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Color
              </span>

              <span>{bike.color}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Engine No.
              </span>

              <span>{bike.engine}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Chassis No.
              </span>

              <span>{bike.chassis}</span>
            </div>

            <div className="flex justify-between items-center">

              <span className="text-muted-foreground">
                Status
              </span>

              <Badge>
                {bike.status}
              </Badge>

            </div>

            <div className="flex gap-4 pt-4">

              <Button className="flex-1">
                Edit Bike
              </Button>

              <Button
                variant="outline"
                className="flex-1"
              >
                Sell Bike
              </Button>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}