// src/api/runs.ts
import { get, getRaw, post } from "@/api/http";
import { http } from './http';

export type StartRunResponse =
  | { kind: "ok" }
  | { kind: "needs-mapping"; missing: Record<string, string[]> }
  | { kind: "error"; status?: number; message?: string };

export type RunStatus = {
  run_id?: string;
  status?: "queued" | "matching" | "aggregating" | "done" | "failed";
  step?: string;
  message?: string;
  pct?: number;
};

export type RunItem = {
  id: string;
  started_at: string;
  status?: "queued" | "matching" | "aggregating" | "done" | "failed";
  summary?: string | null;
};

// ---------------------------
// Run lifecycle
// ---------------------------

export async function createRun(): Promise<{ run_id: string }> {
  const res = await http.post<{ run_id: string }>('/runs', {}, { withCredentials: true });
  if (!res.data?.run_id) throw new Error('Failed to create run');
  return res.data;
}

export async function startRun(runId: string): Promise<StartRunResponse> {
  // need raw response to treat 409 specially
  const res = await post(`/runs/${encodeURIComponent(runId)}/start`, undefined, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 409,
  });

  if (res.status === 409) {
    const data: any = res.data || {};
    return {
      kind: "needs-mapping",
      missing: (data && data.missing) || {},
    };
  }

  return { kind: "ok" };
}

export async function getRunStatus(runId: string): Promise<RunStatus> {
  // data-only helper; returns typed JSON
  return get<RunStatus>(`/runs/${encodeURIComponent(runId)}/status`);
}

export async function activateRun(runId: string): Promise<boolean> {
  const res = await post<{ ok?: boolean }>(
    `/runs/${encodeURIComponent(runId)}/activate`
  );
  return !!res.data?.ok;
}

// ---------------------------
// History helpers
// ---------------------------

export async function fetchRuns(
  limit = 25,
  before?: string
): Promise<RunItem[]> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (before) q.set("before", before);

  const data = await get<{ items?: RunItem[] }>(`/runs?${q.toString()}`);
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchLatestRun(onlyDone = false): Promise<RunItem | null> {
  const q = onlyDone ? "?require=done" : "";
  // we need to detect 204 explicitly
  const res = await getRaw<RunItem>(`/runs/latest${q}`);
  if (res.status === 204) return null;
  return res.data as RunItem;
}
