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

  broker?: {
    name: string;
    phone: string;
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
  broker,
  documents = [],
  saleDate,
  onEdit,
}: PartyCardProps) {
  return (
    <Card className="rounded-3xl max-sm:rounded-2xl shadow-sm">
      <CardContent className="p-8 max-sm:p-4">
        <div className="mb-8 max-sm:mb-4 flex items-center justify-between max-sm:flex-wrap max-sm:gap-2">
          <div>
            <h2 className="text-xl max-sm:text-base font-bold">{title}</h2>
            <p className="text-sm max-sm:text-xs text-slate-500">
              Associated person information
            </p>
          </div>

          <div className="flex items-center gap-3 max-sm:gap-2">
            {title === "Buyer Information" && saleDate && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 max-sm:px-2.5 max-sm:py-1 text-right">
                <p className="text-[10px] max-sm:text-[9px] font-semibold uppercase tracking-wider text-blue-600">
                  Sale Date
                </p>
                <p className="text-sm max-sm:text-xs font-semibold text-blue-900">
                  {new Date(saleDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="max-sm:h-8 max-sm:text-xs">
                <Pencil className="mr-2 max-sm:mr-1.5 h-4 w-4 max-sm:h-3.5 max-sm:w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {!person ? (
          <div className="rounded-2xl border border-dashed p-10 max-sm:p-6 text-center max-sm:text-xs text-slate-400">
            No information available
          </div>
        ) : (
          <>
            <div className="space-y-5 max-sm:space-y-3.5">
              {/* Seller + Broker */}
              {title === "Seller Information" && broker ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-sm:gap-3.5">
                  {/* Seller - LEFT */}
                  <div className="space-y-3">
                    <Info
                      icon={<User size={18} className="max-sm:h-4 max-sm:w-4" />}
                      label="Seller Name"
                      value={person.name}
                    />

                    <Info
                      icon={<Phone size={18} className="max-sm:h-4 max-sm:w-4" />}
                      label="Seller Phone"
                      value={person.phone?.replaceAll("/", " / ")}
                    />
                  </div>

                  {/* Broker - RIGHT */}
                  <div className="space-y-3">
                    <Info
                      icon={<User size={18} className="max-sm:h-4 max-sm:w-4" />}
                      label="Broker Name"
                      value={broker.name || "—"}
                    />

                    <Info
                      icon={<Phone size={18} className="max-sm:h-4 max-sm:w-4" />}
                      label="Broker Phone"
                      value={broker.phone?.replaceAll("/", " / ") || "—"}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Info
                    icon={<User size={18} className="max-sm:h-4 max-sm:w-4" />}
                    label="Name"
                    value={person.name}
                  />

                  <Info
                    icon={<Phone size={18} className="max-sm:h-4 max-sm:w-4" />}
                    label="Phone"
                    value={person.phone?.replaceAll("/", " / ")}
                  />
                </>
              )}

              {/* Address */}
              <Info
                icon={<MapPin size={18} className="max-sm:h-4 max-sm:w-4" />}
                label="Address"
                value={person.address}
              />
            </div>

            <div className="mt-8 max-sm:mt-5">
              <h3 className="mb-4 max-sm:mb-2.5 max-sm:text-sm font-semibold">Uploaded Documents</h3>

              {documents[0] ? (
                <div className="flex items-center justify-between rounded-xl border p-3 max-sm:p-2.5 max-sm:flex-wrap max-sm:gap-2">
                  <div className="flex items-center gap-3 max-sm:gap-2">
                    <FileText size={18} className="text-blue-600 max-sm:h-4 max-sm:w-4" />

                    <span className="font-semibold max-sm:text-xs">
                      {title === "Seller Information"
                        ? "Seller Document"
                        : "Buyer Document"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <UploadDocumentsDialog
                      bikeNumber={bikeNumber}
                      type={title === "Seller Information" ? "seller" : "buyer"}
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="max-sm:size-8 max-sm:!p-0"
                      onClick={() =>
                        window.open(
                          documents[0],
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <ExternalLink size={16} className="max-sm:h-3.5 max-sm:w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-dashed p-4 max-sm:p-3 max-sm:flex-wrap max-sm:gap-2.5">
                  <div>
                    <p className="font-medium max-sm:text-xs">No document uploaded</p>
                    <p className="text-sm max-sm:text-[11px] text-slate-500">
                      Upload documents now or later.
                    </p>
                  </div>

                  <UploadDocumentsDialog
                    bikeNumber={bikeNumber}
                    type={title === "Seller Information" ? "seller" : "buyer"}
                  />
                </div>
              )}
            </div>
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
    <div className="flex items-start gap-4 max-sm:gap-3 uppercase!">
      <div className="rounded-xl bg-slate-100 p-3 max-sm:size-9 max-sm:p-0 max-sm:flex max-sm:items-center max-sm:justify-center text-slate-600 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm max-sm:text-[11px] text-slate-500">{label}</p>
        <p className="font-semibold max-sm:text-xs break-words">{value}</p>
      </div>
    </div>
  );
}
