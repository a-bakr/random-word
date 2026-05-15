import { registerLanguage } from './registry';
import type { WordDifficulty } from './registry';

interface ArabicWord {
  text: string;
  difficulty: WordDifficulty;
}

// 250 Arabic words with harakat (diacritical marks), organized by difficulty.
// easy   (~90): ultra-common, concrete, short — ideal for beginners
// medium (~90): daily speech, 2–3 syllables
// hard   (~70): longer, formal, abstract — challenge for advanced learners
const ARABIC_WORDS: ArabicWord[] = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  // family & people
  { text: 'أُمّ',       difficulty: 'easy' },  // mother
  { text: 'أَب',        difficulty: 'easy' },  // father
  { text: 'أَخ',        difficulty: 'easy' },  // brother
  { text: 'أُخْت',      difficulty: 'easy' },  // sister
  { text: 'ابْن',       difficulty: 'easy' },  // son
  { text: 'بِنْت',      difficulty: 'easy' },  // daughter
  { text: 'جَدّ',       difficulty: 'easy' },  // grandfather
  { text: 'جَدَّة',     difficulty: 'easy' },  // grandmother
  { text: 'عَمّ',       difficulty: 'easy' },  // paternal uncle
  { text: 'خَال',       difficulty: 'easy' },  // maternal uncle
  // body
  { text: 'يَد',        difficulty: 'easy' },  // hand
  { text: 'رَأْس',      difficulty: 'easy' },  // head
  { text: 'عَيْن',      difficulty: 'easy' },  // eye
  { text: 'أُذُن',      difficulty: 'easy' },  // ear
  { text: 'أَنْف',      difficulty: 'easy' },  // nose
  { text: 'فَم',        difficulty: 'easy' },  // mouth
  { text: 'قَلْب',      difficulty: 'easy' },  // heart
  { text: 'رِجْل',      difficulty: 'easy' },  // leg
  { text: 'ظَهْر',      difficulty: 'easy' },  // back
  { text: 'بَطْن',      difficulty: 'easy' },  // belly
  // nature
  { text: 'شَمْس',      difficulty: 'easy' },  // sun
  { text: 'قَمَر',      difficulty: 'easy' },  // moon
  { text: 'نَجْم',      difficulty: 'easy' },  // star
  { text: 'مَاء',       difficulty: 'easy' },  // water
  { text: 'نَار',       difficulty: 'easy' },  // fire
  { text: 'هَوَاء',     difficulty: 'easy' },  // air
  { text: 'أَرْض',      difficulty: 'easy' },  // earth/ground
  { text: 'بَحْر',      difficulty: 'easy' },  // sea
  { text: 'جَبَل',      difficulty: 'easy' },  // mountain
  { text: 'شَجَر',      difficulty: 'easy' },  // tree
  // home & everyday objects
  { text: 'بَيْت',      difficulty: 'easy' },  // house
  { text: 'بَاب',       difficulty: 'easy' },  // door
  { text: 'كُرْسِيّ',   difficulty: 'easy' },  // chair
  { text: 'طَاوِلَة',   difficulty: 'easy' },  // table
  { text: 'سَرِير',     difficulty: 'easy' },  // bed
  { text: 'كِتَاب',     difficulty: 'easy' },  // book
  { text: 'قَلَم',      difficulty: 'easy' },  // pen
  { text: 'بَاب',       difficulty: 'easy' },  // door (kept for frequency)
  { text: 'نَافِذَة',   difficulty: 'easy' },  // window
  { text: 'مِفْتَاح',   difficulty: 'easy' },  // key
  // food & drink
  { text: 'خُبْز',      difficulty: 'easy' },  // bread
  { text: 'مَاء',       difficulty: 'easy' },  // water (high frequency)
  { text: 'لَحْم',      difficulty: 'easy' },  // meat
  { text: 'بَيْض',      difficulty: 'easy' },  // eggs
  { text: 'مِلْح',      difficulty: 'easy' },  // salt
  { text: 'زَيْت',      difficulty: 'easy' },  // oil
  { text: 'تُفَّاح',    difficulty: 'easy' },  // apple
  { text: 'عَسَل',      difficulty: 'easy' },  // honey
  { text: 'أَرُزّ',     difficulty: 'easy' },  // rice
  { text: 'لَبَن',      difficulty: 'easy' },  // milk/yogurt
  // colors
  { text: 'أَحْمَر',    difficulty: 'easy' },  // red
  { text: 'أَزْرَق',    difficulty: 'easy' },  // blue
  { text: 'أَصْفَر',    difficulty: 'easy' },  // yellow
  { text: 'أَخْضَر',    difficulty: 'easy' },  // green
  { text: 'أَبْيَض',    difficulty: 'easy' },  // white
  { text: 'أَسْوَد',    difficulty: 'easy' },  // black
  // basic adjectives
  { text: 'كَبِير',     difficulty: 'easy' },  // big
  { text: 'صَغِير',     difficulty: 'easy' },  // small
  { text: 'جَيِّد',     difficulty: 'easy' },  // good
  { text: 'سَيِّئ',     difficulty: 'easy' },  // bad
  { text: 'جَدِيد',     difficulty: 'easy' },  // new
  { text: 'قَدِيم',     difficulty: 'easy' },  // old
  { text: 'سَرِيع',     difficulty: 'easy' },  // fast
  { text: 'بَطِيء',     difficulty: 'easy' },  // slow
  { text: 'حَارّ',      difficulty: 'easy' },  // hot
  { text: 'بَارِد',     difficulty: 'easy' },  // cold
  // common verbs (past tense — easily recognized form)
  { text: 'أَكَل',      difficulty: 'easy' },  // ate
  { text: 'شَرِب',      difficulty: 'easy' },  // drank
  { text: 'نَامَ',      difficulty: 'easy' },  // slept
  { text: 'قَرَأَ',     difficulty: 'easy' },  // read
  { text: 'كَتَب',      difficulty: 'easy' },  // wrote
  { text: 'لَعِب',      difficulty: 'easy' },  // played
  { text: 'رَكَض',      difficulty: 'easy' },  // ran
  { text: 'وَقَف',      difficulty: 'easy' },  // stood
  { text: 'جَلَس',      difficulty: 'easy' },  // sat
  { text: 'فَتَح',      difficulty: 'easy' },  // opened
  // common function words
  { text: 'نَعَم',      difficulty: 'easy' },  // yes
  { text: 'هُنَا',      difficulty: 'easy' },  // here
  { text: 'الْآن',      difficulty: 'easy' },  // now
  { text: 'غَدًا',      difficulty: 'easy' },  // tomorrow
  { text: 'أَمْس',      difficulty: 'easy' },  // yesterday
  { text: 'كُلّ',       difficulty: 'easy' },  // every/all
  { text: 'مَعَ',       difficulty: 'easy' },  // with
  { text: 'بَعْد',      difficulty: 'easy' },  // after
  { text: 'قَبْل',      difficulty: 'easy' },  // before
  { text: 'فِي',        difficulty: 'easy' },  // in/at

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  // people & professions
  { text: 'مُعَلِّم',   difficulty: 'medium' }, // teacher
  { text: 'طَبِيب',    difficulty: 'medium' }, // doctor
  { text: 'طَالِب',    difficulty: 'medium' }, // student
  { text: 'صَدِيق',    difficulty: 'medium' }, // friend
  { text: 'جَار',      difficulty: 'medium' }, // neighbor
  { text: 'زَمِيل',    difficulty: 'medium' }, // colleague
  { text: 'ضَيْف',     difficulty: 'medium' }, // guest
  { text: 'عَامِل',    difficulty: 'medium' }, // worker
  { text: 'مُدِير',    difficulty: 'medium' }, // director/manager
  { text: 'مُحَامِي',  difficulty: 'medium' }, // lawyer
  // places
  { text: 'مَدْرَسَة', difficulty: 'medium' }, // school
  { text: 'مَدِينَة',  difficulty: 'medium' }, // city
  { text: 'قَرْيَة',   difficulty: 'medium' }, // village
  { text: 'مَسْجِد',   difficulty: 'medium' }, // mosque
  { text: 'سُوق',      difficulty: 'medium' }, // market
  { text: 'مَكْتَب',   difficulty: 'medium' }, // office/desk
  { text: 'مَطْبَخ',   difficulty: 'medium' }, // kitchen
  { text: 'حَدِيقَة',  difficulty: 'medium' }, // garden/park
  { text: 'شَارِع',    difficulty: 'medium' }, // street
  { text: 'طَرِيق',    difficulty: 'medium' }, // road/way
  // abstract nouns
  { text: 'وَقْت',     difficulty: 'medium' }, // time
  { text: 'حَيَاة',    difficulty: 'medium' }, // life
  { text: 'حُبّ',      difficulty: 'medium' }, // love
  { text: 'صِحَّة',    difficulty: 'medium' }, // health
  { text: 'عِلْم',     difficulty: 'medium' }, // knowledge/science
  { text: 'عَمَل',     difficulty: 'medium' }, // work
  { text: 'سَعَادَة',  difficulty: 'medium' }, // happiness
  { text: 'حُرِّيَّة', difficulty: 'medium' }, // freedom
  { text: 'فِكْرَة',   difficulty: 'medium' }, // idea
  { text: 'مَعْرِفَة', difficulty: 'medium' }, // knowledge/acquaintance
  // food & culture
  { text: 'مَطْعَم',   difficulty: 'medium' }, // restaurant
  { text: 'وَجْبَة',   difficulty: 'medium' }, // meal
  { text: 'فَاكِهَة',  difficulty: 'medium' }, // fruit
  { text: 'خَضَرَوَات',difficulty: 'medium' }, // vegetables
  { text: 'حَلَوَى',   difficulty: 'medium' }, // sweets/candy
  { text: 'قَهْوَة',   difficulty: 'medium' }, // coffee
  { text: 'شَاي',      difficulty: 'medium' }, // tea
  { text: 'عَصِير',    difficulty: 'medium' }, // juice
  { text: 'سَمَك',     difficulty: 'medium' }, // fish
  { text: 'دَجَاج',    difficulty: 'medium' }, // chicken
  // weather & environment
  { text: 'مَطَر',     difficulty: 'medium' }, // rain
  { text: 'ثَلْج',     difficulty: 'medium' }, // snow/ice
  { text: 'رِيح',      difficulty: 'medium' }, // wind
  { text: 'سَحَاب',    difficulty: 'medium' }, // clouds
  { text: 'ضَبَاب',    difficulty: 'medium' }, // fog
  { text: 'فَصْل',     difficulty: 'medium' }, // season/chapter
  { text: 'صَيْف',     difficulty: 'medium' }, // summer
  { text: 'شِتَاء',    difficulty: 'medium' }, // winter
  { text: 'رَبِيع',    difficulty: 'medium' }, // spring
  { text: 'خَرِيف',    difficulty: 'medium' }, // autumn
  // medium adjectives
  { text: 'جَمِيل',    difficulty: 'medium' }, // beautiful
  { text: 'قَبِيح',    difficulty: 'medium' }, // ugly
  { text: 'صَعْب',     difficulty: 'medium' }, // difficult
  { text: 'سَهْل',     difficulty: 'medium' }, // easy
  { text: 'مُهِمّ',    difficulty: 'medium' }, // important
  { text: 'مُمْتَاز',  difficulty: 'medium' }, // excellent
  { text: 'مَشْهُور',  difficulty: 'medium' }, // famous
  { text: 'غَرِيب',    difficulty: 'medium' }, // strange/foreign
  { text: 'لَطِيف',    difficulty: 'medium' }, // kind/nice
  { text: 'ذَكِيّ',    difficulty: 'medium' }, // intelligent
  // medium verbs
  { text: 'تَكَلَّم',  difficulty: 'medium' }, // spoke
  { text: 'سَافَر',    difficulty: 'medium' }, // traveled
  { text: 'تَعَلَّم',  difficulty: 'medium' }, // learned
  { text: 'فَهِم',     difficulty: 'medium' }, // understood
  { text: 'سَمِع',     difficulty: 'medium' }, // heard
  { text: 'شَاهَد',    difficulty: 'medium' }, // watched
  { text: 'سَاعَد',    difficulty: 'medium' }, // helped
  { text: 'فَكَّر',    difficulty: 'medium' }, // thought/pondered
  { text: 'اخْتَار',   difficulty: 'medium' }, // chose
  { text: 'حَاوَل',    difficulty: 'medium' }, // tried
  // tech & modern life
  { text: 'هَاتِف',    difficulty: 'medium' }, // phone
  { text: 'حَاسُوب',   difficulty: 'medium' }, // computer
  { text: 'إِنْتَرْنَت',difficulty: 'medium' }, // internet
  { text: 'سَيَّارَة',  difficulty: 'medium' }, // car
  { text: 'طَائِرَة',  difficulty: 'medium' }, // airplane
  { text: 'قِطَار',    difficulty: 'medium' }, // train
  { text: 'مُسْتَشْفَى',difficulty: 'medium' }, // hospital
  { text: 'صَيْدَلِيَّة',difficulty: 'medium' },// pharmacy
  { text: 'مَكْتَبَة',  difficulty: 'medium' }, // library/bookstore
  { text: 'مَلْعَب',   difficulty: 'medium' }, // playground/stadium

  // ── HARD ──────────────────────────────────────────────────────────────────
  // formal/academic nouns
  { text: 'مَسْؤُولِيَّة', difficulty: 'hard' }, // responsibility
  { text: 'اجْتِمَاع',     difficulty: 'hard' }, // meeting/gathering
  { text: 'مُجْتَمَع',     difficulty: 'hard' }, // society/community
  { text: 'اقْتِصَاد',     difficulty: 'hard' }, // economy
  { text: 'دِيمُقْرَاطِيَّة',difficulty: 'hard' },// democracy
  { text: 'تَكْنُولُوجِيَا', difficulty: 'hard' }, // technology
  { text: 'فَلْسَفَة',      difficulty: 'hard' }, // philosophy
  { text: 'حَضَارَة',       difficulty: 'hard' }, // civilization
  { text: 'اسْتِقْلَال',    difficulty: 'hard' }, // independence
  { text: 'ظَاهِرَة',       difficulty: 'hard' }, // phenomenon
  // complex abstract concepts
  { text: 'مُصْطَلَح',      difficulty: 'hard' }, // term/terminology
  { text: 'مَنْهَجِيَّة',   difficulty: 'hard' }, // methodology
  { text: 'اسْتِرَاتِيجِيَّة',difficulty: 'hard' },// strategy
  { text: 'اسْتِثْمَار',    difficulty: 'hard' }, // investment
  { text: 'مُفَاوَضَات',    difficulty: 'hard' }, // negotiations
  { text: 'مُقَارَنَة',     difficulty: 'hard' }, // comparison
  { text: 'مُلَاحَظَة',     difficulty: 'hard' }, // observation/note
  { text: 'تَحْلِيل',       difficulty: 'hard' }, // analysis
  { text: 'تَشْخِيص',       difficulty: 'hard' }, // diagnosis
  { text: 'مُعَالَجَة',     difficulty: 'hard' }, // processing/treatment
  // long compound/derived words
  { text: 'مُتَنَاقِض',     difficulty: 'hard' }, // contradictory
  { text: 'مُتَوَازِن',      difficulty: 'hard' }, // balanced
  { text: 'مُتَخَصِّص',     difficulty: 'hard' }, // specialist
  { text: 'مُسْتَدَام',      difficulty: 'hard' }, // sustainable
  { text: 'مُتَسَارِع',      difficulty: 'hard' }, // accelerating
  { text: 'مُسْتَقِل',       difficulty: 'hard' }, // independent
  { text: 'مُتَحَضِّر',      difficulty: 'hard' }, // civilized
  { text: 'مُنَظَّم',        difficulty: 'hard' }, // organized
  { text: 'مُتَعَدِّد',      difficulty: 'hard' }, // multiple/diverse
  { text: 'مُسْتَمِرّ',      difficulty: 'hard' }, // continuous
  // formal verbs
  { text: 'اسْتَوْعَب',      difficulty: 'hard' }, // absorbed/comprehended
  { text: 'تَجَاوَز',        difficulty: 'hard' }, // overcame/exceeded
  { text: 'أَسَّس',          difficulty: 'hard' }, // founded/established
  { text: 'طَوَّر',          difficulty: 'hard' }, // developed
  { text: 'حَقَّق',          difficulty: 'hard' }, // achieved/verified
  { text: 'اسْتَثْمَر',      difficulty: 'hard' }, // invested
  { text: 'تَفَاوَض',        difficulty: 'hard' }, // negotiated
  { text: 'اسْتَنْتَج',      difficulty: 'hard' }, // concluded/inferred
  { text: 'تَخَصَّص',        difficulty: 'hard' }, // specialized
  { text: 'اعْتَرَف',        difficulty: 'hard' }, // acknowledged/admitted
  // science & academic fields
  { text: 'كِيمِيَاء',       difficulty: 'hard' }, // chemistry
  { text: 'فِيزِيَاء',       difficulty: 'hard' }, // physics
  { text: 'رِيَاضِيَّات',    difficulty: 'hard' }, // mathematics
  { text: 'جُغْرَافِيَا',    difficulty: 'hard' }, // geography
  { text: 'بُيُولُوجِيَا',   difficulty: 'hard' }, // biology
  { text: 'أَنْثُرُوبُولُوجِيَا', difficulty: 'hard' }, // anthropology
  { text: 'سُوسْيُولُوجِيَا', difficulty: 'hard' }, // sociology
  { text: 'سَيْكُولُوجِيَا', difficulty: 'hard' }, // psychology
  { text: 'اقْتِصَادِيَّات', difficulty: 'hard' }, // economics
  { text: 'إِحْصَاء',        difficulty: 'hard' }, // statistics
  // governance & society
  { text: 'مُنَظَّمَة',      difficulty: 'hard' }, // organization
  { text: 'مُؤَسَّسَة',      difficulty: 'hard' }, // institution
  { text: 'حُكُومَة',        difficulty: 'hard' }, // government
  { text: 'بُرْلَمَان',      difficulty: 'hard' }, // parliament
  { text: 'دُسْتُور',        difficulty: 'hard' }, // constitution
  { text: 'مُعَارَضَة',      difficulty: 'hard' }, // opposition
  { text: 'انْتِخَابَات',    difficulty: 'hard' }, // elections
  { text: 'مَشْرُوعِيَّة',   difficulty: 'hard' }, // legitimacy
  { text: 'إِصْلَاحَات',     difficulty: 'hard' }, // reforms
  { text: 'قَضَائِيَّة',     difficulty: 'hard' }, // judicial
];

function generateArabicWord(opts?: { difficulty?: WordDifficulty }): string {
  const pool = opts?.difficulty
    ? ARABIC_WORDS.filter(w => w.difficulty === opts.difficulty)
    : ARABIC_WORDS;
  const list = pool.length ? pool : ARABIC_WORDS;
  return list[Math.floor(Math.random() * list.length)].text;
}

registerLanguage({
  code: 'ar',
  name: 'Arabic',
  nativeName: 'العربية',
  direction: 'rtl',
  speechRecognitionCode: 'ar-SA',
  labels: {
    words: 'كَلِمَات',
    twisters: 'أَلاعِيب',
    warmup: 'إِحْمَاء',
    tapMe: 'اِضْغَط هُنَا',
  },
  generateWord: generateArabicWord,
});
