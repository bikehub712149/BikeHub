"use client";

import { Camera, ImagePlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { warmUploadImages } from "@/lib/prepare-upload-image";
import CameraCaptureDialog from "@/components/ui/camera-capture-dialog";

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
  const [cameraOpen, setCameraOpen] = useState(false);

  const emitFiles = (files: File[]) => {
    if (files.length === 0) return;
    warmUploadImages(files);
    const syntheticEvent = {
      target: { files },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    emitFiles(files);
  };

  return (
    <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 max-sm:p-2.5">
      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        maxPhotos={multiple ? 10 : 1}
        filePrefix="doc-photo"
        title={multiple ? "Capture Document Pages" : "Capture Receipt"}
        onCapture={emitFiles}
      />

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCameraOpen(true);
          }}
          className="h-9 rounded-lg !px-3 !py-1.5 text-xs font-semibold"
        >
          <Camera className="mr-1.5 h-3.5 w-3.5" />
          Camera
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.click();
          }}
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
