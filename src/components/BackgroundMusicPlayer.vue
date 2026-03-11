<template>
  <!-- Invisible YouTube audio — no UI -->
  <div class="bg-music-hidden" aria-hidden="true">
    <div :id="playerId"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  videoId: string
  startSeconds?: number
}>()

const playerId = `bg-music-${Math.random().toString(36).slice(2, 8)}`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let player: any = null

function initPlayer() {
  player = new window.YT.Player(playerId, {
    height: '1',
    width: '1',
    videoId: props.videoId,
    playerVars: {
      autoplay: 1,
      start: props.startSeconds ?? 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      modestbranding: 1,
      mute: 0,
    },
    events: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onReady: (e: any) => e.target.playVideo(),
    },
  })
}

onMounted(() => {
  if (typeof window.YT !== 'undefined' && window.YT.Player) {
    initPlayer()
  } else {
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script')
      tag.id = 'yt-iframe-api'
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    const prev = (window as any).onYouTubeIframeAPIReady
    ;(window as any).onYouTubeIframeAPIReady = () => {
      prev?.()
      initPlayer()
    }
  }
})

onUnmounted(() => {
  try {
    player?.stopVideo()
  } catch {
    /* ignore */
  }
})
</script>

<style scoped>
.bg-music-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>
