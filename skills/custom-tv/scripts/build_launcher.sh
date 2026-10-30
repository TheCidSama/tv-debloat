#!/usr/bin/env bash
# Build the glass TV-layout AeroTizen launcher: clone AeroTizen at the pinned commit,
# apply the patch, install dependencies, build, and (unless --no-test) run the checks.
# Usage: build_launcher.sh <workdir> [--no-test]
# Output: <workdir>/AeroTizen/dist/launcher, ready for `aerotizen install`.
set -euo pipefail

COMMIT=64574228cee973095af590cd9ff387467e84d3b7
REPO=https://github.com/helalaou/AeroTizen
HERE="$(cd "$(dirname "$0")" && pwd)"
PATCH="$HERE/../patches/aerotizen-glass-tv-layout.patch"

WORK="${1:?usage: build_launcher.sh <workdir> [--no-test]}"
TEST=1; [ "${2:-}" = "--no-test" ] && TEST=0

command -v git >/dev/null || { echo "git is required"; exit 1; }
command -v npm >/dev/null || { echo "Node.js 20.19+ or 22.12+ with npm is required"; exit 1; }

mkdir -p "$WORK"
cd "$WORK"
if [ -d AeroTizen/.git ]; then
  # Never discard someone's edits: an existing checkout must be clean.
  if [ -n "$(git -C AeroTizen status --porcelain)" ]; then
    echo "$WORK/AeroTizen has local changes; use another workdir or clean it yourself."; exit 1
  fi
else
  git clone --quiet "$REPO" AeroTizen
fi
cd AeroTizen
git fetch --quiet origin
git checkout --quiet "$COMMIT"
git apply --check "$PATCH"
git apply "$PATCH"
echo "Patched AeroTizen ${COMMIT:0:7}"

npm ci --no-audit --no-fund
npm run build
if [ "$TEST" = 1 ]; then
  npm run lint
  npm test
  npx playwright install chromium >/dev/null 2>&1 || true
  npx playwright test --workers=1
fi
echo
echo "Built: $PWD/dist/launcher"
echo "Install: aerotizen --tv TV_IP install \"$PWD/dist/launcher\""
