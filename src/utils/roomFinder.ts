import { CAMPUS_ROOMS, ROOM_OCCUPANCY_DATABASE, type Room, type RoomOccupancySlot, type DayOfWeek } from '../data/rooms';

export interface RoomRealTimeStatus {
  room: Room;
  isFree: boolean;
  freeUntilTime: string;
  freePeriodCount: number;
  freeDurationMinutes: number;
  currentOccupant?: {
    sectionName: string;
    subjectName: string;
    subjectCode: string;
    faculty: string;
    untilTime: string;
  };
  nextClass?: {
    period: number;
    startsAt: string;
    sectionName: string;
    subjectName: string;
  };
}

export interface FloorGroup {
  floor: string;
  floorNumber: number;
  totalRooms: number;
  freeRoomsCount: number;
  rooms: RoomRealTimeStatus[];
}

export interface QuerySearchParams {
  floor?: string;
  isAC?: boolean;
  minDurationMinutes?: number;
  minCapacity?: number;
  hasProjector?: boolean;
  hasPowerSockets?: boolean;
  roomType?: string;
}

export interface SearchResult {
  queryParsed: {
    floor?: string;
    isAC?: boolean;
    durationHours?: number;
    teamSize?: number;
    hasProjector?: boolean;
    hasPowerSockets?: boolean;
    targetType?: string;
    summaryText: string;
  };
  matchedRooms: (RoomRealTimeStatus & { matchScore: number; matchReasons: string[] })[];
  totalMatches: number;
}

// Period start and end times in minutes from midnight
const PERIOD_TIMES = [
  { period: 1, start: '09:00', end: '09:50', startMins: 540, endMins: 590 },
  { period: 2, start: '09:50', end: '10:40', startMins: 590, endMins: 640 },
  { period: 3, start: '10:50', end: '11:40', startMins: 650, endMins: 700 },
  { period: 4, start: '11:40', end: '12:30', startMins: 700, endMins: 750 },
  { period: 5, start: '12:30', end: '13:20', startMins: 750, endMins: 800 },
  { period: 6, start: '13:20', end: '14:10', startMins: 800, endMins: 850 },
  { period: 7, start: '14:10', end: '15:00', startMins: 850, endMins: 900 },
  { period: 8, start: '15:10', end: '16:00', startMins: 910, endMins: 960 },
  { period: 9, start: '16:00', end: '16:50', startMins: 960, endMins: 1010 },
];

export function getPeriodFromTime(timeStr?: string): { day: DayOfWeek; period: number } {
  const now = timeStr ? new Date(timeStr) : new Date();
  const dayIndex = now.getDay();
  const dayMap: Record<number, DayOfWeek> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday'
  };
  const day = dayMap[dayIndex] || 'Monday';

  const currentMins = now.getHours() * 60 + now.getMinutes();
  let period = 1;

  for (const pt of PERIOD_TIMES) {
    if (currentMins >= pt.startMins && currentMins < pt.endMins) {
      period = pt.period;
      break;
    }
    if (currentMins < pt.startMins) {
      period = pt.period;
      break;
    }
    if (currentMins >= 1010) {
      period = 9;
    }
  }

  return { day, period };
}

export function getRoomStatus(room: Room, day: DayOfWeek, currentPeriod: number): RoomRealTimeStatus {
  const roomSchedule = ROOM_OCCUPANCY_DATABASE[room.id]?.[day] || [];
  const currentSlot = roomSchedule.find(s => s.period === currentPeriod);

  const isCurrentlyOccupied = !!currentSlot?.isOccupied;

  if (isCurrentlyOccupied) {
    // Room is currently occupied
    const periodDef = PERIOD_TIMES.find(p => p.period === currentPeriod);
    return {
      room,
      isFree: false,
      freeUntilTime: periodDef?.end || 'Next Period',
      freePeriodCount: 0,
      freeDurationMinutes: 0,
      currentOccupant: {
        sectionName: currentSlot?.sectionName || 'Class in progress',
        subjectName: currentSlot?.subjectName || currentSlot?.subjectCode || 'Lecture',
        subjectCode: currentSlot?.subjectCode || '',
        faculty: currentSlot?.faculty || '',
        untilTime: periodDef?.end || 'End of class'
      }
    };
  }

  // Room is free at currentPeriod. Calculate contiguous free periods
  let freePeriods = 0;
  let nextClassSlot: RoomOccupancySlot | undefined;
  let nextClassPeriod = 0;

  for (let p = currentPeriod; p <= 9; p++) {
    const slot = roomSchedule.find(s => s.period === p);
    if (slot && slot.isOccupied) {
      nextClassSlot = slot;
      nextClassPeriod = p;
      break;
    }
    freePeriods++;
  }

  let freeUntilTime = '04:50 PM';
  let freeDurationMinutes = freePeriods * 50;

  if (nextClassSlot && nextClassPeriod > 0) {
    const nextPt = PERIOD_TIMES.find(pt => pt.period === nextClassPeriod);
    if (nextPt) {
      freeUntilTime = nextPt.start;
      const currentPt = PERIOD_TIMES.find(pt => pt.period === currentPeriod);
      if (currentPt) {
        freeDurationMinutes = Math.max(0, nextPt.startMins - currentPt.startMins);
      }
    }
  }

  const nextClassInfo = nextClassSlot ? {
    period: nextClassPeriod,
    startsAt: PERIOD_TIMES.find(p => p.period === nextClassPeriod)?.start || '',
    sectionName: nextClassSlot.sectionName || '',
    subjectName: nextClassSlot.subjectName || nextClassSlot.subjectCode || ''
  } : undefined;

  return {
    room,
    isFree: true,
    freeUntilTime,
    freePeriodCount: freePeriods,
    freeDurationMinutes,
    nextClass: nextClassInfo
  };
}

export function getAllFloorsStatus(day: DayOfWeek, currentPeriod: number): FloorGroup[] {
  const floorOrder = [
    'Ground Floor',
    '1st Floor',
    '2nd Floor',
    '4th Floor',
    '5th Floor',
    '6th Floor',
    '7th Floor'
  ];

  const floorMap = new Map<string, RoomRealTimeStatus[]>();
  floorOrder.forEach(floor => floorMap.set(floor, []));

  CAMPUS_ROOMS.forEach(room => {
    const status = getRoomStatus(room, day, currentPeriod);
    const existing = floorMap.get(room.floor) || [];
    existing.push(status);
    floorMap.set(room.floor, existing);
  });

  return floorOrder.map(floorName => {
    const rooms = floorMap.get(floorName) || [];
    const freeRoomsCount = rooms.filter(r => r.isFree).length;
    const floorNumber = rooms[0]?.room.floorNumber ?? 0;

    return {
      floor: floorName,
      floorNumber,
      totalRooms: rooms.length,
      freeRoomsCount,
      rooms
    };
  });
}

/**
 * Deterministic Smart NLP Query Parser
 * Parses natural language input like:
 * "I need an AC room on the ground floor for me and my team for the next 2 hours."
 */
export function parseNaturalLanguageQuery(
  rawQuery: string,
  day: DayOfWeek = 'Monday',
  currentPeriod: number = 1
): SearchResult {
  const query = rawQuery.toLowerCase();

  // Day extraction if user specified a future day
  let evalDay: DayOfWeek = day;
  if (query.includes('monday')) evalDay = 'Monday';
  else if (query.includes('tuesday')) evalDay = 'Tuesday';
  else if (query.includes('wednesday')) evalDay = 'Wednesday';
  else if (query.includes('thursday')) evalDay = 'Thursday';
  else if (query.includes('friday')) evalDay = 'Friday';

  // Period / Time extraction if user specified
  let evalPeriod = currentPeriod;
  if (query.includes('afternoon') || query.includes('post lunch') || query.includes('2 pm') || query.includes('14:00')) {
    evalPeriod = 6;
  } else if (query.includes('morning') || query.includes('forenoon') || query.includes('10 am') || query.includes('09:00')) {
    evalPeriod = 2;
  } else if (query.includes('lunch')) {
    evalPeriod = 5;
  }

  // Floor extraction with word boundary regex
  let floor: string | undefined;
  if (/\b(ground|gf|floor 0|level 0)\b/i.test(query)) {
    floor = 'Ground Floor';
  } else if (/\b(1st|first|floor 1|level 1)\b/i.test(query)) {
    floor = '1st Floor';
  } else if (/\b(2nd|second|floor 2|level 2)\b/i.test(query)) {
    floor = '2nd Floor';
  } else if (/\b(4th|fourth|floor 4|level 4)\b/i.test(query)) {
    floor = '4th Floor';
  } else if (/\b(5th|fifth|floor 5|level 5)\b/i.test(query)) {
    floor = '5th Floor';
  } else if (/\b(6th|sixth|floor 6|level 6)\b/i.test(query)) {
    floor = '6th Floor';
  } else if (/\b(7th|seventh|top floor|floor 7|level 7)\b/i.test(query)) {
    floor = '7th Floor';
  }

  // AC extraction with word boundary to avoid matching words like 'capacity'
  let isAC: boolean | undefined;
  const wantsAC = /\bac\b/i.test(query) || /air-?conditioned?/i.test(query) || query.includes('climate control') || query.includes('cooling');
  const wantsNonAC = /\bnon-?ac\b/i.test(query) || query.includes('without ac') || query.includes('no ac');
  if (wantsNonAC) {
    isAC = false;
  } else if (wantsAC) {
    isAC = true;
  }

  // Room Type extraction
  let targetType: string | undefined;
  if (/\b(workshop|fabrication)\b/i.test(query)) targetType = 'Workshop';
  else if (/\b(lab|laboratory|coding lab|computer lab|pcb)\b/i.test(query)) targetType = 'Laboratory';
  else if (/\b(seminar|amphitheatre|theatre|hall)\b/i.test(query)) targetType = 'Seminar Hall';
  else if (/\b(discussion|collab|study room|pod)\b/i.test(query)) targetType = 'Discussion Room';

  // Duration extraction
  let durationHours = 1;
  const hourMatch = query.match(/(\d+)\s*(?:hours|hour|hrs|hr)/);
  if (hourMatch) {
    durationHours = parseInt(hourMatch[1], 10);
  } else if (query.includes('half an hour') || query.includes('30 mins') || query.includes('30 min')) {
    durationHours = 0.5;
  } else if (query.includes('rest of the day') || query.includes('whole day')) {
    durationHours = 3.5;
  }
  const minRequiredMinutes = durationHours * 50;

  // Team size / Capacity
  let teamSize = 1;
  const teamMatch = query.match(/(\d+)\s*(?:people|persons|members|students|folks|team|seats)/);
  if (teamMatch) {
    teamSize = parseInt(teamMatch[1], 10);
  } else if (query.includes('team') || query.includes('group') || query.includes('project') || query.includes('presentation')) {
    teamSize = 4; // default group size
  }

  // Projector / Display
  let hasProjector: boolean | undefined;
  if (query.includes('projector') || query.includes('presentation') || query.includes('slides') || query.includes('screen') || query.includes('display')) {
    hasProjector = true;
  }

  // Power outlets / Charging
  let hasPowerSockets: boolean | undefined;
  if (query.includes('power') || query.includes('charging') || query.includes('socket') || query.includes('laptop') || query.includes('charge') || query.includes('outlet')) {
    hasPowerSockets = true;
  }

  // Specific room code search (e.g. "ist 602", "tb 106", "ist 20")
  const roomCodeMatch = query.match(/(?:ist|tb)\s*-?\s*(\d{2,3})/i);
  let targetCode = roomCodeMatch ? roomCodeMatch[0].replace('-', ' ').toUpperCase() : undefined;
  if (targetCode && targetCode.includes('IST 20')) targetCode = 'IST 020';
  if (targetCode && targetCode.includes('IST 21')) targetCode = 'IST 021';

  // Build summary text
  const summaryParts: string[] = [];
  if (floor) summaryParts.push(floor);
  if (targetType) summaryParts.push(targetType);
  if (isAC !== undefined) summaryParts.push(isAC ? 'Air Conditioned' : 'Non-AC');
  if (evalDay !== day) summaryParts.push(`On ${evalDay}`);
  if (evalPeriod !== currentPeriod) summaryParts.push(`Period ${evalPeriod}`);
  summaryParts.push(`${durationHours} hr${durationHours > 1 ? 's' : ''} duration`);
  if (teamSize > 1) summaryParts.push(`Seats ${teamSize}+`);
  if (hasProjector) summaryParts.push('Projector needed');
  if (hasPowerSockets) summaryParts.push('Power sockets');

  // Score all campus rooms
  const scoredRooms: (RoomRealTimeStatus & { matchScore: number; matchReasons: string[] })[] = [];

  CAMPUS_ROOMS.forEach(room => {
    const status = getRoomStatus(room, evalDay, evalPeriod);
    let score = 0;
    const matchReasons: string[] = [];

    // Direct room code search gets immediate highest priority
    if (targetCode && (room.code.toUpperCase().includes(targetCode) || room.name.toUpperCase().includes(targetCode))) {
      score += 100;
      matchReasons.push(`Exact room match: ${room.code}`);
    }

    // Must be free right now to be recommended as primary free room
    if (!status.isFree) {
      // Room is occupied right now
      if (!targetCode) return; // Skip occupied rooms unless explicitly searched
    } else {
      score += 30; // base score for being free
      matchReasons.push('Available now');
    }

    // Target Type bonus / penalty
    if (targetType) {
      if (room.type.toLowerCase().includes(targetType.toLowerCase())) {
        score += 35;
        matchReasons.push(`Type: ${room.type}`);
      } else {
        score -= 25;
      }
    }

    // Floor filter
    if (floor) {
      if (room.floor.toLowerCase() === floor.toLowerCase()) {
        score += 40;
        matchReasons.push(`Located on ${floor}`);
      } else {
        score -= 50; // heavy penalty for wrong floor if specified
      }
    }

    // AC filter
    if (isAC !== undefined) {
      if (room.isAC === isAC) {
        score += 25;
        matchReasons.push(isAC ? 'Climate-controlled AC' : 'Standard ventilated');
      } else if (isAC && !room.isAC) {
        score -= 30; // penalty if AC requested but not present
      }
    }

    // Duration filter
    if (status.freeDurationMinutes >= minRequiredMinutes) {
      score += 35;
      matchReasons.push(`Guaranteed free for ${(status.freeDurationMinutes / 60).toFixed(1)} hrs`);
    } else if (status.isFree) {
      // Free, but shorter than requested
      score -= 20;
      matchReasons.push(`Only free for ${(status.freeDurationMinutes / 60).toFixed(1)} hrs`);
    }

    // Capacity filter
    if (room.capacity >= teamSize) {
      score += 15;
      matchReasons.push(`Capacity: ${room.capacity} seats`);
    } else {
      score -= 40; // Too small for group
    }

    // Projector
    if (hasProjector) {
      if (room.hasProjector) {
        score += 20;
        matchReasons.push('Has high-res projector');
      } else {
        score -= 20;
      }
    }

    // Power sockets
    if (hasPowerSockets) {
      if (room.hasPowerSockets) {
        score += 15;
        matchReasons.push('Desk power sockets available');
      }
    }

    if (score > 10) {
      scoredRooms.push({
        ...status,
        matchScore: score,
        matchReasons
      });
    }
  });

  // Sort by match score descending
  scoredRooms.sort((a, b) => b.matchScore - a.matchScore);

  return {
    queryParsed: {
      floor,
      isAC,
      durationHours,
      teamSize,
      hasProjector,
      hasPowerSockets,
      targetType,
      summaryText: summaryParts.join(' · ')
    },
    matchedRooms: scoredRooms,
    totalMatches: scoredRooms.length
  };
}
