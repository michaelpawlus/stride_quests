import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stride Quests
          </h1>
          <p className="text-muted-foreground">
            Transform Columbus into your running adventure
          </p>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg border p-4 text-left">
            <h3 className="mb-1 font-semibold text-foreground">Discover Quests</h3>
            <p>Explore Columbus through point-to-point races, collector challenges, and scavenger hunts.</p>
          </div>
          <div className="rounded-lg border p-4 text-left">
            <h3 className="mb-1 font-semibold text-foreground">Run with Strava</h3>
            <p>Your GPS track automatically validates quest checkpoints. Just run and we handle the rest.</p>
          </div>
          <div className="rounded-lg border p-4 text-left">
            <h3 className="mb-1 font-semibold text-foreground">Build Momentum</h3>
            <p>Earn rest credits so missed days don&apos;t break your streak. Rest is part of the plan.</p>
          </div>
        </div>

        <Button asChild size="lg" className="w-full bg-orange-500 hover:bg-orange-600">
          <a href="/auth/strava">Connect with Strava to Start</a>
        </Button>
      </div>
    </div>
  );
}
