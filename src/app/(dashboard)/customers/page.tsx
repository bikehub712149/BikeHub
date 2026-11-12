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
      <div className="mb-8 max-sm:mb-6">
        <h1 className="text-2xl font-bold">Customer CRM</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track every bike from seller to buyer.
        </p>
      </div>

      <div className="space-y-6 max-sm:space-y-4">
        {customers.map((record) => {
          const bike = record.bike;

          if (!bike) return null;

          return (
            <Card
              key={record.id}
              className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="px-10 max-md:px-4">
                <div className="flex items-center gap-5 max-md:flex-col max-md:items-stretch">
                  {/* Bike Image */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={bike.image}
                      alt={bike.model}
                      width={150}
                      height={100}
                      className="h-35 w-46 max-sm:h-24 max-sm:w-32 shrink-0 rounded-xl object-cover border"
                    />
                    <div className="md:hidden min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold">
                          {bike.number.toUpperCase()}
                        </h3>
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
                      <p className="text-xs text-slate-500">
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

                    <div className="flex items-start max-sm:flex-col max-sm:gap-4">
                      {/* Seller */}
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                          Bought From
                        </p>
                        <h4 className="font-semibold text-slate-900">
                          {record.seller.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {record.seller.phone}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {record.seller.address}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="mx-8 h-20 w-px bg-slate-400 max-sm:mx-0 max-sm:h-px max-sm:w-full max-sm:bg-slate-200" />

                      {/* Buyer */}
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                          Sold To
                        </p>

                        {record.buyer ? (
                          <>
                            <h4 className="font-semibold text-slate-900">
                              {record.buyer.name}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {record.buyer.phone}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {record.buyer.address}
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-semibold text-slate-400">
                              Not Sold Yet
                            </h4>
                            <p className="text-sm text-slate-400">
                              Waiting for buyer
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Buttons */}
                  <div className="flex w-36 flex-col gap-3 max-md:w-full max-md:flex-row">
                    <Link href={`/inventory/${bike.id}`} className="max-md:flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-2 rounded-xl p-4 py-6 transition duration-300 cursor-pointer"
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
                        className="w-full max-md:flex-1 rounded-xl p-4 py-6 transition duration-300 cursor-pointer"
                      >
                        {downloadingId === record.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Receipt
                      </Button>
                    ) : (
                      <Button
                        disabled
                        className="w-full max-md:flex-1 rounded-xl p-4 py-6 transition duration-300 cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
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