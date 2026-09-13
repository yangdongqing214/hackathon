export const CATEGORIES = ["Local", "National", "International"];

export interface NonprofitCard {
  id: string;
  orgName: string;
  logoUrl: string | null;
  description: string | null;
  category: string | null;
}

export interface NonprofitDetail extends NonprofitCard {
  fundingNeedStatement: string | null;
  targetAmount: number | null;
  amountRaised: number;
  videoUrl: string | null;
}

export interface NonprofitDraft {
  orgName: string | null;
  logoUrl: string | null;
  description: string | null;
  fundingNeedStatement: string | null;
  targetAmount: number | null;
  amountRaised: number;
  videoUrl: string | null;
  category: string | null;
}

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
