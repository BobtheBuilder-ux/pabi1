export interface BoostPlans {
  name: string;
  description: string;
  durationDays: string;
  priceCents: string;
}

export interface BoostRequest {
  categoryId: string;
  planId: string;
}

export type BoostResponse = {
  categoryId: string;
  planId: string;
};
