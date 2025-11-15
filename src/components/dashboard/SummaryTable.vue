<template>
  <section class="summary-card">
    <h3 class="title">Summary</h3>

    <div class="cols head">
      <span>MAIL ADDRESS 1</span>
      <span>MAIL UNIT</span>
      <span>CRM ADDRESS 1</span>
      <span>CRM UNIT</span>
      <span>CITY</span>
      <span>STATE</span>
      <span>ZIP</span>
      <span>MAIL DATES</span>
      <span>CRM DATE</span>
    </div>
    <div class="rule"></div>

    <ul class="srows">
      <li
        v-for="(r, i) in rowsToShow"
        :key="i"
        class="srow"
        :class="{ shaded: i % 2 === 0 }"
      >
        <span class="t">{{ r.mail_address1 }}</span>
        <span class="t mono">{{ r.mail_unit }}</span>
        <span class="t">{{ r.crm_address1 }}</span>
        <span class="t mono">{{ r.crm_unit }}</span>
        <span class="t">{{ r.city }}</span>
        <span class="t">{{ r.state }}</span>
        <span class="t mono">{{ r.zip }}</span>

        <!-- scrollable MAIL DATES cell -->
        <span class="t mono mail-dates">
          {{ r.mail_dates }}
        </span>

        <span class="t mono">{{ r.crm_date }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type Row = {
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

const props = defineProps<{ rows?: Row[] }>();

const rowsToShow = computed<Row[]>(() => props.rows ?? []);
</script>

<style scoped>
.summary-card {
  --summary-cols: minmax(220px, 2.2fr) 0.6fr minmax(220px, 2.2fr) 0.6fr 1fr
    0.6fr 0.8fr 1.4fr 1fr;

  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  padding: 16px 16px 12px;
  box-sizing: border-box;
  width: 100%;
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

.title {
  margin: 0 0 12px;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  letter-spacing: -0.36px;
}

.cols {
  display: grid;
  grid-template-columns: var(--summary-cols);
  gap: 12px;
  align-items: center;
}

.head span {
  color: #47bfa9;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.28px;
  text-transform: uppercase;
}

.rule {
  margin: 10px 0 6px;
  border-top: 1px solid rgba(109, 129, 150, 0.3);
}

/* Body: show ~20 rows, then scroll */
.srows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  max-height: 520px; /* tweak to taste */
  overflow-y: auto;
}

.srow {
  display: grid;
  grid-template-columns: var(--summary-cols);
  gap: 12px;
  align-items: center;
  min-height: 67px;
  padding: 0 12px;
  border-radius: 10px;
  color: #6b6b6b;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.28px;
  font-weight: 400;
}

.srow.shaded {
  background: #f4f5f7;
}

.t.mono {
  font-variant-numeric: tabular-nums;
}

/* MAIL DATES column scrolls independently if super long */
.mail-dates {
  display: block;
  max-height: 60px; /* ~3–4 lines visible */
  overflow-y: auto;
  white-space: pre-line;
}
</style>
