export interface Subject {
  code: string;
  name: string;
  slot: string;
  credits: string;
  faculty: string;
  classesPerWeek: number;
}

export interface PeriodSlot {
  period: number;
  time: string;
  subjectCode: string;
  subjectName: string;
  isLab?: boolean;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  slots: PeriodSlot[];
}

export interface ClassSection {
  id: string;
  name: string;
  department: string;
  year: string;
  semester: string;
  venue: string;
  subjects: Subject[];
  schedule: Record<string, string[]>; // Day -> array of 9 periods (subject code or '')
}

export const SEMESTER_CONFIG = {
  startDate: '2026-08-29',
  endDate: '2026-11-29',
  defaultToday: '2026-09-28', // Hackathon event date
  safeThreshold: 75,
  targetThreshold: 90,
  periods: [
    { period: 1, time: '09:00 - 09:50' },
    { period: 2, time: '09:50 - 10:40' },
    { period: 3, time: '10:50 - 11:40' },
    { period: 4, time: '11:40 - 12:30' },
    { period: 5, time: '12:30 - 01:20 (Lunch)' },
    { period: 6, time: '01:20 - 02:10' },
    { period: 7, time: '02:10 - 03:00' },
    { period: 8, time: '03:10 - 04:00' },
    { period: 9, time: '04:00 - 04:50' },
  ]
};

export const CLASS_SECTIONS: ClassSection[] = [
  {
    id: 'ii-bme',
    name: 'II Year - Biomedical Engineering',
    department: 'BME',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'IST 602 / FN',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. A. Manickam', classesPerWeek: 4 },
      { code: '21BMC202T', name: 'Biomedical Signals and Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Senthil Kumaran V N', classesPerWeek: 3 },
      { code: '21BMC203J', name: 'Electric and Electronic Circuits', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. Prabin Kumar Bera', classesPerWeek: 3 },
      { code: '21BMC204J', name: 'Digital Logic for Medical Systems', slot: 'D', credits: '2-0-2-3', faculty: 'Dr. G. Gifta', classesPerWeek: 3 },
      { code: '21PYS202T', name: 'Medical Physics', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. D. Rajeswari', classesPerWeek: 3 },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. H. SriBhuvaneshwari', classesPerWeek: 1 },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', classesPerWeek: 2 },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', classesPerWeek: 3 },
      { code: '21PDH201T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. Francis Arockiya Mary', classesPerWeek: 2 },
      { code: '21BMC204L', name: 'Digital Logic for Medical Systems Lab', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. G. Gifta', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21PYS202T', '21BMC203J', '21PDH201T', '21PDH201T', '', '21BMC204L', '21BMC204L', '', ''],
      'Tuesday': ['21BMC203J', '21PYS202T', '21BMC202T', '21MAB201T', '', '21PDM201L', '21PDM201L', '', ''],
      'Wednesday': ['21BMC202T', '21BMC204J', '21MAB201T', '', '', '21PDM201L', '21LEM202T', '', ''],
      'Thursday': ['21MAB201T', '21PYS202T', '21BMC202T', '21BMC204J', '', '', '', '21BMC204L', '21BMC204L'],
      'Friday': ['21LEM201T', '21MAB201T', '21BMC203J', '21BMC204J', '', '', '', '21LEM202T', '']
    }
  },
  {
    id: 'ii-ece-ds-a',
    name: 'II Year - ECE (Data Science) Sec A',
    department: 'ECE / DS',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'IST 416 / FN',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. C. Arun Kumar', classesPerWeek: 4 },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', classesPerWeek: 3 },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugapandiyan', classesPerWeek: 4 },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', classesPerWeek: 3 },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', classesPerWeek: 3 },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. Jothi M', classesPerWeek: 1 },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', classesPerWeek: 3 },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', classesPerWeek: 3 },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', classesPerWeek: 2 },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Jeevanantham S / Dr. V. Bharathi', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21ECC205T', '21MAB201T', '21PDH209T', '21PDH209T', '', '21LEM202T', '21LEM202T', '21ECC211L', '21ECC211L'],
      'Tuesday': ['21CSS201T', '21MAB201T', '21ECC205T', '21ECC203T', '', '21LEM202T', '', '21PDM201L', '21PDM201L'],
      'Wednesday': ['21MAB201T', '21ECC201T', '21CSS201T', '21ECC203T', '', '', '21PDM201L', '', ''],
      'Thursday': ['21ECC201T', '21CSS201T', '21MAB201T', '21LEM201T', '', '21ECC211L', '21ECC211L', '', ''],
      'Friday': ['21ECC203T', '21ECC201T', '21ECC205T', '21CSS201T', '', '', '', '', '']
    }
  },
  {
    id: 'ii-ece-ds-b',
    name: 'II Year - ECE (Data Science) Sec B',
    department: 'ECE / DS',
    year: 'II Year',
    semester: 'III Semester',
    venue: 'IST 411 / AN',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 3', classesPerWeek: 4 },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', classesPerWeek: 3 },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugapandiyan', classesPerWeek: 4 },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', classesPerWeek: 3 },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', classesPerWeek: 3 },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', classesPerWeek: 1 },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. D. Lavanya', classesPerWeek: 4 },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', classesPerWeek: 4 },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', classesPerWeek: 2 },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. S. Krishnakumar', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['', '', '21ECC211L', '21ECC211L', '', '21ECC203T', '21ECC201T', '21CSS201T', '21PDH209T'],
      'Tuesday': ['21ECC211L', '21ECC211L', '', '', '', '21CSS201T', '21ECC203T', '21ECC205T', '21MAB201T'],
      'Wednesday': ['21LEM202T', '21LEM202T', '', '', '', '21PDH209T', '21ECC205T', '21MAB201T', '21ECC203T'],
      'Thursday': ['21LEM202T', '21LEM202T', '21PDM201L', '21PDM201L', '', '21MAB201T', '21CSS201T', '21ECC201T', '21ECC205T'],
      'Friday': ['21PDM201L', '21PDM201L', '', '', '', '21LEM201T', '21MAB201T', '21ECC201T', '21CSS201T']
    }
  },
  {
    id: 'iii-bme',
    name: 'III Year - Biomedical Engineering',
    department: 'BME',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'IST 211 / AN',
    subjects: [
      { code: '21MAB301T', name: 'Probability and Statistics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. K. M. Karuppusamy', classesPerWeek: 4 },
      { code: '21BMC302J', name: 'Microcontrollers and Its Application in Medicine', slot: 'B', credits: '3-0-2-4', faculty: 'Dr. K. Vigneshwaran', classesPerWeek: 3 },
      { code: '21BMC301J', name: 'Biomedical Signal Processing', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. V. N. Senthilkumaran', classesPerWeek: 3 },
      { code: '21BME266T', name: 'Biometrics', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. G. Gifta', classesPerWeek: 3 },
      { code: '21ECO103T', name: 'Modern wireless communication system', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Vaishnavi', classesPerWeek: 3 },
      { code: '21BMC303T', name: 'Principles of Medical Imaging', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasana venkatesh', classesPerWeek: 3 },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC-625', classesPerWeek: 3 },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. G. Gifta', classesPerWeek: 1 },
      { code: '21GNP301L', name: 'Community Connect', slot: 'I', credits: '0-0-2-1', faculty: 'Dr. J. Jencia', classesPerWeek: 2 },
      { code: 'LAB-MPMC', name: 'MPMC / BIO DSP Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Lab Faculty', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21PDM301L', '21PDM301L', 'LAB-MPMC', 'LAB-MPMC', '', '21ECO103T', '21BMC302J', '21BMC303T', '21LEM301T'],
      'Tuesday': ['LAB-MPMC', 'LAB-MPMC', '21PDM301L', '', '', '21BMC301J', '21BME266T', '21MAB301T', '21BMC302J'],
      'Wednesday': ['', '', '', '', '', '21BMC301J', '21MAB301T', '21BMC303T', '21BME266T'],
      'Thursday': ['', '', '', '21GNP301L', '', '21MAB301T', '21BMC301J', '21ECO103T', '21BMC302J'],
      'Friday': ['21GNP301L', '', '', '', '', '21BMC303T', '21MAB301T', '21BME266T', '21ECO103T']
    }
  },
  {
    id: 'iii-ece-a',
    name: 'III Year - ECE Sec A',
    department: 'ECE',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'IST 518/FN',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 3', classesPerWeek: 4 },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Dr. M. Manikandan', classesPerWeek: 5 },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. M. Jothi', classesPerWeek: 3 },
      { code: '21ECE468T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', classesPerWeek: 3 },
      { code: '21CSO355T', name: 'Machine learning for all', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', classesPerWeek: 3 },
      { code: '21GNP301L', name: 'Community connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. V. Rajesh / Dr. V. Bharathi', classesPerWeek: 2 },
      { code: '21PDM301L', name: 'Analytical and logical thinking skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC / 625', classesPerWeek: 3 },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', classesPerWeek: 1 },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Lab', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. M. Jothi / Dr. P. Murugapandiyan', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21CSO355T', '21ECC301P', '21ECC301P', '21MAB302T', '', '21PDM301L', '21PDM301L', '', ''],
      'Tuesday': ['21LEM301T', '21ECE468T', '21ECC301P', '21ECC301P', '', '', '21PDM301L', '', ''],
      'Wednesday': ['21ECC303T', '21MAB302T', '21ECE468T', '21GNP301L', '', '', '', '21ECC311L', '21ECC311L'],
      'Thursday': ['21MAB302T', '21CSO355T', '21ECC303T', '21GNP301L', '', '', '', '', ''],
      'Friday': ['21ECE468T', '21MAB302T', '21CSO355T', '21ECC303T', '', '21ECC311L', '21ECC311L', '', '']
    }
  },
  {
    id: 'iii-ece-b',
    name: 'III Year - ECE Sec B',
    department: 'ECE',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'IST 518/AN',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. M. Thanga Rejini', classesPerWeek: 4 },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', classesPerWeek: 5 },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', classesPerWeek: 3 },
      { code: '21ECE468T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', classesPerWeek: 3 },
      { code: '21CSO355T', name: 'Machine learning for all', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', classesPerWeek: 3 },
      { code: '21GNP301L', name: 'Community connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. H. Sudharsan', classesPerWeek: 2 },
      { code: '21PDM301L', name: 'Analytical and logical thinking skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC - 625', classesPerWeek: 3 },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. A. Anand', classesPerWeek: 1 },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Lab', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Sreenivasa Ijada Rao', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21ECC311L', '21ECC311L', '', '', '', '21CSO355T', '21ECC301P', '21MAB302T', '21ECE468T'],
      'Tuesday': ['21PDM301L', '21PDM301L', '', '', '', '21GNP301L', '21ECC301P', '21ECE468T', '21ECC303T'],
      'Wednesday': ['21PDM301L', '', '', '', '', '21ECC301P', '21ECC301P', '21MAB302T', '21LEM301T'],
      'Thursday': ['21ECC311L', '21ECC311L', '', '', '', '21MAB302T', '21ECC303T', '21CSO355T', '21GNP301L'],
      'Friday': ['', '', '', '', '', '21ECC303T', '21MAB302T', '21CSO355T', '21ECE468T']
    }
  },
  {
    id: 'iii-ece-ds',
    name: 'III Year - ECE (Data Science)',
    department: 'ECE / DS',
    year: 'III Year',
    semester: 'V Semester',
    venue: 'IST 519/FN',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New faculty 2', classesPerWeek: 4 },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', classesPerWeek: 5 },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', classesPerWeek: 3 },
      { code: '21CSO355T', name: 'Machine learning for all', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. Chitra Devi', classesPerWeek: 3 },
      { code: '21ECE371T', name: 'Database Design and Management', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. S. Saraswathi', classesPerWeek: 3 },
      { code: '21GNP301L', name: 'Community connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. S. Jeevanantham', classesPerWeek: 2 },
      { code: '21PDM301L', name: 'Analytical and logical thinking skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC-625', classesPerWeek: 3 },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. Prabin Kumar Bera', classesPerWeek: 1 },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Lab', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. R. Vinothraj', classesPerWeek: 4 }
    ],
    schedule: {
      'Monday': ['21ECE371T', '21ECC301P', '21ECC303T', '21MAB302T', '', '', '', '', ''],
      'Tuesday': ['21ECC303T', '21ECC301P', '21CSO355T', '21GNP301L', '', '21ECC311L', '21ECC311L', '', ''],
      'Wednesday': ['21LEM301T', '21ECC301P', '21MAB302T', '21ECC303T', '', '', '', '21PDM301L', '21PDM301L'],
      'Thursday': ['21MAB302T', '21CSO355T', '21ECE371T', '21GNP301L', '', '', '', '', ''],
      'Friday': ['21CSO355T', '21MAB302T', '21ECE371T', '21ECC301P', '', '21PDM301L', '', '21ECC311L', '21ECC311L']
    }
  },
  {
    id: 'iv-ece-a',
    name: 'IV Year - ECE Sec A',
    department: 'ECE',
    year: 'IV Year',
    semester: 'VII Semester',
    venue: 'IST 225',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Anand', classesPerWeek: 4 },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', classesPerWeek: 3 },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. S. Jeevanantham', classesPerWeek: 3 },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneshwari', classesPerWeek: 3 },
      { code: '21ECE463T', name: 'Scripting Language for EDA', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', classesPerWeek: 3 },
      { code: '21CSO355T', name: 'Machine learning for all', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', classesPerWeek: 3 },
      { code: '21ECC402L', name: 'Computer Communication and Network Lab', slot: 'LAB', credits: '2-1-0-3', faculty: 'Mrs. T. Swetha', classesPerWeek: 1 }
    ],
    schedule: {
      'Monday': ['21ECC402P', '', '21GNH401T', '21ECE461T', '', '', '', '', ''],
      'Tuesday': ['21ECC402P', '21ECE461T', '21ECC401T', '21CSO355T', '', '', '', '', ''],
      'Wednesday': ['21ECC401T', '21ECC402L', '21ECE463T', '21CSO355T', '', '', '', '', ''],
      'Thursday': ['21CSO355T', '21GNH401T', '21ECE463T', '21ECC401T', '', '', '', '', ''],
      'Friday': ['21ECC402P', '21GNH401T', '21ECE461T', '21ECE463T', '', '', '', '', '']
    }
  },
  {
    id: 'iv-ece-b',
    name: 'IV Year - ECE Sec B',
    department: 'ECE',
    year: 'IV Year',
    semester: 'VII Semester',
    venue: 'IST 227',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Annand', classesPerWeek: 4 },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', classesPerWeek: 3 },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. R. Rajasekar', classesPerWeek: 3 },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneshwari', classesPerWeek: 3 },
      { code: '21ECE463T', name: 'Scripting Language for EDA', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', classesPerWeek: 3 },
      { code: '21CSO355T', name: 'Machine learning for all', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', classesPerWeek: 3 },
      { code: '21ECC402L', name: 'Computer Communication and Network Lab', slot: 'LAB', credits: '2-1-0-3', faculty: 'Mrs. T. Swetha', classesPerWeek: 1 }
    ],
    schedule: {
      'Monday': ['21ECC402P', '21GNH401T', '21ECE463T', '21CSO355T', '', '', '', '', ''],
      'Tuesday': ['21ECC402P', '21ECE463T', '21CSO355T', '21ECC401T', '', '', '', '', ''],
      'Wednesday': ['21ECC402P', '21ECE461T', '21GNH401T', '21ECC401T', '', '', '', '', ''],
      'Thursday': ['21ECE461T', '21ECC401T', '21ECC402L', '21GNH401T', '', '', '', '', ''],
      'Friday': ['21ECE463T', '21ECE461T', '21CSO355T', '', '', '', '', '', '']
    }
  },
  {
    id: 'i-ece-a',
    name: 'I Year - ECE Sec A',
    department: 'ECE',
    year: 'I Year',
    semester: 'I Semester',
    venue: 'IST 602',
    subjects: [
      { code: '21LEH104T', name: 'German', slot: 'LANG', credits: '2-1-0-3', faculty: 'Mr. Selva', classesPerWeek: 3 },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'E', credits: '1-0-2-2', faculty: 'Dr. R. Aarthi', classesPerWeek: 3 },
      { code: '21MAB102T', name: 'Advanced Calculus and Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. R. Ragul', classesPerWeek: 4 },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. P. Pachamuthu', classesPerWeek: 5 },
      { code: '21BTB102J', name: 'Electronic System and PCB Design', slot: 'C', credits: '2-0-0-2', faculty: 'Dr. U. Shajith Ali', classesPerWeek: 2 },
      { code: '21CSS101J', name: 'Programming for Problem Solving', slot: 'D', credits: '3-0-2-4', faculty: 'Dr. A. Rama Prasath', classesPerWeek: 5 },
      { code: '21MES101L', name: 'Basic Civil and Mechanical Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. N. S. Balaji', classesPerWeek: 4 },
      { code: '21PDM102L', name: 'General Aptitude (CDC)', slot: 'CDC', credits: '0-0-2-0', faculty: 'Mr. Sivanandhan', classesPerWeek: 3 },
      { code: '21GNM102L', name: 'NSS', slot: 'NSS', credits: '0-0-2-0', faculty: 'Dr. R. Manickam', classesPerWeek: 2 },
      { code: '21BTB103T', name: 'Biology', slot: 'F', credits: '2-0-0-2', faculty: 'Dr. M. Jaya Priya', classesPerWeek: 2 }
    ],
    schedule: {
      'Monday': ['21GNH101J', '21GNH101J', '21CYB101J', '21MAB102T', '', '21CYB101J', '21CYB101J', '21BTB103T', '21PDM102L'],
      'Tuesday': ['21BTB102J', '21CYB101J', '21MAB102T', '21CSS101J', '', '21MES101L', '21MES101L', '21MES101L', '21MES101L'],
      'Wednesday': ['21CYB101J', '21GNH101J', '21CSS101J', '', '', '21CSS101J', '21CSS101J', '21BTB102J', '21BTB102J'],
      'Thursday': ['21LEH104T', '21LEH104T', '', '21MAB102T', '', '21PDM102L', '21PDM102L', '21GNM102L', '21GNM102L'],
      'Friday': ['21CSS101J', '21MAB102T', '21BTB102J', '21CYB101J', '', '21BTB103T', '', '21LEH104T', '21LEH104T']
    }
  }
];
