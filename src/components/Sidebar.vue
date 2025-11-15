<!-- client/src/components/Sidebar.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

/* Assets */
import LogoUrl from "@/assets/source-logo-02.png";
/* IMPORTANT: import SVGs as URLs so <img :src> works even if vite-svg-loader is present */
import OverviewIcon from "@/assets/sidebar/overview-icon.svg?url";
import RoiIcon from "@/assets/sidebar/roi-icon.svg?url";
import MatchIcon from "@/assets/sidebar/match-performance-icon.svg?url";
import CampaignIcon from "@/assets/sidebar/campaign-insights-icon.svg?url";
import HeatmapIcon from "@/assets/sidebar/heatmap-icon.svg?url";
import UploadsIcon from "@/assets/sidebar/uploads-mapping-icon.svg?url";
import ReportsIcon from "@/assets/sidebar/reports-exports-icon.svg?url";
import HistoryIcon from "@/assets/sidebar/history-icon.svg?url";
import SettingsIcon from "@/assets/sidebar/settings-icon.svg?url";
import LogoutIcon from "@/assets/sidebar/logout-icon.svg?url";

const router = useRouter();
const route = useRoute();

const items = [
  { to: "/dashboard", label: "Overview", icon: OverviewIcon },
  { to: "/roi", label: "ROI Analytics", icon: RoiIcon },
  { to: "/match", label: "Match Performance", icon: MatchIcon },
  { to: "/campaigns", label: "Campaign Insights", icon: CampaignIcon },
  { to: "/heatmap", label: "Address Heatmap", icon: HeatmapIcon },
  { to: "/upload", label: "Uploads & Mapping", icon: UploadsIcon },
  { to: "/reports", label: "Reports & Exports", icon: ReportsIcon },
  { to: "/history", label: "History & Comparisons", icon: HistoryIcon },
];

function isActive(path: string) {
  return route.path === path;
}
function go(path: string) {
  router.push(path);
}
</script>

<template>
  <!-- sticky keeps the card pinned and visually full-height next to content -->
  <aside class="sidebar-wrap">
    <nav class="sidebar-card">
      <div class="logo-row">
        <img :src="LogoUrl" alt="MailTrace" class="logo" draggable="false" />
      </div>

      <hr class="sep" />

      <ul class="nav-list">
        <li v-for="i in items" :key="i.to">
          <button
            class="nav-btn"
            :class="{ active: isActive(i.to) }"
            @click="go(i.to)"
          >
            <img class="icon" :src="i.icon" :alt="i.label" draggable="false" />
            <span class="label">{{ i.label }}</span>
          </button>
        </li>
      </ul>

      <hr class="sep sep-bottom" />

      <div class="bottom">
        <button class="nav-btn ghost" @click="go('/settings')">
          <img class="icon" :src="SettingsIcon" alt="" draggable="false" />
          <span class="label">Settings</span>
        </button>
        <button class="nav-btn ghost" @click="go('/signout')">
          <img class="icon" :src="LogoutIcon" alt="" draggable="false" />
          <span class="label">Sign Out</span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* Wrapper so the card is pinned and fills vertically beside content */
.sidebar-wrap {
  position: sticky;
  top: 12px; /* matches the Figma gutter under the top bar */
  align-self: start; /* so sticky works inside CSS grid layouts */
  height: calc(100vh - 24px);
}

/* Card container */
.sidebar-card {
  width: 318px; /* Figma width */
  max-width: 318px;
  height: 100%;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(12, 45, 80, 0.08);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
}

.logo-row {
  padding: 6px 8px 10px;
}
.logo {
  height: 43px;
  width: auto;
  object-fit: contain;
}

.sep {
  border: none;
  height: 1px;
  background: #47bfa9;
  margin: 10px 8px 12px;
  border-radius: 1px;
}
.sep-bottom {
  margin-top: 12px;
}

.nav-list {
  display: grid;
  row-gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-btn {
  width: 100%;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 10px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;
}
.nav-btn:hover {
  background: #f4f5f7;
}
.nav-btn.active {
  background: #f4f5f7; /* selected row fill in Figma */
  box-shadow: 0 1px 2px rgba(12, 45, 80, 0.06);
}

.icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.label {
  font-family: "Instrument Sans", system-ui, -apple-system, Segoe UI, Roboto,
    sans-serif;
  font-size: 16px;
  line-height: 19.5px;
  font-weight: 500;
  color: #47bfa9;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Bottom group pinned to the end */
.bottom {
  margin-top: auto;
  display: grid;
  row-gap: 10px;
  padding: 6px 0 4px;
}
.ghost .label {
  color: #47bfa9;
}

/* Narrow screens: let it flex smaller if the layout stacks */
@media (max-width: 1024px) {
  .sidebar-card,
  .sidebar-wrap {
    width: 100%;
    max-width: none;
    height: auto;
  }
}
</style>
