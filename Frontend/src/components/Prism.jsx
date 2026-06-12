// src/components/Prism.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Prism WebGL — Adaptive Rendering with Graceful Degradation
// Authored for X PPLG 2, SMK Negeri 1 Ciomas
//
// Architecture:
//   HIGH-END  → Full OGL WebGL raymarching shader (35–70 marching steps).
//   LOW-END   → Static CSS gradient fallback. Zero GPU cost, zero JS frame
//               budget. Looks premium inside the Deep Teal bento aesthetic.
//
// Detection Strategy (multi-signal composite score):
//   1. prefers-reduced-motion  → Highest priority. Accessibility first.
//   2. navigator.hardwareConcurrency  → CPU core count. Available on every
//      modern browser. ≤2 cores = definitely low-end.
//   3. navigator.deviceMemory  → Available on Chromium-based browsers (not
//      Safari). ≤2 GB RAM = low-end. Used as a supporting signal only.
//   4. Touch + Small Screen heuristic  → Catches budget Android phones that
//      may report 4 cores but struggle with GPU workloads.
//
//   Optimistic-default: The hook returns 'low' initially (before effects run)
//   so the static fallback renders immediately — preventing FOUC and ensuring
//   the first paint is always fast, even on powerful devices.
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, memo } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';

// ─── Detection Constants ─────────────────────────────────────────────────────
// Score thresholds: each signal contributes points.
// Total score >= THRESHOLD_HIGH  → 'high'
// Total score >= THRESHOLD_MED   → 'medium'
// Otherwise                      → 'low'
const THRESHOLD_HIGH = 5;
const THRESHOLD_MED  = 3;

/**
 * useDeviceTier — React hook that detects device capability tier.
 * Returns 'low' | 'medium' | 'high'.
 *
 * Runs ONCE after mount. Defaults to 'low' until detection resolves
 * (optimistic-low-default strategy) to guarantee a fast first paint.
 *
 * @param {'auto'|'low'|'medium'|'high'} override
 * @returns {'low'|'medium'|'high'}
 */
function useDeviceTier(override) {
  // Start as 'low' — the fastest, safest default. Detection upgrades it.
  const [tier, setTier] = useState('low');

  useEffect(() => {
    // If caller explicitly overrides, just use that — no detection needed.
    if (override && override !== 'auto') {
      setTier(override);
      return;
    }

    let score = 0;

    // ── Signal 1: prefers-reduced-motion (accessibility, highest priority) ──
    // If the user has explicitly asked for reduced motion via OS settings,
    // we must honor that. Immediately return 'low' and do nothing else.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTier('low');
      return;
    }

    // ── Signal 2: hardwareConcurrency — CPU core count ──────────────────────
    // Available in every browser since 2014. Fallback to 1 if undefined.
    const cores = navigator.hardwareConcurrency || 1;
    if (cores >= 8) score += 3;
    else if (cores >= 6) score += 2;
    else if (cores >= 4) score += 1;
    // 1–3 cores: +0 points

    // ── Signal 3: deviceMemory — RAM estimate (Chromium/Android only) ───────
    // Undefined on Safari/Firefox — treated as a neutral/bonus signal only.
    // Values: 0.25, 0.5, 1, 2, 4, 8 GB (rounded down by the browser for privacy).
    const ram = navigator.deviceMemory; // undefined on non-Chrome
    if (ram !== undefined) {
      if (ram >= 8) score += 3;
      else if (ram >= 4) score += 2;
      else if (ram >= 2) score += 1;
      // RAM < 2 GB: +0 points
    } else {
      // Signal unavailable — grant 1 neutral point so Safari on MacBook
      // (which would score high via cores) isn't penalised.
      score += 1;
    }

    // ── Signal 4: touch + small screen heuristic ─────────────────────────────
    // Budget Android phones often report 4–6 cores but have weak GPU and
    // thermal constraints. Touch + <768px is a strong low-end heuristic.
    const isMobileHeuristic =
      navigator.maxTouchPoints > 1 &&
      window.matchMedia('(max-width: 768px)').matches;
    if (isMobileHeuristic) score -= 2; // Penalty for likely-mobile-GPU

    // ── Composite score → tier ───────────────────────────────────────────────
    const resolved =
      score >= THRESHOLD_HIGH ? 'high'
      : score >= THRESHOLD_MED ? 'medium'
      : 'low';

    setTier(resolved);
  }, [override]);

  return tier;
}

// ─── Quality Settings (WebGL path) ──────────────────────────────────────────
const QUALITY_SETTINGS = {
  low:    { steps: 35, dpr: 1.0 },
  medium: { steps: 55, dpr: 1.0 },
  high:   { steps: 70, dpr: 1.0 }, // DPR intentionally capped at 1 even on high-end
};

// ─── Static Fallback (Low-End Path) ─────────────────────────────────────────
/**
 * PrismFallback — Renders a premium static CSS gradient that replicates the
 * prismatic aesthetic of the WebGL effect without any GPU cost.
 *
 * Uses pure CSS conic-gradient + radial-gradient layers composited over the
 * Deep Teal (#243B3C) background, maintaining the bento visual identity.
 * Zero JS runtime cost. Zero requestAnimationFrame usage.
 */
const PrismFallback = memo(function PrismFallback() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full relative overflow-hidden"
      style={{
        // Layer 1: base prismatic halo — mimics the central glow of the WebGL prism
        background: [
          'radial-gradient(ellipse 60% 80% at 50% 55%, rgba(96,165,250,0.22) 0%, transparent 70%)',
          'radial-gradient(ellipse 40% 50% at 48% 50%, rgba(52,211,153,0.14) 0%, transparent 60%)',
          'conic-gradient(from 215deg at 50% 50%, rgba(147,51,234,0.10) 0deg, rgba(59,130,246,0.18) 90deg, rgba(52,211,153,0.12) 180deg, rgba(251,191,36,0.08) 270deg, rgba(147,51,234,0.10) 360deg)',
          'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(36,59,60,0.0) 100%)',
        ].join(', '),
      }}
    >
      {/*
        Pseudo-prism diamond shape — a soft, blurred rhombus replicating the
        silhouette of the 3D prism without any canvas/WebGL overhead.
        Done in pure CSS: no SVG, no canvas, no JS animation.
      */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(35deg)',
          width: '45%',
          paddingBottom: '60%',
          background:
            'linear-gradient(135deg, rgba(103,232,249,0.18) 0%, rgba(167,139,250,0.12) 40%, rgba(52,211,153,0.10) 80%, rgba(251,191,36,0.08) 100%)',
          borderRadius: '18%',
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />
      {/* Secondary smaller refraction lobe — top-right */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '20%',
          width: '22%',
          paddingBottom: '28%',
          background:
            'radial-gradient(ellipse at center, rgba(167,139,250,0.20) 0%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      {/* Tertiary lobe — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '18%',
          width: '20%',
          paddingBottom: '24%',
          background:
            'radial-gradient(ellipse at center, rgba(52,211,153,0.16) 0%, transparent 70%)',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
});

// ─── WebGL Core (High/Medium Path) ───────────────────────────────────────────
/**
 * PrismWebGL — The original full-featured OGL raymarching WebGL component.
 * Only mounted when tier is 'medium' or 'high'.
 * Wrapped in React.memo to prevent re-renders from parent Bento grid updates.
 */
const PrismWebGL = memo(function PrismWebGL({
  height,
  baseWidth,
  animationType,
  glow,
  offset,
  noise,
  transparent,
  scale,
  hueShift,
  colorFrequency,
  hoverStrength,
  inertia,
  bloom,
  suspendWhenOffscreen,
  timeScale,
  tier,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const H     = Math.max(0.001, height);
    const BW    = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    const GLOW  = Math.max(0.0, glow);
    const NOISE = Math.max(0.0, noise);
    const offX  = offset?.x ?? 0;
    const offY  = offset?.y ?? 0;
    const SAT   = transparent ? 1.5 : 1;
    const SCALE = Math.max(0.001, scale);
    const HUE   = hueShift || 0;
    const CFREQ = Math.max(0.0, colorFrequency || 1);
    const BLOOM = Math.max(0.0, bloom || 1);
    const RSX   = 1;
    const RSY   = 1;
    const RSZ   = 1;
    const TS    = Math.max(0, timeScale || 1);
    const HOVSTR = Math.max(0, hoverStrength || 1);
    const INERT  = Math.max(0, Math.min(1, inertia || 0.12));

    const { steps: STEPS, dpr: maxDpr } = QUALITY_SETTINGS[tier] ?? QUALITY_SETTINGS.medium;
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);

    const renderer = new Renderer({ dpr, alpha: transparent, antialias: false });
    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset:    '0',
      width:    '100%',
      height:   '100%',
      display:  'block',
    });
    container.appendChild(gl.canvas);

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // STEPS is injected as a compile-time constant.
    // GLSL ES 1.0 requires loop bounds to be constant — this is correct.
    const fragment = /* glsl */ `
      precision highp float;

      uniform vec2  iResolution;
      uniform float iTime;

      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform float uGlow;
      uniform vec2  uOffsetPx;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;

      vec4 tanh4(vec4 x){
        vec4 e2x = exp(2.0*x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p){
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

        float z = 5.0;
        float d = 0.0;

        vec3 p;
        vec4 o = vec4(0.0);

        float centerShift = uCenterShift;
        float cf = uColorFreq;

        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t + 0.0);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        const int STEPS = ${STEPS};
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          q.y += centerShift;
          d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
          z -= d;
          o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 1e5);

        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);

        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

        if(abs(uHueShift) > 0.0001){
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a);
      }
    `;

    const geometry   = new Triangle(gl);
    const iResBuf    = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution:   { value: iResBuf },
        iTime:         { value: 0 },
        uHeight:       { value: H },
        uBaseHalf:     { value: BASE_HALF },
        uUseBaseWobble:{ value: 1 },
        uRot:          { value: new Float32Array([1,0,0, 0,1,0, 0,0,1]) },
        uGlow:         { value: GLOW },
        uOffsetPx:     { value: offsetPxBuf },
        uNoise:        { value: NOISE },
        uSaturation:   { value: SAT },
        uScale:        { value: SCALE },
        uHueShift:     { value: HUE },
        uColorFreq:    { value: CFREQ },
        uBloom:        { value: BLOOM },
        uCenterShift:  { value: H * 0.25 },
        uInvBaseHalf:  { value: 1 / BASE_HALF },
        uInvHeight:    { value: 1 / H },
        uMinAxis:      { value: Math.min(BASE_HALF, H) },
        uPxScale:      { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE) },
        uTimeScale:    { value: TS },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth  || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = offX * dpr;
      offsetPxBuf[1] = offY * dpr;
      program.uniforms.uPxScale.value = 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const rotBuf = new Float32Array(9);
    const setMat3FromEuler = (yawY, pitchX, rollZ, out) => {
      const cy = Math.cos(yawY), sy = Math.sin(yawY);
      const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ), sz = Math.sin(rollZ);
      out[0] =  cy * cz + sy * sx * sz;
      out[1] =  cx * sz;
      out[2] = -sy * cz + cy * sx * sz;
      out[3] = -cy * sz + sy * sx * cz;
      out[4] =  cx * cz;
      out[5] =  sy * sz + cy * sx * cz;
      out[6] =  sy * cx;
      out[7] = -sx;
      out[8] =  cy * cx;
      return out;
    };

    const NOISE_IS_ZERO = NOISE < 1e-6;
    let raf = 0;
    const t0 = performance.now();

    const startRAF = () => {
      if (raf || document.hidden) return;
      raf = requestAnimationFrame(render);
    };
    const stopRAF = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisChange = () => document.hidden ? stopRAF() : startRAF();
    document.addEventListener('visibilitychange', onVisChange);

    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * RSX;
    const wY = (0.2 + rnd() * 0.7) * RSY;
    const wZ = (0.1 + rnd() * 0.5) * RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    let yaw = 0, pitch = 0, roll = 0;
    let targetYaw = 0, targetPitch = 0;
    const lerp = (a, b, t) => a + (b - a) * t;

    const pointer = { x: 0, y: 0, inside: true };
    const onMove = e => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      pointer.x = Math.max(-1, Math.min(1, (e.clientX - ww * 0.5) / (ww * 0.5)));
      pointer.y = Math.max(-1, Math.min(1, (e.clientY - wh * 0.5) / (wh * 0.5)));
      pointer.inside = true;
    };
    const onLeave = () => { pointer.inside = false; };
    const onBlur  = () => { pointer.inside = false; };

    let onPointerMove = null;
    if (animationType === 'hover') {
      onPointerMove = e => { onMove(e); startRAF(); };
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
      window.addEventListener('blur', onBlur);
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === '3drotate') {
      program.uniforms.uUseBaseWobble.value = 0;
    } else {
      program.uniforms.uUseBaseWobble.value = 1;
    }

    const render = t => {
      const time = (t - t0) * 0.001;
      program.uniforms.iTime.value = time;

      let continueRAF = true;

      if (animationType === 'hover') {
        const maxPitch = 0.6 * HOVSTR;
        const maxYaw   = 0.6 * HOVSTR;
        targetYaw   = (pointer.inside ? -pointer.x : 0) * maxYaw;
        targetPitch = (pointer.inside ?  pointer.y : 0) * maxPitch;
        yaw   = lerp(yaw,   targetYaw,   INERT);
        pitch = lerp(pitch, targetPitch, INERT);
        roll  = lerp(roll,  0,           0.1);
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        if (NOISE_IS_ZERO) {
          const settled =
            Math.abs(yaw - targetYaw)     < 1e-4 &&
            Math.abs(pitch - targetPitch) < 1e-4 &&
            Math.abs(roll)                < 1e-4;
          if (settled) continueRAF = false;
        }
      } else if (animationType === '3drotate') {
        const tScaled = time * TS;
        yaw   = tScaled * wY;
        pitch = Math.sin(tScaled * wX + phX) * 0.6;
        roll  = Math.sin(tScaled * wZ + phZ) * 0.5;
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        if (TS < 1e-6) continueRAF = false;
      } else {
        rotBuf[0]=1; rotBuf[1]=0; rotBuf[2]=0;
        rotBuf[3]=0; rotBuf[4]=1; rotBuf[5]=0;
        rotBuf[6]=0; rotBuf[7]=0; rotBuf[8]=1;
        program.uniforms.uRot.value = rotBuf;
        if (TS < 1e-6) continueRAF = false;
      }

      renderer.render({ scene: mesh });
      raf = continueRAF ? requestAnimationFrame(render) : 0;
    };

    if (suspendWhenOffscreen) {
      const io = new IntersectionObserver(entries => {
        entries.some(e => e.isIntersecting) ? startRAF() : stopRAF();
      });
      io.observe(container);
      startRAF();
      container.__prismIO = io;
    } else {
      startRAF();
    }

    return () => {
      stopRAF();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      if (animationType === 'hover') {
        if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('blur', onBlur);
      }
      if (suspendWhenOffscreen) {
        const io = container.__prismIO;
        if (io) io.disconnect();
        delete container.__prismIO;
      }
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [
    height, baseWidth, animationType, glow, noise,
    offset?.x, offset?.y, scale, transparent, hueShift,
    colorFrequency, timeScale, hoverStrength, inertia, bloom,
    suspendWhenOffscreen, tier,
  ]);

  return <div className="w-full h-full relative" ref={containerRef} />;
});

// ─── Public API Component ─────────────────────────────────────────────────────
/**
 * Prism — Top-level adaptive component. Consumers pass props exactly as before.
 * Internally selects between PrismWebGL and PrismFallback based on device tier.
 *
 * @prop {'auto'|'low'|'medium'|'high'} quality  - 'auto' triggers detection hook.
 */
const Prism = memo(function Prism({
  height          = 3.5,
  baseWidth       = 5.5,
  animationType   = 'rotate',
  glow            = 1,
  offset          = { x: 0, y: 0 },
  noise           = 0.5,
  transparent     = true,
  scale           = 3.6,
  hueShift        = 0,
  colorFrequency  = 1,
  hoverStrength   = 2,
  inertia         = 0.05,
  bloom           = 1,
  suspendWhenOffscreen = true,
  timeScale       = 0.5,
  quality         = 'auto',
}) {
  // Resolves 'auto' → 'low'|'medium'|'high' using the multi-signal hook.
  // Optimistic default: 'low' while the effect hasn't run yet.
  const tier = useDeviceTier(quality);

  // 'low' tier → skip the WebGL context entirely: no canvas, no shader, no RAF.
  if (tier === 'low') {
    return <PrismFallback />;
  }

  // 'medium' or 'high' → full OGL WebGL raymarching path.
  return (
    <PrismWebGL
      height={height}
      baseWidth={baseWidth}
      animationType={animationType}
      glow={glow}
      offset={offset}
      noise={noise}
      transparent={transparent}
      scale={scale}
      hueShift={hueShift}
      colorFrequency={colorFrequency}
      hoverStrength={hoverStrength}
      inertia={inertia}
      bloom={bloom}
      suspendWhenOffscreen={suspendWhenOffscreen}
      timeScale={timeScale}
      tier={tier}
    />
  );
});

export default Prism;
