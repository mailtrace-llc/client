<!-- client/src/components/dashboard/MapperModal.vue -->
<template>
  <div
    v-if="open"
    class="mapper-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mapper-title"
    aria-describedby="mapper-desc"
    @click="onBackdrop"
  >
    <section class="mapper-modal" role="document" tabindex="-1" ref="dialogEl">
      <header class="mapper-header">
        <span class="dot" aria-hidden="true" />
        <div class="titles">
          <h3 id="mapper-title">Map Columns</h3>
          <p class="subtitle">
            Map your CSV headers to MailTrace fields used for matching.
          </p>
        </div>
      </header>

      <div class="mapper-body">
        <p id="mapper-desc" class="mapper-hint">
          Choose which <strong>file headers</strong> correspond to each field.
          Leave blank if a field doesn’t exist in your data.
        </p>

        <div class="mapper-grid">
          <!-- MAIL SIDE -->
          <article class="side-card">
            <div class="side-header">
              <h4>Mail CSV</h4>
              <span class="side-sub">Outbound mailers</span>
            </div>
            <div class="field-list">
              <div v-for="f in fields" :key="'mail-' + f" class="field-row">
                <div class="field-meta">
                  <label :for="'mail-' + f" class="field-label">
                    {{ labelFor(f) }}
                  </label>
                  <span v-if="f" class="pill pill-required"> Required </span>
                  <span v-else class="pill pill-optional"> Optional </span>
                </div>
                <div class="field-control">
                  <select
                    class="field-select"
                    :class="{
                      'is-missing': f && !draft.mail[f],
                    }"
                    :id="'mail-' + f"
                    v-model="draft.mail[f]"
                  >
                    <option value=""></option>
                    <option
                      v-for="h in mailHeaders"
                      :key="'mh-' + h"
                      :value="h"
                    >
                      {{ h }}
                    </option>
                  </select>
                  <p v-if="samplePreview('mail', f)" class="sample">
                    e.g. {{ samplePreview("mail", f) }}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <!-- CRM SIDE -->
          <article class="side-card">
            <div class="side-header">
              <h4>CRM CSV</h4>
              <span class="side-sub">Jobs / conversions</span>
            </div>
            <div class="field-list">
              <div v-for="f in fields" :key="'crm-' + f" class="field-row">
                <div class="field-meta">
                  <label :for="'crm-' + f" class="field-label">
                    {{ labelFor(f) }}
                  </label>
                  <span v-if="f" class="pill pill-required"> Required </span>
                  <span v-else class="pill pill-optional"> Optional </span>
                </div>
                <div class="field-control">
                  <select
                    class="field-select"
                    :class="{ 'is-missing': f && !draft.crm[f] }"
                    :id="'crm-' + f"
                    v-model="draft.crm[f]"
                  >
                    <option value=""></option>
                    <option v-for="h in crmHeaders" :key="'ch-' + h" :value="h">
                      {{ h }}
                    </option>
                  </select>
                  <p v-if="samplePreview('crm', f)" class="sample">
                    e.g. {{ samplePreview("crm", f) }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <footer class="mapper-footer">
        <button type="button" class="btn btn-ghost" @click="$emit('close')">
          Cancel
        </button>
        <button type="button" class="btn btn-primary" @click="confirm">
          Save mapping
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

type MappingSide = Record<string, string>;
type Mapping = { mail: MappingSide; crm: MappingSide };

const props = defineProps<{
  open: boolean;
  mailHeaders: string[];
  crmHeaders: string[];
  mailSamples: Record<string, any>[];
  crmSamples: Record<string, any>[];
  fields: string[];
  initialMapping?: Partial<Mapping>;
  labels?: Record<string, string>;
  requiredMail: string[];
  requiredCrm: string[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", mapping: Mapping): void;
}>();

const dialogEl = ref<HTMLElement | null>(null);

const titleCase = (s: string): string =>
  s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const labelFor = (f: string): string => props.labels?.[f] ?? titleCase(f);

function emptyMapping(fields: string[]): Mapping {
  const blank: MappingSide = {};
  for (const f of fields) blank[f] = "";
  return { mail: { ...blank }, crm: { ...blank } };
}

function mergeMapping(base: Mapping, over?: Partial<Mapping>): Mapping {
  if (!over) return base;

  const m: Mapping = {
    mail: { ...base.mail },
    crm: { ...base.crm },
  };

  if (over.mail) {
    const mail = over.mail as Record<string, string | undefined>;
    for (const k of Object.keys(mail)) {
      const v = mail[k];
      if (typeof v === "string") m.mail[k] = v;
    }
  }

  if (over.crm) {
    const crm = over.crm as Record<string, string | undefined>;
    for (const k of Object.keys(crm)) {
      const v = crm[k];
      if (typeof v === "string") m.crm[k] = v;
    }
  }

  return m;
}

const draft = ref<Mapping>(emptyMapping(props.fields));

function seedFromProps() {
  draft.value = mergeMapping(emptyMapping(props.fields), props.initialMapping);
}

function samplePreview(
  source: "mail" | "crm",
  canonField: string
): string | null {
  const header =
    source === "mail"
      ? draft.value.mail[canonField]
      : draft.value.crm[canonField];
  if (!header) return null;

  const rows =
    source === "mail" ? props.mailSamples ?? [] : props.crmSamples ?? [];
  if (!rows.length) return null;

  const vals = rows
    .map((r) => (r ? r[header] : undefined))
    .filter((v) => v !== undefined && v !== null && v !== "")
    .slice(0, 3);

  if (!vals.length) return null;
  return vals.join(", ");
}

// focus + seed on open
watch(
  () => props.open,
  (open) => {
    if (open) {
      seedFromProps();
      setTimeout(() => dialogEl.value?.focus(), 0);
    }
  }
);

onMounted(() => {
  if (props.open) {
    seedFromProps();
    dialogEl.value?.focus();
  }
});

// re-seed when backend inputs change
watch(() => [props.initialMapping, props.fields], seedFromProps, {
  deep: true,
});

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit("close");
  }
}

function onEsc(e: KeyboardEvent) {
  if (e.key === "Escape" && props.open) {
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", onEsc);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEsc);
});

function confirm() {
  emit("confirm", structuredClone(draft.value));
}
</script>

<style scoped>
.mapper-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.mapper-modal {
  width: min(820px, 96vw);
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(12, 45, 80, 0.08),
    0 10px 24px rgba(12, 45, 80, 0.16);
  border: 1px solid #dde3ea;
  display: flex;
  flex-direction: column;
  outline: none;
}

.mapper-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e2e8f0;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #5eead4 0%, #47bfa9 55%, #0f766e 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 2px rgba(71, 191, 169, 0.25);
}

.titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mapper-header h3 {
  font-size: 16px;
  margin: 0;
  color: #0c2d50;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.mapper-body {
  padding: 14px 16px 10px;
  overflow: auto;
}

.mapper-hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: #4b5563;
}

.mapper-hint strong {
  font-weight: 600;
  color: #0c2d50;
}

.mapper-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.side-card {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f9fafb;
  padding: 10px 12px 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.side-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.side-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0c2d50;
}

.side-sub {
  font-size: 11px;
  color: #6b7280;
}

.field-list {
  display: grid;
  gap: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  align-items: flex-start;
  gap: 8px;
}

.field-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #6b7280;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.pill-required {
  background: #fee2e2;
  color: #b91c1c;
}

.pill-optional {
  background: #e0f2fe;
  color: #0369a1;
}

.field-control {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-select {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 6px 8px;
  font-size: 13px;
  color: #0f172a;
  background: #ffffff;
}

.field-select:focus {
  outline: 2px solid #47bfa9;
  outline-offset: 1px;
  border-color: #47bfa9;
}

.field-select.is-missing {
  border-color: #f97373;
}

.sample {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
}

.mapper-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 10px 16px 14px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  height: 40px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 0 14px;
}

.btn-primary {
  background: #47bfa9;
  color: #ffffff;
  border-color: #47bfa9;
}

.btn-primary:hover {
  filter: brightness(0.98);
}

.btn-ghost {
  background: #ffffff;
  color: #0c2d50;
  border-color: #cfd6dd;
}

.btn-ghost:hover {
  background: #f8fafb;
}

@media (max-width: 900px) {
  .mapper-grid {
    grid-template-columns: 1fr;
  }

  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
