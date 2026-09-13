import { nonprofitRepository, type SearchNonprofitsParams } from "./nonprofit.repository";
import { paged, type PagedResult } from "../../shared/response";
import { toNonprofitCardDto, toNonprofitDetailDto, toNonprofitDraftDto, type NonprofitCardDto, type NonprofitDetailDto, type NonprofitDraftDto } from "./nonprofit.dto";

export const CATEGORIES = ["Local", "National", "International"];
const YOUTUBE_URL_PATTERN = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/i;

export class NonprofitValidationError extends Error {}
export class NonprofitNotFoundError extends Error {}

class NonprofitService {
  async search(params: SearchNonprofitsParams): Promise<PagedResult<NonprofitCardDto>> {
    const { rows, total } = await nonprofitRepository.search(params);
    return paged(rows.map(toNonprofitCardDto), total, params.page, params.pageSize);
  }

  async getDetail(id: string): Promise<NonprofitDetailDto> {
    const doc = await nonprofitRepository.findById(id);
    if (!doc || !doc.org_name) throw new NonprofitNotFoundError();
    return toNonprofitDetailDto(doc);
  }

  async getMyDraft(ownerUserId: string): Promise<NonprofitDraftDto> {
    const doc = await nonprofitRepository.findByOwnerId(ownerUserId);
    return toNonprofitDraftDto(doc);
  }

  async updateMine(ownerUserId: string, fields: Record<string, unknown>): Promise<NonprofitDraftDto> {
    if (typeof fields.category === "string" && fields.category && !CATEGORIES.includes(fields.category)) {
      throw new NonprofitValidationError(`Category must be one of: ${CATEGORIES.join(", ")}.`);
    }
    if (typeof fields.video_url === "string" && fields.video_url && !YOUTUBE_URL_PATTERN.test(fields.video_url)) {
      throw new NonprofitValidationError("Video link must be a youtube.com or youtu.be URL.");
    }
    if (fields.target_amount !== undefined && fields.target_amount !== null && Number(fields.target_amount) < 0) {
      throw new NonprofitValidationError("Target funding amount can't be negative.");
    }
    if (fields.amount_raised !== undefined && Number(fields.amount_raised) < 0) {
      throw new NonprofitValidationError("Amount raised can't be negative.");
    }
    const doc = await nonprofitRepository.upsertByOwnerId(ownerUserId, fields);
    return toNonprofitDraftDto(doc);
  }
}

export const nonprofitService = new NonprofitService();
