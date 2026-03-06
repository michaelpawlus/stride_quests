"use client";

import { Button } from "@/components/ui/button";
import type { FilterState } from "./quest-map";

type MapFiltersProps = {
  filters: FilterState;
  onToggle: (key: keyof FilterState) => void;
};

const FILTER_CONFIG: { key: keyof FilterState; label: string; color: string }[] = [
  { key: "active", label: "Active", color: "bg-blue-500" },
  { key: "available", label: "Available", color: "bg-gray-400" },
  { key: "completed", label: "Completed", color: "bg-green-500" },
  { key: "routes", label: "Routes", color: "bg-green-500" },
];

export default function MapFilters({ filters, onToggle }: MapFiltersProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 gap-1.5 rounded-lg bg-background/90 p-2 shadow-lg backdrop-blur-sm">
      {FILTER_CONFIG.map(({ key, label, color }) => (
        <Button
          key={key}
          variant={filters[key] ? "default" : "outline"}
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => onToggle(key)}
        >
          <span className={`inline-block h-2 w-2 rounded-full ${filters[key] ? color : "bg-muted"}`} />
          {label}
        </Button>
      ))}
    </div>
  );
}
