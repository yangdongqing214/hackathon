import type { NonprofitDocument } from "./nonprofit.model";

export interface NonprofitCardDto {
  id: string;
  orgName: string;
  logoUrl: string | null;
  description: string | null;
  category: string | null;
}

export interface NonprofitDetailDto extends NonprofitCardDto {
  fundingNeedStatement: string | null;
  targetAmount: number | null;
  amountRaised: number;
  videoUrl: string | null;
}

export interface NonprofitDraftDto {
  orgName: string | null;
  logoUrl: string | null;
  description: string | null;
  fundingNeedStatement: string | null;
  targetAmount: number | null;
  amountRaised: number;
  videoUrl: string | null;
  category: string | null;
}

export function toNonprofitCardDto(doc: NonprofitDocument): NonprofitCardDto {
  return {
    id: doc._id.toString(),
    orgName: doc.org_name ?? "",
    logoUrl: doc.logo_url ?? null,
    description: doc.description ?? null,
    category: doc.category ?? null,
  };
}

export function toNonprofitDetailDto(doc: NonprofitDocument): NonprofitDetailDto {
  return {
    ...toNonprofitCardDto(doc),
    fundingNeedStatement: doc.funding_need_statement ?? null,
    targetAmount: doc.target_amount ?? null,
    amountRaised: doc.amount_raised,
    videoUrl: doc.video_url ?? null,
  };
}

export function toNonprofitDraftDto(doc: NonprofitDocument | null): NonprofitDraftDto {
  if (!doc) {
    return {
      orgName: null,
      logoUrl: null,
      description: null,
      fundingNeedStatement: null,
      targetAmount: null,
      amountRaised: 0,
      videoUrl: null,
      category: null,
    };
  }
  return {
    orgName: doc.org_name ?? null,
    logoUrl: doc.logo_url ?? null,
    description: doc.description ?? null,
    fundingNeedStatement: doc.funding_need_statement ?? null,
    targetAmount: doc.target_amount ?? null,
    amountRaised: doc.amount_raised,
    videoUrl: doc.video_url ?? null,
    category: doc.category ?? null,
  };
}
