export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
