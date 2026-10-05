const defaults = { chamber: 52, throat: 35, bell: 72, length: 64, accent: '#f4a261' };
const presets = {
  balanced: { chamber: 52, throat: 35, bell: 72, length: 64 },
  compact: { chamber: 42, throat: 39, bell: 60, length: 42 },
  wide: { chamber: 68, throat: 43, bell: 78, length: 70 },
};
let model = { ...defaults };

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#" aria-label="Rocket Concept Studio home"><span class="brand-mark">✳</span> ROCKET <b>CONCEPT STUDIO</b></a>
    <div class="top-actions"><span class="save-state"><i></i> LOCAL MODEL</span><button class="button quiet" id="reset">Reset</button><button class="button export" id="export">Export JSON <span>↗</span></button></div>
  </header>
  <main>
    <section class="intro">
      <div><div class="eyebrow">PARAMETRIC VISUALIZER <span>•</span> VERSION 0.1</div><h1>Shape the concept.</h1><p>Explore how changing proportions alters a simplified engine cutaway.</p></div>
      <div class="notice"><span class="notice-icon">ⓘ</span><div><strong>Concept model only</strong><p>Controls use normalized visual values. No physical units, performance predictions, or build specifications.</p></div></div>
    </section>
    <section class="workspace">
      <aside class="panel controls">
        <div class="panel-heading"><div><div class="eyebrow">01 / PARAMETERS</div><h2>Geometry</h2></div><span class="sliders-icon">☷</span></div>
        <div class="control-list">
          <label class="control" for="chamber"><span class="control-title">Chamber proportion <output id="chamberOut"></output></span><input id="chamber" type="range" min="25" max="78" value="52"><span class="range-ends"><span>Compact</span><span>Extended</span></span></label>
          <label class="control" for="throat"><span class="control-title">Throat proportion <output id="throatOut"></output></span><input id="throat" type="range" min="20" max="54" value="35"><span class="range-ends"><span>Narrow</span><span>Broad</span></span></label>
          <label class="control" for="bell"><span class="control-title">Exit proportion <output id="bellOut"></output></span><input id="bell" type="range" min="42" max="96" value="72"><span class="range-ends"><span>Restrained</span><span>Expanded</span></span></label>
          <label class="control" for="length"><span class="control-title">Nozzle length <output id="lengthOut"></output></span><input id="length" type="range" min="35" max="88" value="64"><span class="range-ends"><span>Short</span><span>Long</span></span></label>
        </div>
        <div class="preset-section"><div class="eyebrow">STARTING SHAPES</div><div class="preset-buttons"><button class="preset active" data-preset="balanced">Balanced</button><button class="preset" data-preset="compact">Compact</button><button class="preset" data-preset="wide">Wide bell</button></div></div>
        <div class="panel-foot"><span class="foot-dot"></span> Changes update the concept view live</div>
      </aside>
      <section class="panel viewport">
        <div class="view-heading"><div><div class="eyebrow">02 / LIVE PREVIEW</div><h2>Longitudinal cutaway</h2></div><span class="view-tag"><i></i> 2D SCHEMATIC</span></div>
        <div class="canvas" id="canvas"><div class="canvas-grid"></div><div class="axis-label top">SIDE VIEW <span>•</span> SCHEMATIC</div><div class="engine-wrap"><svg id="engine" viewBox="0 0 720 360" role="img" aria-label="Parametric rocket engine concept cutaway"></svg></div><div class="dim-label label-chamber"><span>01</span> CHAMBER</div><div class="dim-label label-throat"><span>02</span> THROAT</div><div class="dim-label label-nozzle"><span>03</span> NOZZLE</div><div class="axis-line"></div><div class="axis-label bottom">VISUAL PROPORTIONS <span>•</span> NO SCALE</div></div>
        <div class="legend"><span><i class="legend-shell"></i> Outer structure</span><span><i class="legend-core"></i> Interior profile</span><span><i class="legend-axis"></i> Centerline</span><span class="legend-note">Drag controls to explore</span></div>
      </section>
    </section>
    <section class="bottom-row"><div class="panel summary"><div class="eyebrow">MODEL SNAPSHOT</div><div class="metrics"><div><span>Profile</span><strong id="profileName">Balanced</strong></div><div><span>Chamber</span><strong id="chamberMetric">52 <small>/ 100</small></strong></div><div><span>Throat</span><strong id="throatMetric">35 <small>/ 100</small></strong></div><div><span>Exit</span><strong id="bellMetric">72 <small>/ 100</small></strong></div><div><span>Nozzle length</span><strong id="lengthMetric">64 <small>/ 100</small></strong></div></div></div><div class="panel next-card"><div class="next-icon">↗</div><div><div class="eyebrow">NEXT ITERATION</div><p>Future versions could add labeled layers, comparison views, and shareable concept files.</p></div></div></section>
    <footer><span>ROCKET CONCEPT STUDIO <b>0.1.0</b></span><span>Open source starter · <a href="https://github.com/livonianerd/rocket-concept-studio" target="_blank" rel="noreferrer">View on GitHub</a></span></footer>
  </main>`;

const fields = ['chamber', 'throat', 'bell', 'length'];
const $ = (id) => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function pointsForModel() {
  const cx = 355, y = 180;
  const chamberHalf = 30 + model.chamber * 0.55;
  const throatHalf = 12 + model.throat * 0.36;
  const exitHalf = 34 + model.bell * 0.83;
  const nozzleLength = 125 + model.length * 2.05;
  const left = 105, chamberEnd = 290, throatX = 355, exitX = Math.min(670, throatX + nozzleLength);
  const shoulder = 24 + model.throat * 0.18;
  const upper = `M ${left} ${y - chamberHalf} L ${chamberEnd} ${y - chamberHalf} C ${chamberEnd + 25} ${y - chamberHalf} ${throatX - 48} ${y - throatHalf - shoulder} ${throatX} ${y - throatHalf} C ${throatX + 50} ${y - throatHalf + 6} ${exitX - 65} ${y - exitHalf * 0.76} ${exitX} ${y - exitHalf}`;
  const lower = `L ${exitX} ${y + exitHalf} C ${exitX - 65} ${y + exitHalf * 0.76} ${throatX + 50} ${y + throatHalf - 6} ${throatX} ${y + throatHalf} C ${throatX - 48} ${y + throatHalf + shoulder} ${chamberEnd + 25} ${y + chamberHalf} ${chamberEnd} ${y + chamberHalf} L ${left} ${y + chamberHalf} Z`;
  const cavityTop = `M ${left + 20} ${y - chamberHalf + 9} L ${chamberEnd - 5} ${y - chamberHalf + 9} C ${chamberEnd + 23} ${y - chamberHalf + 9} ${throatX - 43} ${y - throatHalf - shoulder + 10} ${throatX} ${y - throatHalf + 9} C ${throatX + 50} ${y - throatHalf + 14} ${exitX - 65} ${y - exitHalf * 0.76 + 9} ${exitX - 3} ${y - exitHalf + 9}`;
  const cavityBottom = `L ${exitX - 3} ${y + exitHalf - 9} C ${exitX - 65} ${y + exitHalf * 0.76 - 9} ${throatX + 50} ${y + throatHalf - 14} ${throatX} ${y + throatHalf - 9} C ${throatX - 43} ${y + throatHalf + shoulder - 10} ${chamberEnd + 23} ${y + chamberHalf - 9} ${chamberEnd - 5} ${y + chamberHalf - 9} L ${left + 20} ${y + chamberHalf - 9} Z`;
  return { shell: `${upper} ${lower}`, cavity: `${cavityTop} ${cavityBottom}`, y, left, chamberEnd, throatX, exitX, chamberHalf, throatHalf, exitHalf };
}

function render() {
  const g = pointsForModel();
  $('engine').innerHTML = `
    <defs><linearGradient id="shellFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#62747a" stop-opacity=".34"/><stop offset=".5" stop-color="#283940" stop-opacity=".52"/><stop offset="1" stop-color="#62747a" stop-opacity=".34"/></linearGradient><linearGradient id="coreFill" x1="0" x2="1"><stop offset="0" stop-color="#f4a261" stop-opacity=".07"/><stop offset=".65" stop-color="#f4a261" stop-opacity=".24"/><stop offset="1" stop-color="#ffcf87" stop-opacity=".42"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <line x1="45" y1="180" x2="682" y2="180" stroke="#6e8287" stroke-opacity=".45" stroke-width="1" stroke-dasharray="5 7" />
    <path d="${g.shell}" fill="url(#shellFill)" stroke="#9eafb0" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="${g.cavity}" fill="url(#coreFill)" stroke="#f5b06b" stroke-opacity=".74" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M 126 ${180-g.chamberHalf+9} L 126 ${180+g.chamberHalf-9} M 270 ${180-g.chamberHalf+9} L 270 ${180+g.chamberHalf-9}" stroke="#a9b8b7" stroke-opacity=".55" stroke-width="1"/>
    <path d="M ${g.throatX+18} 180 C ${g.throatX+85} 180 ${g.exitX-58} 180 ${g.exitX-5} 180" stroke="#ffd293" stroke-width="2" stroke-opacity=".75" stroke-dasharray="4 7" filter="url(#glow)"/>
    <path d="M ${g.left} ${180-g.chamberHalf-20} v -9 h ${g.chamberEnd-g.left} v 9" fill="none" stroke="#62787c" stroke-width="1"/><text x="${(g.left+g.chamberEnd)/2}" y="${180-g.chamberHalf-35}" text-anchor="middle" fill="#8ca0a2" font-size="10" letter-spacing="2">PROPORTION</text>
    <circle cx="${g.left}" cy="180" r="3" fill="#f4a261"/><circle cx="${g.throatX}" cy="180" r="3" fill="#f4a261"/><circle cx="${g.exitX}" cy="180" r="3" fill="#f4a261"/>`;
  for (const field of fields) {
    $(`${field}Out`).textContent = String(model[field]).padStart(2, '0');
    $(`${field}Metric`).innerHTML = `${model[field]} <small>/ 100</small>`;
    $(field).value = model[field];
  }
  const match = Object.entries(presets).find(([, p]) => fields.every((f) => p[f] === model[f]));
  $('profileName').textContent = match ? ({balanced:'Balanced', compact:'Compact', wide:'Wide bell'}[match[0]]) : 'Custom';
  document.querySelectorAll('.preset').forEach((b) => b.classList.toggle('active', match?.[0] === b.dataset.preset));
}

fields.forEach((field) => $(field).addEventListener('input', (event) => { model[field] = Number(event.target.value); render(); }));
document.querySelectorAll('.preset').forEach((button) => button.addEventListener('click', () => { model = { ...model, ...presets[button.dataset.preset] }; render(); }));
$('reset').addEventListener('click', () => { model = { ...defaults }; render(); });
$('export').addEventListener('click', () => {
  const data = { format: 'rocket-concept-studio', version: 1, model_type: 'visual-only', units: null, parameters: Object.fromEntries(fields.map((f) => [f, model[f]])), note: 'Normalized visual proportions only. Not an engineering design or build specification.' };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'rocket-concept.json'; a.click(); URL.revokeObjectURL(url);
});
render();
