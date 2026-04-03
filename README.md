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
