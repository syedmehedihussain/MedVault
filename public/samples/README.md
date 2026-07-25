# Sample report images

Per `docs/AGENTS.md` and `docs/ARCHITECTURE.md`, this folder should hold **1–2
freely-shared sample medical report images** so the app can be demoed without
a real report. The Next.js app serves anything in `public/` at the URL
`/samples/<filename>`.

**What to add:**
- 1–2 clear JPG/PNG images of typical lab reports (e.g. a complete blood
  count panel). Plain text and numbers on a white page are easiest for the
  Gemini model to read.
- File names should be lowercase, hyphenated, and descriptive, e.g.
  `blood-test-cbc.jpg`, `lipid-panel.png`.

**Do not commit:**
- Real patient data (PHI). Only synthetic / public-domain samples.
- Large files. Compress to a reasonable size (under ~500 KB each).

**How they're used:**
- Demo path: judges can click "Upload sample" or drop the image into the
  upload widget without needing to find a real report.
- Test path: the dev can run `extractReport()` against a known input to
  verify the JSON contract from `docs/DATA_MODEL.md`.

Until real images are dropped in, the upload widget can still work with the
sample by reading from any other image source — but for the demo, add at
least one.