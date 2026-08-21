import { useMemo, useState, useEffect } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { DistrictMap } from "@/components/DistrictMap";
import { useAuth } from "@/lib/auth";
import { useZones, useAlertHistory, usePhcList, useAssignCamp } from "@/hooks/useSurveillanceData";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { RiskLevel } from "@/lib/grid-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DHO Dashboard · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content:
          "Weekly predictive disease cluster map for district health officers — pharmacy, device, school and wastewater signals fused into one risk score per pincode.",
      },
      { property: "og:title", content: "Jan Swasthya Signal Grid — DHO Dashboard" },
      {
        property: "og:description",
        content:
          "Predict where disease is clustering each week and reroute mobile health vans before people get critically ill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const toneClass = {
  high: "border-high/60 bg-high-soft text-high",
  watch: "border-watch/60 bg-watch-soft text-watch",
  normal: "border-safe/50 bg-safe-soft text-safe",
} as const;

const dotClass = {
  available: "bg-safe",
  partial: "bg-watch",
  occupied: "bg-high",
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
    }),
    [zones],
  );

  const handleAssignCamp = (zoneId: string, phcName: string) => {
    setAssigned((prev) => ({ ...prev, [zoneId]: phcName }));
    assignCampMutation.mutate({ zoneId, phcName });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNav />

      <main className="mx-auto max-w-[1500px] px-5 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Week of 17–23 August 2026</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {counts.high} pincodes crossed the cluster threshold. Model retrained on last week's
              confirmed camp diagnoses.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                isSupabaseConfigured
                  ? "border-safe/50 bg-safe-soft text-safe"
                  : "border-watch/50 bg-watch-soft text-watch"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isSupabaseConfigured ? "bg-safe animate-pulse" : "bg-watch"
                }`}
              />
              {isSupabaseConfigured ? "Supabase Live DB" : "Local Database Mode"}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
              Signals ingested today · <span className="text-foreground">4,812</span>
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)_300px]">
          {/* Alert history */}
          <section className="panel p-4">
            <h2 className="label-eyebrow">Alert history</h2>
            <ul className="mt-3 space-y-2.5">
              {alertHistory.map((a) => (
                <li key={a.zone} className="rounded-xl border border-border bg-surface-2 p-3">
                  <p className="font-display text-sm font-semibold">{a.zone}</p>
                  <span
                    className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClass[a.tone as keyof typeof toneClass] || toneClass.normal}`}
                  >
                    {a.tag}
                  </span>
                  <p className="mt-1.5 text-xs text-muted-foreground">{a.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Map */}
          <section className="panel relative overflow-hidden p-4">
            <div className="flex items-center justify-between">
              <h2 className="label-eyebrow">District GIS Risk Map — Thanjavur</h2>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <Legend color="bg-high" label="High" />
                <Legend color="bg-watch" label="Watch" />
                <Legend color="bg-safe" label="Normal" />
                <span className="inline-flex items-center gap-1">
                  <span className="text-blue-400">🏥</span> PHC
                </span>
              </div>
            </div>

            <div className="relative mt-3">
              <DistrictMap
                zones={zones}
                phcs={phcs}
                selectedId={selectedId}
                onSelectZone={(id) => setSelectedId(id)}
              />

              {selected && (
                <aside className="absolute inset-y-3 right-3 z-[500] w-[290px] overflow-y-auto rounded-xl border border-border bg-popover/95 backdrop-blur-md p-4 shadow-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-bold">{selected.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Pincode {selected.pincode} · pop. {selected.population}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      aria-label="Close panel"
                      className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    <Row k="Predicted" v={selected.disease} />
                    <Row
                      k="Risk score"
                      v={`${selected.score}/100`}
                      accent={selected.risk === "high"}
                    />
                    <Row k="Confidence" v={`${selected.confidence}%`} />
                  </dl>

                  <p className="label-eyebrow mt-5">Why it was flagged</p>
                  <ul className="mt-2 space-y-2.5">
                    {selected.signals.map((s) => (
                      <li key={s.label}>
                        <div className="flex justify-between gap-2 text-xs">
                          <span className="text-foreground">{s.label}</span>
                          <span className="font-mono text-muted-foreground">{s.delta}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                          <div
                            className={`h-full rounded-full ${selected.risk === "high" ? "bg-high" : selected.risk === "watch" ? "bg-watch" : "bg-safe"}`}
                            style={{ width: `${s.weight}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {selected.risk !== "normal" && (
                    <div className="mt-5">
                      {assigned[selected.id] ? (
                        <p className="rounded-xl border border-safe/50 bg-safe-soft px-3 py-2.5 text-xs text-safe">
                          Camp assigned to {assigned[selected.id]} · van rerouted for this week
                        </p>
                      ) : (
                        <>
                          <p className="label-eyebrow">Assign nearest PHC camp</p>
                          <div className="mt-2 space-y-1.5">
                            {phcs
                              .filter((p) => p.status !== "occupied")
                              .slice(0, 3)
                              .map((p) => (
                                <button
                                  key={p.name}
                                  onClick={() => handleAssignCamp(selected.id, p.name)}
                                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs transition-colors hover:border-ring hover:bg-accent"
                                >
                                  <span>{p.name}</span>
                                  <span className="text-muted-foreground">{p.km} km</span>
                                </button>
                              ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </aside>
              )}
            </div>
          </section>

          {/* Right column */}
          <div className="space-y-4">
            <section className="panel p-4">
              <h2 className="label-eyebrow">This week</h2>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat value={String(counts.high)} label="Red zones" cls="text-high" />
                <Stat value={String(counts.watch)} label="Watch zones" cls="text-watch" />
                <Stat
                  value={String(Object.keys(assigned).length + 5)}
                  label="Camps"
                  cls="text-safe"
                />
                <Stat value="89%" label="Accuracy" cls="text-foreground" />
              </div>
            </section>

            <section className="panel p-4">
              <h2 className="label-eyebrow">PHC availability</h2>
              <ul className="mt-3 space-y-3">
                {phcs.map((p) => (
                  <li key={p.name} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.km} km</p>
                    </div>
                    <span className={`size-2.5 rounded-full ${dotClass[p.status]}`} />
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <Legend color="bg-safe" label="Available" />
                <Legend color="bg-watch" label="Partial" />
                <Legend color="bg-high" label="Occupied" />
              </div>
            </section>

            <section className="panel p-4">
              <h2 className="label-eyebrow">Feedback loop</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Last cycle 5 camps screened 412 people and confirmed 59 cases. Those diagnoses were
                pushed back as training labels — prediction accuracy moved from 84% to 89%.
              </p>
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
      {label}
    </span>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`font-medium ${accent ? "text-high" : "text-foreground"}`}>{v}</dd>
    </div>
  );
}

function Stat({ value, label, cls }: { value: string; label: string; cls: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 text-center">
      <p className={`font-display text-2xl font-bold ${cls}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
