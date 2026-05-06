import { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  className?: string;
  /**
   * Optional JSX to render instead of a blank div when the image fails.
   * Defaults to a transparent placeholder that holds the same size as
   * the image would have occupied.
   */
  fallback?: React.ReactNode;
}

/**
 * SafeImage — A drop-in replacement for `<img>` that silently hides itself
 * (renders a transparent, same-size div) whenever the source is missing,
 * empty, or fails to load. This prevents broken-image icons from appearing
 * anywhere in the UI.
 *
 * Usage:
 *   import SafeImage from '../components/SafeImage';
 *   <SafeImage src={url} alt="Morocco" className="w-full h-full object-cover" />
 */
export default function SafeImage({
  src,
  alt,
  className = '',
  fallback,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Treat null, undefined, or empty string as an immediate error
  if (hasError || !src) {
    return fallback !== undefined
      ? <>{fallback}</>
      : <div className={`bg-transparent ${className}`} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
