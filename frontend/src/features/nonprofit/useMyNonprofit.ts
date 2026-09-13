import { useCallback, useEffect, useState } from "react";
import { nonprofitApi } from "./api";
import type { NonprofitDraft } from "./types";

type ActionResult = { ok: true } | { ok: false; message: string };

export function useMyNonprofit(): {
  draft: NonprofitDraft | null;
  loading: boolean;
  saving: boolean;
  save: (form: FormData) => Promise<ActionResult>;
} {
  const [draft, setDraft] = useState<NonprofitDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    const start = Date.now();
    nonprofitApi.getMine().then(async (res) => {
      const remaining = 200 - (Date.now() - start);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      if (res.code === 0) setDraft(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => reload(), [reload]);

  async function save(form: FormData): Promise<ActionResult> {
    setSaving(true);
    const res = await nonprofitApi.updateMine(form);
    setSaving(false);
    if (res.code !== 0) return { ok: false, message: res.message };
    setDraft(res.data);
    return { ok: true };
  }

  return { draft, loading, saving, save };
}
