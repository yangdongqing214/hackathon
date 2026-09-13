import { useEffect, useState } from "react";
import { nonprofitApi } from "./api";
import type { NonprofitCard, PagedResult } from "./types";
import { useDebouncedValue } from "../../shared/useDebouncedValue";

const PAGE_SIZE = 9;

export function useNonprofitList(initialCategory = ""): {
  result: PagedResult<NonprofitCard> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  category: string;
  setCategory: (category: string) => void;
  keyword: string;
  setKeyword: (keyword: string) => void;
} {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 300);
  const [result, setResult] = useState<PagedResult<NonprofitCard> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => setPage(1), [category, debouncedKeyword]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const start = Date.now();
    nonprofitApi.search(page, PAGE_SIZE, category, debouncedKeyword).then(async (res) => {
      const remaining = 200 - (Date.now() - start);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;
      if (res.code === 0) setResult(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, category, debouncedKeyword]);

  return { result, loading, page, setPage, category, setCategory, keyword, setKeyword };
}
