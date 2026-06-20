'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { AnimatePresence } from 'motion/react';

import type { WordEntry } from './types';
import { playPopSound } from './lib/sounds';
import { shuffle, getRandomColor } from './lib/utils';
import { track, setTrackContext } from './lib/track';
import { useSupabaseUser } from './hooks/useSupabaseUser';
import { useEntitlement } from './hooks/useEntitlement';
import { useSubscription } from './hooks/useSubscription';
import type { PlanId } from './lib/billing';
import { useLocalStorage, useLocalStorageBool, useLocalStorageStr } from './hooks/useLocalStorage';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useRecordings } from './hooks/useRecordings';
import { twisters as englishTwisters, type Twister } from './lib/twisters';
import { playTwister, stopTwister, subscribeTwisterPlaying } from './lib/twisterAudio';
import { playWarmup, stopWarmup, subscribeWarmupPlaying } from './lib/warmupAudio';
import { useWarmup } from './hooks/useWarmup';

import { TopBar, type AppMode } from './components/TopBar';
import { WordItem } from './components/WordItem';
import { TwisterItem } from './components/TwisterItem';
import { WarmupItem } from './components/WarmupItem';
import { WarmupProgress } from './components/WarmupProgress';
import { RecordingArea } from './components/RecordingArea';
import { TranscriptOverlay } from './components/TranscriptOverlay';
import { TranscriptCard } from './components/TranscriptCard';
import { HintOverlay } from './components/HintOverlay';
import { TimerBar } from './components/TimerBar';
import { CoachingTips } from './components/CoachingTips';
import { TipOverlay } from './components/TipOverlay';
import { SettingsScreen } from './components/SettingsScreen';
import { AboutScreen } from './components/AboutScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { PaywallScreen } from './components/PaywallScreen';
import { LoginScreen } from './components/LoginScreen';
import { Onboarding } from './components/Onboarding';
import { isAdminEmail } from './lib/admin';
import { useTips } from './hooks/useTips';
import type { Tip } from './lib/tips';

export default function App() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [twister, setTwister] = useState<{ entry: Twister; key: number } | null>(null);
  const [maxWords, setMaxWords] = useLocalStorage('maxWords', 1);
  const [tipCount, setTipCount] = useLocalStorage('tipCount', 1);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 80);
  const [duration, setDuration] = useLocalStorage('timerDuration', 60);
  const [timerEnabled, setTimerEnabled] = useLocalStorageBool('timerEnabled', true);
  const [isTwisterMode, setIsTwisterMode] = useLocalStorageBool('twisterMode', false);
  const [isWarmupMode, setIsWarmupMode] = useLocalStorageBool('warmupMode', false);
  const [centeredWord, setCenteredWord] = useLocalStorageBool('centeredWord', false);
  const [lastTwisterId, setLastTwisterId] = useLocalStorageStr('lastTwisterId', '');
  const [lastWordText, setLastWordText] = useLocalStorageStr('lastWordText', '');
  const [twisterOrder, setTwisterOrder] = useState<string[]>([]);
  const contentMode: 'words' | 'twisters' | 'warmup' = isWarmupMode ? 'warmup' : isTwisterMode ? 'twisters' : 'words';

  const [isDark, setIsDark] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTwisterPlaying, setIsTwisterPlaying] = useState(false);
  const [isWarmupPlaying, setIsWarmupPlaying] = useState(false);
  const [warmupHasAdvanced, setWarmupHasAdvanced] = useState(false);
  const [openTip, setOpenTip] = useState<Tip | null>(null);
  const [panel, setPanel] = useState<'settings' | 'about' | 'practice' | 'paywall' | null>(null);
  // Where the paywall was opened from, so its back arrow returns there
  // ('settings' → back to Settings; 'app' → back to the practice screen).
  const [paywallFrom, setPaywallFrom] = useState<'settings' | 'app'>('app');
  const [onboarded, setOnboarded] = useLocalStorageBool('onboarded', false);

  const mode: AppMode = panel ?? contentMode;

  const { lang } = useLanguage();
  const auth = useSupabaseUser();
  const isAdmin = isAdminEmail(auth.user?.email);
  // Freemium gating: trial is derived from the signup date; `isPremium` comes from
  // the user's active Paymob subscription.
  const sub = useSubscription(auth.user?.id);
  const entitlement = useEntitlement(auth.user?.created_at, sub.isPremium);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const startCheckout = async (plan: PlanId) => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    track('checkout_started', { plan });
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error(`checkout ${res.status}`);
      const { url } = await res.json();
      window.location.assign(url);
    } catch (err) {
      console.error('[checkout]', err);
      setCheckoutLoading(false);
    }
  };

  const openPaywall = (from: 'settings' | 'app') => { setPaywallFrom(from); setPanel('paywall'); };
  const closePaywall = () => setPanel(paywallFrom === 'settings' ? 'settings' : null);

  const activeTwisters = lang.twisters ?? englishTwisters;
  const { activeTips, rotateTips } = useTips(tipCount);
  const warmup = useWarmup();

  const voice = useVoiceRecognition(lang.speechRecognitionCode);
  const rec = useRecordings();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFiredRef = useRef(false);
  const isRecordingRef = useRef(false);
  const pullStartYRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullYRef = useRef(0);
  const swipeStartXRef = useRef(0);
  const swipeDirRef = useRef<'h' | 'v' | null>(null);

  // Word history for backward navigation (up to 20 words)
  const wordHistoryRef = useRef<WordEntry[]>([]);
  const historyPosRef = useRef<number>(-1);

  const sessionStartRef = useRef<number>(Date.now());
  const countersRef = useRef({ words: 0, twisters: 0, recordings: 0, mode_toggles: 0 });
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);

    const sendEnd = () => {
      if (sessionEndedRef.current) return;
      sessionEndedRef.current = true;
      track('session_end', {
        duration_ms: Date.now() - sessionStartRef.current,
        ...countersRef.current,
      });
    };
    const onVis = () => { if (document.visibilityState === 'hidden') sendEnd(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', sendEnd);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', sendEnd);
    };
  }, []);

  // Keep analytics language dimension in sync.
  useEffect(() => {
    setTrackContext({ language: lang.code });
  }, [lang.code]);

  // Fire the first pageview/session_start only once the (anonymous) auth user
  // is known, so these events carry a user_id.
  const sessionStartedRef = useRef(false);
  useEffect(() => {
    if (!auth.user || sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    track('pageview');
    track('session_start');
  }, [auth.user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.direction;
  }, [lang]);

  useEffect(() => subscribeTwisterPlaying(setIsTwisterPlaying), []);
  useEffect(() => subscribeWarmupPlaying(setIsWarmupPlaying), []);

  // Restore last content on page refresh
  useEffect(() => {
    if (isTwisterMode && lastTwisterId) {
      const entry = activeTwisters.find(t => t.id === lastTwisterId);
      if (entry) { setTwister({ entry, key: 0 }); setHasClicked(true); }
      else {
        // Last twister was from a different language — pick one from current language
        const list = activeTwisters;
        if (list.length) { setTwister({ entry: list[Math.floor(Math.random() * list.length)], key: 0 }); setHasClicked(true); }
      }
    } else if (!isTwisterMode && !isWarmupMode && lastWordText) {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const entry: WordEntry = {
        text: lang.generateWord(),
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        id: Date.now(),
        color: getRandomColor(dark),
      };
      wordHistoryRef.current = [entry];
      historyPosRef.current = 0;
      setWords([entry]);
      setHasClicked(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const allIds = activeTwisters.map(t => t.id);
    const allSet = new Set(allIds);
    let order: string[] | null = null;
    const storageKey = `twisterOrder_${lang.code}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === allIds.length && parsed.every(id => typeof id === 'string' && allSet.has(id))) {
          order = parsed;
        }
      }
    } catch {}
    if (!order) {
      order = shuffle(allIds);
      try { localStorage.setItem(storageKey, JSON.stringify(order)); } catch {}
    }
    setTwisterOrder(order);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang.code]);

  const langCodeRef = useRef(lang.code);
  useEffect(() => {
    if (langCodeRef.current === lang.code) return;
    langCodeRef.current = lang.code;

    if (contentMode === 'words' && words.length > 0) {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setWords(prev => prev.map(w => ({ ...w, text: lang.generateWord(), color: getRandomColor(dark) })));
    } else if (contentMode === 'twisters' && twister !== null) {
      const list = activeTwisters;
      const next = list[Math.floor(Math.random() * list.length)];
      setLastTwisterId(next.id);
      setTwister({ entry: next, key: Date.now() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang.code]);

  const doGenerate = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    if (panel !== null) return;
    if (openTip) { setOpenTip(null); return; }
    if (!hasClicked) {
      setHasClicked(true);
      track('hint_dismissed');
    }

    if (contentMode === 'warmup') {
      if (!entitlement.tryConsume('warmups')) { openPaywall('app'); return; }
      warmup.advance();
      stopWarmup();
      setWarmupHasAdvanced(true);
      if (isSoundEnabled) playPopSound();
      return;
    }

    // Free-tier daily caps. Back-navigation goes through doGoBack (never counted), and
    // stepping forward through already-generated word history re-views existing words,
    // so it isn't counted either — only genuinely new content consumes quota.
    const steppingForward =
      historyPosRef.current >= 0 && historyPosRef.current < wordHistoryRef.current.length - 1;
    if (contentMode === 'twisters' && !entitlement.tryConsume('twisters')) {
      openPaywall('app');
      return;
    }
    if (contentMode === 'words' && !steppingForward && !entitlement.tryConsume('words')) {
      openPaywall('app');
      return;
    }

    if (isSoundEnabled) playPopSound();
    if (timerEnabled) {
      if (isTimerRunning) setTimerKey(k => k + 1);
      else setIsTimerRunning(true);
    }

    if (contentMode === 'twisters') {
      if (!twisterOrder.length) return;
      const currentId = twister?.entry.id ?? lastTwisterId ?? null;
      const currentIdx = currentId ? twisterOrder.indexOf(currentId) : -1;
      const nextIdx = (currentIdx + 1) % twisterOrder.length;
      let order = twisterOrder;
      if (nextIdx === 0) {
        order = shuffle(twisterOrder);
        setTwisterOrder(order);
        try { localStorage.setItem(`twisterOrder_${lang.code}`, JSON.stringify(order)); } catch {}
      }
      const nextId = order[nextIdx];
      const next = activeTwisters.find(t => t.id === nextId);
      if (!next) return;
      track('twister_generated', { id: next.id, mode: 'twisters', language: lang.code });
      countersRef.current.twisters++;
      setLastTwisterId(next.id);
      setTwister({ entry: next, key: Date.now() });
      playTwister(next.id);
      rotateTips();
      return;
    }

    // If navigated back into history, step forward through it first
    const pos = historyPosRef.current;
    const history = wordHistoryRef.current;
    if (pos >= 0 && pos < history.length - 1) {
      historyPosRef.current = pos + 1;
      const newPos = historyPosRef.current;
      const displayStart = Math.max(0, newPos - maxWords + 1);
      setWords(history.slice(displayStart, newPos + 1));
      setLastWordText(history[newPos].text);
      rotateTips();
      return;
    }

    const word = lang.generateWord();
    const newEntry: WordEntry = { text: word, x, y, id: Date.now(), color: getRandomColor(isDark) };

    // Trim any leftover "future" entries (shouldn't happen here, but guard anyway)
    let updatedHistory = pos >= 0 && pos < history.length - 1
      ? history.slice(0, pos + 1)
      : history;
    updatedHistory = [...updatedHistory, newEntry].slice(-20);
    wordHistoryRef.current = updatedHistory;
    historyPosRef.current = updatedHistory.length - 1;

    setLastWordText(word);
    track('word_generated', { word, mode: 'words', language: lang.code });
    countersRef.current.words++;
    rotateTips();
    const displayStart = Math.max(0, updatedHistory.length - maxWords);
    setWords(updatedHistory.slice(displayStart));
  };

  const doGoBack = () => {
    if (panel !== null) return;
    if (contentMode === 'warmup') {
      warmup.goBack();
      stopWarmup();
      if (isSoundEnabled) playPopSound();
      return;
    }
    if (contentMode === 'twisters') {
      if (!twisterOrder.length) return;
      const currentId = twister?.entry.id ?? lastTwisterId ?? null;
      const currentIdx = currentId ? twisterOrder.indexOf(currentId) : 0;
      const prevIdx = (currentIdx - 1 + twisterOrder.length) % twisterOrder.length;
      const prev = activeTwisters.find(t => t.id === twisterOrder[prevIdx]);
      if (!prev) return;
      if (isSoundEnabled) playPopSound();
      stopTwister();
      setLastTwisterId(prev.id);
      setTwister({ entry: prev, key: Date.now() });
      return;
    }
    // words: navigate backward through history
    const pos = historyPosRef.current;
    if (pos <= 0) return; // at beginning or no history
    if (isSoundEnabled) playPopSound();
    historyPosRef.current = pos - 1;
    const newPos = historyPosRef.current;
    const history = wordHistoryRef.current;
    const displayStart = Math.max(0, newPos - maxWords + 1);
    setWords(history.slice(displayStart, newPos + 1));
    setLastWordText(history[newPos].text);
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    if (holdFiredRef.current) { holdFiredRef.current = false; return; }
    if (contentMode === 'words') {
      doGenerate(e.clientX, e.clientY);
    } else {
      if (e.clientX > window.innerWidth / 2) doGenerate(e.clientX, e.clientY);
      else doGoBack();
    }
  };

  const replayTwister = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTwisterPlaying) {
      stopTwister();
      track('twister_stopped');
      return;
    }
    if (twister) {
      playTwister(twister.entry.id);
      track('twister_replayed', { id: twister.entry.id });
    }
  };

  const toggleTimerEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !timerEnabled;
    setTimerEnabled(next);
    if (!next && isTimerRunning) setIsTimerRunning(false);
    track('setting_changed', { key: 'timerEnabled', value: next });
  };

  const onFontSizeChange = (n: number) => {
    setFontSize(n);
    track('setting_changed', { key: 'fontSize', value: n });
  };

  const onMaxWordsChange = (n: number) => {
    setMaxWords(n);
    setWords(prev => prev.slice(-n));
    track('setting_changed', { key: 'maxWords', value: n });
  };

  const onDurationChange = (secs: number) => {
    setDuration(secs);
    track('setting_changed', { key: 'timerDuration', value: secs });
  };

  const onSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundEnabled(v => {
      const next = !v;
      track('setting_changed', { key: 'soundEnabled', value: next });
      return next;
    });
  };

  const onThemeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDark(v => {
      const next = !v;
      track('setting_changed', { key: 'theme', value: next ? 'dark' : 'light' });
      return next;
    });
  };

  const handleMenuSelect = (id: string) => {
    if (id === 'words')         { setPanel(null); stopTwister(); stopWarmup(); setIsTwisterMode(false); setIsWarmupMode(false); }
    else if (id === 'twisters') { setPanel(null); stopWarmup(); setIsTwisterMode(true); setIsWarmupMode(false); }
    else if (id === 'warmup')   { setPanel(null); stopTwister(); setIsWarmupMode(true); setIsTwisterMode(false); }
    else if (id === 'practice') setPanel(p => p === 'practice' ? null : 'practice');
    else if (id === 'settings') setPanel(p => p === 'settings' ? null : 'settings');
    else if (id === 'about')    setPanel(p => p === 'about' ? null : 'about');

    if ((id === 'words' || id === 'twisters' || id === 'warmup') && id !== contentMode) {
      track('mode_changed', { mode: id, from: contentMode, language: lang.code });
      countersRef.current.mode_toggles++;
    }
  };

  const doStartRecording = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return;
    }

    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = ev => {
      if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
    };

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const transcript = voice.transcriptRef.current;
      rec.addRecording(blob, transcript);
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start();
    voice.start(stream);
    recordingStartRef.current = Date.now();
    track('recording_started');
    isRecordingRef.current = true;
    setIsRecording(true);
  };

  const doStopRecording = async () => {
    const duration_ms = Date.now() - recordingStartRef.current;
    track('recording_stopped', { duration_ms });
    countersRef.current.recordings++;
    await voice.stop();
    mediaRecorderRef.current?.stop();
    isRecordingRef.current = false;
    setIsRecording(false);
  };

  const startRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await doStartRecording();
  };

  const stopRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await doStopRecording();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (panel !== null) return;
    if ((e.target as Element).closest('button, a, [role="button"]')) return;
    pullStartYRef.current = e.clientY;
    swipeStartXRef.current = e.clientX;
    swipeDirRef.current = null;
    isPullingRef.current = false;
    pullYRef.current = 0;
    holdFiredRef.current = false;
    holdTimerRef.current = setTimeout(async () => {
      holdFiredRef.current = true;
      await doStartRecording();
    }, 300);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (panel !== null) return;
    const deltaX = e.clientX - swipeStartXRef.current;
    const deltaY = e.clientY - pullStartYRef.current;

    if (!swipeDirRef.current && (Math.abs(deltaX) > 8 || deltaY > 8)) {
      swipeDirRef.current = Math.abs(deltaX) > Math.abs(deltaY) * 1.2 ? 'h' : 'v';
      if (swipeDirRef.current === 'h') {
        if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
      }
    }

    if (swipeDirRef.current === 'v' && deltaY > 15) {
      if (!isPullingRef.current) {
        if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
        isPullingRef.current = true;
      }
      pullYRef.current = Math.min(deltaY, 120);
    }
  };

  const handlePointerUp = async (e: React.PointerEvent) => {
    if (panel !== null) return;
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (holdFiredRef.current && isRecordingRef.current) { await doStopRecording(); }

    const deltaX = e.clientX - swipeStartXRef.current;

    if (swipeDirRef.current === 'h' && Math.abs(deltaX) > 50) {
      holdFiredRef.current = true;
      swipeDirRef.current = null;
      if (deltaX > 0) doGenerate();
      else doGoBack();
      return;
    }

    swipeDirRef.current = null;

    if (isPullingRef.current) {
      isPullingRef.current = false;
      pullYRef.current = 0;
    }
  };

  const handlePointerCancel = async () => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (holdFiredRef.current && isRecordingRef.current) { await doStopRecording(); }
    holdFiredRef.current = false;
    isPullingRef.current = false;
    pullYRef.current = 0;
    swipeDirRef.current = null;
  };

  // Login gate: require a (non-anonymous) Google sign-in before any content.
  if (auth.loading) {
    return <div className="h-dvh w-dvw bg-zinc-50 dark:bg-zinc-950" />;
  }
  if (!auth.isRegistered) {
    return <LoginScreen onSignIn={auth.signInGoogle} />;
  }

  return (
    <div
      dir={lang.direction}
      className={`relative h-dvh w-dvw overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700 select-none touch-none ${panel === null ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleScreenClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="sketch" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="8" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <TopBar mode={mode} onMenuSelect={handleMenuSelect} />

      {panel === null && contentMode !== 'warmup' && <div
        data-onb="pace"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={e => { e.stopPropagation(); onFontSizeChange(Math.max(16, fontSize - 4)); }}
          className="rounded-full px-3 py-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
          style={{ filter: 'url(#sketch)' }}
          aria-label="Decrease font size"
        >
          <span className="text-base font-semibold leading-none select-none">a</span>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onFontSizeChange(Math.min(160, fontSize + 4)); }}
          className="rounded-full px-3 py-2 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
          style={{ filter: 'url(#sketch)' }}
          aria-label="Increase font size"
        >
          <span className="text-2xl font-semibold leading-none select-none">A</span>
        </button>
      </div>}

      <AnimatePresence>
        {panel === null && !openTip && contentMode === 'words' && words.map(word => (
          <WordItem key={word.id} word={word} fontSize={fontSize} centered={centeredWord} />
        ))}
        {panel === null && !openTip && contentMode === 'twisters' && twister && (
          <TwisterItem
            key={twister.key}
            id={String(twister.key)}
            text={twister.entry.text}
            fontSize={fontSize}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {panel === null && contentMode === 'warmup' && (
        <WarmupItem
          key={warmup.index}
          exercise={warmup.exercise}
          isPlaying={isWarmupPlaying}
          onTogglePlay={e => { e.stopPropagation(); isWarmupPlaying ? stopWarmup() : playWarmup(warmup.exercise.audioId ?? warmup.exercise.id); }}
          hasAdvanced={warmupHasAdvanced}
        />
      )}
      {panel === null && contentMode === 'warmup' && (
        <WarmupProgress
          index={warmup.index}
          total={warmup.total}
          onReset={e => { e.stopPropagation(); warmup.reset(); stopWarmup(); setWarmupHasAdvanced(false); }}
          isFirstVisit={!warmupHasAdvanced}
        />
      )}

      <TranscriptOverlay text={voice.transcript} onDismiss={voice.clearTranscript} />

      {panel === null && contentMode !== 'warmup' && <RecordingArea
        recordings={rec.recordings}
        isRecording={isRecording}
        playingId={rec.playingId}
        transcribingId={null}
        onToggleRecord={isRecording ? stopRecording : startRecording}
        onTogglePlayback={rec.togglePlayback}
        onRemove={rec.removeRecording}
        onSelect={rec.selectRecording}
      />}

      <TranscriptCard recording={rec.selectedRecording} onClose={rec.clearSelection} />

      {panel === null && contentMode !== 'warmup' && <HintOverlay
        visible={(contentMode === 'words' && words.length === 0) || (contentMode === 'twisters' && twister === null)}
        fontSize={fontSize}
        isDark={isDark}
      />}

      <CoachingTips
        tips={activeTips}
        onTipClick={setOpenTip}
        visible={panel === null && words.length > 0 && contentMode === 'words' && !openTip}
        wordX={centeredWord || !words.at(-1) ? window.innerWidth / 2 : words.at(-1)!.x}
        wordY={centeredWord || !words.at(-1) ? window.innerHeight / 2 : words.at(-1)!.y}
      />

      <TipOverlay
        tip={openTip}
        onClose={() => setOpenTip(null)}
        onTryNow={doStartRecording}
      />

      {panel === null && contentMode !== 'warmup' && <TimerBar
        timerEnabled={timerEnabled}
        toggleTimerEnabled={toggleTimerEnabled}
        timerKey={timerKey}
        duration={duration}
        isTimerRunning={isTimerRunning}
        onTimerStop={() => setIsTimerRunning(false)}
        onDurationChange={onDurationChange}
        mode={contentMode}
        onReplay={replayTwister}
        isTwisterPlaying={isTwisterPlaying}
      />}

      {panel === 'settings' && (
        <SettingsScreen
          isDark={isDark}
          onThemeToggle={() => setIsDark(v => !v)}
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={() => setIsSoundEnabled(v => !v)}
          centeredWord={centeredWord}
          onCenteredWordToggle={() => setCenteredWord(!centeredWord)}
          maxWords={maxWords}
          onMaxWordsChange={onMaxWordsChange}
          tipCount={tipCount}
          onTipCountChange={n => { setTipCount(n); track('setting_changed', { key: 'tipCount', value: n }); }}
          isAdmin={isAdmin}
          onOpenDashboard={() => { window.location.href = '/admin'; }}
          onOpenPaywall={() => openPaywall('settings')}
          isPremium={sub.isPremium}
          subscriptionEnd={sub.currentPeriodEnd}
          account={{
            isRegistered: auth.isRegistered,
            email: auth.user?.email,
            name: auth.user?.user_metadata?.full_name ?? auth.user?.user_metadata?.name,
            avatarUrl: auth.user?.user_metadata?.avatar_url ?? auth.user?.user_metadata?.picture,
            onLinkGoogle: auth.linkGoogle,
            onSignOut: auth.signOut,
          }}
        />
      )}

      {panel === 'about' && <AboutScreen />}

      {panel === 'practice' && <PracticeScreen recordings={rec.recordings} />}

      <AnimatePresence>
        {panel === 'paywall' && (
          <PaywallScreen
            onBack={closePaywall}
            onSubscribe={startCheckout}
            loading={checkoutLoading}
          />
        )}
      </AnimatePresence>

      {!onboarded && panel === null && !openTip && contentMode !== 'warmup' && (
        <Onboarding
          onAdvanceStep={step => { if (step === 0) doGenerate(); }}
          onDone={() => setOnboarded(true)}
        />
      )}
    </div>
  );
}
