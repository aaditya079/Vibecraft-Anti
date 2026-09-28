import { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Award, 
  Coffee, 
  BookOpen,
  Volume2,
  VolumeX,
  Sliders,
  CalendarCheck,
  BarChart2,
  FileCheck,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { CLASS_SECTIONS, SEMESTER_CONFIG, type ClassSection } from './data/timetables';
import { calculateAttendance, type SubjectAttendanceResult } from './utils/calculator';
import AttendanceCharts from './components/AttendanceCharts';
import ODSimulator from './components/ODSimulator';
import AttendanceAdvisorChat from './components/AttendanceAdvisorChat';
import ClassroomLocator from './components/ClassroomLocator';
import confetti from 'canvas-confetti';

export default function App() {
  // Mode switcher: 'locator' (Round 2) vs 'attendance' (Round 1)
  const [appMode, setAppMode] = useState<'locator' | 'attendance'>('locator');

  const [selectedSectionId, setSelectedSectionId] = useState<string>('ii-bme');
  const [planningDate, setPlanningDate] = useState<string>(SEMESTER_CONFIG.defaultToday);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'od' | 'timetable' | 'simulator'>('calculator');
  const [simulatedSkips, setSimulatedSkips] = useState<number>(0);

  // Theme state: light or dark mode
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Attendance inputs state: subjectCode -> percentage (default 78%)
  const [attendanceInputs, setAttendanceInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    CLASS_SECTIONS.find(s => s.id === 'ii-bme')?.subjects.forEach(sub => {
      initial[sub.code] = 78;
    });
    return initial;
  });

  const selectedSection = useMemo<ClassSection>(() => {
    return CLASS_SECTIONS.find(s => s.id === selectedSectionId) || CLASS_SECTIONS[0];
  }, [selectedSectionId]);

  // When section changes, initialize inputs for subjects if missing
  const handleSectionChange = (newSectionId: string) => {
    setSelectedSectionId(newSectionId);
    const newSec = CLASS_SECTIONS.find(s => s.id === newSectionId);
    if (newSec) {
      setAttendanceInputs(prev => {
        const updated = { ...prev };
        newSec.subjects.forEach(sub => {
          if (updated[sub.code] === undefined) {
            updated[sub.code] = 80;
          }
        });
        return updated;
      });
    }
  };

  const handlePercentageChange = (code: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setAttendanceInputs(prev => ({
      ...prev,
      [code]: clamped
    }));
  };

  const applyPreset = (pct: number) => {
    const updated: Record<string, number> = {};
    selectedSection.subjects.forEach(sub => {
      updated[sub.code] = pct;
    });
    setAttendanceInputs(updated);
    if (pct >= 90) {
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const handleApplyODAdjustments = (adjusted: Record<string, number>) => {
    setAttendanceInputs(prev => ({
      ...prev,
      ...adjusted
    }));
    confetti({ particleCount: 35, spread: 65 });
  };

  // Calculation results
  const results = useMemo(() => {
    return calculateAttendance(selectedSection, attendanceInputs, planningDate);
  }, [selectedSection, attendanceInputs, planningDate]);

  // Identify any subjects with irreversible detention
  const irreversibleSubjects = useMemo(() => {
    return results.subjectResults.filter(s => s.isIrreversibleDetention);
  }, [results]);

  const hasIrreversible = irreversibleSubjects.length > 0 || results.isOverallIrreversible;

  // Sound alert trigger simulation
  const triggerBuzzer = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext not allowed without gesture
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Apple-style Frosted Navigation Bar */}
      <header className="border-b border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-black/75 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center text-zinc-900 dark:text-white shadow-sm">
              {appMode === 'locator' ? (
                <Compass className="w-4 h-4 text-blue-500" />
              ) : (
                <Calendar className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white">
                  {appMode === 'locator' ? 'Classroom' : 'Attendance'}
                </span>
                <span className="text-zinc-500 font-normal text-sm sm:text-base">
                  {appMode === 'locator' ? 'Locator' : 'Intelligence'}
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Switcher */}
          <nav className="flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]" aria-label="Main application view">
            <button
              onClick={() => setAppMode('locator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                appMode === 'locator'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${appMode === 'locator' ? 'text-blue-500' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">Classroom Locator</span>
              <span className="sm:hidden">Locator</span>
            </button>
            <button
              onClick={() => setAppMode('attendance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                appMode === 'attendance'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${appMode === 'attendance' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              <span className="hidden sm:inline">Attendance Advisor</span>
              <span className="sm:hidden">Attendance</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Reference: <strong className="text-zinc-800 dark:text-zinc-300 font-normal">Sep 28, 2026</strong></span>
            </div>

            {/* Light / Dark Mode Toggle Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme appearance"
              className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] border border-black/[0.06] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
            </button>

            {/* Sound Cue Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute audio cues" : "Enable audio cues"}
              aria-label="Toggle audio cues"
              className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] border border-black/[0.06] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 transition"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {appMode === 'locator' ? (
          <ClassroomLocator />
        ) : (
          <>
            {/* Apple Critical Alert Banner */}
        {hasIrreversible && (
          <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/[0.08] dark:bg-red-950/20 backdrop-blur-xl p-5 shadow-sm dark:shadow-lg dark:shadow-red-950/20 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-500 dark:text-red-400 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-red-700 dark:text-red-300">
                      Attendance Limit Exceeded
                    </h2>
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-red-500/15 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 rounded-full">
                      Irreversible Detention
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed max-w-3xl">
                    Even with 100% attendance in all remaining classes through November 29, the statutory 75% threshold cannot be attained in{' '}
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">
                      {irreversibleSubjects.map(s => s.name).join(', ') || 'Overall Semester'}
                    </span>.
                  </p>
                </div>
              </div>
              <button 
                onClick={triggerBuzzer}
                className="px-3 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.1] text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl transition shrink-0 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" /> Test Warning Tone
              </button>
            </div>
          </div>
        )}

        {/* Global Controls & Planning Bar */}
        <section className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl shadow-sm dark:shadow-none space-y-4 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Section Selector */}
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Class Section
              </label>
              <select
                value={selectedSectionId}
                onChange={e => handleSectionChange(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900/90 border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition shadow-sm dark:shadow-none"
              >
                {CLASS_SECTIONS.map(sec => (
                  <option key={sec.id} value={sec.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    {sec.name} · {sec.venue}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Planning Date */}
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Planning Horizon Date
              </label>
              <input
                type="date"
                min={SEMESTER_CONFIG.startDate}
                max={SEMESTER_CONFIG.endDate}
                value={planningDate}
                onChange={e => setPlanningDate(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900/90 border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition shadow-sm dark:shadow-none"
              />
            </div>

            {/* Quick Presets - Apple Segmented Style */}
            <div>
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Attendance Scenarios
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/[0.04] dark:bg-zinc-950/60 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                <button
                  onClick={() => applyPreset(92)}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-transparent text-zinc-800 dark:text-zinc-300 text-xs font-medium transition text-center shadow-xs dark:shadow-none"
                >
                  92%
                </button>
                <button
                  onClick={() => applyPreset(78)}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-transparent text-zinc-800 dark:text-zinc-300 text-xs font-medium transition text-center shadow-xs dark:shadow-none"
                >
                  78%
                </button>
                <button
                  onClick={() => applyPreset(65)}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-transparent text-zinc-800 dark:text-zinc-300 text-xs font-medium transition text-center shadow-xs dark:shadow-none"
                >
                  65%
                </button>
                <button
                  onClick={() => applyPreset(40)}
                  className="py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-transparent text-zinc-800 dark:text-zinc-300 text-xs font-medium transition text-center shadow-xs dark:shadow-none"
                >
                  40%
                </button>
              </div>
            </div>

          </div>

          {/* Timeline Bar */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-zinc-500 gap-2">
            <div>
              <span>Semester Horizon: </span>
              <span className="text-zinc-600 dark:text-zinc-400">Aug 29, 2026</span>
              <span className="mx-1 text-zinc-400 dark:text-zinc-600">→</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">{planningDate}</span>
              <span className="mx-1 text-zinc-400 dark:text-zinc-600">→</span>
              <span className="text-zinc-600 dark:text-zinc-400">Nov 29, 2026</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Elapsed: <span className="text-zinc-800 dark:text-zinc-300">{results.daysPassed} days</span></span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>Remaining: <span className="text-zinc-800 dark:text-zinc-300">{results.daysRemaining} days</span> ({((results.daysRemaining / results.totalSemesterDays) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </section>

        {/* Apple-style Metric Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Classes Remaining */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none hover:border-black/[0.12] dark:hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="text-xs font-medium">Classes Remaining</span>
              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {results.totalClassesRemaining}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {results.totalClassesHeld} held · {results.totalSemesterClasses} scheduled
              </p>
            </div>
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-full h-1 mt-4 overflow-hidden">
              <div 
                className="bg-zinc-700 dark:bg-zinc-400 h-full rounded-full" 
                style={{ width: `${(results.totalClassesRemaining / results.totalSemesterClasses) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 2: 75% Threshold Target */}
          <div className={`bg-white/80 dark:bg-zinc-900/40 border ${results.isOverallIrreversible ? 'border-red-500/40' : 'border-black/[0.06] dark:border-white/[0.08]'} rounded-2xl p-4 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none hover:border-black/[0.12] dark:hover:border-white/[0.14] transition-all`}>
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="text-xs font-medium">Target: ≥75% Safe</span>
              <ShieldAlert className={`w-3.5 h-3.5 ${results.isOverallIrreversible ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
            </div>
            <div className="mt-3">
              <div className={`text-3xl font-semibold tracking-tight ${results.isOverallIrreversible ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                {results.isOverallIrreversible ? 'Detention' : `${results.overallToAttend75} Classes`}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {results.isOverallIrreversible 
                  ? `Ceiling is ${results.overallMaxAchievable}% (below 75%)` 
                  : results.overallToAttend75 === 0 
                  ? 'Attendance threshold met' 
                  : `Attend ${results.overallToAttend75} of ${results.totalClassesRemaining} left`}
              </p>
            </div>
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-full h-1 mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${results.isOverallIrreversible ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(100, (results.overallCurrentPercentage / 75) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 3: 90% Target */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none hover:border-black/[0.12] dark:hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="text-xs font-medium">Target: ≥90% Distinction</span>
              <Award className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {results.overallAttended + results.totalClassesRemaining < Math.ceil(0.9 * results.totalSemesterClasses)
                  ? 'Unachievable'
                  : `${results.overallToAttend90} Classes`}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {results.overallAttended + results.totalClassesRemaining < Math.ceil(0.9 * results.totalSemesterClasses)
                  ? `Peak achievable is ${results.overallMaxAchievable}%`
                  : results.overallToAttend90 === 0
                  ? 'Distinction threshold secured'
                  : `Need ${results.overallToAttend90} classes to reach 90%`}
              </p>
            </div>
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-full h-1 mt-4 overflow-hidden">
              <div 
                className="bg-purple-500 dark:bg-purple-400/80 h-full rounded-full" 
                style={{ width: `${Math.min(100, (results.overallCurrentPercentage / 90) * 100)}%` }}
              />
            </div>
          </div>

          {/* Card 4: Overall % Gauge */}
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex flex-col justify-between shadow-sm dark:shadow-none hover:border-black/[0.12] dark:hover:border-white/[0.14] transition-all">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span className="text-xs font-medium">Current Overall</span>
              <TrendingUp className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {results.overallCurrentPercentage}%
              </span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                ({results.overallAttended}/{results.totalClassesHeld})
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 truncate">
              Section: {selectedSection.name}
            </p>
            <div className="w-full bg-black/[0.06] dark:bg-white/[0.06] rounded-full h-1 mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${results.overallCurrentPercentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                style={{ width: `${Math.min(100, results.overallCurrentPercentage)}%` }}
              />
            </div>
          </div>

        </section>

        {/* Apple-style Segmented Pill Navigation */}
        <div className="flex justify-start sm:justify-center overflow-x-auto py-1">
          <div className="inline-flex p-1 bg-black/[0.05] dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl gap-1 shadow-sm dark:shadow-none">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Core Calculator
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'charts'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Visual Analytics
            </button>

            <button
              onClick={() => setActiveTab('od')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'od'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              OD & Leave Simulator
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Timetable
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              Bunk Margin
            </button>
          </div>
        </div>

        {/* TAB 1: CORE CALCULATOR TABLE */}
        {activeTab === 'calculator' && (
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-none transition-colors">
            <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Subject Breakdown & Required Classes
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Adjust current percentage to calculate remaining classes needed before Nov 29, 2026.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Compliant (≥75%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> At Risk
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Detention
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-3 px-4">Subject & Faculty</th>
                    <th className="py-3 px-3">Slot</th>
                    <th className="py-3 px-4 min-w-[210px]">Current Attendance</th>
                    <th className="py-3 px-3 text-center">Remaining</th>
                    <th className="py-3 px-4">For ≥75% Safe</th>
                    <th className="py-3 px-4">For ≥90% Distinction</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {results.subjectResults.map((sub: SubjectAttendanceResult) => {
                    return (
                      <tr 
                        key={sub.code} 
                        className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition ${
                          sub.isIrreversibleDetention ? 'bg-red-500/[0.06] dark:bg-red-950/15' : ''
                        }`}
                      >
                        {/* Subject Details */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-zinc-900 dark:text-zinc-200">
                            {sub.name}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-zinc-600 dark:text-zinc-400">{sub.code}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{sub.faculty}</span>
                          </div>
                        </td>

                        {/* Slot */}
                        <td className="py-3 px-3 text-xs text-zinc-600 dark:text-zinc-400">
                          <span className="px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
                            Slot {sub.slot}
                          </span>
                        </td>

                        {/* Current % Slider & Direct Input */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sub.currentPercentage}
                              onChange={e => handlePercentageChange(sub.code, Number(e.target.value))}
                              className="w-full h-1.5"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={sub.currentPercentage}
                                onChange={e => handlePercentageChange(sub.code, Number(e.target.value))}
                                className="w-12 px-1 py-0.5 text-xs font-medium bg-white dark:bg-zinc-900 border border-black/[0.1] dark:border-white/[0.1] rounded text-center text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-white/30"
                              />
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">%</span>
                            </div>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-1">
                            Attended: {sub.classesAttended} of {sub.classesHeld} held
                          </div>
                        </td>

                        {/* Classes Left */}
                        <td className="py-3 px-3 text-center">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            {sub.classesRemaining}
                          </span>
                          <span className="text-xs text-zinc-500 block">
                            /{sub.totalSemesterClasses} total
                          </span>
                        </td>

                        {/* To Reach 75% */}
                        <td className="py-3 px-4 text-xs">
                          {sub.isIrreversibleDetention ? (
                            <div className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>Precluded (Max {sub.maxAchievablePercentage}%)</span>
                            </div>
                          ) : sub.classesToAttend75 === 0 ? (
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Compliant ({sub.bunkBudget75} skips left)</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-zinc-900 dark:text-zinc-200 font-medium">
                                Attend {sub.classesToAttend75}
                              </span>
                              <span className="text-zinc-500 block text-[11px]">
                                of {sub.classesRemaining} remaining
                              </span>
                            </div>
                          )}
                        </td>

                        {/* To Reach 90% */}
                        <td className="py-3 px-4 text-xs">
                          {!sub.canAchieve90 ? (
                            <span className="text-zinc-400 dark:text-zinc-500">
                              Peak: {sub.maxAchievablePercentage}%
                            </span>
                          ) : sub.classesToAttend90 === 0 ? (
                            <span className="text-purple-600 dark:text-purple-300 font-medium flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                              <span>Secured ({sub.bunkBudget90} skips left)</span>
                            </span>
                          ) : (
                            <div>
                              <span className="text-purple-600 dark:text-purple-300 font-medium">
                                Attend {sub.classesToAttend90}
                              </span>
                              <span className="text-zinc-500 block text-[11px]">
                                of {sub.classesRemaining} remaining
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          {sub.isIrreversibleDetention ? (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30">
                              Detained
                            </span>
                          ) : sub.currentPercentage >= 90 ? (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                              Distinction
                            </span>
                          ) : sub.currentPercentage >= 75 ? (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              Compliant
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                              At Risk
                            </span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL CHARTS (PHASE 2) */}
        {activeTab === 'charts' && (
          <AttendanceCharts results={results} />
        )}

        {/* TAB 3: OD & MEDICAL LEAVE SIMULATOR (PHASE 2) */}
        {activeTab === 'od' && (
          <ODSimulator 
            section={selectedSection} 
            results={results} 
            onApplyOD={handleApplyODAdjustments} 
          />
        )}

        {/* TAB 4: TIMETABLE VIEW */}
        {activeTab === 'timetable' && (
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  Class Schedule Grid · {selectedSection.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Venue: {selectedSection.venue} · 9 periods scheduled per day
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 font-medium border-b border-black/[0.06] dark:border-white/[0.06]">
                    <th className="p-3 text-left w-24">Day</th>
                    {SEMESTER_CONFIG.periods.map(p => (
                      <th key={p.period} className="p-2 text-center border-l border-black/[0.04] dark:border-white/[0.04] min-w-[85px]">
                        <div>P{p.period}</div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">{p.time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map(day => {
                    const rowSlots = selectedSection.schedule[day] || [];
                    return (
                      <tr key={day} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                        <td className="p-3 font-medium text-zinc-800 dark:text-zinc-300 bg-black/[0.01] dark:bg-white/[0.01]">
                          {day}
                        </td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const subCode = rowSlots[idx];
                          const sub = selectedSection.subjects.find(s => s.code === subCode);
                          const isLunch = idx === 4;

                          if (isLunch) {
                            return (
                              <td key={idx} className="p-2 text-center text-zinc-400 dark:text-zinc-600 border-l border-black/[0.04] dark:border-white/[0.04] text-[10px]">
                                Break
                              </td>
                            );
                          }

                          return (
                            <td key={idx} className="p-2 text-center border-l border-black/[0.04] dark:border-white/[0.04]">
                              {subCode ? (
                                <div className="p-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-zinc-800 dark:text-zinc-200">
                                  <div className="font-medium text-[11px] truncate">{subCode}</div>
                                  <div className="text-[10px] text-zinc-500 truncate max-w-[80px] mx-auto">
                                    {sub ? sub.name : 'Class'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-zinc-300 dark:text-zinc-700">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BUNK SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-sm dark:shadow-none transition-colors">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                Bunk Margin Simulator
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Simulate prospective absences and evaluate projected final standing on November 29, 2026.
              </p>
            </div>

            <div className="bg-black/[0.02] dark:bg-zinc-950/60 border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Prospective Skips</span>
                  <div className="text-3xl font-semibold text-zinc-900 dark:text-white">
                    {simulatedSkips} <span className="text-sm font-normal text-zinc-500">Classes</span>
                  </div>
                </div>
                <div className="flex-1 max-w-md w-full">
                  <input
                    type="range"
                    min="0"
                    max={Math.min(50, results.totalClassesRemaining)}
                    value={simulatedSkips}
                    onChange={e => setSimulatedSkips(Number(e.target.value))}
                    className="w-full h-1.5"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>0 skips</span>
                    <span>Max {Math.min(50, results.totalClassesRemaining)} skips</span>
                  </div>
                </div>
              </div>

              {/* Projected Impact */}
              {(() => {
                const projectedAttended = Math.max(0, results.overallAttended + (results.totalClassesRemaining - simulatedSkips));
                const projectedPct = results.totalSemesterClasses > 0 ? (projectedAttended / results.totalSemesterClasses) * 100 : 0;
                const isProjectedDetained = projectedPct < 75;

                return (
                  <div className={`p-4 rounded-xl border ${isProjectedDetained ? 'border-red-500/30 bg-red-500/[0.08] dark:bg-red-950/20' : 'border-emerald-500/30 bg-emerald-500/[0.08] dark:bg-emerald-950/20'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
                    <div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Projected Semester Finish</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-2xl font-semibold ${isProjectedDetained ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {projectedPct.toFixed(1)}%
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          ({projectedAttended} of {results.totalSemesterClasses} classes attended)
                        </span>
                      </div>
                    </div>
                    <div>
                      {isProjectedDetained ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/15 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 text-xs font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Below Mandatory Threshold
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Compliant Standing
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Apple Intelligence Style Advisor Chat for Round 1 */}
      {appMode === 'attendance' && (
        <AttendanceAdvisorChat 
          section={selectedSection} 
          results={results} 
          planningDate={planningDate} 
        />
      )}

      {/* Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent py-4 text-center text-xs text-zinc-500">
        Campus Resource Locator & Attendance Intelligence · 2026
      </footer>
    </div>
  );
}
