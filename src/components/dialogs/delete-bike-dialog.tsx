"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

export default function DeleteBikeDialog({
  bikeId,
  bikeNumber,
}: {
  bikeId: string;
  bikeNumber: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function deleteBike() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bike/${bikeId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Bike deleted.");
        window.dispatchEvent(
          new CustomEvent("navigation-start", { detail: "/inventory" }),
        );
        router.push("/inventory");
        router.refresh();
      } else {
        toast.error("Failed to delete bike.");
      }
    } catch {
      toast.error("Failed to delete bike.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" className="max-sm:h-8 max-sm:text-xs">
            <Trash2 className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
            Delete Bike
          </Button>
        }
      ></AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this bike?</AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete bike <strong>{bikeNumber}</strong>{" "}
            along with all customer history, seller details, documents and
            transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={deleteBike} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Forever"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
