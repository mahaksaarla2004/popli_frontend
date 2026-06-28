export const ESTIMATED_RATE_PER_VIEW = 0.0044; // Net after 10% TDS and 2% Platform Fee

export const calculateEstimatedVideoEarnings = (views: number): number => {
  return views * ESTIMATED_RATE_PER_VIEW;
};
