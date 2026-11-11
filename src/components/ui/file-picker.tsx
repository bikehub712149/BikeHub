"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export default function FilePicker({
  id,
  accept,
  multiple = false,
  label = "Choose files",
  onChange,
  disabled = false,
  resetKey,
  selectedFileName,
}: {
  id: string;
  accept: string;
  multiple?: boolean;
  label?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  resetKey?: number;
  selectedFileName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <input
        key={resetKey}
        ref={inputRef}
        id={id}
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="shrink-0 bg-white"
      >
        <Upload className="mr-2 h-4 w-4" />
        {label}
      </Button>
      <span
        className={`min-w-0 truncate text-xs ${
          selectedFileName ? "font-medium text-emerald-700" : "text-slate-500"
        }`}
        title={selectedFileName}
      >
        {selectedFileName ??
          (multiple ? "Select one or more image files" : "Select an image file")}
      </span>
    </div>
  );
}
