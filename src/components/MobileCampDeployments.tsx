import React, { useState } from "react";
import { Truck, CheckCircle2, Clock, MapPin, Sparkles, FileCheck, Stethoscope, Users, RefreshCw } from "lucide-react";

export type MobileCamp = {
  id: string;
  zoneId: string;
  locationName: string;
  pincode: string;
  phcAssigned: string;
  vanNumber: string;
  doctorInCharge: string;
  scheduledDate: string;
  status: "SCHEDULED" | "EN_ROUTE" | "ACTIVE" | "COMPLETED";
  targetPopulation: number;
  patientsScreened: number;
  confirmedCases: number;
  confirmedDisease?: string;
  feedbackNotes?: string;
};

const initialCamps: MobileCamp[] = [
  {
    id: "camp-001",
    zoneId: "pattukkottai",
    locationName: "Pattukkottai Gram Panchayat Health Ground",
    pincode: "614 601",
    phcAssigned: "Pattukkottai West PHC",
    vanNumber: "TN-49-MHV-2041",
    doctorInCharge: "Dr. K. Swaminathan (MOIC)",
    scheduledDate: "2026-08-23",
    status: "ACTIVE",
    targetPopulation: 4500,
    patientsScreened: 142,
    confirmedCases: 28,
    confirmedDisease: "Tuberculosis",
    feedbackNotes: "28 patients flagged positive via sputum smear tests; DOTS treatment regimens initiated; mobile X-ray van active."
  },
  {
    id: "camp-002",
    zoneId: "madukkur",
    locationName: "Madukkur Primary School Health Hub",
    pincode: "614 903",
    phcAssigned: "Madukkur Central PHC",
    vanNumber: "TN-49-MHV-1088",
    doctorInCharge: "Dr. R. Anitha",
    scheduledDate: "2026-08-24",
    status: "EN_ROUTE",
    targetPopulation: 3800,
    patientsScreened: 0,
    confirmedCases: 0
  },
  {
    id: "camp-003",
    zoneId: "sethubavachatram",
    locationName: "Sethubavachatram Fisherfolk Community Hall",
    pincode: "614 802",
    phcAssigned: "Peravurani Block Hospital",
    vanNumber: "TN-49-MHV-3012",
    doctorInCharge: "Dr. V. Murugan",
    scheduledDate: "2026-08-21",
    status: "COMPLETED",
    targetPopulation: 5200,
    patientsScreened: 270,
    confirmedCases: 31,
    confirmedDisease: "Acute Diarrheal Disease",
    feedbackNotes: "Confirmed bacterial contamination in localized handpump line; 180 ORS sachets distributed; emergency chlorine dosing completed."
  }
];

export function MobileCampDeployments({
  additionalAssigned = {},
  onLogFeedback
}: {
  additionalAssigned?: Record<string, string>;
  onLogFeedback?: (camp: MobileCamp) => void;
}) {
  const [camps, setCamps] = useState<MobileCamp[]>(() => {
    const list = [...initialCamps];
    Object.entries(additionalAssigned).forEach(([zoneId, phcName], idx) => {
      if (!list.some(c => c.zoneId === zoneId)) {
        list.unshift({
          id: `camp-live-${idx}`,
          zoneId,
          locationName: `${zoneId.charAt(0).toUpperCase() + zoneId.slice(1)} Subcentre Camp`,
          pincode: "614 601",
          phcAssigned: phcName,
          vanNumber: `TN-49-MHV-${Math.floor(1000 + Math.random() * 9000)}`,
          doctorInCharge: "Dr. Arvind Sharma (MOIC)",
          scheduledDate: new Date().toISOString().split("T")[0],
          status: "SCHEDULED",
          targetPopulation: 3500,
          patientsScreened: 0,
          confirmedCases: 0
        });
      }
    });
    return list;
  });

  const [activeFeedbackModal, setActiveFeedbackModal] = useState<MobileCamp | null>(null);
  const [confirmedDisease, setConfirmedDisease] = useState("Tuberculosis");
  const [confirmedCases, setConfirmedCases] = useState(24);
  const [patientsScreened, setPatientsScreened] = useState(120);
  const [feedbackNotes, setFeedbackNotes] = useState("Field diagnosis confirmed via rapid diagnostics.");

  const handleUpdateStatus = (id: string, newStatus: MobileCamp["status"]) => {
    setCamps(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleOpenFeedback = (camp: MobileCamp) => {
    setActiveFeedbackModal(camp);
    if (camp.confirmedDisease) setConfirmedDisease(camp.confirmedDisease);
    if (camp.confirmedCases) setConfirmedCases(camp.confirmedCases);
    if (camp.patientsScreened) setPatientsScreened(camp.patientsScreened);
    if (camp.feedbackNotes) setFeedbackNotes(camp.feedbackNotes);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFeedbackModal) return;

    const updatedCamp: MobileCamp = {
      ...activeFeedbackModal,
      status: "COMPLETED",
      confirmedDisease,
      confirmedCases: Number(confirmedCases),
      patientsScreened: Number(patientsScreened),
      feedbackNotes
    };

    setCamps(prev =>
      prev.map(c => (c.id === activeFeedbackModal.id ? updatedCamp : c))
    );

    if (onLogFeedback) onLogFeedback(updatedCamp);
    setActiveFeedbackModal(null);
  };

  const statusBadge = (status: MobileCamp["status"]) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="size-3" /> Scheduled
          </span>
        );
      case "EN_ROUTE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <Truck className="size-3" /> En Route
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Stethoscope className="size-3" /> Active on Ground
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <CheckCircle2 className="size-3 text-emerald-600" /> Completed & Verified
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary border border-primary/20">
              Mobile Medical Fleet
            </span>
            <span className="text-xs text-muted-foreground">Thanjavur District Emergency Response</span>
          </div>
          <h2 className="mt-1 text-lg font-bold font-display text-foreground">
            Mobile Healthcare Camp Deployment & Field Unit Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track live dispatched vans, field doctor screenings, and feed verified ground-truth diagnoses back into the AI model.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground font-medium">
            Active Deployments: <strong className="text-foreground">{camps.filter(c => c.status !== "COMPLETED").length} Units</strong>
          </span>
        </div>
      </div>

      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {camps.map(camp => (
          <div
            key={camp.id}
            className={`rounded-lg border p-4.5 flex flex-col justify-between transition-all ${
              camp.status === "ACTIVE"
                ? "border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md"
                : "border-border bg-surface shadow-xs hover:border-primary/40"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-foreground">{camp.locationName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-red-500" /> Pincode <strong className="font-mono">{camp.pincode}</strong>
                  </p>
                </div>
                <div>{statusBadge(camp.status)}</div>
              </div>

              {/* Specs */}
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Van Reg:</span>
                  <span className="font-mono font-bold text-foreground">{camp.vanNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Facility:</span>
                  <span className="font-semibold text-foreground truncate max-w-[170px]">{camp.phcAssigned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medical Officer:</span>
                  <span className="font-medium text-foreground">{camp.doctorInCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Date:</span>
                  <span className="text-foreground">{camp.scheduledDate}</span>
                </div>
              </div>

              {/* Completed Ground Truth Results */}
              {camp.status === "COMPLETED" && (
                <div className="mt-3.5 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs">
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-200 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3.5" /> Confirmed Diagnosis:
                    </span>
                    <span className="font-mono">{camp.confirmedCases} Cases / {camp.patientsScreened} Screened</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold">{camp.confirmedDisease}</p>
                  {camp.feedbackNotes && (
                    <p className="text-muted-foreground text-[11px] mt-1 italic">"{camp.feedbackNotes}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              {camp.status === "SCHEDULED" && (
                <button
                  onClick={() => handleUpdateStatus(camp.id, "EN_ROUTE")}
                  className="w-full rounded-md bg-amber-600 hover:bg-amber-500 text-white py-1.5 text-xs font-bold transition shadow-xs"
                >
                  Dispatch Mobile Van (En Route)
                </button>
              )}

              {camp.status === "EN_ROUTE" && (
                <button
                  onClick={() => handleUpdateStatus(camp.id, "ACTIVE")}
                  className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 text-xs font-bold transition shadow-xs"
                >
                  Mark Active & Screening on Ground
                </button>
              )}

              {camp.status === "ACTIVE" && (
                <button
                  onClick={() => handleOpenFeedback(camp)}
                  className="w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FileCheck className="size-3.5" />
                  <span>Log Verified Diagnoses & Retrain Model</span>
                </button>
              )}

              {camp.status === "COMPLETED" && (
                <button
                  onClick={() => handleOpenFeedback(camp)}
                  className="w-full rounded-md border border-border bg-surface-2 hover:bg-surface-2/80 text-foreground py-1.5 text-xs font-semibold transition"
                >
                  Review Ground Truth Log
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Modal */}
      {activeFeedbackModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-5 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> Log Field Ground Truth & Retrain AI
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{activeFeedbackModal.locationName}</p>
              </div>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-primary text-[11px] leading-relaxed">
                💡 Submitting verified doctor diagnoses updates the training dataset and triggers incremental retraining for the Gradient Boosting model.
              </div>

              <div>
                <label className="block font-bold text-foreground uppercase tracking-wide mb-1">
                  Confirmed Primary Disease Cluster
                </label>
                <select
                  value={confirmedDisease}
                  onChange={e => setConfirmedDisease(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Tuberculosis">Tuberculosis Cluster</option>
                  <option value="Acute Diarrheal Disease">Acute Diarrheal Disease / Cholera</option>
                  <option value="Dengue Outbreak">Dengue Outbreak</option>
                  <option value="Diabetes">Diabetes / Glycemic Surge</option>
                  <option value="Viral Respiratory Illness">Viral Respiratory Illness / Influenza</option>
                  <option value="Normal / False Alarm">Normal / False Alarm (No Cluster Found)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground uppercase tracking-wide mb-1">
                    Confirmed Cases
                  </label>
                  <input
                    type="number"
                    value={confirmedCases}
                    onChange={e => setConfirmedCases(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground uppercase tracking-wide mb-1">
                    Total Screened
                  </label>
                  <input
                    type="number"
                    value={patientsScreened}
                    onChange={e => setPatientsScreened(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground uppercase tracking-wide mb-1">
                  Field Medical Notes & Interventions
                </label>
                <textarea
                  rows={3}
                  value={feedbackNotes}
                  onChange={e => setFeedbackNotes(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-foreground focus:outline-none focus:border-primary"
                  placeholder="Describe distributed medicines, rapid diagnostic tests, or quarantine measures..."
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFeedbackModal(null)}
                  className="px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="size-3.5" /> Submit & Trigger ML Retraining
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
