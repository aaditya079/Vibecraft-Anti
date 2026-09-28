import { useState, useEffect } from 'react';
import { 
  X, 
  Wind, 
  Zap, 
  Tv, 
  Users, 
  Share2, 
  Check, 
  MessageCircle, 
  Clock, 
  Compass,
  ArrowRight,
  Flame
} from 'lucide-react';
import { type RoomRealTimeStatus } from '../utils/roomFinder';
import confetti from 'canvas-confetti';

interface Props {
  roomStatus: RoomRealTimeStatus | null;
  onClose: () => void;
  dayName: string;
  periodNumber: number;
}

export default function RoomDetailModal({ roomStatus, onClose, dayName, periodNumber }: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);
  
  // Real-time ticking seconds calculation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return (roomStatus?.freeDurationMinutes || 60) * 60;
  });

  useEffect(() => {
    if (!roomStatus) return;
    setClaimed(false);
    // Base duration in seconds
    const totalSecs = Math.max(0, (roomStatus.freeDurationMinutes || 50) * 60);
    setSecondsRemaining(totalSecs);

    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [roomStatus]);

  if (!roomStatus) return null;

  const { room, isFree, freeUntilTime, currentOccupant, nextClass } = roomStatus;

  // Format ticking countdown into Hours, Minutes, Seconds
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  // Calculate percentage of remaining free duration for progress ring
  const initialTotalSeconds = Math.max(1, (roomStatus.freeDurationMinutes || 50) * 60);
  const percentRemaining = Math.min(100, Math.max(0, Math.round((secondsRemaining / initialTotalSeconds) * 100)));

  // Generate Squad Share Text
  const generateSquadMessage = () => {
    if (isFree) {
      const timeStr = `${hours > 0 ? `${hours} hr ` : ''}${minutes} min`;
      return `📍 Heading to ${room.code} (${room.name}) on ${room.floor}!\nIt's guaranteed free until ${freeUntilTime} (${timeStr} remaining).\nCome fast! 🚀\n\nRoom Specs: ${room.isAC ? '❄️ AC' : 'Ventilated'} · ${room.hasPowerSockets ? '🔌 Sockets' : ''} · 👥 ${room.capacity} Seats\nLive Campus Map: https://vibecraft-anti.vercel.app/`;
    } else {
      return `📍 Check out ${room.code} (${room.name}) on ${room.floor}.\nClass in session until ${currentOccupant?.untilTime || 'next period'}.\nNext open slot starts right after!\nLive Map: https://vibecraft-anti.vercel.app/`;
    }
  };

  const handleCallTheSquad = () => {
    const message = generateSquadMessage();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    
    // Trigger celebratory confetti for claiming the room
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setClaimed(true);
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyInvite = () => {
    const message = generateSquadMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Study Session at ${room.code}`,
          text: generateSquadMessage(),
          url: 'https://vibecraft-anti.vercel.app/'
        });
      } catch {
        handleCopyInvite();
      }
    } else {
      handleCopyInvite();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] shadow-2xl transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Ambient Glow */}
        <div className={`absolute top-0 left-0 right-0 h-28 opacity-25 blur-2xl pointer-events-none ${
          isFree ? 'bg-linear-to-b from-emerald-500 to-transparent' : 'bg-linear-to-b from-amber-500 to-transparent'
        }`} />

        {/* Modal Top Bar */}
        <div className="relative p-6 pb-4 flex items-start justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {room.floor} · {room.building}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">{room.type}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
              <span>{room.code}</span>
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
                {room.name}
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Live Countdown Timer Section */}
          <div className={`relative overflow-hidden rounded-2xl p-5 border text-center transition-all ${
            isFree 
              ? 'bg-emerald-500/[0.06] dark:bg-emerald-950/20 border-emerald-500/25 ring-1 ring-emerald-500/10'
              : 'bg-amber-500/[0.06] dark:bg-amber-950/20 border-amber-500/25'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 mb-2">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {isFree ? 'Guaranteed Vacancy Countdown' : 'Current Class Remaining Time'}
              </span>
              <span className="text-[11px] font-mono uppercase">
                {dayName} · Period {periodNumber}
              </span>
            </div>

            {/* Apple-style Large Ticking Digits */}
            <div className="py-2 flex items-center justify-center gap-2 font-mono font-bold tracking-tight text-zinc-900 dark:text-white">
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-extrabold tabular-nums">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-sans font-medium text-zinc-400 uppercase tracking-widest mt-1">
                  Hours
                </span>
              </div>
              <span className="text-3xl text-zinc-400 font-sans pb-3">:</span>
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-sans font-medium text-zinc-400 uppercase tracking-widest mt-1">
                  Minutes
                </span>
              </div>
              <span className="text-3xl text-zinc-400 font-sans pb-3">:</span>
              <div className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl font-extrabold tabular-nums text-zinc-600 dark:text-zinc-300">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-sans font-medium text-zinc-400 uppercase tracking-widest mt-1">
                  Seconds
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-black/[0.06] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isFree ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${percentRemaining}%` }}
              />
            </div>

            {/* Explanatory Deadline Notice */}
            <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {isFree ? (
                <>
                  {secondsRemaining === 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1.5">
                      ⚠️ Session window ending. Please check if next class has arrived.
                    </span>
                  ) : (
                    <>
                      Free until <strong className="text-zinc-900 dark:text-white font-semibold">{freeUntilTime}</strong>.
                      {nextClass ? (
                        <span> Next lecture: <span className="text-zinc-800 dark:text-zinc-200">{nextClass.sectionName}</span> at {nextClass.startsAt}.</span>
                      ) : (
                        <span> No subsequent classes scheduled for today!</span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {secondsRemaining === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1.5">
                      ✅ Current class ending now. Room transition in progress.
                    </span>
                  ) : (
                    <>
                      In session: <strong className="text-zinc-900 dark:text-white font-semibold">{currentOccupant?.sectionName}</strong> ({currentOccupant?.subjectName}).
                      <span> Finishes at {currentOccupant?.untilTime}.</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Room Specs & Facilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Users className="w-3 h-3" /> Seating
              </div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">
                {room.capacity} seats
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Wind className="w-3 h-3" /> Climate
              </div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">
                {room.isAC ? 'Full AC' : 'Ventilated'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Power
              </div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">
                {room.hasPowerSockets ? 'Available' : 'Limited'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
              <div className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Tv className="w-3 h-3" /> Display
              </div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">
                {room.hasProjector ? 'Projector' : 'Board'}
              </div>
            </div>
          </div>

          {/* "Call the Squad" Feature Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCallTheSquad}
              className="w-full py-3.5 px-5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Call the Squad on WhatsApp</span>
              {claimed ? (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">Claimed!</span>
              ) : (
                <ArrowRight className="w-4 h-4 ml-1 opacity-75" />
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyInvite}
                className="py-2.5 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 font-medium text-xs transition flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Squad Invite</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className="py-2.5 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 font-medium text-xs transition flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Share via Device</span>
              </button>
            </div>
          </div>

          {claimed && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <Flame className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Room claimed by your squad! Message generated with live coordinates.</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
