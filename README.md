# HealthCoverSim — Private Health Insurance Quote Simulator

HealthCoverSim is a full-stack web application built for La Trobe University's CSE3CWA Assessment 1. It simulates Australian private health insurance premium pricing with Lifetime Health Cover (LHC) loading, family fees, and annual payment discounts.

## 1. How to Install and Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Step-by-Step Execution

1. **Start the Express Backend:**
bash
cd backend
npm install
npm start

The backend server runs on `http://localhost:5001`. SQLite will automatically create `quotes.db` on first start.

2. **Start the React Frontend:**
Open a new terminal window:
bash
cd frontend
npm install
npm run dev

Open your browser and navigate to `http://localhost:5173`.

---

## 2. Database Initialization
The database uses **SQLite**. It is automatically initialized via `backend/db.js` on startup. If `quotes.db` does not exist, the script creates the table `quotes` with the following schema:
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `customer_name` (TEXT)
- `cover_type` (TEXT: Single, Couple, Family)
- `applicant1_age` (INTEGER), `applicant1_cover_history` (TEXT)
- `applicant2_age` (INTEGER, nullable), `applicant2_cover_history` (TEXT, nullable)
- `hospital_cover` (TEXT), `extras_cover` (TEXT)
- `payment_frequency` (TEXT), `annual_discount` (REAL)
- `notes` (TEXT), `created_at` (DATETIME)

---

## 3. Quote Calculation & Pricing Logic
- **Hospital Cover Base (per adult/month):** None ($0), Basic ($90), Bronze ($120), Silver ($160), Gold ($220).
- **Extras Cover Base (per adult/month):** None ($0), Basic ($25), Standard ($45), Premium ($70).
- **Lifetime Health Cover (LHC) Loading:**
- Applies **only to hospital cover**, never extras.
- Previous cover = Yes: 0% loading.
- Previous cover = No: If age > 30, loading = `(age - 30) * 2%`.
- Previous cover = Not sure: 0% loading applied, but a warning is flagged.
- Hospital tier = None: 0% loading.
- **Family Cover:** Automatically adds a flat **$30/month upgrade fee** to cover dependent children under one policy.
- **Annual Discount:** Applied strictly when payment frequency is **Yearly** (`monthly_premium * 12 * (1 - discount%)`).

---

## 4. AI-Use Statement
- **AI Tool Used:** Gemini.
- **What it helped with:** Providing starter boilerplate structure, standard Express CRUD routing setup, and checking edge case validation.
- **What I personally implemented / checked:** Verified the calculation logic against Section 7 of the specification ($472/month, $5,664 yearly before discount, $5,380.80 yearly after 5% discount), structured the conditional rendering for Applicant 2, and ensured backend validation returns 400 Bad Request instead of 500 crashes.
- **Decision made myself:** Centralized all calculation mathematics into a separate module (`backend/calculation.js`) so the calculation logic remains reusable between GET listings and single quote detail sheets.

---

## 5. Simulator Limitations
In real-world Australian health insurance:
- LHC loading is capped at a maximum of 70% and resets to 0% after 10 continuous years of holding hospital cover. This simulator simplifies this rule by not capping or resetting the loading over time.