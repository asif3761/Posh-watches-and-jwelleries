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

    // dry / wet split for a subtle room reverb
    dry = ctx.createGain(); dry.gain.value = 0.75;
    wet = ctx.createGain(); wet.gain.value = 0.35;
    convolver = ctx.createConvolver();
    convolver.buffer = buildImpulse(2.2, 2.4);

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

  return {
    setEnabled(v){ enabled = v; if(v) ensure(); },
    isEnabled(){ return enabled; },

    hover(){
      if(!enabled) return; ensure();
      voice(1046.5, { type:"sine", dur:0.35, gain:0.018, filterFreq:3000 });
    },

    click(){
      if(!enabled) return; ensure();
      voice(523.25, { type:"triangle", dur:0.7, gain:0.045, filterFreq:2200 });
      voice(783.99, { type:"sine", dur:0.9, gain:0.03, start:0.02 });
    },

    addToCart(){
      if(!enabled) return; ensure();
      // short ascending arpeggio, like a case latch closing
      [392.0, 493.88, 587.33, 783.99].forEach((f, i) => {
        voice(f, { type:"triangle", dur:0.6, gain:0.035, start:i*0.045, filterFreq:2600 });
      });
    },

    remove(){
      if(!enabled) return; ensure();
      voice(349.23, { type:"sine", dur:0.4, gain:0.03 });
      voice(261.63, { type:"sine", dur:0.5, gain:0.02, start:0.05 });
    },

    pageTransition(){
      if(!enabled) return; ensure();
      noiseSwell({ dur:0.75, peakGain:0.05, filterFrom:180, filterTo:2400 });
      voice(196.0, { type:"sine", dur:1.1, gain:0.02, filterFreq:900 });
    },

    checkoutSuccess(){
      if(!enabled) return; ensure();
      [261.63, 329.63, 392.0, 523.25].forEach((f, i) => {
        voice(f, { type:"sine", dur:1.3, gain:0.04, start:i*0.09, filterFreq:3200 });
      });
      noiseSwell({ start:0.05, dur:1.0, peakGain:0.02, filterFrom:400, filterTo:1200 });
    },
  };
})();
