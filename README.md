# Rocket Concept Studio

[Live app](https://livonianerd.github.io/rocket-concept-studio/) · [Source](https://github.com/livonianerd/rocket-concept-studio)

A small, open source, browser-based visualizer for exploring **non-operational rocket engine concepts**. Adjust normalized proportions and see the simplified longitudinal cutaway update live.

## Scope

The geometry sliders are normalized visual proportions. The optional educational test panel estimates ideal nitrogen cold-gas performance using an explicitly assumed scale; these are not validated predictions for real hardware. There is no combustion, structural analysis, or manufacturing model.

## Electric-pump feed illustration

The LOX/kerosene diagram shows separate tanks and pumps, two electric motors, a battery and motor controllers, followed by the injector, combustion chamber and nozzle. Animate/pause illustrates flow direction only; reduced-motion preferences are respected. This is a conceptual diagram, not a plumbing or startup sequence. Valves, pressurization, cooling and ignition are omitted.

LOX is the oxidizer; kerosene is the example fuel. Electricity drives the pumps, while combustion supplies exhaust energy. This illustration is separate from the nitrogen test model below: its results must not be interpreted as LOX/kerosene performance.

## Educational test run

Click **Run test & compare** to calculate a five-second steady-flow example for the current shape and all three presets. The panel reports thrust (N), specific impulse (s), gas flow (g/s), total impulse (N·s), and gas consumed (g). Results and their assumptions can be exported separately from the visual model.

Every candidate uses a **1 L chamber**, nitrogen at **500 kPa absolute and 300 K**, exhausting into **vacuum**. An ideal external supply holds pressure and temperature constant. This is not a sealed reservoir draining over five seconds. Chamber volume does not set thrust in this steady-flow model; chamber and nozzle-length sliders remain visual only.

**Equal gas flow** is enabled by default: nozzle shapes are scaled to a common assumed throat area while preserving exit-to-throat area ratio. Turn it off to compare varying throat areas at the same chamber volume and conditions. Higher thrust can then mean more gas consumed, so compare specific impulse too. Winners are only among the displayed candidates; no global optimization or real-engine validation is implied.

The solver uses the supersonic area–Mach relation, choked mass flow, and ideal isentropic exit conditions. It includes both momentum and pressure thrust. See [NASA thrust equations](https://www.grc.nasa.gov/WWW/k-12/airplane/rktthsum.html) and [NASA specific impulse](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/). Constants: γ = 1.4, R = 296.8 J/(kg·K), g₀ = 9.80665 m/s².

The arbitrary visual mapping is `Ae/At = ((34 + 0.83*bell)/(12 + 0.36*throat))²`. Equal-flow throat area is 1 mm²; variable-flow throat area is `1 mm² * ((12 + 0.36*throat)/24.6)²`. This uses schematic outer radii as illustrative proxies, not actual flow geometry. Startup, shutdown, friction, heat transfer, depletion, real-gas effects and contour losses are omitted. The model is for education, not hardware design or operation.

## Run locally

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm run dev
```

Open `http://localhost:8080`. For a production build, run `npm run build`; the static site is written to `dist/`. Run `npm run preview` to serve that build locally.

## Validate

Install the test dependencies with `npm ci`, then install Chromium with `npx playwright install chromium`. Run `npm test` to check the numerical solver against an analytic reference, mass/energy conservation and comparison invariants, then build and validate the controls, reports, stale-result handling and desktop/mobile layouts in a browser.

## Publish with GitHub Pages

1. Create a public GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
3. The included workflow builds the site and deploys it after each push to `main`. You can also run it from the **Actions** tab with **Run workflow**.
4. GitHub will show the published URL under **Settings → Pages**.

The workflow uses the standard Pages artifact deployment and does not require a hard-coded repository path.

## Features

- Live 2D cutaway schematic with responsive parameter sliders
- Balanced, compact, and wide-bell presets
- Reset to the starter profile
- Export a JSON snapshot of the visual parameters
- Educational cold-gas test with equal-volume comparisons, thrust and specific impulse
- Equal-flow and variable-flow comparisons with downloadable test reports
- GitHub Actions build and GitHub Pages deployment

## License

MIT. See [LICENSE](LICENSE).
