import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useDeviceTier } from '../hooks/useDeviceTier';

// Primary brand color = Deep Teal #243B3C → used as glow
const GLOW_R = 36;
const GLOW_G = 91;
const GLOW_B = 92;
const GLOW_COLOR = `${GLOW_R}, ${GLOW_G}, ${GLOW_B}`; // deep teal glow

export default function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  variant = 'default',
  noPadding = false,
  id,
  enableTilt = false,
  enableBorderGlow = true,
}) {
  const cardRef = useRef(null);
  const { isLowEnd } = useDeviceTier();
  // Disable tilt on low-end to avoid per-mousemove getBoundingClientRect + GSAP call
  const tiltActive  = enableTilt && !isLowEnd;
  // Disable cursor glow on low-end (radial-gradient repaint per frame is expensive)
  const glowActive  = enableBorderGlow && !isLowEnd;

  const spanClasses = [
    colSpan === 2 ? 'md:col-span-2' : '',
    colSpan === 3 ? 'lg:col-span-3' : '',
    colSpan === 4 ? 'xl:col-span-4' : '',
    rowSpan === 2 ? 'md:row-span-2' : '',
  ].filter(Boolean).join(' ');

  const variantClasses = {
    default:   'bg-white border-black/5',
    primary:   'bg-primary text-white border-primary-light',
    secondary: 'bg-secondary border-secondary-dark/30',
  };

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    el.style.setProperty('--gx', '50%');
    el.style.setProperty('--gy', '50%');
    el.style.setProperty('--gi', '0');

    // On low-end: skip all mousemove listeners entirely.
    // This alone removes a significant source of frame drops during scroll and hover.
    if (isLowEnd) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--gx', `${(x / rect.width)  * 100}%`);
      el.style.setProperty('--gy', `${(y / rect.height) * 100}%`);
      el.style.setProperty('--gi', '1');

      if (tiltActive) {
        const cx = rect.width / 2, cy = rect.height / 2;
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -5,
          rotateY: ((x - cx) / cx) *  5,
          duration: 0.15,
          ease: 'power2.out',
          transformPerspective: 1200,
        });
      }
    };

    const handleMouseLeave = () => {
      el.style.setProperty('--gi', '0');
      if (tiltActive) {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power2.out' });
      }
    };

    el.addEventListener('mousemove',  handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove',  handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isLowEnd, tiltActive]);

  return (
    <motion.div
      ref={cardRef}
      id={id}
      data-magic-card
      // High-end: slide up from y:20 with easeOut (visible depth cue)
      // Low-end: opacity-only fade, linear 200ms — GPU-compositable, zero layout cost
      initial={{ opacity: 0, y: isLowEnd ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={isLowEnd
        ? { duration: 0.2, ease: 'linear' }
        : { duration: 0.5, ease: 'easeOut' }
      }
      className={`
        relative overflow-hidden transform-gpu
        rounded-3xl border shadow-sm
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 ease-out
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${variantClasses[variant]}
        ${spanClasses}
        ${className}
      `}
    >
      {/* ── Inner radial glow follows cursor — disabled on low-end ── */}
      {glowActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 'var(--gi, 0)',
            transition: 'opacity 0.35s ease',
            background: `radial-gradient(
              320px circle at var(--gx, 50%) var(--gy, 50%),
              rgba(${GLOW_COLOR}, 0.13) 0%,
              rgba(${GLOW_COLOR}, 0.05) 55%,
              transparent 75%
            )`,
          }}
        />
      )}

      {/* ── Border ring glow (mask technique) — disabled on low-end ── */}
      {glowActive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 'var(--gi, 0)',
            transition: 'opacity 0.35s ease',
            padding: '1.5px',
            background: `radial-gradient(
              260px circle at var(--gx, 50%) var(--gy, 50%),
              rgba(${GLOW_COLOR}, 0.9),
              transparent 65%
            )`,
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Content above glow layers */}
      <div className="relative z-1">{children}</div>
    </motion.div>
  );
}
