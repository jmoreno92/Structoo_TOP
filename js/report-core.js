/**
 * Shared schema for calculation package printouts (browser Print → Save as PDF).
 * @see css/print.css
 */

export const STRUCTOO_REPORT_VERSION = "1.0.0";

/** @typedef {{ project?: string, subject?: string, preparedBy?: string, generatedAt: string, reportVersion: string }} ReportMeta */

/** @typedef {{ label: string, value: string, unit?: string }} ReportField */

/**
 * @typedef {Object} CalcReportPayload
 * @property {string} toolId
 * @property {string} toolTitle
 * @property {ReportMeta} meta
 * @property {ReportField[]} inputs
 * @property {ReportField[]} outputs
 * @property {string[]} equations
 * @property {string[]} disclaimer
 */

/**
 * @param {Omit<CalcReportPayload, never>} parts
 * @returns {CalcReportPayload}
 */
export function createReportPayload(parts) {
  return {
    toolId: parts.toolId,
    toolTitle: parts.toolTitle,
    meta: parts.meta,
    inputs: parts.inputs,
    outputs: parts.outputs,
    equations: parts.equations,
    disclaimer: parts.disclaimer,
  };
}

/**
 * @param {CalcReportPayload} payload
 * @returns {HTMLElement}
 */
export function renderReportElement(payload) {
  const root = document.createElement("article");
  root.className = "calc-report-sheet";
  root.setAttribute("data-tool-id", payload.toolId);

  const header = document.createElement("header");
  header.className = "calc-report-sheet__header";
  header.innerHTML = `
    <div class="calc-report-sheet__brand">Structoo</div>
    <h1 class="calc-report-sheet__title"></h1>
    <p class="calc-report-sheet__meta-line"></p>
  `;
  header.querySelector(".calc-report-sheet__title").textContent = payload.toolTitle;
  const m = payload.meta;
  const metaBits = [`Generated: ${m.generatedAt}`];
  if (m.project?.trim()) metaBits.push(`Project: ${m.project.trim()}`);
  if (m.subject?.trim()) metaBits.push(`Subject: ${m.subject.trim()}`);
  if (m.preparedBy?.trim()) metaBits.push(`Prepared by: ${m.preparedBy.trim()}`);
  metaBits.push(`Report format v${m.reportVersion}`);
  header.querySelector(".calc-report-sheet__meta-line").textContent = metaBits.join(" · ");

  const metaTable = document.createElement("table");
  metaTable.className = "calc-report-sheet__table calc-report-sheet__table--meta";
  const metaRows = [
    ["Project", m.project?.trim() || "—"],
    ["Subject / member", m.subject?.trim() || "—"],
    ["Prepared by", m.preparedBy?.trim() || "—"],
  ];
  for (const [label, val] of metaRows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(val)}</td>`;
    metaTable.appendChild(tr);
  }

  const hIn = document.createElement("h2");
  hIn.className = "calc-report-sheet__section-title";
  hIn.textContent = "Inputs";

  const tblIn = fieldTable(payload.inputs);

  const hOut = document.createElement("h2");
  hOut.className = "calc-report-sheet__section-title";
  hOut.textContent = "Results";

  const tblOut = fieldTable(payload.outputs);

  const hEq = document.createElement("h2");
  hEq.className = "calc-report-sheet__section-title";
  hEq.textContent = "Calculations";

  const pre = document.createElement("pre");
  pre.className = "calc-report-sheet__equations";
  pre.textContent = payload.equations.join("\n\n");

  const disc = document.createElement("footer");
  disc.className = "calc-report-sheet__disclaimer";
  disc.innerHTML = payload.disclaimer
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  root.append(
    header,
    metaTable,
    hIn,
    tblIn,
    hOut,
    tblOut,
    hEq,
    pre,
    disc,
  );

  return root;
}

function fieldTable(fields) {
  const t = document.createElement("table");
  t.className = "calc-report-sheet__table";
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  for (const label of ["Item", "Value"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  t.appendChild(thead);
  const tb = document.createElement("tbody");
  for (const f of fields) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = f.label;
    const td = document.createElement("td");
    td.textContent = f.unit ? `${f.value} ${f.unit}` : f.value;
    tr.append(th, td);
    tb.appendChild(tr);
  }
  t.appendChild(tb);
  return t;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
