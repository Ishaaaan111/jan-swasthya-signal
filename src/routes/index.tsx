import { useMemo, useState, useEffect } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { DistrictMap } from "@/components/DistrictMap";
import { useAuth } from "@/lib/auth";
import { useZones, useAlertHistory, usePhcList, useAssignCamp } from "@/hooks/useSurveillanceData";
import { isSupabaseConfigured } from "@/lib/supabase";

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
  high: "bg-red-50 text-red-700 border-red-200 font-semibold",
  watch: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
} as const;

const statusDot = {
  available: "bg-emerald-500",
  partial: "bg-amber-500",
  occupied: "bg-red-500",
} as const;

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
  const selected = useMemo(() => zones.find((z) => z.id === selectedId) ?? null, [zones, selectedId]);

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
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  isSupabaseConfigured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
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
                Telemetry Streamed Today: <strong className="text-foreground font-semibold">4,812 Signals</strong>
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
            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Week</p>
              <p className="mt-1 text-lg font-bold font-display text-foreground">Week 34</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">17–23 Aug 2026</p>
            </div>

            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Signals Today</p>
              <p className="mt-1 text-lg font-bold font-display text-primary">4,812</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">↑ +14% vs avg</p>
            </div>

            <div className="rounded-md border border-red-200 bg-red-50/70 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">High Risk Zones</p>
              <p className="mt-1 text-lg font-bold font-display text-red-700">{counts.high} Pincodes</p>
              <p className="text-[10px] text-red-700 font-semibold mt-0.5">Action Required</p>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Watch Zones</p>
              <p className="mt-1 text-lg font-bold font-display text-amber-700">{counts.watch} Pincodes</p>
              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Under Monitoring</p>
            </div>

            <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active Mobile Camps</p>
              <p className="mt-1 text-lg font-bold font-display text-emerald-700">
                {Object.keys(assigned).length + 5} Vans
              </p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Deployed in District</p>
            </div>

            <div className="rounded-md border border-border bg-surface-2/60 p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model Accuracy</p>
              <p className="mt-1 text-lg font-bold font-display text-foreground">89.4%</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Retrained Weekly</p>
            </div>
          </div>
        </div>

        {/* Dashboard 3-Column Main Grid */}
        <div className="grid gap-5 lg:grid-cols-[310px_minmax(0,1fr)_320px]">
          {/* Left Column: Official Health Alert History */}
          <section className="panel p-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div>
                <h2 className="label-eyebrow text-foreground">Alert History</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Official District Health Warnings
                </p>
              </div>
              <span className="rounded bg-surface-2 border border-border px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {alertHistory.length} Logged
              </span>
            </div>

            <ul className="space-y-3 overflow-y-auto max-h-[640px] pr-1">
              {alertHistory.map((a) => (
                <li
                  key={a.zone}
                  className="rounded-md border border-border bg-surface p-3 transition-all hover:border-primary/40 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-bold text-foreground">{a.zone}</span>
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
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground bg-surface-2 p-2 rounded border border-border/60">
                    {a.note}
                  </p>
                </li>
              ))}
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
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                          Why It Was Flagged (Signals)
                        </p>
                        <ul className="space-y-2">
                          {selected.signals.map((s) => (
                            <li key={s.label} className="rounded bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200 dark:border-slate-700">
                              <div className="flex justify-between gap-2 text-xs">
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{s.label}</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{s.delta}</span>
                              </div>
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    selected.risk === "high"
                                      ? "bg-red-600"
                                      : selected.risk === "watch"
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${s.weight}%` }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable Deployment / Camp Assignment */}
                      {selected.risk !== "normal" && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                          {assigned[selected.id] ? (
                            <div className="rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                              <p className="font-bold">✓ Mobile Camp Scheduled</p>
                              <p className="mt-0.5 text-[11px]">
                                Assigned to <strong>{assigned[selected.id]}</strong>. Mobile health van rerouted for deployment.
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
                {phcs.map((p) => (
                  <li
                    key={p.name}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2/60 p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{p.km} km from district HQ</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2.5 rounded-full ${statusDot[p.status]}`} />
                      <span className="text-[10px] font-semibold capitalize text-muted-foreground">
                        {p.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-3.5 flex items-center justify-around border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                <Legend color="bg-emerald-500" label="Available" />
                <Legend color="bg-amber-500" label="Partial" />
                <Legend color="bg-red-500" label="Deployed" />
              </div>
            </section>

            {/* Camp Outcomes & Training Feedback Loop */}
            <section className="panel p-4">
              <h2 className="label-eyebrow text-foreground mb-2">Model Feedback Loop</h2>
              <div className="rounded-md border border-border bg-surface-2 p-3 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Weekly Retraining Progress</p>
                Last cycle 5 mobile screening camps tested <strong className="text-foreground">412 citizens</strong> and confirmed <strong className="text-foreground">59 cases</strong>. Those verified lab results were pushed back into the model, improving prediction accuracy from 84% to <strong className="text-primary font-bold">89.4%</strong>.
              </div>
            </section>
          </div>
        </div>
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

