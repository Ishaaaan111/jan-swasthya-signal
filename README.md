# Jan Swasthya Signal Grid

Predictive Disease Cluster Detection and Health Care Camp System for District Health Officers.


## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Database Setup (Supabase)

This project integrates with **Supabase** for storing disease surveillance signals, risk zones, PHC camp allocations, and pharmacy sales data.

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Run Database Migrations
Go to your Supabase SQL Editor and execute the script in [`supabase/schema.sql`](./supabase/schema.sql).

This will create:
- `zones`: Surveillance grid pincodes and risk levels (`high`, `watch`, `normal`)
- `zone_signals`: Multi-stream early signals (pharmacy spikes, school dips, wastewater pathogen markers)
- `alert_history`: Historical outbreak logs
- `phcs`: Primary Health Centres and camp assignment tracking
- `pharmacy_sales`: Daily syndicated medicine sales
- `pharmacy_submissions`: Daily audit and streak logging
- Pre-populated seed dataset & Row Level Security (RLS) policies

*Note: If no Supabase credentials are provided, the application will automatically fall back to local seed data.*

