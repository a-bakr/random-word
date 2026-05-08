'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generate } from 'random-words';
import { AnimatePresence } from 'motion/react';

import type { WordEntry } from './types';
import { playPopSound, getRandomColor } from './lib/sounds';
import { track } from './lib/track';
import { useLocalStorage, useLocalStorageBool } from './hooks/useLocalStorage';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useRecordings } from './hooks/useRecordings';
import { getRandomTwister, type Twister } from './lib/twisters';
import { playTwister, stopTwister } from './lib/twisterAudio';

import { TopBar } from './components/TopBar';
import { WordItem } from './components/WordItem';
import { TwisterItem } from './components/TwisterItem';
import { RecordingArea } from './components/RecordingArea';
import { TranscriptOverlay } from './components/TranscriptOverlay';
import { TranscriptCard } from './components/TranscriptCard';
import { HintOverlay } from './components/HintOverlay';
import { ModeSwitch } from './components/ModeSwitch';

export default function App() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [twister, setTwister] = useState<{ entry: Twister; key: number } | null>(null);
  const [maxWords, setMaxWords] = useLocalStorage('maxWords', 1);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 80);
  const [duration, setDuration] = useLocalStorage('timerDuration', 60);
  const [timerEnabled, setTimerEnabled] = useLocalStorageBool('timerEnabled', true);
  const [isTwisterMode, setIsTwisterMode] = useLocalStorageBool('twisterMode', false);
  const mode: 'words' | 'twisters' = isTwisterMode ? 'twisters' : 'words';

  const [isDark, setIsDark] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const voice = useVoiceRecognition();
  const rec = useRecordings();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  useEffect(() => {
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    track('pageview');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleScreenClick = (e: React.MouseEvent) => {
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
      const next = getRandomTwister(twister?.entry.id);
      track('twister_generated', { id: next.id });
      setTwister({ entry: next, key: Date.now() });
      playTwister(next.id);
      return;
    }

    const word = generate() as string;
    track('word_generated', { word });
    setWords(prev => [
      ...prev,
      { text: word, x: e.clientX, y: e.clientY, id: Date.now(), color: getRandomColor(isDark) },
    ].slice(-maxWords));
  };

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopTwister();
    setIsTwisterMode(!isTwisterMode);
    setWords([]);
    setTwister(null);
    track('mode_toggled', { mode: isTwisterMode ? 'words' : 'twisters' });
  };

  const replayTwister = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (twister) playTwister(twister.entry.id);
  };

  const toggleTimerEnabled = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !timerEnabled;
    setTimerEnabled(next);
    if (!next && isTimerRunning) setIsTimerRunning(false);
  };

  const startRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const stopRecording = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const duration_ms = Date.now() - recordingStartRef.current;
    track('recording_stopped', { duration_ms });
    await voice.stop();
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div
      className="relative h-dvh w-dvw cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700"
      onClick={handleScreenClick}
    >
      <TopBar
        timerEnabled={timerEnabled}
        toggleTimerEnabled={toggleTimerEnabled}
        timerKey={timerKey}
        duration={duration}
        isTimerRunning={isTimerRunning}
        onTimerStop={() => setIsTimerRunning(false)}
        onDurationChange={setDuration}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        maxWords={maxWords}
        onMaxWordsChange={n => { setMaxWords(n); setWords(prev => prev.slice(-n)); }}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={e => { e.stopPropagation(); setIsSoundEnabled(v => !v); }}
        isDark={isDark}
        onThemeToggle={e => { e.stopPropagation(); setIsDark(v => !v); }}
        mode={mode}
        onReplay={replayTwister}
      />

      <AnimatePresence>
        {mode === 'words' && words.map(word => (
          <WordItem key={word.id} word={word} fontSize={fontSize} />
        ))}
        {mode === 'twisters' && twister && (
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
      />

      <TranscriptCard recording={rec.selectedRecording} onClose={rec.clearSelection} />

      <HintOverlay visible={!hasClicked} fontSize={fontSize} isDark={isDark} />

      <ModeSwitch mode={mode} onToggle={toggleMode} />
    </div>
  );
}
