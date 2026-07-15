import { Suspense } from "react";
import {
  Bike,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getAllBikes } from "@/lib/server/bike";
import BikeCard from "@/components/bike-card";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 min-h-screen">
      {/* Header with subtle fade-in */}
      <div className="mb-8 animate-in fade-in duration-700 slide-in-from-top-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary/70" />
          Here's what's happening with your inventory today.
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
  const allBikes = await getAllBikes();

  const recentBikes = allBikes.slice(0, 6);
  const totalStock = allBikes.filter((bike) => bike.status === "Available").length;
  const soldBikes = allBikes.filter((bike) => bike.status === "Sold").length;
  const pendingBikes = allBikes.filter(
    (bike) => bike.paperwork === "Pending"
  ).length;

  return (
    <div className="space-y-10">
      {/* 
        Stats Grid 
        Using delay utilities to create a staggered entrance effect 
      */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Total Stock */}
        <div className="group relative overflow-hidden cursor-pointer rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Stock
              </p>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalStock}
              </h3>
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-600 transition-colors group-hover:bg-blue-500/20">
              <Bike size={28} strokeWidth={2.5} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Card 2: Bikes Sold */}
        <div className="group relative overflow-hidden cursor-pointer rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6 delay-100 fill-mode-both">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bikes Sold
              </p>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {soldBikes}
              </h3>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
              <CheckCircle size={28} strokeWidth={2.5} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Card 3: Pending Paperwork */}
        <div className="group relative overflow-hidden rounded-xl cursor-pointer border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-in fade-in slide-in-from-bottom-6 delay-200 fill-mode-both">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pending Paperwork
              </p>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {pendingBikes}
              </h3>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-4 text-amber-600 transition-colors group-hover:bg-amber-500/20">
              <Clock size={28} strokeWidth={2.5} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      {/* Recent Additions List */}
      <div className="overflow-hidden rounded-xl border-2 border-border/70 bg-card shadow-sm animate-in fade-in duration-700 delay-300 fill-mode-both">
        <div className="flex items-center justify-between border-b-2 border-border/100 px-6 py-8 sm:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground leading-4">
              Recent Additions
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The latest bikes added to your inventory.
            </p>
          </div>

          <Link
            href="/inventory"
            className="group flex items-center gap-2 rounded-md duration-300 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/90 hover:text-primary-foreground"
          >
            View All
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-8 py-6 !px-16 sm:p-8 md:grid-cols-2 xl:grid-cols-3 bg-slate-200/50">
          {recentBikes.length > 0 ? (
            recentBikes.map((bike) => (
              <BikeCard key={bike.id} {...bike} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
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