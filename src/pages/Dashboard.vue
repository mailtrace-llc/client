<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";

import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

import ModalUploadGuard from "@/components/dashboard/ModalUploadGuard.vue";
import ModalMappingRequired from "@/components/dashboard/ModalMappingRequired.vue";
import MapperModal from "@/components/dashboard/MapperModal.vue";
import { getRunResult, type RunResult } from "@/api/result";
import { getRunMatches, type MatchRow } from "@/api/matches";
import {
  fetchHeaders as fetchMapperHeaders,
  fetchMapping as fetchMapperMapping,
  saveMapping as saveMapperMapping,
  type Mapping as MapperMapping,
  type MappingBundle,
} from "@/api/mapper";

import UploadCard from "@/components/dashboard/UploadCard.vue";
import { useLoader } from "@/stores/loader";
import KpiSummaryCard from "@/components/dashboard/KpiSummaryCard.vue";
import YoyChart from "@/components/dashboard/YoyChart.vue";
import TopCitiesTable from "@/components/dashboard/TopCitiesTable.vue";
import TopZipsTable from "@/components/dashboard/TopZipsTable.vue";
import SummaryTable from "@/components/dashboard/SummaryTable.vue";

declare global {
  interface Window {
    MT_CONTEXT?: any;
    initDashboard?: (runId?: string) => void;
  }
}

const route = useRoute();
const loader = useLoader();

const showUploadGuard = ref(false);

const uploadGuardTarget = ref<string>("#mailCsv");
const uploadGuardMessage = ref<string>(
  "Please pick <strong>both CSV files</strong> first."
);

const showMapping = ref(false);
const missing = ref<Record<string, string[]>>({});

const showMapper = ref(false);
const mailHeaders = ref<string[]>([]);
const crmHeaders = ref<string[]>([]);

const mailSamples = ref<Record<string, any>[]>([]);
const crmSamples = ref<Record<string, any>[]>([]);

const requiredMail = ref<string[]>([]);
const requiredCrm = ref<string[]>([]);

const initialMapping = ref<MapperMapping | undefined>(undefined);

const mailFields = ref<string[]>([]);
const crmFields = ref<string[]>([]);
const mailLabels = ref<Record<string, string>>({});
const crmLabels = ref<Record<string, string>>({});

const runId = ref<string>("");

const kpiRefreshKey = ref(0);

/* ------------------------------------------------------------------
 * Unified run result payload (KPIs + graph + tops)
 * ------------------------------------------------------------------ */

const runResult = ref<RunResult | null>(null);
const runResultLoading = ref(false);

const matches = ref<MatchRow[]>([]);
const matchesLoading = ref(false);

const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Graph data for YoY card
const graphLabels = computed<string[]>(() => {
  const months = runResult.value?.graph?.months ?? [];
  if (!months.length) return [];
  return months.map((ym) => {
    const [, m] = ym.split("-");
    const idx = Number(m ?? "1") - 1;
    return MONTH_ABBR[idx] ?? ym;
  });
});

const graphMailNow = computed<number[]>(
  () => runResult.value?.graph?.mailers ?? []
);
const graphCrmNow = computed<number[]>(
  () => runResult.value?.graph?.jobs ?? []
);
const graphMatchNow = computed<number[]>(
  () => runResult.value?.graph?.matches ?? []
);

// Prev-year series for YoY overlay (uses graph.yoy when backend populates it)
const mailPrev = computed<number[]>(
  () => runResult.value?.graph?.yoy?.mailers?.prev ?? []
);
const crmPrev = computed<number[]>(
  () => runResult.value?.graph?.yoy?.jobs?.prev ?? []
);
const matchPrev = computed<number[]>(
  () => runResult.value?.graph?.yoy?.matches?.prev ?? []
);

// Raw backend months (e.g. "2024-01") for tick formatting + year markers
const graphRawMonths = computed<string[]>(
  () => runResult.value?.graph?.months ?? []
);

// Top cities / zips rows for the tables
type CityRow = { city: string; total: number; rate: string };
type ZipRow = { zip: string; total: number; rate: string };

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  const x = v <= 1 ? v * 100 : v;
  return `${x.toFixed(1)}%`;
}

const topCityRows = computed<CityRow[]>(() => {
  const items = runResult.value?.top_cities ?? [];
  return items.map((c) => ({
    city: c.city ?? "",
    total: Number(c.matches ?? 0),
    rate: fmtPct(c.match_rate as number | null | undefined),
  }));
});

const topZipRows = computed<ZipRow[]>(() => {
  const items = runResult.value?.top_zips ?? [];
  return items.map((z) => ({
    zip: z.zip ?? "",
    total: Number(z.matches ?? 0),
    rate: fmtPct(z.match_rate as number | null | undefined),
  }));
});

// ---- Summary rows (matches → SummaryTable) ----
type SummaryRow = {
  mail_address1: string;
  mail_unit: string;
  crm_address1: string;
  crm_unit: string;
  city: string;
  state: string;
  zip: string;
  mail_dates: string;
  crm_date: string;
};

function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  const s = d.slice(0, 10); // YYYY-MM-DD
  const [y, m, day] = s.split("-");
  if (y && m && day) return `${m}-${day}-${y}`;
  return s;
}

function fmtMailDates(raw: any): string {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    if (!raw.length) return "";
    return raw.map((x) => fmtDate(String(x))).join(", ");
  }
  // handle "{2024-01-01,2024-01-02}" style just in case
  const stripped = String(raw).replace(/[{}]/g, "");
  const parts = stripped.split(",").filter(Boolean);
  return parts.map((x) => fmtDate(x.trim())).join(", ");
}

const summaryRows = computed<SummaryRow[]>(() => {
  if (!matches.value.length) return [];
  return matches.value.map((m) => ({
    mail_address1: m.mail_full_address || "",
    mail_unit: "",
    crm_address1: m.crm_full_address || "",
    crm_unit: "",
    city: m.crm_city || "",
    state: m.state || m.crm_state || "",
    zip: m.zip5 || m.crm_zip || "",
    mail_dates: fmtMailDates((m as any).matched_mail_dates),
    crm_date: fmtDate((m as any).crm_job_date as any),
  }));
});

async function loadRunResult(id?: string) {
  if (!id) return;
  runResultLoading.value = true;
  try {
    runResult.value = await getRunResult(id);
  } catch (err) {
    console.error("[Dashboard] Failed to load run result", err);
  } finally {
    runResultLoading.value = false;
  }
}

async function loadMatches(id?: string) {
  if (!id) return;
  matchesLoading.value = true;
  try {
    const data = await getRunMatches(id);
    matches.value = data.matches ?? [];
  } catch (err) {
    console.error("[Dashboard] Failed to load run matches", err);
  } finally {
    matchesLoading.value = false;
  }
}

/* ------------------------------------------------------------------
 * Search (Navbar)
 * ------------------------------------------------------------------ */

const search = ref("");
function onSearch(q: string) {
  search.value = q;
}

/* ------------------------------------------------------------------
 * Wiring runId + refreshKey -> runResult loader
 * ------------------------------------------------------------------ */

watch(
  () => kpiRefreshKey.value,
  () => {
    const id = runId.value;
    if (!id) return;

    void loadRunResult(id);
    void loadMatches(id);
  }
  // no immediate: true — it will run when you bump kpiRefreshKey
);

/* ------------------------------------------------------------------
 * Mapping / mapper flows
 * ------------------------------------------------------------------ */

function onRunIdChanged(id: string) {
  runId.value = id;
}

function onMappingRequired(payload: { mail?: string[]; crm?: string[] }) {
  loader.unlock?.();
  loader.hide(true);
  missing.value = payload || {};
  showMapping.value = true;
}

async function openMapper() {
  try {
    const run_id = (window as any).MT_CONTEXT?.run_id || runId.value;
    if (!run_id) {
      console.warn("[Dashboard] No run_id available for openMapper");
      return;
    }

    loader.show({ progress: 5, message: "Loading your mapping…" });

    const [headersRes, mappingBundle] = await Promise.all([
      fetchMapperHeaders(run_id),
      fetchMapperMapping(run_id),
    ]);

    mailHeaders.value = headersRes.mailHeaders || [];
    crmHeaders.value = headersRes.crmHeaders || [];
    mailSamples.value = headersRes.mailSamples || [];
    crmSamples.value = headersRes.crmSamples || [];

    const mb: MappingBundle = mappingBundle;

    initialMapping.value = {
      mail: mb.mail.mapping,
      crm: mb.crm.mapping,
    };

    requiredMail.value = mb.mail.required || [];
    requiredCrm.value = mb.crm.required || [];

    // per-side canon lists straight from backend
    mailFields.value = mb.mail.fields || [];
    crmFields.value = mb.crm.fields || [];

    // per-side labels straight from backend
    mailLabels.value = mb.mail.labels ?? {};
    crmLabels.value = mb.crm.labels ?? {};

    showMapping.value = false;
    showMapper.value = true;
  } catch (err) {
    console.error("[Dashboard] Failed to open mapper", err);
  } finally {
    loader.hide(true);
  }
}

async function onMappingConfirm(mapping: MapperMapping) {
  loader.unlock?.();
  loader.show({ progress: 8, message: "Saving mapping…" });

  try {
    const run_id = (window as any).MT_CONTEXT?.run_id || runId.value;
    if (!run_id) {
      console.warn("[Dashboard] No run_id available for onMappingConfirm");
      return;
    }

    await saveMapperMapping(run_id, mapping);
    showMapper.value = false;
  } finally {
    loader.hide(true);
  }
}

/* ------------------------------------------------------------------
 * Upload guard + run lifecycle
 * ------------------------------------------------------------------ */

function onNeedBothFiles(missingFlags: {
  mailMissing: boolean;
  crmMissing: boolean;
}) {
  console.warn(
    "[Dashboard] Need both files before running / editing mapping",
    missingFlags
  );

  if (missingFlags.mailMissing && missingFlags.crmMissing) {
    uploadGuardTarget.value = "#mailCsv";
    uploadGuardMessage.value =
      "Please pick <strong>both CSV files</strong> first.";
  } else if (missingFlags.mailMissing) {
    uploadGuardTarget.value = "#mailCsv";
    uploadGuardMessage.value =
      "We have your <strong>CRM CSV</strong>. Please pick your <strong>Mail CSV</strong> to continue.";
  } else if (missingFlags.crmMissing) {
    uploadGuardTarget.value = "#crmCsv";
    uploadGuardMessage.value =
      "We have your <strong>Mail CSV</strong>. Please pick your <strong>CRM CSV</strong> to continue.";
  }

  showUploadGuard.value = true;
}

function onRunStarted() {
  loader.show({ progress: 5, message: "Starting matching run…" });
}

function onRunCompleted() {
  loader.hide(true);
  if (runId.value) {
    kpiRefreshKey.value++;
  }
}

function onRunFailed(error: unknown) {
  loader.hide(true);
  console.error("[Dashboard] Run failed", error);
}

/* ------------------------------------------------------------------
 * Initialisation (URL ?run_id=…)
 * ------------------------------------------------------------------ */

onMounted(() => {
  const qRunId = (route.query.run_id as string) || "";
  if (qRunId) {
    window.MT_CONTEXT = { ...(window.MT_CONTEXT || {}), run_id: qRunId };
    runId.value = qRunId;
    kpiRefreshKey.value++;
  }
});
</script>

<template>
  <!-- Shell: sidebar + content column -->
  <div class="dash-shell">
    <aside class="dash-sidebar">
      <Sidebar active="overview" />
    </aside>

    <section class="dash-main">
      <Navbar
        class="nav"
        title="Dashboard"
        v-model="search"
        @search="onSearch"
      />

      <!-- Upload + KPIs -->
      <div id="cmp-hero">
        <UploadCard
          class="card"
          @run-id="onRunIdChanged"
          @need-both-files="onNeedBothFiles"
          @mapping-required="onMappingRequired"
          @run-started="onRunStarted"
          @run-completed="onRunCompleted"
          @run-failed="onRunFailed"
          @edit-mapping="openMapper"
        />

        <KpiSummaryCard
          id="cmp-kpis"
          class="h-full"
          :kpis="runResult?.kpis || null"
        />
      </div>

      <!-- YoY Chart (driven by backend graph) -->
      <div class="section card" id="cmp-graph">
        <YoyChart
          :labels="graphLabels"
          :mail-now="graphMailNow"
          :crm-now="graphCrmNow"
          :match-now="graphMatchNow"
          :mail-prev="mailPrev"
          :crm-prev="crmPrev"
          :match-prev="matchPrev"
          :raw-months="graphRawMonths"
        />
      </div>

      <!-- Top cities / zips -->
      <div class="row section" id="cmp-top">
        <TopCitiesTable
          style="flex: 1 1 360px; min-width: 360px"
          :rows="topCityRows"
        />
        <TopZipsTable
          style="flex: 1 1 360px; min-width: 360px"
          :rows="topZipRows"
        />
      </div>

      <!-- Summary card -->
      <div class="section card" id="cmp-summary">
        <SummaryTable
          class="section"
          :rows="summaryRows.length ? summaryRows : undefined"
        />
      </div>
    </section>
  </div>

  <!-- Missing-field popup -->
  <ModalMappingRequired
    v-model="showMapping"
    v-model:missing="missing"
    @edit-mapping="openMapper"
  />

  <!-- Mapper modal -->
  <MapperModal
    :open="showMapper"
    :mail-headers="mailHeaders"
    :crm-headers="crmHeaders"
    :mail-samples="mailSamples"
    :crm-samples="crmSamples"
    :mail-fields="mailFields"
    :crm-fields="crmFields"
    :mail-labels="mailLabels"
    :crm-labels="crmLabels"
    :initial-mapping="initialMapping"
    :required-mail="requiredMail"
    :required-crm="requiredCrm"
    @close="showMapper = false"
    @confirm="onMappingConfirm"
  />

  <!-- Simple alert modal -->
  <ModalUploadGuard
    v-model="showUploadGuard"
    title="Action needed"
    :message="uploadGuardMessage"
    :focus-selector="uploadGuardTarget"
    :trigger-file-dialog="true"
  />
</template>

<style scoped>
/* Shell grid to mirror Figma spacing */
.dash-shell {
  display: grid;
  grid-template-columns: 318px 1fr; /* Figma sidebar width */
  gap: 16px;
  padding: 12px 16px; /* page gutters like screens */
  min-height: 100vh;
  background: #f4f5f7;
}

/* Sidebar column */
.dash-sidebar {
  position: sticky; /* keeps card in view while scrolling content */
  top: 12px;
  align-self: start;
}

/* Sidebar card fills viewport height visually */
.dash-sidebar :deep(.sidebar-card) {
  min-height: calc(100vh - 24px); /* 2 * page top/bottom gutters */
}

/* Content column */
.dash-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Local spacing tune-ups */
.nav {
  margin-bottom: 4px;
}

#cmp-hero {
  display: grid;
  grid-template-columns: minmax(380px, 520px) 1fr;
  gap: 16px;
  align-items: stretch;
}
#cmp-hero .card {
  width: 100%;
}

#cmp-top {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1180px) {
  .dash-shell {
    grid-template-columns: 300px 1fr;
  }
}
@media (max-width: 1024px) {
  .dash-shell {
    grid-template-columns: 1fr;
  }
  .dash-sidebar {
    position: static;
  }
  #cmp-hero {
    grid-template-columns: 1fr;
  }
  #cmp-top {
    grid-template-columns: 1fr;
  }
}
</style>
