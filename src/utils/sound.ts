/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// A solid Web Audio API synthesizer for retro-style educational sounds
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      // Compatibility fallback
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a pop or button click
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio play click error:', e);
    }
  }

  // Play a happy 'correct' feedback chime
  public playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      // Arpeggio: C5 -> E5 -> G5
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio might be blocked or not supported
    }
  }

  // Play a low error buzz
  public playIncorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {
      // Ignore audio blocks
    }
  }

  // Play a triumphant victory sound
  public playLevelUp() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc2.type = 'triangle';

      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.3); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.6); // C6

      osc2.frequency.setValueAtTime(130.81, now); // C3
      osc2.frequency.setValueAtTime(164.81, now + 0.1); // E3
      osc2.frequency.setValueAtTime(196.00, now + 0.2); // G3
      osc2.frequency.setValueAtTime(261.63, now + 0.3); // C4

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.2, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.start();
      osc2.start();
      osc.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } catch (e) {
      // Ignore
    }
  }

  // Speak a text using Web Speech Synthesis for facts and learning reinforcement!
  public speak(text: string, lang: string = 'es-ES') {
    if (!this.enabled) return;
    try {
      // Cancel previous speaking if any
      window.speechSynthesis?.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.05; // slightly enthusiastic
      utterance.pitch = 1.15; // friendly children voice pitch
      window.speechSynthesis?.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported or error:', e);
    }
  }

  public stopSpeaking() {
    try {
      window.speechSynthesis?.cancel();
    } catch (e) {}
  }
}

export const sounds = new SoundSynthesizer();
export default sounds;
