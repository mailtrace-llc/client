<script setup lang="ts">
import { ref } from "vue";

// IMPORTANT: `?url` so Vite gives us a URL string, not a module.
import UploadIconUrl from "@/assets/upload_fi-10009684.svg?url";

const emit = defineEmits<{ (e: "mapping-required", payload: any): void }>();

const mailInput = ref<HTMLInputElement | null>(null);
const crmInput = ref<HTMLInputElement | null>(null);

const mailFile = ref<File | null>(null);
const crmFile = ref<File | null>(null);

const mailDrag = ref(false);
const crmDrag = ref(false);

function browseMail() {
  mailInput.value?.click();
}
function browseCrm() {
  crmInput.value?.click();
}

function onPickMail(e: Event) {
  mailFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
}
function onPickCrm(e: Event) {
  crmFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
}

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
  if (f) mailFile.value = f;
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
  if (f) crmFile.value = f;
}

// keep buttons wiring
function runMatching() {
  // call your pipeline; placeholder kept
  // emit("mapping-required", {...});
}
function openMapper() {
  emit("mapping-required", {});
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
          @change="onPickMail"
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
          @change="onPickCrm"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div class="actions">
      <button class="btn btn-primary" type="button" @click="runMatching">
        Run Matching
      </button>
      <button class="btn btn-ghost" type="button" @click="openMapper">
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
