/**
 * Notification sound system using Web Audio API.
 * Handles browser autoplay policy by warming up the AudioContext on first user interaction.
 */

let audioCtx = null;
let isWarmedUp = false;

/** Get or create a shared AudioContext */
function getAudioContext() {
 if (!audioCtx) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
 }
 return audioCtx;
}

/**
 * Warm up the AudioContext on first user interaction.
 * Call this once — it attaches a one-time click listener to resume the context.
 */
export function warmUpAudio() {
 if (isWarmedUp) return;
 isWarmedUp = true;

 const resume = () => {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
   ctx.resume();
  }
  document.removeEventListener("click", resume);
  document.removeEventListener("keydown", resume);
  document.removeEventListener("touchstart", resume);
 };

 document.addEventListener("click", resume, { once: false });
 document.addEventListener("keydown", resume, { once: false });
 document.addEventListener("touchstart", resume, { once: false });

 // Also try immediately in case user already interacted
 const ctx = getAudioContext();
 if (ctx.state === "suspended") {
  ctx.resume().catch(() => {});
 }
}

/**
 * Check if notification sound is enabled (defaults to true).
 */
export function isSoundEnabled() {
 const val = localStorage.getItem("notification_sound");
 return val === null ? true : val === "enabled";
}

/**
 * Toggle notification sound on/off. Returns the new state.
 */
export function toggleSound() {
 const current = isSoundEnabled();
 const newState = !current;
 localStorage.setItem("notification_sound", newState ? "enabled" : "disabled");
 return newState;
}

/**
 * Play a pleasant notification chime.
 * Two-tone bell: 830 Hz → 1050 Hz sine waves.
 * Respects the sound enabled/disabled setting in localStorage.
 */
export function playNotificationSound() {
 if (!isSoundEnabled()) return;
 try {
  const ctx = getAudioContext();

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
   ctx.resume();
  }

  // First tone — bright bell
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(830, ctx.currentTime);
  gain1.gain.setValueAtTime(0.35, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.5);

  // Second tone — higher, delayed
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1050, ctx.currentTime + 0.15);
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.7);
 } catch (err) {
  console.warn("Could not play notification sound:", err);
 }
}
