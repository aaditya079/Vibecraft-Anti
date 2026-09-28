import { type ClassSection, SEMESTER_CONFIG } from '../data/timetables';

export interface SubjectAttendanceResult {
  code: string;
  name: string;
  slot: string;
  faculty: string;
  currentPercentage: number;
  classesHeld: number;
  classesAttended: number;
  classesRemaining: number;
  totalSemesterClasses: number;
  
  // 75% Target
  requiredFor75: number;
  classesToAttend75: number;
  canAchieve75: boolean;
  bunkBudget75: number;
  
  // 90% Target
  requiredFor90: number;
  classesToAttend90: number;
  canAchieve90: boolean;
  bunkBudget90: number;
  
  // Danger / Irreversible Status
  maxAchievablePercentage: number;
  isIrreversibleDetention: boolean;
  status: 'safe' | 'warning' | 'critical' | 'irreversible';
}

export interface SemesterCalculationResult {
  sectionId: string;
  planningDate: string;
  daysPassed: number;
  daysRemaining: number;
  totalSemesterDays: number;
  
  totalClassesHeld: number;
  totalClassesRemaining: number;
  totalSemesterClasses: number;
  
  overallAttended: number;
  overallCurrentPercentage: number;
  overallToAttend75: number;
  overallToAttend90: number;
  overallMaxAchievable: number;
  isOverallIrreversible: boolean;
  
  subjectResults: SubjectAttendanceResult[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Counts total classes held so far vs remaining for each subject in a section
 */
export function getSubjectClassCounts(section: ClassSection, planningDateStr: string) {
  const start = new Date(SEMESTER_CONFIG.startDate);
  const end = new Date(SEMESTER_CONFIG.endDate);
  const planning = new Date(planningDateStr);

  const heldCounts: Record<string, number> = {};
  const remainingCounts: Record<string, number> = {};

  // Initialize
  section.subjects.forEach(sub => {
    heldCounts[sub.code] = 0;
    remainingCounts[sub.code] = 0;
  });

  const cur = new Date(start);
  while (cur <= end) {
    const dayName = DAY_NAMES[cur.getDay()];
    const daySchedule = section.schedule[dayName];

    if (daySchedule) {
      const isPast = cur < planning;
      daySchedule.forEach(subCode => {
        if (subCode && heldCounts[subCode] !== undefined) {
          if (isPast) {
            heldCounts[subCode] = (heldCounts[subCode] || 0) + 1;
          } else {
            remainingCounts[subCode] = (remainingCounts[subCode] || 0) + 1;
          }
        }
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  return { heldCounts, remainingCounts };
}

/**
 * Computes attendance projections for all subjects
 */
export function calculateAttendance(
  section: ClassSection,
  attendanceInputs: Record<string, number>, // subjectCode -> percentage (0-100)
  planningDateStr: string
): SemesterCalculationResult {
  const { heldCounts, remainingCounts } = getSubjectClassCounts(section, planningDateStr);
  
  const start = new Date(SEMESTER_CONFIG.startDate);
  const end = new Date(SEMESTER_CONFIG.endDate);
  const planning = new Date(planningDateStr);
  
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  const daysPassed = Math.max(0, Math.min(totalDays, Math.round((planning.getTime() - start.getTime()) / (1000 * 3600 * 24))));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  let totalClassesHeld = 0;
  let totalClassesRemaining = 0;
  let overallAttended = 0;

  const subjectResults: SubjectAttendanceResult[] = section.subjects.map(sub => {
    const held = heldCounts[sub.code] || 0;
    const remaining = remainingCounts[sub.code] || 0;
    const total = held + remaining;
    
    totalClassesHeld += held;
    totalClassesRemaining += remaining;

    const inputPct = attendanceInputs[sub.code] ?? 75;
    const attended = held > 0 ? Math.min(held, Math.round((inputPct / 100) * held)) : 0;
    overallAttended += attended;

    // 75% Calculations
    const req75 = Math.ceil(0.75 * total);
    const toAttend75 = Math.max(0, req75 - attended);
    const canAchieve75 = (attended + remaining) >= req75;
    const bunkBudget75 = canAchieve75 ? Math.max(0, remaining - toAttend75) : 0;

    // 90% Calculations
    const req90 = Math.ceil(0.90 * total);
    const toAttend90 = Math.max(0, req90 - attended);
    const canAchieve90 = (attended + remaining) >= req90;
    const bunkBudget90 = canAchieve90 ? Math.max(0, remaining - toAttend90) : 0;

    // Maximum achievable percentage
    const maxAchievable = total > 0 ? ((attended + remaining) / total) * 100 : 100;
    const isIrreversible = !canAchieve75;

    let status: 'safe' | 'warning' | 'critical' | 'irreversible' = 'safe';
    if (isIrreversible) {
      status = 'irreversible';
    } else if (inputPct < 75) {
      status = 'critical';
    } else if (inputPct < 85) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return {
      code: sub.code,
      name: sub.name,
      slot: sub.slot,
      faculty: sub.faculty,
      currentPercentage: inputPct,
      classesHeld: held,
      classesAttended: attended,
      classesRemaining: remaining,
      totalSemesterClasses: total,
      
      requiredFor75: req75,
      classesToAttend75: toAttend75,
      canAchieve75,
      bunkBudget75,
      
      requiredFor90: req90,
      classesToAttend90: toAttend90,
      canAchieve90,
      bunkBudget90,
      
      maxAchievablePercentage: Number(maxAchievable.toFixed(1)),
      isIrreversibleDetention: isIrreversible,
      status
    };
  });

  const overallTotal = totalClassesHeld + totalClassesRemaining;
  const overallCurrentPct = totalClassesHeld > 0 ? (overallAttended / totalClassesHeld) * 100 : 100;
  const reqTotal75 = Math.ceil(0.75 * overallTotal);
  const reqTotal90 = Math.ceil(0.90 * overallTotal);
  
  const overallToAttend75 = Math.max(0, reqTotal75 - overallAttended);
  const overallToAttend90 = Math.max(0, reqTotal90 - overallAttended);
  const overallMaxAchievable = overallTotal > 0 ? ((overallAttended + totalClassesRemaining) / overallTotal) * 100 : 100;
  const isOverallIrreversible = (overallAttended + totalClassesRemaining) < reqTotal75;

  return {
    sectionId: section.id,
    planningDate: planningDateStr,
    daysPassed,
    daysRemaining,
    totalSemesterDays: totalDays,
    totalClassesHeld,
    totalClassesRemaining,
    totalSemesterClasses: overallTotal,
    overallAttended,
    overallCurrentPercentage: Number(overallCurrentPct.toFixed(1)),
    overallToAttend75,
    overallToAttend90,
    overallMaxAchievable: Number(overallMaxAchievable.toFixed(1)),
    isOverallIrreversible,
    subjectResults
  };
}
