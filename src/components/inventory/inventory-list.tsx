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
      setBikes((current) => {
        const nextItems = nextPage === 1 ? data.items : [...current, ...data.items];
        return Array.from(
          new Map<string, Bike>(
            nextItems.map((bike: Bike) => [bike.id, bike] as [string, Bike])
          ).values()
        );
      });
      setPage(nextPage);
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
    return <div className="flex h-[calc(100vh-16rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="w-24 px-6 py-4">Photo</th><th className="px-6 py-4">Registration</th><th className="px-6 py-4">Model</th><th className="px-6 py-4">Year</th><th className="px-6 py-4">Kilometers</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {bikes.map((bike) => <tr key={bike.id} className="group transition hover:bg-slate-50">
                <td className="px-6 py-4"><div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200"><Image src={bike.image} alt={bike.model} width={80} height={56} className="h-full w-full" /></div></td>
                <td className="px-6 py-4 font-semibold text-slate-900">{bike.number.toUpperCase()}</td><td className="px-6 py-4">{bike.model.toUpperCase()}</td><td className="px-6 py-4">{bike.year}</td><td className="px-6 py-4">{bike.kms}</td><td className="px-6 py-4 font-semibold">₹{bike.expectedSellingPrice.toLocaleString()}</td>
                <td className="px-6 py-4"><span className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${bike.status === "Available" ? "border-green-600 bg-green-50 text-green-700" : "border-red-600 bg-red-50 text-red-700"}`}>{bike.status}</span></td>
                <td className="px-6 py-4 text-right"><Link href={`/inventory/${bike.id}`} className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"><ChevronRight size={20} /></Link></td>
              </tr>)}
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