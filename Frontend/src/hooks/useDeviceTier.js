import { useState, useEffect } from 'react';

/**
 * useDeviceTier
 *
 * Mendeteksi kapasitas hardware perangkat dan preferensi aksesibilitas pengguna
 * untuk menentukan apakah animasi berat harus dinonaktifkan.
 *
 * Tier "low-end" jika salah satu kondisi berikut terpenuhi:
 *  - Viewport lebar < 768px (mobile)
 *  - navigator.hardwareConcurrency ≤ 2 (prosesor inti sedikit)
 *  - navigator.deviceMemory ≤ 2  (RAM rendah, API tidak tersedia di semua browser)
 *  - navigator.connection.saveData === true (mode hemat data)
 *  - prefers-reduced-motion: reduce (aksesibilitas)
 *
 * Hook ini sengaja tidak reactive terhadap resize — nilai dihitung
 * sekali saat mount untuk menghindari re-render yang tidak perlu.
 */
export function useDeviceTier() {
  const [tier, setTier] = useState(() => detectTier());

  useEffect(() => {
    // Re-check jika user mengubah preferensi reduced-motion saat runtime
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setTier(detectTier());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    isLowEnd:            tier === 'low',
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

function detectTier() {
  if (typeof window === 'undefined') return 'high';

  // Mobile viewport
  if (window.innerWidth < 768) return 'low';

  // Reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';

  // CPU cores (tidak tersedia di semua browser, fallback ke 4)
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores <= 2) return 'low';

  // RAM (hanya Chrome 61+, opsional)
  const mem = navigator.deviceMemory;
  if (mem !== undefined && mem <= 2) return 'low';

  // Save-data / Lite mode
  const conn = navigator.connection;
  if (conn?.saveData === true) return 'low';

  return 'high';
}
