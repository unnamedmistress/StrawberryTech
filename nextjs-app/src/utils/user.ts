export const getTotalPoints = (pointsMap: Record<string, number>) =>
  Object.values(pointsMap).reduce(
    (sum: number, points: number) => sum + points,
    0
  );
