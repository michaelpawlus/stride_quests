import dynamic from "next/dynamic";

const QuestMap = dynamic(() => import("@/components/map/quest-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <QuestMap />
    </div>
  );
}
