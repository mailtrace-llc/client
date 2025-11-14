// client/src/api/mapper.ts
import { getRaw, post } from "./http";

export type MappingSide = Record<string, string>;
export type Mapping = { mail: MappingSide; crm: MappingSide };

type HeadersRes = {
  headers?: string[];
  sample_headers?: string[];
  sample_rows?: Record<string, any>[];
};

export type MappingPayload = {
  mapping: Record<string, string>;
  required: string[];
  optional: string[];
  missing: string[];
  from_auto: boolean;
};

export type MappingBundle = {
  mail: MappingPayload;
  crm: MappingPayload;
};

// -------- headers + samples --------

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

// -------- mapping + meta --------

type RawMappingRes =
  | {
      mapping?: Record<string, string>;
      required?: string[];
      optional?: string[];
      missing?: string[];
      from_auto?: boolean;
    }
  | Record<string, string>;

export async function fetchMapping(runId: string): Promise<MappingBundle> {
  const [mailRes, crmRes] = await Promise.all([
    getRaw<RawMappingRes>(`/runs/${runId}/mapping`, {
      params: { source: "mail" },
    }),
    getRaw<RawMappingRes>(`/runs/${runId}/mapping`, {
      params: { source: "crm" },
    }),
  ]);

  const mailRaw = mailRes.data as any;
  const crmRaw = crmRes.data as any;

  const mailMapping = mailRaw?.mapping ?? mailRaw ?? {};
  const crmMapping = crmRaw?.mapping ?? crmRaw ?? {};

  const mailPayload: MappingPayload = {
    mapping: mailMapping,
    required: mailRaw?.required ?? [],
    optional: mailRaw?.optional ?? [],
    missing: mailRaw?.missing ?? [],
    from_auto: !!mailRaw?.from_auto,
  };

  const crmPayload: MappingPayload = {
    mapping: crmMapping,
    required: crmRaw?.required ?? [],
    optional: crmRaw?.optional ?? [],
    missing: crmRaw?.missing ?? [],
    from_auto: !!crmRaw?.from_auto,
  };

  return { mail: mailPayload, crm: crmPayload };
}

// Save mapping back to the server (two upserts).
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