// client/src/api/mapper.ts
import { getRaw, post } from './http'

export type MappingSide = Record<string, string>
export type Mapping = { mail: MappingSide; crm: MappingSide }

type HeadersRes = { headers?: string[]; sample_headers?: string[] }
type MappingRes = { mapping?: Record<string, string> } | Record<string, string>

// Fetch the selectable header lists for both sources from the mappings table.
export async function fetchHeaders(runId: string) {
  const [mailRes, crmRes] = await Promise.all([
    getRaw<HeadersRes>(`/api/runs/${runId}/headers`, { params: { source: 'mail', sample: 0 } }),
    getRaw<HeadersRes>(`/api/runs/${runId}/headers`, { params: { source: 'crm',  sample: 0 } }),
  ])
  const mailHeaders = mailRes.data?.headers ?? mailRes.data?.sample_headers ?? []
  const crmHeaders  = crmRes.data?.headers  ?? crmRes.data?.sample_headers  ?? []
  return { mailHeaders, crmHeaders }
}

// Load any saved mapping for both sources (keys are canonical field names).
export async function fetchMapping(runId: string): Promise<Mapping> {
  const [mailRes, crmRes] = await Promise.all([
    getRaw<MappingRes>(`/api/runs/${runId}/mapping`, { params: { source: 'mail' } }),
    getRaw<MappingRes>(`/api/runs/${runId}/mapping`, { params: { source: 'crm'  } }),
  ])
  const mail = (mailRes.data as any)?.mapping ?? (mailRes.data as any) ?? {}
  const crm  = (crmRes.data  as any)?.mapping ?? (crmRes.data  as any) ?? {}
  return { mail, crm }
}

// Save mapping back to the server (two upserts).
export async function saveMapping(runId: string, mapping: Mapping) {
  await post(`/api/runs/${runId}/mapping`, { source: 'mail', mapping: mapping.mail })
  await post(`/api/runs/${runId}/mapping`, { source: 'crm',  mapping: mapping.crm  })
}