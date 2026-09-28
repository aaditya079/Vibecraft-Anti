import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Wind, 
  Zap, 
  Tv, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Info, 
  Calendar, 
  Share2, 
  Check,
  Clock,
  Compass,
  Layers,
  MessageCircle
} from 'lucide-react';
import { type DayOfWeek, type Room } from '../data/rooms';
import { 
  getAllFloorsStatus, 
  parseNaturalLanguageQuery, 
  getPeriodFromTime,
  type SearchResult,
  type RoomRealTimeStatus
} from '../utils/roomFinder';
import { askGeminiRoomLocator } from '../utils/aiRoomAssistant';
import { SEMESTER_CONFIG } from '../data/timetables';
import Building3DMap from './Building3DMap';
import RoomDetailModal from './RoomDetailModal';

const PRESET_QUERIES = [
  'I need an AC room on the ground floor for me and my team for the next 2 hours.',
  'Quiet room on 6th floor with power sockets for 3 hours',
  'Presentation hall with projector for team review',
  'Empty lab or workshop with power sockets',
  'Where can 8 people sit right now without disturbance?'
];

export default function ClassroomLocator() {
  // Phase 2 View Mode: '3d' Map vs 'grid' List
  const [activeViewMode, setActiveViewMode] = useState<'3d' | 'grid'>('3d');
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<RoomRealTimeStatus | null>(null);

  // Current time & day state
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  
  // Traditional filters
  const [onlyAC, setOnlyAC] = useState<boolean>(false);
  const [onlyPower, setOnlyPower] = useState<boolean>(false);
  const [onlyProjector, setOnlyProjector] = useState<boolean>(false);
  const [minFreeHours, setMinFreeHours] = useState<number>(0);
  const [onlyFreeNow, setOnlyFreeNow] = useState<boolean>(true);

  // AI Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchResult, setActiveSearchResult] = useState<SearchResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);

  // Set initial time on mount
  useEffect(() => {
    const { day, period } = getPeriodFromTime();
    setSelectedDay(day);
    setSelectedPeriod(period);
  }, []);

  // Compute floor groups and stats
  const floorGroups = useMemo(() => {
    return getAllFloorsStatus(selectedDay, selectedPeriod);
  }, [selectedDay, selectedPeriod]);

  // Overall campus statistics
  const campusStats = useMemo(() => {
    let totalRooms = 0;
    let freeRooms = 0;
    floorGroups.forEach(fg => {
      totalRooms += fg.totalRooms;
      freeRooms += fg.freeRoomsCount;
    });
    return {
      totalRooms,
      freeRooms,
      occupiedRooms: totalRooms - freeRooms,
      occupancyRate: Math.round(((totalRooms - freeRooms) / (totalRooms || 1)) * 100)
    };
  }, [floorGroups]);

  // Handle AI Search Execution
  const handleSearchSubmit = async (queryText?: string) => {
    const text = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!text) {
      setActiveSearchResult(null);
      setAiExplanation('');
      return;
    }

    setSearchQuery(text);
    setIsAiLoading(true);

    // Instant deterministic match
    const fastResult = parseNaturalLanguageQuery(text, selectedDay, selectedPeriod);
    setActiveSearchResult(fastResult);

    try {
      const aiResult = await askGeminiRoomLocator(text, selectedDay, selectedPeriod);
      setAiExplanation(aiResult.explanation);
      if (aiResult.searchResult) {
        setActiveSearchResult(aiResult.searchResult);
      }
    } catch {
      // Fallback already handled inside askGeminiRoomLocator
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearchResult(null);
    setAiExplanation('');
  };

  const handleCopyLocation = (room: Room) => {
    const text = `${room.name} (${room.code}) · ${room.floor}, ${room.building}`;
    navigator.clipboard.writeText(text);
    setCopiedRoomCode(room.code);
    setTimeout(() => setCopiedRoomCode(null), 2000);
  };

  // Filtered rooms for standard floor grid
  const filteredFloorGroups = useMemo(() => {
    return floorGroups.map(fg => {
      let rooms = fg.rooms;

      // Filter by traditional toggles
      if (onlyFreeNow) {
        rooms = rooms.filter(r => r.isFree);
      }
      if (onlyAC) {
        rooms = rooms.filter(r => r.room.isAC);
      }
      if (onlyPower) {
        rooms = rooms.filter(r => r.room.hasPowerSockets);
      }
      if (onlyProjector) {
        rooms = rooms.filter(r => r.room.hasProjector);
      }
      if (minFreeHours > 0) {
        rooms = rooms.filter(r => r.freeDurationMinutes >= minFreeHours * 50);
      }

      return {
        ...fg,
        rooms
      };
    }).filter(fg => selectedFloor === 'All' || fg.floor === selectedFloor);
  }, [floorGroups, selectedFloor, onlyFreeNow, onlyAC, onlyPower, onlyProjector, minFreeHours]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Header & Value Proposition */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-zinc-500/[0.05] via-transparent to-transparent border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Space Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Free Classroom Tracker
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Find quiet study spaces with guaranteed vacancy windows. Real-time availability cross-referenced across all 10 departmental timetables with contiguous hours and team invites.
            </p>
          </div>

          {/* Real-time Campus Metric Pill */}
          <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-zinc-900/60 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
            <div className="text-center px-3 py-1 border-r border-black/[0.06] dark:border-white/[0.08]">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {campusStats.freeRooms}
              </div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Rooms Free
              </div>
            </div>
            <div className="text-center px-3 py-1 border-r border-black/[0.06] dark:border-white/[0.08]">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {campusStats.occupiedRooms}
              </div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                In Session
              </div>
            </div>
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {campusStats.totalRooms}
              </div>
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Total Tracked
              </div>
            </div>
          </div>
        </div>

        {/* The AI Room Finder Smart Search Bar */}
        <div className="mt-8 space-y-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300" />
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-sm px-4 py-3 gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
                placeholder='Ask naturally: "Need an AC room on 4th floor with power sockets for 4 people for 2 hours"'
                className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleSearchSubmit()}
                disabled={isAiLoading || !searchQuery.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Room</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Example Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-zinc-500 font-medium mr-1">
              Suggestions:
            </span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSearchSubmit(preset)}
                className="text-xs px-2.5 py-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 border border-black/[0.06] dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 transition text-left"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] mt-4">
            <nav className="flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]" aria-label="Floor visualization mode">
              <button
                onClick={() => setActiveViewMode('3d')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  activeViewMode === '3d'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${activeViewMode === '3d' ? 'text-blue-500' : 'text-zinc-400'}`} />
                <span>3D Campus Model</span>
              </button>
              <button
                onClick={() => setActiveViewMode('grid')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  activeViewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${activeViewMode === 'grid' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <span>Floor-by-Floor Grid</span>
              </button>
            </nav>

            <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-time availability across 7 floors</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search Results Showcase (Active when search executed) */}
      {activeSearchResult && (
        <section className="rounded-3xl border border-blue-500/30 bg-blue-500/[0.03] dark:bg-blue-950/20 backdrop-blur-xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  AI Room Recommendations
                </h2>
                <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                  <span>Parsed parameters:</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium">
                    {activeSearchResult.queryParsed.summaryText || 'Natural parameters'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {activeSearchResult.totalMatches} room{activeSearchResult.totalMatches !== 1 ? 's' : ''} matched
              </span>
              <button
                onClick={handleClearSearch}
                className="text-xs px-2.5 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-600 dark:text-zinc-300 transition"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* AI Reasoning Narrative */}
          {aiExplanation && (
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/80 border border-blue-500/20 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed shadow-xs flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-zinc-900 dark:text-white">Analysis & Vacancy Guarantee:</p>
                <p className="whitespace-pre-line">{aiExplanation}</p>
              </div>
            </div>
          )}

          {/* Recommended Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSearchResult.matchedRooms.slice(0, 6).map((match, idx) => (
              <div
                key={match.room.id}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  idx === 0 
                    ? 'bg-linear-to-b from-blue-500/[0.08] to-transparent border-blue-500/40 ring-1 ring-blue-500/20' 
                    : 'bg-white/80 dark:bg-zinc-900/70 border-black/[0.08] dark:border-white/[0.08]'
                }`}
              >
                {idx === 0 && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                    <ShieldCheck className="w-3 h-3" /> Best Match
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {match.room.floor}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="text-xs text-zinc-500">{match.room.type}</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                      {match.room.name}
                    </h3>
                    <div className="text-xs font-mono text-zinc-500">
                      Code: {match.room.code}
                    </div>
                  </div>

                  {/* Free Duration Countdown Pill */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Free for {(match.freeDurationMinutes / 60).toFixed(1)} hrs</span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      Until {match.freeUntilTime}
                    </span>
                  </div>

                  {/* Match Badges */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-zinc-500">Match Reasons:</div>
                    <div className="flex flex-wrap gap-1">
                      {match.matchReasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[11px] text-zinc-700 dark:text-zinc-300 font-medium"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Room Amenities */}
                  <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500 border-t border-black/[0.06] dark:border-white/[0.06]">
                    {match.room.isAC && (
                      <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400" title="Air Conditioned">
                        <Wind className="w-3.5 h-3.5" /> AC
                      </span>
                    )}
                    {match.room.hasPowerSockets && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Power Sockets">
                        <Zap className="w-3.5 h-3.5" /> Sockets
                      </span>
                    )}
                    {match.room.hasProjector && (
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400" title="Projector Screen">
                        <Tv className="w-3.5 h-3.5" /> Projector
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400" title="Capacity">
                      <Users className="w-3.5 h-3.5" /> {match.room.capacity} seats
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 mt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <button
                    onClick={() => setSelectedRoomForDetail(match)}
                    className="w-full py-2 px-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Call the Squad · Live Countdown</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={() => handleCopyLocation(match.room)}
                      className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition"
                    >
                      {copiedRoomCode === match.room.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Copy Details</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      Guaranteed Safe
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Phase 2: 3D Campus Architectural Model View */}
      {activeViewMode === '3d' && (
        <section className="space-y-4">
          <Building3DMap
            selectedDay={selectedDay}
            selectedPeriod={selectedPeriod}
            onSelectRoom={(status) => setSelectedRoomForDetail(status)}
          />
        </section>
      )}

      {/* Global Interactive Time Travel & Floor Controls Bar */}
      <section className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Day Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5" /> Day:
            </span>
            {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as DayOfWeek[]).map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  selectedDay === day
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'bg-black/[0.04] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.08] dark:hover:bg-white/[0.08]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Current Period Badge / Switcher */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-zinc-500 font-medium">
              Simulated Period:
            </div>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(Number(e.target.value))}
              className="bg-white dark:bg-zinc-900 border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              {SEMESTER_CONFIG.periods.map(p => (
                <option key={p.period} value={p.period}>
                  Period {p.period} ({p.time})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Period Navigation Slider / Buttons */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {SEMESTER_CONFIG.periods.map(p => {
              const isSelected = selectedPeriod === p.period;
              const isLunch = p.period === 5;
              return (
                <button
                  key={p.period}
                  onClick={() => setSelectedPeriod(p.period)}
                  className={`p-2 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border-black/[0.04] dark:border-white/[0.05] text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                    {isLunch ? 'Lunch' : `P${p.period}`}
                  </div>
                  <div className="text-xs font-semibold truncate">
                    {p.time.split(' - ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          
          {/* Floor Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mr-1">Floor:</span>
            {['All', 'Ground Floor', '1st Floor', '2nd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor'].map(floor => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                  selectedFloor === floor
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {floor === 'All' ? 'All Floors' : floor.replace(' Floor', '')}
              </button>
            ))}
          </div>

          {/* Amenity Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFreeNow(!onlyFreeNow)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1 ${
                onlyFreeNow
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-transparent'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" /> Empty Only
            </button>
            <button
              onClick={() => setOnlyAC(!onlyAC)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1 ${
                onlyAC
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-transparent'
              }`}
            >
              <Wind className="w-3 h-3" /> AC
            </button>
            <button
              onClick={() => setOnlyPower(!onlyPower)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1 ${
                onlyPower
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-transparent'
              }`}
            >
              <Zap className="w-3 h-3" /> Power
            </button>
            <button
              onClick={() => setOnlyProjector(!onlyProjector)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1 ${
                onlyProjector
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-transparent'
              }`}
            >
              <Tv className="w-3 h-3" /> Projector
            </button>
            <button
              onClick={() => setMinFreeHours(minFreeHours === 2 ? 0 : 2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1 ${
                minFreeHours === 2
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                  : 'bg-black/[0.03] dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-transparent'
              }`}
            >
              <Clock className="w-3 h-3" /> 2+ Hrs Free
            </button>
          </div>

        </div>
      </section>

      {/* The Floor Grid: Organized Floor by Floor */}
      <section className="space-y-8">
        {filteredFloorGroups.map(fg => (
          <div key={fg.floor} className="space-y-4">
            
            {/* Floor Header */}
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-white">
                  {fg.floorNumber === 0 ? 'GF' : `${fg.floorNumber}F`}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {fg.floor}
                  </h3>
                  <div className="text-xs text-zinc-500">
                    {fg.freeRoomsCount} of {fg.totalRooms} rooms free at Period {selectedPeriod}
                  </div>
                </div>
              </div>

              <div className="text-xs font-medium text-zinc-500">
                {fg.freeRoomsCount > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Vacancies available
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> All rooms occupied
                  </span>
                )}
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fg.rooms.map(roomStatus => (
                <div
                  key={roomStatus.room.id}
                  className={`rounded-2xl border p-5 backdrop-blur-xl transition-all shadow-xs flex flex-col justify-between ${
                    roomStatus.isFree
                      ? 'bg-white/80 dark:bg-zinc-900/60 border-black/[0.06] dark:border-white/[0.08] hover:border-emerald-500/40 hover:shadow-md'
                      : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-black/[0.04] dark:border-white/[0.05] opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Card Top: Code & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">
                            {roomStatus.room.code}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 font-medium">
                            {roomStatus.room.type}
                          </span>
                        </div>
                        <h4 className="text-xs text-zinc-600 dark:text-zinc-400 font-medium line-clamp-1 mt-0.5">
                          {roomStatus.room.name}
                        </h4>
                      </div>

                      {/* Status Indicator */}
                      {roomStatus.isFree ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Available</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>In Session</span>
                        </div>
                      )}
                    </div>

                    {/* Vacancy Details */}
                    {roomStatus.isFree ? (
                      <div className="p-3 rounded-xl bg-emerald-500/[0.06] dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            Free for {(roomStatus.freeDurationMinutes / 60).toFixed(1)} hrs
                          </span>
                          <span className="text-zinc-500 text-[11px]">
                            {roomStatus.freePeriodCount} continuous period{roomStatus.freePeriodCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          {roomStatus.nextClass ? (
                            <span>
                              Next class: <strong className="text-zinc-800 dark:text-zinc-200">{roomStatus.nextClass.startsAt}</strong> ({roomStatus.nextClass.sectionName})
                            </span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                              Vacant for the rest of the day until 04:50 PM
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/[0.06] dark:bg-amber-950/20 border border-amber-500/20 space-y-1">
                        <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 line-clamp-1">
                          {roomStatus.currentOccupant?.sectionName}
                        </div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                          {roomStatus.currentOccupant?.subjectName}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-0.5">
                          <span>Faculty: {roomStatus.currentOccupant?.faculty || 'Dept'}</span>
                          <span>Until {roomStatus.currentOccupant?.untilTime}</span>
                        </div>
                      </div>
                    )}

                    {/* Room Description */}
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {roomStatus.room.description}
                    </p>

                    {/* Amenities Row */}
                    <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500 border-t border-black/[0.04] dark:border-white/[0.04]">
                      {roomStatus.room.isAC && (
                        <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400" title="Air Conditioned">
                          <Wind className="w-3.5 h-3.5" /> AC
                        </span>
                      )}
                      {roomStatus.room.hasPowerSockets && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Power Sockets">
                          <Zap className="w-3.5 h-3.5" /> Sockets
                        </span>
                      )}
                      {roomStatus.room.hasProjector && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400" title="Projector Screen">
                          <Tv className="w-3.5 h-3.5" /> Projector
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400" title="Capacity">
                        <Users className="w-3.5 h-3.5" /> {roomStatus.room.capacity}
                      </span>
                    </div>

                  </div>

                  {/* Card Bottom: Quick Actions */}
                  <div className="pt-3 mt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLocation(roomStatus.room)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition flex items-center gap-1"
                    >
                      {copiedRoomCode === roomStatus.room.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3 h-3" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedRoomForDetail(roomStatus)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white dark:text-emerald-400 dark:hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Invite Squad</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {fg.rooms.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-500">
                No rooms match the currently applied filters on {fg.floor}.
              </div>
            )}

          </div>
        ))}
      </section>

      {/* Phase 2: Live Countdown & "Call the Squad" Modal */}
      <RoomDetailModal
        roomStatus={selectedRoomForDetail}
        onClose={() => setSelectedRoomForDetail(null)}
        dayName={selectedDay}
        periodNumber={selectedPeriod}
      />

    </div>
  );
}
