import { CLASS_SECTIONS, SEMESTER_CONFIG } from './timetables';

export interface Room {
  id: string;
  name: string;
  code: string;
  floor: 'Ground Floor' | '1st Floor' | '2nd Floor' | '4th Floor' | '5th Floor' | '6th Floor' | '7th Floor';
  floorNumber: number;
  building: string;
  capacity: number;
  isAC: boolean;
  hasProjector: boolean;
  hasPowerSockets: boolean;
  hasWhiteboard: boolean;
  type: 'Classroom' | 'Smart Lecture Hall' | 'Laboratory' | 'Workshop' | 'Seminar Hall' | 'Discussion Room';
  description: string;
}

export interface RoomOccupancySlot {
  period: number;
  time: string;
  isOccupied: boolean;
  sectionId?: string;
  sectionName?: string;
  subjectCode?: string;
  subjectName?: string;
  faculty?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const CAMPUS_ROOMS: Room[] = [
  // Ground Floor
  {
    id: 'tb-106',
    name: 'Tech Block 106 (Seminar Hall)',
    code: 'TB 106',
    floor: 'Ground Floor',
    floorNumber: 0,
    building: 'Tech Block',
    capacity: 70,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Central training & CDC seminar hall with stage presentation screen and acoustic damping.'
  },
  {
    id: 'ist-108',
    name: 'PCB & Hardware Prototyping Lab',
    code: 'IST 108',
    floor: 'Ground Floor',
    floorNumber: 0,
    building: 'IST Block',
    capacity: 45,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Laboratory',
    description: 'Equipped with electronic test benches, DC power supplies, and multi-socket workstations.'
  },
  {
    id: 'ist-020',
    name: 'Mechanical Workshop A',
    code: 'IST 020',
    floor: 'Ground Floor',
    floorNumber: 0,
    building: 'IST Block',
    capacity: 60,
    isAC: false,
    hasProjector: false,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Workshop',
    description: 'Spacious engineering workshop layout suitable for hardware builds and physical prototyping.'
  },
  {
    id: 'ist-021',
    name: 'Mechanical Workshop B',
    code: 'IST 021',
    floor: 'Ground Floor',
    floorNumber: 0,
    building: 'IST Block',
    capacity: 60,
    isAC: false,
    hasProjector: false,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Workshop',
    description: 'Heavy fabrication and assembly space with open workbench islands.'
  },

  // 1st Floor
  {
    id: 'ist-101',
    name: 'IST Smart Seminar Hall',
    code: 'IST 101',
    floor: '1st Floor',
    floorNumber: 1,
    building: 'IST Block',
    capacity: 80,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Full-featured lecture hall with stepped tiered seating, dual projection, and podium mic.'
  },
  {
    id: 'ist-105',
    name: 'Innovation & Discussion Pod',
    code: 'IST 105',
    floor: '1st Floor',
    floorNumber: 1,
    building: 'IST Block',
    capacity: 35,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Discussion Room',
    description: 'Ideal for 4-8 student group collaborations, brainstorming sessions, and hackathon scrums.'
  },

  // 2nd Floor
  {
    id: 'ist-201',
    name: 'Activity & NSS Seminar Hall',
    code: 'IST 201',
    floor: '2nd Floor',
    floorNumber: 2,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Multi-purpose room with flexible seating arrangements, sound system, and whiteboards.'
  },
  {
    id: 'ist-211',
    name: 'Smart Lecture Hall 211',
    code: 'IST 211',
    floor: '2nd Floor',
    floorNumber: 2,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Home classroom for Biomedical Engineering with high-resolution projection and wide whiteboard.'
  },
  {
    id: 'ist-225',
    name: 'Electronics Lecture Hall 225',
    code: 'IST 225',
    floor: '2nd Floor',
    floorNumber: 2,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Senior ECE Lecture Hall equipped with audio-visual equipment and dual air conditioning.'
  },
  {
    id: 'ist-227',
    name: 'Communication Systems Hall 227',
    code: 'IST 227',
    floor: '2nd Floor',
    floorNumber: 2,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Modern classroom with wall power strips, clean acoustic design, and ceiling-mounted projector.'
  },

  // 4th Floor
  {
    id: 'ist-411',
    name: 'Data Science Lecture Hall 411',
    code: 'IST 411',
    floor: '4th Floor',
    floorNumber: 4,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'ECE Data Science dedicated hall with dedicated power ports at every desk bench.'
  },
  {
    id: 'ist-416',
    name: 'Data Science Lecture Hall 416',
    code: 'IST 416',
    floor: '4th Floor',
    floorNumber: 4,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'State of the art smart room with smart podium, climate control, and uninterrupted Wi-Fi.'
  },
  {
    id: 'ist-418',
    name: 'Collab & Hackathon Space 418',
    code: 'IST 418',
    floor: '4th Floor',
    floorNumber: 4,
    building: 'IST Block',
    capacity: 40,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Discussion Room',
    description: 'Round-table collaborative studio specifically tailored for team development and discussions.'
  },

  // 5th Floor
  {
    id: 'ist-502',
    name: 'Advanced Computing Hall 502',
    code: 'IST 502',
    floor: '5th Floor',
    floorNumber: 5,
    building: 'IST Block',
    capacity: 60,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Spacious lecture room with natural light and dual high-capacity air conditioning units.'
  },
  {
    id: 'ist-510',
    name: 'CDC Training Centre 510',
    code: 'IST 510',
    floor: '5th Floor',
    floorNumber: 5,
    building: 'IST Block',
    capacity: 75,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Career development & aptitude training room with high ceiling and surround sound.'
  },
  {
    id: 'ist-518',
    name: 'Digital Systems Hall 518',
    code: 'IST 518',
    floor: '5th Floor',
    floorNumber: 5,
    building: 'IST Block',
    capacity: 70,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'High capacity classroom with dual entries, projector, and magnetic glass whiteboard.'
  },
  {
    id: 'ist-519',
    name: 'Embedded Systems Hall 519',
    code: 'IST 519',
    floor: '5th Floor',
    floorNumber: 5,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Equipped with presentation hardware, podium controls, and comfortable ergonomic seating.'
  },
  {
    id: 'ist-520',
    name: 'Bio-Engineering Lecture Theatre 520',
    code: 'IST 520',
    floor: '5th Floor',
    floorNumber: 5,
    building: 'IST Block',
    capacity: 70,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Spacious lecture theatre with theatre-style viewlines and dual AC units.'
  },

  // 6th Floor
  {
    id: 'ist-602',
    name: 'Smart Classroom 602',
    code: 'IST 602',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 70,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Forenoon home room for II BME and I Year classes. Smart board with interactive stylus.'
  },
  {
    id: 'ist-609',
    name: 'Executive Seminar Suite 609',
    code: 'IST 609',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 45,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Premium boardroom layout with high-end AV conferencing, leather seating, and sound isolation.'
  },
  {
    id: 'ist-617',
    name: 'Programming & Software Lab 617',
    code: 'IST 617',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 55,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Laboratory',
    description: 'High-speed gigabit LAN workstations, Ubuntu/Windows dual boot, perfect for coding sprints.'
  },
  {
    id: 'ist-618',
    name: 'Advanced Computing Lab 618',
    code: 'IST 618',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 55,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Laboratory',
    description: 'Modern computing lab with dual monitors for student coders, full air-conditioned hall.'
  },
  {
    id: 'ist-625',
    name: 'CDC Aptitude & Language Centre 625',
    code: 'IST 625',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 65,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Smart Lecture Hall',
    description: 'Official CDC training venue for logical reasoning, verbal aptitude, and group activities.'
  },
  {
    id: 'ist-626',
    name: 'Language & Foreign Studies Lab 626',
    code: 'IST 626',
    floor: '6th Floor',
    floorNumber: 6,
    building: 'IST Block',
    capacity: 50,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Classroom',
    description: 'Dedicated quiet hall used for language courses and individual/team focus sessions.'
  },

  // 7th Floor
  {
    id: 'ist-702',
    name: 'Grand Lecture Amphitheatre 702',
    code: 'IST 702',
    floor: '7th Floor',
    floorNumber: 7,
    building: 'IST Block',
    capacity: 120,
    isAC: true,
    hasProjector: true,
    hasPowerSockets: true,
    hasWhiteboard: true,
    type: 'Seminar Hall',
    description: 'Largest presentation amphitheatre on the 7th floor, ideal for large team presentations.'
  },
  {
    id: 'ist-710',
    name: 'Quiet Research Reading Room 710',
    code: 'IST 710',
    floor: '7th Floor',
    floorNumber: 7,
    building: 'IST Block',
    capacity: 45,
    isAC: true,
    hasProjector: false,
    hasPowerSockets: true,
    hasWhiteboard: false,
    type: 'Discussion Room',
    description: 'Silent study zone with study cubicles, dedicated charging hubs, and high-speed Wi-Fi.'
  }
];

// Helper to resolve specific subject occupancy for a room
function mapSectionOccupancyToRooms(): Record<string, Record<DayOfWeek, RoomOccupancySlot[]>> {
  const result: Record<string, Record<DayOfWeek, RoomOccupancySlot[]>> = {};
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Initialize all campus rooms with free slots
  CAMPUS_ROOMS.forEach(room => {
    result[room.id] = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    days.forEach(day => {
      SEMESTER_CONFIG.periods.forEach(p => {
        result[room.id][day].push({
          period: p.period,
          time: p.time,
          isOccupied: false
        });
      });
    });
  });

  // Map each of the 10 class sections onto their actual venues
  CLASS_SECTIONS.forEach(section => {
    // Determine base venue room ID
    let baseRoomId = '';
    const v = section.venue.toUpperCase();
    if (v.includes('602')) baseRoomId = 'ist-602';
    else if (v.includes('416')) baseRoomId = 'ist-416';
    else if (v.includes('411')) baseRoomId = 'ist-411';
    else if (v.includes('211')) baseRoomId = 'ist-211';
    else if (v.includes('518')) baseRoomId = 'ist-518';
    else if (v.includes('519')) baseRoomId = 'ist-519';
    else if (v.includes('225')) baseRoomId = 'ist-225';
    else if (v.includes('227')) baseRoomId = 'ist-227';

    // Subject map for details lookup
    const subjectMap = new Map(section.subjects.map(s => [s.code, s]));

    days.forEach(day => {
      const scheduleSlots = section.schedule[day] || [];
      scheduleSlots.forEach((subjectCode, idx) => {
        if (!subjectCode) return; // Free period for this section

        const periodNumber = idx + 1;
        const subj = subjectMap.get(subjectCode);
        const subjName = subj?.name || subjectCode;
        const faculty = subj?.faculty || '';

        // Target room determination:
        // Some subjects happen in special rooms (Labs, CDC, Workshop)
        let targetRoomId = baseRoomId;
        const codeUpper = subjectCode.toUpperCase();
        const nameUpper = subjName.toUpperCase();
        const facUpper = faculty.toUpperCase();

        if (nameUpper.includes('WORKSHOP') || codeUpper.includes('MES101L')) {
          targetRoomId = 'ist-020';
        } else if (nameUpper.includes('PCB') || codeUpper.includes('BTB102J') || codeUpper.includes('21ECC211L') || codeUpper.includes('21BMC204L') || codeUpper.includes('LAB-MPMC')) {
          targetRoomId = 'ist-108';
        } else if (codeUpper.includes('21ECC311L')) {
          targetRoomId = 'ist-618';
        } else if (codeUpper.includes('21ECC402L') || nameUpper.includes('PROGRAMMING') || codeUpper.includes('CSS101J')) {
          targetRoomId = 'ist-617';
        } else if (facUpper.includes('TB-106') || facUpper.includes('CDC-TB-106') || nameUpper.includes('VERBAL REASONING')) {
          targetRoomId = 'tb-106';
        } else if (facUpper.includes('625') || facUpper.includes('CDC-625') || facUpper.includes('CDC / 625') || nameUpper.includes('LOGICAL THINKING') || nameUpper.includes('ANALYTICAL')) {
          targetRoomId = 'ist-625';
        } else if (codeUpper.includes('21LEH104T') || nameUpper.includes('GERMAN') || nameUpper.includes('FOREIGN')) {
          targetRoomId = 'ist-626';
        } else if (codeUpper.includes('GNM102L') || nameUpper.includes('NSS')) {
          targetRoomId = 'ist-201';
        }

        if (targetRoomId && result[targetRoomId] && result[targetRoomId][day]) {
          const slot = result[targetRoomId][day].find(s => s.period === periodNumber);
          if (slot) {
            slot.isOccupied = true;
            slot.sectionId = section.id;
            slot.sectionName = section.name;
            slot.subjectCode = subjectCode;
            slot.subjectName = subjName;
            slot.faculty = faculty;
          }
        }
      });
    });
  });

  return result;
}

export const ROOM_OCCUPANCY_DATABASE = mapSectionOccupancyToRooms();
