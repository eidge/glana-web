export function relativeTo(startAt: Date, finishAt: Date, timestamp: Date) {
  let relativeLeft =
    (timestamp.getTime() - startAt.getTime()) /
    (finishAt.getTime() - startAt.getTime());

  if (relativeLeft < 0) relativeLeft = 0;
  if (relativeLeft > 1) relativeLeft = 1;

  return relativeLeft;
}

export function absoluteFrom(startAt: Date, finishAt: Date, fraction: number) {
  if (fraction < 0) return startAt;
  if (fraction > 1) return finishAt;
  return new Date(
    startAt.getTime() + (finishAt.getTime() - startAt.getTime()) * fraction
  );
}
