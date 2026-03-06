"use client";

import { useEffect, useState } from "react";
import type { MapData } from "@/types";
import MapView from "./map-view";
import MapFilters from "./map-filters";

export type FilterState = {
  active: boolean;
  available: boolean;
  completed: boolean;
  routes: boolean;
};

export default function QuestMap() {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    active: true,
    available: true,
    completed: true,
    routes: true,
  });

  useEffect(() => {
    fetch("/api/map/data")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const filteredQuests = data.quests.filter((q) => {
    if (q.status === "active") return filters.active;
    if (q.status === "available") return filters.available;
    if (q.status === "completed") return filters.completed;
    return true;
  });

  return (
    <div className="relative h-full">
      <MapView quests={filteredQuests} showRoutes={filters.routes} />
      <MapFilters filters={filters} onToggle={(key) => setFilters((f) => ({ ...f, [key]: !f[key] }))} />
    </div>
  );
}
