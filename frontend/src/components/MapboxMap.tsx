import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  color?: string;
  image?: string;
  description?: string;
}

interface MapboxMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export function MapboxMap({ center, zoom = 12, markers = [] }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Guard: show visible error if token is missing
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full min-h-[350px] bg-red-100 text-red-600 flex items-center justify-center p-4 rounded-xl border border-red-300 font-bold text-center">
        ⚠️ Error: <code className="mx-1 bg-red-200 px-1 rounded">VITE_MAPBOX_TOKEN</code> is missing in your <code className="mx-1 bg-red-200 px-1 rounded">.env</code> file.
      </div>
    );
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: zoom,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [center.lng, center.lat], essential: true, duration: 1500 });
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        background: #1e293b;
        border: 1px solid rgba(255,122,0,0.5);
        border-radius: 9999px;
        padding: 4px 12px 4px 4px;
        box-shadow: 0 0 15px rgba(255,122,0,0.5);
        cursor: pointer;
        transition: all 0.3s;
      `;

      const imgHtml = marker.image
        ? `<img src="${marker.image}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.2)" alt="${marker.title}" />`
        : `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF7A00,#e65c00);display:flex;align-items:center;justify-content:center;font-size:14px">📍</div>`;

      el.innerHTML = `
        ${imgHtml}
        <span style="font-weight:700;font-size:13px;color:white;white-space:nowrap">${marker.title}</span>
      `;

      const popupHTML = `
        <div style="background:rgba(11,15,25,0.95);backdrop-filter:blur(12px);border-radius:16px;overflow:hidden;width:240px;border:1px solid rgba(255,255,255,0.1)">
          ${marker.image ? `<img src="${marker.image}" style="width:100%;height:140px;object-fit:cover" />` : ""}
          <div style="padding:16px">
            <h3 style="font-weight:700;color:white;font-size:16px;margin:0 0 6px">${marker.title}</h3>
            ${marker.description ? `<p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.5">${marker.description}</p>` : ""}
          </div>
        </div>
      `;

      const m = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: [0, -10], closeButton: true, className: "luxury-popup" }).setHTML(popupHTML)
        )
        .addTo(map.current!);

      markersRef.current.push(m);
    });
  }, [markers]);


  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl overflow-hidden">
      {/* Map canvas — explicit min-h so it never collapses */}
      <div ref={mapContainer} className="w-full h-full min-h-[350px]" />

      <style>{`
        .luxury-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border-radius: 16px;
        }
        .luxury-popup .mapboxgl-popup-close-button {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          color: #374151;
          top: 8px;
          right: 8px;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .luxury-popup .mapboxgl-popup-close-button:hover {
          background: #f3f4f6;
        }
        .luxury-popup .mapboxgl-popup-tip {
          border-top-color: rgba(11,15,25,0.95) !important;
        }
      `}</style>
    </div>
  );
}
