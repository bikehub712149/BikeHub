import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import BikeGalleryClient from "./gallery-client";

import TechnicalCard from "@/components/bike-details/technical-card";
import FinancialCard from "@/components/bike-details/financial-card";
import PartyCard from "@/components/bike-details/party-card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getBikeById } from "@/lib/server/bike";
import { getCustomerByBikeId } from "@/lib/server/coustomer";

export default async function BikeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bike = await getBikeById(id);

  const transaction = bike ? await getCustomerByBikeId(bike.number) : null;

  const bikeData = bike ? JSON.parse(JSON.stringify(bike)) : null;

  const transactionData = transaction
    ? JSON.parse(JSON.stringify(transaction))
    : null;

  if (!bike) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bike Not Found</h1>

          <p className="mt-2 text-slate-500">
            This bike doesn't exist anymore.
          </p>

          <Link href="/inventory">
            <Button className="mt-6">Back to Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = bikeData?.images?.length
    ? bikeData.images
    : bikeData?.image
    ? [bikeData.image]
    : [];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/inventory"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{bikeData.model}</h1>

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

          <p className="mt-2 text-slate-500">
            Registration No. {bikeData.number}
          </p>
        </div>
      </div>

      {/* Gallery + Technical */}

      <div className="grid gap-8 xl:grid-cols-12">
        {/* Gallery */}

        <div className="xl:col-span-5">
          {/* Client wrapper because gallery uses useState */}

          <BikeGalleryClient images={images} />
        </div>

        {/* Technical */}

        <div className="space-y-8 xl:col-span-7">
          <TechnicalCard bikeData={bikeData} />

          {transaction && (
            <FinancialCard
              purchasePrice={transaction.purchasePrice}
              sellingPrice={transaction.sellingPrice}
            />
          )}
        </div>
      </div>

      {/* Seller & Buyer */}

      {transaction && (
        <div className="grid gap-8 xl:grid-cols-2">
          <PartyCard
            title="Seller Information"
            person={transaction.seller}
            documents={transaction.seller?.documents ?? []}
          />

          <PartyCard
            title="Buyer Information"
            person={transaction.buyer}
            documents={transaction.buyer?.documents ?? []}
            receipt={transaction.receiptId}
          />
        </div>
      )}

      {/* Quick Summary */}

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Purchase Price</p>

          <h2 className="mt-3 text-3xl font-bold">
            ₹{transaction ? transaction.purchasePrice.toLocaleString() : "--"}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Selling Price</p>

          <h2 className="mt-3 text-3xl font-bold">
            {transaction?.sellingPrice
              ? `₹${transaction.sellingPrice.toLocaleString()}`
              : "--"}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Profit</p>

          <h2 className="mt-3 text-3xl font-bold text-emerald-600">
            {transaction?.sellingPrice
              ? `₹${(
                  transaction.sellingPrice - transaction.purchasePrice
                ).toLocaleString()}`
              : "--"}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Current Status</p>

          <div className="mt-3">
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
      </div>
    </div>
  );
}
