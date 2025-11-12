<script setup lang="ts">
import { ref } from "vue";

import UploadIconUrl from "@/assets/upload_fi-10009684.svg?url";

import { useRun } from "@/composables/useRun";
import { uploadSource, type Source } from "@/api/uploads";
import { createRun } from "@/api/runs";
import { log } from "@/utils/logger";

const emit = defineEmits<{
  (e: "mapping-required", missing: Record<string, string[]>): void;
  (e: "need-both-files"): void;
}>();

/* ---- state --------------------------------------- */
const runId = ref<string>("");
const mailInput = ref<HTMLInputElement | null>(null);
const crmInput = ref<HTMLInputElement | null>(null);

const mailDrag = ref(false);
const crmDrag = ref(false);

/* ---- helpers ------------------------------------------------------------ */
async function ensureRun() {
  if (!runId.value) {
    log.debug("UI ▶ ensureRun: creating run…");
    const { run_id } = await createRun();
    runId.value = run_id;
    (window as any).MT_CONTEXT = { ...(window as any).MT_CONTEXT, run_id };
    log.info("UI ▶ ensureRun: run created", { runId: run_id });
  }
}

function csvGuard(file: File): boolean {
  const ok =
    file.type?.includes("csv") || file.name.toLowerCase().endsWith(".csv");
  if (!ok) alert("Please select a CSV file.");
  return ok;
}

async function handleFile(source: Source, file: File) {
  if (!file) return;
  if (!csvGuard(file)) return;

  await ensureRun();
  try {
    log.info("UI ▶ upload start", {
      runId: runId.value,
      source,
      name: file.name,
      size: file.size,
    });
    const res = await uploadSource(runId.value, source, file);
    log.info("UI ▶ upload done", { source, res });

    // If backend says mapping is required, open mapper
    if ((res as any).state === "raw_only") {
      window.dispatchEvent(
        new CustomEvent("mt:open-mapper", {
          detail: { run_id: runId.value, source },
        })
      );
    }
  } catch (e: any) {
    log.error("UI ▶ upload failed", e);
    alert(`Upload failed: ${e?.message || "unknown error"}`);
    const el = source === "mail" ? mailInput.value : crmInput.value;
    if (el) el.value = "";
  }
}

/* ---- pick (file input) -------------------------------------------------- */
function onPick(source: Source) {
  const el = source === "mail" ? mailInput.value : crmInput.value;
  const f = el?.files?.[0];
  if (f) void handleFile(source, f);
}

/* ---- drag & drop (drop-zone) ------------------------------------------- */
function onDragOverMail(e: DragEvent) {
  e.preventDefault();
  mailDrag.value = true;
}
function onDragLeaveMail() {
  mailDrag.value = false;
}
function onDropMail(e: DragEvent) {
  e.preventDefault();
  mailDrag.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) void handleFile("mail", f);
}

function onDragOverCrm(e: DragEvent) {
  e.preventDefault();
  crmDrag.value = true;
}
function onDragLeaveCrm() {
  crmDrag.value = false;
}
function onDropCrm(e: DragEvent) {
  e.preventDefault();
  crmDrag.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) void handleFile("crm", f);
}

/* ---- mapper / run (original names & flow) ------------------------------- */
function openMapper(source?: Source) {
  if (!runId.value) {
    alert("Create a run by uploading at least one CSV first.");
    return;
  }
  log.info("UI ▶ open mapper clicked", { runId: runId.value, source });
  window.dispatchEvent(
    new CustomEvent("mt:open-mapper", {
      detail: { run_id: runId.value, ...(source ? { source } : {}) },
    })
  );
}

const { running, kickOffAndPoll } = useRun();

async function onRun(ev?: Event) {
  ev?.preventDefault?.();

  const hasMail = !!mailInput.value?.files?.[0];
  const hasCrm = !!crmInput.value?.files?.[0];
  if (!hasMail || !hasCrm) {
    emit("need-both-files");
    return;
  }

  await ensureRun();
  log.info("UI ▶ Run clicked", { runId: runId.value });

  await kickOffAndPoll(runId.value, (missing) => {
    log.warn("UI ▶ needs mapping (409)", { runId: runId.value, missing });
    emit("mapping-required", missing);
    window.dispatchEvent(
      new CustomEvent("mt:open-mapper", {
        detail: { run_id: runId.value, missing },
      })
    );
  });
}

/* convenience for click-to-browse */
function browseMail() {
  mailInput.value?.click();
}
function browseCrm() {
  crmInput.value?.click();
}
</script>

<template>
  <section class="upload-card card">
    <!-- MAIL -->
    <div class="row">
      <h3 class="row-title">Mail CSV</h3>

      <div
        class="drop-zone"
        :class="{ 'is-drag': mailDrag }"
        role="button"
        tabindex="0"
        @click="browseMail"
        @dragover="onDragOverMail"
        @dragleave="onDragLeaveMail"
        @drop="onDropMail"
      >
        <div class="dz-inner">
          <span class="dz-badge" aria-hidden="true">
            <img
              class="dz-icon"
              :src="UploadIconUrl"
              alt=""
              draggable="false"
            />
          </span>

          <p class="dz-text">
            Drop your files here or
            <button class="dz-link" type="button" @click.stop="browseMail">
              browse
            </button>
          </p>
          <small class="dz-sub">Max file size up to 20 MB</small>
        </div>

        <input
          ref="mailInput"
          type="file"
          accept=".csv,text/csv"
          class="sr-only"
          @change="onPick('mail')"
        />
      </div>
    </div>

    <!-- CRM -->
    <div class="row row--crm">
      <h3 class="row-title">CRM CSV</h3>

      <div
        class="drop-zone"
        :class="{ 'is-drag': crmDrag }"
        role="button"
        tabindex="0"
        @click="browseCrm"
        @dragover="onDragOverCrm"
        @dragleave="onDragLeaveCrm"
        @drop="onDropCrm"
      >
        <div class="dz-inner">
          <span class="dz-badge" aria-hidden="true">
            <img
              class="dz-icon"
              :src="UploadIconUrl"
              alt=""
              draggable="false"
            />
          </span>

          <p class="dz-text">
            Drop your files here or
            <button class="dz-link" type="button" @click.stop="browseCrm">
              browse
            </button>
          </p>
          <small class="dz-sub">Max file size up to 20 MB</small>
        </div>

        <input
          ref="crmInput"
          type="file"
          accept=".csv,text/csv"
          class="sr-only"
          @change="onPick('crm')"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div class="actions">
      <button
        class="btn btn-primary"
        :disabled="running"
        type="button"
        @click="onRun"
      >
        <span v-if="!running">Run Matching</span>
        <span v-else>Running…</span>
      </button>
      <button class="btn btn-ghost" type="button" @click="openMapper()">
        Edit Mapping
      </button>
    </div>
  </section>
</template>

<style scoped>
.upload-card {
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(12, 45, 80, 0.08),
    0 10px 24px rgba(12, 45, 80, 0.06);
  background: #fff;
  padding: 16px 16px 14px;
}

/* label on left, dropzone on right */
.row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 16px;
  padding: 8px 4px;
}
.row + .row {
  margin-top: 10px;
}
.row-title {
  color: #0c2d50;
  font-weight: 600;
  font-size: 18px;
  margin: 0;
}

/* dropzone */
.drop-zone {
  position: relative;
  background: #f4f5f7;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(12, 45, 80, 0.06);
  min-height: 128px;
  padding: 18px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
}
.drop-zone.is-drag {
  outline: 2px dashed #47bfa9;
  background: #eef7f5;
}

.dz-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.dz-badge {
  width: 27px;
  height: 27px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(12, 45, 80, 0.12);
  display: grid;
  place-items: center;
  margin-bottom: 6px;
}
.dz-icon {
  width: 15px;
  height: 15px;
  object-fit: contain;
  display: block;
}

.dz-text {
  margin: 0;
  line-height: 1.2;
  color: #111;
}
.dz-link {
  color: #0c2d50;
  text-decoration: underline;
  font-weight: 600;
  margin-left: 4px;
}
.dz-sub {
  color: rgba(0, 0, 0, 0.66);
}

/* full-width buttons */
.actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.btn {
  height: 48px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  border: 2px solid transparent;
}
.btn-primary {
  background: #47bfa9;
  color: #fff;
}
.btn-primary:hover {
  filter: brightness(0.98);
}
.btn-ghost {
  background: #fff;
  color: #0c2d50;
  border-color: #cfd6dd;
}
.btn-ghost:hover {
  background: #f8fafb;
}

/* screen-reader only input */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
