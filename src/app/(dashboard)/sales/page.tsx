// app/sales/page.tsx
"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch("/api/sales");

        if (!res.ok) throw new Error();

        const data = await res.json();

        setSoldBikes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  // Calculate total revenue
  const totalRevenue = soldBikes.reduce(
    (sum, bike) => sum + (bike.sellingPrice || 0),
    0
  );

  // Calculate profit
  const totalProfit = soldBikes.reduce(
    (sum, bike) => sum + ((bike.sellingPrice || 0) - (bike.purchasePrice || 0)),
    0
  );

  const averageProfit =
    soldBikes.length > 0 ? totalProfit / soldBikes.length : 0;

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
      value: soldBikes.length.toString(),
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
      <div className="flex flex-col gap-8 p-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales & Revenue</h1>
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
    <div className="flex flex-col gap-8 p-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your store&apos;s financial performance and sold vehicles.
          </p>
        </div>
      </div>

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
                          <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                            <img
                              src={bike.image}
                              alt={bike.model}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {bike.number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{bike.model}</div>
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
    </div>
  );
}