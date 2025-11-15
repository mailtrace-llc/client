// src/api/matches.ts
import { http } from "./http";

export type MatchRow = {
  run_id: string;
  user_id: string;
  crm_line_no: number;
  job_index: string;
  crm_job_date: string | null;
  job_value: number | string | null;
  crm_city: string | null;
  crm_state: string | null;
  crm_zip: string | null;
  mail_full_address: string | null;
  crm_full_address: string | null;
  mail_ids: string[];
  matched_mail_dates: string[];
  confidence_percent: number;
  match_notes: string | null;
  zip5: string | null;
  state: string | null;
};

export type RunMatchesResponse = {
  run_id: string;
  total: number;
  matches: MatchRow[];
};

export async function getRunMatches(runId: string): Promise<RunMatchesResponse> {
  const { data } = await http.get(`/runs/${runId}/matches`);
  return data as RunMatchesResponse;
}