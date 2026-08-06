"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = ImageProps & {
  fallbackSrc?: string;
};

export default function AppImage({
  fallbackSrc = "/placeholder-bike.jpg",
  className,
  onLoad,
  onError,
  ...props
}: Props) {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(props.src);

  return (
    
    <div className={`relative flex items-center justify-center overflow-hidden bg-slate-50 ${className ?? ""}`}>
      {loading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-slate-200" />
      )}

      <Image
        {...props}
        src={src}
        className="h-full w-full object-cover drop-shadow-md transition duration-300 group-hover:scale-105"
        onLoad={(e) => {
          setLoading(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          setLoading(false);
          setSrc(fallbackSrc);
          onError?.(e);
        }}
      />
    </div>
  );
}