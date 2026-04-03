function fmt(n, digits = 4) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function run() {
  const err = document.getElementById("weld-err");
  const out = document.getElementById("weld-out");
  const dl = document.getElementById("weld-dl");
  const eq = document.getElementById("weld-eq");
  err.hidden = true;
  out.hidden = true;

  const phi = Number(document.getElementById("phi").value);
  const Fexx = Number(document.getElementById("fexx").value);
  const leg = Number(document.getElementById("leg").value);
  const sides = Number(document.getElementById("sides").value);
  const wlenRaw = document.getElementById("wlen").value.trim();

  if (!Number.isFinite(phi) || phi <= 0 || phi > 1) {
    err.textContent = "Enter a resistance factor φ between 0 and 1.";
    err.hidden = false;
    return;
  }
  if (!Number.isFinite(Fexx) || Fexx <= 0) {
    err.textContent = "Enter a positive FEXX (ksi).";
    err.hidden = false;
    return;
  }
  if (!Number.isFinite(leg) || leg <= 0) {
    err.textContent = "Enter a positive leg size (in.).";
    err.hidden = false;
    return;
  }
  if (!Number.isInteger(sides) || sides < 1) {
    err.textContent = "Number of welds must be a positive integer.";
    err.hidden = false;
    return;
  }

  const Fnw = 0.6 * Fexx;
  const throat = 0.707 * leg;
  const RnPerIn = Fnw * throat;
  const phiRnPerIn = phi * RnPerIn;
  const phiRnPerFtLine = phiRnPerIn * 12;
  const phiRnPerFtAll = phiRnPerFtLine * sides;

  dl.innerHTML = "";
  const add = (dt, dd) => {
    const d = document.createElement("dt");
    d.textContent = dt;
    const e = document.createElement("dd");
    e.textContent = dd;
    dl.appendChild(d);
    dl.appendChild(e);
  };

  add("Fnw = 0.60 FEXX", `${fmt(Fnw, 2)} ksi`);
  add("Effective throat 0.707 w", `${fmt(throat, 4)} in`);
  add("φRn per inch (one weld line)", `${fmt(phiRnPerIn, 4)} kip/in`);
  add("φRn per foot (one weld line)", `${fmt(phiRnPerFtLine, 3)} kip/ft`);
  add("φRn per foot (all sides)", `${fmt(phiRnPerFtAll, 3)} kip/ft`);

  let eqText =
    `Fnw = 0.60 × ${fmt(Fexx, 2)} = ${fmt(Fnw, 2)} ksi\n` +
    `Throat = 0.707 × ${fmt(leg, 4)} = ${fmt(throat, 4)} in\n` +
    `Rn/in = Fnw × throat = ${fmt(RnPerIn, 4)} kip/in\n` +
    `φRn/in = ${fmt(phi, 3)} × ${fmt(RnPerIn, 4)} = ${fmt(phiRnPerIn, 4)} kip/in\n` +
    `φRn/ft (one line) = φRn/in × 12 = ${fmt(phiRnPerFtLine, 3)} kip/ft\n` +
    `φRn/ft (n = ${sides} sides) = ${fmt(phiRnPerFtAll, 3)} kip/ft`;

  if (wlenRaw !== "") {
    const Lft = Number(wlenRaw);
    if (!Number.isFinite(Lft) || Lft < 0) {
      err.textContent = "Weld length must be non-negative (ft), or leave blank.";
      err.hidden = false;
      return;
    }
    if (Lft > 0) {
      const Lin = Lft * 12;
      const phiRnTotal = phiRnPerIn * Lin * sides;
      add("φRn total (all sides × length)", `${fmt(phiRnTotal, 3)} kip`);
      eqText += `\nφRn = φRn/in × L × n = ${fmt(phiRnPerIn, 4)} × ${fmt(Lin, 3)} × ${sides} = ${fmt(phiRnTotal, 3)} kip`;
    }
  } else {
    eqText +=
      "\n(No length entered — total φRn in kip omitted per your request.)";
  }

  eq.textContent = eqText;
  out.hidden = false;
}

document.getElementById("weld-form").addEventListener("submit", (e) => {
  e.preventDefault();
  run();
});
