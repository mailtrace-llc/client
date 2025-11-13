// src/api/uploads.ts
import { post } from "@/api/http";

export type Source = "mail" | "crm";
export type UploadState = "ready" | "raw_only";

export interface UploadRes {
  run_id: string;
  source: Source;
  state: UploadState;
  missing?: string[];
  sample_headers?: string[];
  sample_rows?: any[];
  message?: string;
}

export async function uploadSource(
  runId: string,
  source: Source,
  file: File
): Promise<UploadRes> {
  const fd = new FormData();
  fd.append("file", file);

  // Use raw response so we can accept 409 (mapping required)
  const res = await post<UploadRes>(
    `/runs/${encodeURIComponent(runId)}/uploads/${source}`,
    fd,
    {
      // Let Axios/browser set the multipart boundary automatically
      validateStatus: (s) => (s >= 200 && s < 300) || s === 409,
    }
  );

  if (res.status === 409) {
    const data: any = res.data || {};
    return {
      run_id: runId,
      source,
      state: "raw_only",
      missing: data.missing,
      sample_headers: data.sample_headers,
      sample_rows: data.sample_rows,
      message: data.message || "Mapping required",
    };
  }

  return res.data;
}