import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  supabase,
  isSupabaseConfigured,
  type ZoneRow,
  type SignalRow,
  type AlertHistoryRow,
  type PhcRow,
  type PharmacySaleRow,
  type PharmacySubmissionRow,
} from "@/lib/supabase";
import {
  zones as fallbackZones,
  alertHistory as fallbackAlertHistory,
  phcs as fallbackPhcs,
  salesRows as fallbackSalesRows,
  submissionLog as fallbackSubmissionLog,
  type Zone,
} from "@/lib/grid-data";

// In-memory state for offline/demo assignments
const localAssignedState: Record<string, string> = {};

// 1. Fetch Zones & Multi-stream signals
export function useZones() {
  return useQuery({
    queryKey: ["zones"],
    queryFn: async (): Promise<Zone[]> => {
      if (!isSupabaseConfigured) {
        return fallbackZones;
      }

      try {
        const { data: rawZones, error: zonesError } = await supabase
          .from("zones")
          .select("*")
          .order("score", { ascending: false });

        if (zonesError || !rawZones || rawZones.length === 0) {
          console.warn("Supabase zones query returned error or empty, using local seed:", zonesError);
          return fallbackZones;
        }

        const zonesData = rawZones as unknown as ZoneRow[];
        const { data: rawSignals } = await supabase.from("zone_signals").select("*");
        const signalsData = (rawSignals || []) as unknown as SignalRow[];

        const mergedZones: Zone[] = zonesData.map((z) => {
          const matchingSignals = signalsData
            .filter((s) => s.zone_id === z.id)
            .map((s) => ({ label: s.label, delta: s.delta, weight: s.weight }));

          const fallbackMatch = fallbackZones.find((fz) => fz.id === z.id);
          const signals =
            matchingSignals.length > 0
              ? matchingSignals
              : fallbackMatch?.signals || [];

          return {
            id: z.id,
            name: z.name,
            pincode: z.pincode,
            disease: z.disease,
            risk: z.risk,
            confidence: z.confidence,
            score: z.score,
            col: z.col,
            row: z.row,
            lat: z.lat ?? fallbackMatch?.lat ?? 10.65,
            lng: z.lng ?? fallbackMatch?.lng ?? 79.28,
            population: z.population,
            signals,
          };
        });

        return mergedZones;
      } catch (err) {
        console.error("Failed to fetch zones from Supabase:", err);
        return fallbackZones;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 2. Fetch Alert History
export function useAlertHistory() {
  return useQuery({
    queryKey: ["alert_history"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return fallbackAlertHistory;
      }

      try {
        const { data: rawData, error } = await supabase
          .from("alert_history")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !rawData || rawData.length === 0) {
          return fallbackAlertHistory;
        }

        const data = rawData as unknown as AlertHistoryRow[];
        return data.map((a) => ({
          zone: a.zone,
          tag: a.tag,
          tone: a.tone,
          note: a.note,
        }));
      } catch (err) {
        console.error("Failed to fetch alert history from Supabase:", err);
        return fallbackAlertHistory;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 3. Fetch PHCs & Camp Status
export function usePhcList() {
  return useQuery({
    queryKey: ["phcs"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return fallbackPhcs.map((p) => ({
          name: p.name,
          km: p.km,
          status: p.status,
          lat: p.lat,
          lng: p.lng,
          assignedZone: localAssignedState[p.name] || null,
        }));
      }

      try {
        const { data: rawData, error } = await supabase
          .from("phcs")
          .select("*")
          .order("km", { ascending: true });

        if (error || !rawData || rawData.length === 0) {
          return fallbackPhcs.map((p) => ({
            name: p.name,
            km: p.km,
            status: p.status,
            lat: p.lat,
            lng: p.lng,
            assignedZone: localAssignedState[p.name] || null,
          }));
        }

        const data = rawData as unknown as PhcRow[];
        return data.map((p) => {
          const fallbackPhc = fallbackPhcs.find((fp) => fp.name === p.name);
          return {
            name: p.name,
            km: p.km,
            status: p.status,
            lat: p.lat ?? fallbackPhc?.lat ?? 10.65,
            lng: p.lng ?? fallbackPhc?.lng ?? 79.28,
            assignedZone: p.assigned_zone_id || null,
          };
        });
      } catch (err) {
        console.error("Failed to fetch PHCs from Supabase:", err);
        return fallbackPhcs.map((p) => ({
          name: p.name,
          km: p.km,
          status: p.status,
          lat: p.lat,
          lng: p.lng,
          assignedZone: localAssignedState[p.name] || null,
        }));
      }
    },
  });
}

// 4. Assign PHC Camp Mutation
export function useAssignCamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ zoneId, phcName }: { zoneId: string; phcName: string }) => {
      localAssignedState[zoneId] = phcName;
      localAssignedState[phcName] = zoneId;

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("phcs")
          .update({ assigned_zone_id: zoneId, status: "occupied" } as never)
          .eq("name", phcName);

        if (error) {
          console.error("Supabase camp assignment update failed:", error);
        }
      }

      return { zoneId, phcName };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phcs"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}

// 5. Fetch Pharmacy Sales & Submission Logs
export function usePharmacyData() {
  return useQuery({
    queryKey: ["pharmacy_data"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return {
          sales: fallbackSalesRows,
          submissions: fallbackSubmissionLog,
        };
      }

      try {
        const [{ data: rawSales }, { data: rawSubs }] = await Promise.all([
          supabase.from("pharmacy_sales").select("*"),
          supabase.from("pharmacy_submissions").select("*").order("created_at", { ascending: false }),
        ]);

        const salesData = rawSales as unknown as PharmacySaleRow[] | null;
        const subsData = rawSubs as unknown as PharmacySubmissionRow[] | null;

        return {
          sales:
            salesData && salesData.length > 0
              ? salesData.map((s) => ({ cat: s.category, qty: s.qty, delta: s.delta }))
              : fallbackSalesRows,
          submissions:
            subsData && subsData.length > 0
              ? subsData.map((s) => ({
                  day: s.day,
                  date: s.date_str,
                  state: s.state,
                  note: s.note,
                }))
              : fallbackSubmissionLog,
        };
      } catch (err) {
        console.error("Failed to fetch pharmacy data from Supabase:", err);
        return {
          sales: fallbackSalesRows,
          submissions: fallbackSubmissionLog,
        };
      }
    },
  });
}

// 6. Submit Pharmacy Sales Confirmation Mutation
export function useSubmitPharmacySales() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pharmacyId = "PH-TN-2204",
      entryCount = 18,
    }: {
      pharmacyId?: string;
      entryCount?: number;
    }) => {
      if (isSupabaseConfigured) {
        const today = new Date();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        await supabase.from("pharmacy_submissions").insert({
          pharmacy_id: pharmacyId,
          day: dayNames[today.getDay()] as string,
          date_str: `${monthNames[today.getMonth()]} ${today.getDate()}`,
          state: "done",
          note: `${entryCount} entries confirmed`,
        } as never);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_data"] });
    },
  });
}
