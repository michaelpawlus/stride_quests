"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestCard } from "./quest-card";
import type { QuestWithProgress, QuestType } from "@/types";

export function QuestList() {
  const [quests, setQuests] = useState<QuestWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch("/api/quests");
      if (res.ok) {
        setQuests(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const activateQuest = async (questId: number) => {
    const res = await fetch(`/api/quests/${questId}`, { method: "POST" });
    if (res.ok) {
      fetchQuests();
    }
  };

  const filterByType = (type: QuestType | "all") =>
    type === "all" ? quests : quests.filter((q) => q.type === type);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const tabs: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    { value: "point_to_point", label: "P2P" },
    { value: "collector", label: "Collector" },
    { value: "scavenger", label: "Scavenger" },
  ];

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="w-full grid grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-4">
          {filterByType(tab.value as QuestType | "all").length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No quests found
            </p>
          ) : (
            filterByType(tab.value as QuestType | "all").map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onActivate={
                  quest.status === "available" ? activateQuest : undefined
                }
              />
            ))
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
