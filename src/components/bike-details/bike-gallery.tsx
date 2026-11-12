"use client";

import { Camera, ImagePlus, Plus, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { warmUploadImages } from "@/lib/prepare-upload-image";

type BikeGalleryProps = {
  images: (File | string)[];
  selectedImage: number;
  setSelectedImage: (index: number) => void;

  editable?: boolean;

  onAddImages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
};

export default function BikeGallery({
  images,
  selectedImage,
  setSelectedImage,
  editable = false,
  onAddImages,
  onRemoveImage,
}: BikeGalleryProps) {
  const [loadingImages, setLoadingImages] = useState<Set<File | string>>(
    new Set()
  );
  const loadedImages = useRef<Set<File | string>>(new Set());
  const imageSources = useMemo(() => {
    const sources = new Map<File, string>();
    for (const image of images) {
      if (image instanceof File) sources.set(image, URL.createObjectURL(image));
    }
    return sources;
  }, [images]);

  useEffect(() => {
    setLoadingImages(
      new Set(
        images.filter((image) => !loadedImages.current.has(image))
      )
    );
  }, [images]);

  useEffect(() => {
    return () => {
      for (const url of imageSources.values()) URL.revokeObjectURL(url);
    };
  }, [imageSources]);

  function getImageSrc(image: File | string) {
    if (typeof image === "string") return image;
    return imageSources.get(image) ?? "";
  }

  const handleImageLoad = (image: File | string) => {
    loadedImages.current.add(image);
    setLoadingImages((prev) => {
      const updated = new Set(prev);
      updated.delete(image);
      return updated;
    });
  };

  const handleGalleryFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      warmUploadImages(files);
    }
    onAddImages?.(e);
    e.target.value = "";
  };

  const handleCameraFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    if (rawFiles.length === 0) return;

    // Give each mobile camera photo a unique filename so consecutive captures never collide.
    const stampedFiles = rawFiles.map((file, idx) => {
      const ext = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : ".jpg";
      const stamp = `${Date.now().toString().slice(-5)}${idx ? `-${idx}` : ""}`;
      return new File([file], `bike-photo-${stamp}${ext}`, {
        type: file.type || "image/jpeg",
        lastModified: Date.now(),
      });
    });

    warmUploadImages(stampedFiles);

    try {
      const dt = new DataTransfer();
      for (const f of stampedFiles) dt.items.add(f);
      e.target.files = dt.files;
    } catch {
      // Fallback if DataTransfer assignment is restricted
    }

    onAddImages?.(e);
    e.target.value = "";
  };

  return (
    <div className="rounded-l-3xl border-r bg-slate-50 p-8 max-md:rounded-2xl max-md:border-r-0 max-md:border-b max-sm:p-4">
      <div className="mb-5 max-sm:mb-3 flex items-center justify-between">
        <h3 className="text-lg max-sm:text-sm font-semibold">
          Bike Photos
        </h3>
        {editable && (
          <span className="text-[11px] font-medium text-slate-500 sm:hidden">
            {images.length}/4 photos
          </span>
        )}
      </div>

      {/* Main Image */}
      <div className="h-80 max-sm:h-52 overflow-hidden rounded-2xl border bg-white relative flex items-center justify-center">
        {images.length ? (
          <>
            {loadingImages.has(images[selectedImage]) && (
              <div
                className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
                style={{
                  animation: "shimmer 2s infinite",
                }}
              />
            )}
            <img
              src={getImageSrc(images[selectedImage])}
              alt=""
              decoding="async"
              className="h-full w-full object-cover"
              onLoad={() => handleImageLoad(images[selectedImage])}
              onError={() => handleImageLoad(images[selectedImage])}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 max-sm:text-xs">
            No image selected
          </div>
        )}
      </div>

      {/* Thumbnails + Action Buttons */}
      <div className="mt-5 max-sm:mt-3.5 grid grid-cols-5 max-sm:grid-cols-4 gap-3 max-sm:gap-2.5">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition max-sm:aspect-square ${
              selectedImage === index
                ? "border-blue-600"
                : "border-slate-200"
            }`}
          >
            {loadingImages.has(image) && (
              <div
                className="absolute inset-0 z-10 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]"
                style={{
                  animation: "shimmer 2s infinite",
                }}
              />
            )}
            <img
              src={getImageSrc(image)}
              alt=""
              decoding="async"
              className="h-20 max-sm:h-full w-full object-cover"
              onLoad={() => handleImageLoad(image)}
              onError={() => handleImageLoad(image)}
            />

            {editable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage?.(index);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {/* PC Only: Original Single "+ Add" Button */}
        {editable && images.length < 4 && (
          <label className="max-sm:hidden flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition hover:border-blue-500 hover:bg-blue-50">
            <Plus className="mb-1 h-5 w-5" />

            <span className="text-xs font-medium">
              Add
            </span>

            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={handleGalleryFiles}
            />
          </label>
        )}

        {/* Mobile Only (< sm): Square "Camera" and "Gallery" Buttons (No 3rd Add button) */}
        {editable && images.length < 4 && (
          <>
            <label className="sm:hidden flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary bg-primary/5 text-primary transition active:scale-95">
              <Camera className="h-4 w-4" />
              <span className="text-[10px] font-semibold leading-none">
                Camera
              </span>
              <input
                hidden
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraFiles}
              />
            </label>

            <label className="sm:hidden flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-700 transition active:scale-95">
              <ImagePlus className="h-4 w-4" />
              <span className="text-[10px] font-semibold leading-none">
                Gallery
              </span>
              <input
                hidden
                multiple
                type="file"
                accept="image/*"
                onChange={handleGalleryFiles}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}