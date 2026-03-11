<template>
  <div class="countdown-wrap">
    <svg class="countdown-svg" viewBox="0 0 120 120">
      <!-- Track ring -->
      <circle cx="60" cy="60" r="52" class="ring-track" />
      <!-- Progress ring — drains as time passes -->
      <circle
        cx="60"
        cy="60"
        r="52"
        class="ring-progress"
        :class="{ urgent: secondsLeft <= 5 }"
        :style="{ strokeDashoffset: dashOffset }"
      />
    </svg>
    <!-- numbers hidden intentionally -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  seconds?: number
  delay?: number // ms to wait before ticking starts
}>()

const TOTAL = props.seconds ?? 25
const CIRCUMFERENCE = 2 * Math.PI * 52 // r = 52

const secondsLeft = ref(TOTAL)

const dashOffset = computed(() => CIRCUMFERENCE * (1 - secondsLeft.value / TOTAL))

let interval: ReturnType<typeof setInterval> | null = null
let delayTimeout: ReturnType<typeof setTimeout> | null = null

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.7, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    /* AudioContext not available */
  }
}

function startTicking() {
  interval = setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
    if (secondsLeft.value === 0) {
      clearInterval(interval!)
      interval = null
      beep()
    }
  }, 1000)
}

onMounted(() => {
  if (props.delay && props.delay > 0) {
    delayTimeout = setTimeout(startTicking, props.delay)
  } else {
    startTicking()
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (delayTimeout) clearTimeout(delayTimeout)
})
</script>

<style scoped>
.countdown-wrap {
  position: absolute;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  right: 1.5rem;
  top: 1.5rem;
}

.countdown-svg {
  width: 52px;
  height: 52px;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: #1a1a28;
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: #ff6b1a;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: v-bind(CIRCUMFERENCE);
  transition:
    stroke-dashoffset 1s linear,
    stroke 0.4s ease;
}

.ring-progress.urgent {
  stroke: #ff2244;
}

/* number hidden — remove display entirely */
.countdown-number {
  display: none;
}

@keyframes urgentPulse {
  to {
    transform: scale(1.12);
    text-shadow: 0 0 20px rgba(255, 35, 68, 0.8);
  }
}
</style>
