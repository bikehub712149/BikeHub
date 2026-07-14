import { Suspense } from "react";
import {
  Bike,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { getAllBikes } from "@/lib/server/bike";
import BikeCard from "@/components/bike-card";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Header stays instantly visible */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening today.
        </p>
      </div>

      {/* Suspense handles the loading state for the stats and list below */}
      <Suspense fallback={<SimpleLoader />}>
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
  const totalStock = allBikes.length;
  const soldBikes = allBikes.filter((bike) => bike.status === "Sold").length;
  const pendingBikes = allBikes.filter(
    (bike) => bike.status === "Pending"
  ).length;

  return (
    <>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform duration-500 group-hover:scale-110">
            <Bike size={60} className="text-blue-500" />
          </div>
          <div className="relative">
            <p className="mb-1 text-sm font-medium text-slate-500">
              Total Stock in Shop
            </p>
            <h3 className="text-3xl font-bold text-slate-900">{totalStock}</h3>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform duration-500 group-hover:scale-110">
            <CheckCircle size={60} className="text-emerald-500" />
          </div>
          <div className="relative">
            <p className="mb-1 text-sm font-medium text-slate-500">
              Bikes Sold
            </p>
            <h3 className="text-3xl font-bold text-slate-900">{soldBikes}</h3>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform duration-500 group-hover:scale-110">
            <Clock size={60} className="text-amber-500" />
          </div>
          <div className="relative">
            <p className="mb-1 text-sm font-medium text-slate-500">
              Pending Paperwork
            </p>
            <h3 className="text-3xl font-bold text-slate-900">
              {pendingBikes}
            </h3>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-800">Recent Additions</h2>

          <Link
            href="/inventory"
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
          {recentBikes.map((bike) => (
            <BikeCard key={bike.id} {...bike} />
          ))}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------
// 2. Simple Loading Fallback
// ------------------------------------------------------
function SimpleLoader() {
  return (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}