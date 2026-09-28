import { useState, useMemo } from 'react';
import { type ClassSection, SEMESTER_CONFIG } from '../data/timetables';
import { type SemesterCalculationResult } from '../utils/calculator';
import { Calendar, FileCheck, Stethoscope, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface Props {
  section: ClassSection;
  results: SemesterCalculationResult;
  onApplyOD: (adjustedAttendance: Record<string, number>) => void;
}

export default function ODSimulator({ section, results, onApplyOD }: Props) {
  const [leaveType, setLeaveType] = useState<'od' | 'medical' | 'casual'>('od');
  const [startDate, setStartDate] = useState<string>('2026-10-05');
  const [endDate, setEndDate] = useState<string>('2026-10-07');
  const [applied, setApplied] = useState<boolean>(false);

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calculate affected classes in the date range based on the section timetable
  const leaveImpact = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate range
    if (start > end) return { subjectCounts: {}, totalPeriods: 0, dayCount: 0 };

    const subjectCounts: Record<string, number> = {};
    section.subjects.forEach(sub => {
      subjectCounts[sub.code] = 0;
    });

    let totalPeriods = 0;
    let dayCount = 0;
    const cur = new Date(start);

    while (cur <= end) {
      const dayName = DAY_NAMES[cur.getDay()];
      const daySchedule = section.schedule[dayName];
      if (daySchedule) {
        dayCount++;
        daySchedule.forEach(subCode => {
          if (subCode && subjectCounts[subCode] !== undefined) {
            subjectCounts[subCode] = (subjectCounts[subCode] || 0) + 1;
            totalPeriods++;
          }
        });
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { subjectCounts, totalPeriods, dayCount };
  }, [section, startDate, endDate]);

  // Projected new percentages with OD / Medical Leave applied
  const projectedStats = useMemo(() => {
    const adjustedPercentages: Record<string, number> = {};
    let newOverallAttended = results.overallAttended;

    const subjectsAfter = results.subjectResults.map(sub => {
      const periodsInLeave = leaveImpact.subjectCounts[sub.code] || 0;
      let newAttended = sub.classesAttended;
      let newHeld = sub.classesHeld;

      if (leaveType === 'od') {
        newAttended = Math.min(sub.totalSemesterClasses, sub.classesAttended + periodsInLeave);
      } else if (leaveType === 'medical') {
        newAttended = Math.min(sub.totalSemesterClasses, sub.classesAttended + periodsInLeave);
      } else {
        newHeld = Math.min(sub.totalSemesterClasses, sub.classesHeld + periodsInLeave);
      }

      const newPct = newHeld > 0 ? (newAttended / newHeld) * 100 : sub.currentPercentage;
      const finalProjectedPct = sub.totalSemesterClasses > 0 
        ? ((newAttended + (sub.classesRemaining - (leaveType === 'casual' ? periodsInLeave : 0))) / sub.totalSemesterClasses) * 100 
        : 100;
      
      const clampedPct = Math.max(0, Math.min(100, Number(newPct.toFixed(1))));
      adjustedPercentages[sub.code] = clampedPct;

      return {
        code: sub.code,
        name: sub.name,
        beforePct: sub.currentPercentage,
        afterPct: clampedPct,
        periodsInLeave,
        finalProjectedPct: Number(finalProjectedPct.toFixed(1)),
        willBeDetained: finalProjectedPct < 75
      };
    });

    if (leaveType === 'od' || leaveType === 'medical') {
      newOverallAttended = Math.min(results.totalSemesterClasses, results.overallAttended + leaveImpact.totalPeriods);
    }
    const newOverallPct = results.totalClassesHeld > 0 ? (newOverallAttended / results.totalClassesHeld) * 100 : results.overallCurrentPercentage;

    return {
      subjectsAfter,
      adjustedPercentages,
      newOverallPct: Number(newOverallPct.toFixed(1)),
      diffOverall: Number((newOverallPct - results.overallCurrentPercentage).toFixed(1))
    };
  }, [results, leaveImpact, leaveType]);

  const handleApply = () => {
    onApplyOD(projectedStats.adjustedPercentages);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/40 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 backdrop-blur-xl shadow-sm dark:shadow-none space-y-6 transition-colors">
      
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            Leave & On-Duty (OD) Simulation Engine
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Model how certified OD, medical concessions, or unexcused leaves shift your attendance percentages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.08]">
            Timetable-Aware
          </span>
        </div>
      </div>

      {/* Simulator Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Leave Type - Apple Segmented Control */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5">
            Leave Category
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/[0.04] dark:bg-zinc-950/60 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setLeaveType('od')}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition flex flex-col items-center gap-1 ${
                leaveType === 'od'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>On-Duty</span>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('medical')}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition flex flex-col items-center gap-1 ${
                leaveType === 'medical'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Medical</span>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('casual')}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition flex flex-col items-center gap-1 ${
                leaveType === 'casual'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-black/[0.08] dark:border-white/10'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Unexcused</span>
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            Start Date
          </label>
          <input
            type="date"
            min={SEMESTER_CONFIG.startDate}
            max={SEMESTER_CONFIG.endDate}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/90 border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition shadow-xs dark:shadow-none"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            End Date
          </label>
          <input
            type="date"
            min={startDate}
            max={SEMESTER_CONFIG.endDate}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/90 border border-black/[0.1] dark:border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-white/30 transition shadow-xs dark:shadow-none"
          />
        </div>

      </div>

      {/* Recalculation Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/[0.02] dark:bg-zinc-950/50 border border-black/[0.06] dark:border-white/[0.06] rounded-xl p-4">
        <div>
          <span className="text-xs text-zinc-500 block">Schedule Impact</span>
          <div className="text-lg font-semibold text-zinc-900 dark:text-white mt-0.5">
            {leaveImpact.dayCount} Academic Days
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{leaveImpact.totalPeriods} timetable periods affected</p>
        </div>

        <div>
          <span className="text-xs text-zinc-500 block">Overall Shift</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-zinc-400 dark:text-zinc-500 line-through text-sm">{results.overallCurrentPercentage}%</span>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
            <span className={`text-xl font-semibold ${projectedStats.diffOverall >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {projectedStats.newOverallPct}%
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${projectedStats.diffOverall >= 0 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
              {projectedStats.diffOverall >= 0 ? `+${projectedStats.diffOverall}%` : `${projectedStats.diffOverall}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 font-medium text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Applied to Workspace</span>
              </>
            ) : (
              <>
                <FileCheck className="w-3.5 h-3.5" />
                <span>Apply Simulation to Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Affected Subjects Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.06] text-zinc-500 dark:text-zinc-400 font-medium bg-black/[0.02] dark:bg-white/[0.02]">
              <th className="py-2.5 px-3">Subject</th>
              <th className="py-2.5 px-3 text-center">Periods in Window</th>
              <th className="py-2.5 px-3">Prior</th>
              <th className="py-2.5 px-3">Simulated Result</th>
              <th className="py-2.5 px-3">Projected Final</th>
              <th className="py-2.5 px-3 text-center">Standing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {projectedStats.subjectsAfter.map(s => {
              if (s.periodsInLeave === 0) return null;
              return (
                <tr key={s.code} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{s.name}</div>
                    <div className="text-[10px] text-zinc-500">{s.code}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-zinc-700 dark:text-zinc-300">
                    {s.periodsInLeave} classes
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500">
                    {s.beforePct}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-medium ${s.afterPct >= s.beforePct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {s.afterPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                    {s.finalProjectedPct}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {s.willBeDetained ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30 text-[10px] font-medium">
                        Detention Risk
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-medium">
                        Compliant
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
  );
}
