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
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {loading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      <Image
        {...props}
        src={src}
        className="object-cover"
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
