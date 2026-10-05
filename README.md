# Rocket Concept Studio

[Live app](https://livonianerd.github.io/rocket-concept-studio/) · [Source](https://github.com/livonianerd/rocket-concept-studio)

A small, open source, browser-based visualizer for exploring **non-operational rocket engine concepts**. Adjust normalized proportions and see the simplified longitudinal cutaway update live.

## Scope

This is a visual concept model. Its parameters have no physical units and do not represent validated engineering relationships. It does not calculate thrust, pressure, temperature, propellant flow, or structural loads, and it does not provide manufacturing dimensions or instructions. Do not use its output to design, build, or operate propulsion hardware.

## Run locally

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm run dev
```

Open `http://localhost:8080`. For a production build, run `npm run build`; the static site is written to `dist/`. Run `npm run preview` to serve that build locally.

## Validate

Install the test dependencies with `npm ci`, then install Chromium with `npx playwright install chromium`. Run `npm test` to build and check presets, slider updates, reset, JSON export, and desktop/mobile layouts in a browser.

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
- GitHub Actions build and GitHub Pages deployment

## License

MIT. See [LICENSE](LICENSE).
