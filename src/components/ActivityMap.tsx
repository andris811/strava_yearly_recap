'use client';

import { useRef, useEffect } from 'react';
import { decodePolyline } from '@/lib/polyline';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ActivityMapProps {
  polyline: string;
  startLatLng: [number, number] | null;
  endLatLng: [number, number] | null;
}

// Fix Leaflet's default icon issue with webpack/next.js
const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function ActivityMap({ polyline, startLatLng, endLatLng }: ActivityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !polyline) return;

    const points = decodePolyline(polyline);
    if (points.length === 0) return;

    // Clean up previous map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const center: [number, number] = [
      points.reduce((sum, p) => sum + p[0], 0) / points.length,
      points.reduce((sum, p) => sum + p[1], 0) / points.length,
    ];

    const map = L.map(mapRef.current, {
      maxBounds: undefined,
      maxBoundsViscosity: undefined,
    }).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const latLngs = points.map(p => L.latLng(p[0], p[1]));
    L.polyline(latLngs, { color: '#fc4c02', weight: 3, opacity: 0.8 }).addTo(map);

    if (startLatLng) {
      L.marker(startLatLng, { icon: createIcon('#22c55e', 'S') })
        .addTo(map)
        .bindPopup('Start');
    }
    if (endLatLng) {
      L.marker(endLatLng, { icon: createIcon('#ef4444', 'F') })
        .addTo(map)
        .bindPopup('Finish');
    }

    // Fit map to route bounds
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [polyline, startLatLng, endLatLng]);

  return <div ref={mapRef} className="w-full h-[300px] sm:h-[400px] rounded-lg" />;
}
