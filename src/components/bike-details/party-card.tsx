"use client";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Pencil,
  ExternalLink,
} from "lucide-react";
import UploadDocumentsDialog from "@/components/dialogs/upload-documents-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PartyCardProps = {
  bikeNumber: string;

  title: string;

  person: {
    name: string;
    phone: string;
    address: string;
  } | null;

  documents?: string[];
  receipt?: string | null;
  saleDate?: string | null;
  onEdit?: () => void;
};

export default function PartyCard({
  bikeNumber,
  title,
  person,
  documents = [],
  receipt,
  saleDate,
  onEdit,
}: PartyCardProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-slate-500">
              Associated person information
            </p>
          </div>

          <div className="flex items-center gap-3">
            {title === "Buyer Information" && saleDate && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  Sale Date
                </p>
                <p className="text-sm font-semibold text-blue-900">
                  {new Date(saleDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {!person ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-slate-400">
            No information available
          </div>
        ) : (
          <>
            <div className="space-y-5">
              <Info
                icon={<User size={18} />}
                label="Name"
                value={person.name}
              />
              <Info
                icon={<Phone size={18} />}
                label="Phone"
                value={person.phone?.replaceAll("/", " / ")}
              />
              <Info
                icon={<MapPin size={18} />}
                label="Address"
                value={person.address}
              />
            </div>

            {(documents[0] || receipt) && (
              <div className="mt-8">
                <h3 className="mb-4 font-semibold">Uploaded Documents</h3>

                {documents[0] && (
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-600" />

                      <span className="font-semibold">
                        {title === "Seller Information"
                          ? "Seller Document"
                          : "Buyer Document"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <UploadDocumentsDialog
                        bikeNumber={bikeNumber}
                        type={
                          title === "Seller Information" ? "seller" : "buyer"
                        }
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          window.open(
                            documents[0],
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-600">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}
