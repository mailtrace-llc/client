<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";

type BasicStats = {
  total_mail: number;
  unique_mail_addresses: number;
  total_jobs: number;
  matches: number;
  match_rate: number; // 0–1 or 0–100, we normalize
  match_revenue: number;
};

type AdvancedStats = {
  revenue_per_mailer: number;
  avg_ticket_per_match: number;
  median_days_to_convert: number;
  convert_30: number; // %
  convert_60: number; // %
  convert_90: number; // %
};

const props = defineProps<{ runId?: string }>();

// --- UI state ---
const showAdvanced = ref(true); // “Hide Advanced KPIs” switch (shown by default)

// --- data state ---
const basic = ref<BasicStats>({
  total_mail: 0,
  unique_mail_addresses: 0,
  total_jobs: 0,
  matches: 0,
  match_rate: 0,
  match_revenue: 0,
});

// Dummy advanced until wired (you can overwrite from API later)
const adv = ref<AdvancedStats>({
  revenue_per_mailer: 12.44,
  avg_ticket_per_match: 119.99,
  median_days_to_convert: 123,
  convert_30: 14,
  convert_60: 37,
  convert_90: 44,
});

// --- helpers ---
const fmtInt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const fmtMoney = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const fmtPct = (n: number) => {
  // accept 0–1 or 0–100
  const v = n <= 1 ? n * 100 : n;
  return `${v.toFixed(1)}%`;
};

// --- fetch existing /result wiring (compatible with your old card) ---
async function load(runId?: string) {
  if (!runId) return;
  try {
    const res = await fetch(`/api/result?run_id=${encodeURIComponent(runId)}`);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    // Expecting your existing shape; map defensively
    basic.value = {
      total_mail: Number(data?.summary?.total_mail ?? data?.total_mail ?? 0),
      unique_mail_addresses: Number(
        data?.summary?.unique_mail_addresses ?? data?.unique_mail_addresses ?? 0
      ),
      total_jobs: Number(data?.summary?.total_jobs ?? data?.total_jobs ?? 0),
      matches: Number(data?.summary?.matches ?? data?.matches ?? 0),
      match_rate: Number(data?.summary?.match_rate ?? data?.match_rate ?? 0),
      match_revenue: Number(
        data?.summary?.match_revenue ?? data?.match_revenue ?? 0
      ),
    };

    // If your API already supplies advanced, use it; otherwise keep dummies.
    if (data?.advanced) {
      adv.value = {
        revenue_per_mailer: Number(
          data.advanced.revenue_per_mailer ?? adv.value.revenue_per_mailer
        ),
        avg_ticket_per_match: Number(
          data.advanced.avg_ticket_per_match ?? adv.value.avg_ticket_per_match
        ),
        median_days_to_convert: Number(
          data.advanced.median_days_to_convert ??
            adv.value.median_days_to_convert
        ),
        convert_30: Number(data.advanced.convert_30 ?? adv.value.convert_30),
        convert_60: Number(data.advanced.convert_60 ?? adv.value.convert_60),
        convert_90: Number(data.advanced.convert_90 ?? adv.value.convert_90),
      };
    }
  } catch (e) {
    // soft-fail; keep zeros + dummy adv
    console.warn("KPI load failed:", e);
  }
}

onMounted(() => load(props.runId));
watch(() => props.runId, load);

const matchRateText = computed(() => fmtPct(basic.value.match_rate));
</script>

<template>
  <section class="card border border-[#0c2d50]/10 rounded-xl bg-white">
    <!-- Header row -->
    <div class="flex items-center bg-[#f4f5f7] rounded-t-xl px-4 py-3">
      <div class="flex items-center gap-4 flex-1">
        <span class="text-[18px] font-semibold text-[#0c2d50]">Results:</span>
      </div>

      <span class="h-6 w-px bg-[#47bfa9]"></span>

      <div class="flex items-center gap-3 flex-1 justify-end">
        <span class="text-[18px] font-semibold text-[#0c2d50]"
          >Hide Advanced KPIs</span
        >
        <!-- pill switch -->
        <button
          class="relative h-4 w-12 rounded-full border border-black/20 bg-white shadow-inner"
          role="switch"
          :aria-checked="!showAdvanced"
          @click="showAdvanced = !showAdvanced"
          title="Hide/Show Advanced KPIs"
        >
          <span
            class="absolute -top-1.5 left-0 h-6 w-6 rounded-full bg-[#47bfa9] transition-all"
            :style="{
              transform: showAdvanced ? 'translateX(24px)' : 'translateX(2px)',
            }"
          />
        </button>
      </div>
    </div>

    <!-- Two columns -->
    <div class="grid md:grid-cols-2 gap-0">
      <!-- Left: Basic KPIs -->
      <div class="px-4 divide-y divide-[#6d8196]/30">
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Total Mail</span>
          <span class="text-[18px] font-semibold">{{
            fmtInt(basic.total_mail)
          }}</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Unique Mail Addresses</span>
          <span class="text-[18px] font-semibold">{{
            fmtInt(basic.unique_mail_addresses)
          }}</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Total Jobs</span>
          <span class="text-[18px] font-semibold">{{
            fmtInt(basic.total_jobs)
          }}</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Matches</span>
          <span class="text-[18px] font-semibold">{{
            fmtInt(basic.matches)
          }}</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Match Rate</span>
          <span class="text-[18px] font-semibold">{{ matchRateText }}</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <span class="text-[20px] text-[#0c2d50]">Match Revenue</span>
          <span class="text-[18px] font-semibold">{{
            fmtMoney(basic.match_revenue)
          }}</span>
        </div>
      </div>

      <!-- Right: Advanced KPIs -->
      <div class="relative px-4 border-l border-[#6d8196]/30">
        <transition name="fade">
          <div v-show="showAdvanced" class="divide-y divide-[#6d8196]/30">
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]">Revenue Per Mailer</span>
              <span class="text-[18px] font-semibold">{{
                fmtMoney(adv.revenue_per_mailer)
              }}</span>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]"
                >Avg Ticket (Per Match)</span
              >
              <span class="text-[18px] font-semibold">{{
                fmtMoney(adv.avg_ticket_per_match)
              }}</span>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]"
                >Median Days To Convert</span
              >
              <span class="text-[18px] font-semibold">{{
                adv.median_days_to_convert
              }}</span>
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]">Convert ≤ 30 Days</span>
              <span class="text-[18px] font-semibold"
                >{{ adv.convert_30 }}%</span
              >
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]">Convert ≤ 60 Days</span>
              <span class="text-[18px] font-semibold"
                >{{ adv.convert_60 }}%</span
              >
            </div>
            <div class="flex items-center justify-between py-3">
              <span class="text-[20px] text-[#0c2d50]">Convert ≤ 90 Days</span>
              <span class="text-[18px] font-semibold"
                >{{ adv.convert_90 }}%</span
              >
            </div>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  box-shadow: 0 1px 3px rgba(12, 45, 80, 0.08),
    0 10px 24px rgba(12, 45, 80, 0.06);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
