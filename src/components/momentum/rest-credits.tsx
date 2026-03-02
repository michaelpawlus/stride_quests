import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RestCredits({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Rest Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={`h-8 flex-1 rounded-md transition-colors ${
                i < current
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {current} / {max} credits banked
        </p>
      </CardContent>
    </Card>
  );
}
