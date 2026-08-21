import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/lib/auth";
import { usePharmacyData, useSubmitPharmacySales } from "@/hooks/useSurveillanceData";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { title: "Pharmacy Portal · Jan Swasthya Signal Grid" },
      {
        name: "description",
        content:
          "Pharmacy owners review auto-imported daily medicine sales and submit them as early disease signals for their pincode.",
      },
      { property: "og:title", content: "Pharmacy Portal — Jan Swasthya Signal Grid" },
      {
        property: "og:description",
        content: "One-tap daily sales confirmation that feeds the district disease prediction model.",
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
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-[1500px] px-5 py-6">
        <div className="grid gap-4 lg:grid-cols-[290px_minmax(0,1fr)_300px]">
          <section className="panel p-4">
            <h2 className="label-eyebrow">Pharmacy profile</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                ["Owner name", "Rajan Krishnamurthy"],
                ["Pharmacy name", "Sri Sai Medical Store"],
                ["Pharmacy ID", "PH-TN-2204"],
                ["GST number", "33AABCS1429B1ZB"],
                ["District", "Thanjavur"],
                ["Pincode", "613 001"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 rounded-xl border border-watch/50 bg-watch-soft p-3 text-center">
              <p className="font-display text-3xl font-bold text-watch">12</p>
              <p className="text-[11px] text-muted-foreground">Day submission streak</p>
            </div>
          </section>

          <section className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="label-eyebrow">Today's medicine sales — auto imported</h2>
              <span className="rounded-full border border-safe/50 bg-safe-soft px-2.5 py-1 text-[11px] text-safe">
                Auto synced
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              CSV imported from billing system at 6:00 AM · 18 entries found
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Medicine category</th>
                    <th className="px-3 py-2 text-right font-medium">Qty sold</th>
                    <th className="px-3 py-2 text-right font-medium">vs last week</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRows.map((r, i) => (
                    <tr key={r.cat} className="border-t border-border">
                      <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2.5">{r.cat}</td>
                      <td className="px-3 py-2.5 text-right font-mono">{r.qty} units</td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono ${
                          r.delta >= 40 ? "text-high" : r.delta > 0 ? "text-watch" : "text-muted-foreground"
                        }`}
                      >
                        {r.delta > 0 ? "+" : ""}
                        {r.delta}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitted || submitSalesMutation.isPending}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitted
                ? "Submitted · signals sent to district grid"
                : submitSalesMutation.isPending
                  ? "Submitting..."
                  : "Confirm and submit today's data"}
            </button>
          </section>

          <section className="panel p-4">
            <h2 className="label-eyebrow">7-day submission log</h2>
            <ul className="mt-3 space-y-2.5">
              {submissionLog.map((d) => (
                <li
                  key={d.date}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{d.day}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {d.date} · {d.note}
                    </p>
                  </div>
                  <span
                    className={`size-2.5 rounded-full ${
                      d.state === "done" ? "bg-safe" : d.state === "missed" ? "bg-high" : "bg-watch"
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
