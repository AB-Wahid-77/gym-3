# IRONFORGE - Elite Gym Management System (Localized for Pakistan)

IRONFORGE is an enterprise-grade gym management application crafted for Pakistani fitness centers. Built with a bespoke gold-and-black aesthetic, full PKR currency integration, authentic Pakistani nutrition science, Express server-side architecture, and persistent Supabase PostgreSQL database storage.

---

## Architecture & Data Storage Migration

### 1. Supabase PostgreSQL Storage Backend
The application data storage has been migrated from browser `localStorage` to **Supabase PostgreSQL**.
- **Backend-Only Access**: All Supabase interactions occur strictly within `server.ts` using the service role key (`SUPABASE_SERVICE_ROLE_KEY`), bypassing Row Level Security (RLS) safely on the server.
- **Pure React Client**: The React client bundle contains zero Supabase SDK dependencies or API keys. It communicates exclusively with standard `/api/*` endpoints hosted by the Express backend.
- **Field Name Mapping**: The server handles mapping between PostgreSQL `snake_case` column definitions and the frontend TypeScript `camelCase` models seamlessly.

### 2. Database Tables Structure

The system persists data across five PostgreSQL tables:

1. **`members`**: Athlete registry
   - `id` (text, primary key)
   - `name`, `phone`, `age`, `gender`, `height`, `weight`
   - `goal`, `program`, `join_date`, `monthly_fee`, `notes`
   - `fee_status`, `next_due_date`, `last_payment_date`
   - `activity_level`, `injuries`

2. **`fee_payments`**: Membership billing ledger
   - `id` (text, primary key)
   - `receipt_number`, `member_id`, `member_name`, `member_phone`
   - `amount`, `date`, `due_date`, `status`, `payment_method`, `notes`

3. **`saved_plans`**: Workout and nutrition protocols
   - `id` (text, primary key)
   - `title`, `member_id`, `member_name`, `goal`, `generated_date`
   - `bmr`, `tdee`, `target_calories`, `days_per_week`, `split_name`
   - `food_preference`, `budget`, `injuries`, `visual_observations`
   - `is_ai_generated`, `is_manual`
   - `schedule` (jsonb), `nutrition` (jsonb), `tips` (jsonb)
   - `price`, `price_type`, `receipt` (jsonb), `receipt_id`, `photo_url`, `notes`

4. **`plan_receipts`**: Official branded coaching receipts
   - `id` (text, primary key)
   - `receipt_number`, `plan_id`, `plan_title`
   - `member_id`, `member_name`, `member_phone`
   - `date`, `amount`, `price_type`, `coverage_description`
   - `gym_name`, `gym_address`, `gym_phone`, `status`

5. **`general_plan_sales`**: Walk-in and member retail protocol receipts
   - `id` (text, primary key)
   - `receipt_number`, `plan_id`, `plan_title`, `member_id`, `member_name`, `member_phone`
   - `date`, `amount`, `price_type`, `coverage_description`
   - `gym_name`, `gym_address`, `gym_phone`, `status`

### 3. Real Supabase Admin Authentication
- **Endpoint**: `POST /api/auth/login` verifies real admin credentials via `supabase.auth.signInWithPassword()`.
- **JWT Protection**: All `/api/*` endpoints (except `/api/auth/login` and `/api/health`) require a valid Bearer token checked via `supabase.auth.getUser(token)`.
- **Token Storage**: The verified token is managed by `AuthContext` under `ironforge_session_token` and automatically included in all `gymService` API requests.
- **No Mock Credentials**: All hardcoded admin emails and mock passwords have been completely purged from frontend configs and UI components.

---

## Environment Variables & Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# Supabase Configuration (Server-side only, no VITE_ prefix)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Gemini 3.8 Flash AI Key (Workout & Nutrition plan generation)
GEMINI_API_KEY="your-gemini-api-key"

# App Port (defaults to 3000)
PORT=3000
```

### Installation & Run

```bash
# Install dependencies
npm install

# Start Express + Vite development server on port 3000
npm run dev

# Run TypeScript typecheck / linter
npm run lint

# Build production bundle (client + server.cjs)
npm run build

# Start production server
npm start
```
