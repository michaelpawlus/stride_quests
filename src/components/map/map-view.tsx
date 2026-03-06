"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapQuest } from "@/types";
import CheckpointMarker from "./checkpoint-marker";
import RouteOverlay from "./route-overlay";

type MapViewProps = {
  quests: MapQuest[];
  showRoutes: boolean;
};

const COLUMBUS_CENTER: [number, number] = [39.9612, -82.9988];
const DEFAULT_ZOOM = 13;

export default function MapView({ quests, showRoutes }: MapViewProps) {
  return (
    <MapContainer
      center={COLUMBUS_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {quests.map((quest) => (
        <span key={quest.id}>
          {quest.checkpoints.map((cp) => (
            <CheckpointMarker
              key={cp.id}
              checkpoint={cp}
              questId={quest.id}
              questName={quest.name}
              questStatus={quest.status}
            />
          ))}
          {showRoutes &&
            quest.status === "completed" &&
            quest.routePolylines.map((polyline, i) => (
              <RouteOverlay key={`${quest.id}-route-${i}`} encodedPolyline={polyline} />
            ))}
        </span>
      ))}
    </MapContainer>
  );
}
