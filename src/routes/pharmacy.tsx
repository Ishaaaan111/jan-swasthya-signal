import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/auth";
import { usePharmacyData, useSubmitPharmacySales } from "@/hooks/useSurveillanceData";
import { toast } from "sonner";

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

function Pharmacy() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const { data } = usePharmacyData();
  const salesRows = data?.sales ?? [];
  const submissionLog = data?.submissions ?? [];
  const submitSalesMutation = useSubmitPharmacySales();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    submitSalesMutation.mutate({ pharmacyId: "PH-TN-2204", entryCount: 18 });
    toast.success("Confirm & Transmit Successful", {
      description: "18 sales category summaries submitted to District Health Grid.",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
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

            <div className="mt-4 rounded-md border border-amber-200 dark:border-sky-800/60 bg-amber-50 dark:bg-sky-950/50 p-3.5 text-center shadow-xs">
              <p className="font-display text-3xl font-bold text-amber-800 dark:text-sky-300">12 Days</p>
              <p className="text-[11px] font-semibold text-amber-800 dark:text-sky-300 mt-0.5">Continuous Compliance Streak</p>

              {/* Milestone Badges & Gamification Progress */}
              <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-sky-800/40">
                <p className="text-[10px] uppercase font-bold text-amber-900/70 dark:text-sky-300/80 mb-2">
                  Streak Milestones
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10px]">
                  <span className="rounded-full bg-amber-200 dark:bg-sky-800 text-amber-900 dark:text-sky-100 px-2 py-0.5 font-bold border border-amber-300 dark:border-sky-600 shadow-2xs">
                    ✓ 7 Days
                  </span>
                  <span className="rounded-full bg-amber-100/50 dark:bg-sky-900/30 text-amber-800/60 dark:text-sky-300/60 px-2 py-0.5 font-semibold border border-amber-200/50 dark:border-sky-800/40">
                    30 Days
                  </span>
                  <span className="rounded-full bg-amber-100/30 dark:bg-sky-900/20 text-amber-800/40 dark:text-sky-300/40 px-2 py-0.5 font-semibold border border-amber-200/30 dark:border-sky-800/20">
                    90 Days
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] text-amber-800/80 dark:text-sky-300/80 font-mono">
                    <span>Target: 30 Days</span>
                    <span>12 / 30 (40%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-amber-200/60 dark:bg-sky-900/60 overflow-hidden">
                    <div className="h-full bg-amber-600 dark:bg-sky-400 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Center Column: Daily OTC Sales Telemetry */}
          <section className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
              <div>
                <h2 className="label-eyebrow text-foreground">Today's OTC Medicine Sales — Auto Synced</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Imported from billing POS at 6:00 AM • 18 Category Summaries
                </p>
              </div>
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-semibold">
                ✓ POS Auto Synced
              </span>
            </div>

            <div className="overflow-hidden rounded-md border border-border mt-3">
              <table className="w-full text-xs">
                <thead className="bg-surface-2 text-left text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-3.5 py-2.5">#</th>
                    <th className="px-3.5 py-2.5">Medicine Category</th>
                    <th className="px-3.5 py-2.5 text-right">Units Sold</th>
                    <th className="px-3.5 py-2.5 text-right">vs 7-Day Baseline &amp; Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {salesRows.map((r, i) => (
                    <tr key={r.cat} className="hover:bg-surface-2/60 transition-colors">
                      <td className="px-3.5 py-2.5 text-muted-foreground font-mono font-medium">{i + 1}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-foreground">{r.cat}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-foreground">{r.qty} units</td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold">
                        <span
                          className={`${
                            r.delta >= 40
                              ? "text-red-600 dark:text-red-400"
                              : r.delta > 0
                                ? "text-amber-600 dark:text-sky-300"
                                : "text-muted-foreground"
                          }`}
                        >
                          {r.delta > 0 ? "+" : ""}
                          {r.delta}%
                        </span>
                        <PharmacySparkline delta={r.delta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitted || submitSalesMutation.isPending}
              className="mt-4 w-full rounded-md bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitted
                ? "✓ Submitted • Telemetry Sent to District Grid"
                : submitSalesMutation.isPending
                  ? "Transmitting Data..."
                  : "Confirm & Transmit Today's Sales Telemetry"}
            </button>
          </section>

          {/* Right Column: 7-Day Audit Log */}
          <section className="panel p-4">
            <div className="border-b border-border pb-3 mb-3">
              <h2 className="label-eyebrow text-foreground">7-Day Transmission Audit Log</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verification status of daily telemetry</p>
            </div>

            <ul className="space-y-2.5">
              {submissionLog.map((d) => (
                <li
                  key={d.date}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-2/60 px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{d.day}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {d.date} • {d.note}
                    </p>
                  </div>
                  <span
                    className={`size-2.5 rounded-full ${
                      d.state === "done" ? "bg-emerald-500" : d.state === "missed" ? "bg-red-500" : "bg-amber-500 dark:bg-sky-400"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function PharmacySparkline({ delta }: { delta: number }) {
  const isHigh = delta >= 40;
  const isPositive = delta > 0;
  const strokeColor = isHigh
    ? "stroke-red-600 dark:stroke-red-400"
    : isPositive
      ? "stroke-amber-600 dark:stroke-sky-300"
      : "stroke-emerald-600 dark:stroke-emerald-400";

  const points = isHigh
    ? [12, 18, 26, 45]
    : isPositive
      ? [15, 14, 20, 28]
      : [25, 20, 18, 12];

  const width = 36;
  const height = 14;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pts = points
    .map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block opacity-85 ml-2">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeColor}
        points={pts}
      />
    </svg>
  );
}
