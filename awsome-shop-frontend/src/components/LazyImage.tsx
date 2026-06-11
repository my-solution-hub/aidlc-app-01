import { useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

interface LazyImageProps {
  /** Image URL. When empty/null the fallback is rendered instead. */
  src?: string | null;
  alt?: string;
  /** Node shown when there is no src or the image fails to load. */
  fallback?: ReactNode;
  /** Styles applied to the rendered <img> element. */
  sx?: SxProps<Theme>;
}

/**
 * Reusable image with native lazy-loading (`loading="lazy"`) and an
 * onError fallback placeholder. The image only loads when scrolled near
 * the viewport; if the src is missing or fails to load, `fallback` (e.g.
 * an icon) is shown centered in the available space instead.
 */
export default function LazyImage({
  src,
  alt = "",
  fallback = null,
  sx,
}: LazyImageProps) {
  const [errored, setErrored] = useState(false);
  // Track the previous src so the error state resets when the source
  // changes — adjusting state during render (React's recommended pattern)
  // instead of inside an effect.
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
  }

  if (!src || errored) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {fallback}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      sx={{ width: "100%", height: "100%", objectFit: "cover", ...sx }}
    />
  );
}
