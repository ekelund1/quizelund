import type { BoardCategory } from "./GamePage.vue";

export const BOARD: BoardCategory[] = [
  {
    category: 'Vad menar Olivia',
    questions: ['"Dottadännerna"', '"Kaa-kaa"', '"Batuuu"', '"Gockegicka"', '"Bio-bio"'],
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
    answers: ['24 nollor  (10²⁴)', 'Ca 437 miljoner', '169 platser', '760 nummer', '29 bokstäver, duh'],
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