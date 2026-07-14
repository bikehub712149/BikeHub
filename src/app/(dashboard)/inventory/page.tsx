import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { getAllBikes } from "@/lib/server/bike";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Inventory Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Browse and manage all vehicles in your inventory.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2 w-max rounded-xl border border-slate-200 bg-slate-100 p-1">
        <Link
          href="/inventory"
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
            !status
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          All Bikes
        </Link>

        <Link
          href="/inventory?status=available"
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
            status === "available"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Available
        </Link>

        <Link
          href="/inventory?status=sold"
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
            status === "sold"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Sold
        </Link>
      </div>

      {/* 
        Adding a key based on the 'status' forces Suspense to re-trigger 
        its fallback loader whenever the filter changes. 
      */}
      <Suspense key={status ?? "all"} fallback={<SimpleLoader />}>
        <InventoryTable status={status} />
      </Suspense>
    </div>
  );
}

// ------------------------------------------------------
// 1. Data Fetching Component
// ------------------------------------------------------
async function InventoryTable({ status }: { status?: string }) {
  const allBikes = await getAllBikes();

  const bikes =
    status === "available"
      ? allBikes.filter((bike) => bike.status === "Available")
      : status === "sold"
      ? allBikes.filter((bike) => bike.status === "Sold")
      : allBikes;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="w-24 px-6 py-4">Photo</th>
              <th className="px-6 py-4">Registration</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Year</th>
              <th className="px-6 py-4">Kilometers</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {bikes.map((bike) => (
              <tr key={bike.id} className="group transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={bike.image}
                      alt={bike.model}
                      width={80}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {bike.number}
                </td>
                <td className="px-6 py-4">{bike.model}</td>
                <td className="px-6 py-4">{bike.year}</td>
                <td className="px-6 py-4">{bike.kms}</td>
                <td className="px-6 py-4 font-semibold">
                  ₹{bike.expectedSellingPrice.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${
                      bike.status === "Available"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {bike.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/inventory/${bike.id}`}
                    className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// 2. Simple Loading Fallback
// ------------------------------------------------------
function SimpleLoader() {
  return (
    <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}