import { useCallback, useRef } from 'react';
import { useSettings } from './useSettings';

const SOUND_VARIATIONS = [
  '/sounds/check-1.mp3',
  '/sounds/check-2.mp3',
  '/sounds/check-3.mp3',
];

export function useSound() {
  const { settings } = useSettings();
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playCheckSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    
    // In a real app we'd load these from public folder
    // Ensure we are in a browser environment
    if (typeof window === 'undefined') return;

    try {
      // Haptic feedback if available (mobile)
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10); // Lightweight haptic
      }

      // Pick random sound or use specific if configured
      let soundUrl = SOUND_VARIATIONS[0];
      if (settings.soundVariation === 'random') {
        soundUrl = SOUND_VARIATIONS[Math.floor(Math.random() * SOUND_VARIATIONS.length)];
      } else if (settings.soundVariation !== 'default') {
        soundUrl = `/sounds/${settings.soundVariation}.mp3`;
      }

      // Initialize audio object if it doesn't exist
      if (!audioRefs.current[soundUrl]) {
        const audio = new Audio(soundUrl);
        audio.volume = 0.4; // Keep it subtle
        audioRefs.current[soundUrl] = audio;
      }
      
      const audio = audioRefs.current[soundUrl];
      
      // Reset position in case it's already playing
      audio.currentTime = 0;
      audio.play().catch(e => {
        // Ignore auto-play errors before user interaction
        console.warn('Audio playback failed', e);
      });
    } catch (e) {
      console.error('Failed to play sound', e);
    }
  }, [settings]);

  return {
    playCheckSound
  };
}
