"use client";

import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Image from "@/components/ui/image";
import InfiniteScrollLoader from "@/components/ui/infinite-scroll-loader";

type Bike = {
  id: string;
  image: string;
  model: string;
  number: string;
  year: string;
  kms: string;
  expectedSellingPrice: number;
  status: string;
};

export default function InventoryList({ status }: { status?: string }) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(nextPage), pageSize: "25" });
      if (status) query.set("status", status);
      const response = await fetch(`/api/bike?${query}`);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      // Replace on refresh, append on scroll, and deduplicate in case pages overlap.
      setBikes((current) => {
        const nextItems = nextPage === 1 ? data.items : [...current, ...data.items];
        return Array.from(
          new Map<string, Bike>(
            nextItems.map((bike: Bike) => [bike.id, bike] as [string, Bike])
          ).values()
        );
      });
      setPage(nextPage);
      // Pagination metadata is authoritative; item count alone is ambiguous at page boundaries.
      setHasNextPage(data.pagination.hasNextPage);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setBikes([]);
    setPage(0);
    setHasNextPage(true);
    loadPage(1);
  }, [loadPage]);

  if (loading && bikes.length === 0) {
    return (
      <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {bikes.map((bike) => (
          <Link
            key={bike.id}
            href={`/inventory/${bike.id}`}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition active:scale-[0.99]"
          >
            <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={bike.image}
                alt={bike.model}
                width={96}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 truncate">
                  {bike.number.toUpperCase()}
                </span>
                <span
                  className={`shrink-0 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                    bike.status === "Available"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-red-600 bg-red-50 text-red-700"
                  }`}
                >
                  {bike.status}
                </span>
              </div>

              <p className="mt-0.5 text-xs font-medium text-slate-600 truncate">
                {bike.model.toUpperCase()}
              </p>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {bike.year} • {bike.kms} km
                </span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{bike.expectedSellingPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <ChevronRight size={18} className="shrink-0 text-slate-400" />
          </Link>
        ))}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                      <Image
                        src={bike.image}
                        alt={bike.model}
                        width={80}
                        height={56}
                        className="h-full w-full"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                    {bike.number.toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{bike.model.toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bike.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{bike.kms}</td>
                  <td className="px-6 py-4 font-semibold whitespace-nowrap">
                    ₹{bike.expectedSellingPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${
                        bike.status === "Available"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-red-600 bg-red-50 text-red-700"
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

      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        loading={loading}
        onLoadMore={() => loadPage(page + 1)}
      />
    </>
  );
}