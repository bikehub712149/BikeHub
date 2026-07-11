"use client"
import {
  User,
  Phone,
  MapPin,
  FileText,
  Pencil,
  Download,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PartyCardProps = {
  title: string;

  person: {
    name: string;
    phone: string;
    address: string;
  } | null;

  documents?: string[];

  receipt?: string | null;

  onEdit?: () => void;
};

export default function PartyCard({
  title,
  person,
  documents = [],
  receipt,
  onEdit,
}: PartyCardProps) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-8">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              {title}
            </h2>

            <p className="text-sm text-slate-500">
              Associated person information
            </p>

          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>

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
                value={person.phone}
              />

              <Info
                icon={<MapPin size={18} />}
                label="Address"
                value={person.address}
              />

            </div>

            {(documents.length > 0 || receipt) && (

              <div className="mt-8">

                <h3 className="mb-4 font-semibold">
                  Uploaded Documents
                </h3>

                <div className="space-y-3">

                  {documents.map((doc, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border p-3"
                    >
                      <div className="flex items-center gap-3">

                        <FileText
                          size={18}
                          className="text-blue-600"
                        />

                        <span className="truncate capitalize font-semibold">
                          Download the document
                        </span>

                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        <Download size={16} />
                      </Button>

                    </div>

                  ))}

                  {receipt && (

                    <div className="flex items-center justify-between rounded-xl border bg-green-50 p-3">

                      <div className="flex items-center gap-3">

                        <FileText
                          size={18}
                          className="text-green-700"
                        />

                        <span>
                          Sale Receipt
                        </span>

                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        <Download size={16} />
                      </Button>

                    </div>

                  )}

                </div>

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

      <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
        {icon}
      </div>

      <div>

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="font-semibold">
          {value}
        </p>

      </div>

    </div>
  );
}