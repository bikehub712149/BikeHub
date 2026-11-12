import { Suspense } from "react";
import {
  Bike,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getBikeOverview } from "@/lib/server/bike";
import BikeCard from "@/components/bike-card";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-sm:p-2 bg-muted/10 min-h-screen">
      {/* Header with subtle fade-in */}
      <div className="mb-8 max-sm:mb-5 animate-in fade-in duration-700 slide-in-from-top-4">
        <h1 className="text-3xl max-sm:text-lg font-extrabold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1.5 max-sm:mt-1 text-sm max-sm:text-xs font-medium text-muted-foreground flex items-center gap-2 max-sm:gap-1.5">
          <TrendingUp className="h-4 w-4 max-sm:h-3.5 max-sm:w-3.5 shrink-0 text-primary/70" />
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>

      {/* Suspense handles the loading state for the stats and list below */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// ------------------------------------------------------
// 1. Data Fetching Component
// ------------------------------------------------------
async function DashboardContent() {
  const { recentBikes, totalStock, soldBikes, pendingBikes } =
    await getBikeOverview();

  return (
    <div className="space-y-10 max-sm:space-y-5">
      {/* 
        Stats Grid 
        Using delay utilities to create a staggered entrance effect 
      */}
      <div className="grid grid-cols-1 gap-6 max-sm:gap-3 md:grid-cols-3">
        {/* Card 1: Total Stock */}
        <Link href="/inventory?status=available">
          <div className="group relative overflow-hidden cursor-pointer rounded-xl border border-border/50 bg-card p-6 max-sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 max-sm:mb-1 text-xs max-sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total Stock
                </p>
                <h3 className="text-3xl max-sm:text-xl font-extrabold text-foreground tracking-tight">
                  {totalStock}
                </h3>
              </div>
              <div className="rounded-2xl max-sm:rounded-xl bg-green-600/10 p-4 max-sm:size-11 max-sm:p-0 max-sm:flex max-sm:items-center max-sm:justify-center text-green-600 transition-colors group-hover:bg-green-600/20">
                <Bike size={28} strokeWidth={2.5} className="max-sm:size-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-green-600 to-green-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* Card 2: Bikes Sold */}
        <Link href="/inventory?status=sold">
          <div className="group relative overflow-hidden cursor-pointer rounded-xl border border-border/50 bg-card p-6 max-sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6 delay-100 fill-mode-both">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 max-sm:mb-1 text-xs max-sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Bikes Sold
                </p>
                <h3 className="text-3xl max-sm:text-xl font-extrabold text-foreground tracking-tight">
                  {soldBikes}
                </h3>
              </div>
              <div className="rounded-2xl max-sm:rounded-xl bg-red-600/10 p-4 max-sm:size-11 max-sm:p-0 max-sm:flex max-sm:items-center max-sm:justify-center text-red-600 transition-colors group-hover:bg-red-600/20">
                <CheckCircle size={28} strokeWidth={2.5} className="max-sm:size-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-600 to-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* Card 3: Pending Paperwork */}
        <Link href="/paperwork?status=pending">
          <div className="group relative overflow-hidden rounded-xl cursor-pointer border border-border/50 bg-card p-6 max-sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6 delay-200 fill-mode-both">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 max-sm:mb-1 text-xs max-sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pending Paperwork
                </p>
                <h3 className="text-3xl max-sm:text-xl font-extrabold text-foreground tracking-tight">
                  {pendingBikes}
                </h3>
              </div>
              <div className="rounded-2xl max-sm:rounded-xl bg-amber-500/10 p-4 max-sm:size-11 max-sm:p-0 max-sm:flex max-sm:items-center max-sm:justify-center text-amber-600 transition-colors group-hover:bg-amber-500/20">
                <Clock size={28} strokeWidth={2.5} className="max-sm:size-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>
      </div>

      {/* Recent Additions List */}
      <div className="overflow-hidden rounded-xl border-2 border-border/70 bg-card shadow-sm animate-in fade-in duration-700 delay-300 fill-mode-both">
        <div className="flex items-center justify-between border-b-2 border-border/100 px-8 py-8 max-sm:px-4 max-sm:py-3.5 max-sm:gap-2">
          <div>
            <h2 className="text-2xl max-sm:text-sm font-bold tracking-tight text-foreground">
              Recent Additions
            </h2>
            <p className="mt-1 max-sm:mt-0.5 text-xs max-sm:text-[11px] text-muted-foreground">
              The latest bikes added to your inventory.
            </p>
          </div>

          <Link
            href="/inventory"
            className="group shrink-0 flex items-center gap-2 max-sm:gap-1 rounded-md duration-300 bg-primary/10 px-5 py-3 max-sm:px-3 max-sm:py-1.5 text-sm max-sm:text-xs font-semibold text-primary transition-all hover:bg-primary/90 hover:text-primary-foreground"
          >
            View All
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1 max-sm:size-3.5"
            />
          </Link>
        </div>

        <div className="grid gap-8 py-6 p-8 !px-16 max-lg:!px-4 max-sm:!p-3 max-sm:gap-3.5 md:grid-cols-2 lg:grid-cols-3 bg-slate-200/50">
          {recentBikes.length > 0 ? (
            recentBikes.map((bike) => <BikeCard key={bike.id} {...bike} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm max-sm:text-xs font-medium text-muted-foreground">
                No recent bikes found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// 2. Simple Loading Fallback
// ------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="rounded-full bg-muted p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading your dashboard...
      </p>
    </div>
  );
}
