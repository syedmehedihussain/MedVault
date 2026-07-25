# Decision Log — MedVault

Short records of the major choices and *why*, so the agent (and judges) understand the reasoning and don't accidentally undo them.

---

## D1 — Use Google Gemini Flash (free) for extraction
**Context:** Need an AI that reads report images and returns structured data, at $0.
**Decision:** Use Gemini Flash via the free Google AI Studio API.
**Why:** Free tier, no credit card, multimodal (reads images/PDFs), easy key setup, deploys fine on Vercel.
**Alternatives considered:** Anthropic/OpenAI (capable but paid); MedGemma (medical-specialized, see D2).

---

## D2 — Prototype with a general model, not a medical-specific one
**Context:** Medical-specific models exist (e.g. Google MedGemma).
**Decision:** Use a general model (Gemini) for the MVP; name MedGemma as the production upgrade path in the pitch.
**Why:** A medical report is text + numbers on a page; a general vision model reads it well. MedGemma is open-weight but must be self-hosted (GPU / Vertex AI), which is too much setup for a hackathon and won't deploy to Vercel simply. Framing MedGemma as the roadmap is a stronger pitch than burning time hosting it.
**Note:** MedGemma is not an approved medical device; state this framing in the pitch.

---

## D3 — Next.js + Vercel
**Context:** Need frontend, backend, and a live URL fast.
**Decision:** Next.js (App Router) deployed on Vercel.
**Why:** One framework for UI + API routes; one-click free deploy; gives the required public live link.

---

## D4 — Supabase for auth + database + storage
**Context:** Need user accounts, a database, and file storage — all free — with minimal setup.
**Decision:** Use Supabase for all three.
**Why:** Bundles the three hardest pieces into one free service. Importantly, **SQLite does not persist on Vercel's serverless filesystem**, so a hosted DB is required anyway; Supabase's Postgres solves that and adds auth + storage for free. Row Level Security gives per-user data isolation with almost no code.
**Alternatives:** SQLite (won't persist on Vercel); separate auth (Clerk) + DB (Neon) + storage (S3) — more moving parts.

---

## D5 — Store extracted results as JSON, not a separate table
**Context:** Each report has a variable list of test results.
**Decision:** Store results in a `jsonb` column on `reports`.
**Why:** Simpler schema, fewer joins, fast enough for a hackathon. A normalized results table can come later if trends/analytics grow.

---

## D6 — Extraction must never block or crash upload
**Context:** AI responses can be malformed, slow, or rate-limited.
**Decision:** Always save the original file first; wrap extraction in try/catch; on failure save the row with `extraction_status="failed"`.
**Why:** The user must never lose a report just because the AI hiccuped. Also protects the live demo.

---

## D7 — Simulate hospital integration instead of building it
**Context:** Real hospital data push needs consent, auth, and standards (FHIR/HL7) — impossible in a hackathon and outside our control.
**Decision:** Build a mock "Simulate report from Partner Hospital" button that injects a sample report automatically.
**Why:** Demonstrates the full vision and architecture convincingly without depending on any real hospital. Judges can see the auto-import loop working end to end.

---

## D8 — Privacy is a core feature, not an afterthought
**Context:** Medical data is sensitive.
**Decision:** Require login; enforce per-user isolation via RLS; keep the storage bucket private and serve files via signed URLs; add a "not a medical device / no medical advice" note.
**Why:** It's the right thing to do and it's a differentiator judges reward in a health app.

---

## D9 — Optional mock-extraction flag for demo safety
**Context:** Free API could be rate-limited or slow during judging.
**Decision:** Add a `USE_MOCK_EXTRACTION` env flag that returns realistic sample data instead of calling the API.
**Why:** Guarantees the demo can show the full flow even if the live API misbehaves. Off by default; documented in the README.
