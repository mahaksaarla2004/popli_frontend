export const ESTIMATED_RATE_PER_VIEW = 0.005; // 0.005 per view

export const calculateEstimatedVideoEarnings = (views: number): number => {
  return views * ESTIMATED_RATE_PER_VIEW;
};
