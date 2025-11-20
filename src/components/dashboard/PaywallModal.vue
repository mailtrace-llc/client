<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40"
          @click="onSecondary"
          aria-hidden="true"
        ></div>

        <!-- Modal card -->
        <div
          class="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-[min(640px,90vw)] p-6 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-title"
        >
          <header class="flex items-start justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h2
                id="paywall-title"
                class="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-50"
              >
                {{ cfg.title }}
              </h2>
              <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                {{ cfg.body }}
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="onSecondary"
              aria-label="Close paywall"
            >
              <span class="text-xl leading-none">&times;</span>
            </button>
          </header>

          <!-- Price summary / bullet points -->
          <section class="space-y-3 mb-6">
            <p class="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {{ cfg.priceSummary }}
            </p>

            <ul
              v-if="cfg.bullets && cfg.bullets.length"
              class="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300"
            >
              <li v-for="(b, idx) in cfg.bullets" :key="idx" class="flex gap-2">
                <span class="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>{{ b }}</span>
              </li>
            </ul>
          </section>

          <!-- Actions -->
          <footer class="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              @click="onSecondary"
              :disabled="loading"
            >
              {{ cfg.secondaryLabel || 'Maybe later' }}
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              @click="onPrimary"
              :disabled="loading"
            >
              <span v-if="!loading">
                {{ cfg.primaryLabel || 'Upgrade & run' }}
              </span>
              <span v-else>Processing…</span>
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface PaywallConfig {
  title?: string;
  body?: string;
  priceSummary?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  bullets?: string[];
}

const props = defineProps<{
  modelValue: boolean;
  config?: PaywallConfig;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "primary"): void;
  (e: "secondary"): void;
}>();

const cfg = computed<Required<PaywallConfig>>(() => ({
  title: props.config?.title ?? "Unlock Matching",
  body:
    props.config?.body ??
    "Subscribe to MailTrace to run matching and see performance for your campaigns.",
  priceSummary: props.config?.priceSummary ?? "$49/month + per-run charges",
  primaryLabel: props.config?.primaryLabel ?? "Upgrade & run",
  secondaryLabel: props.config?.secondaryLabel ?? "Maybe later",
  bullets: props.config?.bullets ?? [
    "Unlimited dashboards & uploads",
    "Pay per matching run with full attribution",
  ],
}));

const loading = computed(() => props.loading ?? false);

function onPrimary() {
  if (loading.value) return;
  emit("primary");
}

function onSecondary() {
  if (loading.value) return;
  emit("update:modelValue", false);
  emit("secondary");
}
</script>