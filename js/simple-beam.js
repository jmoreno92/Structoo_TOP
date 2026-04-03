function fmt(n, digits = 4) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function run() {
  const err = document.getElementById("beam-err");
  const out = document.getElementById("beam-out");
  const dl = document.getElementById("beam-dl");
  const eq = document.getElementById("beam-eq");
  err.hidden = true;
  out.hidden = true;

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
  if (Number.isFinite(E) && E > 0 && Number.isFinite(I) && I > 0) {
    const deltaIn = (5 * wKipIn * LIn ** 4) / (384 * E * I);
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

  let deltaNote =
    "δ = 5 w L⁴ / (384 E I); w in kip/in, L in in, E in ksi, I in in⁴ (w_kip/in = w_klf / 12).";
  if (Number.isFinite(E) && E > 0 && Number.isFinite(I) && I > 0) {
    const deltaIn = (5 * wKipIn * LIn ** 4) / (384 * E * I);
    deltaNote = `δ = 5 w L⁴ / (384 E I) = ${fmt(deltaIn, 5)} in`;
  }

  eq.textContent =
    `R = wL/2 = ${fmt(w, 4)} × ${fmt(L, 4)} / 2 = ${fmt(R, 4)} kip\n` +
    `M_max = wL²/8 = ${fmt(w, 4)} × ${fmt(L, 4)}² / 8 = ${fmt(Mmax, 4)} kip·ft\n` +
    deltaNote;

  out.hidden = false;
}

document.getElementById("beam-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});
