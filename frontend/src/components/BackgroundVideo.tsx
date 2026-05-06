import { useRef, useState } from "react";

const BACKEND_BASE = "http://localhost:8001";
const DEFAULT_VIDEO = `${BACKEND_BASE}/static/videos/morocco.mp4`;
const DEFAULT_POSTER = `${BACKEND_BASE}/static/images/default.jpg`;

interface BackgroundVideoProps {
  src?: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
}

export function BackgroundVideo({
  src = DEFAULT_VIDEO,
  poster = DEFAULT_POSTER,
  className = "",
  overlayClassName = "",
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const resolvedSrc = src.startsWith("http") ? src : `${BACKEND_BASE}${src.startsWith("/") ? "" : "/"}${src}`;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Poster / fallback image shown while video loads or on error */}
      {(!loaded || error) && (
        <img
          src={poster}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = DEFAULT_POSTER; }}
        />
      )}

      {!error && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
          src={resolvedSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onCanPlay={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Dark gradient overlay */}
      <div
        className={`absolute inset-0 ${overlayClassName || "bg-gradient-to-b from-[#0B1C2C]/70 via-black/50 to-[#0B1C2C]"}`}
      />
    </div>
  );
}
