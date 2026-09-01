"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uppercaseDbText } from "@/lib/utils";

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

  broker?: {
    name?: string;
    phone?: string;
  } | null;
};

export default function EditPartyDialog({
  open,
  onOpenChange,
  bikeNumber,
  type,
  person,
  broker,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [brokerName, setBrokerName] = useState("");
  const [brokerPhone, setBrokerPhone] = useState("");

  useEffect(() => {
    if (!person) return;

    setName(uppercaseDbText(person.name));
    setPhone(person.phone);
    setAddress(uppercaseDbText(person.address));
  }, [person]);

  useEffect(() => {
    if (type !== "seller") return;

    setBrokerName(uppercaseDbText(broker?.name ?? ""));
    setBrokerPhone(broker?.phone ?? "");
  }, [broker, type]);

  async function save() {
    try {
      setLoading(true);

      const res = await fetch(`/api/customers/edit/${bikeNumber}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          [type]: {
            name: uppercaseDbText(name),
            phone,
            address: uppercaseDbText(address),
          },
          ...(type === "seller" && {
            broker: {
              name: uppercaseDbText(brokerName),
              phone: brokerPhone,
            },
          }),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      router.refresh();
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
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl border-border/50 bg-background p-0 shadow-xl sm:max-w-lg">
        
        {/* Header Section */}
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-6 py-5 gap-0">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit {type === "seller" ? "Seller" : "Buyer"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Update the contact details and address below.
          </DialogDescription>
        </DialogHeader>

        {/* Content Section */}
        <div className="min-h-0 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              Full Name
            </label>
            <Input
              className="h-11 bg-background"
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
              className="h-11 bg-background"
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
              className="h-11 bg-background"
              placeholder="Enter full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {type === "seller" && (
            <div className="space-y-3 border-t pt-5">
              <p className="text-sm font-medium text-foreground/80">
                Broker Information
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Broker Name
                  </label>
                  <Input
                    className="h-11"
                    placeholder="Enter broker name"
                    value={brokerName}
                    onChange={(e) => setBrokerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Broker Number
                  </label>
                  <Input
                    className="h-11"
                    placeholder="Enter broker number"
                    value={brokerPhone}
                    onChange={(e) => setBrokerPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-6 py-4">
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