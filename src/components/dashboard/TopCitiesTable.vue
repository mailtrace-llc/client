<template>
  <section class="top-cities-card">
    <header class="card-head">
      <h3 class="title">Top Cities</h3>
      <div class="cols">
        <span class="col col-city">CITY</span>
        <span class="col col-total">TOTAL MATCHES</span>
        <span class="col col-rate">MATCH RATE</span>
      </div>
      <div class="rule"></div>
    </header>

    <ul class="rows">
      <li
        v-for="(r, i) in rows"
        :key="i"
        class="row"
        :class="{ shaded: i % 2 === 0 }"
      >
        <span class="cell city">{{ r.city }}</span>
        <span class="cell total">{{ r.total.toLocaleString() }}</span>
        <span class="cell rate">{{ r.rate }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
type Row = { city: string; total: number; rate: string };

// placeholder data to match your screenshot text (replace with API data)
const rows: Row[] = [
  { city: "Bloomington", total: 892, rate: "12%" },
  { city: "Edina", total: 849, rate: "12%" },
  { city: "Minneapolis", total: 819, rate: "13%" },
  { city: "Saint Paul", total: 530, rate: "9%" },
  { city: "Bloomington", total: 855, rate: "14%" },
  { city: "Edina", total: 786, rate: "11%" },
  { city: "Minneapolis", total: 707, rate: "7%" },
];
</script>

<style scoped>
/* Card container — from Rectangle 5 (771×414), bg #fff, radius 10, shadow */
.top-cities-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12); /* your summary marks shadow: true */
  width: 100%;
  max-width: 771px; /* match the design width but allow shrink */
  padding: 16px 20px;
  box-sizing: border-box;
  color: #0c2d50; /* headline color in your JSON */
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
  font-size: 18px; /* sz:18 */
  line-height: 22px; /* lh ≈ 21.96 */
  letter-spacing: -0.36px; /* ls:-0.36 */
  margin: 0 0 12px 0;
  color: #0c2d50;
}

/* Column labels */
.cols {
  display: grid;
  grid-template-columns: 1fr 160px 120px; /* adjust to match your layout */
  align-items: center;
  gap: 12px;
}
.col {
  font-weight: 600;
  font-size: 14px; /* sz:14 */
  line-height: 17px; /* lh ≈ 17.08 */
  letter-spacing: -0.28px; /* ls:-0.28 */
  color: #47bfa9; /* header accent from JSON */
  text-transform: uppercase;
}
.col-city {
}
.col-total {
  justify-self: end;
}
.col-rate {
  justify-self: end;
}

/* Divider (Line 3: color #6d8196 @ 30% opacity, 1px) */
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
  grid-template-columns: 1fr 160px 120px;
  align-items: center;
  min-height: 47px; /* rectangles 6/7/8: h 47 */
  padding: 0 12px;
  border-radius: 10px;
  color: #6b6b6b; /* body text color from JSON */
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.28px;
  font-weight: 400;
}
.row.shaded {
  background: #f4f5f7;
} /* even rows: Rectangle 6/7/8 bg */

.cell.city {
  justify-self: start;
}
.cell.total {
  justify-self: end;
}
.cell.rate {
  justify-self: end;
}
</style>
