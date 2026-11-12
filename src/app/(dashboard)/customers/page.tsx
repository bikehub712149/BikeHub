"use client";
import Image from "@/components/ui/image";
import Link from "next/link";
import { FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useState } from "react";
import InfiniteScrollLoader from "@/components/ui/infinite-scroll-loader";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Tracks which specific receipt is currently downloading
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers?page=1&pageSize=25");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCustomers(data.items);
        setPage(1);
        setHasNextPage(data.pagination.hasNextPage);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/customers?page=${nextPage}&pageSize=25`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomers((current) =>
        Array.from(
          new Map([...current, ...data.items].map((item) => [item.id, item])).values()
        )
      );
      setPage(nextPage);
      setHasNextPage(data.pagination.hasNextPage);
    } finally {
      setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, page]);

  // Download through a blob for a filename, with a direct URL fallback for remote-file failures.
  const handleDownload = async (url: string, desiredFileName: string, recordId: string) => {
    if (!url) return;

    // Start the spinner for this specific button
    setDownloadingId(recordId);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = localUrl;
      link.download = desiredFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(localUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      // Stop the spinner
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-sm:p-1 pb-24">
      <div className="mb-8 max-sm:mb-4">
        <h1 className="text-2xl max-sm:text-xl font-bold">Customer CRM</h1>
        <p className="mt-1 max-sm:mt-0.5 text-sm max-sm:text-xs text-slate-500">
          Track every bike from seller to buyer.
        </p>
      </div>

      <div className="space-y-6 max-sm:space-y-3">
        {customers.map((record) => {
          const bike = record.bike;

          if (!bike) return null;

          return (
            <Card
              key={record.id}
              className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="px-10 max-md:px-3.5 max-sm:py-3.5">
                <div className="flex items-center gap-5 max-md:gap-3.5 max-md:flex-col max-md:items-stretch">
                  {/* Bike Image */}
                  <div className="flex items-center gap-4 max-sm:gap-3">
                    <Image
                      src={bike.image}
                      alt={bike.model}
                      width={150}
                      height={100}
                      className="h-35 w-46 max-sm:size-16 shrink-0 rounded-xl object-cover border"
                    />
                    <div className="md:hidden min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold">
                          {bike.number.toUpperCase()}
                        </h3>
                        {bike.status === "Sold" ? (
                          <Badge variant="sold" className="text-[10px] font-bold tracking-wider">
                            Sold
                          </Badge>
                        ) : (
                          <Badge variant="available" className="text-[10px] font-bold tracking-wider">
                            Available
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {bike.model.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="flex-1">
                    <div className="flex max-md:hidden items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{bike.number.toUpperCase()}</h3>

                      {bike.status === "Sold" ? (
                        <Badge variant="sold" className="text-xs font-bold tracking-wider">
                          Sold
                        </Badge>
                      ) : (
                        <Badge variant="available" className="text-xs font-bold tracking-wider">
                          Available
                        </Badge>
                      )}
                    </div>

                    <p className="max-md:hidden text-sm text-slate-500 mb-5">
                      {bike.model.toUpperCase()}
                    </p>

                    <div className="flex items-start max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
                      {/* Seller */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs max-sm:text-[10px] uppercase tracking-wider text-slate-400 mb-2 max-sm:mb-1">
                          Bought From
                        </p>
                        <h4 className="font-semibold max-sm:text-xs text-slate-900 truncate">
                          {record.seller.name}
                        </h4>
                        <p className="text-sm max-sm:text-xs text-slate-500">
                          {record.seller.phone}
                        </p>
                        <p className="text-xs max-sm:text-[11px] text-slate-400 mt-1 max-sm:mt-0.5 line-clamp-2">
                          {record.seller.address}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="mx-8 h-20 w-px bg-slate-400 max-sm:hidden" />

                      {/* Buyer */}
                      <div className="flex-1 min-w-0 max-sm:border-l max-sm:border-slate-200 max-sm:pl-3">
                        <p className="text-xs max-sm:text-[10px] uppercase tracking-wider text-slate-400 mb-2 max-sm:mb-1">
                          Sold To
                        </p>

                        {record.buyer ? (
                          <>
                            <h4 className="font-semibold max-sm:text-xs text-slate-900 truncate">
                              {record.buyer.name}
                            </h4>
                            <p className="text-sm max-sm:text-xs text-slate-500">
                              {record.buyer.phone}
                            </p>
                            <p className="text-xs max-sm:text-[11px] text-slate-400 mt-1 max-sm:mt-0.5 line-clamp-2">
                              {record.buyer.address}
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold max-sm:text-xs text-slate-400">
                              Not Sold Yet
                            </h4>
                            <p className="text-sm max-sm:text-xs text-slate-400">
                              Waiting for buyer
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Buttons */}
                  <div className="flex w-36 flex-col gap-3 max-md:gap-2 max-md:w-full max-md:flex-row">
                    <Link href={`/inventory/${bike.id}`} className="max-md:flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-2 rounded-xl p-4 py-6 max-sm:py-2 max-sm:h-9 max-sm:text-xs transition duration-300 cursor-pointer"
                      >
                        View Bike
                      </Button>
                    </Link>

                    {/* RECEIPT BUTTON WITH LOADING STATE */}
                    {record.buyer && record.receipt ? (
                      <Button
                        disabled={downloadingId === record.id}
                        onClick={() =>
                          handleDownload(
                            record.receipt,
                            `${bike.number}-receipt.jpg`,
                            record.id
                          )
                        }
                        className="w-full max-md:flex-1 rounded-xl p-4 py-6 max-sm:py-2 max-sm:h-9 max-sm:text-xs transition duration-300 cursor-pointer"
                      >
                        {downloadingId === record.id ? (
                          <Loader2 className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5 animate-spin" />
                        ) : (
                          <Download className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
                        )}
                        Receipt
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full max-md:flex-1 rounded-xl p-4 py-6 max-sm:py-2 max-sm:h-9 max-sm:text-xs transition duration-300 cursor-pointer"
                      >
                        <FileText className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        loading={loadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}