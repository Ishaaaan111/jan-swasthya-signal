import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useZones, usePhcList } from "@/hooks/useSurveillanceData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "State Admin Console · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content: "State-wide surveillance command center, multi-stream ingestion audit, and role access management.",
      },
    ],
  }),
  component: AdminPage,
});

const recentSignalStreams = [
  {
    id: "SIG-9401",
    source: "Pharmacy Network",
    pincode: "614 601 (Pattukkottai)",
    indicator: "Cough syrup & Azithromycin sales spike",
    anomaly: "+80% surge",
    weight: 92,
    time: "10 mins ago",
    status: "Flagged High",
  },
  {
    id: "SIG-9402",
    source: "ASHA Mobile Logs",
    pincode: "614 601 (Pattukkottai)",
    indicator: "Persistent cough & night fever reports",
    anomaly: "+22 cases",
    weight: 61,
    time: "24 mins ago",
    status: "Flagged High",
  },
  {
    id: "SIG-9399",
    source: "Point-of-Care Glucometers",
    pincode: "614 903 (Madukkur)",
    indicator: "Fasting blood sugar >180 mg/dL",
    anomaly: "19 of 26 tested",
    weight: 88,
    time: "48 mins ago",
    status: "Flagged High",
  },
  {
    id: "SIG-9395",
    source: "Primary School Attendance",
    pincode: "614 601 (Pattukkottai)",
    indicator: "Elementary student absenteeism",
    anomaly: "-31% drop",
    weight: 74,
    time: "1 hour ago",
    status: "Corroborated",
  },
  {
    id: "SIG-9388",
    source: "Wastewater Sentinel Labs",
    pincode: "614 601 (Pattukkottai)",
    indicator: "TB & Respiratory RNA copies/L",
    anomaly: "Elevated 2.4x",
    weight: 55,
    time: "2 hours ago",
    status: "Corroborated",
  },
  {
    id: "SIG-9382",
    source: "Antenatal Camp Hemoglobin",
    pincode: "614 713 (Sethubavachatram)",
    indicator: "Hb levels <9 g/dL in pregnant women",
    anomaly: "23 of 40 screened",
    weight: 85,
    time: "3 hours ago",
    status: "Flagged High",
  },
];

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: zones = [] } = useZones();
  const { data: phcs = [] } = usePhcList();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const filteredStreams = useMemo(() => {
    if (statusFilter === "all") return recentSignalStreams;
    return recentSignalStreams.filter((s) => s.status === statusFilter);
  }, [statusFilter]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {/* State Banner */}
        <div className="mb-6 rounded-lg border border-border bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary uppercase border border-primary/20">
                  State Surveillance Directorate
                </span>
                <span className="text-xs text-muted-foreground font-medium">Tamil Nadu Health Department</span>
              </div>
              <h1 className="mt-1 text-xl font-bold font-display text-foreground sm:text-2xl">
                Super Admin Command Center
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/"
                className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent flex items-center gap-1.5 shadow-xs"
              >
                <span>🩺</span> Open DHO Map
              </Link>
              <Link
                to="/pharmacy"
                className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent flex items-center gap-1.5 shadow-xs"
              >
                <span>💊</span> Open Pharmacy Portal
              </Link>
            </div>
          </div>

          {/* Panoramic KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-md border border-border bg-surface-2/60 p-3.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Signals Ingested Today</p>
              <p className="mt-1.5 text-2xl font-bold font-display text-primary">4,812</p>
              <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">↑ +14% vs 7-day avg</p>
            </div>
            <div className="rounded-md border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 p-3.5">
              <p className="text-[10px] uppercase font-bold text-red-800 dark:text-red-300 tracking-wider">Red Disease Clusters</p>
              <p className="mt-1.5 text-2xl font-bold font-display text-red-700 dark:text-red-400">
                {zones.filter((z) => z.risk === "high").length} Zones
              </p>
              <p className="mt-0.5 text-[11px] text-red-800 dark:text-red-300 font-medium">Pattukkottai, Madukkur, Sethubava.</p>
            </div>
            <div className="rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5">
              <p className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">Mobile Health Fleet</p>
              <p className="mt-1.5 text-2xl font-bold font-display text-emerald-700 dark:text-emerald-400">
                {phcs.length} PHC Units
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">100% active field coverage</p>
            </div>
            <div className="rounded-md border border-border bg-surface-2/60 p-3.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Prediction Accuracy</p>
              <p className="mt-1.5 text-2xl font-bold font-display text-foreground">89.4%</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Retrained on 412 camp lab results</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Real-time Multi-stream Ingestion Audit Table */}
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-4">
              <div>
                <h2 className="label-eyebrow text-foreground">Multi-Stream Signal Ingestion Telemetry</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automated fusion of pharmacy sales, PoC devices, schools, and wastewater telemetry
                </p>
              </div>
<<<<<<< HEAD
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-semibold">
                Telemetry Active · 6 Streams
              </span>
=======

              {/* Status Filter Chips */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Status:</span>
                {[
                  { id: "all", label: "All Streams" },
                  { id: "Flagged High", label: "Flagged High" },
                  { id: "Corroborated", label: "Corroborated" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer border ${
                      statusFilter === chip.id
                        ? chip.id === "Flagged High"
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : chip.id === "Corroborated"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
>>>>>>> 4958c0ea201bdf4e8fd805d1c6e3e018cef0b7fc
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 uppercase tracking-wider text-[10px] text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="px-3.5 py-2.5">Stream ID</th>
                    <th className="px-3.5 py-2.5">Data Source</th>
                    <th className="px-3.5 py-2.5">Pincode</th>
                    <th className="px-3.5 py-2.5">Observed Anomaly</th>
                    <th className="px-3.5 py-2.5 text-right">Model Weight</th>
                    <th className="px-3.5 py-2.5">Latency</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {filteredStreams.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-3.5 py-3 font-mono text-muted-foreground font-medium">{s.id}</td>
                      <td className="px-3.5 py-3 font-semibold text-foreground">{s.source}</td>
                      <td className="px-3.5 py-3 text-muted-foreground font-mono">{s.pincode}</td>
                      <td className="px-3.5 py-3">
                        <span className="font-medium text-foreground">{s.indicator}</span>
                        <span className="ml-1.5 font-mono font-bold text-red-600 dark:text-red-400">{s.anomaly}</span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-bold text-foreground text-[11px] min-w-[32px] text-right">
                            {s.weight}%
                          </span>
                          <div className="h-1.5 w-16 rounded-full bg-surface-2 overflow-hidden border border-border/60">
                            <div
                              className={`h-full rounded-full transition-all ${
                                s.weight >= 85
                                  ? "bg-red-600 dark:bg-red-500"
                                  : s.weight >= 65
                                    ? "bg-amber-500"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${s.weight}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground font-mono">{s.time}</td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Column: RBAC & Infrastructure Health */}
          <div className="space-y-4">
            {/* Authorized Roles Directory */}
            <section className="panel p-4">
              <h2 className="label-eyebrow text-foreground mb-3">Role Directory & Access Control</h2>
              <ul className="space-y-2.5 text-xs">
                <li className="p-3 rounded-md border border-border bg-surface-2/60">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>District Health Officer</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">Active · 1 Officer</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Dr. A. Senthilkumar · Thanjavur District</p>
                </li>
                <li className="p-3 rounded-md border border-border bg-surface-2/60">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>Pharmacy Partners</span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">Active · 48 Stores</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Sri Sai Medical Store + 47 others</p>
                </li>
                <li className="p-3 rounded-md border border-border bg-surface-2/60">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>State Surveillance Admin</span>
                    <span className="text-primary text-[11px] font-bold">Super User</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">TN Directorate of Public Health</p>
                </li>
              </ul>
            </section>

            {/* System Diagnostics */}
            <section className="panel p-4">
              <h2 className="label-eyebrow text-foreground mb-3">System & Pipeline Diagnostics</h2>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <dt className="text-muted-foreground font-medium">Database Sync</dt>
                  <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {isSupabaseConfigured ? "Supabase Cloud (PostgreSQL)" : "Local In-Memory Cache"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <dt className="text-muted-foreground font-medium">ML Inference Latency</dt>
                  <dd className="font-mono text-foreground font-semibold">42 ms</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <dt className="text-muted-foreground font-medium">Next Model Retraining</dt>
                  <dd className="font-mono text-foreground font-semibold">Sunday, 00:00 UTC</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground font-medium">GIS Boundary Shapefile</dt>
                  <dd className="font-mono text-foreground font-semibold">Thanjavur District (613 xxx)</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
