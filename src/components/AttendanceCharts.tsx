import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { type SemesterCalculationResult } from '../utils/calculator';
import { ShieldCheck, AlertCircle, Award } from 'lucide-react';

interface Props {
  results: SemesterCalculationResult;
}

export default function AttendanceCharts({ results }: Props) {
  // Chart 1: Subject Attendance vs 75% and 90%
  const barData = useMemo(() => {
    return results.subjectResults.map(sub => ({
      name: sub.code,
      fullName: sub.name,
      current: sub.currentPercentage,
      maxPossible: sub.maxAchievablePercentage,
      status: sub.status,
      classesLeft: sub.classesRemaining,
      toAttend75: sub.classesToAttend75
    }));
  }, [results]);

  // Chart 2: Status distribution breakdown
  const pieData = useMemo(() => {
    let safeCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let irreversibleCount = 0;

    results.subjectResults.forEach(s => {
      if (s.isIrreversibleDetention) irreversibleCount++;
      else if (s.currentPercentage >= 90) safeCount++;
      else if (s.currentPercentage >= 75) safeCount++;
      else if (s.currentPercentage >= 65) warningCount++;
      else criticalCount++;
    });

    return [
      { name: 'Compliant (≥75%)', value: safeCount, color: '#30D158' },
      { name: 'Borderline (65-74%)', value: warningCount, color: '#FF9F0A' },
      { name: 'Deficit (<65%)', value: criticalCount, color: '#FF453A' },
      { name: 'Detention Precluded', value: irreversibleCount, color: '#991B1B' },
    ].filter(item => item.value > 0);
  }, [results]);

  const getBarColor = (item: { status: string; current: number }) => {
    if (item.status === 'irreversible') return '#FF453A';
    if (item.current >= 90) return '#BF5AF2';
    if (item.current >= 75) return '#30D158';
    if (item.current >= 65) return '#FF9F0A';
    return '#FF453A';
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 hover:border-white/[0.14] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Compliant Subjects (≥75%)</span>
            <div className="text-2xl font-semibold tracking-tight text-white">
              {results.subjectResults.filter(s => s.currentPercentage >= 75).length} <span className="text-xs text-zinc-500 font-normal">of {results.subjectResults.length}</span>
            </div>
            <p className="text-xs text-emerald-400/90 mt-0.5">Meeting university requirement</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 hover:border-white/[0.14] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Distinction Potential (≥90%)</span>
            <div className="text-2xl font-semibold tracking-tight text-white">
              {results.subjectResults.filter(s => s.canAchieve90).length} <span className="text-xs text-zinc-500 font-normal">Subjects</span>
            </div>
            <p className="text-xs text-purple-300/80 mt-0.5">Achievable with attendance plan</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 hover:border-white/[0.14] transition-all">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Detention Exposure</span>
            <div className="text-2xl font-semibold tracking-tight text-red-400">
              {results.subjectResults.filter(s => s.isIrreversibleDetention || s.currentPercentage < 75).length} <span className="text-xs text-zinc-500 font-normal">Subjects</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Action required before Nov 29</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart: Subject Attendance Health */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
            <div>
              <h3 className="font-semibold text-sm text-white">Subject Attendance Profiles</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluated against the 75% baseline and 90% distinction thresholds.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-red-400 inline-block"></span> 75% Floor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-purple-400 inline-block"></span> 90% Target
              </span>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -15, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={11} 
                  domain={[0, 100]} 
                  tickFormatter={v => `${v}%`}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-950/95 border border-white/10 rounded-xl p-3 backdrop-blur-2xl shadow-2xl text-xs space-y-1">
                          <p className="font-semibold text-white">{data.fullName}</p>
                          <p className="text-zinc-500">Code: {data.name}</p>
                          <div className="pt-1.5 border-t border-white/[0.06] flex justify-between gap-4">
                            <span className="text-zinc-400">Current Standing:</span>
                            <span className="font-medium text-emerald-400">{data.current}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-400">Peak Achievable:</span>
                            <span className="font-medium text-zinc-200">{data.maxPossible}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-zinc-400">For ≥75%:</span>
                            <span className="font-medium text-amber-300">
                              {data.toAttend75 === 0 ? 'Compliant' : `Attend ${data.toAttend75} more`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={75} 
                  stroke="#FF453A" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                  label={{ value: '75% Minimum', fill: '#FF453A', fontSize: 10, position: 'right' }} 
                />
                <ReferenceLine 
                  y={90} 
                  stroke="#BF5AF2" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                  label={{ value: '90% Honors', fill: '#BF5AF2', fontSize: 10, position: 'right' }} 
                />
                <Bar dataKey="current" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="bg-zinc-900/40 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white">Status Breakdown</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Subject risk allocation
            </p>
          </div>

          <div className="h-64 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-zinc-950/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs backdrop-blur-xl">
                          <span style={{ color: data.payload.color }} className="font-medium">
                            {data.name}: {data.value} subjects
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            Overall Health: <span className="text-white font-medium">{results.overallCurrentPercentage}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
