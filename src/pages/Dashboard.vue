<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

import ModalUploadGuard from "@/components/dashboard/ModalUploadGuard.vue";
import ModalMappingRequired from "@/components/dashboard/ModalMappingRequired.vue";
import MapperModal from "@/components/dashboard/MapperModal.vue";
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

function onRunIdChanged(id: string) {
  runId.value = id;
}

const search = ref("");
function onSearch(q: string) {
  search.value = q;
}

function onMappingRequired(payload: { mail?: string[]; crm?: string[] }) {
  loader.unlock();
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
  loader.unlock();
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
          :run-id="runId"
          :refresh-key="kpiRefreshKey"
        />
      </div>

      <!-- YoY Chart -->
      <div class="section card" id="cmp-graph">
        <YoyChart
          :labels="[
            'JAN 2024',
            'FEB',
            'MAR',
            'APR',
            'MAY',
            'JUN',
            'JUL',
            'AUG',
            'SEP',
            'OCT',
            'NOV',
            'DEC',
            'JAN 2025',
            'FEB',
            'MAR',
            'APR',
            'MAY',
            'JUN',
            'JUL',
            'AUG',
            'SEP',
            'OCT',
            'NOV',
            'DEC',
          ]"
          :mail-now="[
            120, 140, 160, 170, 190, 180, 175, 190, 210, 220, 240, 245, 80, 95,
            110, 130, 160, 170, 175, 190, 205, 220, 235, 260,
          ]"
          :crm-now="[
            60, 75, 90, 105, 120, 130, 128, 132, 140, 150, 165, 170, 55, 70, 85,
            100, 112, 125, 130, 140, 150, 160, 175, 190,
          ]"
          :match-now="[
            20, 28, 36, 40, 48, 46, 44, 52, 58, 62, 68, 72, 18, 24, 30, 36, 42,
            44, 46, 52, 56, 60, 64, 70,
          ]"
          :mail-prev="[
            100, 120, 130, 145, 165, 155, 150, 160, 180, 190, 200, 210,
          ]"
          :crm-prev="[45, 58, 70, 84, 96, 100, 103, 110, 118, 126, 135, 150]"
          :match-prev="[15, 22, 28, 33, 36, 38, 39, 42, 48, 52, 56, 60]"
        />
      </div>

      <div class="row section" id="cmp-top">
        <TopCitiesTable style="flex: 1 1 360px; min-width: 360px" />
        <TopZipsTable style="flex: 1 1 360px; min-width: 360px" />
      </div>

      <div class="section card" id="cmp-summary">
        <SummaryTable class="section" />
      </div>
    </section>
  </div>

  <!-- Missing-field popup -->
  <ModalMappingRequired
    v-model="showMapping"
    v-model:missing="missing"
    @edit-mapping="openMapper"
  />

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
