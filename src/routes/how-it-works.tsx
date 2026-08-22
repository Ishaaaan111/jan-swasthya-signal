import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How the Signal Grid Works · Jan Swasthya" },
      {
        name: "description",
        content:
          "Five-step predictive health pipeline: collect weak signals, fuse with ML, alert the District Health Officer, deploy mobile health vans, and retrain on verified diagnoses.",
      },
      { property: "og:title", content: "How the Jan Swasthya Signal Grid works" },
      {
        property: "og:description",
        content: "From pharmacy sales and PoC glucometer readings to a rerouted health van in one week.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    n: "01",
    title: "Collect Weak Early Signals",
    body: "Pharmacy OTC sales, primary school attendance dips, point-of-care device readings (glucometers, hemoglobin meters), ASHA mobile fever logs, and wastewater pathogen markers — every record geotagged to a pincode.",
    items: ["Pharmacy Sales", "School Attendance", "PoC Diagnostics", "Wastewater Sentinel Labs"],
  },
  {
    n: "02",
    title: "Fuse Telemetry with Machine Learning",
    body: "An ML model trained on historical district disease patterns fuses the disparate streams, scoring every pincode for outbreak probability, risk severity, and likely disease condition.",
    items: ["Pincode Risk Score", "Predicted Condition", "Model Confidence Bar"],
  },
  {
    n: "03",
    title: "Alert the District Health Officer",
    body: "The District Health Officer opens the command portal to a live GIS map where flagged pincodes highlight in red with complete explainability of underlying signal weights.",
    items: ["Red Zone GIS Flag", "Signal Weight Analysis", "Weekly Decision Overview"],
  },
  {
    n: "04",
    title: "Dispatch Nearest Mobile Health Unit",
    body: "One click assigns the nearest available Primary Health Centre (PHC) and reroutes the mobile health van off its static monthly calendar to where people are actually getting sick.",
    items: ["Van Route Rerouted", "Field Screening Camp", "Confirmed Diagnoses"],
  },
  {
    n: "05",
    title: "Continuous Machine Learning Loop",
    body: "Confirmed field screening camp lab diagnoses flow back into the system as verified training labels, sharpening next week's predictions for that pincode and adjacent circles.",
    items: ["Lab Label Feedback", "Accuracy 84.0% → 89.4%"],
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-xs">
          <span className="rounded bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary uppercase border border-primary/20">
            Public Health Operational Architecture
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl font-bold font-display leading-tight text-foreground">
            Mobile health vans follow a static schedule. Disease doesn't.
          </h1>
          
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
            Every week mobile health vans visit villages based on fixed monthly calendars regardless of actual disease activity. Meanwhile 10 km away, fifty citizens develop early symptoms with zero screening. The <strong className="text-foreground">Jan Swasthya Signal Grid</strong> fuses everyday community health telemetry into actionable weekly van deployment decisions.
          </p>

          <ol className="mt-8 space-y-4">
            {steps.map((s) => (
              <li key={s.n} className="rounded-md border border-border bg-surface-2/60 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <span className="font-display text-xl sm:text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">
                    {s.n}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-foreground">{s.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.items.map((i) => (
                        <span
                          key={i}
                          className="rounded border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-xs"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <section className="mt-8 rounded-md border border-border bg-surface-2/80 p-5">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Stakeholder Value Matrix</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">District Health Officers:</strong> Data-driven mobile van dispatch replacing guesswork.
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">State Health Ministries:</strong> Real-time district-wide epidemiology telemetry.
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <strong className="text-foreground">Rural Citizens:</strong> Early screening and diagnosis before critical illness occurs.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
