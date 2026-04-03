import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const xlsxPath = process.env.AISC_XLSX || process.argv[2];
if (!xlsxPath) {
  console.error(
    "Set AISC_XLSX or pass the workbook path:\n" +
      "  AISC_XLSX=/path/to/aisc-shapes-database-v160-2.xlsx npm run export\n" +
      "  npm run export -- /path/to/aisc-shapes-database-v160-2.xlsx"
  );
  process.exit(1);
}

if (!fs.existsSync(xlsxPath)) {
  console.error("File not found:", xlsxPath);
  process.exit(1);
}

const SHEET = "Database v16.0";

const wb = XLSX.readFile(xlsxPath);
if (!wb.SheetNames.includes(SHEET)) {
  console.error("Missing sheet:", SHEET);
  console.error("Available:", wb.SheetNames.join(", "));
  process.exit(1);
}

const sheet = wb.Sheets[SHEET];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

function normalizeRow(row) {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    if (key === undefined || key === null || key === "") continue;
    if (val === "" || val === undefined) {
      out[key] = null;
      continue;
    }
    if (typeof val === "number") {
      if (Number.isFinite(val)) out[key] = val;
      else out[key] = null;
      continue;
    }
    if (typeof val === "string") {
      const t = val.trim();
      if (t === "") {
        out[key] = null;
        continue;
      }
      if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) {
        const n = Number(t);
        out[key] = Number.isFinite(n) ? n : t;
      } else {
        out[key] = t;
      }
      continue;
    }
    out[key] = val;
  }
  return out;
}

const normalized = rows.map(normalizeRow);

const outPath = path.join(root, "data", "aisc-shapes-v16.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(normalized), "utf8");

console.log(`Wrote ${normalized.length} rows → ${outPath}`);
