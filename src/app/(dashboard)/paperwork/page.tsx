"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import Image from "@/components/ui/image";
import { useSearchParams } from "next/navigation";
import InfiniteScrollLoader from "@/components/ui/infinite-scroll-loader";

type Bike = {
  id: string;
  number: string;
  model: string;
  year: string;
  kms: string;
  image: string;
  buyer?: {
    name: string;
  };
  status: "Sold";
  paperwork: "Pending" | "Completed";
};

function PaperworkContent() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const searchParams = useSearchParams();

  const initialTab =
    searchParams.get("status") === "completed" ? "Completed" : "Pending";

  const [tab, setTab] = useState<"Pending" | "Completed">(initialTab);

  const fetchData = useCallback(async (nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/sales?page=${nextPage}&pageSize=25&paperwork=${tab.toLowerCase()}`
      );
      if (!res.ok) throw new Error("Failed to load paperwork");
      const data = await res.json();

      setBikes((current) => {
        const nextItems = append ? [...current, ...data.items] : data.items;
        return Array.from(
          new Map<string, Bike>(
            nextItems.map((item: Bike) => [item.id, item] as [string, Bike])
          ).values()
        );
      });
      setPage(nextPage);
      setHasNextPage(data.pagination.hasNextPage);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) fetchData(page + 1, true);
  }, [fetchData, hasNextPage, loadingMore, page]);

  async function completePaperwork() {
    if (!selectedBike) return;

    try {
      // Refresh the active tab after the API changes this bike to Completed.
      const res = await fetch(`/api/paperwork/${encodeURIComponent(selectedBike.number)}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to complete paperwork");

      setSelectedBike(null);
      fetchData();
    } catch (err) {
      // Keep the dialog open so a failed completion can be retried.
      console.error(err);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-1 sm:p-4 pb-32">
      {/* Header */}
      <div className="mb-6 max-sm:mb-4">
        <h1 className="text-2xl max-sm:text-xl font-bold tracking-tight text-slate-900">
          Paperwork Management
        </h1>

        <p className="mt-1 max-sm:mt-0.5 text-sm max-sm:text-xs text-slate-500">
          Manage ownership transfer and paperwork completion.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 max-sm:mb-4 flex w-max max-w-full overflow-x-auto gap-2 max-sm:gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button
          onClick={() => setTab("Pending")}
          className={`rounded-lg px-4 max-sm:px-3.5 sm:px-5 py-2 max-sm:py-1.5 text-xs sm:text-sm font-medium transition ${
            tab === "Pending"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setTab("Completed")}
          className={`rounded-lg px-4 max-sm:px-3.5 sm:px-5 py-2 max-sm:py-1.5 text-xs sm:text-sm font-medium transition ${
            tab === "Completed"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Loading State OR Content */}
      {loading ? (
        <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Mobile Cards (< md) */}
          <div className="space-y-3 max-sm:space-y-2.5 md:hidden">
            {bikes.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-12 max-sm:py-8 text-center text-sm max-sm:text-xs text-slate-500">
                No {tab.toLowerCase()} paperwork found.
              </div>
            ) : (
              bikes.map((bike) => (
                <div
                  key={bike.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="size-15 shrink-0 overflow-hidden rounded-xl border">
                    <Image
                      src={bike.image}
                      alt={bike.model}
                      width={60}
                      height={60}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {bike.number.toUpperCase()}
                      </span>
                      <span
                        className={`shrink-0 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                          bike.paperwork === "Pending"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {bike.paperwork}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-slate-600 truncate">
                      {bike.model.toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                      Buyer: <span className="font-medium text-slate-700">{bike.buyer?.name || "-"}</span>
                    </p>
                  </div>

                  {tab === "Pending" && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 size-9 rounded-xl !p-0"
                      onClick={() => setSelectedBike(bike)}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Photo</th>
                    <th className="px-6 py-4">Registration</th>
                    <th className="px-6 py-4">Model</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Status</th>
                    {/* Only show Action column if we are on the Pending tab */}
                    {tab === "Pending" && (
                      <th className="px-6 py-4 text-right">Action</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {bikes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tab === "Pending" ? 6 : 5}
                        className="py-12 text-center text-slate-500"
                      >
                        No {tab.toLowerCase()} paperwork found.
                      </td>
                    </tr>
                  ) : (
                    bikes.map((bike) => (
                      <tr key={bike.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="h-14 w-20 overflow-hidden rounded-lg border">
                            <Image
                              src={bike.image}
                              alt={bike.model}
                              width={80}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold whitespace-nowrap">
                          {bike.number.toUpperCase()}
                        </td>

                        <td className="px-6 py-4">{bike.model.toUpperCase()}</td>

                        <td className="px-6 py-4">{bike.buyer?.name || "-"}</td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${
                              bike.paperwork === "Pending"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {bike.paperwork}
                          </span>
                        </td>

                        {/* Only show the Check action button if tab is Pending */}
                        {tab === "Pending" && (
                          <td className="px-6 py-4 text-right">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => setSelectedBike(bike)}
                            >
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        loading={loadingMore}
        onLoadMore={loadMore}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedBike}
        onOpenChange={() => setSelectedBike(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Paperwork?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure the ownership transfer and all documents for{" "}
              <strong>{selectedBike?.number}</strong> have been completed?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={completePaperwork}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PaperworkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaperworkContent />
    </Suspense>
  );
}
