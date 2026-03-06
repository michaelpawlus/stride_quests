export function isNextScavengerCheckpoint(
  cp: { id: number; sortOrder: number },
  allCheckpoints: { id: number; sortOrder: number }[],
  hitIds: Set<number>
): boolean {
  const sorted = [...allCheckpoints].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const c of sorted) {
    if (!hitIds.has(c.id)) {
      return c.id === cp.id;
    }
  }
  return false;
}
