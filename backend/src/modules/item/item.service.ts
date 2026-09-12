import { itemRepository, type SearchItemsParams } from "./item.repository";
import { toItemDto } from "./item.dto";
import { paged, type PagedResult } from "../../shared/response";
import type { ItemDto } from "./item.dto";

// Demo data — closer to a real scenario than "Sample item N", so the
// list/search/pagination behavior is easy to feel out directly.
const DEMO_ITEMS: { title: string; description: string; category: string }[] = [
  { title: "Redesign onboarding flow", description: "Cut sign-up steps from 5 to 3, add progress indicator.", category: "Design" },
  { title: "Migrate auth to session store", description: "Move from in-memory sessions to MongoDB-backed store for horizontal scaling.", category: "Engineering" },
  { title: "Q3 pricing page A/B test", description: "Test annual-first pricing toggle against monthly-first for conversion lift.", category: "Marketing" },
  { title: "Refund policy update", description: "Extend refund window from 14 to 30 days per customer feedback.", category: "Support" },
  { title: "Dark mode rollout", description: "Ship dark mode behind a feature flag to 10% of users first.", category: "Design" },
  { title: "Rate limit public API", description: "Add per-token rate limiting to prevent abuse on the /search endpoint.", category: "Engineering" },
  { title: "Referral program launch", description: "Give both sides $10 credit when a referred user completes checkout.", category: "Marketing" },
  { title: "Reduce ticket backlog", description: "Triage the 340 open tickets older than 7 days, close stale ones.", category: "Support" },
  { title: "Accessibility audit", description: "Run an axe-core pass on the checkout flow, fix contrast and label issues.", category: "Design" },
  { title: "Database index review", description: "Several dashboard queries are doing full collection scans — add compound indexes.", category: "Engineering" },
  { title: "Holiday campaign assets", description: "Produce banner variants for the November promotion across three markets.", category: "Marketing" },
  { title: "Live chat response time", description: "Average first-response time crept up to 6 minutes — investigate staffing.", category: "Support" },
  { title: "Component library cleanup", description: "Consolidate four different button implementations into one.", category: "Design" },
  { title: "Background job retries", description: "Failed webhook deliveries aren't retried — add exponential backoff.", category: "Engineering" },
];
const CATEGORIES = ["Design", "Engineering", "Marketing", "Support"];

class ItemService {
  // Seed the collection on first access if it's empty — no manual import needed.
  async ensureSeeded(): Promise<void> {
    const count = await itemRepository.count();
    if (count > 0) return;
    const rows = DEMO_ITEMS.concat(
      Array.from({ length: 28 }).map((_, i) => ({
        title: `${DEMO_ITEMS[i % DEMO_ITEMS.length].title} (${i + 1})`,
        description: DEMO_ITEMS[i % DEMO_ITEMS.length].description,
        category: CATEGORIES[i % CATEGORIES.length],
      })),
    );
    await itemRepository.createMany(rows);
  }

  async search(params: SearchItemsParams): Promise<PagedResult<ItemDto>> {
    const { rows, total } = await itemRepository.search(params);
    return paged(rows.map(toItemDto), total, params.page, params.pageSize);
  }
}

export const itemService = new ItemService();
