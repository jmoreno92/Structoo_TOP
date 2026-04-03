# Structoo

Static HTML/CSS/JS tools for structural engineering.

## AISC shape data

Shape properties are exported from the **AISC Shapes Database v16.0** Excel workbook into `data/aisc-shapes-v16.json`.

Regenerate after updating the workbook:

```bash
npm install
AISC_XLSX=/path/to/aisc-shapes-database-v160-2.xlsx npm run export
```

See [about/index.html](about/index.html) for attribution and disclaimer.

## Local preview

```bash
npx serve .
```

Then open the URL shown (e.g. `/tools/aisc-shapes.html`).
