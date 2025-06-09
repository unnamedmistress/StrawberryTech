export const getTotalPoints = (pointsMap: Record<string, number>) =>
  Object.values(pointsMap).reduce((a, b) => a + b, 0);
