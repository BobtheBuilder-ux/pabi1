export type BoostPlan = {
    id: string;
    name: string;
    description: string;
    durationDays: number;
    priceCents: number;
}

export type BoostIndustryRequest = {
    categoryId: string;
    planId: string;
}