export type RiskLevel = "high" | "watch" | "normal";

export type Zone = {
  id: string;
  name: string;
  pincode: string;
  disease: string;
  risk: RiskLevel;
  confidence: number;
  score: number;
  col: number;
  row: number;
  signals: { label: string; delta: string; weight: number }[];
  population: string;
};

export const zones: Zone[] = [
  {
    id: "pattukkottai",
    name: "Pattukkottai",
    pincode: "614 601",
    disease: "Tuberculosis",
    risk: "high",
    confidence: 87,
    score: 91,
    col: 2,
    row: 5,
    population: "62,400",
    signals: [
      { label: "Cough syrup + antibiotic sales", delta: "+80%", weight: 92 },
      { label: "School attendance dip", delta: "-31%", weight: 74 },
      { label: "ASHA fever logs", delta: "+22 reports", weight: 61 },
      { label: "Wastewater pathogen markers", delta: "elevated", weight: 55 },
    ],
  },
  {
    id: "madukkur",
    name: "Madukkur",
    pincode: "614 903",
    disease: "Diabetes",
    risk: "high",
    confidence: 83,
    score: 84,
    col: 4,
    row: 2,
    population: "38,100",
    signals: [
      { label: "Glucometer readings >180 mg/dL", delta: "19 of 26", weight: 88 },
      { label: "Antidiabetic sales", delta: "+25%", weight: 70 },
      { label: "Repeat pharmacy visits", delta: "+14%", weight: 48 },
    ],
  },
  {
    id: "sethubavachatram",
    name: "Sethubavachatram",
    pincode: "614 713",
    disease: "Anemia",
    risk: "high",
    confidence: 79,
    score: 80,
    col: 6,
    row: 3,
    population: "27,800",
    signals: [
      { label: "Hemoglobin readings <9 g/dL", delta: "23 of 40", weight: 85 },
      { label: "Iron / folic acid sales", delta: "+41%", weight: 66 },
      { label: "Antenatal camp no-shows", delta: "+18%", weight: 40 },
    ],
  },
  {
    id: "adirampattinam",
    name: "Adirampattinam",
    pincode: "614 701",
    disease: "Anemia",
    risk: "watch",
    confidence: 64,
    score: 58,
    col: 5,
    row: 6,
    population: "44,200",
    signals: [
      { label: "Hemoglobin readings <11 g/dL", delta: "12 of 31", weight: 62 },
      { label: "ORS / electrolyte sales", delta: "+9%", weight: 34 },
    ],
  },
  {
    id: "peravurani",
    name: "Peravurani",
    pincode: "614 804",
    disease: "Diabetes",
    risk: "watch",
    confidence: 61,
    score: 55,
    col: 7,
    row: 5,
    population: "31,500",
    signals: [
      { label: "Antidiabetic sales", delta: "+17%", weight: 58 },
      { label: "Glucometer readings >160 mg/dL", delta: "9 of 22", weight: 45 },
    ],
  },
  {
    id: "papanasam",
    name: "Papanasam",
    pincode: "614 205",
    disease: "No cluster detected",
    risk: "normal",
    confidence: 92,
    score: 14,
    col: 1,
    row: 2,
    population: "35,900",
    signals: [{ label: "All signal streams within baseline", delta: "stable", weight: 12 }],
  },
  {
    id: "kumbakonam",
    name: "Kumbakonam",
    pincode: "612 001",
    disease: "No cluster detected",
    risk: "normal",
    confidence: 90,
    score: 19,
    col: 8,
    row: 2,
    population: "1,40,000",
    signals: [{ label: "Post-camp follow-up clear", delta: "stable", weight: 16 }],
  },
];

export const alertHistory = [
  { zone: "Orathanadu", tag: "Diabetes", tone: "high", note: "Aug 14 · 38 cases confirmed" },
  { zone: "Papanasam", tag: "TB suspected", tone: "watch", note: "Aug 9 · Camp pending" },
  { zone: "Kumbakonam", tag: "Anemia", tone: "high", note: "Aug 3 · 21 cases confirmed" },
  { zone: "Thiruvaiyaru", tag: "Low risk", tone: "normal", note: "Jul 28 · No action needed" },
] as const;

export const phcs = [
  { name: "PHC Orathanadu", km: 12, status: "available" },
  { name: "PHC Papanasam", km: 18, status: "available" },
  { name: "PHC Budalur", km: 24, status: "partial" },
  { name: "PHC Thiruvaiyaru", km: 31, status: "occupied" },
  { name: "PHC Ammapettai", km: 38, status: "available" },
] as const;

export const salesRows = [
  { cat: "Cough & cold", qty: 48, delta: 60 },
  { cat: "Fever / antipyretic", qty: 35, delta: 40 },
  { cat: "Antibiotic", qty: 22, delta: 0 },
  { cat: "Antidiabetic", qty: 19, delta: 25 },
  { cat: "Painkiller", qty: 14, delta: 5 },
  { cat: "Antihistamine", qty: 11, delta: -10 },
  { cat: "Cough syrup", qty: 9, delta: 80 },
  { cat: "ORS / electrolyte", qty: 7, delta: 2 },
];

export const submissionLog = [
  { day: "Friday", date: "Aug 21", state: "pending", note: "Today · pending" },
  { day: "Thursday", date: "Aug 20", state: "done", note: "32 entries" },
  { day: "Wednesday", date: "Aug 19", state: "done", note: "27 entries" },
  { day: "Tuesday", date: "Aug 18", state: "done", note: "41 entries" },
  { day: "Monday", date: "Aug 17", state: "missed", note: "Missed" },
  { day: "Sunday", date: "Aug 16", state: "done", note: "19 entries" },
  { day: "Saturday", date: "Aug 15", state: "done", note: "38 entries" },
];
