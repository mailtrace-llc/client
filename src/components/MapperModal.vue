<template>
  <div class="mapping-backdrop" v-show="open" @click="$emit('close')">
    <section
      class="mapping-modal"
      role="dialog"
      aria-modal="true"
      @click.stop
      tabindex="-1"
      ref="dialogEl"
    >
      <header>
        <span class="dot" />
        <h3>Map Columns</h3>
      </header>

      <div class="content">
        <p class="hint">
          Choose which file headers correspond to each field. Leave blank if a
          field doesn’t exist.
        </p>

        <div class="grid">
          <article class="panel">
            <h4>Mail</h4>
            <div class="form-grid">
              <div v-for="f in fields" :key="'mail-' + f" class="row">
                <label :for="'mail-' + f">{{ labelFor(f) }}</label>
                <select
                  class="select"
                  :id="'mail-' + f"
                  v-model="draft.mail[f]"
                >
                  <option value=""></option>
                  <option v-for="h in mailHeaders" :key="'mh-' + h" :value="h">
                    {{ h }}
                  </option>
                </select>
              </div>
            </div>
          </article>

          <article class="panel">
            <h4>CRM</h4>
            <div class="form-grid">
              <div v-for="f in fields" :key="'crm-' + f" class="row">
                <label :for="'crm-' + f">{{ labelFor(f) }}</label>
                <select class="select" :id="'crm-' + f" v-model="draft.crm[f]">
                  <option value=""></option>
                  <option v-for="h in crmHeaders" :key="'ch-' + h" :value="h">
                    {{ h }}
                  </option>
                </select>
              </div>
            </div>
          </article>
        </div>
      </div>

      <footer>
        <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="confirm">Confirm</button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

type MappingSide = Record<string, string>;
type Mapping = { mail: MappingSide; crm: MappingSide };

const props = defineProps<{
  open: boolean;
  mailHeaders: string[];
  crmHeaders: string[];
  fields: string[];
  // server-provided mapping seed; if omitted, starts blank
  initialMapping?: Partial<Mapping>;
  labels?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", mapping: Mapping): void;
}>();

const dialogEl = ref<HTMLElement | null>(null);

const titleCase = (s: string) =>
  s.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const labelFor = (f: string) => props.labels?.[f] ?? titleCase(f);

function emptyMapping(fields: string[]): Mapping {
  const blank: MappingSide = {};
  for (const f of fields) blank[f] = "";
  return { mail: { ...blank }, crm: { ...blank } };
}

function mergeMapping(base: Mapping, over?: Partial<Mapping>): Mapping {
  if (!over) return base;
  const m = { ...base, mail: { ...base.mail }, crm: { ...base.crm } };
  if (over.mail)
    for (const k of Object.keys(over.mail))
      m.mail[k] = over.mail[k] ?? m.mail[k];
  if (over.crm)
    for (const k of Object.keys(over.crm)) m.crm[k] = over.crm[k] ?? m.crm[k];
  return m;
}

const draft = ref<Mapping>(emptyMapping(props.fields));

function seedFromProps() {
  draft.value = mergeMapping(emptyMapping(props.fields), props.initialMapping);
}

// focus on open
watch(
  () => props.open,
  (o) => {
    if (o) setTimeout(() => dialogEl.value?.focus(), 0);
  }
);
onMounted(() => {
  if (props.open) dialogEl.value?.focus();
});

// re-seed when the backend changes inputs
watch(() => [props.initialMapping, props.fields], seedFromProps, {
  immediate: true,
  deep: true,
});

function confirm() {
  emit("confirm", structuredClone(draft.value));
}
</script>

<style scoped>
.mapping-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--shadow-rgb), 0.35);
  z-index: var(--z-modal, 10000);
}
.mapping-modal {
  width: min(760px, 96vw);
  background: var(--surface-color);
  color: var(--brand-color);
  border: 1px solid var(--line-color);
  border-radius: 14px;
  box-shadow: var(--elev-2);
  overflow: hidden;
}
header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--line-color);
}
h3 {
  font-size: 16px;
  line-height: 1.2;
  margin: 0;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--green-hi) 0%,
    var(--accent-color) 55%,
    var(--green-de) 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 2px color-mix(in srgb, var(--accent-color) 25%, transparent);
}
.content {
  padding: 16px;
}
.hint {
  font-size: 12px;
  color: var(--muted-color);
  margin: 0 0 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.panel {
  border: 1px solid var(--line-color);
  border-radius: 10px;
  padding: 12px;
  background: color-mix(in srgb, var(--brand-color) 2%, var(--surface-color));
  box-shadow: var(--elev-0);
}
.panel h4 {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--ink-color);
}

.form-grid {
  display: grid;
  gap: 10px;
}
.row {
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  gap: 8px;
}
label {
  font-size: 12px;
  color: var(--muted-color);
}
.select {
  width: 100%;
  border: 1px solid var(--line-color);
  border-radius: 10px;
  padding: 8px 10px;
  background: white;
  color: var(--ink-color);
  font-size: 13px;
}

footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--line-color);
}
.btn {
  appearance: none;
  border-radius: 10px;
  border: 1px solid var(--line-color);
  padding: 0.55rem 1rem;
  font-weight: 700;
  cursor: pointer;
  background: white;
  color: var(--brand-color);
}
.btn-primary {
  color: #fff;
  border-color: var(--green-de);
  background: linear-gradient(
    180deg,
    var(--green-hi) 0%,
    var(--accent-color) 45%,
    var(--green-de) 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 6px 14px rgba(var(--shadow-rgb), 0.1);
}
.btn-outline {
  background: #fff;
  color: var(--brand-color);
}
</style>
