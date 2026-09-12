import { useEffect, useState } from "react";
import { itemApi } from "./api";
import type { Item, PagedResult } from "./types";
import { useDebouncedValue } from "../../shared/useDebouncedValue";

const PAGE_SIZE = 8;

export function useItems(): {
  result: PagedResult<Item> | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  keyword: string;
  setKeyword: (keyword: string) => void;
} {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 300);
  const [result, setResult] = useState<PagedResult<Item> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [debouncedKeyword]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    itemApi.search({ page, pageSize: PAGE_SIZE, keyword: debouncedKeyword }).then((res) => {
      if (cancelled) return;
      if (res.code === 0) setResult(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedKeyword]);

  return { result, loading, page, setPage, keyword, setKeyword };
}
