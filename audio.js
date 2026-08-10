/* ============================================================
   NOIR & AURUM — audio engine
   All sound is synthesized (no external audio files). A short
   procedurally-generated reverb tail is convolved onto every
   voice so nothing sounds like a bare oscillator "beep".
   ============================================================ */
window.NoirAudio = (() => {
  let ctx = null;
  let master = null;
  let convolver = null;
  let dry = null, wet = null;
  let enabled = false;

  function init(){
    if(ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);

    // dry / wet split — tight, cold reverb (steel corridor, not cathedral)
    dry = ctx.createGain(); dry.gain.value = 0.8;
    wet = ctx.createGain(); wet.gain.value = 0.22;
    convolver = ctx.createConvolver();
    convolver.buffer = buildImpulse(0.9, 3.4);

    dry.connect(master);
    wet.connect(convolver);
    convolver.connect(master);
  }

  // Procedural impulse response: exponentially-decaying filtered noise,
  // stands in for a small stone room without shipping an audio asset.
  function buildImpulse(seconds, decay){
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const impulse = ctx.createBuffer(2, length, rate);
    for(let ch = 0; ch < 2; ch++){
      const data = impulse.getChannelData(ch);
      for(let i = 0; i < length; i++){
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function voice(freq, {type="sine", start=0, dur=0.9, gain=0.05, detune=0, filterFreq=null} = {}){
    const now = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    let node = osc;
    if(filterFreq){
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = filterFreq;
      lp.Q.value = 0.7;
      osc.connect(lp);
      node = lp;
    }
    node.connect(g);
    g.connect(dry);
    g.connect(wet);

    osc.start(now);
    osc.stop(now + dur + 0.1);
  }

  function noiseSwell({start=0, dur=0.6, peakGain=0.06, filterFrom=200, filterTo=2600} = {}){
    const now = ctx.currentTime + start;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(filterFrom, now);
    bp.frequency.exponentialRampToValueAtTime(filterTo, now + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peakGain, now + dur*0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(bp); bp.connect(g); g.connect(dry); g.connect(wet);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  function ensure(){ init(); if(ctx.state === "suspended") ctx.resume(); }

  // Metallic strike: several close, deliberately inharmonic partials
  // through a resonant highpass — the timbre of steel, not a bell.
  function metalHit(baseFreq, { start=0, dur=0.5, gain=0.05, ratios=[1, 2.41, 3.87] } = {}){
    ratios.forEach((r, i) => {
      voice(baseFreq * r, {
        type: i === 0 ? "triangle" : "sine",
        dur: dur * (1 - i*0.15),
        gain: gain * (1 - i*0.3),
        start,
        filterFreq: baseFreq * 6,
      });
    });
  }

  // Very short filtered noise transient — the "tick" of metal on metal,
  // layered under metalHit for a more percussive, less synthy attack.
  function noiseTick({ start=0, gain=0.03, freq=3200 } = {}){
    noiseSwell({ start, dur:0.06, peakGain:gain, filterFrom:freq*0.7, filterTo:freq*1.4 });
  }

  return {
    setEnabled(v){ enabled = v; if(v) ensure(); },
    isEnabled(){ return enabled; },

    hover(){
      if(!enabled) return; ensure();
      voice(2600, { type:"triangle", dur:0.12, gain:0.012, filterFreq:4200 });
    },

    click(){
      if(!enabled) return; ensure();
      noiseTick({ gain:0.035, freq:3800 });
      metalHit(880, { dur:0.4, gain:0.05 });
    },

    addToCart(){
      if(!enabled) return; ensure();
      // a firm steel stamp: low thud, then a bright metallic ring
      voice(140, { type:"sine", dur:0.3, gain:0.08, filterFreq:400 });
      noiseTick({ start:0.02, gain:0.04, freq:4200 });
      metalHit(920, { start:0.03, dur:0.7, gain:0.045 });
    },

    remove(){
      if(!enabled) return; ensure();
      metalHit(560, { dur:0.35, gain:0.04 });
      voice(120, { type:"sine", dur:0.3, gain:0.03, start:0.03 });
    },

    pageTransition(){
      if(!enabled) return; ensure();
      // a synchronization pulse: filtered static sweep + two crisp
      // ascending metallic blips, not a warm swelling tone.
      noiseSwell({ dur:0.4, peakGain:0.05, filterFrom:1200, filterTo:5200 });
      metalHit(660, { start:0.05, dur:0.22, gain:0.03, ratios:[1, 2.0] });
      metalHit(990, { start:0.14, dur:0.28, gain:0.032, ratios:[1, 2.0] });
    },

    checkoutSuccess(){
      if(!enabled) return; ensure();
      // synchronized: resolved ascending metallic sequence
      [440, 587.33, 880].forEach((f, i) => {
        metalHit(f, { start:i*0.1, dur:0.9, gain:0.045, ratios:[1, 2.0, 3.0] });
      });
      noiseTick({ start:0.28, gain:0.03, freq:5000 });
    },
  };
})();
