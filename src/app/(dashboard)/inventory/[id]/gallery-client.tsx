"use client";

import { useState } from "react";

import BikeGallery from "@/components/bike-details/bike-gallery";

export default function BikeGalleryClient({
  images,
}: {
  images: string[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <BikeGallery
      images={images}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
    />
  );
}