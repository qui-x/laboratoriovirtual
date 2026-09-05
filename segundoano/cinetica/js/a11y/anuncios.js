SICIN.announce = function announce(msg, priority = 'polite') {
  const el = document.getElementById(priority === 'assertive' ? 'sr-live-assertive' : 'sr-live');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
};
SICIN._audioCtx = null;
SICIN.playTone = function playTone(freq = 880, dur = 0.08, vol = 0.07) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!SICIN._audioCtx) SICIN._audioCtx = new Ctx();
    if (SICIN._audioCtx.state === 'suspended') SICIN._audioCtx.resume();
    const osc = SICIN._audioCtx.createOscillator();
    const gain = SICIN._audioCtx.createGain();
    osc.connect(gain);
    gain.connect(SICIN._audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, SICIN._audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, SICIN._audioCtx.currentTime + dur);
    osc.start();
    osc.stop(SICIN._audioCtx.currentTime + dur);
  } catch (e) {}
};