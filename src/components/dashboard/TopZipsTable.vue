<template>
  <section class="top-zips-card">
    <header class="card-head">
      <h3 class="title">Top ZIPs</h3>
      <div class="cols">
        <span class="col col-zip">ZIP</span>
        <span class="col col-total">TOTAL MATCHES</span>
        <span class="col col-rate">MATCH RATE</span>
      </div>
      <div class="rule"></div>
    </header>

    <ul class="rows">
      <li
        v-for="(r, i) in rowsToShow"
        :key="i"
        class="row"
        :class="{ shaded: i % 2 === 0 }"
      >
        <span class="cell zip">{{ r.zip }}</span>
        <span class="cell total">{{ r.total.toLocaleString() }}</span>
        <span class="cell rate">{{ r.rate }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Row = { zip: string; total: number; rate: string };
const props = defineProps<{ rows?: Row[] }>();

// Fallback sample data from your JSON/screenshot
const fallback: Row[] = [
  { zip: "55424", total: 892, rate: "12%" },
  { zip: "55431", total: 849, rate: "12%" },
  { zip: "55491", total: 819, rate: "13%" },
  { zip: "55425", total: 530, rate: "9%" },
  { zip: "55424", total: 855, rate: "14%" },
  { zip: "55431", total: 786, rate: "11%" },
  { zip: "55425", total: 707, rate: "7%" },
];
const rowsToShow = computed<Row[]>(() =>
  props.rows?.length ? props.rows : fallback
);
</script>

<style scoped>
/* Card container — Rectangle 9: 771×414, #fff, r10, shadow */
.top-zips-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 771px;
  padding: 16px 20px;
  box-sizing: border-box;
  color: #0c2d50;
  font-family: var(
    --font-sans,
    "Instrument Sans",
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    sans-serif
  );
}

/* Header */
.card-head .title {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px; /* ≈21.96 */
  letter-spacing: -0.36px;
  margin: 0 0 12px 0;
  color: #0c2d50;
}

/* Column labels */
.cols {
  display: grid;
  grid-template-columns: 120px 1fr 140px; /* first column a bit narrower for ZIPs */
  align-items: center;
  gap: 12px;
}
.col {
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.28px;
  color: #47bfa9;
  text-transform: uppercase;
}
.col-total {
  justify-self: end;
}
.col-rate {
  justify-self: end;
}

/* Divider (Line 4 @ 30% opacity) */
.rule {
  margin-top: 10px;
  border-top: 1px solid rgba(109, 129, 150, 0.3);
}

/* Rows */
.rows {
  list-style: none;
  margin: 12px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: grid;
  grid-template-columns: 120px 1fr 140px;
  align-items: center;
  min-height: 47px; /* row rects: h 47 (33 on last in some designs—OK to keep 47) */
  padding: 0 12px;
  border-radius: 10px;
  color: #6b6b6b;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.28px;
  font-weight: 400;
}
.row.shaded {
  background: #f4f5f7;
}

.cell.zip {
  justify-self: start;
}
.cell.total {
  justify-self: end;
}
.cell.rate {
  justify-self: end;
}
</style>
