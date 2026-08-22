import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/auth";
import { usePharmacyData, useSubmitPharmacySales } from "@/hooks/useSurveillanceData";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Download,
  Calendar,
  Building2,
  Check,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Database,
  Pill
} from "lucide-react";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { title: "Pharmacy Portal · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content:
          "Official pharmacy partner portal for daily OTC medicine sales telemetry reporting — Integrated Disease Surveillance Programme.",
      },
      { property: "og:title", content: "Pharmacy Portal — Jan Swasthya Signal Grid" },
      {
        property: "og:description",
        content: "Daily OTC medicine sales confirmation feeding the district predictive disease grid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pharmacy,
});

const SCENARIOS = [
  {
    id: "gastro",
    title: "Gastroenteritis & ORS Surge",
    badge: "Cholera / Water Contamination",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800",
    icon: "💧",
    fileName: "varanasi_gastro_ors_spike.csv",
    items: [
      { date: "2026-08-23", medicine: "Electral ORS Sachet 21.8g", category: "ORS & Electrolytes", qty: 145, baseline: 25, spike: true, pct: 480 },
      { date: "2026-08-23", medicine: "Prolyte ORS Drink 200ml Orange", category: "ORS & Electrolytes", qty: 92, baseline: 25, spike: true, pct: 268 },
      { date: "2026-08-23", medicine: "Norflox-TZ Tablet 10s", category: "Antidiarrheals & Probiotics", qty: 78, baseline: 18, spike: true, pct: 333 },
      { date: "2026-08-23", medicine: "Sporlac-DS Probiotic Sachet", category: "Antidiarrheals & Probiotics", qty: 84, baseline: 18, spike: true, pct: 366 },
      { date: "2026-08-23", medicine: "Zincovit Syrup 200ml", category: "ORS & Electrolytes", qty: 46, baseline: 25, spike: false, pct: 84 },
      { date: "2026-08-23", medicine: "Dolo 650 Tablet", category: "Paracetamol & Antipyretics", qty: 52, baseline: 45, spike: false, pct: 15 },
      { date: "2026-08-23", medicine: "Ondem-MD 4mg (Vomiting)", category: "Antiemetics & Antacids", qty: 64, baseline: 24, spike: true, pct: 166 },
      { date: "2026-08-23", medicine: "Metrogyl 400mg", category: "Antidiarrheals & Probiotics", qty: 68, baseline: 18, spike: true, pct: 277 }
    ]
  },
  {
    id: "dengue",
    title: "Dengue & Malaria Fever Surge",
    badge: "Vector-Borne Outbreak",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    icon: "🦟",
    fileName: "gorakhpur_dengue_fever_wave.csv",
    items: [
      { date: "2026-08-23", medicine: "Dolo 650mg Paracetamol 15s", category: "Paracetamol & Antipyretics", qty: 185, baseline: 45, spike: true, pct: 311 },
      { date: "2026-08-23", medicine: "Calpol 650 Suspension 60ml", category: "Paracetamol & Antipyretics", qty: 94, baseline: 45, spike: true, pct: 108 },
      { date: "2026-08-23", medicine: "Caripill Papaya Leaf Extract 1100mg", category: "Antimalarial & Platelet Boosters", qty: 68, baseline: 8, spike: true, pct: 750 },
      { date: "2026-08-23", medicine: "Platimax Platelet Booster Syrup", category: "Antimalarial & Platelet Boosters", qty: 52, baseline: 8, spike: true, pct: 550 },
      { date: "2026-08-23", medicine: "Lariago Chloroquine 250mg", category: "Antimalarial & Platelet Boosters", qty: 38, baseline: 8, spike: true, pct: 375 },
      { date: "2026-08-23", medicine: "Combiflam Analgesic", category: "Paracetamol & Antipyretics", qty: 72, baseline: 45, spike: false, pct: 60 },
      { date: "2026-08-23", medicine: "Taxim-O 200mg Cefixime", category: "Antibiotics", qty: 58, baseline: 32, spike: false, pct: 81 }
    ]
  },
  {
    id: "respiratory",
    title: "Winter Respiratory & Flu Surge",
    badge: "Influenza / Viral Wave",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    icon: "🫁",
    fileName: "prayagraj_winter_respiratory_wave.csv",
    items: [
      { date: "2026-08-23", medicine: "Ascoril-D Plus Cough Syrup 100ml", category: "Cough & Respiratory Syrups", qty: 140, baseline: 30, spike: true, pct: 366 },
      { date: "2026-08-23", medicine: "Azithral 500mg Tablet 5s", category: "Antibiotics", qty: 98, baseline: 32, spike: true, pct: 206 },
      { date: "2026-08-23", medicine: "Benadryl Cough Formula 100ml", category: "Cough & Respiratory Syrups", qty: 86, baseline: 30, spike: true, pct: 186 },
      { date: "2026-08-23", medicine: "Montair-LC Montelukast Levocetirizine", category: "Antihistamines & Allergy", qty: 92, baseline: 22, spike: true, pct: 318 },
      { date: "2026-08-23", medicine: "Grilinctus-L Syrup", category: "Cough & Respiratory Syrups", qty: 76, baseline: 30, spike: true, pct: 153 },
      { date: "2026-08-23", medicine: "Crocin 650 Advance", category: "Paracetamol & Antipyretics", qty: 88, baseline: 45, spike: false, pct: 95 },
      { date: "2026-08-23", medicine: "Augmentin 625 Duo", category: "Antibiotics", qty: 65, baseline: 32, spike: true, pct: 103 }
    ]
  }
];

function Pharmacy() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const { data } = usePharmacyData();
  const submitSalesMutation = useSubmitPharmacySales();
  const [submitted, setSubmitted] = useState(false);
  const [activeItems, setActiveItems] = useState(SCENARIOS[0].items);
  const [activeFileName, setActiveFileName] = useState(SCENARIOS[0].fileName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    setSubmitted(true);
    submitSalesMutation.mutate({ pharmacyId: "PH-TN-2204", entryCount: activeItems.length });
  };

  const handleSelectScenario = (sc: typeof SCENARIOS[0]) => {
    setActiveItems(sc.items);
    setActiveFileName(sc.fileName);
    setSubmitted(false);
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    const updated = [...activeItems];
    const item = updated[index];
    const qty = Math.max(0, isNaN(newQty) ? 0 : newQty);
    const baseline = item.baseline || 20;
    const pctChange = Math.round(((qty - baseline) / baseline) * 100);
    
    updated[index] = {
      ...item,
      qty,
      spike: pctChange >= 120,
      pct: pctChange
    };
    setActiveItems(updated);
    setSubmitted(false);
  };

  if (!user) return null;

  const spikesCount = activeItems.filter(i => i.spike).length;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 space-y-5">
        
        {/* Top Scenario Presets Bar */}
        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary border border-primary/20">
                  Pharmacy SOP Telemetry
                </span>
                <span className="text-xs text-muted-foreground">IDSP Sentinel Reporting Node</span>
              </div>
              <h2 className="mt-1 text-base font-bold font-display text-foreground">
                Extract Real-World Pharmacy SOP & Billing Outbreak Presets
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/varanasi_gastro_ors_spike.csv"
                download="varanasi_gastro_ors_spike.csv"
                className="px-2.5 py-1 text-xs rounded-md border border-border bg-surface-2 text-foreground hover:border-primary flex items-center gap-1.5 transition font-semibold"
              >
                <Download className="size-3 text-primary" /> Download Sample SOP CSV
              </a>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3 rounded-lg border text-left transition-all shadow-xs flex flex-col justify-between ${
                  activeFileName === sc.fileName
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-surface-2/60 hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-lg">{sc.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-foreground">
                    {sc.title}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-primary font-bold flex items-center gap-1">
                  <span>{activeFileName === sc.fileName ? "✓ Currently Active" : "Load Outbreak Signals"}</span>
                  <ArrowRight className="size-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_310px]">
          {/* Left Column: Registered Pharmacy Profile */}
          <section className="panel p-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-border pb-3 mb-3">
                <h2 className="label-eyebrow text-foreground">Pharmacy Profile</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  IDSP Registered Data Partner
                </p>
              </div>

              <dl className="space-y-3 text-xs">
                {[
                  ["License Holder", "Rajan Krishnamurthy"],
                  ["Establishment", "Sri Sai Medical Store"],
                  ["Partner ID", "PH-TN-2204"],
                  ["GST Identification", "33AABCS1429B1ZB"],
                  ["District Health Circle", "Thanjavur Circle"],
                  ["Pincode", "613 001"],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-border/60 pb-2">
                    <dt className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4 rounded-md border border-orange-300 dark:border-orange-800/60 bg-orange-50 dark:bg-orange-950/40 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="size-5" />
                <span className="font-display text-2xl font-bold font-mono">14 Days</span>
              </div>
              <p className="text-[11px] font-bold text-orange-800 dark:text-orange-300 mt-0.5">Continuous Compliance Streak 🔥</p>
            </div>
          </section>

          {/* Center Column: Daily OTC Sales Telemetry */}
          <section className="panel p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="label-eyebrow text-foreground">Active Telemetry: {activeFileName}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 font-mono font-bold text-foreground">
                    {activeItems.length} Drugs Extracted
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Surges ≥120% over 7-day rolling baseline are flagged as early outbreak signals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {spikesCount > 0 && (
                  <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-md text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="size-3.5 text-red-600" /> {spikesCount} Surges Flagged
                  </span>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-md shadow-xs transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>{submitted ? "✓ Batch Synchronized" : "Confirm & Sync Batch"}</span>
                </button>
              </div>
            </div>

            {submitted && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>Daily sales batch synchronized with district surveillance grid. Compliance streak incremented to 14 days!</span>
              </div>
            )}

            {/* Extracted Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-y border-border">
                  <tr>
                    <th className="py-2 px-2.5">Date</th>
                    <th className="py-2 px-2.5">Medicine Name</th>
                    <th className="py-2 px-2.5">Category</th>
                    <th className="py-2 px-2.5 text-right">Units (Editable)</th>
                    <th className="py-2 px-2.5 text-right">Baseline</th>
                    <th className="py-2 px-2.5 text-right">Surge %</th>
                    <th className="py-2 px-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        item.spike
                          ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60"
                          : "hover:bg-surface-2/40"
                      }`}
                    >
                      <td className="py-2 px-2.5 font-mono text-muted-foreground">{item.date}</td>
                      <td className="py-2 px-2.5 font-bold text-foreground">{item.medicine}</td>
                      <td className="py-2 px-2.5">
                        <span className="px-2 py-0.5 rounded bg-surface-2 text-[11px] font-medium text-foreground">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={e => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          className={`w-16 px-1.5 py-0.5 rounded text-right font-mono font-bold border text-xs focus:outline-none ${
                            item.spike
                              ? "bg-background border-red-300 text-red-700 dark:text-red-400"
                              : "bg-background border-border text-foreground"
                          }`}
                        />
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono text-muted-foreground">{item.baseline}</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold">
                        <span className={item.pct > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                          {item.pct > 0 ? `+${item.pct}%` : `${item.pct}%`}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        {item.spike ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 text-[10px] font-bold border border-red-200 dark:border-red-800">
                            Surge Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground text-[10px]">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Column: 7-Day Compliance History */}
          <section className="panel p-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-border pb-3 mb-3">
                <h2 className="label-eyebrow text-foreground">Submission Log</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Recent Daily Telemetry Batches
                </p>
              </div>

              <ul className="space-y-2.5 text-xs">
                {[
                  { date: "22 Aug 2026", time: "06:02 AM", count: 18, status: "Verified" },
                  { date: "21 Aug 2026", time: "06:00 AM", count: 18, status: "Verified" },
                  { date: "20 Aug 2026", time: "06:01 AM", count: 18, status: "Verified" },
                  { date: "19 Aug 2026", time: "06:05 AM", count: 18, status: "Verified" },
                  { date: "18 Aug 2026", time: "06:00 AM", count: 18, status: "Verified" },
                ].map(log => (
                  <li
                    key={log.date}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2/60 p-2.5"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{log.date}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{log.time} • {log.count} items</p>
                    </div>
                    <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
                      ✓ {log.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
              🛡️ Verified encrypted telemetry feeding the Ayushman Bharat Digital Mission surveillance grid.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
