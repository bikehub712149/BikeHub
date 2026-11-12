// app/sales/page.tsx
"use client";

import { useCallback, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Receipt,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";
import InfiniteScrollLoader from "@/components/ui/infinite-scroll-loader";

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

// Components
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  className,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  className?: string;
}) => (
  <Card className={cn("relative overflow-hidden", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 text-primary shrink-0">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-lg sm:text-2xl font-bold break-words">{value}</div>
      {trend !== undefined && (
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1",
              trend >= 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            <ArrowUpRight
              className={cn("h-3 w-3", trend < 0 && "rotate-180")}
            />
            {Math.abs(trend)}%
          </span>{" "}
          {trendLabel || "from last month"}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function SalesPage() {
  const [soldBikes, setSoldBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalProfit: 0, bikesSold: 0 });

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/sales?page=1&pageSize=25");

        if (!res.ok) throw new Error();

        const data = await res.json();

        setSoldBikes(data.items);
        setSummary(data.summary);
        setPage(1);
        setHasNextPage(data.pagination.hasNextPage);
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/sales?page=${nextPage}&pageSize=25`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSoldBikes((current) =>
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

  // Calculate total revenue
  const totalRevenue = summary.totalRevenue;
  const totalProfit = summary.totalProfit;

  const averageProfit =
    summary.bikesSold > 0 ? totalProfit / summary.bikesSold : 0;

  // Placeholder trend data
  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: Wallet,
    },
    {
      title: "Net Profit",
      value: formatCurrency(totalProfit),
      icon: TrendingUp,
    },
    {
      title: "Bikes Sold",
      value: summary.bikesSold.toString(),
      icon: ShoppingBag,
    },
    {
      title: "Avg Profit per Bike",
      value: formatCurrency(Math.round(averageProfit)),
      icon: Receipt,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!soldBikes || soldBikes.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-1 sm:p-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales &amp; Revenue</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your store&apos;s financial performance and sold vehicles.
            </p>
          </div>
        </div>
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 opacity-30" />
          <p>No bikes have been sold yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-1 sm:p-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales &amp; Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your store&apos;s financial performance and sold vehicles.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Sales List / Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sold Vehicles</CardTitle>
          <CardDescription>
            Complete record of all sold bikes with financial breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards (< md) */}
          <div className="space-y-3 md:hidden">
            {soldBikes.map((bike) => {
              const salePrice = bike.sellingPrice || 0;
              const profit = (bike.sellingPrice || 0) - (bike.purchasePrice || 0);

              return (
                <div
                  key={bike.id}
                  className="rounded-2xl border border-slate-200 p-3.5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-20 relative shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        fill
                        sizes="80px"
                        src={bike.image}
                        alt={bike.model}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-foreground truncate">
                        {bike.number.toUpperCase()}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {bike.model.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {bike.year} • {bike.kms} km
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Sold</p>
                      <p className="font-bold text-primary">{formatCurrency(salePrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Profit</p>
                      <p className="font-bold text-emerald-600">
                        +{formatCurrency(Math.round(profit))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Date</p>
                      <p className="font-medium text-slate-700">
                        {bike.saleDate
                          ? new Date(bike.saleDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {bike.receipt && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium"
                      onClick={() =>
                        window.open(bike.receipt, "_blank", "noopener,noreferrer")
                      }
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Preview Receipt
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Year / KMs
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sold Price
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Est. Profit
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {soldBikes.map((bike) => {
                  const salePrice = bike.sellingPrice || 0;
                  const profit = (bike.sellingPrice || 0) - (bike.purchasePrice || 0);

                  return (
                    <tr
                      key={bike.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 relative flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <Image
                              fill
                              sizes="100vw"
                              src={bike.image}
                              alt={bike.model}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground whitespace-nowrap">
                              {bike.number.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{bike.model.toUpperCase()}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm">{bike.year}</div>
                        <div className="text-xs text-muted-foreground">
                          {bike.kms}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-primary">
                          {formatCurrency(salePrice)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-600">
                          +{formatCurrency(Math.round(profit))}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {bike.saleDate
                            ? new Date(bike.saleDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!bike.receipt}
                          className="text-xs font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bike.receipt) {
                              window.open(bike.receipt, "_blank", "noopener,noreferrer");
                            }
                          }}
                        >
                          {bike.receipt ? (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Preview Receipt
                            </>
                          ) : (
                            "No Receipt"
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <InfiniteScrollLoader
        hasNextPage={hasNextPage}
        loading={loadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}