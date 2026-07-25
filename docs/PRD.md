# PRD — MedVault

## 1. Problem
People visit doctors, take tests, and collect paper reports — then lose or forget them. At the next visit they can't show their history, so tests get repeated (wasting time and money) and doctors treat them without knowing past results or trends. Almost everyone has this problem.

## 2. Goal
Give each person a single, secure, searchable, lifelong home for their medical reports, where the important data is automatically extracted from a photo — so their full history is always in their pocket and shareable with any doctor.

## 3. Users & stakeholders
- **Patient (primary user):** uploads reports, views and searches their history.
- **Doctor / clinic:** views a patient's history to make better decisions.
- **Hospitals / labs:** potential future partners that push results directly (out of MVP scope).
- **Caregivers / family:** manage records for children or elderly relatives (future).

## 4. Scope

### In scope (this hackathon)
- Account sign-up / login; per-user data isolation.
- Upload a report image (JPG/PNG); store the original.
- AI extraction of structured data from the report.
- View a list of reports and a detail view of each.
- Search across extracted data.

### Out of scope (mention as vision, don't build fully)
- Real hospital integrations / automatic data push (simulate with a mock button only).
- Multi-user family accounts / sharing links.
- PDF and multi-page handling (optional stretch; images first).
- Any clinical decision-making. MedVault stores and organizes; it does not diagnose.

## 5. Features & priorities
Priority key: **P0** = must have for the demo, **P1** = strong bonus, **P2** = stretch.

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Sign up / log in; user sees only their own records | P0 |
| F2 | Upload a report image; store original file | P0 |
| F3 | AI extraction → structured JSON (type, date, doctor, results, summary) | P0 |
| F4 | Save extracted data linked to the user | P0 |
| F5 | Records list (newest first: type, date, summary) | P0 |
| F6 | Record detail view (original image + extracted table) | P0 |
| F7 | Search across extracted data | P0 |
| F8 | Trends chart for a repeated test value over time | P1 |
| F9 | "Simulate report from Partner Hospital" mock-import button | P1 |
| F10 | PDF upload support | P2 |
| F11 | Delete / edit a record | P2 |

## 6. User stories (P0)
- As a user, I can create an account and log in, so my records are private to me.
- As a user, I can upload a photo of a report, so it's saved and I never lose it.
- As a user, after uploading, I see the data pulled out of the report automatically, so I don't type anything.
- As a user, I can browse all my past reports in one place.
- As a user, I can open a report to see the original image next to its extracted data.
- As a user, I can search (e.g. "blood sugar") and find every report that mentions it.

## 7. Success criteria (for judging)
- Live demo: upload a real/sample report → data is extracted and displayed → search finds it.
- Deployed public URL works.
- The "wow" moment (F9 mock hospital import, or F8 trend chart) lands.
- Privacy is addressed: login required, data isolated per user, sensible storage.

## 8. Constraints
- **Budget: $0.** Use only free tiers (Gemini free API, Supabase free, Vercel free).
- **Time: hackathon deadline.** Favor the simplest thing that works in a demo.
- **Safety framing:** MedVault is not a medical device and does not give medical advice; it organizes records. State this in the app footer and pitch.
