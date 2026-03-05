<template>
  <!-- Hidden YouTube iframe (audio only — video is opacity:0 / size 0) -->
  <div class="yt-hidden" aria-hidden="true">
    <div :id="playerId"></div>
  </div>

  <!-- Music visualizer -->
  <div class="audio-player" :class="{ playing: isPlaying, fading: isFading }">
    <!-- Ripple rings -->
    <div class="rings">
      <span
        v-for="n in 4"
        :key="n"
        class="ring"
        :style="{ animationDelay: `${(n - 1) * 0.4}s` }"
      ></span>
    </div>

    <!-- Equalizer bars -->
    <div class="eq-bars">
      <span
        v-for="n in 12"
        :key="n"
        class="bar"
        :style="{
          animationDelay: `${((n - 1) * 0.09).toFixed(2)}s`,
          '--height': `${30 + ((n * 37) % 60)}%`,
        }"
      ></span>
    </div>

    <!-- Icon + label -->
    <div class="player-label">
      <span class="music-note">♪</span>
      <span class="status-text">{{
        isPlaying ? 'Spelar...' : isFading ? 'Avslutar...' : 'Laddar...'
      }}</span>
    </div>

    <!-- Countdown ring -->
    <svg class="countdown-ring" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" class="ring-track" />
      <circle
        cx="40"
        cy="40"
        r="34"
        class="ring-progress"
        :style="{ strokeDashoffset: dashOffset }"
      />
    </svg>
    <span class="countdown-text">{{ secondsLeft }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  videoId: string
  startSeconds: number
  duration: number // seconds to play
}>()

// Unique ID per instance so multiple players don't clash
const playerId = `yt-player-${Math.random().toString(36).slice(2, 8)}`

const isPlaying = ref(false)
const isFading = ref(false)
const secondsLeft = ref(props.duration)

const CIRCUMFERENCE = 2 * Math.PI * 34 // r=34
const dashOffset = computed(() => CIRCUMFERENCE * (1 - secondsLeft.value / props.duration))

let player: InstanceType<Window['YT']['Player']> | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

// ── Load / init YT IFrame API ────────────────────────────
function initPlayer() {
  player = new window.YT.Player(playerId, {
    height: '1',
    width: '1',
    videoId: props.videoId,
    playerVars: {
      autoplay: 1,
      start: props.startSeconds,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      modestbranding: 1,
      mute: 0,
    },
    events: {
      onReady: (e: YTPlayerEvent) => e.target.playVideo(),
      onStateChange: (e: YTStateEvent) => {
        if (e.data === window.YT.PlayerState.PLAYING) {
          isPlaying.value = true
          startCountdown()
        } else {
          isPlaying.value = false
        }
      },
    },
  })
}

function startCountdown() {
  secondsLeft.value = props.duration
  // Stop after duration
  stopTimer = setTimeout(() => fadeOut(), props.duration * 1000)
  // Tick every second
  countdownInterval = setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
  }, 1000)
}

function fadeOut() {
  isFading.value = true
  isPlaying.value = false
  // Fade audio volume down over 2 s then stop
  if (!player) return
  let vol = 100
  const fade = setInterval(() => {
    vol -= 10
    if (vol <= 0) {
      clearInterval(fade)
      player?.stopVideo()
      isFading.value = false
    } else {
      player?.setVolume(vol)
    }
  }, 200)
}

function clearTimers() {
  if (stopTimer) clearTimeout(stopTimer)
  if (countdownInterval) clearInterval(countdownInterval)
}

onMounted(() => {
  if (typeof window.YT !== 'undefined' && window.YT.Player) {
    initPlayer()
  } else {
    // Inject the script once and wait for the API ready callback
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'yt-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    // Queue our init — may be called by multiple players, safe to reassign
    const prev = (window as any).onYouTubeIframeAPIReady
    ;(window as any).onYouTubeIframeAPIReady = () => {
      prev?.()
      initPlayer()
    }
  }
})

onUnmounted(() => {
  clearTimers()
  try {
    player?.stopVideo()
  } catch {
    /* ignore */
  }
})
</script>

<script lang="ts">
// Minimal YT IFrame API types (no @types/youtube needed)
interface YTPlayerEvent {
  target: { playVideo(): void; stopVideo(): void; setVolume(v: number): void }
}
interface YTStateEvent {
  data: number
}
interface YTPlayerOptions {
  height: string
  width: string
  videoId: string
  playerVars?: Record<string, number>
  events?: { onReady?(e: YTPlayerEvent): void; onStateChange?(e: YTStateEvent): void }
}
declare class YTPlayer {
  constructor(el: string | HTMLElement, opts: YTPlayerOptions)
  playVideo(): void
  stopVideo(): void
  setVolume(vol: number): void
}
declare global {
  interface Window {
    YT: { Player: typeof YTPlayer; PlayerState: { PLAYING: number } }
    onYouTubeIframeAPIReady(): void
  }
}
export { };
</script>

<style scoped>
/* ── Hide the actual video ──────────────────────────────── */
.yt-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

/* ── Player container ───────────────────────────────────── */
.audio-player {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  min-height: 200px;
}

/* ── Ripple rings ───────────────────────────────────────── */
.rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ring {
  position: absolute;
  border: 2px solid rgba(255, 107, 26, 0.35);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: none;
  opacity: 0;
}

.playing .ring {
  animation: ripple 2s ease-out infinite;
}
.fading .ring {
  animation: ripple 2s ease-out infinite;
  opacity: 0.4;
}

@keyframes ripple {
  0% {
    transform: scale(0.6);
    opacity: 0.7;
  }
  100% {
    transform: scale(3.5);
    opacity: 0;
  }
}

/* ── Equalizer bars ─────────────────────────────────────── */
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 60px;
  z-index: 1;
}

.bar {
  width: 6px;
  border-radius: 3px;
  background: linear-gradient(to top, #ff6b1a, #ff8c42);
  height: 15%;
  transition: height 0.2s;
  animation: none;
  box-shadow: 0 0 6px rgba(255, 107, 26, 0.5);
}

.playing .bar {
  animation: equalize 0.6s ease-in-out infinite alternate;
  height: var(--height);
}

.fading .bar {
  animation: equalize 0.6s ease-in-out infinite alternate;
  opacity: 0.3;
}

@keyframes equalize {
  0% {
    height: 15%;
  }
  100% {
    height: var(--height);
  }
}

/* ── Label ──────────────────────────────────────────────── */
.player-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  z-index: 1;
}

.music-note {
  font-size: 1.3rem;
  color: #ff6b1a;
  animation: none;
}

.playing .music-note {
  animation: bounce 0.5s ease-in-out infinite alternate;
}

@keyframes bounce {
  to {
    transform: translateY(-4px) scale(1.15);
  }
}

.status-text {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #666;
}

.playing .status-text {
  color: #ff8c42;
}

/* ── Countdown ring SVG ─────────────────────────────────── */
.countdown-ring {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 48px;
  height: 48px;
  transform: rotate(-90deg);
  z-index: 2;
}

.ring-track {
  fill: none;
  stroke: #1a1a24;
  stroke-width: 5;
}

.ring-progress {
  fill: none;
  stroke: #ff6b1a;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: v-bind(CIRCUMFERENCE);
  transition: stroke-dashoffset 1s linear;
}

.countdown-text {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #ff6b1a;
  z-index: 3;
}
</style>
