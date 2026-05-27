// src/components/ScheduleTile.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Jadwal Pelajaran Tile — Real-time Firestore + isEvent Support
//
// Mendukung dua tipe slot:
//   • Pelajaran biasa (isEvent: false) — icon + teacherName + "SEKARANG" badge
//   • Event (isEvent: true)            — Coffee / Heart / LogOut + dashed border
//
// Data source : Firestore `schedule` collection via subscribeToSchedule()
// Animations  : Framer Motion AnimatePresence + staggered subject rows
// Theme       : Deep Teal (#243B3C) · Light Azure (#DCEEFA) Bento aesthetic
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Monitor, BookOpen, Dumbbell, Music,
  Globe, Shield, Star, BookMarked, Wifi,
  Coffee, LogOut, Heart, Calculator,
} from 'lucide-react';
import { subscribeToSchedule } from '../utils/firestoreService';

// ── Day helpers ──────────────────────────────────────────────────────────────
const DAY_ORDER  = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
const JS_DAY_MAP = { 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat' };
const todayId    = JS_DAY_MAP[new Date().getDay()] ?? null; // null on weekends
const DAY_SHORT  = { senin: 'Sen', selasa: 'Sel', rabu: 'Rab', kamis: 'Kam', jumat: 'Jum' };

// ── Event icon resolver ───────────────────────────────────────────────────────
function getEventIcon(name) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('sholat') || n.includes('jumat') || n.includes('prayer')) return Heart;
  if (n.includes('pulang') || n.includes('selesai'))                        return LogOut;
  return Coffee; // Istirahat / ISOMA
}

// ── Subject icon resolver ─────────────────────────────────────────────────────
function getSubjectIcon(name) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('pro pplg') || n.includes('informatika'))             return Monitor;
  if (n.includes('b. indo')  || n.includes('bahasa indo') ||
      n.includes('b. sunda') || n.includes('english'))                 return BookOpen;
  if (n.includes('pjok')     || n.includes('olahraga'))                return Dumbbell;
  if (n.includes('senbud')   || n.includes('seni'))                    return Music;
  if (n.includes('ipas')     || n.includes('sejarah'))                 return Globe;
  if (n.includes('ppkn')     || n.includes('pkn'))                     return Shield;
  if (n.includes('pai')      || n.includes('agama'))                   return Star;
  if (n.includes('mtk')      || n.includes('matematik'))               return Calculator;
  return BookMarked;
}

// ── Subject accent color ──────────────────────────────────────────────────────
function getSubjectColor(name) {
  const n = (name ?? '').toLowerCase();
  if (n.includes('pro pplg') || n.includes('informatika'))   return '#60A5FA'; // blue
  if (n.includes('b. indo')  || n.includes('b. sunda') ||
      n.includes('english'))                                  return '#34D399'; // emerald
  if (n.includes('pjok'))                                    return '#F97316'; // orange
  if (n.includes('senbud'))                                  return '#A78BFA'; // violet
  if (n.includes('ipas')     || n.includes('sejarah'))       return '#FBBF24'; // amber
  if (n.includes('ppkn'))                                    return '#F43F5E'; // rose
  if (n.includes('pai')      || n.includes('agama'))         return '#FB923C'; // light-orange
  if (n.includes('mtk')      || n.includes('matematik'))     return '#22D3EE'; // cyan
  return '#94A3B8'; // slate
}

// ── "Currently active?" helper ────────────────────────────────────────────────
function isActiveNow(timeSlot, isToday) {
  if (!isToday || !timeSlot) return false;
  const parts = timeSlot.split(' - ');
  if (parts.length < 2) return false;
  const toMin = (t) => {
    const [h, m] = t.trim().split(':').map(Number);
    return isNaN(h) ? -1 : h * 60 + m;
  };
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return cur >= toMin(parts[0]) && cur < toMin(parts[1]);
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function ScheduleSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 animate-pulse">
          <div className="w-9 h-9 rounded-lg bg-black/10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-black/10 rounded-full w-3/5" />
            <div className="h-2.5 bg-black/10 rounded-full w-2/5" />
          </div>
          <div className="h-5 bg-black/10 rounded-lg w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScheduleTile() {
  const [schedule,  setSchedule]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeDay, setActiveDay] = useState(todayId ?? 'senin');

  // Real-time Firestore listener
  useEffect(() => {
    const unsub = subscribeToSchedule((days) => {
      setSchedule(days);
      setLoading(false);
      // Prefer today's tab; fallback to first available day
      if (days.length > 0) {
        const hasTodayDoc = days.some(d => d.id === todayId);
        setActiveDay(hasTodayDoc ? todayId : days[0].id);
      }
    });
    return unsub;
  }, []);

  const dayData  = schedule.find(d => d.id === activeDay);
  const isToday  = activeDay === todayId;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-base sm:text-lg font-bold text-inverted flex-1">Jadwal Kelas</h3>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
          <Wifi className="w-2.5 h-2.5" />
          Live
        </span>
      </div>

      {/* ── Day Tabs ── */}
      {loading ? (
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-black/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {DAY_ORDER.filter(id => schedule.some(d => d.id === id)).map(dayId => {
            const active   = activeDay === dayId;
            const isItToday = dayId === todayId;
            return (
              <button
                key={dayId}
                id={`schedule-tab-${dayId}`}
                onClick={() => setActiveDay(dayId)}
                className={`relative py-2 rounded-xl text-xs sm:text-sm font-medium text-center transition-all cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-outlined hover:bg-black/5'
                }`}
              >
                {DAY_SHORT[dayId]}
                {/* Green dot = today indicator */}
                {isItToday && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: active ? '#fff' : '#10B981' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── "Jadwal Hari Ini" label ── */}
      {!loading && isToday && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Jadwal Hari Ini
        </motion.div>
      )}

      {/* ── Subject & Event List ── */}
      <div className="space-y-1.5 min-h-[160px]">
        {loading ? (
          <ScheduleSkeleton />
        ) : !dayData ? (
          <div className="py-10 text-center text-outlined text-sm">
            Data jadwal belum tersedia.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="space-y-1.5"
            >
              {dayData.subjects?.map((slot, idx) => {
                const isEvent = slot.isEvent === true;
                const isNow   = isActiveNow(slot.timeSlot, isToday);

                // ── EVENT ROW ─────────────────────────────────────────────────
                if (isEvent) {
                  const EvIcon   = getEventIcon(slot.name);
                  const isFriday = (slot.name ?? '').toLowerCase().includes('sholat') ||
                                   (slot.name ?? '').toLowerCase().includes('pulang');
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.18 }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border border-dashed ${
                        isFriday
                          ? 'border-rose-200 bg-rose-50/60 text-rose-600'
                          : 'border-amber-200/70 bg-amber-50/50 text-amber-700'
                      }`}
                    >
                      <EvIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="text-xs font-medium flex-1">{slot.name}</span>
                      <span className="text-[10px] font-mono opacity-60 shrink-0">{slot.timeSlot}</span>
                    </motion.div>
                  );
                }

                // ── SUBJECT ROW ───────────────────────────────────────────────
                const Icon  = getSubjectIcon(slot.name);
                const color = getSubjectColor(slot.name);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.18 }}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all group overflow-hidden ${
                      isNow ? '' : 'hover:bg-black/5'
                    }`}
                    style={isNow
                      ? { background: `${color}18`, outline: `2px solid ${color}50` }
                      : {}}
                  >
                    {/* SEKARANG pill */}
                    {isNow && (
                      <span
                        className="absolute top-1.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: color }}
                      >
                        SEKARANG
                      </span>
                    )}

                    {/* Subject icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}22` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Name + teacher */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-inverted truncate leading-tight">
                        {slot.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-outlined truncate">
                        {slot.teacherName ? slot.teacherName : 'Guru belum ditambahkan'}
                      </p>
                    </div>

                    {/* Time badge */}
                    <div
                      className="text-[10px] font-mono whitespace-nowrap shrink-0 px-2 py-1 rounded-lg"
                      style={{ background: `${color}15`, color }}
                    >
                      {slot.timeSlot}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
