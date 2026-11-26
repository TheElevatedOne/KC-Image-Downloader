#!/usr/bin/env bash
# Render the extension icons from the SVG sources (needs rsvg-convert from librsvg).
set -euo pipefail
cd "$(dirname "$0")/extension/env/img"
rsvg-convert -w 16 -h 16 icon16.svg -o icon16x16.png
for s in 32 48 128; do
    rsvg-convert -w "$s" -h "$s" icon.svg -o "icon${s}x${s}.png"
done
ls -1 icon*x*.png
