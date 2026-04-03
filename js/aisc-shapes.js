const DATA_URL = "../data/aisc-shapes-v16.json";

const COLS = [
  { key: "Type", numeric: false },
  { key: "AISC_Manual_Label", numeric: false },
  { key: "W", numeric: true },
  { key: "d", numeric: true },
  { key: "bf", numeric: true },
  { key: "Ix", numeric: true },
  { key: "Sx", numeric: true },
];

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function num(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatCell(key, value) {
  if (value === null || value === undefined) return "—";
  const col = COLS.find((c) => c.key === key);
  if (!col?.numeric) return String(value);
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  let digits = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 10 ? 2 : 3;
  if (key === "W") digits = 1;
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function collectTypes(rows) {
  const set = new Set();
  for (const r of rows) {
    const t = r.Type;
    if (t != null && String(t).trim() !== "") set.add(String(t).trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function matchesSearch(row, q) {
  if (!q) return true;
  const a = String(row.AISC_Manual_Label ?? "").toLowerCase();
  const b = String(row.EDI_Std_Nomenclature ?? "").toLowerCase();
  return a.includes(q) || b.includes(q);
}

function inRange(value, minStr, maxStr) {
  const v = num(value);
  let lo = minStr !== "" ? Number(minStr) : null;
  let hi = maxStr !== "" ? Number(maxStr) : null;
  if (
    lo !== null &&
    hi !== null &&
    Number.isFinite(lo) &&
    Number.isFinite(hi) &&
    lo > hi
  ) {
    [lo, hi] = [hi, lo];
  }
  if (lo !== null && Number.isFinite(lo)) {
    if (v === null) return false;
    if (v < lo) return false;
  }
  if (hi !== null && Number.isFinite(hi)) {
    if (v === null) return false;
    if (v > hi) return false;
  }
  return true;
}

function readFilters() {
  return {
    type: document.getElementById("filter-type").value,
    search: document.getElementById("filter-search").value.trim().toLowerCase(),
    dMin: document.getElementById("filter-d-min").value.trim(),
    dMax: document.getElementById("filter-d-max").value.trim(),
    bfMin: document.getElementById("filter-bf-min").value.trim(),
    bfMax: document.getElementById("filter-bf-max").value.trim(),
    wMin: document.getElementById("filter-w-min").value.trim(),
    wMax: document.getElementById("filter-w-max").value.trim(),
  };
}

function filterRows(rows, f) {
  return rows.filter((row) => {
    if (f.type && String(row.Type ?? "") !== f.type) return false;
    if (!matchesSearch(row, f.search)) return false;
    if (!inRange(row.d, f.dMin, f.dMax)) return false;
    if (!inRange(row.bf, f.bfMin, f.bfMax)) return false;
    if (!inRange(row.W, f.wMin, f.wMax)) return false;
    return true;
  });
}

function sortRows(rows, sortKey, dir) {
  if (!sortKey || !dir) return rows;
  const col = COLS.find((c) => c.key === sortKey);
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (col?.numeric) {
      const na = num(va);
      const nb = num(vb);
      if (na === null && nb === null) return 0;
      if (na === null) return 1;
      if (nb === null) return -1;
      if (na !== nb) return na < nb ? -mult : mult;
    } else {
      const sa = String(va ?? "").toLowerCase();
      const sb = String(vb ?? "").toLowerCase();
      if (sa !== sb) return sa < sb ? -mult : mult;
    }
    const la = String(a.AISC_Manual_Label ?? "");
    const lb = String(b.AISC_Manual_Label ?? "");
    return la.localeCompare(lb, undefined, { numeric: true });
  });
}

let allRows = [];
let filtered = [];
let sortKey = "AISC_Manual_Label";
let sortDir = "asc";

function renderHeaders() {
  const ths = document.querySelectorAll("#results-table thead th[data-key]");
  ths.forEach((th) => {
    const key = th.getAttribute("data-key");
    th.classList.remove("sort-asc", "sort-desc");
    if (key === sortKey) th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
  });
}

function renderTable() {
  const tbody = document.getElementById("results-body");
  tbody.replaceChildren();
  const sorted = sortRows(filtered, sortKey, sortDir);
  const frag = document.createDocumentFragment();
  for (const row of sorted) {
    const tr = document.createElement("tr");
    for (const col of COLS) {
      const td = document.createElement("td");
      if (col.numeric) td.classList.add("num");
      td.textContent = formatCell(col.key, row[col.key]);
      tr.appendChild(td);
    }
    frag.appendChild(tr);
  }
  tbody.appendChild(frag);
}

function updateStatus() {
  const el = document.getElementById("status");
  el.classList.remove("error");
  el.textContent = `Showing ${filtered.length} of ${allRows.length} shapes.`;
}

function applyFiltersAndRender() {
  const f = readFilters();
  filtered = filterRows(allRows, f);
  renderHeaders();
  renderTable();
  updateStatus();
}

const scheduleApply = debounce(() => {
  requestAnimationFrame(applyFiltersAndRender);
}, 120);

async function main() {
  const status = document.getElementById("status");
  const loading = document.getElementById("loading-state");
  const tableContainer = document.getElementById("table-container");

  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid JSON shape");
    allRows = data;
    filtered = allRows;

    const typeSelect = document.getElementById("filter-type");
    for (const t of collectTypes(allRows)) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    }

    loading.hidden = true;
    tableContainer.hidden = false;
    applyFiltersAndRender();

    const inputs = [
      "filter-type",
      "filter-search",
      "filter-d-min",
      "filter-d-max",
      "filter-bf-min",
      "filter-bf-max",
      "filter-w-min",
      "filter-w-max",
    ];
    for (const id of inputs) {
      document.getElementById(id).addEventListener("input", scheduleApply);
      document.getElementById(id).addEventListener("change", scheduleApply);
    }

    document.querySelectorAll("#results-table thead th[data-key]").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-key");
        if (sortKey === key) {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortKey = key;
          sortDir = "asc";
        }
        scheduleApply();
      });
    });
  } catch (e) {
    console.error(e);
    loading.hidden = true;
    status.classList.add("error");
    status.textContent =
      "Could not load shape data. Ensure you are serving the site over HTTP (e.g. npx serve) " +
      "and that data/aisc-shapes-v16.json exists (run npm run export with AISC_XLSX set).";
  }
}

main();
