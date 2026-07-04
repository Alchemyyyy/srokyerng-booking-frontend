<script setup>
/**
 * ReceiptUploadForm
 * A self-contained drag-and-drop file upload form for payment receipts/proofs.
 *
 * Props:
 *   loading: boolean — shows spinner on submit button
 *   maxSizeMb: number — default 5
 *   accept: string — default 'image/*,.pdf'
 *
 * Emits:
 *   submit(file: File) — called when the user confirms the selected file
 *   clear — called when the user removes the selected file
 */
import { ref, computed } from "vue";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/vue/24/outline";
import AppButton from "@/shared/components/AppButton.vue";

const props = defineProps({
  loading: { type: Boolean, default: false },
  maxSizeMb: { type: Number, default: 5 },
  accept: { type: String, default: "image/*,.pdf" },
});

const emit = defineEmits(["submit", "clear"]);

const isDragging = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const sizeError = ref(null);

const isImage = computed(() => selectedFile.value?.type?.startsWith("image/"));

function processFile(file) {
  sizeError.value = null;
  const maxBytes = props.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    sizeError.value = `File is too large. Maximum size is ${props.maxSizeMb}MB.`;
    return;
  }
  selectedFile.value = file;
  previewUrl.value = isImage.value ? URL.createObjectURL(file) : null;
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
}

function removeFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = null;
  previewUrl.value = null;
  sizeError.value = null;
  emit("clear");
}

const transactionReference = ref("");

function handleSubmit() {
  if (selectedFile.value) {
    emit("submit", selectedFile.value, transactionReference.value.trim());
  }
}

const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return "";
  const kb = selectedFile.value.size / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
});
</script>

<template>
  <div class="upload-form">
    <!-- Drop zone -->
    <div
      class="upload-zone"
      :class="{
        'upload-zone--dragging': isDragging,
        'upload-zone--filled': !!selectedFile,
        'upload-zone--error': !!sizeError,
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Hidden file input — only shown when no file is selected -->
      <input
        v-if="!selectedFile"
        type="file"
        class="upload-zone__input"
        :accept="accept"
        @change="handleFileSelect"
        aria-label="Upload payment receipt"
      />

      <!-- Empty state -->
      <div v-if="!selectedFile" class="upload-zone__empty">
        <div
          class="upload-zone__icon-wrap"
          :class="{ 'upload-zone__icon-wrap--dragging': isDragging }"
        >
          <CloudArrowUpIcon class="upload-zone__icon" />
        </div>
        <h3 class="upload-zone__heading">
          {{ isDragging ? "Drop it here" : "Upload your receipt" }}
        </h3>
        <p class="upload-zone__hint">
          Drag and drop, or click to browse.<br />
          PNG, JPG, PDF — max {{ maxSizeMb }}MB.
        </p>
      </div>

      <!-- Filled state -->
      <div v-else class="upload-zone__filled">
        <!-- Image preview -->
        <div v-if="isImage" class="upload-zone__preview-wrap">
          <img
            :src="previewUrl"
            class="upload-zone__preview-img"
            alt="Receipt preview"
          />
          <div class="upload-zone__preview-overlay">
            <button
              type="button"
              class="upload-zone__remove-btn"
              @click.stop="removeFile"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Non-image (PDF) preview -->
        <div v-else class="upload-zone__doc-preview">
          <DocumentIcon class="upload-zone__doc-icon" />
          <button
            type="button"
            class="upload-zone__remove-icon"
            @click.stop="removeFile"
            aria-label="Remove file"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- File info row -->
        <div class="upload-zone__file-info">
          <CheckCircleIcon class="upload-zone__file-ok-icon" />
          <span class="upload-zone__file-name">{{ selectedFile.name }}</span>
          <span class="upload-zone__file-size">{{ fileSizeLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Size error -->
    <p v-if="sizeError" class="upload-form__error" role="alert">
      {{ sizeError }}
    </p>

    <!-- Transaction reference -->
    <div v-if="selectedFile" class="upload-form__reference">
      <label class="upload-form__reference-label" for="transaction-reference">
        Transaction reference
        <span class="upload-form__reference-optional">(optional)</span>
      </label>
      <input
        id="transaction-reference"
        v-model="transactionReference"
        type="text"
        class="upload-form__reference-input"
        placeholder="e.g. the reference number from your bank app"
      />
    </div>

    <!-- Submit -->
    <AppButton
      v-if="selectedFile"
      variant="primary"
      size="lg"
      class="upload-form__submit"
      :loading="loading"
      :disabled="loading"
      @click="handleSubmit"
    >
      Submit Payment for Review
    </AppButton>
  </div>
</template>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Drop zone */
.upload-zone {
  position: relative;
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: 22px;
  min-height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s,
    background 0.2s;
  overflow: hidden;
}

.upload-zone--dragging {
  border-color: var(--color-primary);
  background: rgba(55, 138, 221, 0.04);
}

.upload-zone--filled {
  border-style: solid;
}

.upload-zone--error {
  border-color: var(--color-danger, #dc3545);
}

/* Invisible full-zone file input */
.upload-zone__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Empty state */
.upload-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.25rem;
  pointer-events: none;
  user-select: none;
}

.upload-zone__icon-wrap {
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 18px;
  background: var(--color-primary-soft, rgba(55, 138, 221, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.9rem;
  transition: transform 0.2s;
}

.upload-zone__icon-wrap--dragging {
  transform: scale(1.1);
}

.upload-zone__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-primary);
}

.upload-zone__heading {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 800;
}

.upload-zone__hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-muted);
  line-height: 1.6;
}

/* Filled state */
.upload-zone__filled {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  width: 100%;
}

/* Image preview */
.upload-zone__preview-wrap {
  position: relative;
  max-width: 280px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.upload-zone__preview-img {
  width: 100%;
  max-height: 210px;
  object-fit: cover;
  display: block;
}

.upload-zone__preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.upload-zone__preview-wrap:hover .upload-zone__preview-overlay {
  opacity: 1;
}

.upload-zone__remove-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: none;
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.upload-zone__remove-btn:hover {
  background: rgba(220, 53, 69, 0.8);
}

/* PDF preview */
.upload-zone__doc-preview {
  position: relative;
  width: 100px;
  height: 100px;
  background: rgba(55, 138, 221, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.upload-zone__doc-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary);
}

.upload-zone__remove-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-muted);
  transition:
    background 0.15s,
    color 0.15s;
}

.upload-zone__remove-icon:hover {
  background: var(--color-danger, #dc3545);
  color: white;
  border-color: var(--color-danger, #dc3545);
}

/* File info row */
.upload-zone__file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(29, 158, 117, 0.08);
  border: 1px solid rgba(29, 158, 117, 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  max-width: 100%;
}

.upload-zone__file-ok-icon {
  width: 1rem;
  height: 1rem;
  color: #1d9e75;
  flex-shrink: 0;
}

.upload-zone__file-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d9e75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.upload-zone__file-size {
  font-size: 0.72rem;
  color: var(--color-muted);
  white-space: nowrap;
}

/* Error */
.upload-form__error {
  margin: 0;
  font-size: 0.83rem;
  color: var(--color-danger, #dc3545);
  padding: 0 0.5rem;
}

/* Transaction reference */
.upload-form__reference {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.upload-form__reference-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
}

.upload-form__reference-optional {
  font-weight: 500;
  color: var(--color-muted);
}

.upload-form__reference-input {
  width: 100%;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}

.upload-form__reference-input:focus {
  border-color: var(--color-primary);
}

/* Submit */
.upload-form__submit {
  width: 100%;
}
</style>
