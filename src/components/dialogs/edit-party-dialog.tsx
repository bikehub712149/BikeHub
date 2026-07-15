"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  bikeNumber: string;

  type: "seller" | "buyer";

  person: {
    name: string;
    phone: string;
    address: string;
  } | null;
};

export default function EditPartyDialog({
  open,
  onOpenChange,
  bikeNumber,
  type,
  person,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!person) return;

    setName(person.name);
    setPhone(person.phone);
    setAddress(person.address);
  }, [person]);

  async function save() {
    try {
      setLoading(true);

      const res = await fetch(`/api/customer/edit/${bikeNumber}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          [type]: {
            name,
            phone,
            address,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      window.location.reload();
      onOpenChange(false);

    } catch (err) {
      console.error(err);
      alert("Failed to update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-2xl bg-background shadow-xl gap-0 border-border/50">
        
        {/* Header Section */}
        <DialogHeader className="border-b px-6 py-5 bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit {type === "seller" ? "Seller" : "Buyer"}
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Update the contact details and address below.
          </DialogDescription>
        </DialogHeader>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Full Name
            </label>
            <Input
              className="h-10 bg-background"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Phone Number
            </label>
            <Input
              className="h-10 bg-background"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Address
            </label>
            <Input
              className="h-10 bg-background"
              placeholder="Enter full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            className="h-10 px-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            className="h-10 min-w-[140px]"
            onClick={save}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}