import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
