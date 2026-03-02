import { Header } from "@/components/layout/header";
import { QuestList } from "@/components/quests/quest-list";

export default function DashboardPage() {
  return (
    <>
      <Header title="Bounty Board" />
      <main className="p-4">
        <QuestList />
      </main>
    </>
  );
}
