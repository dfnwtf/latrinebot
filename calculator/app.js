/**
 * Latrine Bot eligibility calculator.
 * Pure ES module, no deps, no build step.
 *
 * Math mirrors the engine:
 *   1. Resolve tier: pick highest tier row with mcUsd <= current MC
 *   2. Apply floor: balance must be >= active tier.minTokens
 *   3. Apply anti-whale cap: balance must be <= maxHolderBalance (if > 0)
 *   4. Hold cycles: wallet must have been in band for >= active tier.holdCycles cycles
 */

const DEFAULT_TIERS = [
  { mcUsd:         0, minTokens: 500000, holdCycles: 5 },
  { mcUsd:     50000, minTokens: 450000, holdCycles: 6 },
  { mcUsd:    100000, minTokens: 400000, holdCycles: 8 },
  { mcUsd:    250000, minTokens: 300000, holdCycles: 10 },
  { mcUsd:    500000, minTokens: 220000, holdCycles: 12 },
  { mcUsd:   1000000, minTokens: 150000, holdCycles: 15 },
  { mcUsd:   2500000, minTokens: 110000, holdCycles: 22 },
  { mcUsd:   5000000, minTokens:  75000, holdCycles: 30 },
  { mcUsd:  10000000, minTokens:  55000, holdCycles: 40 },
  { mcUsd:  15000000, minTokens:  40000, holdCycles: 50 },
  { mcUsd:  25000000, minTokens:  30000, holdCycles: 60 },
  { mcUsd:  50000000, minTokens:  22000, holdCycles: 80 },
  { mcUsd: 100000000, minTokens:  15000, holdCycles: 100 },
];

const $ = (id) => document.getElementById(id);

function parseTiers(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    const cleaned = parsed
      .map((t) => ({
        mcUsd: Math.max(0, Math.floor(Number(t?.mcUsd) || 0)),
        minTokens: Math.max(0, Math.floor(Number(t?.minTokens) || 0)),
        holdCycles: Math.max(1, Math.floor(Number(t?.holdCycles) || 1)),
      }))
      .sort((a, b) => a.mcUsd - b.mcUsd);
    return cleaned.length ? cleaned : null;
  } catch {
    return null;
  }
}

function resolveTier(mcUsd, tiers) {
  if (!tiers.length) return null;
  let active = tiers[0];
  for (const t of tiers) {
    if (mcUsd >= t.mcUsd) active = t;
    else break;
  }
  return active;
}

function fmtUsd(v) {
  if (!Number.isFinite(v)) return "-";
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtTokens(v) {
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function compute() {
  const mc = Number($("mc").value) || 0;
  const supply = Math.max(1, Number($("supply").value) || 1);
  const balance = Number($("balance").value) || 0;
  const cap = Math.max(0, Number($("cap").value) || 0);
  const held = Math.max(0, Number($("held").value) || 0);
  const tiers = parseTiers($("tiers").value) ?? DEFAULT_TIERS;

  const active = resolveTier(mc, tiers);
  const pricePerToken = mc / supply;
  const positionUsd = balance * pricePerToken;
  const minPositionUsd = (active?.minTokens ?? 0) * pricePerToken;

  let status = "ok";
  const reasons = [];
  if (active && balance < active.minTokens) {
    status = "bad";
    reasons.push(`below floor (need ${fmtTokens(active.minTokens)} tokens, have ${fmtTokens(balance)})`);
  }
  if (cap > 0 && balance > cap) {
    status = "bad";
    reasons.push(`above anti-whale cap (cap ${fmtTokens(cap)} tokens)`);
  }
  if (active && held < active.holdCycles) {
    status = "bad";
    reasons.push(`hold cycles - need ${active.holdCycles}, has ${held}`);
  }

  const result = $("result");
  result.className = `calc-result ${status === "ok" ? "is-ok" : "is-bad"}`;
  result.textContent = status === "ok"
    ? [
        `Balance:           ${fmtTokens(balance)} tokens`,
        `Position value:    $${fmtUsd(positionUsd)}`,
        `Active tier:       MC >= $${fmtUsd(active?.mcUsd ?? 0)}`,
        `Min position USD:  $${fmtUsd(minPositionUsd)}`,
        `Hold cycles:       ${held} / ${active?.holdCycles ?? "-"}`,
      ].join("\n")
    : [
        ...reasons.map((r) => `- ${r}`),
        "",
        `Position value:    $${fmtUsd(positionUsd)}`,
        `Min position USD:  $${fmtUsd(minPositionUsd)}`,
      ].join("\n");

  const activeBody = $("activeTier").querySelector("tbody");
  if (active) {
    activeBody.innerHTML = `<tr class="active">
      <td>$${fmtUsd(active.mcUsd)}</td>
      <td>${fmtTokens(active.minTokens)}</td>
      <td>${active.holdCycles}</td>
      <td>$${fmtUsd(minPositionUsd)}</td>
    </tr>`;
  } else {
    activeBody.innerHTML = "";
  }

  const allBody = $("allTiers").querySelector("tbody");
  allBody.innerHTML = tiers
    .map((t) => {
      const usd = t.minTokens * pricePerToken;
      const isActive = active && t.mcUsd === active.mcUsd;
      return `<tr class="${isActive ? "active" : ""}">
        <td>$${fmtUsd(t.mcUsd)}</td>
        <td>${fmtTokens(t.minTokens)}</td>
        <td>${t.holdCycles}</td>
        <td>$${fmtUsd(usd)}</td>
        <td>${isActive ? "yes" : ""}</td>
      </tr>`;
    })
    .join("");
}

function loadDefaultsIntoTextarea() {
  $("tiers").value = JSON.stringify(DEFAULT_TIERS, null, 2);
}

function prettyPrintTiers() {
  const tiers = parseTiers($("tiers").value);
  if (!tiers) return;
  $("tiers").value = JSON.stringify(tiers, null, 2);
}

["mc", "supply", "balance", "cap", "held", "tiers"].forEach((id) => {
  $(id).addEventListener("input", compute);
});
$("resetTiers").addEventListener("click", () => {
  loadDefaultsIntoTextarea();
  compute();
});
$("prettyTiers").addEventListener("click", () => {
  prettyPrintTiers();
  compute();
});

loadDefaultsIntoTextarea();
compute();
