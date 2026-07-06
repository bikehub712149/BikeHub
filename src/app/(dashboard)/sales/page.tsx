// app/sales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Receipt,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { bikes } from '@/data/bikes';
import { getAllBikes } from '@/lib/bikes';
import type { Bike } from '@/types/bike';

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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
  <Card className={cn('relative overflow-hidden', className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend !== undefined && (
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              'inline-flex items-center gap-1',
              trend >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            <ArrowUpRight
              className={cn(
                'h-3 w-3',
                trend < 0 && 'rotate-180'
              )}
            />
            {Math.abs(trend)}%
          </span>
          {' '}
          {trendLabel || 'from last month'}
        </p>
      )}
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: Bike['status'] }) => {
  const variants = {
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Sold: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels = {
    Available: 'Available',
    Pending: 'Pending RC',
    Sold: 'Sold',
  };

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 px-2.5 py-1 font-semibold', variants[status])}
    >
      {status === 'Sold' && <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
      {status === 'Available' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {status === 'Pending' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {labels[status]}
    </Badge>
  );
};

export default function SalesPage() {
  const [allBikes, setAllBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBikes = async () => {
      try {
        const data = await getAllBikes();
        setAllBikes(data);
      } catch (error) {
        console.error('Failed to load bikes:', error);
        // Fallback to imported bikes if API fails
        setAllBikes(bikes);
      } finally {
        setLoading(false);
      }
    };
    loadBikes();
  }, []);

  const soldBikes = allBikes.filter((bike) => bike.status === 'Sold');

  // Calculate total revenue (assuming price is in INR)
  const totalRevenue = soldBikes.reduce(
    (sum, bike) => sum + parseInt(bike.price || '0'),
    0
  );

  // Calculate profit (assuming 30% margin for demo, you can adjust this)
  const totalProfit = soldBikes.reduce((sum, bike) => {
    const salePrice = parseInt(bike.price || '0');
    const purchasePrice = salePrice * 0.7; // 30% margin assumption
    return sum + (salePrice - purchasePrice);
  }, 0);

  const averageProfit = soldBikes.length > 0 ? totalProfit / soldBikes.length : 0;

  // Placeholder trend data
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: Wallet,
      trend: 12.5,
      trendLabel: 'vs last month',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(totalProfit),
      icon: TrendingUp,
      trend: 8.2,
      trendLabel: 'vs last month',
    },
    {
      title: 'Bikes Sold',
      value: soldBikes.length.toString(),
      icon: ShoppingBag,
      trend: 5,
      trendLabel: 'vs last month',
    },
    {
      title: 'Avg Profit per Bike',
      value: formatCurrency(Math.round(averageProfit)),
      icon: Receipt,
      trend: 3.7,
      trendLabel: 'vs last month',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
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
            trend={stat.trend}
            trendLabel={stat.trendLabel}
          />
        ))}
      </div>

      {/* Sales Table - Using div-based table to avoid shadcn table dependency */}
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
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {soldBikes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No sold vehicles yet.
                    </td>
                  </tr>
                ) : (
                  soldBikes.map((bike) => {
                    const salePrice = parseInt(bike.price || '0');
                    const estimatedPurchasePrice = salePrice * 0.7;
                    const estimatedProfit = salePrice - estimatedPurchasePrice;

                    return (
                      <tr
                        key={bike.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => {
                          console.log('View bike:', bike.id);
                        }}
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
                            +{formatCurrency(Math.round(estimatedProfit))}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Receipt for:', bike.id);
                            }}
                          >
                            Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}