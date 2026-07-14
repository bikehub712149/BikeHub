"use client";
import Image from "next/image";
import Link from "next/link";
import { FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tracks which specific receipt is currently downloading
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  // Updated to accept the recordId so we can track the loading state
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
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
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
    <div className="flex-1 p-4 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customer CRM</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track every bike from seller to buyer.
        </p>
      </div>

      <div className="space-y-6">
        {customers.map((record) => {
          const bike = record.bike;

          if (!bike) return null;

          return (
            <Card
              key={record.id}
              className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="px-10">
                <div className="flex items-center gap-5">
                  {/* Bike Image */}
                  <img
                    src={bike.image}
                    alt={bike.model}
                    width={150}
                    height={100}
                    className="h-28 w-40 rounded-xl object-cover border"
                  />

                  {/* Information */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{bike.number}</h3>

                      <Badge
                        className={
                          record.buyer
                            ? "bg-red-100 text-red-700 hover:bg-red-100 p-3 text-xs"
                            : "bg-green-100 text-green-700 hover:bg-green-100 p-3 text-xs"
                        }
                      >
                        {record.buyer ? "Sold" : "Available"}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-500 mb-5">{bike.model}</p>

                    <div className="flex items-start">
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
                      <div className="mx-8 h-20 w-px bg-slate-500" />

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
                  <div className="flex w-36 flex-col gap-3">
                    <Link href={`/inventory/${bike.id}`}>
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
                        className="w-full rounded-xl p-4 py-6 transition duration-300 cursor-pointer"
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
                        className="w-full rounded-xl p-4 py-6 transition duration-300 cursor-pointer"
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
    </div>
  );
}