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

    const res = await fetch(`/api/bike/${bikeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Bike deleted.");
      router.push("/inventory");
      router.refresh();
    } else {
      toast.error("Failed to delete bike.");
    }

    setLoading(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
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
