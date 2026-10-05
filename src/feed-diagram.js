export function initFeedDiagram() {
  const panel = document.getElementById('feed-panel');
  panel.innerHTML = `
    <div class="test-heading"><div><div class="eyebrow">03 / LIQUID ENGINE CONCEPT</div><h2>Electric pumps, LOX & fuel</h2></div><span class="view-tag">ILLUSTRATION ONLY</span></div>
    <p class="test-description">A liquid bipropellant engine carries fuel and an oxidizer separately. Here, electric motors drive one pump for liquid oxygen (LOX) and one for kerosene fuel. They meet at the injector and burn in the chamber.</p>
    <div class="feed-toolbar"><div class="feed-legend"><span class="oxygen-key">━ LOX · oxidizer</span><span class="fuel-key">━ Kerosene · fuel</span><span class="power-key">┄ Electrical power</span></div><div class="feed-demo-buttons"><button class="button export" id="run-feed" aria-pressed="false">Start engine demo</button><button class="button" id="refill-feed">Refill & reset</button></div></div>
    <div class="feed-levels"><label for="lox-level">LOX remaining <output id="lox-percent">100%</output><meter id="lox-level" min="0" max="100" value="100">100%</meter></label><label for="fuel-level">Fuel remaining <output id="fuel-percent">100%</output><meter id="fuel-level" min="0" max="100" value="100">100%</meter></label><div class="feed-time">Demo time <output id="feed-time">0.0 / 20 s</output></div></div>
    <p class="test-status" id="feed-status" role="status">Ready. Start the illustrative 20-second engine demo.</p>
    <figure class="feed-figure">
      <div class="feed-scroll" role="region" aria-label="Electric pump feed schematic; scroll horizontally on small screens" tabindex="0">
        <svg id="feed-diagram" viewBox="0 0 900 720" role="img" aria-labelledby="feed-title feed-desc">
          <title id="feed-title">Electric pump-fed LOX and kerosene engine</title>
          <desc id="feed-desc">Separate LOX and fuel tanks feed separate pumps. A battery and motor controllers power two electric motors, which turn the pumps through shafts. Both propellant lines lead to an injector, then a combustion chamber and nozzle. Electrical power drives the pumps; combustion supplies the exhaust energy.</desc>
          <defs>
            <clipPath id="lox-tank-clip"><rect x="70" y="40" width="200" height="100" rx="28"/></clipPath>
            <clipPath id="fuel-tank-clip"><rect x="630" y="40" width="200" height="100" rx="28"/></clipPath>
            <linearGradient id="exhaust-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c9"/><stop offset=".25" stop-color="#ffbe62"/><stop offset=".7" stop-color="#f47b36" stop-opacity=".8"/><stop offset="1" stop-color="#ef552b" stop-opacity="0"/></linearGradient>
            <linearGradient id="exhaust-core-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffcef"/><stop offset="1" stop-color="#ffe19b" stop-opacity="0"/></linearGradient>
            <marker id="oxygen-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#80cfff"/></marker>
            <marker id="fuel-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#f4a261"/></marker>
            <marker id="power-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#a5d7ac"/></marker>
          </defs>
          <g class="feed-tank oxygen-tank"><rect x="70" y="40" width="200" height="100" rx="28"/><rect class="tank-liquid" id="lox-liquid" x="70" y="40" width="200" height="100" clip-path="url(#lox-tank-clip)"/><text x="170" y="77">LOX tank</text><text class="feed-small" x="170" y="97">Liquid oxygen · oxidizer</text></g>
          <g class="feed-tank fuel-tank"><rect x="630" y="40" width="200" height="100" rx="28"/><rect class="tank-liquid" id="fuel-liquid" x="630" y="40" width="200" height="100" clip-path="url(#fuel-tank-clip)"/><text x="730" y="77">Fuel tank</text><text class="feed-small" x="730" y="97">Kerosene · RP-1 example</text></g>
          <g class="feed-power-box"><rect x="370" y="28" width="160" height="58" rx="8"/><text x="450" y="54">Battery pack</text><text class="feed-small" x="450" y="73">Electrical energy</text><rect x="375" y="118" width="150" height="54" rx="8"/><text x="450" y="142">Motor controllers</text><text class="feed-small" x="450" y="159">Power to both motors</text></g>
          <g class="feed-power-lines"><path class="flow-line" d="M450 86 V114"/><path class="flow-line" d="M375 144 H320 V225"/><path class="flow-line" d="M525 144 H580 V225"/></g>
          <g class="feed-motors"><rect x="270" y="232" width="100" height="56" rx="8"/><g class="motor-rotor" style="transform-origin:286px 260px"><circle cx="286" cy="260" r="11"/><path d="M286 249 V271 M275 260 H297 M278 252 L294 268 M278 268 L294 252"/></g><text x="333" y="256">Electric</text><text x="333" y="273">motor</text><rect x="530" y="232" width="100" height="56" rx="8"/><g class="motor-rotor" style="transform-origin:614px 260px"><circle cx="614" cy="260" r="11"/><path d="M614 249 V271 M603 260 H625 M606 252 L622 268 M606 268 L622 252"/></g><text x="567" y="256">Electric</text><text x="567" y="273">motor</text></g>
          <g class="feed-shafts"><path d="M270 260 H204 M630 260 H696"/><text x="237" y="245">Shaft</text><text x="663" y="245">Shaft</text></g>
          <g class="feed-oxygen-lines"><path class="flow-line" d="M170 140 V220"/><path class="flow-line" d="M170 296 V360 H385"/></g>
          <g class="feed-fuel-lines"><path class="flow-line" d="M730 140 V220"/><path class="flow-line" d="M730 296 V360 H515"/></g>
          <g class="feed-pump oxygen-pump"><circle cx="170" cy="260" r="35"/><g class="pump-rotor" style="transform-origin:170px 260px"><path d="M170 239 L179 253 L192 267 L175 269 L158 281 L161 263 L150 247 L168 251 Z"/></g><text x="100" y="319">LOX pump</text></g>
          <g class="feed-pump fuel-pump"><circle cx="730" cy="260" r="35"/><g class="pump-rotor" style="transform-origin:730px 260px"><path d="M730 239 L739 253 L752 267 L735 269 L718 281 L721 263 L710 247 L728 251 Z"/></g><text x="800" y="319">Fuel pump</text></g>
          <g class="feed-engine"><rect x="390" y="336" width="120" height="48" rx="5"/><text x="450" y="366">Injector</text><path d="M400 384 V427 Q400 444 437 463 Q441 485 384 533 H516 Q459 485 463 463 Q500 444 500 427 V384 Z"/><path class="feed-core" d="M413 387 V425 Q413 439 444 459 Q450 487 407 525 H493 Q450 487 456 459 Q487 439 487 425 V387 Z"/><text x="617" y="416">Combustion chamber</text><text class="feed-small" x="617" y="435">Chemical energy → hot gas</text><path class="feed-leader" d="M510 415 H534"/><text x="581" y="501">Nozzle</text><path class="feed-leader" d="M509 501 H540"/><text class="feed-small" x="590" y="579">EXHAUST ↓</text></g>
          <g id="feed-flame" aria-hidden="true"><path class="exhaust-outer" d="M391 533 Q385 578 414 622 Q432 657 450 704 Q468 657 486 622 Q515 578 509 533 Z"/><path class="exhaust-inner" d="M414 534 Q413 582 450 654 Q487 582 486 534 Z"/></g>
        </svg>
      </div>
      <figcaption>Illustrative animation: both tanks drain over an arbitrary 20 seconds, with automatic cutoff at empty. Percentages are relative to each tank, not equal masses or a mixture ratio. Motor speed, flame appearance and timing are not physical predictions or an ignition procedure. On narrow screens, scroll the diagram sideways.</figcaption>
    </figure>
    <div class="feed-notes"><div><h3>Why two tanks?</h3><p>LOX is the oxidizer, not the fuel. The two propellants stay separate until injection. A rocket carries its oxidizer so it can burn fuel without atmospheric oxygen.</p></div><div><h3>What does “electric” mean?</h3><p>The battery powers the pump motors. The pumps move and pressurize the liquids; the chemical reaction supplies most of the exhaust energy. Electric pumps are one feed option, alongside pressure-fed and turbine-driven systems.</p></div><div><h3>What is being simulated?</h3><p>The test panel below still models nitrogen cold gas: no LOX, fuel or combustion. Its thrust and Isp numbers do not describe this liquid engine. Pump power, combustion, cooling and feed losses are not calculated.</p></div></div>
    <p class="test-help">This simplified drawing omits valves, pressurization, cooling circuits and ignition. Background: <a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/liquid-rocket-engine/" target="_blank" rel="noreferrer">NASA liquid engines</a>. Real-world example: <a href="https://rocketlabcorp.com/launch/electron/" target="_blank" rel="noreferrer">Rocket Lab’s electric-pump-fed Rutherford</a>.</p>`;
  const $ = id => document.getElementById(id);
  const durationMs = 20000;
  let elapsedMs = 0;
  let startedAt = 0;
  let timer = null;
  let running = false;

  function updateLevels() {
    const remaining = Math.max(0, 100 * (1 - elapsedMs / durationMs));
    const percent = Math.ceil(remaining);
    for (const tank of ['lox', 'fuel']) {
      $(`${tank}-percent`).textContent = `${percent}%`;
      $(`${tank}-level`).value = remaining;
      $(`${tank}-level`).textContent = `${percent}%`;
      $(`${tank}-liquid`).setAttribute('y', String(140 - remaining));
      $(`${tank}-liquid`).setAttribute('height', String(remaining));
    }
    $('feed-time').textContent = `${(elapsedMs / 1000).toFixed(1)} / 20 s`;
  }

  function stop(message) {
    running = false;
    clearInterval(timer);
    timer = null;
    panel.classList.remove('feed-animating', 'feed-burning');
    $('run-feed').setAttribute('aria-pressed', 'false');
    $('run-feed').disabled = elapsedMs >= durationMs;
    $('run-feed').textContent = elapsedMs >= durationMs ? 'Tanks empty' : 'Resume engine demo';
    $('feed-status').textContent = message;
  }

  function tick() {
    elapsedMs = Math.min(durationMs, performance.now() - startedAt);
    updateLevels();
    if (elapsedMs >= durationMs) stop('Tanks empty. Motors and flame stopped automatically. Refill to run again.');
  }

  $('run-feed').addEventListener('click', () => {
    if (running) {
      tick();
      if (running) stop('Stopped. Tank levels are held; resume the demo or refill.');
      return;
    }
    if (elapsedMs >= durationMs) return;
    running = true;
    startedAt = performance.now() - elapsedMs;
    panel.classList.add('feed-animating', 'feed-burning');
    $('run-feed').setAttribute('aria-pressed', 'true');
    $('run-feed').textContent = 'Stop engine demo';
    $('feed-status').textContent = 'Demo running: motors spinning, chamber lit, exhaust visible, tanks draining.';
    timer = setInterval(tick, 100);
  });

  $('refill-feed').addEventListener('click', () => {
    stop('Refilled. Both tanks are full; ready for another demo.');
    elapsedMs = 0;
    updateLevels();
    $('run-feed').disabled = false;
    $('run-feed').textContent = 'Start engine demo';
  });
}
