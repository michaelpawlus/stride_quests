"use client";

import { Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapCheckpoint, QuestStatus } from "@/types";

type CheckpointMarkerProps = {
  checkpoint: MapCheckpoint;
  questId: number;
  questName: string;
  questStatus: QuestStatus | "available";
};

const STATUS_COLORS: Record<string, string> = {
  active: "#3b82f6",
  available: "#9ca3af",
  completed: "#22c55e",
};

function createIcon(color: string, isCompleted: boolean) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isCompleted ? color : "none"}" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="8"/>${isCompleted ? '<path d="M9 12l2 2 4-4" stroke="white" stroke-width="2"/>' : ""}</svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

export default function CheckpointMarker({
  checkpoint,
  questId,
  questName,
  questStatus,
}: CheckpointMarkerProps) {
  const color = STATUS_COLORS[questStatus] ?? STATUS_COLORS.available;
  const icon = createIcon(color, checkpoint.isCompleted);

  return (
    <>
      <Circle
        center={[checkpoint.latitude, checkpoint.longitude]}
        radius={checkpoint.radiusMeters}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.1,
          weight: 1,
        }}
      />
      <Marker
        position={[checkpoint.latitude, checkpoint.longitude]}
        icon={icon}
      >
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{checkpoint.name}</p>
            <p className="text-muted-foreground">{questName}</p>
            <a
              href={`/quests/${questId}`}
              className="text-primary underline"
            >
              View Quest
            </a>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
