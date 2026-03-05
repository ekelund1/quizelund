<template>
  <div class="img-wrapper" :class="{ loaded: isLoaded }">
    <!-- Actual image -->
    <img
      :src="src"
      :alt="alt"
      class="question-img"
      @load="isLoaded = true"
      @error="hasError = true"
    />

    <!-- Vignette overlay — shades edges into the card background -->
    <div class="vignette"></div>

    <!-- Animated glowing border (separate element so it sits on top) -->
    <div class="glow-border"></div>

    <!-- Loading / error state -->
    <div v-if="!isLoaded && !hasError" class="placeholder">
      <span class="spinner"></span>
    </div>
    <div v-if="hasError" class="placeholder error">
      <span>⚠ Ingen bild</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  src: string
  alt?: string
}>()

const isLoaded = ref(false)
const hasError = ref(false)
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────── */
.img-wrapper {
  position: relative;
  width: 100%;
  max-height: 340px;
  border-radius: 16px;
  overflow: hidden;
  background: #0a0a10;

  /* Reveal with a fade + scale on load */
  opacity: 0;
  transform: scale(0.97);
  transition:
    opacity 0.7s ease,
    transform 0.7s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.img-wrapper.loaded {
  opacity: 1;
  transform: scale(1);
}

/* ── Image ───────────────────────────────────────────────── */
.question-img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 340px;
  object-fit: cover;
  /* slight zoom that settles once loaded — ties the scale to the wrapper */
  transform: scale(1.04);
  transition: transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.img-wrapper.loaded .question-img {
  transform: scale(1);
}

/* ── Vignette ────────────────────────────────────────────── */
/* Radial vignette fades center-outward into the dark card bg */
.vignette {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background:
    /* left edge  */
    linear-gradient(to right, #0d0a14 0%, transparent 28%),
    /* right edge */ linear-gradient(to left, #0d0a14 0%, transparent 28%),
    /* top edge   */ linear-gradient(to bottom, #0d0a14 0%, transparent 22%),
    /* bottom edge*/ linear-gradient(to top, #0d0a14 0%, transparent 22%);
  pointer-events: none;
  z-index: 1;
}

/* ── Animated glowing border ─────────────────────────────── */
.glow-border {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  pointer-events: none;
  z-index: 2;

  /* The border itself */
  box-shadow:
    inset 0 0 0 1.5px rgba(255, 107, 26, 0.35),
    0 0 0 1px rgba(255, 107, 26, 0.15);

  animation: borderPulse 3s ease-in-out infinite;
}

@keyframes borderPulse {
  0%,
  100% {
    box-shadow:
      inset 0 0 0 1.5px rgba(255, 107, 26, 0.35),
      0 0 18px rgba(255, 107, 26, 0.15),
      0 0 40px rgba(255, 107, 26, 0.05);
  }
  50% {
    box-shadow:
      inset 0 0 0 1.5px rgba(255, 140, 66, 0.65),
      0 0 30px rgba(255, 107, 26, 0.3),
      0 0 60px rgba(255, 107, 26, 0.12);
  }
}

/* ── Loading / error placeholder ────────────────────────── */
.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  z-index: 3;
}

.placeholder.error {
  color: #664433;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #1a1a24;
  border-top-color: #ff6b1a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
