SIELQ.announce = function announce(msg, priority = 'polite') {
  const el = document.getElementById(priority === 'assertive' ? 'sr-live-assertive' : 'sr-live');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
};
SIELQ._audioCtx = null;
SIELQ.playTone = function playTone(freq = 880, dur = 0.08, vol = 0.07) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!SIELQ._audioCtx) SIELQ._audioCtx = new Ctx();
    if (SIELQ._audioCtx.state === 'suspended') SIELQ._audioCtx.resume();
    const osc = SIELQ._audioCtx.createOscillator();
    const gain = SIELQ._audioCtx.createGain();
    osc.connect(gain);
    gain.connect(SIELQ._audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, SIELQ._audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, SIELQ._audioCtx.currentTime + dur);
    osc.start();
    osc.stop(SIELQ._audioCtx.currentTime + dur);
  } catch (e) {}
};