"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import BikeGalleryClient from "./gallery-client";

import TechnicalCard from "@/components/bike-details/technical-card";
import FinancialCard from "@/components/bike-details/financial-card";
import PartyCard from "@/components/bike-details/party-card";

import DeleteBikeDialog from "@/components/dialogs/delete-bike-dialog";
import EditTechnicalDialog from "@/components/dialogs/edit-technical-dialog";
import EditFinancialDialog from "@/components/dialogs/edit-financial-dialog";
import EditPartyDialog from "@/components/dialogs/edit-party-dialog";

import { Badge } from "@/components/ui/badge";

export default function BikeDetailsClient({
  bike,
  transaction,
}: {
  bike: any;
  transaction: any;
}) {
  const images = bike?.images?.length
    ? bike.images
    : bike?.image
    ? [bike.image]
    : [];

  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [sellerOpen, setSellerOpen] = useState(false);
  const [buyerOpen, setBuyerOpen] = useState(false);

  return (
    <>
      {/* ---------------- Dialogs ---------------- */}

      <EditTechnicalDialog
        open={technicalOpen}
        onOpenChange={setTechnicalOpen}
        bike={bike}
      />

      {transaction && (
        <>
          <EditFinancialDialog
            open={financialOpen}
            onOpenChange={setFinancialOpen}
            bikeNumber={bike.number}
            purchasePrice={transaction.purchasePrice}
            sellingPrice={transaction.sellingPrice}
          />

          <EditPartyDialog
            open={sellerOpen}
            onOpenChange={setSellerOpen}
            bikeNumber={bike.number}
            type="seller"
            person={transaction.seller}
          />

          <EditPartyDialog
            open={buyerOpen}
            onOpenChange={setBuyerOpen}
            bikeNumber={bike.number}
            type="buyer"
            person={transaction.buyer}
          />
        </>
      )}

      {/* ---------------- Page ---------------- */}

      <div className="space-y-8 p-8">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/inventory"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-black"
            >
              <ArrowLeft size={16} />
              Back to Inventory
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">{bike.model}</h1>

              <Badge
                className={
                  bike.status === "Sold"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }
              >
                {bike.status}
              </Badge>
            </div>

            <p className="mt-2 text-slate-500">
              Registration No. {bike.number}
            </p>
          </div>

          <DeleteBikeDialog
            bikeId={bike.id}
            bikeNumber={bike.number}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-8 items-start">
          <div className="sticky top-24">
            <BikeGalleryClient images={images} />
          </div>

          <div className="flex flex-col gap-6">
            <TechnicalCard
              bikeData={bike}
              onEdit={() => setTechnicalOpen(true)}
            />

            {transaction && (
              <FinancialCard
                purchasePrice={transaction.purchasePrice}
                sellingPrice={transaction.sellingPrice}
                onEdit={() => setFinancialOpen(true)}
              />
            )}
          </div>
        </div>

        {transaction && (
          <div className="grid gap-6 lg:grid-cols-2">
            <PartyCard
              title="Seller Information"
              person={transaction.seller}
              bikeNumber={bike.number}
              documents={transaction.seller?.documents ?? []}
              onEdit={() => setSellerOpen(true)}
            />

            <PartyCard
              title="Buyer Information"
              person={transaction.buyer}
              bikeNumber={bike.number}
              documents={transaction.buyer?.documents ?? []}
              receipt={transaction.receipt}
              saleDate={transaction.saleDate}
              onEdit={() => setBuyerOpen(true)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Purchase Price
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              ₹{transaction ? transaction.purchasePrice : "--"}
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Selling Price
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {transaction?.sellingPrice
                ? `₹${transaction.sellingPrice}`
                : "--"}
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Profit
            </p>

            <h2 className="mt-3 text-3xl font-bold text-emerald-600">
              {transaction?.sellingPrice
                ? `₹${
                    transaction.sellingPrice -
                    transaction.purchasePrice
                  }`
                : "--"}
            </h2>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Current Status
            </p>

            <div className="mt-3">
              <Badge
                className={
                  bike.status === "Sold"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-green-100 text-green-700 hover:bg-green-100"
                }
              >
                {bike.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}