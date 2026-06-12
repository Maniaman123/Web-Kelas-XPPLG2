// src/components/ScheduleCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Jadwal Pelajaran — Real-time Firestore Edition
//
// Data source : Firestore `schedule` collection via subscribeToSchedule()
// Animations  : Framer Motion AnimatePresence for subject-list transitions
// Icons       : Lucide-react mapped dynamically by subject keyword
// Highlight   : Today's day is auto-detected and emphasized
//
// Developer Credit: Reyhan Septianto Ramadhan
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Monitor, BookOpen, Dumbbell, Music,
  Globe, Shield, Star, BookMarked, Wifi,
} from 'lucide-react';
import { subscribeToSchedule } from '../utils/firestoreService';

// ── Day order & today detection ─────────────────────────────────────────────
const DAY_ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
const JS_DAY_MAP = { 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat' };
const todayId = JS_DAY_MAP[new Date().getDay()] ?? 'senin';

// Short labels for day tabs
const DAY_SHORT = {
  senin: 'Sen', selasa: 'Sel', rabu: 'Rab', kamis: 'Kam', jumat: 'Jum',
};

// ── Subject → Lucide Icon mapping ────────────────────────────────────────────
function getSubjectIcon(name) {
  const n = name?.toLowerCase() ?? '';
  if (n.includes('pro pplg') || n.includes('informatika') || n.includes('programming'))
    return Monitor;
  if (n.includes('b.indo') || n.includes('bahasa indo') || n.includes('b.sunda') ||
      n.includes('english') || n.includes('bahasa ingg'))
    return BookOpen;
  if (n.includes('pjok') || n.includes('olahraga'))
    return Dumbbell;
  if (n.includes('senbud') || n.includes('seni'))
    return Music;
  if (n.includes('ipas') || n.includes('sejarah') || n.includes('geografi'))
    return Globe;
  if (n.includes('ppkn') || n.includes('pkn'))
    return Shield;
  if (n.includes('pai') || n.includes('agama'))
    return Star;
  return BookMarked;
}

// ── Subject color accent per category ────────────────────────────────────────
function getSubjectColor(name) {
  const n = name?.toLowerCase() ?? '';
  if (n.includes('pro pplg') || n.includes('informatika')) return '#60A5FA'; // blue
  if (n.includes('b.indo') || n.includes('b.sunda') || n.includes('english')) return '#34D399'; // emerald
  if (n.includes('pjok')) return '#F97316'; // orange
  if (n.includes('senbud')) return '#A78BFA'; // violet
  if (n.includes('ipas') || n.includes('sejarah')) return '#FBBF24'; // amber
  if (n.includes('ppkn')) return '#F43F5E'; // rose
  if (n.includes('pai') || n.includes('agama')) return '#FB923C'; // light-orange
  if (n.includes('mtk') || n.includes('matematika')) return '#22D3EE'; // cyan
  return '#94A3B8'; // slate
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-black/10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-black/10 rounded-full w-3/5" />
        <div className="h-2.5 bg-black/10 rounded-full w-2/5" />
      </div>
      <div className="h-2.5 bg-black/10 rounded-full w-16 shrink-0" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScheduleCard() {
  const [schedule, setSchedule]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeDay, setActiveDay]   = useState(todayId);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeToSchedule((days) => {
      setSchedule(days);
      setLoading(false);
      // Set active tab: prefer today if available, else first day
      if (days.length > 0 && days.some(d => d.id === todayId)) {
        setActiveDay(todayId);
      } else if (days.length > 0) {
        setActiveDay(days[0].id);
      }
    });
    return unsub;
  }, []);

  const dayData = schedule.find(d => d.id === activeDay);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-base sm:text-lg font-bold text-inverted flex-1">Jadwal Kelas</h3>
        {/* Live indicator */}
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
          <Wifi className="w-2.5 h-2.5" />
          Live
        </span>
      </div>

      {/* Day Tabs */}
      {loading ? (
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-black/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {DAY_ORDER.filter(id => schedule.some(d => d.id === id)).map(dayId => {
            const isActive  = activeDay === dayId;
            const isToday   = dayId === todayId;
            return (
              <button
                key={dayId}
                onClick={() => setActiveDay(dayId)}
                className={`relative py-2 rounded-xl text-xs sm:text-sm font-medium text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-outlined hover:bg-black/5'
                }`}
              >
                {DAY_SHORT[dayId] ?? dayId}
                {/* Today badge */}
                {isToday && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: isActive ? '#fff' : '#10B981' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Today label */}
      {!loading && activeDay === todayId && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Jadwal Hari Ini
        </motion.div>
      )}

      {/* Subject List */}
      <div className="space-y-2 min-h-[120px]">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
        ) : !dayData ? (
          <div className="py-10 text-center text-outlined text-sm">
            Data jadwal belum tersedia.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="space-y-2"
            >
              {dayData.subjects?.map((subject, idx) => {
                const Icon  = getSubjectIcon(subject.name);
                const color = getSubjectColor(subject.name);
                const isNow = (() => {
                  if (activeDay !== todayId) return false;
                  const now = new Date();
                  const [startH, startM] = (subject.timeSlot?.split(' - ')[0] ?? '').split(':').map(Number);
                  const [endH,   endM  ] = (subject.timeSlot?.split(' - ')[1] ?? '').split(':').map(Number);
                  if (isNaN(startH) || isNaN(endH)) return false;
                  const start = startH * 60 + startM;
                  const end   = endH   * 60 + endM;
                  const cur   = now.getHours() * 60 + now.getMinutes();
                  return cur >= start && cur < end;
                })();

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all group overflow-hidden ${
                      isNow
                        ? 'ring-2 ring-offset-1'
                        : 'hover:bg-black/5'
                    }`}
                    style={isNow ? {
                      background: `${color}18`,
                      ringColor: color,
                    } : { background: 'transparent' }}
                  >
                    {/* "SEKARANG" pill */}
                    {isNow && (
                      <span
                        className="absolute top-1.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: color }}
                      >
                        SEKARANG
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}22` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-inverted truncate leading-tight">
                        {subject.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-outlined truncate">
                        Guru Kode: {subject.teacherCode} &bull; Jam ke-{subject.jamKe}
                      </p>
                    </div>

                    {/* Time */}
                    <div
                      className="text-[10px] font-mono whitespace-nowrap shrink-0 px-2 py-1 rounded-lg"
                      style={{ background: `${color}15`, color }}
                    >
                      {subject.timeSlot}
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
