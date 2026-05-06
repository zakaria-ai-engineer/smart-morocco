import { ImgHTMLAttributes, SyntheticEvent, useState } from "react";
import { toAbsoluteMediaUrl } from "../services/api";

const FINAL_FALLBACK = "/static/images/default.jpg";

interface FallbackImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

export function FallbackImage({
  src,
  fallbackSrc = FINAL_FALLBACK,
  alt = "",
  className = "",
  onError,
  ...props
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  // Resolve to absolute URL; if that returns nothing, use the fallbackSrc
  const resolvedSrc = !failed && src
    ? (toAbsoluteMediaUrl(src) ?? toAbsoluteMediaUrl(fallbackSrc) ?? FINAL_FALLBACK)
    : (toAbsoluteMediaUrl(fallbackSrc) ?? FINAL_FALLBACK);

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!failed) {
      // First error: swap to fallbackSrc
      setFailed(true);
    } else {
      // Second error (fallbackSrc itself broke): set src inline to the hardcoded default
      (e.target as HTMLImageElement).src = FINAL_FALLBACK;
      (e.target as HTMLImageElement).onerror = null; // prevent infinite loop
    }
    // Propagate if caller also needs to know
    if (typeof onError === "function") onError(e);
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
