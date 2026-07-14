"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

type Bike = {
  id: string;
  number: string;
  model: string;
  year: number;
  kms: string;
  image: string;
  buyer?: {
    name: string;
  };
  status: "Sold";
  paperwork: "Pending" | "Completed";
};

export default function PaperworkPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [tab, setTab] = useState<"Pending" | "Completed">("Pending");

  async function fetchData() {
    setLoading(true);

    try {
      const res = await fetch("/api/sales");
      const data = await res.json();

      setBikes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function completePaperwork() {
    if (!selectedBike) return;

    try {
      await fetch(`/api/paperwork/${selectedBike.number}`, {
        method: "PATCH",
      });

      setSelectedBike(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = bikes.filter((bike) => bike.paperwork === tab);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Paperwork Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage ownership transfer and paperwork completion.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex w-max gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button
          onClick={() => setTab("Pending")}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
            tab === "Pending"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => setTab("Completed")}
          className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
            tab === "Completed"
              ? "border bg-white shadow-sm"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Loading State OR Table */}
      {loading ? (
        <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Photo</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Status</th>
                  {/* Only show Action column if we are on the Pending tab */}
                  {tab === "Pending" && (
                    <th className="px-6 py-4 text-right">Action</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tab === "Pending" ? 6 : 5}
                      className="py-12 text-center text-slate-500"
                    >
                      No {tab.toLowerCase()} paperwork found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((bike) => (
                    <tr
                      key={bike.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="h-14 w-20 overflow-hidden rounded-lg border">
                          <Image
                            src={bike.image}
                            alt={bike.model}
                            width={80}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {bike.number}
                      </td>

                      <td className="px-6 py-4">{bike.model}</td>

                      <td className="px-6 py-4">
                        {bike.buyer?.name || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${
                            bike.paperwork === "Pending"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {bike.paperwork}
                        </span>
                      </td>

                      {/* Only show the Check action button if tab is Pending */}
                      {tab === "Pending" && (
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setSelectedBike(bike)}
                          >
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedBike}
        onOpenChange={() => setSelectedBike(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Paperwork?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure the ownership transfer and all documents for{" "}
              <strong>{selectedBike?.number}</strong> have been completed?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={completePaperwork}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}