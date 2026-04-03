import {
  STRUCTOO_REPORT_VERSION,
  createReportPayload,
  renderReportElement,
} from "./report-core.js";

function fmt(n, digits = 4) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function formatGeneratedAt() {
  return new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function run() {
  const err = document.getElementById("beam-err");
  const out = document.getElementById("beam-out");
  const dl = document.getElementById("beam-dl");
  const eq = document.getElementById("beam-eq");
  const reportHost = document.getElementById("calc-report-host");
  const printBar = document.getElementById("beam-print-bar");
  err.hidden = true;
  out.hidden = true;
  reportHost.hidden = true;
  printBar.hidden = true;
  reportHost.replaceChildren();

  const L = Number(document.getElementById("L").value);
  const w = Number(document.getElementById("w").value);
  const E = Number(document.getElementById("E").value);
  const I = Number(document.getElementById("I").value);

  if (!Number.isFinite(L) || L <= 0) {
    err.textContent = "Enter a positive span length L (ft).";
    err.hidden = false;
    return;
  }
  if (!Number.isFinite(w) || w < 0) {
    err.textContent = "Enter a non-negative distributed load w (kip/ft).";
    err.hidden = false;
    return;
  }

  const Wtotal = w * L;
  const R = (w * L) / 2;
  const Vmax = R;
  const Mmax = (w * L * L) / 8;

  dl.innerHTML = "";
  const rows = [
    ["Total load on span (w × L)", `${fmt(Wtotal, 4)} kip`],
    ["End reaction R", `${fmt(R, 4)} kip`],
    ["Maximum shear V (end)", `${fmt(Vmax, 4)} kip`],
    ["Maximum moment M (midspan)", `${fmt(Mmax, 4)} kip·ft`],
  ];

  const wKipIn = w / 12;
  const LIn = L * 12;
  /** @type {number | null} */
  let deltaIn = null;
  let deltaNote =
    "δ = 5 w L⁴ / (384 E I); w in kip/in, L in in, E in ksi, I in in⁴ (w_kip/in = w_klf / 12).";
  if (Number.isFinite(E) && E > 0 && Number.isFinite(I) && I > 0) {
    deltaIn = (5 * wKipIn * LIn ** 4) / (384 * E * I);
    deltaNote = `δ = 5 w L⁴ / (384 E I) = ${fmt(deltaIn, 5)} in`;
    rows.push(["Midspan deflection δ", `${fmt(deltaIn, 5)} in`]);
  } else {
    rows.push([
      "Midspan deflection δ",
      "Enter E (ksi) and I (in⁴) for a numeric value.",
    ]);
  }

  for (const [dt, dd] of rows) {
    const d = document.createElement("dt");
    d.textContent = dt;
    const e = document.createElement("dd");
    e.textContent = dd;
    dl.appendChild(d);
    dl.appendChild(e);
  }

  eq.textContent =
    `R = wL/2 = ${fmt(w, 4)} × ${fmt(L, 4)} / 2 = ${fmt(R, 4)} kip\n` +
    `M_max = wL²/8 = ${fmt(w, 4)} × ${fmt(L, 4)}² / 8 = ${fmt(Mmax, 4)} kip·ft\n` +
    deltaNote;

  const inputs = [
    { label: "Span length L", value: fmt(L, 4), unit: "ft" },
    { label: "Distributed load w", value: fmt(w, 4), unit: "kip/ft" },
    {
      label: "Modulus E",
      value: Number.isFinite(E) && E > 0 ? fmt(E, 0) : "—",
      unit: "ksi",
    },
    {
      label: "Moment of inertia I",
      value: Number.isFinite(I) && I > 0 ? fmt(I, 3) : "—",
      unit: "in⁴",
    },
  ];

  const outputs = [
    { label: "Total load on span (w × L)", value: fmt(Wtotal, 4), unit: "kip" },
    { label: "End reaction R", value: fmt(R, 4), unit: "kip" },
    { label: "Maximum shear V (at support)", value: fmt(Vmax, 4), unit: "kip" },
    {
      label: "Maximum moment M (midspan)",
      value: fmt(Mmax, 4),
      unit: "kip·ft",
    },
  ];
  if (deltaIn !== null) {
    outputs.push({
      label: "Midspan deflection δ",
      value: fmt(deltaIn, 5),
      unit: "in",
    });
  } else {
    outputs.push({
      label: "Midspan deflection δ",
      value: "Not computed (provide E and I)",
      unit: "",
    });
  }

  const equations = [
    `R = w L / 2 = ${fmt(w, 4)} kip/ft × ${fmt(L, 4)} ft / 2 = ${fmt(R, 4)} kip`,
    `M_max = w L² / 8 = ${fmt(w, 4)} × ${fmt(L, 4)}² / 8 = ${fmt(Mmax, 4)} kip·ft`,
  ];
  if (deltaIn !== null) {
    equations.push(
      `w (kip/in) = w (kip/ft) / 12 = ${fmt(wKipIn, 6)}; L (in) = ${fmt(LIn, 3)}`,
      `δ = 5 w L⁴ / (384 E I) = ${fmt(deltaIn, 5)} in`,
    );
  } else {
    equations.push(deltaNote);
  }

  const payload = createReportPayload({
    toolId: "simple-beam-udl",
    toolTitle: "Simple supported beam — uniform distributed load",
    meta: {
      project: document.getElementById("pkg-project").value,
      subject: document.getElementById("pkg-subject").value,
      preparedBy: document.getElementById("pkg-by").value,
      generatedAt: formatGeneratedAt(),
      reportVersion: STRUCTOO_REPORT_VERSION,
    },
    inputs,
    outputs,
    equations,
    disclaimer: [
      "Structoo provides educational and professional convenience calculations only. This output is not a substitute for engineering judgment, peer review, or compliance with applicable codes, standards, and contract documents.",
      "Verify all values and assumptions before inclusion in sealed submittals.",
    ],
  });

  reportHost.replaceChildren(renderReportElement(payload));
  reportHost.hidden = false;

  out.hidden = false;
  printBar.hidden = false;
}

document.getElementById("beam-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});

document.getElementById("btn-print-report").addEventListener("click", () => {
  window.print();
});

function refreshReportIfVisible() {
  const out = document.getElementById("beam-out");
  if (!out.hidden) run();
}

for (const id of ["pkg-project", "pkg-subject", "pkg-by"]) {
  document.getElementById(id).addEventListener("change", refreshReportIfVisible);
}
