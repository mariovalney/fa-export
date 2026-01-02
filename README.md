# Font Awesome SVG → PNG Exporter

This project converts **Font Awesome Free SVG icons** into **PNG files** with
controlled padding, transparent background, and forced white color using
`currentColor`.

It is designed for batch exporting icons in multiple sizes with a clean and
predictable directory structure.


## Features

- Converts **Font Awesome Free** SVGs (`solid`, `regular`, `brands`)
- Outputs PNG with:
  - Transparent background
  - White icons via `currentColor`
  - Controlled padding
- Generates multiple sizes in one run
- Progress bar in terminal
- Cleans output directory before exporting


## Generated Sizes

- **800×800** with **110px padding**
- **196×196** with proportional padding


## Output Structure

```

out/
├─ 800/
│   ├─ solid/
│   ├─ regular/
│   └─ brands/
├─ 196/
│   ├─ solid/
│   ├─ regular/
│   └─ brands/
````


## Requirements

- Node.js 18+
- npm


## Installation

```bash
npm install
````


## Usage

```bash
npm start
```

This will:

1. Remove the existing `out/` directory (if present)
2. Convert all Font Awesome SVG icons
3. Generate PNGs in both sizes with a progress bar


## Notes

* Only **Font Awesome Free** icons are included by default
* Make sure you comply with Font Awesome licensing if you adapt this for Pro
* The script does not depend on `process.cwd()` and can be run from anywhere


## Credits

* Script author: **Mário Valney with ChatGPT**