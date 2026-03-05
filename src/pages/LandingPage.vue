<template>
  <div class="landing">
    <!-- Animated background particles -->
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></span>
    </div>

    <div class="content">
      <!-- Animated logo/title -->
      <div class="title-wrapper">
        <h1 class="title">
          <span
            v-for="(char, i) in titleChars"
            :key="i"
            class="title-char"
            :style="{ animationDelay: `${i * 0.08}s` }"
          >
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h1>
        <p class="subtitle">Det ultimata frågesportsspelet</p>
      </div>

      <!-- Team setup card -->
      <div class="setup-card">
        <div class="setup-header">
          <span class="setup-icon">🏆</span>
          <h2 class="setup-title">Spelupplägg</h2>
        </div>

        <!-- Number of teams/players -->
        <div class="field-group">
          <label class="field-label">Antal lag / spelare</label>
          <div class="team-count-selector">
            <button
              v-for="n in 6"
              :key="n"
              class="count-btn"
              :class="{ active: teamCount === n }"
              @click="setTeamCount(n)"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Team name inputs -->
        <transition-group name="team-item" tag="div" class="teams-list">
          <div v-for="(team, index) in teams" :key="team.id" class="team-row">
            <div class="team-badge" :style="{ background: teamColors[index] }">
              {{ index + 1 }}
            </div>
            <input
              v-model="team.name"
              class="team-input"
              :placeholder="`Lag ${index + 1}`"
              maxlength="30"
              @focus="($event.target as HTMLInputElement).select()"
            />
          </div>
        </transition-group>

        <!-- Start button -->
        <button class="start-btn" :disabled="!canStart" @click="startGame">
          <span class="start-text">Starta spelet</span>
          <span class="start-arrow">→</span>
        </button>
      </div>

      <p class="footer-text">Quizelund &copy; {{ currentYear }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getYear } from 'date-fns'

const router = useRouter()

const TITLE = 'Quizelund'
const titleChars = TITLE.split('')

const currentYear = getYear(new Date())

const teamColors = [
  '#FF6B1A', // orange
  '#1A6BFF', // blue
  '#FF1A6B', // pink
  '#1AFFB2', // teal
  '#FFD700', // gold
  '#B21AFF', // purple
]

// --- Team state ---
interface Team {
  id: number
  name: string
}

let nextId = 1

function makeTeam(): Team {
  return { id: nextId++, name: '' }
}

const teamCount = ref(2)
const teams = ref<Team[]>([makeTeam(), makeTeam()])

function setTeamCount(n: number) {
  teamCount.value = n
  while (teams.value.length < n) teams.value.push(makeTeam())
  while (teams.value.length > n) teams.value.pop()
}

watch(teamCount, (n) => {
  while (teams.value.length < n) teams.value.push(makeTeam())
  while (teams.value.length > n) teams.value.pop()
})

const canStart = computed(() => teams.value.every((t) => t.name.trim().length > 0))

function startGame() {
  if (!canStart.value) return
  // Navigate to game board — pass team names via router state
  router.push({
    name: 'game',
    state: { teams: JSON.stringify(teams.value.map((t) => t.name.trim())) },
  })
}

// Particle style generator
function particleStyle(i: number): Record<string, string> {
  const size = 4 + ((i * 7) % 12)
  const left = ((i * 19) % 97) + '%'
  const delay = ((i * 0.37) % 5).toFixed(2) + 's'
  const duration = 6 + ((i * 3) % 8) + 's'
  return {
    width: `${size}px`,
    height: `${size}px`,
    left,
    animationDelay: delay,
    animationDuration: duration,
  }
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.landing {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  padding: 2rem 1rem;
  width: 100%;
  max-width: 600px;
}

/* ── Particles ───────────────────────────────────────────── */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: #ff6b1a;
  opacity: 0;
  bottom: -20px;
  animation: floatUp linear infinite;
}

.particle:nth-child(even) {
  background: #1a6bff;
}

.particle:nth-child(3n) {
  background: #ff8c42;
  border-radius: 2px;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    opacity: 0;
    transform: translateY(-110vh) rotate(360deg);
  }
}

/* ── Title ───────────────────────────────────────────────── */
.title-wrapper {
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  filter: drop-shadow(0 0 40px rgba(255, 107, 26, 0.6));
}

.title-char {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b1a 0%, #ff8c42 40%, #1a6bff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: charDrop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes charDrop {
  from {
    opacity: 0;
    transform: translateY(-60px) scale(0.6) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

.subtitle {
  margin: 0.6rem 0 0;
  color: #7a7a8a;
  font-size: 1rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 400;
  animation: fadeIn 1.2s ease both;
  animation-delay: 0.8s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* ── Setup Card ──────────────────────────────────────────── */
.setup-card {
  width: 100%;
  background: linear-gradient(145deg, #111116, #16161e);
  border: 1px solid rgba(255, 107, 26, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow:
    0 0 60px rgba(255, 107, 26, 0.08),
    0 20px 60px rgba(0, 0, 0, 0.5);
  animation: cardSlide 0.8s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  animation-delay: 0.5s;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes cardSlide {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.setup-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.setup-icon {
  font-size: 1.5rem;
}

.setup-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}

/* ── Field Label ─────────────────────────────────────────── */
.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ff6b1a;
  margin-bottom: 0.75rem;
}

/* ── Team Count Buttons ──────────────────────────────────── */
.team-count-selector {
  display: flex;
  gap: 0.5rem;
}

.count-btn {
  flex: 1;
  padding: 0.65rem 0;
  background: #1a1a24;
  border: 1.5px solid #2a2a38;
  border-radius: 10px;
  color: #888;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.count-btn:hover {
  border-color: #ff6b1a;
  color: #ff6b1a;
  background: rgba(255, 107, 26, 0.08);
}

.count-btn.active {
  background: linear-gradient(135deg, #ff6b1a, #ff8c42);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 20px rgba(255, 107, 26, 0.4);
  transform: translateY(-1px);
}

/* ── Teams List ──────────────────────────────────────────── */
.teams-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.team-input {
  flex: 1;
  background: #1a1a24;
  border: 1.5px solid #2a2a38;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.team-input::placeholder {
  color: #3a3a4a;
}

.team-input:focus {
  border-color: #ff6b1a;
  background: #1e1e2a;
  box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.15);
}

/* ── Transition for team rows ────────────────────────────── */
.team-item-enter-active,
.team-item-leave-active {
  transition: all 0.3s ease;
}
.team-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.team-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ── Start Button ────────────────────────────────────────── */
.start-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6b1a, #ff8c42);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 6px 30px rgba(255, 107, 26, 0.4);
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(255, 107, 26, 0.55);
  background: linear-gradient(135deg, #ff7a2e, #ff9e54);
}

.start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.start-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

.start-arrow {
  font-size: 1.3rem;
  transition: transform 0.2s ease;
}

.start-btn:hover:not(:disabled) .start-arrow {
  transform: translateX(4px);
}

/* ── Footer ──────────────────────────────────────────────── */
.footer-text {
  color: #2e2e38;
  font-size: 0.8rem;
  margin: 0;
  letter-spacing: 0.05em;
}
</style>
