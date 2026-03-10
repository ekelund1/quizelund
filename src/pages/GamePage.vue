<template>
  <div class="board-page">
    <!-- Scoreboard -->
    <header class="scoreboard">
      <div class="score-team" v-for="(team, i) in teams" :key="i">
        <span class="score-badge" :style="{ background: teamColors[i % teamColors.length] }">{{
          i + 1
        }}</span>
        <span class="score-name">{{ team }}</span>
        <span class="score-points">{{ scores[i] }}</span>
      </div>
      <router-link class="back-link" to="/">← Nytt spel</router-link>
    </header>

    <!-- Board -->
    <div class="board" :style="{ '--cols': BOARD.length }">
      <!-- Category row -->
      <div class="board-row">
        <div v-for="(cat, ci) in BOARD" :key="ci" class="cell category-cell">
          {{ cat.category }}
        </div>
      </div>

      <!-- Question rows (one per point value) -->
      <div class="board-row" v-for="(pts, ri) in POINTS" :key="ri">
        <div
          v-for="(cat, ci) in BOARD"
          :key="ci"
          class="cell question-cell"
          :class="{
            picked: pickedMap[`${ci}-${ri}`],
            'not-picked': !pickedMap[`${ci}-${ri}`],
          }"
          @click="openQuestion(ci, ri)"
        >
          <span class="points-label">{{ pts }}</span>
        </div>
      </div>
    </div>

    <!-- Question Modal -->
    <Transition name="modal">
      <div v-if="activeQuestion" class="modal-backdrop">
        <!-- 3-D flip scene -->
        <div class="flip-scene" :class="{ flipped: isFlipped }">
          <!-- ── FRONT: Question ── -->
          <div class="flip-face flip-front">
            <div class="modal-category">{{ activeQuestion.category }}</div>
            <div class="modal-points">{{ activeQuestion.points }}</div>

            <!-- YouTube audio player -->
            <YoutubeAudioPlayer
              v-if="ytMedia"
              :videoId="ytMedia.videoId"
              :startSeconds="ytMedia.startSeconds"
              :duration="ytMedia.duration"
            />

            <!-- Image media -->
            <QuestionImage v-else-if="imgMedia" :src="imgMedia.src" :alt="imgMedia.alt" />

            <p class="modal-question">
              <span
                v-for="(char, ci) in activeQuestion.text"
                :key="ci"
                class="reveal-char"
                :style="{ animationDelay: `${1.2 + ci * 0.05}s` }"
                >{{ char }}</span
              >
            </p>

            <button class="flip-btn" @click="isFlipped = true">
              <span>Visa svar</span>
              <span class="flip-icon">↩</span>
            </button>
          </div>

          <!-- ── BACK: Answer + scoring ── -->
          <div class="flip-face flip-back">
            <div class="modal-category">{{ activeQuestion.category }} — Svar</div>
            <div class="modal-points">{{ activeQuestion.points }}</div>

            <!-- YouTube audio on answer side -->
            <YoutubeAudioPlayer
              v-if="isFlipped && ytAnswerMedia"
              :videoId="ytAnswerMedia.videoId"
              :startSeconds="ytAnswerMedia.startSeconds"
              :duration="ytAnswerMedia.duration"
            />

            <!-- Image on answer side -->
            <QuestionImage
              v-else-if="isFlipped && imgAnswerMedia"
              :src="imgAnswerMedia.src"
              :alt="imgAnswerMedia.alt"
              :eager="true"
            />

            <p class="modal-answer">{{ activeQuestion.answer }}</p>

            <div class="award-section">
              <p class="award-label">Ge poäng till (välj flera):</p>
              <div class="award-teams">
                <button
                  v-for="(team, ti) in teams"
                  :key="ti"
                  class="award-btn"
                  :class="{ selected: selectedTeams.has(ti) }"
                  :style="{ '--team-color': teamColors[ti % teamColors.length] }"
                  @click="toggleTeam(ti)"
                >
                  <span class="check-icon">{{ selectedTeams.has(ti) ? '✓' : '' }}</span>
                  {{ team }}
                </button>
              </div>

              <button
                class="confirm-btn"
                :disabled="selectedTeams.size === 0"
                @click="confirmPoints"
              >
                Bekräfta poäng
              </button>

              <button class="close-btn" @click="closeModal">✕ Stäng utan poäng</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import QuestionImage from '../components/QuestionImage.vue'
import YoutubeAudioPlayer from '../components/YoutubeAudioPlayer.vue'

// ── Teams from router state ─────────────────────────────────
const raw = history.state?.teams as string | undefined
const teams = ref<string[]>(raw ? JSON.parse(raw) : ['Lag 1', 'Lag 2'])
const scores = ref<number[]>(teams.value.map(() => 0))

const teamColors = ['#FF6B1A', '#1A6BFF', '#FF1A6B', '#1AFFB2', '#FFD700', '#B21AFF']

// ── Hardcoded board data ────────────────────────────────────
const POINTS = [100, 200, 300, 400, 500]

export interface YTMedia {
  type: 'youtube'
  videoId: string
  startSeconds: number
  duration: number
}

export interface ImageMedia {
  type: 'image'
  src: string // local: '/assets/myimage.jpg'  or  external: 'https://...'
  alt?: string
}

export type QuestionMedia = YTMedia | ImageMedia

export interface BoardCategory {
  category: string
  questions: string[]
  answers: string[]
  media?: (QuestionMedia | null)[] // question (front) media
  answerMedia?: (QuestionMedia | null)[] // answer (back) media
}

const BOARD: BoardCategory[] = [
  {
    category: 'Fogdevägen',
    questions: [
      'Hur kan man ta reda på om någon har skulder hos Kronofogdemyndigheten?',
      'Vilket år blev Kronofogden en egen myndighet?',
      'Vad innebär det om man gör en "förbehållsbeloppsberäkning"?',
      'Vilket speciellt mandat har innehar Kronofogden, som inte ens polis eller tull har?',
      'I snitt, hur många kronor Swishas till Kronofogden varje dag?',
    ],
    answers: [
      'Ringer dem. Skulder hos KFM är offentliga handlingar',
      '1 januari 2008. Den var tidigare en del av Skatteverket',
      'Räknar ut hur mycket pengar du kommer ha kvar efter det att Kronofogden har gjort en löneutmätning.',
      'Genomföra vräkningar och handräckningar',
      'ca 1,5 miljoner kronor 💸💸💸💸',
    ],
  },
  {
    category: 'Lekelunds historia',
    questions: [
      'Vilket år hölls det första Lekelunds?',
      'På "Lekelunds 2: The great treasure hunt", var det första gången vi hade lagtröjor. Vad hade vi för sorts lagtröjor?',
      'På den första Lekelunds som hölls, var vi på totalt 5 olika platser. Nämn 3 av dem.',
      '"På "Lekelunds 2: The great treasure hunt", hade vi en annan straffdricka än det normala. Vad hade vi?',
      'Hur många lekar var det totalt på Lekelunds 3?',
    ],
    answers: [
      'Sommaren 2019',
      'Reflexvästar. Gula, Gröna och Rosa',
      'Ronny & Lenas hus, Tallens badplats, Nytorpet, Södra Hoka parkeringen, Sommarstugan',
      'Fernet-Branca',
      '12\nSkapa lag\nSkapa laganda\nFörbjuda ordet\nRotfruksboule\nVälja och kasta\nUppdragen\nFrisbeegolf\nBlast-off\nSkap hinderbana\nKlara hinderbana\nPå förskolan\nQuizelund',
    ],
    answerMedia: [
      null,
      null,
      null,
      { type: 'image', src: `${import.meta.env.BASE_URL}assets/Fernet.jpg`, alt: 'Fernet-Branca' },
      null,
    ],
  },
  {
    category: 'Vad menar Olivia',
    questions: ['"Dottadännerna"', '"Kaa-kaa"', '"Batuuu"', '"Gååcke-gicka"', '"Bio-bio"'],
    answers: ['Borsta tänderna', 'Katt', 'Bara Bada bastu', 'Smultrondricka', 'Vindruvor'],
  },
  {
    // ── 2. Närmast vinner ───────────────────────────────────────
    // Guess the number — closest wins the points!
    category: 'Närmast vinner',
    questions: [
      'Hur många nollor har en Kvadriljon?',
      'Hur många invånare hade Sydamerika när 2025 inleddes?',
      'Hur många platser har Stortinget i Norge?',
      'Hur många nummer av tidningen Bame kom ut under de första 50 åren?',
      'Hur många bokstäver har det svenska handalfabetet (teckenspråket)?',
    ],
    answers: [
      '24 nollor  (10²⁴)',
      'Ca 437 miljoner',
      '169 platser',
      '760 nummer',
      '29 bokstäver, duh',
    ],
    media: [
      null,
      {
        type: 'image',
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/SACN_member_states.jpg',
        alt: 'Sydamerika (ortografisk projektion)',
      },
      {
        type: 'image',
        src: 'https://media3.colourbox.com/xOp_jmYohBkvFrlFldjOeMH508TFrBlN04zNJCsbUz8/resize:fit:1200:1200:1/q:70/aHR0cHM6Ly9tZWRpYS5jb2xvdXJib3guY29tL2tCaU9HNzU3bVdyNHZNMXBJY0hzY3NqWF9fNWxpS2ZkeC1mRjVCbGIyM3cvcmVzaXplOmZpdDoxNjAwOjE2MDA6MS9wbGFpbi9teXMzL2NvbG91cmJveC5wbG92cGVubmluZy5wcmV2aWV3LzE2MDBweF9DT0xPVVJCT1g5OTE2NTE3LmpwZw==',
        alt: 'Stortinget, Oslo',
      },
      {
        type: 'image',
        src: 'https://www.nfbio.se/sites/nfbio.se/files/media-images/2023-02/10133_kalender_still_compositing_swe_.jpg',
        alt: 'Bamse',
      },
      {
        type: 'image',
        src: 'https://i.pinimg.com/originals/fd/d9/67/fdd967a7324c19b77a08bace1b11d2b0.png',
        alt: 'Teckenspråkalfabetet',
      },
    ],
  },
  {
    // ── 3. Intron ───────────────────────────────────────────────
    // Listen to the intro — which Swedish kids\' show is it?
    category: 'Intron',
    questions: [
      'Vilket barnprogram är det här?',
      'Vilket barnprogram är det här?',
      'Vilket barnprogram är det här?',
      'Vilket barnprogram är det här?',
      'Vilket barnprogram är det här?',
    ],
    answers: [
      'Sailor Moon',
      'Disneydags',
      'Räddningspatrullen',
      'Mysteriet på Greveholm',
      'Doktor Kosmos',
    ],
    media: [
      { type: 'youtube', videoId: 'j2tQKejS9Fo', startSeconds: 0, duration: 20 },
      { type: 'youtube', videoId: 'Cox-rpNMra0', startSeconds: 0, duration: 20 },
      { type: 'youtube', videoId: 'RlddWaCiIqE', startSeconds: 0, duration: 20 },
      { type: 'youtube', videoId: 'egFqytPHOa8', startSeconds: 0, duration: 20 },
      { type: 'youtube', videoId: '0usqWWfp4D0', startSeconds: 0, duration: 20 },
    ],
  },
]

// ── Modal state ─────────────────────────────────────────────
const pickedMap = reactive<Record<string, boolean>>({})

interface ActiveQ {
  category: string
  points: number
  text: string
  answer: string
  media?: QuestionMedia | null
  answerMedia?: QuestionMedia | null
  colIndex: number
  rowIndex: number
}

const activeQuestion = ref<ActiveQ | null>(null)
const isFlipped = ref(false)
const selectedTeams = reactive<Set<number>>(new Set())

// Typed narrowing helpers — question (front)
const ytMedia = computed(() =>
  activeQuestion.value?.media?.type === 'youtube' ? (activeQuestion.value.media as YTMedia) : null,
)
const imgMedia = computed(() =>
  activeQuestion.value?.media?.type === 'image' ? (activeQuestion.value.media as ImageMedia) : null,
)

// Typed narrowing helpers — answer (back)
const ytAnswerMedia = computed(() =>
  activeQuestion.value?.answerMedia?.type === 'youtube'
    ? (activeQuestion.value.answerMedia as YTMedia)
    : null,
)
const imgAnswerMedia = computed(() =>
  activeQuestion.value?.answerMedia?.type === 'image'
    ? (activeQuestion.value.answerMedia as ImageMedia)
    : null,
)

function openQuestion(ci: number, ri: number) {
  const key = `${ci}-${ri}`
  if (pickedMap[key]) return
  const col = BOARD[ci]!
  selectedTeams.clear()
  isFlipped.value = false
  activeQuestion.value = {
    category: col.category,
    points: POINTS[ri]!,
    text: col.questions[ri]!,
    answer: col.answers![ri]!,
    media: col.media?.[ri] ?? null,
    answerMedia: col.answerMedia?.[ri] ?? null,
    colIndex: ci,
    rowIndex: ri,
  }
}

function toggleTeam(ti: number) {
  if (selectedTeams.has(ti)) selectedTeams.delete(ti)
  else selectedTeams.add(ti)
}

function confirmPoints() {
  if (!activeQuestion.value) return
  selectedTeams.forEach((ti) => {
    scores.value[ti]! += activeQuestion.value!.points
  })
  markPicked()
}

function closeModal() {
  markPicked()
}

function markPicked() {
  if (!activeQuestion.value) return
  const key = `${activeQuestion.value.colIndex}-${activeQuestion.value.rowIndex}`
  pickedMap[key] = true
  activeQuestion.value = null
  isFlipped.value = false
  selectedTeams.clear()
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.board-page {
  min-height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

/* ── Scoreboard ─────────────────────────────────────────── */
.scoreboard {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 2rem;
  background: #0f0f14;
  border-bottom: 1px solid rgba(255, 107, 26, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  flex-wrap: wrap;
}

.score-team {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #16161e;
  border: 1px solid #2a2a38;
  border-radius: 10px;
  padding: 0.4rem 0.9rem 0.4rem 0.4rem;
}

.score-badge {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: #fff;
}

.score-name {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 600;
}

.score-points {
  color: #ff6b1a;
  font-size: 1rem;
  font-weight: 800;
  margin-left: 0.4rem;
}

.back-link {
  margin-left: auto;
  color: #3a3a4a;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover {
  color: #ff6b1a;
}

/* ── Board grid ─────────────────────────────────────────── */
.board {
  width: 100%;
  max-width: 1100px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.board-row {
  display: grid;
  grid-template-columns: repeat(var(--cols, 5), 1fr);
  gap: 0.6rem;
}

.cell {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  text-align: center;
  padding: 0.5rem;
  min-height: 80px;
}

/* ── Category cells ─────────────────────────────────────── */
.category-cell {
  background: linear-gradient(135deg, #1a1030, #0d0a1a);
  border: 1px solid rgba(26, 107, 255, 0.3);
  color: #a0a8ff;
  font-size: clamp(0.65rem, 1.2vw, 0.95rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-height: 60px;
  box-shadow: 0 0 20px rgba(26, 107, 255, 0.05);
}

/* ── Question cells ─────────────────────────────────────── */
.question-cell {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #1a0a00, #120800);
  border: 1.5px solid rgba(255, 107, 26, 0.25);
  min-height: 100px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.question-cell.not-picked {
  animation: sway 3s ease-in-out infinite;
}

.board-row:nth-child(2) .not-picked {
  animation-delay: 0s;
}
.board-row:nth-child(3) .not-picked {
  animation-delay: 0.4s;
}
.board-row:nth-child(4) .not-picked {
  animation-delay: 0.8s;
}
.board-row:nth-child(5) .not-picked {
  animation-delay: 1.2s;
}
.board-row:nth-child(6) .not-picked {
  animation-delay: 1.6s;
}

.board-row .question-cell:nth-child(1).not-picked {
  animation-delay: 0s;
}
.board-row .question-cell:nth-child(2).not-picked {
  animation-delay: 0.3s;
}
.board-row .question-cell:nth-child(3).not-picked {
  animation-delay: 0.6s;
}
.board-row .question-cell:nth-child(4).not-picked {
  animation-delay: 0.9s;
}
.board-row .question-cell:nth-child(5).not-picked {
  animation-delay: 1.2s;
}

@keyframes sway {
  0% {
    transform: rotate(-1.2deg) scale(1);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 107, 26, 0.1);
  }
  50% {
    transform: rotate(1.2deg) scale(1.015);
    box-shadow:
      0 6px 28px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 107, 26, 0.2);
  }
  100% {
    transform: rotate(-1.2deg) scale(1);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 107, 26, 0.1);
  }
}

.question-cell.not-picked:hover {
  border-color: rgba(255, 107, 26, 0.7);
  box-shadow:
    0 0 30px rgba(255, 107, 26, 0.3),
    0 8px 30px rgba(0, 0, 0, 0.5);
  animation-play-state: paused;
  transform: scale(1.04);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s;
}

.question-cell.picked {
  cursor: default;
  pointer-events: none;
  filter: blur(2px) brightness(0.3);
  opacity: 0.4;
}

.points-label {
  color: #ff6b1a;
  font-size: clamp(1.1rem, 2.5vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.02em;
  text-shadow: 0 0 20px rgba(255, 107, 26, 0.6);
}

/* ── Modal backdrop ─────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(8px);
}

/* ── 3-D flip scene ─────────────────────────────────────── */
.flip-scene {
  width: 100%;
  max-width: 760px;
  perspective: 1400px;
  /* Grid stacking: both faces occupy the same cell so the scene
     always sizes to whichever face is taller */
  display: grid;
}

.flip-scene.flipped .flip-front {
  transform: rotateY(180deg);
}
.flip-scene.flipped .flip-back {
  transform: rotateY(0deg);
}

.flip-face {
  width: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.65s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  border-radius: 24px;
  padding: 3rem 3.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.flip-front {
  background: linear-gradient(145deg, #130e1e, #0d0a14);
  border: 1px solid rgba(26, 107, 255, 0.3);
  box-shadow:
    0 0 80px rgba(26, 107, 255, 0.15),
    0 30px 80px rgba(0, 0, 0, 0.7);
  transform: rotateY(0deg);
  grid-area: 1 / 1;
}

.flip-back {
  background: linear-gradient(145deg, #0a1a10, #061009);
  border: 1px solid rgba(26, 255, 107, 0.25);
  box-shadow:
    0 0 80px rgba(26, 255, 107, 0.1),
    0 30px 80px rgba(0, 0, 0, 0.7);
  transform: rotateY(-180deg);
  /* Stacks on top of front via shared grid area */
  grid-area: 1 / 1;
  align-self: start;
}

/* ── Shared modal typography ────────────────────────────── */
.modal-category {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #5a6aff;
}

.modal-points {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b1a, #ff8c42);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

/* Front: question text */
.modal-question {
  font-size: clamp(1.3rem, 3vw, 2rem);
  font-weight: 700;
  color: #fff;
  line-height: 1.5;
  margin: 0;
  letter-spacing: 0.01em;
}

/* Character reveal — 1.2 s base delay then 50 ms per char */
.reveal-char {
  display: inline;
  opacity: 0;
  animation: charReveal 0.06s ease forwards;
}

@keyframes charReveal {
  to {
    opacity: 1;
  }
}

/* Back: answer text */
.modal-answer {
  font-size: clamp(1.4rem, 3.5vw, 2.2rem);
  font-weight: 800;
  color: #4fffb0;
  line-height: 1.4;
  margin: 0;
  text-shadow: 0 0 30px rgba(78, 255, 176, 0.4);
  white-space: pre-line;
}

/* ── "Visa svar" flip trigger button ────────────────────── */
.flip-btn {
  align-self: center;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(26, 107, 255, 0.45);
  border-radius: 12px;
  color: #a0a8ff;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flip-btn:hover {
  background: rgba(26, 107, 255, 0.12);
  border-color: #5a6aff;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(26, 107, 255, 0.25);
}

.flip-icon {
  font-size: 1.1rem;
}

/* ── Award section ──────────────────────────────────────── */
.award-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-items: center;
}

.award-label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #3a5a45;
}

.award-teams {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
}

.award-btn {
  padding: 0.6rem 1.4rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid var(--team-color);
  border-radius: 10px;
  color: var(--team-color);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.award-btn:hover {
  background: color-mix(in srgb, var(--team-color) 15%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--team-color) 30%, transparent);
}

.award-btn.selected {
  background: var(--team-color);
  color: #fff;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--team-color) 45%, transparent);
  transform: translateY(-2px);
}

.check-icon {
  font-size: 0.9rem;
  width: 1em;
  display: inline-block;
}

/* Confirm button */
.confirm-btn {
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #1aff7a, #00cc55);
  border: none;
  border-radius: 12px;
  color: #021a0a;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 24px rgba(26, 255, 122, 0.35);
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(26, 255, 122, 0.5);
}

.confirm-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

/* Close button */
.close-btn {
  background: none;
  border: 1px solid #1e2e22;
  border-radius: 8px;
  color: #2a4a32;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 1rem;
  transition: all 0.18s;
  letter-spacing: 0.05em;
}

.close-btn:hover {
  border-color: #ff4444;
  color: #ff6666;
}

/* ── Modal entrance / exit transition ───────────────────── */
.modal-enter-active {
  animation: modalIn 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.modal-leave-active {
  animation: modalOut 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes modalOut {
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}
</style>
