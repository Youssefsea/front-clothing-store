"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function MediaImage(props: ImageProps) {
  const { alt, ...rest } = props;
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center bg-muted text-xs text-muted-foreground">VANTA</div>;
  }
  return <Image {...rest} alt={alt} onError={() => setFailed(true)} />;
}
