import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How the Signal Grid Works · Jan Swasthya" },
      {
        name: "description",
        content:
          "Five-step pipeline: collect weak signals, connect the dots with ML, alert the District Health Officer, deploy a mobile health van, and learn from confirmed diagnoses.",
      },
      { property: "og:title", content: "How the Jan Swasthya Signal Grid works" },
      {
        property: "og:description",
        content: "From pharmacy sales and glucometer readings to a rerouted health van in one week.",
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
    title: "Collect weak signals",
    body: "Pharmacy OTC sales, school attendance dips, cheap device readings (glucometer, hemoglobin) and wastewater pathogen markers — every record tagged to a pincode.",
    items: ["Pharmacy sales", "School attendance", "Device readings", "Wastewater data"],
  },
  {
    n: "02",
    title: "Connect the dots",
    body: "An ML model trained on years of district disease patterns fuses the streams and scores every pincode for cluster risk and likely disease.",
    items: ["Risk score per pincode", "Predicted disease", "Model confidence"],
  },
  {
    n: "03",
    title: "Alert the right person",
    body: "The District Health Officer opens the dashboard to a live map where flagged pincodes glow red, with the exact signals that caused the flag.",
    items: ["Red zone on map", "Explainable signals", "Weekly summary"],
  },
  {
    n: "04",
    title: "Send help there",
    body: "One click assigns the nearest available PHC and reroutes the mobile health van off its fixed monthly schedule to where people are actually getting sick.",
    items: ["Van rerouted", "Screening camp", "Diagnoses confirmed"],
  },
  {
    n: "05",
    title: "The system learns",
    body: "Confirmed camp diagnoses flow back in as labelled training data, so next week's prediction for that pincode — and similar ones — is sharper.",
    items: ["Results feed back", "Accuracy 84% → 89%"],
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <p className="label-eyebrow">Problem statement</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
          Mobile health vans follow a fixed schedule. Disease doesn't.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Every week a van goes to a village that doesn't need it, while 10 km away fifty people
          needed screening and nobody came. The Signal Grid connects the small everyday signals that
          already scream "something is wrong here" and turns them into a weekly deployment decision.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((s) => (
            <li key={s.n} className="panel p-5">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-2xl font-bold text-primary">{s.n}</span>
                <div>
                  <h2 className="text-lg font-semibold">{s.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.items.map((i) => (
                      <span
                        key={i}
                        className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground"
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

        <section className="panel mt-8 p-5">
          <h2 className="text-lg font-semibold">Who it is for</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>District Health Officers who decide where to send health vans.</li>
            <li>State and central health ministry analysts who need a district-wide picture.</li>
            <li>Rural citizens who are sick without knowing it.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
