#!/usr/bin/env bash
# Package the extension into dist/ for Chrome (Chromium, Edge, Opera, Brave) and Firefox.
# Both use the same Manifest V3 source; the zips only differ in name.
# Usage: ./build.sh            -> dist/kc-image-downloader-<version>-{chrome,firefox}.zip
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
src="$root/extension"
dist="$root/dist"

command -v zip >/dev/null || { echo "build.sh: 'zip' is required" >&2; exit 1; }

version="$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$src/manifest.json" | head -n1)"
[ -n "$version" ] || { echo "build.sh: no version in manifest.json" >&2; exit 1; }

# every script the manifest and background.js reference must exist
missing=0
for f in $(grep -oE '"(lib|env|widget)/[^"*]+\.js"' "$src/manifest.json" "$src/background.js" | cut -d'"' -f2 | sort -u); do
    [ -f "$src/$f" ] || { echo "build.sh: missing $f" >&2; missing=1; }
done
[ "$missing" -eq 0 ] || exit 1

if command -v node >/dev/null; then
    find "$src" -name '*.js' -print0 | xargs -0 -n1 node --check
fi

mkdir -p "$dist"
for target in chrome firefox; do
    out="$dist/kc-image-downloader-$version-$target.zip"
    rm -f "$out"
    (cd "$src" && zip -qr -X "$out" . -x 'README.md' -x '*/README.md' -x '.*')
    echo "$out"
done
