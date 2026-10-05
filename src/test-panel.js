import { assumptions, simulate } from './simulation.js';

export function initTestPanel(getModel, presets) {
  const panel = document.getElementById('test-panel');
  panel.innerHTML = `
    <div class="test-heading"><div><div class="eyebrow">03 / EDUCATIONAL SIMULATION</div><h2>Run a virtual test</h2></div><span class="view-tag">NITROGEN · VACUUM</span></div>
    <p class="test-description">Compare your current shape with all three presets in a 5-second, steady-state cold-gas test. Every design uses the same 1 L chamber.</p>
    <div class="assumption-chips"><span>500 kPa absolute</span><span>300 K</span><span>0 Pa ambient</span><span>Constant external gas supply</span></div>
    <div class="test-actions"><label class="flow-toggle"><input id="equal-flow" type="checkbox" checked> Equal gas flow for every design</label><button class="button export" id="run-test">Run test & compare</button><button class="button" id="export-test" disabled>Export test report</button></div>
    <p class="test-help" id="flow-help">Nozzles are scaled to the same throat area (1 mm²), preserving each shape’s exit-to-throat area ratio. This compares thrust at equal gas consumption.</p>
    <p class="test-status" id="test-status" role="status">Ready. Choose a shape above, then run the comparison.</p>
    <div id="test-results" hidden></div>
    <details class="test-method"><summary>Assumptions, equations & limitations</summary>
      <p>This is a mathematical cold-gas example: nitrogen expands without combustion. It is not a firing test or a prediction for a fueled engine. Pressure and temperature are held constant by an ideal external supply; the 1 L chamber is not the total gas reservoir. Startup, shutdown, depletion, friction, heat transfer, real-gas effects and nozzle contour losses are omitted.</p>
      <p>Chamber and nozzle-length sliders remain visual only. All compared chambers are assigned 1 L regardless of the drawn proportions. Only throat and exit proportions affect this model. The drawing is not to scale.</p>
      <p>For an illustrative area ratio, we square the ratio of the schematic’s outer exit and throat radii: [(34 + 0.83 × exit) / (12 + 0.36 × throat)]². With equal flow off, throat area is 1 mm² × [(12 + 0.36 × throat) / 24.6]². This arbitrary mapping is not measured hardware geometry.</p>
      <p>We solve the supersonic area–Mach relation, then compute choked mass flow and ideal exit conditions. Thrust F = ṁVₑ + (pₑ − pₐ)Aₑ. Specific impulse Isp = F / (ṁg₀). Total impulse = F × 5 s. Gas used = ṁ × 5 s. Assumed γ = 1.4, R = 296.8 J/(kg·K), g₀ = 9.80665 m/s².</p>
      <p>Specific impulse measures thrust per propellant weight flow; its unit is seconds, but it is not the run duration. “Highest thrust” means highest among the displayed candidates under these assumptions, not an optimal real engine. A larger throat can raise thrust by using more gas. Volume alone does not determine thrust.</p>
      <p>Equation references: <a href="https://www.grc.nasa.gov/WWW/k-12/airplane/rktthsum.html" target="_blank" rel="noreferrer">NASA thrust equations</a> and <a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/" target="_blank" rel="noreferrer">NASA specific impulse</a>.</p>
    </details>`;
  const $ = id => document.getElementById(id);
  let report = null;
  const invalidate = () => {
    if (!report) return;
    report = null;
    $('test-results').hidden = true;
    $('export-test').disabled = true;
    $('test-status').textContent = 'Inputs changed. Run the test again to update the comparison.';
  };
  $('equal-flow').addEventListener('change', () => {
    $('flow-help').textContent = $('equal-flow').checked
      ? 'Nozzles are scaled to the same throat area (1 mm²), preserving each shape’s exit-to-throat area ratio. This compares thrust at equal gas consumption.'
      : 'Throat area now follows each shape’s throat proportion. Chamber volume stays at 1 L. More thrust may simply mean more gas consumed; compare specific impulse too.';
    invalidate();
  });
  $('run-test').addEventListener('click', () => {
    const equalFlow = $('equal-flow').checked;
    const candidates = [['Current shape', getModel()], ['Balanced', presets.balanced], ['Compact', presets.compact], ['Wide bell', presets.wide]];
    const results = candidates.map(([name, parameters]) => ({ name, ...simulate(parameters, equalFlow) }));
    const ranked = [...results].sort((a, b) => b.thrustN - a.thrustN);
    const best = ranked[0].thrustN;
    const winners = ranked.filter(r => Math.abs(r.thrustN - best) < 1e-9).map(r => r.name);
    report = {
      format: 'rocket-concept-studio-test', version: 1, model_type: 'ideal-cold-gas-educational',
      assumptions, equalFlow, results, highestThrustCandidates: winners,
      limitations: 'Ideal steady flow into vacuum; no combustion, transients, depletion, heat transfer, friction or contour losses. Chamber and length sliders are visual only. Arbitrary schematic-to-area mapping; not validated hardware performance.',
      areaMapping: 'Ae/At = ((34 + 0.83*bell)/(12 + 0.36*throat))^2; At = 1e-6 m² for equal flow, otherwise 1e-6*((12 + 0.36*throat)/24.6)^2 m².',
    };
    const current = results[0];
    $('test-results').innerHTML = `
      <div class="test-metrics">
        <div><span>Current shape · thrust</span><strong id="test-thrust">${current.thrustN.toFixed(3)} <small>N</small></strong></div>
        <div><span>Specific impulse</span><strong id="test-isp">${current.specificImpulseS.toFixed(2)} <small>s</small></strong></div>
        <div><span>Gas flow</span><strong>${(current.massFlowKgPerS * 1000).toFixed(3)} <small>g/s</small></strong></div>
        <div><span>Total impulse · 5 s</span><strong>${current.totalImpulseNS.toFixed(3)} <small>N·s</small></strong></div>
        <div><span>Gas used · 5 s</span><strong>${(current.gasUsedKg * 1000).toFixed(3)} <small>g</small></strong></div>
      </div>
      <p class="winner" id="test-winner">Highest estimated thrust: <strong>${winners.join(' + ')}</strong>${winners.length > 1 ? ' (tie)' : ''} · ${best.toFixed(3)} N</p>
      <div class="comparison-bars" aria-label="Relative thrust comparison">${ranked.map(r => `<div class="comparison-bar"><span>${r.name}</span><meter min="0" max="${best}" value="${r.thrustN}" aria-label="${r.name} thrust">${r.thrustN.toFixed(3)} N</meter><b>${r.thrustN.toFixed(3)} N</b></div>`).join('')}</div>
      <div class="table-scroll" role="region" aria-label="Test results table" tabindex="0"><table><caption>All candidates · 1 L chamber · ${equalFlow ? 'equal gas flow' : 'varying gas flow'}</caption><thead><tr><th scope="col">Design</th><th scope="col">Thrust (N)</th><th scope="col">Isp (s)</th><th scope="col">Gas flow (g/s)</th><th scope="col">Gas / 5 s (g)</th><th scope="col">Area ratio</th></tr></thead><tbody>${ranked.map(r => `<tr><th scope="row">${r.name}</th><td>${r.thrustN.toFixed(3)}</td><td>${r.specificImpulseS.toFixed(2)}</td><td>${(r.massFlowKgPerS * 1000).toFixed(3)}</td><td>${(r.gasUsedKg * 1000).toFixed(3)}</td><td>${r.areaRatio.toFixed(2)}</td></tr>`).join('')}</tbody></table></div>
      <p class="test-help">${equalFlow ? 'With gas flow held equal, higher specific impulse also means higher thrust.' : 'Compare Isp alongside thrust: a design can deliver more force while consuming more gas.'} These are ideal estimates for the displayed candidates only.</p>`;
    $('test-results').hidden = false;
    $('export-test').disabled = false;
    $('test-status').textContent = 'Complete: 5 seconds of ideal steady flow calculated. No real engine was operated.';
  });
  $('export-test').addEventListener('click', () => {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rocket-concept-test.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  return invalidate;
}
