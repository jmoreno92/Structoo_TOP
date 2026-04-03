const PHI_B = 0.9;

function fmt(n, digits = 3) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function mnLtb({ Fy, E, Mp, Sx, ry, rts, ho, J, Iy, Cw, Lb, Cb }) {
  let Lp = 1.76 * ry * Math.sqrt(E / Fy);
  const termJ = J / (Sx * ho);
  const inner = termJ ** 2 + 6.76 * (0.7 * Fy / E) ** 2 * (Cw / Iy);
  const Lr =
    Math.PI *
    rts *
    Math.sqrt(E / (0.7 * Fy)) *
    Math.sqrt(termJ + Math.sqrt(inner));

  const LpRaw = Lp;
  if (Lp > Lr) {
    Lp = Lr;
  }

  let zone;
  let Mn;
  let Fcr = null;

  if (Lb <= Lp) {
    zone =
      LpRaw > Lr
        ? "Lb ≤ Lp (= Lr per User Note when F1-4 Lp exceeded Lr) — Mn = Mp."
        : "Lb ≤ Lp — Mn = Mp.";
    Mn = Mp;
  } else if (Lb <= Lr && Lp < Lr) {
    zone = "Lp < Lb ≤ Lr — inelastic LTB (Eq. F1-2).";
    Mn =
      Cb *
      (Mp - (Mp - 0.7 * Fy * Sx) * ((Lb - Lp) / (Lr - Lp)));
    Mn = Math.min(Mn, Mp);
  } else if (Lb > Lr) {
    zone = "Lb > Lr — elastic LTB (Eq. F1-12, F1-13).";
    const lbRts = Lb / rts;
    Fcr =
      (Cb * Math.PI ** 2 * E) /
      lbRts ** 2 *
      Math.sqrt(1 + 0.078 * (J / (Sx * ho)) * lbRts ** 2);
    Mn = Math.min(Fcr * Sx, Mp);
  }

  return { Lp, LpRaw, Lr, zone, Mn, Fcr };
}

function run() {
  const err = document.getElementById("f-err");
  const out = document.getElementById("f-out");
  err.hidden = true;
  out.hidden = true;

  const Fy = Number(document.getElementById("Fy").value);
  const E = Number(document.getElementById("Ebeam").value);
  const Zx = Number(document.getElementById("Zx").value);
  const Sx = Number(document.getElementById("Sx").value);
  const ry = Number(document.getElementById("ry").value);
  const rts = Number(document.getElementById("rts").value);
  const ho = Number(document.getElementById("ho").value);
  const J = Number(document.getElementById("J").value);
  const Iy = Number(document.getElementById("Iy").value);
  const Cw = Number(document.getElementById("Cw").value);
  const Lb = Number(document.getElementById("Lb").value);
  const Cb = Number(document.getElementById("Cb").value);

  const nums = [Fy, E, Zx, Sx, ry, rts, ho, J, Iy, Cw, Lb, Cb];
  if (nums.some((x) => !Number.isFinite(x) || x <= 0)) {
    err.textContent =
      "All inputs must be positive numbers. Use inch–ksi units.";
    err.hidden = false;
    return;
  }

  const Mp = Fy * Zx;
  const { Lp, LpRaw, Lr, zone, Mn, Fcr } = mnLtb({
    Fy,
    E,
    Mp,
    Sx,
    ry,
    rts,
    ho,
    J,
    Iy,
    Cw,
    Lb,
    Cb,
  });

  const phiMn = PHI_B * Mn;

  const fill = (id, pairs) => {
    const el = document.getElementById(id);
    el.innerHTML = "";
    for (const [dt, dd] of pairs) {
      const d = document.createElement("dt");
      d.textContent = dt;
      const e = document.createElement("dd");
      e.textContent = dd;
      el.appendChild(d);
      el.appendChild(e);
    }
  };

  fill("f-dl-sum", [
    ["Governing Mn (LTB, capped at Mp)", `${fmt(Mn, 2)} kip·in`],
    ["Governing Mn", `${fmt(Mn / 12, 3)} kip·ft`],
    ["φb Mn (φb = 0.90)", `${fmt(phiMn / 12, 3)} kip·ft`],
  ]);

  fill("f-dl-y", [
    ["Mp = Fy Zx", `${fmt(Mp, 2)} kip·in (${fmt(Mp / 12, 3)} kip·ft)`],
    ["φb Mp", `${fmt((PHI_B * Mp) / 12, 3)} kip·ft`],
  ]);

  const ltbRows = [
    ["Lp (used in checks)", `${fmt(Lp, 2)} in`],
    ["Lr (Eq. F1-6, c = 1)", `${fmt(Lr, 2)} in`],
    ["Unbraced Lb", `${fmt(Lb, 2)} in`],
    ["Cb", `${fmt(Cb, 3)}`],
    ["Zone", zone],
    ["Mn from LTB", `${fmt(Mn, 2)} kip·in (${fmt(Mn / 12, 3)} kip·ft)`],
  ];
  if (LpRaw !== Lp) {
    ltbRows.splice(1, 0, [
      "Lp from F1-4 (raw)",
      `${fmt(LpRaw, 2)} in; User Note sets Lp = Lr when F1-4 Lp > Lr`,
    ]);
  }
  if (Fcr !== null) {
    const zi = ltbRows.findIndex((r) => r[0] === "Zone");
    ltbRows.splice(zi, 0, ["Fcr (Eq. F1-13)", `${fmt(Fcr, 3)} ksi`]);
  }
  fill("f-dl-ltb", ltbRows);

  document.getElementById("f-eq-y").textContent =
    `Mp = Fy Zx = ${fmt(Fy, 2)} × ${fmt(Zx, 3)} = ${fmt(Mp, 2)} kip·in`;

  let ltbEq =
    `Lp (used) = ${fmt(Lp, 2)} in` +
    (LpRaw !== Lp
      ? ` (F1-4 raw ${fmt(LpRaw, 2)} in; User Note applies)\n`
      : `\n`) +
    `Lr from Eq. F1-6 (c = 1): ${fmt(Lr, 2)} in\n` +
    `${zone}\n` +
    `Mn (LTB) = ${fmt(Mn, 2)} kip·in; φb Mn = ${fmt(phiMn, 2)} kip·in (${fmt(phiMn / 12, 3)} kip·ft)`;

  if (Fcr !== null) {
    ltbEq += `\nFcr = ${fmt(Fcr, 4)} ksi; Mn = Fcr Sx ≤ Mp`;
  }

  document.getElementById("f-eq-ltb").textContent = ltbEq;
  out.hidden = false;
}

document.getElementById("f-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});
