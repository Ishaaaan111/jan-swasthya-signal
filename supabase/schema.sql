-- ==============================================================================
-- Jan Swasthya Signal Grid - Supabase Database Schema
-- Disease surveillance, risk scoring, PHC resource routing & pharmacy signals
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ZONES (Surveillance Pincode Grid)
create table if not exists public.zones (
    id text primary key,
    name text not null,
    pincode text not null,
    disease text not null,
    risk text not null check (risk in ('high', 'watch', 'normal')),
    confidence integer not null check (confidence between 0 and 100),
    score integer not null check (score between 0 and 100),
    col integer not null,
    row integer not null,
    population text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ZONE SIGNALS (Multi-stream signals feeding the risk score)
create table if not exists public.zone_signals (
    id uuid default uuid_generate_v4() primary key,
    zone_id text references public.zones(id) on delete cascade not null,
    label text not null,
    delta text not null,
    weight integer not null check (weight between 0 and 100),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ALERT HISTORY (Past surveillance flags and field confirmation logs)
create table if not exists public.alert_history (
    id uuid default uuid_generate_v4() primary key,
    zone text not null,
    tag text not null,
    tone text not null check (tone in ('high', 'watch', 'normal')),
    note text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PRIMARY HEALTH CENTRES (PHCs & Mobile Camps)
create table if not exists public.phcs (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    km integer not null,
    status text not null check (status in ('available', 'partial', 'occupied')),
    assigned_zone_id text references public.zones(id) on delete set null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PHARMACY DAILY SALES (Syndromic early signal ingestion)
create table if not exists public.pharmacy_sales (
    id uuid default uuid_generate_v4() primary key,
    pharmacy_id text not null default 'PH-TN-2204',
    category text not null,
    qty integer not null default 0,
    delta integer not null default 0,
    report_date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PHARMACY SUBMISSIONS (Streak and audit log)
create table if not exists public.pharmacy_submissions (
    id uuid default uuid_generate_v4() primary key,
    pharmacy_id text not null default 'PH-TN-2204',
    day text not null,
    date_str text not null,
    state text not null check (state in ('done', 'missed', 'pending')),
    note text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Configuration
alter table public.zones enable row level security;
alter table public.zone_signals enable row level security;
alter table public.alert_history enable row level security;
alter table public.phcs enable row level security;
alter table public.pharmacy_sales enable row level security;
alter table public.pharmacy_submissions enable row level security;

-- Public Read & Write Policies (for demo & API access)
create policy "Allow public read on zones" on public.zones for select using (true);
create policy "Allow public update on zones" on public.zones for update using (true);

create policy "Allow public read on zone_signals" on public.zone_signals for select using (true);
create policy "Allow public read on alert_history" on public.alert_history for select using (true);

create policy "Allow public read on phcs" on public.phcs for select using (true);
create policy "Allow public update on phcs" on public.phcs for update using (true);

create policy "Allow public read on pharmacy_sales" on public.pharmacy_sales for select using (true);
create policy "Allow public insert on pharmacy_sales" on public.pharmacy_sales for insert with check (true);

create policy "Allow public read on pharmacy_submissions" on public.pharmacy_submissions for select using (true);
create policy "Allow public insert on pharmacy_submissions" on public.pharmacy_submissions for insert with check (true);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

insert into public.zones (id, name, pincode, disease, risk, confidence, score, col, row, population)
values
  ('pattukkottai', 'Pattukkottai', '614 601', 'Tuberculosis', 'high', 87, 91, 2, 5, '62,400'),
  ('madukkur', 'Madukkur', '614 903', 'Diabetes', 'high', 83, 84, 4, 2, '38,100'),
  ('sethubavachatram', 'Sethubavachatram', '614 713', 'Anemia', 'high', 79, 80, 6, 3, '27,800'),
  ('adirampattinam', 'Adirampattinam', '614 701', 'Anemia', 'watch', 64, 58, 5, 6, '44,200'),
  ('peravurani', 'Peravurani', '614 804', 'Diabetes', 'watch', 61, 55, 7, 5, '31,500'),
  ('papanasam', 'Papanasam', '614 205', 'No cluster detected', 'normal', 92, 14, 1, 2, '35,900'),
  ('kumbakonam', 'Kumbakonam', '612 001', 'No cluster detected', 'normal', 90, 19, 8, 2, '1,40,000')
on conflict (id) do nothing;

insert into public.zone_signals (zone_id, label, delta, weight)
values
  ('pattukkottai', 'Cough syrup + antibiotic sales', '+80%', 92),
  ('pattukkottai', 'School attendance dip', '-31%', 74),
  ('pattukkottai', 'ASHA fever logs', '+22 reports', 61),
  ('pattukkottai', 'Wastewater pathogen markers', 'elevated', 55),
  ('madukkur', 'Glucometer readings >180 mg/dL', '19 of 26', 88),
  ('madukkur', 'Antidiabetic sales', '+25%', 70),
  ('madukkur', 'Repeat pharmacy visits', '+14%', 48),
  ('sethubavachatram', 'Hemoglobin readings <9 g/dL', '23 of 40', 85),
  ('sethubavachatram', 'Iron / folic acid sales', '+41%', 66),
  ('sethubavachatram', 'Antenatal camp no-shows', '+18%', 40),
  ('adirampattinam', 'Hemoglobin readings <11 g/dL', '12 of 31', 62),
  ('adirampattinam', 'ORS / electrolyte sales', '+9%', 34),
  ('peravurani', 'Antidiabetic sales', '+17%', 58),
  ('peravurani', 'Glucometer readings >160 mg/dL', '9 of 22', 45),
  ('papanasam', 'All signal streams within baseline', 'stable', 12),
  ('kumbakonam', 'Post-camp follow-up clear', 'stable', 16);

insert into public.alert_history (zone, tag, tone, note)
values
  ('Orathanadu', 'Diabetes', 'high', 'Aug 14 · 38 cases confirmed'),
  ('Papanasam', 'TB suspected', 'watch', 'Aug 9 · Camp pending'),
  ('Kumbakonam', 'Anemia', 'high', 'Aug 3 · 21 cases confirmed'),
  ('Thiruvaiyaru', 'Low risk', 'normal', 'Jul 28 · No action needed');

insert into public.phcs (name, km, status)
values
  ('PHC Orathanadu', 12, 'available'),
  ('PHC Papanasam', 18, 'available'),
  ('PHC Budalur', 24, 'partial'),
  ('PHC Thiruvaiyaru', 31, 'occupied'),
  ('PHC Ammapettai', 38, 'available')
on conflict (name) do nothing;

insert into public.pharmacy_sales (category, qty, delta)
values
  ('Cough & cold', 48, 60),
  ('Fever / antipyretic', 35, 40),
  ('Antibiotic', 22, 0),
  ('Antidiabetic', 19, 25),
  ('Painkiller', 14, 5),
  ('Antihistamine', 11, -10),
  ('Cough syrup', 9, 80),
  ('ORS / electrolyte', 7, 2);

insert into public.pharmacy_submissions (day, date_str, state, note)
values
  ('Friday', 'Aug 21', 'pending', 'Today · pending'),
  ('Thursday', 'Aug 20', 'done', '32 entries'),
  ('Wednesday', 'Aug 19', 'done', '27 entries'),
  ('Tuesday', 'Aug 18', 'done', '41 entries'),
  ('Monday', 'Aug 17', 'missed', 'Missed'),
  ('Sunday', 'Aug 16', 'done', '19 entries'),
  ('Saturday', 'Aug 15', 'done', '38 entries');
