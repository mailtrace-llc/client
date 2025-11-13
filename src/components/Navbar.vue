<!-- src/components/layout/Navbar.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    userName?: string;
    userRole?: string;
    avatarUrl?: string;
    /** If you want the search box hidden (e.g., on small pages) */
    showSearch?: boolean;
    /** Emits on Enter or click of the search icon */
    modelValue?: string;
  }>(),
  {
    title: "Dashboard",
    userName: "Matthew McNey",
    userRole: "Admin 1",
    avatarUrl: "",
    showSearch: true,
    modelValue: "",
  }
);

const q = ref(props.modelValue);
const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "search", v: string): void;
  (e: "profile-click"): void;
  (e: "settings-click"): void;
}>();

watch(
  () => props.modelValue,
  (v) => (q.value = v)
);

function doSearch() {
  emit("update:modelValue", q.value);
  emit("search", q.value);
}

// Simple fallback avatar (initials)
const initials = computed(() => {
  const name = (props.userName ?? "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  const a = parts[0]?.charAt(0) ?? "";
  const b = parts[1]?.charAt(0) ?? "";
  const letters = (a + b || a || "U").toUpperCase();
  return letters;
});

onMounted(() => {
  // autofocus search when you want; keep off by default
});
</script>

<template>
  <!-- Outer container is a card that sits under the top bar but INSIDE the content column -->
  <div
    class="rounded-xl bg-white shadow-[0_1px_3px_rgba(12,45,80,.08),0_10px_24px_rgba(12,45,80,.06)] px-5 py-3 flex items-center gap-4"
  >
    <!-- Title (left, aligns to the content column start) -->
    <h1
      class="text-[28px] leading-[34px] font-medium tracking-[-0.02em] text-[#0c2d50]"
    >
      {{ props.title }}
    </h1>

    <!-- Spacer before search -->
    <div class="grow"></div>

    <!-- Search box -->
    <div
      v-if="props.showSearch"
      class="hidden md:flex items-center gap-3 rounded-xl bg-[#f4f5f7] h-12 px-4 min-w-[360px] max-w-[520px] shadow-[inset_0_1px_0_rgba(0,0,0,.04)]"
    >
      <!-- Search icon -->
      <input
        v-model="q"
        type="text"
        placeholder="Search"
        class="bg-transparent outline-none w-full text-[16px] placeholder-[#6b6b6b]"
        @keydown.enter.prevent="doSearch"
      />

      <button
        class="rounded-lg p-2 hover:bg-white/70 transition"
        @click="doSearch"
        aria-label="Search"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5">
          <path
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            fill="none"
            stroke="#47bfa9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- User area -->
    <div class="hidden sm:flex items-center gap-3 pl-2">
      <!-- Avatar circle -->
      <button
        class="w-[42px] h-[42px] rounded-full overflow-hidden bg-[#f4f5f7] ring-1 ring-black/5 flex items-center justify-center"
        @click="$emit('profile-click')"
        aria-label="Profile"
      >
        <img
          v-if="props.avatarUrl"
          :src="props.avatarUrl"
          alt=""
          class="w-full h-full object-cover"
        />
        <span v-else class="text-sm font-semibold text-[#0c2d50]">{{
          initials
        }}</span>
      </button>

      <!-- Name + role -->
      <div class="leading-tight">
        <div class="text-[16px] font-semibold tracking-[0.01em] text-black">
          {{ props.userName }}
        </div>
        <div class="text-[14px] text-[#47bfa9]">{{ props.userRole }}</div>
      </div>

      <!-- Spacer between user and round buttons -->
      <div class="w-2"></div>

      <!-- Notifications -->
      <button
        class="w-[42px] h-[42px] rounded-full bg-[#f4f5f7] grid place-items-center hover:bg-[#e9ecef] transition"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5">
          <path
            d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M13.73 21a2 2 0 0 1-3.46 0"
            fill="none"
            stroke="#47bfa9"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
