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

import { TopBar } from './components/TopBar';
import { WordItem } from './components/WordItem';
import { TwisterItem } from './components/TwisterItem';
import { RecordingArea } from './components/RecordingArea';
import { TranscriptOverlay } from './components/TranscriptOverlay';
import { TranscriptCard } from './components/TranscriptCard';
import { HintOverlay } from './components/HintOverlay';
import { TimerBar } from './components/TimerBar';
import { CoachingTips } from './components/CoachingTips';
import { TipOverlay } from './components/TipOverlay';
import { ControlWheel } from './components/ControlWheel';
import { AboutOverlay } from './components/AboutOverlay';
import { SettingsOverlay } from './components/SettingsOverlay';
import { useTips } from './hooks/useTips';
import { useLongPress } from './hooks/useLongPress';
import type { Tip } from './lib/tips';

export default function App() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [twister, setTwister] = useState<{ entry: Twister; key: number } | null>(null);
  const [maxWords, setMaxWords] = useLocalStorage('maxWords', 1);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 80);
  const [duration, setDuration] = useLocalStorage('timerDuration', 60);
  const [timerEnabled, setTimerEnabled] = useLocalStorageBool('timerEnabled', true);
  const [isTwisterMode, setIsTwisterMode] = useLocalStorageBool('twisterMode', false);
  const [centeredWord, setCenteredWord] = useLocalStorageBool('centeredWord', false);
  const [lastTwisterId, setLastTwisterId] = useLocalStorageStr('lastTwisterId', '');
  const [twisterOrder, setTwisterOrder] = useState<string[]>([]);
  const mode: 'words' | 'twisters' = isTwisterMode ? 'twisters' : 'words';

  const [isDark, setIsDark] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTwisterPlaying, setIsTwisterPlaying] = useState(false);
  const [openTip, setOpenTip] = useState<Tip | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [wheelHoveredId, setWheelHoveredId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { activeTips, rotateTips } = useTips();
  const { start: lpStart, cancel: lpCancel, firedRef: lpFiredRef } = useLongPress(() => setWheelOpen(true));

  const getWheelSector = (clientX: number, clientY: number): string | null => {
    const dx = clientX - window.innerWidth / 2;
    const dy = clientY - window.innerHeight / 2;
    if (Math.sqrt(dx * dx + dy * dy) < 58) return null;
    const a = Math.atan2(dy, dx) * 180 / Math.PI;
    if (a >= -180 && a < -90) return 'twisters';
    if (a >= -90 && a < 0) return 'settings';
    if (a >= 0 && a < 90) return 'about';
    return 'words';
  };

  const voice = useVoiceRecognition();
  const rec = useRecordings();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  const sessionStartRef = useRef<number>(Date.now());
  const countersRef = useRef({ words: 0, twisters: 0, recordings: 0, mode_toggles: 0 });
  const sessionEndedRef = useRef(false);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
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

  const handleScreenClick = (e: React.MouseEvent) => {
    if (lpFiredRef.current) { lpFiredRef.current = false; return; }
    if (wheelOpen) { setWheelOpen(false); return; }
    if (openTip) { setOpenTip(null); return; }
    if (!hasClicked) {
      setHasClicked(true);
      track('hint_dismissed');
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
      { text: word, x: e.clientX, y: e.clientY, id: Date.now(), color: getRandomColor(isDark) },
    ].slice(-maxWords));
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

  const handleWheelSelect = (id: string) => {
    setWheelOpen(false);
    if (id === 'words') { stopTwister(); setIsTwisterMode(false); setWords([]); setTwister(null); }
    else if (id === 'twisters') { stopTwister(); setIsTwisterMode(true); setWords([]); setTwister(null); }
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
    setIsRecording(true);
  };

  const startRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await doStartRecording();
  };

  const stopRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const duration_ms = Date.now() - recordingStartRef.current;
    track('recording_stopped', { duration_ms });
    countersRef.current.recordings++;
    await voice.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div
      className="relative h-dvh w-dvw cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700 select-none touch-none"
      onClick={handleScreenClick}
      onPointerDown={lpStart}
      onPointerMove={(e) => { if (wheelOpen) setWheelHoveredId(getWheelSector(e.clientX, e.clientY)); }}
      onPointerUp={(e) => {
        lpCancel();
        if (!wheelOpen) return;
        const sector = getWheelSector(e.clientX, e.clientY);
        setWheelOpen(false);
        setWheelHoveredId(null);
        if (sector) handleWheelSelect(sector);
      }}
      onPointerLeave={() => { lpCancel(); if (wheelOpen) { setWheelOpen(false); setWheelHoveredId(null); } }}
      onPointerCancel={() => { lpCancel(); setWheelOpen(false); setWheelHoveredId(null); }}
    >
      <TopBar
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={onSoundToggle}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
      />

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

      <TranscriptOverlay text={voice.transcript} onDismiss={voice.clearTranscript} />

      <RecordingArea
        recordings={rec.recordings}
        isRecording={isRecording}
        playingId={rec.playingId}
        transcribingId={null}
        onToggleRecord={isRecording ? stopRecording : startRecording}
        onTogglePlayback={rec.togglePlayback}
        onRemove={rec.removeRecording}
        onSelect={rec.selectRecording}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        maxWords={maxWords}
        onMaxWordsChange={onMaxWordsChange}
        mode={mode}
        onReplay={replayTwister}
        isTwisterPlaying={isTwisterPlaying}
      />

      <TranscriptCard recording={rec.selectedRecording} onClose={rec.clearSelection} />

      <HintOverlay visible={!hasClicked} fontSize={fontSize} isDark={isDark} />

      <CoachingTips
        tips={activeTips}
        onTipClick={setOpenTip}
        visible={hasClicked && mode === 'words'}
        wordX={centeredWord || !words.at(-1) ? window.innerWidth / 2 : words.at(-1)!.x}
        wordY={centeredWord || !words.at(-1) ? window.innerHeight / 2 : words.at(-1)!.y}
      />

      <TipOverlay
        tip={openTip}
        onClose={() => setOpenTip(null)}
        onTryNow={doStartRecording}
      />

      <TimerBar
        timerEnabled={timerEnabled}
        toggleTimerEnabled={toggleTimerEnabled}
        timerKey={timerKey}
        duration={duration}
        isTimerRunning={isTimerRunning}
        onTimerStop={() => setIsTimerRunning(false)}
        onDurationChange={onDurationChange}
      />

      <ControlWheel
        visible={wheelOpen}
        hoveredId={wheelHoveredId}
      />

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
      />
    </div>
  );
}
