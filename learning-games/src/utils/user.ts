export const getTotalPoints = (scores: Record<string, number>) =>
  Object.values(scores).reduce((a, b) => a + b, 0);
