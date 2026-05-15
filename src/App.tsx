'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generate } from 'random-words';
import { AnimatePresence } from 'motion/react';

import type { WordEntry } from './types';
import { playPopSound, getRandomColor } from './lib/sounds';
import { track } from './lib/track';
import { useLocalStorage, useLocalStorageBool, useLocalStorageStr } from './hooks/useLocalStorage';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useRecordings } from './hooks/useRecordings';
import { allTwisterIds, getNextIdInOrder, getTwisterById, shuffleAllIds, type Twister } from './lib/twisters';
import { playTwister, stopTwister, subscribeTwisterPlaying } from './lib/twisterAudio';
import { playWarmup, stopWarmup, subscribeWarmupPlaying } from './lib/warmupAudio';
import { useWarmup } from './hooks/useWarmup';

import { TopBar } from './components/TopBar';
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
import { AboutOverlay } from './components/AboutOverlay';
import { SettingsOverlay } from './components/SettingsOverlay';
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
  const [twisterOrder, setTwisterOrder] = useState<string[]>([]);
  const mode: 'words' | 'twisters' | 'warmup' = isWarmupMode ? 'warmup' : isTwisterMode ? 'twisters' : 'words';

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
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { activeTips, rotateTips } = useTips(tipCount);
  const warmup = useWarmup();

  const voice = useVoiceRecognition();
  const rec = useRecordings();

  const PULL_THRESHOLD = 80;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFiredRef = useRef(false);
  const isRecordingRef = useRef(false);
  const pullStartYRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullYRef = useRef(0);

  const sessionStartRef = useRef<number>(Date.now());
  const countersRef = useRef({ words: 0, twisters: 0, recordings: 0, mode_toggles: 0 });
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    track('pageview');
    track('session_start');

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => subscribeTwisterPlaying(setIsTwisterPlaying), []);
  useEffect(() => subscribeWarmupPlaying(setIsWarmupPlaying), []);

  useEffect(() => {
    const all = allTwisterIds();
    const allSet = new Set(all);
    let order: string[] | null = null;
    try {
      const stored = localStorage.getItem('twisterOrder');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === all.length && parsed.every(id => typeof id === 'string' && allSet.has(id))) {
          order = parsed;
        }
      }
    } catch {}
    if (!order) {
      order = shuffleAllIds();
      try { localStorage.setItem('twisterOrder', JSON.stringify(order)); } catch {}
    }
    setTwisterOrder(order);
  }, []);

  const doGenerate = (x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    if (openTip) { setOpenTip(null); return; }
    if (!hasClicked) {
      setHasClicked(true);
      track('hint_dismissed');
    }

    if (mode === 'warmup') {
      warmup.advance();
      stopWarmup();
      setWarmupHasAdvanced(true);
      if (isSoundEnabled) playPopSound();
      return;
    }

    if (isSoundEnabled) playPopSound();
    if (timerEnabled) {
      if (isTimerRunning) setTimerKey(k => k + 1);
      else setIsTimerRunning(true);
    }

    if (mode === 'twisters') {
      if (!twisterOrder.length) return;
      const nextId = getNextIdInOrder(twisterOrder, twister?.entry.id ?? lastTwisterId ?? null);
      const next = getTwisterById(nextId);
      if (!next) return;
      track('twister_generated', { id: next.id });
      countersRef.current.twisters++;
      setLastTwisterId(next.id);
      setTwister({ entry: next, key: Date.now() });
      playTwister(next.id);
      rotateTips();
      return;
    }

    const word = generate() as string;
    track('word_generated', { word });
    countersRef.current.words++;
    rotateTips();
    setWords(prev => [
      ...prev,
      { text: word, x, y, id: Date.now(), color: getRandomColor(isDark) },
    ].slice(-maxWords));
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    if (holdFiredRef.current) { holdFiredRef.current = false; return; }
    doGenerate(e.clientX, e.clientY);
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
    if (id === 'words') { stopTwister(); stopWarmup(); setIsTwisterMode(false); setIsWarmupMode(false); }
    else if (id === 'twisters') { stopWarmup(); setIsTwisterMode(true); setIsWarmupMode(false); }
    else if (id === 'warmup') { stopTwister(); setIsWarmupMode(true); setIsTwisterMode(false); }
    else if (id === 'settings') setSettingsOpen(true);
    else if (id === 'about') setAboutOpen(true);
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
    if ((e.target as Element).closest('button, a, [role="button"]')) return;
    pullStartYRef.current = e.clientY;
    isPullingRef.current = false;
    pullYRef.current = 0;
    holdFiredRef.current = false;
    holdTimerRef.current = setTimeout(async () => {
      holdFiredRef.current = true;
      await doStartRecording();
    }, 300);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaY = e.clientY - pullStartYRef.current;
    if (deltaY > 15) {
      if (!isPullingRef.current) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isPullingRef.current = true;
      }
      pullYRef.current = Math.min(deltaY, 120);
    }
  };

  const handlePointerUp = async () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdFiredRef.current && isRecordingRef.current) {
      await doStopRecording();
    }

    if (isPullingRef.current) {
      isPullingRef.current = false;
      if (pullYRef.current >= PULL_THRESHOLD) {
        holdFiredRef.current = true;
        window.location.reload();
        return;
      }
      pullYRef.current = 0;
    }
  };

  const handlePointerCancel = async () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdFiredRef.current && isRecordingRef.current) {
      await doStopRecording();
    }
    holdFiredRef.current = false;
    isPullingRef.current = false;
    pullYRef.current = 0;
  };

  return (
    <div
      className="relative h-dvh w-dvw cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700 select-none touch-none"
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

      {mode !== 'warmup' && <div
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
        {!openTip && mode === 'words' && words.map(word => (
          <WordItem key={word.id} word={word} fontSize={fontSize} centered={centeredWord} />
        ))}
        {!openTip && mode === 'twisters' && twister && (
          <TwisterItem
            key={twister.key}
            id={String(twister.key)}
            text={twister.entry.text}
            fontSize={fontSize}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {mode === 'warmup' && (
        <WarmupItem
          key={warmup.index}
          exercise={warmup.exercise}
          isPlaying={isWarmupPlaying}
          onTogglePlay={e => { e.stopPropagation(); isWarmupPlaying ? stopWarmup() : playWarmup(warmup.exercise.id); }}
          hasAdvanced={warmupHasAdvanced}
        />
      )}
      {mode === 'warmup' && (
        <WarmupProgress
          index={warmup.index}
          total={warmup.total}
          onReset={e => { e.stopPropagation(); warmup.reset(); stopWarmup(); setWarmupHasAdvanced(false); }}
          isFirstVisit={!warmupHasAdvanced}
        />
      )}

      <TranscriptOverlay text={voice.transcript} onDismiss={voice.clearTranscript} />

      {mode !== 'warmup' && <RecordingArea
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

      {mode !== 'warmup' && <HintOverlay visible={!hasClicked} fontSize={fontSize} isDark={isDark} />}

      <CoachingTips
        tips={activeTips}
        onTipClick={setOpenTip}
        visible={hasClicked && words.length > 0 && mode === 'words' && !openTip}
        wordX={centeredWord || !words.at(-1) ? window.innerWidth / 2 : words.at(-1)!.x}
        wordY={centeredWord || !words.at(-1) ? window.innerHeight / 2 : words.at(-1)!.y}
      />

      <TipOverlay
        tip={openTip}
        onClose={() => setOpenTip(null)}
        onTryNow={doStartRecording}
      />

      {mode !== 'warmup' && <TimerBar
        timerEnabled={timerEnabled}
        toggleTimerEnabled={toggleTimerEnabled}
        timerKey={timerKey}
        duration={duration}
        isTimerRunning={isTimerRunning}
        onTimerStop={() => setIsTimerRunning(false)}
        onDurationChange={onDurationChange}
        mode={mode as 'words' | 'twisters'}
        onReplay={replayTwister}
        isTwisterPlaying={isTwisterPlaying}
      />}

      <AboutOverlay
        visible={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <SettingsOverlay
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isDark={isDark}
        onThemeToggle={() => setIsDark(v => !v)}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(v => !v)}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        timerEnabled={timerEnabled}
        onTimerToggle={() => setTimerEnabled(!timerEnabled)}
        centeredWord={centeredWord}
        onCenteredWordToggle={() => setCenteredWord(!centeredWord)}
        maxWords={maxWords}
        onMaxWordsChange={onMaxWordsChange}
        tipCount={tipCount}
        onTipCountChange={n => { setTipCount(n); track('setting_changed', { key: 'tipCount', value: n }); }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
