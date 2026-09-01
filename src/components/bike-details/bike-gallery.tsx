"use client";

import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());

  // Initialize loading state for all images on mount and when images change
  useEffect(() => {
    if (images.length > 0) {
      setLoadingImages(new Set(images.map((_, i) => i)));
    }
  }, [images]);

  // Reset loading state when selectedImage changes
  useEffect(() => {
    setLoadingImages((prev) => {
      const updated = new Set(prev);
      updated.add(selectedImage);
      return updated;
    });
  }, [selectedImage]);

  function getImageSrc(image: File | string) {
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  }

  const handleImageLoad = (index: number) => {
    setLoadingImages((prev) => {
      const updated = new Set(prev);
      updated.delete(index);
      return updated;
    });
  };

  return (
    <div className="rounded-l-3xl border-r bg-slate-50 p-8">
      <h3 className="mb-5 text-lg font-semibold">
        Bike Photos
      </h3>

      {/* Main Image */}

      <div className="h-80 overflow-hidden rounded-2xl border bg-white relative flex items-center justify-center">
        {images.length ? (
          <>
            {loadingImages.has(selectedImage) && (
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
              className="h-full w-full object-cover"
              onLoad={() => handleImageLoad(selectedImage)}
              onError={() => handleImageLoad(selectedImage)}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No image selected
          </div>
        )}
      </div>

      {/* Thumbnails */}

      <div className="mt-5 grid grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition

            ${
              selectedImage === index
                ? "border-blue-600"
                : "border-slate-200"
            }`}
          >
            {loadingImages.has(index) && (
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
              className="h-20 w-full object-cover"
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageLoad(index)}
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

        {editable && images.length < 4 && (
          <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 transition hover:border-blue-500 hover:bg-blue-50">
            <Plus className="mb-1 h-5 w-5" />

            <span className="text-xs font-medium">
              Add
            </span>

            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              onChange={onAddImages}
            />
          </label>
        )}
      </div>
    </div>
  );
}