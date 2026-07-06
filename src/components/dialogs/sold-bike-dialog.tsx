"use client";

import { BadgeCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SoldBikeDialog() {
  return (
    <Dialog>
      <DialogTrigger
  render={
    <Button variant="secondary" className="h-12 rounded-xl px-6">
      <BadgeCheck className="mr-2 h-4 w-4" />
      Sold Bike
    </Button>
  }
/>

      <DialogContent className="sm:max-w-2xl p-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Mark Bike as Sold</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          <Input placeholder="Registration Number" className="p-6" />

          <Input placeholder="Model" className="p-6" />

          <Input placeholder="Year" className="p-6" />

          <Input placeholder="Kilometers" className="p-6" />

          <Input placeholder="Purchase Price" className="p-6" />

          <Input
  type="file"
  accept="image/*"
  className="h-12 cursor-pointer"
/>

          <Button className="col-span-2 mt-3 p-6">
            Save Bike
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}