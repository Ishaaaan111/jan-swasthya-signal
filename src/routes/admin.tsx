import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useZones, usePhcList } from "@/hooks/useSurveillanceData";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console · Jan Swasthya Signal Grid" },
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

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNav />

      <main className="mx-auto max-w-[1500px] px-5 py-6">
        {/* State Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary uppercase">
                State Surveillance Directorate
              </span>
              <span className="text-xs text-muted-foreground">Tamil Nadu Health Department</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold font-display">Super Admin Command Center</h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent flex items-center gap-1.5"
            >
              <span>🩺</span> Open DHO Map
            </Link>
            <Link
              to="/pharmacy"
              className="rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent flex items-center gap-1.5"
            >
              <span>💊</span> Open Pharmacy Portal
            </Link>
          </div>
        </div>

        {/* Panoramic KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="panel p-4">
            <p className="text-xs uppercase text-muted-foreground font-mono">Signals Ingested Today</p>
            <p className="mt-2 text-3xl font-bold font-display text-foreground">4,812</p>
            <p className="mt-1 text-[11px] text-safe font-medium">↑ +14% vs 7-day average</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs uppercase text-muted-foreground font-mono">Red Disease Clusters</p>
            <p className="mt-2 text-3xl font-bold font-display text-high">
              {zones.filter((z) => z.risk === "high").length} Zones
            </p>
            <p className="mt-1 text-[11px] text-high font-medium">Pattukkottai, Madukkur, Sethubava.</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs uppercase text-muted-foreground font-mono">Mobile Health Fleet</p>
            <p className="mt-2 text-3xl font-bold font-display text-safe">
              {phcs.length} PHC Units
            </p>
            <p className="mt-1 text-[11px] text-safe font-medium">100% active field coverage</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs uppercase text-muted-foreground font-mono">Prediction Accuracy</p>
            <p className="mt-2 text-3xl font-bold font-display text-primary">89.4%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Retrained on 412 camp lab results</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Real-time Multi-stream Ingestion Audit Table */}
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="label-eyebrow">Multi-Stream Signal Ingestion Stream</h2>
                <p className="text-xs text-muted-foreground">
                  Automated fusion of pharmacy sales, PoC devices, schools, and wastewater telemetry
                </p>
              </div>
              <span className="rounded-full border border-safe/50 bg-safe-soft px-2.5 py-1 text-[11px] text-safe animate-pulse">
                Telemetry Active · 6 Streams
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 uppercase tracking-wider text-[10px] text-muted-foreground font-mono">
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
                <tbody className="divide-y divide-border">
                  {recentSignalStreams.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="px-3.5 py-3 font-mono text-muted-foreground">{s.id}</td>
                      <td className="px-3.5 py-3 font-medium text-foreground">{s.source}</td>
                      <td className="px-3.5 py-3 text-muted-foreground">{s.pincode}</td>
                      <td className="px-3.5 py-3">
                        <span className="font-medium text-foreground">{s.indicator}</span>
                        <span className="ml-1.5 font-mono text-high">{s.anomaly}</span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-foreground">
                        {s.weight}%
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground font-mono">{s.time}</td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            s.status === "Flagged High"
                              ? "bg-high-soft text-high border border-high/50"
                              : "bg-safe-soft text-safe border border-safe/50"
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
              <h2 className="label-eyebrow mb-3">Role Directory & Access Tokens</h2>
              <ul className="space-y-2.5 text-xs">
                <li className="p-3 rounded-xl border border-border bg-surface-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>District Health Officer</span>
                    <span className="text-safe text-[11px]">Active · 1 Officer</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Dr. A. Senthilkumar · Thanjavur</p>
                </li>
                <li className="p-3 rounded-xl border border-border bg-surface-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Pharmacy Partners</span>
                    <span className="text-safe text-[11px]">Active · 48 Stores</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">Sri Sai Medical Store + 47 others</p>
                </li>
                <li className="p-3 rounded-xl border border-border bg-surface-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>State Surveillance Admin</span>
                    <span className="text-primary text-[11px]">Super User</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">TN Directorate of Public Health</p>
                </li>
              </ul>
            </section>

            {/* System Diagnostics */}
            <section className="panel p-4">
              <h2 className="label-eyebrow mb-3">System & Pipeline Diagnostics</h2>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Database Sync</dt>
                  <dd className="font-semibold text-safe">
                    {isSupabaseConfigured ? "Supabase Cloud (PostgreSQL)" : "Local In-Memory Cache"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ML Inference Latency</dt>
                  <dd className="font-mono text-foreground">42 ms</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Next Model Retraining</dt>
                  <dd className="font-mono text-foreground">Sunday, 00:00 UTC</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GIS Boundary Shp</dt>
                  <dd className="font-mono text-foreground">Thanjavur District (613 xxx)</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
