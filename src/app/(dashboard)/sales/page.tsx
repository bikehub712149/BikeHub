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
  CalendarDays,
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
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
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
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().toISOString().slice(0, 7)
  );
  const [monthlyReport, setMonthlyReport] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    bikesSold: 0,
  });

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch(
          `/api/sales?page=1&pageSize=25&month=${selectedMonth}`
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        setSoldBikes(data.items);
        setSummary(data.summary);
        setMonthlyReport(
          data.monthlyReport ?? {
            totalRevenue: 0,
            totalProfit: 0,
            bikesSold: 0,
          }
        );
        setPage(1);
        setHasNextPage(data.pagination.hasNextPage);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, [selectedMonth]);

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
  const monthlyAverageProfit =
    monthlyReport.bikesSold > 0
      ? monthlyReport.totalProfit / monthlyReport.bikesSold
      : 0;

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

  function MonthPicker({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <label className="flex w-full items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm sm:w-auto">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Report month</span>
        <input
          type="month"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 bg-transparent text-sm font-semibold outline-none"
          aria-label="Select report month"
        />
      </label>
    );
  }

  function MonthlyReport({
    report,
    month,
    averageProfit,
  }: {
    report: { totalRevenue: number; totalProfit: number; bikesSold: number };
    month: string;
    averageProfit: number;
  }) {
    const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.06] to-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Monthly sales &amp; profit report</CardTitle>
          <CardDescription>{monthLabel} performance based on completed sales.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ReportMetric label="Sales revenue" value={formatCurrency(report.totalRevenue)} />
          <ReportMetric label="Net profit" value={formatCurrency(report.totalProfit)} tone="profit" />
          <ReportMetric
            label={`${report.bikesSold} bikes sold · avg. profit`}
            value={formatCurrency(Math.round(averageProfit))}
          />
        </CardContent>
      </Card>
    );
  }

  function ReportMetric({
    label,
    value,
    tone,
  }: {
    label: string;
    value: string;
    tone?: "profit";
  }) {
    return (
      <div className="rounded-xl border bg-background/80 p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-xl font-bold", tone === "profit" && "text-emerald-600")}>
          {value}
        </p>
      </div>
    );
  }

  if (!soldBikes || soldBikes.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-0 sm:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sales & Revenue</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your store&apos;s financial performance and sold vehicles.
            </p>
          </div>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>
        <MonthlyReport report={monthlyReport} month={selectedMonth} averageProfit={monthlyAverageProfit} />
        <div className="flex h-56 flex-col items-center justify-center gap-3 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 opacity-30" />
          <p>No bikes have been sold yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-0 sm:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Sales & Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your store&apos;s financial performance and sold vehicles.
          </p>
        </div>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <MonthlyReport report={monthlyReport} month={selectedMonth} averageProfit={monthlyAverageProfit} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sold Vehicles</CardTitle>
          <CardDescription>
            Complete record of all sold bikes with financial breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
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
                            <div className="font-semibold text-foreground">
                              {bike.number.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{bike.model.toUpperCase()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{bike.year}</div>
                        <div className="text-xs text-muted-foreground">
                          {bike.kms}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-primary">
                          {formatCurrency(salePrice)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-emerald-600">
                          +{formatCurrency(Math.round(profit))}
                        </span>
                      </td>
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4 text-right">
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