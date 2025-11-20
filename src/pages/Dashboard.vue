<!-- src/pages/Dashboard.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

import ModalUploadGuard from "@/components/dashboard/ModalUploadGuard.vue";
import ModalMappingRequired from "@/components/dashboard/ModalMappingRequired.vue";
import MapperModal from "@/components/dashboard/MapperModal.vue";
import PaywallModal from "@/components/dashboard/PaywallModal.vue";
import PaymentFailedModal from "@/components/dashboard/PaymentFailedModal.vue";

import UploadCard from "@/components/dashboard/UploadCard.vue";
import KpiSummaryCard from "@/components/dashboard/KpiSummaryCard.vue";
import YoyChart from "@/components/dashboard/YoyChart.vue";
import TopCitiesTable from "@/components/dashboard/TopCitiesTable.vue";
import TopZipsTable from "@/components/dashboard/TopZipsTable.vue";
import SummaryTable from "@/components/dashboard/SummaryTable.vue";

import { fetchLatestRun } from "@/api/runs";
import { useRun } from "@/composables/useRun";

import { getRunResult, type RunResult } from "@/api/result";
import { getRunMatches, type MatchRow } from "@/api/matches";
import {
  fetchHeaders as fetchMapperHeaders,
  fetchMapping as fetchMapperMapping,
  saveMapping as saveMapperMapping,
  type Mapping as MapperMapping,
  type MappingBundle,
} from "@/api/mapper";

import { useLoader } from "@/stores/loader";
import { useAuthStore } from "@/stores/auth";
import { useDashboardBilling } from "@/composables/useDashboardBilling";

declare global {
  interface Window {
    MT_CONTEXT?: any;
    initDashboard?: (runId?: string) => void;
  }
}

const route = useRoute();
const router = useRouter();
const loader = useLoader();
const auth = useAuthStore();
const { kickOffAndPoll } = useRun();

/* ------------------------------------------------------------------
 * Navbar user data from auth store
 * ------------------------------------------------------------------ */

const navbarUserName = computed(() => auth.userName);
const navbarUserRole = computed(() => auth.userRole);
const navbarAvatarUrl = computed(() => auth.avatarUrl);

/* ------------------------------------------------------------------
 * Billing (subscription + run-charge) via composable
 * ------------------------------------------------------------------ */

const {
  showPaywall,
  paywallBusy,
  showPaymentFailed,
  paymentFailedBusy,
  paywallConfig,
  isBillingOverlayActive,
  showBillingSuccess,
  dismissBillingSuccess,
  onRequireSubscription,
  onRunChargeRequired,
  onPaywallPrimary,
  onPaywallSecondary,
  onPaymentFixPrimary,
  onPaymentFailedSecondary,
  maybeStartCheckoutFromQuery,
  maybeResumeRunAfterRunCheckout,
} = useDashboardBilling(route, router);

/* ------------------------------------------------------------------
 * Upload guard + mapping / runs
 * ------------------------------------------------------------------ */

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
 * Avatar upload (Navbar profile click)
 * ------------------------------------------------------------------ */

const fileInput = ref<HTMLInputElement | null>(null);

function onAvatarClick() {
  fileInput.value?.click();
}

async function onAvatarFileChanged(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  await auth.uploadAvatar(file);
  input.value = "";
}

/* ------------------------------------------------------------------
 * Unified run result payload (KPIs + graph + tops)
 * ------------------------------------------------------------------ */

const runResult = ref<RunResult | null>(null);
const runResultLoading = ref(false);

const matches = ref<MatchRow[]>([]);
const matchesLoading = ref(false);

// Debug strings for when 409 "not_ready" finally resolves
const resultReadyInfo = ref<string | null>(null);
const matchesReadyInfo = ref<string | null>(null);

const RESULT_POLL_DELAY_MS = 1500;
const RESULT_POLL_MAX_ATTEMPTS = 40;

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
  const s = d.slice(0, 10);
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

/* ------------------------------------------------------------------
 * Result + matches loaders with 409 polling
 * ------------------------------------------------------------------ */

async function loadRunResult(id?: string, attempt = 0) {
  if (!id) return;
  runResultLoading.value = true;
  try {
    const result = await getRunResult(id);
    runResult.value = result;

    // TEMP DEBUG
    console.log("[Dashboard] graph.yoy payload", JSON.stringify(result.graph?.yoy, null, 2));
    console.log("[Dashboard] graph.months", result.graph?.months);
    console.log("[Dashboard] graph.mailers", result.graph?.mailers);

    // When result finally becomes ready after 409s, log it + store debug string
    if (attempt > 0) {
      const seconds = ((attempt * RESULT_POLL_DELAY_MS) / 1000).toFixed(1);
      const now = new Date().toLocaleTimeString();
      const msg = `Run result for ${id} became ready after ${attempt} retries (~${seconds}s) at ${now}`;
      console.info("[Dashboard]", msg);
      resultReadyInfo.value = msg;
    } else {
      resultReadyInfo.value = null;
    }
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const code =
      err?.data?.error ??
      err?.response?.data?.error ??
      err?.response?.data?.error_code;

    // Backend says result not ready yet → poll again
    if (status === 409 && code === "not_ready") {
      if (attempt < RESULT_POLL_MAX_ATTEMPTS) {
        setTimeout(() => {
          void loadRunResult(id, attempt + 1);
        }, RESULT_POLL_DELAY_MS);
      } else {
        console.warn(
          "[Dashboard] Result still not ready after max attempts for run %s",
          id
        );
      }
      return;
    }

    console.error("[Dashboard] Failed to load run result", err);
  } finally {
    runResultLoading.value = false;
  }
}

async function loadMatches(id?: string, attempt = 0) {
  if (!id) return;
  matchesLoading.value = true;
  try {
    const data = await getRunMatches(id);
    matches.value = data.matches ?? [];

    if (attempt > 0) {
      const seconds = ((attempt * RESULT_POLL_DELAY_MS) / 1000).toFixed(1);
      const now = new Date().toLocaleTimeString();
      const msg = `Matches for ${id} became ready after ${attempt} retries (~${seconds}s) at ${now}`;
      console.info("[Dashboard]", msg);
      matchesReadyInfo.value = msg;
    } else {
      matchesReadyInfo.value = null;
    }
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const code =
      err?.data?.error ??
      err?.response?.data?.error ??
      err?.response?.data?.error_code;

    if (status === 409 && code === "not_ready") {
      if (attempt < RESULT_POLL_MAX_ATTEMPTS) {
        setTimeout(() => {
          void loadMatches(id, attempt + 1);
        }, RESULT_POLL_DELAY_MS);
      } else {
        console.warn(
          "[Dashboard] Matches still not ready after max attempts for run %s",
          id
        );
      }
      return;
    }

    console.error("[Dashboard] Failed to load run matches", err);
  } finally {
    matchesLoading.value = false;
  }
}

/* ------------------------------------------------------------------
 * Billing resume → reuse useRun().kickOffAndPoll
 * ------------------------------------------------------------------ */

async function startRunForId(id: string) {
  // Make sure the dashboard knows which run to show
  runId.value = id;

  let mappingHandled = false;

  try {
    await kickOffAndPoll(id, (missingFields) => {
      mappingHandled = true;
      onMappingRequired(missingFields || {});
    });
  } catch (err) {
    console.error("[Dashboard] Failed to start or poll run", err);
    return;
  }

  // If we handed off to the mapper, don't try to load results yet
  if (mappingHandled) {
    return;
  }

  // Run finished successfully → trigger KPI + matches refresh
  kpiRefreshKey.value++;
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

    mailFields.value = mb.mail.fields || [];
    crmFields.value = mb.crm.fields || [];

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

function handleRunChargeRequired(payload: { runId: string; estimate: any }) {
  onRunChargeRequired(payload);
}

/* ------------------------------------------------------------------
 * Initialisation
 * ------------------------------------------------------------------ */

onMounted(() => {
  const init = async () => {
    // Ensure auth.me is loaded
    if (!auth.initialized && !auth.loading) {
      await auth.fetchMe();
    }

    // 1) Existing run_id behavior (?run_id=...)
    const qRunId = (route.query.run_id as string) || "";
    if (qRunId) {
      window.MT_CONTEXT = { ...(window.MT_CONTEXT || {}), run_id: qRunId };
      runId.value = qRunId;
      kpiRefreshKey.value++;
    }

    // 2) Subscription one-click checkout from query (?startCheckout=...)
    await maybeStartCheckoutFromQuery();

    // 3) Resume a run after per-run checkout
    await maybeResumeRunAfterRunCheckout(startRunForId);

    // 4) Fallback: if we still don't have a run, load the latest *finished* run
    if (!runId.value) {
      try {
        const latest = await fetchLatestRun(true); // onlyDone = true

        const latestId =
          (latest as any)?.id ?? (latest as any)?.run_id;

        if (latestId) {
          runId.value = latestId;
          kpiRefreshKey.value++;
        }
      } catch (err) {
        console.error("[Dashboard] Failed to load latest run", err);
      }
    }
  };

  void init();
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
        :user-name="navbarUserName"
        :user-role="navbarUserRole"
        :avatar-url="navbarAvatarUrl"
        @profile-click="onAvatarClick"
      />

      <!-- Main content area that gets blurred when billing overlay is active -->
      <div
        class="dash-main-inner"
        :class="{ 'dash-main-inner--blurred': isBillingOverlayActive }"
      >
        <!-- Success banner after returning from Stripe -->
        <div
          v-if="showBillingSuccess"
          class="mb-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <p class="mr-2">
            Your MailTrace subscription is now active. Go ahead and add your CSVs
            to be able to run matching.
          </p>

          <button
            type="button"
            class="ml-auto text-xs font-medium text-emerald-900/70 hover:text-emerald-900 hover:underline"
            @click="dismissBillingSuccess"
          >
            Dismiss
          </button>
        </div>

        <!-- Debug banner for when 409 "not_ready" finally resolves -->
        <div
          v-if="resultReadyInfo || matchesReadyInfo"
          class="mb-4 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600"
        >
          <p v-if="resultReadyInfo">{{ resultReadyInfo }}</p>
          <p v-if="matchesReadyInfo">{{ matchesReadyInfo }}</p>
        </div>

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
            @require-subscription="onRequireSubscription"
            @run-charge-required="handleRunChargeRequired"
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
      </div>
    </section>
  </div>

  <!-- Hidden avatar upload input -->
  <input
    ref="fileInput"
    type="file"
    accept="image/*"
    class="hidden"
    @change="onAvatarFileChanged"
  />

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

  <!-- Billing paywall modal (driven by backend billing config) -->
  <PaywallModal
    v-model="showPaywall"
    :config="paywallConfig"
    :loading="paywallBusy"
    @primary="onPaywallPrimary"
    @secondary="onPaywallSecondary"
  />

  <PaymentFailedModal
    v-model="showPaymentFailed"
    :loading="paymentFailedBusy"
    title="Payment issue"
    message="We couldn’t charge your card. Update your payment method to resume matching runs."
    primary-label="Fix payment"
    secondary-label="Not now"
    @primary="onPaymentFixPrimary"
    @secondary="onPaymentFailedSecondary"
  />
</template>

<style scoped>
.dash-shell {
  display: grid;
  grid-template-columns: 318px 1fr;
  gap: 16px;
  padding: 12px 16px;
  min-height: 100vh;
  background: #f4f5f7;
}

.dash-sidebar {
  position: sticky;
  top: 12px;
  align-self: start;
}

.dash-sidebar :deep(.sidebar-card) {
  min-height: calc(100vh - 24px);
}

.dash-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav {
  margin-bottom: 4px;
}

/* New wrapper for blur */
.dash-main-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: filter 0.18s ease, opacity 0.18s ease;
}

.dash-main-inner--blurred {
  filter: blur(3px);
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
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

.section.card {
  /* keep whatever existing card styling you have */
}

@media (max-width: 1180px) {
  /* Treat 10.5" landscape as tablet: sidebar on top, content full-width */
  .dash-shell {
    grid-template-columns: 1fr;
  }

  .dash-sidebar {
    position: static;
  }

  /* Stack hero section vertically instead of 2 columns */
  #cmp-hero {
    grid-template-columns: 1fr;
  }

  /* Stack top cities/zips as well */
  #cmp-top {
    grid-template-columns: 1fr;
  }
}

/* (Optional) keep a smaller tweak for slightly narrower widths if you like) */
@media (max-width: 1024px) {
  .dash-shell {
    padding: 8px 12px;
  }
}
</style>