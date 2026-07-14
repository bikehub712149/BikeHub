"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
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

      const res = await fetch(
        `/api/customers/edit/${bikeNumber}`,
        {
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
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      onOpenChange(false);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">

        <DialogHeader>
          <DialogTitle>
            Edit {type === "seller" ? "Seller" : "Buyer"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone
            </label>

            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Address
            </label>

            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
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

        </div>

      </DialogContent>
    </Dialog>
  );
}