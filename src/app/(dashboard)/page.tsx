import React from "react";
import {
  Search,
  PlusCircle,
  Bike,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { getRecentBikes, getAllBikes } from "@/lib/demo/bikes";
import BikeCard from "@/components/bike-card";
import Link from "next/link";

export default async function DashboardOverview() {
  const recentBikes = await getRecentBikes();
  const allBikes = await getAllBikes();

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Bike size={60} className="text-blue-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Total Stock in Shop
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{allBikes.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle size={60} className="text-emerald-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Bikes Sold
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{allBikes.filter((bike) => bike.status === "Sold").length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Clock size={60} className="text-amber-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-slate-500 mb-1">
                Pending Paperwork
              </p>
              <h3 className="text-3xl font-bold text-slate-900">{allBikes.filter((bike) => bike.status === "Pending").length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <h2 className="text-lg font-bold text-slate-800">
      Recent Additions
    </h2>

    <Link
      href="/inventory"
      className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
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
      </div>
    </>
  );
}
