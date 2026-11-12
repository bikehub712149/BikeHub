"use client";

import { Camera, ImagePlus, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { warmUploadImages } from "@/lib/prepare-upload-image";

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
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      warmUploadImages(files);
    }
    onChange(event);
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(event.target.files ?? []);
    if (rawFiles.length === 0) return;

    // Give each camera capture a distinct filename so multiple clicked document pages never collide.
    const stampedFiles = rawFiles.map((file, idx) => {
      const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : ".jpg";
      const stamp = `${Date.now().toString().slice(-5)}${idx ? `-${idx}` : ""}`;
      return new File([file], `doc-photo-${stamp}${ext}`, {
        type: file.type || "image/jpeg",
        lastModified: Date.now(),
      });
    });

    warmUploadImages(stampedFiles);

    try {
      const dt = new DataTransfer();
      for (const f of stampedFiles) dt.items.add(f);
      event.target.files = dt.files;
    } catch {
      // Fallback if DataTransfer assignment is restricted
    }

    onChange(event);
    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 max-sm:p-2.5">
      <input
        key={resetKey}
        ref={inputRef}
        id={id}
        className="sr-only"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleGalleryChange}
      />
      <input
        key={`camera-${resetKey ?? 0}`}
        ref={cameraInputRef}
        id={`${id}-camera`}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        onChange={handleCameraChange}
      />

      {/* PC Only: Original Single Upload Button */}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="max-sm:hidden shrink-0 bg-white"
      >
        <Upload className="mr-2 h-4 w-4" />
        {label}
      </Button>

      {/* Mobile Only (< sm): Two Balanced Options (Camera + From Gallery) */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Button
          type="button"
          variant="default"
          disabled={disabled}
          onClick={() => cameraInputRef.current?.click()}
          className="h-9 rounded-lg !px-3 !py-1.5 text-xs font-semibold"
        >
          <Camera className="mr-1.5 h-3.5 w-3.5" />
          Camera
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="h-9 rounded-lg bg-white !px-3 !py-1.5 text-xs font-semibold"
        >
          <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
          From Gallery
        </Button>
      </div>

      <span
        className={`min-w-0 truncate text-xs max-sm:text-[11px] max-sm:text-center ${
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
