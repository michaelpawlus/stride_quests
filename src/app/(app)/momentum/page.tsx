import { Header } from "@/components/layout/header";
import { MomentumDisplay } from "@/components/momentum/momentum-display";

export default function MomentumPage() {
  return (
    <>
      <Header title="Momentum" />
      <main className="p-4">
        <MomentumDisplay />
      </main>
    </>
  );
}
