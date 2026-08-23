import { useMemo, useState, useEffect } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { DistrictMap } from "@/components/DistrictMap";
import { useAuth } from "@/lib/auth";
import { useZones, useAlertHistory, usePhcList, useAssignCamp } from "@/hooks/useSurveillanceData";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const retrainingHistory = [
  { week: "W26", accuracy: 78.2, tp: 28, fp: 14, fn: 6, tn: 102 },
  { week: "W27", accuracy: 79.8, tp: 31, fp: 12, fn: 5, tn: 110 },
  { week: "W28", accuracy: 81.5, tp: 35, fp: 11, fn: 4, tn: 118 },
  { week: "W29", accuracy: 83.1, tp: 40, fp: 9, fn: 4, tn: 124 },
  { week: "W30", accuracy: 84.0, tp: 44, fp: 8, fn: 3, tn: 130 },
  { week: "W31", accuracy: 85.6, tp: 48, fp: 7, fn: 3, tn: 138 },
  { week: "W32", accuracy: 87.3, tp: 52, fp: 6, fn: 2, tn: 144 },
  { week: "W33", accuracy: 88.5, tp: 55, fp: 5, fn: 2, tn: 150 },
  { week: "W34", accuracy: 89.4, tp: 59, fp: 4, fn: 2, tn: 156 },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DHO Dashboard · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content:
          "Official district predictive disease cluster surveillance portal for District Health Officers — Tamil Nadu Department of Public Health.",
      },
      { property: "og:title", content: "Jan Swasthya Signal Grid — District Health Officer Portal" },
      {
        property: "og:description",
        content:
          "Predictive disease surveillance grid for Thanjavur District. Fuses pharmacy, PoC device, ASHA, and wastewater signals into actionable deployment alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const badgeTone = {
  high: "bg-red-50 text-red-700 border-red-200 font-semibold dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
  watch: "bg-amber-50 text-amber-700 border-amber-200 font-semibold dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
} as const;

const statusDot = {
  available: "bg-emerald-500",
  partial: "bg-amber-500",
  occupied: "bg-red-500",
} as const;

function useCountUp(target: number, duration: number = 600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return count;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const { data: zones = [] } = useZones();
  const { data: alertHistory = [] } = useAlertHistory();
  const { data: phcs = [] } = usePhcList();
  const assignCampMutation = useAssignCamp();

  const [selectedId, setSelectedId] = useState<string | null>("pattukkottai");
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [alertRiskFilter, setAlertRiskFilter] = useState<string>("all");
  const [alertDiseaseFilter, setAlertDiseaseFilter] = useState<string>("all");
  const [selectedPhcModal, setSelectedPhcModal] = useState<(typeof phcs)[number] | null>(null);
  const [highlightedZoneName, setHighlightedZoneName] = useState<string | null>(null);
  const [isLoadingSkeletons, setIsLoadingSkeletons] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingSkeletons(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const animatedSignals = useCountUp(4812, 700);

  const selected = useMemo(() => zones.find((z) => z.id === selectedId) ?? null, [zones, selectedId]);

  const filteredAlerts = useMemo(() => {
    return alertHistory.filter((a) => {
      const matchRisk = alertRiskFilter === "all" || a.tone === alertRiskFilter;
      const matchDisease =
        alertDiseaseFilter === "all" ||
        a.tag.toLowerCase().includes(alertDiseaseFilter.toLowerCase()) ||
        a.note.toLowerCase().includes(alertDiseaseFilter.toLowerCase());
      return matchRisk && matchDisease;
    });
  }, [alertHistory, alertRiskFilter, alertDiseaseFilter]);

  const handleAlertClick = (alertZone: string) => {
    setHighlightedZoneName(alertZone);
    const matchingZone = zones.find(
      (z) =>
        z.name.toLowerCase().includes(alertZone.toLowerCase()) ||
        alertZone.toLowerCase().includes(z.name.toLowerCase()),
    );
    if (matchingZone) {
      setSelectedId(matchingZone.id);
    }
  };

  const handlePhcClick = (phc: (typeof phcs)[number]) => {
    setSelectedPhcModal(phc);
    const locName = phc.name.replace(/^PHC\s+/i, "");
    setHighlightedZoneName(locName);
    const matchingZone = zones.find(
      (z) =>
        z.name.toLowerCase().includes(locName.toLowerCase()) ||
        locName.toLowerCase().includes(z.name.toLowerCase()),
    );
    if (matchingZone) {
      setSelectedId(matchingZone.id);
    }
  };

  const counts = useMemo(
    () => ({
      high: zones.filter((z) => z.risk === "high").length,
      watch: zones.filter((z) => z.risk === "watch").length,
      normal: zones.filter((z) => z.risk === "normal").length,
    }),
    [zones],
  );

  const handleAssignCamp = (zoneId: string, phcName: string) => {
    setAssigned((prev) => ({ ...prev, [zoneId]: phcName }));
    assignCampMutation.mutate({ zoneId, phcName });
    toast.success(`Mobile Camp assigned to ${phcName}`, {
      description: `Deployment order transmitted to District Fleet Command for zone ${zoneId.toUpperCase()}.`,
    });
  };

  const handleExportReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Surveillance Week,Pincode,Zone Name,Risk Level,Disease,Signals Ingested,Accuracy\n" +
      `Week 34 (17-23 Aug 2026),614 601,Pattukkottai,High Risk,Tuberculosis,4812,89.4%\n` +
      `Week 34 (17-23 Aug 2026),614 903,Madukkur,High Risk,Diabetes,4812,89.4%\n` +
      `Week 34 (17-23 Aug 2026),614 713,Sethubavachatram,High Risk,Anemia,4812,89.4%\n` +
      `Week 34 (17-23 Aug 2026),614 701,Adirampattinam,Watch Zone,Anemia,4812,89.4%\n` +
      `Week 34 (17-23 Aug 2026),614 804,Peravurani,Watch Zone,Diabetes,4812,89.4%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `District_Surveillance_Report_Week34.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Weekly Report Exported", {
      description: "Downloaded District_Surveillance_Report_Week34.csv",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {/* District Overview Header */}
        <div className="mb-5 rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3.5 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary uppercase border border-primary/20">
                  District Health Officer Portal
                </span>
                <span className="text-xs text-muted-foreground">District Administration • Thanjavur</span>
              </div>
              <h1 className="mt-1 text-xl font-bold font-display tracking-tight text-foreground sm:text-2xl">
                District Disease Surveillance Overview
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Export Weekly Report</span>
              </button>

              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  isSupabaseConfigured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isSupabaseConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {isSupabaseConfigured ? "Supabase Cloud Sync Active" : "Local Database Mode"}
              </span>

              <span className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground font-medium">
                Telemetry Streamed Today: <strong className="text-foreground font-semibold font-mono">{animatedSignals.toLocaleString()} Signals</strong>
              </span>
            </div>
          </div>

          {/* Surveillance Week & Model Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Surveillance Week 34 (17–23 August 2026):</strong>{" "}
            {counts.high} pincodes crossed the early outbreak threshold based on fused pharmacy OTC sales, PoC device telemetry, ASHA mobile logs, and wastewater sentinel labs. Model retrained on last week's 412 confirmed screening diagnoses.
          </p>

          {/* Top KPI Statistics Grid */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Week</p>
                <p className="mt-1 text-lg font-bold font-display text-foreground">Week 34</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-border/50 pt-1.5">
                <span className="text-[10px] text-muted-foreground font-semibold">17–23 Aug 2026</span>
                <MiniSparkline points={[31, 32, 33, 34]} strokeColor="stroke-primary" />
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Signals Today</p>
                <p className="mt-1 text-lg font-bold font-display text-primary font-mono">{animatedSignals.toLocaleString()}</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-border/50 pt-1.5">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">↑ +14% vs avg</span>
                <MiniSparkline points={[3800, 4100, 4300, 4200, 4812]} strokeColor="stroke-emerald-600 dark:stroke-emerald-400" />
              </div>
            </div>

            <div className="rounded-md border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">High Risk Zones</p>
                <p className="mt-1 text-lg font-bold font-display text-red-700 dark:text-red-400">{counts.high} Pincodes</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-red-200/60 dark:border-red-900/50 pt-1.5">
                <span className="text-[10px] text-red-700 dark:text-red-300 font-semibold">↑ +1 vs last week</span>
                <MiniSparkline points={[1, 2, 2, counts.high]} strokeColor="stroke-red-600 dark:stroke-red-400" />
              </div>
            </div>

            <div className="rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Watch Zones</p>
                <p className="mt-1 text-lg font-bold font-display text-amber-700 dark:text-amber-400">{counts.watch} Pincodes</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-amber-200/60 dark:border-amber-900/50 pt-1.5">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">↓ -1 vs last week</span>
                <MiniSparkline points={[4, 3, 3, counts.watch]} strokeColor="stroke-amber-600 dark:stroke-amber-400" />
              </div>
            </div>

            <div className="rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Active Mobile Camps</p>
                <p className="mt-1 text-lg font-bold font-display text-emerald-700 dark:text-emerald-400">
                  {Object.keys(assigned).length + 5} Healthcare Camps
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-emerald-200/60 dark:border-emerald-900/50 pt-1.5">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">↑ +2 vs target</span>
                <MiniSparkline points={[3, 4, 4, Object.keys(assigned).length + 5]} strokeColor="stroke-emerald-600 dark:stroke-emerald-400" />
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model Accuracy</p>
                <p className="mt-1 text-lg font-bold font-display text-foreground">89.4%</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 border-t border-border/50 pt-1.5">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">↑ +5.4% post-retrain</span>
                <MiniSparkline points={[78, 81, 84, 89.4]} strokeColor="stroke-emerald-600 dark:stroke-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard 3-Column Main Grid */}
        <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)_320px]">
          {/* Left Column: Official Health Alert History */}
          <section className="panel p-4 flex flex-col">
            <div className="border-b border-border pb-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="label-eyebrow text-foreground">Alert History</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Official District Health Warnings
                  </p>
                </div>
                <span className="rounded bg-surface-2 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {filteredAlerts.length} / {alertHistory.length}
                </span>
              </div>

              {/* Risk Level Filter Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground font-semibold uppercase text-[9px]">Risk:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "high", label: "High" },
                  { id: "watch", label: "Watch" },
                  { id: "normal", label: "Normal" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setAlertRiskFilter(chip.id)}
                    className={`rounded-full px-2 py-0.5 font-bold transition-all cursor-pointer border ${
                      alertRiskFilter === chip.id
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Disease Type Filter Chips */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-muted-foreground font-semibold uppercase text-[9px]">Disease:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "Diabetes", label: "Diabetes" },
                  { id: "TB", label: "TB" },
                  { id: "Anemia", label: "Anemia" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setAlertDiseaseFilter(chip.id)}
                    className={`rounded-full px-2 py-0.5 font-bold transition-all cursor-pointer border ${
                      alertDiseaseFilter === chip.id
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-xs"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <ul className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {filteredAlerts.length === 0 ? (
                <li className="p-4 text-center text-xs text-muted-foreground rounded-md border border-dashed border-border bg-surface-2/40">
                  No alert warnings match selected filters.
                </li>
              ) : (
                filteredAlerts.map((a) => {
                  const isHighlighted =
                    highlightedZoneName?.toLowerCase().includes(a.zone.toLowerCase()) ||
                    selected?.name.toLowerCase().includes(a.zone.toLowerCase());

                  return (
                    <li
                      key={a.zone}
                      onClick={() => handleAlertClick(a.zone)}
                      className={`rounded-md border p-3 transition-all cursor-pointer shadow-xs ${
                        isHighlighted
                          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                          : "border-border bg-surface hover:border-primary/40 hover:bg-surface-2/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                          {a.zone}
                          {isHighlighted && (
                            <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                              Selected
                            </span>
                          )}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                            badgeTone[a.tone as keyof typeof badgeTone] || badgeTone.normal
                          }`}
                        >
                          {a.tone === "high" ? "High Risk" : a.tone === "watch" ? "Watch" : "Normal"}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-950 bg-blue-100 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-300 dark:border-blue-700 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                          {a.tag}
                        </span>
                        <span className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5">
                          <span>🎯</span> Map Zone
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground bg-surface-2 p-2 rounded border border-border/60">
                        {a.note}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/* Center Column: District GIS Risk Map */}
          <section className="panel relative p-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
                <div>
                  <h2 className="label-eyebrow text-foreground">GIS Risk Map — Thanjavur District</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Interactive Pincode Disease Cluster Map
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground bg-surface-2 px-2.5 py-1 rounded border border-border">
                  <Legend color="bg-red-600" label="High Risk" />
                  <Legend color="bg-amber-500" label="Watch Zone" />
                  <Legend color="bg-emerald-600" label="Normal" />
                  <span className="inline-flex items-center gap-1">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">🏥</span> PHC
                  </span>
                </div>
              </div>

              {/* Leaflet Map Area */}
              <div className="relative">
                <DistrictMap
                  zones={zones}
                  phcs={phcs}
                  selectedId={selectedId}
                  onSelectZone={(id) => setSelectedId(id)}
                />

                {/* Selected Location Medical Analysis Panel */}
                {selected && (
                  <aside className="absolute top-3 right-3 bottom-3 z-[500] w-[310px] overflow-y-auto rounded-lg border border-border bg-white dark:bg-slate-900 p-4 shadow-xl text-slate-900 dark:text-slate-100 border-l-4 border-l-primary">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">{selected.name}</h3>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white ${
                              selected.risk === "high"
                                ? "bg-red-600"
                                : selected.risk === "watch"
                                  ? "bg-amber-600"
                                  : "bg-emerald-600"
                            }`}
                          >
                            {selected.risk}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Pincode <strong className="font-mono">{selected.pincode}</strong> • Pop. {selected.population}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedId(null)}
                        aria-label="Close panel"
                        className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Risk Score & Diagnosis Specs */}
                    <div className="mt-3.5 space-y-2.5">
                      <div className="rounded-md bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Predicted Condition</span>
                          <span className="font-bold text-blue-950 bg-blue-100 dark:bg-blue-950/90 dark:text-blue-200 border border-blue-300 dark:border-blue-700 px-2 py-0.5 rounded text-[11px] shadow-2xs">
                            {selected.disease}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1.5">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Risk Score</span>
                          <span
                            className={`font-bold font-mono ${
                              selected.risk === "high"
                                ? "text-red-600 dark:text-red-400 text-sm"
                                : selected.risk === "watch"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {selected.score} / 100
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">ML Model Confidence</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selected.confidence}%</span>
                        </div>
                      </div>

                      {/* Signals breakdown */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Why It Was Flagged (Baseline vs Surge)
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <span className="size-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                              Baseline
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span
                                className={`size-2 rounded-full ${
                                  selected.risk === "high"
                                    ? "bg-red-600"
                                    : selected.risk === "watch"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                              />
                              Surge
                            </span>
                          </div>
                        </div>

                        <ul className="space-y-2.5">
                          {selected.signals.map((s) => {
                            const baseline = Math.max(12, Math.round(s.weight * 0.4));
                            const anomalySurge = Math.max(0, s.weight - baseline);

                            return (
                              <li key={s.label} className="rounded bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between gap-2 text-xs">
                                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{s.label}</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{s.delta}</span>
                                </div>

                                {/* Two-segment baseline vs current comparison bar */}
                                <div className="mt-2 relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                                  <div
                                    className="h-full bg-slate-400/80 dark:bg-slate-500/80 transition-all"
                                    style={{ width: `${baseline}%` }}
                                    title={`Baseline: ${baseline}%`}
                                  />
                                  <div
                                    className={`h-full transition-all ${
                                      selected.risk === "high"
                                        ? "bg-red-600"
                                        : selected.risk === "watch"
                                          ? "bg-amber-500"
                                          : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${anomalySurge}%` }}
                                    title={`Current Surge: ${s.weight}%`}
                                  />
                                </div>

                                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  <span>Expected Base: {baseline}%</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">Surge Weight: {s.weight}%</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Actionable Deployment / Camp Assignment */}
                      {selected.risk !== "normal" && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                          {assigned[selected.id] ? (
                            <div className="rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                              <p className="font-bold">✓ Mobile Camp Scheduled</p>
                              <p className="mt-0.5 text-[11px]">
                                Assigned to <strong>{assigned[selected.id]}</strong>. Mobile Healthcare Camp scheduled for deployment.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                  Schedule Mobile Camp
                                </p>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">Select Nearest PHC</span>
                              </div>
                              <div className="space-y-1.5">
                                {phcs
                                  .filter((p) => p.status !== "occupied")
                                  .slice(0, 3)
                                  .map((p) => (
                                    <button
                                      key={p.name}
                                      onClick={() => handleAssignCamp(selected.id, p.name)}
                                      className="flex w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-primary hover:bg-primary/5 transition-all shadow-xs"
                                    >
                                      <span>Dispatch {p.name}</span>
                                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{p.km} km</span>
                                    </button>
                                  ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: PHC Availability & Camp Workflow */}
          <div className="space-y-4">
            {/* Primary Health Centre Availability */}
            <section className="panel p-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                <div>
                  <h2 className="label-eyebrow text-foreground">PHC Availability</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    District Mobile Fleet Capacity
                  </p>
                </div>
                <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                  5 Field Units
                </span>
              </div>

              <ul className="space-y-2.5">
                {phcs.map((p) => {
                  const locName = p.name.replace(/^PHC\s+/i, "");
                  const isHighlighted =
                    highlightedZoneName?.toLowerCase().includes(locName.toLowerCase()) ||
                    selected?.name.toLowerCase().includes(locName.toLowerCase());

                  return (
                    <li
                      key={p.name}
                      onClick={() => handlePhcClick(p)}
                      className={`flex items-center justify-between gap-2 rounded-md border p-2.5 text-xs transition-all cursor-pointer shadow-2xs ${
                        isHighlighted
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-surface-2/60 hover:bg-surface-2 hover:border-primary/50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          {p.name}
                          <span className="text-[10px] text-primary hover:underline font-normal">
                            (Click for details)
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">{p.km} km from district HQ</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-full ${statusDot[p.status]}`} />
                        <span className="text-[10px] font-semibold capitalize text-muted-foreground">
                          {p.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3.5 flex items-center justify-around border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                <Legend color="bg-emerald-500" label="Available" />
                <Legend color="bg-amber-500" label="Partial" />
                <Legend color="bg-red-500" label="Deployed" />
              </div>
            </section>

            {/* Camp Outcomes & Training Feedback Loop */}
            <section className="panel p-4">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                <div>
                  <h2 className="label-eyebrow text-foreground">Model Retraining Accuracy Progression</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Verified Field Diagnoses Pushed Back into ML Pipeline
                  </p>
                </div>
                <span className="rounded bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                  8-Week Retrain History
                </span>
              </div>

              {/* Summary KPI Cards Above Chart */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded bg-surface-2 p-2 border border-border">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Overall Accuracy</p>
                  <p className="font-display text-base font-bold text-foreground mt-0.5">89.4%</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">↑ +5.4% since W26</p>
                </div>
                <div className="rounded bg-surface-2 p-2 border border-border">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Clinical Precision</p>
                  <p className="font-display text-base font-bold text-primary mt-0.5">87.2%</p>
                  <p className="text-[9px] text-muted-foreground">TP: 59 / FP: 4</p>
                </div>
                <div className="rounded bg-surface-2 p-2 border border-border">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Epidemiological Recall</p>
                  <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">91.8%</p>
                  <p className="text-[9px] text-muted-foreground">Outbreaks Caught</p>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-[180px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retrainingHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[70, 95]} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<AccuracyTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="var(--color-primary)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#accuracyGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 rounded-md border border-border bg-surface-2 p-2.5 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-0.5">Continuous Model Feedback</p>
                Last cycle 5 mobile screening camps tested <strong className="text-foreground">412 citizens</strong> and confirmed <strong className="text-foreground">59 cases</strong>. Verified lab results were pushed back into the model, improving accuracy from 84% to <strong className="text-primary font-bold">89.4%</strong>.
              </div>
            </section>
          </div>
        </div>

        {/* PHC Availability Detail Modal */}
        {selectedPhcModal && (
          <Dialog open={!!selectedPhcModal} onOpenChange={() => setSelectedPhcModal(null)}>
            <DialogContent className="sm:max-w-md bg-surface border-border text-foreground">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏥</span>
                  <div>
                    <DialogTitle className="font-display text-lg font-bold text-foreground">
                      {selectedPhcModal.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Thanjavur District Mobile Healthcare Unit Details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 py-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-surface-2 p-2.5">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Unit Fleet Status</p>
                    <p className="font-bold text-foreground capitalize mt-0.5 flex items-center gap-1.5">
                      <span className={`size-2.5 rounded-full ${statusDot[selectedPhcModal.status]}`} />
                      {selectedPhcModal.status}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-surface-2 p-2.5">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Distance to HQ</p>
                    <p className="font-bold font-mono text-foreground mt-0.5">{selectedPhcModal.km} km</p>
                  </div>
                </div>

                <div className="rounded-md border border-border bg-surface-2 p-3 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Assigned District / Circle</p>
                  <p className="font-semibold text-foreground">Thanjavur District Circle • Circle #4</p>
                  <p className="text-[11px] text-muted-foreground">
                    Assigned Zone: <strong className="text-foreground">{selectedPhcModal.assignedZone || "Standalone District Readiness"}</strong>
                  </p>
                </div>

                <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Equipment & Resources</p>
                  <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5">
                    <li>2 Mobile Diagnostic Screening Vans</li>
                    <li>1 Cold-Chain Vaccine & Specimen Transport Unit</li>
                    <li>8 Paramedical Staff & 2 Medical Officers</li>
                    <li>PoC Blood Glucose & Hb Analyzer Telemetry Ready</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3 mt-2">
                <button
                  onClick={() => {
                    const matchingZone = zones.find((z) => z.risk === "high");
                    if (matchingZone) {
                      handleAssignCamp(matchingZone.id, selectedPhcModal.name);
                    }
                    setSelectedPhcModal(null);
                  }}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  Dispatch to High Risk Zone
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

function MiniSparkline({ points, strokeColor }: { points: number[]; strokeColor: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 40;
  const height = 14;
  const pts = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block opacity-85">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeColor}
        points={pts}
      />
    </svg>
  );
}

function AccuracyTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-popover p-2.5 shadow-lg text-xs text-popover-foreground">
        <p className="font-bold font-display text-primary">{label} Model Retraining</p>
        <p className="text-sm font-bold text-foreground mt-0.5">Accuracy: {data.accuracy}%</p>
        <div className="mt-2 border-t border-border pt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">True Positives (TP): {data.tp}</span>
          <span className="text-red-600 dark:text-red-400 font-semibold">False Positives (FP): {data.fp}</span>
          <span className="text-muted-foreground">False Negatives (FN): {data.fn}</span>
          <span className="text-muted-foreground">True Negatives (TN): {data.tn}</span>
        </div>
      </div>
    );
  }
  return null;
}

