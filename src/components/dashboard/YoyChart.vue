<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import Chart, { type ChartDataset, type ChartOptions } from "chart.js/auto";

type LineDS = ChartDataset<"line", number[]>;

const props = withDefaults(
  defineProps<{
    labels: string[];
    mailNow: number[];
    crmNow: number[];
    matchNow: number[];
    mailPrev?: number[];
    crmPrev?: number[];
    matchPrev?: number[];
  }>(),
  {
    labels: () => [
      "JAN 2024",
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
      "JAN 2025",
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
    ],
  }
);

const showYoy = ref(true);
const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"line", number[], string> | null = null;

// figma colors
const cMail = "#163b69";
const cCrm = "#47bfa9";
const cMatch = "#6b6b6b";

const janIdxs = computed(() => {
  const i24 = props.labels.findIndex((l) => /jan\s*2024/i.test(l));
  const i25 = props.labels.findIndex((l) => /jan\s*2025/i.test(l));
  return { a: i24 >= 0 ? i24 : 0, b: i25 >= 0 ? i25 : 12 };
});

// dashed vertical rules + caret at the top
const verticalRulesPlugin = {
  id: "verticalRules",
  afterDatasetsDraw(c: Chart) {
    const { ctx, chartArea, scales } = c;
    const sx: any = (scales as any).x;
    if (!sx || chartArea.width <= 0) return;
    const draw = (idx: number) => {
      const x = sx.getPixelForValue(idx);
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = cCrm;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top - 10);
      ctx.lineTo(x - 5, chartArea.top - 2);
      ctx.lineTo(x + 5, chartArea.top - 2);
      ctx.closePath();
      ctx.fillStyle = cCrm;
      ctx.fill();
      ctx.restore();
    };
    draw(janIdxs.value.a);
    draw(janIdxs.value.b);
  },
};

function build() {
  if (!canvasEl.value) return;

  const datasets: LineDS[] = [
    {
      label: "Mail Volume",
      data: props.mailNow,
      borderColor: cMail,
      backgroundColor: cMail,
      borderWidth: 3,
      cubicInterpolationMode: "monotone",
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: "CRM Jobs",
      data: props.crmNow,
      borderColor: cCrm,
      backgroundColor: cCrm,
      borderWidth: 3,
      cubicInterpolationMode: "monotone",
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: "Matches",
      data: props.matchNow,
      borderColor: cMatch,
      backgroundColor: cMatch,
      borderWidth: 3,
      cubicInterpolationMode: "monotone",
      tension: 0.35,
      pointRadius: 3,
    },

    // previous year (dashed)
    {
      label: "Mail Volume (prev)",
      data: props.mailPrev ?? [],
      borderColor: cMail,
      backgroundColor: cMail,
      borderDash: [6, 6],
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      hidden: !showYoy.value || !props.mailPrev?.length,
      parsing: false as const,
    },
    {
      label: "CRM Jobs (prev)",
      data: props.crmPrev ?? [],
      borderColor: cCrm,
      backgroundColor: cCrm,
      borderDash: [6, 6],
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      hidden: !showYoy.value || !props.crmPrev?.length,
      parsing: false as const,
    },
    {
      label: "Matches (prev)",
      data: props.matchPrev ?? [],
      borderColor: cMatch,
      backgroundColor: cMatch,
      borderDash: [6, 6],
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      hidden: !showYoy.value || !props.matchPrev?.length,
      parsing: false as const,
    },
  ];

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          callback: (_v, i) =>
            (props.labels[i] || "")
              .toString()
              .toUpperCase()
              .replace(" 2024", "")
              .replace(" 2025", ""),
          maxRotation: 0,
        },
      },
      y: { grid: { color: "rgba(0,0,0,0.06)" }, ticks: { precision: 0 } },
    },
  };

  chart = new Chart<"line", number[], string>(canvasEl.value, {
    type: "line",
    data: { labels: props.labels, datasets },
    options,
    plugins: [verticalRulesPlugin],
  });
}

function syncVisibility() {
  if (!chart) return;
  const ds = chart.data.datasets as LineDS[];
  const idx = (name: string) =>
    ds.findIndex((d) => d.label?.includes(name) && d.label?.includes("(prev)"));
  const toggle = (i: number) => {
    if (i >= 0 && ds[i])
      ds[i].hidden = !showYoy.value || !(ds[i].data as any[])?.length;
  };
  toggle(idx("Mail Volume"));
  toggle(idx("CRM Jobs"));
  toggle(idx("Matches"));
  chart.update();
}

onMounted(build);
onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});

watch(
  () => [
    props.labels,
    props.mailNow,
    props.crmNow,
    props.matchNow,
    props.mailPrev,
    props.crmPrev,
    props.matchPrev,
  ],
  () => {
    chart?.destroy();
    chart = null;
    build();
  }
);
watch(showYoy, syncVisibility);
</script>

<template>
  <section class="card section p-4">
    <header
      class="yoy-header flex items-center justify-between gap-4 px-2 pt-1 pb-2"
      role="toolbar"
    >
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-[#0c2d50] font-semibold text-[15px]"
          >Show YoY Overlay</span
        >
        <!-- pill switch (uses existing showYoy state) -->
        <button
          type="button"
          class="switch"
          :class="{ 'is-on': showYoy }"
          role="switch"
          :aria-pressed="showYoy"
          @click="showYoy = !showYoy"
          aria-label="Toggle YoY overlay"
        >
          <span class="switch__track"></span>
          <span class="switch__thumb"></span>
        </button>
        <div class="hidden md:block h-8 w-px bg-[#47bfa9]/50" />
      </div>

      <ul
        class="yoy-legend flex items-center gap-6 flex-wrap text-[14px] text-black/80"
      >
        <li class="flex items-center gap-2">
          <span class="legend-swatch bg-[#163b69]" /> Mail Volume
        </li>
        <li class="flex items-center gap-2">
          <span class="legend-swatch bg-[#47bfa9]" /> CRM Jobs
        </li>
        <li class="flex items-center gap-2">
          <span class="legend-swatch bg-[#6b6b6b]" /> Matches
        </li>
        <li class="flex items-center gap-2">
          <span class="legend-dash" /> Dashed = Previous Year
        </li>
      </ul>
    </header>

    <div class="mt-2 px-2 pb-3">
      <div class="relative h-80">
        <canvas ref="canvasEl" class="block w-full h-full"></canvas>
        <div
          class="absolute top-0 right-3 text-[18px] font-semibold text-[#0c2d50]"
        >
          *This is a dummy graph, Will be replaced in DEVELOPMENT*
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(12, 45, 80, 0.08),
    0 10px 24px rgba(12, 45, 80, 0.06);
  background: #fff;
}
.section {
  border: 1px solid rgba(12, 45, 80, 0.06);
}

/* -------- YoY switch (Figma-accurate sizing) -------- */
.switch {
  position: relative;
  width: 42px; /* track width */
  height: 24px; /* track height */
  border: 0;
  background: transparent;
  padding: 0;
  border-radius: 9999px;
  cursor: pointer;
}
.switch__track {
  position: absolute;
  inset: 0;
  background: #e9eef3;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(12, 45, 80, 0.08);
  transition: background 160ms ease;
}
.switch__thumb {
  position: absolute;
  top: 50%;
  left: 2px; /* keeps thumb fully inside on the left */
  width: 20px;
  height: 20px;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #163b69, #47bfa9);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(12, 45, 80, 0.25);
  transition: left 160ms ease, transform 160ms ease;
  pointer-events: none;
}
.switch.is-on .switch__track {
  background: #47bfa9;
}
.switch.is-on .switch__thumb {
  left: calc(100% - 22px);
} /* inside right edge */

/* legend chips */
.legend-swatch {
  display: inline-block;
  width: 24px;
  height: 6px;
  border-radius: 9999px;
}
.legend-dash {
  display: inline-block;
  width: 24px;
  height: 0;
  border-top: 2px dashed #111;
}
</style>
