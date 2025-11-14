// client/src/api/mapper.ts
import { getRaw, post } from "./http";

export type MappingSide = Record<string, string>;
export type Mapping = { mail: MappingSide; crm: MappingSide };

// --- headers / samples ---

type HeadersRes = {
  headers?: string[];
  sample_headers?: string[];
  sample_rows?: Record<string, any>[];
};

export async function fetchHeaders(runId: string) {
  const [mailRes, crmRes] = await Promise.all([
    getRaw<HeadersRes>(`/runs/${runId}/headers`, {
      params: { source: "mail", sample: 25 },
    }),
    getRaw<HeadersRes>(`/runs/${runId}/headers`, {
      params: { source: "crm", sample: 25 },
    }),
  ]);

  const mailHeaders =
    mailRes.data?.headers ?? mailRes.data?.sample_headers ?? [];
  const crmHeaders =
    crmRes.data?.headers ?? crmRes.data?.sample_headers ?? [];

  const mailSamples = mailRes.data?.sample_rows ?? [];
  const crmSamples = crmRes.data?.sample_rows ?? [];

  return { mailHeaders, crmHeaders, mailSamples, crmSamples };
}

// --- mapping + meta ---

export type MappingPayload = {
  mapping: Record<string, string>;
  fields: string[];
  required: string[];
  optional: string[];
  missing: string[];
  from_auto: boolean;
  labels: Record<string, string>;
};

export type MappingBundle = {
  mail: MappingPayload;
  crm: MappingPayload;
};

type MappingResponse = MappingPayload;

export async function fetchMapping(runId: string): Promise<MappingBundle> {
  const [mailRes, crmRes] = await Promise.all([
    getRaw<MappingResponse>(`/runs/${runId}/mapping`, {
      params: { source: "mail" },
    }),
    getRaw<MappingResponse>(`/runs/${runId}/mapping`, {
      params: { source: "crm" },
    }),
  ]);

  const empty: MappingResponse = {
    mapping: {},
    fields: [],
    required: [],
    optional: [],
    missing: [],
    from_auto: false,
    labels: {},
  };

  const mailPayload: MappingPayload = mailRes.data ?? empty;
  const crmPayload: MappingPayload = crmRes.data ?? empty;

  return { mail: mailPayload, crm: crmPayload };
}

// --- save mapping back to server ---

export async function saveMapping(runId: string, mapping: Mapping) {
  await post(`/runs/${runId}/mapping`, {
    source: "mail",
    mapping: mapping.mail,
  });
  await post(`/runs/${runId}/mapping`, {
    source: "crm",
    mapping: mapping.crm,
  });
}