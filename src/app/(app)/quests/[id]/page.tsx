import { Header } from "@/components/layout/header";
import { QuestDetailView } from "@/components/quests/quest-detail";

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questId = parseInt(id, 10);

  return (
    <>
      <Header title="Quest Details" />
      <main className="p-4">
        <QuestDetailView questId={questId} />
      </main>
    </>
  );
}
