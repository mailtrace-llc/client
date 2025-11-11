<!-- client/src/App.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterView } from "vue-router";
import Loader from "@/components/Loader.vue";
import Sidebar from "@/components/Sidebar.vue";
import "@/styles/index.css";

const route = useRoute();
// Show no sidebar (and full-width content) on marketing pages like /welcome
const isMarketing = computed(() => route.meta.marketing === true);
</script>

<template>
  <Loader />
  <div class="app" :class="{ 'app--marketing': isMarketing }">
    <Sidebar v-if="!isMarketing" />
    <main class="app-main" :class="{ 'app-main--full': isMarketing }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* If your global CSS already handles layout, you can skip this.
   These keep things sane if `.app` expects a sidebar. */
.app {
  display: flex;
  min-height: 100vh;
}
.app-main {
  flex: 1;
}

/* When marketing page: no sidebar gutter */
.app--marketing {
  /* optional: different bg if you want */
}
.app-main--full {
  margin-left: 0;
  padding-left: 0;
}
</style>
