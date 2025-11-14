// src/api/result.ts
import { http } from "./http";

export type KPIs = {
  total_mail?: number;
  unique_mail_addresses?: number;
  total_jobs?: number;
  matches?: number;
  match_rate?: number; 
  match_revenue?: number;
  revenue_per_mailer?: number;
  avg_ticket_per_match?: number;
  median_days_to_convert?: number;
};

export type RunGraph = {
  months: string[];
  mailers: number[];
  jobs: number[];
  matches: number[];
  yoy: {
    mailers: { months: string[]; current: number[]; prev: number[] };
    jobs:    { months: string[]; current: number[]; prev: number[] };
    matches: { months: string[]; current: number[]; prev: number[] };
  };
};

export type TopCity = {
  city: string;
  matches: number;
  match_rate: number;
};

export type TopZip = {
  zip: string;
  matches: number;
  // backend currently doesn’t persist per-ZIP rate; add later if you want:
  // match_rate?: number;
};

export type RunResult = {
  run_id: string;
  kpis: KPIs;
  graph: RunGraph;
  top_cities: TopCity[];
  top_zips: TopZip[];
};

export async function getRunResult(runId: string): Promise<RunResult> {
  const { data } = await http.get(`/runs/${runId}/result`);
  return data as RunResult;
}