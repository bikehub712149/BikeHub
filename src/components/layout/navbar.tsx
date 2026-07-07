"use client";

import { Search, Plus, BadgeCheck } from "lucide-react";

import { Input } from "@/components/ui/input";

import AddBikeDialog from "@/components/dialogs/add-bike-dialog";
import SoldBikeDialog from "@/components/dialogs/sold-bike-dialog";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex items-center gap-16 border-b bg-white px-8 h-26">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <Input
          placeholder="Search bike number, customer, seller..."
          className="h-12 rounded-xl pl-11 text-sm"
        />
      </div>

      {/* Buttons */}

      <div className="flex gap-5">
        <AddBikeDialog />

      <SoldBikeDialog />
      </div>
    </header>
  );
}