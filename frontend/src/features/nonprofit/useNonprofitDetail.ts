import { useEffect, useState } from "react";
import { nonprofitApi } from "./api";
import type { NonprofitDetail } from "./types";

export function useNonprofitDetail(id: string | undefined): {
  detail: NonprofitDetail | null;
  loading: boolean;
  notFound: boolean;
} {
  const [detail, setDetail] = useState<NonprofitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const start = Date.now();
    nonprofitApi.getDetail(id).then(async (res) => {
      const remaining = 200 - (Date.now() - start);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (res.code === 0) setDetail(res.data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [id]);

  return { detail, loading, notFound };
}
