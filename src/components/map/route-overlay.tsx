"use client";

import { Polyline } from "react-leaflet";
import { decodePolyline } from "@/lib/polyline";

type RouteOverlayProps = {
  encodedPolyline: string;
};

export default function RouteOverlay({ encodedPolyline }: RouteOverlayProps) {
  const positions = decodePolyline(encodedPolyline).map(
    (p) => [p.lat, p.lng] as [number, number]
  );

  if (positions.length === 0) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: "#22c55e",
        weight: 3,
        opacity: 0.7,
      }}
    />
  );
}
