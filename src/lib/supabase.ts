import { createClient } from "@supabase/supabase-js";
import type { RiskLevel } from "./grid-data";

export type ZoneRow = {
  id: string;
  name: string;
  pincode: string;
  disease: string;
  risk: RiskLevel;
  confidence: number;
  score: number;
  col: number;
  row: number;
  lat?: number;
  lng?: number;
  population: string;
  created_at?: string;
  updated_at?: string;
};

export type SignalRow = {
  id?: string;
  zone_id: string;
  label: string;
  delta: string;
  weight: number;
};

export type AlertHistoryRow = {
  id?: string;
  zone: string;
  tag: string;
  tone: RiskLevel;
  note: string;
  created_at?: string;
};

export type PhcRow = {
  id?: string;
  name: string;
  km: number;
  status: "available" | "partial" | "occupied";
  lat?: number;
  lng?: number;
  assigned_zone_id?: string | null;
  updated_at?: string;
};

export type PharmacySaleRow = {
  id?: string;
  pharmacy_id: string;
  category: string;
  qty: number;
  delta: number;
  report_date?: string;
};

export type PharmacySubmissionRow = {
  id?: string;
  pharmacy_id: string;
  day: string;
  date_str: string;
  state: "done" | "missed" | "pending";
  note: string;
};

export type Database = {
  public: {
    Tables: {
      zones: {
        Row: ZoneRow;
        Insert: ZoneRow;
        Update: Partial<ZoneRow>;
      };
      zone_signals: {
        Row: SignalRow;
        Insert: SignalRow;
        Update: Partial<SignalRow>;
      };
      alert_history: {
        Row: AlertHistoryRow;
        Insert: AlertHistoryRow;
        Update: Partial<AlertHistoryRow>;
      };
      phcs: {
        Row: PhcRow;
        Insert: PhcRow;
        Update: Partial<PhcRow>;
      };
      pharmacy_sales: {
        Row: PharmacySaleRow;
        Insert: PharmacySaleRow;
        Update: Partial<PharmacySaleRow>;
      };
      pharmacy_submissions: {
        Row: PharmacySubmissionRow;
        Insert: PharmacySubmissionRow;
        Update: Partial<PharmacySubmissionRow>;
      };
    };
  };
};

const supabaseUrl = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || "";
const supabaseAnonKey = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-ref") &&
    !supabaseAnonKey.includes("your-anon-key"),
);

// Fallback client to prevent runtime exceptions when credentials are unconfigured
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key",
);
