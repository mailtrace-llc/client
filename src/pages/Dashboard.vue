<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
// import ModalUploadGuard from '@/components/ModalUploadGuard.vue';
import ModalMappingRequired from "@/components/dashboard/ModalMappingRequired.vue";
import UploadCard from "@/components/dashboard/UploadCard.vue";
import KpiSummaryCard from "@/components/dashboard/KpiSummaryCard.vue";
import { useUploadGuard } from "@/composables/useUploadGuard";
import { useLoader } from "@/stores/loader";
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
const router = useRouter();
const loader = useLoader();

const showUploadGuard = ref(false);
useUploadGuard(() => (showUploadGuard.value = true));

const showMapping = ref(false);
const missing = ref<Record<string, string[]>>({});
const runId = ref<string>("");

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

function openMapper() {
  loader.unlock();
  loader.hide(true);
  const run_id = window.MT_CONTEXT?.run_id || "";
  window.dispatchEvent(
    new CustomEvent("mt:open-mapper", { detail: { run_id } })
  );
}

onMounted(() => {
  const onRunStarted = () => {
    loader.lock();
    loader.show({ progress: 3, message: "Starting…" });
  };
  const onRunCompleted = (e: any) => {
    loader.setProgress(100);
    loader.setMessage("Run complete");
    const id = e?.detail?.run_id as string | undefined;
    if (id) {
      runId.value = id;
      window.MT_CONTEXT = { ...(window.MT_CONTEXT || {}), run_id: id };
      router.replace({
        path: route.path,
        query: { ...route.query, run_id: id },
      });
    }
  };
  const onOpenMapper = (e: any) => {
    const miss = (e?.detail?.missing ?? {}) as {
      mail?: string[];
      crm?: string[];
    };
    if (Object.keys(miss).length) missing.value = miss;
    loader.unlock();
    loader.hide(true);
    showMapping.value = true;
  };

  window.addEventListener("mt:run-started", onRunStarted);
  window.addEventListener("mt:run-completed", onRunCompleted);
  window.addEventListener("mt:open-mapper", onOpenMapper);
  (window as any).__onRunStarted = onRunStarted;
  (window as any).__onRunCompleted = onRunCompleted;
  (window as any).__onOpenMapper = onOpenMapper;

  const qRunId = (route.query.run_id as string) || "";
  if (qRunId) {
    window.MT_CONTEXT = { ...(window.MT_CONTEXT || {}), run_id: qRunId };
    runId.value = qRunId;
  }
});

onBeforeUnmount(() => {
  const rs = (window as any).__onRunStarted;
  const rc = (window as any).__onRunCompleted;
  const om = (window as any).__onOpenMapper;
  if (rs) window.removeEventListener("mt:run-started", rs);
  if (rc) window.removeEventListener("mt:run-completed", rc);
  if (om) window.removeEventListener("mt:open-mapper", om);
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
        <UploadCard class="h-full" @mapping-required="onMappingRequired" />
        <KpiSummaryCard id="cmp-kpis" class="h-full" :run-id="runId" />
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

  <!-- Simple alert modal (IDs kept for legacy)
  <ModalUploadGuard
    v-model="showUploadGuard"
    title="Action needed"
    message="Please pick <strong>both CSV files</strong> first."
    focusSelector="#mailCsv"
    :triggerFileDialog="true"
  /> -->
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
