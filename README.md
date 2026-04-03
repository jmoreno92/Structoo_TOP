# Structoo

Static HTML/CSS/JS calculators for structural and civil engineers.

## Tools

- **Simple supported beam** — uniform load: reactions, shear, moment, deflection (`tools/simple-beam.html`).
- **Fillet weld capacity** — AISC 360-22 J2.4 style, φ, FEXX, leg, sides, optional length (`tools/fillet-weld.html`).
- **Steel beam flexure** — AISC 360-22 Chapter F yielding and LTB for doubly symmetric I-shapes (`tools/steel-beam-f.html`).
- **AISC shape database** — filter v16.0 properties (`tools/aisc-shapes.html`).

## AISC shape data

Shape rows are exported from the **AISC Shapes Database v16.0** workbook into `data/aisc-shapes-v16.json`.

```bash
npm install
AISC_XLSX=/path/to/aisc-shapes-database-v160-2.xlsx npm run export
```

See [about/index.html](about/index.html) for attribution and disclaimer.

## Local preview

```bash
npx serve .
```

Open `/tools/…` from the served root (needed for `fetch` of JSON on the shapes page).

## PDF / calculation packages

**Hosting choice:** outputs use **static-friendly Option A** — the browser **Print** dialog and **Save as PDF**. No server or serverless runtime is required.

Shared helpers live in [`js/report-core.js`](js/report-core.js) (report payload schema + DOM renderer). Print layout uses [`css/print.css`](css/print.css) (`media="print"`). The **simple supported beam** tool is the first consumer; other calculators can reuse the same module.

Optional **Option B** (`@react-pdf/renderer`) or **Option C** (Puppeteer / serverless HTML→PDF) can be added later if you need one-click downloads without the system print dialog.
