#!/usr/bin/env bash
# One-time: create the initial Voltius.Voltius manifest in microsoft/winget-pkgs
# via komac `new`. Run via the winget-bootstrap workflow (workflow_dispatch).
# After microsoft/winget-pkgs merges this PR, future releases use winget-releaser.
#
# komac `new` is interactive even with metadata flags (it prompts for install
# modes, return codes, protocols, etc.), so we drive it through a pseudo-TTY
# (util-linux `script`) and feed newlines to accept the defaults. komac picks up
# the token from $GITHUB_TOKEN. komac's built-in duplicate-PR check makes re-runs
# safe (it aborts instead of opening a second PR).
#
# Env: GITHUB_TOKEN (WINGET_PKGS_TOKEN), TAG.
set -euo pipefail

TAG="${TAG:?set TAG, e.g. v0.4.0}"
VERSION="${TAG#v}"
BASE="https://github.com/VoltiusApp/voltius/releases/download/${TAG}"

# Install komac (Rust binary; x86_64 ubuntu runner).
KOMAC_VER="$(gh release view -R russellbanks/Komac --json tagName --jq '.tagName' | sed 's/^v//')"
curl -fsSL -o komac.deb \
  "https://github.com/russellbanks/Komac/releases/download/v${KOMAC_VER}/komac_${KOMAC_VER}-1_amd64.deb"
sudo dpkg -i komac.deb

cat > /tmp/komac-new.sh <<SH
set -e
komac new Voltius.Voltius \\
  --version "${VERSION}" \\
  --urls "${BASE}/Voltius_${VERSION}_x64-setup.exe" "${BASE}/Voltius_${VERSION}_arm64-setup.exe" \\
  --publisher "Voltius" --publisher-url "https://voltius.app/" \\
  --package-name "Voltius" --package-url "https://voltius.app/" \\
  --moniker "voltius" --license "AGPL-3.0-only" \\
  --short-description "Cross-platform SSH client and terminal" \\
  --submit
SH

# Drive komac through a pty, feeding newlines to accept every interactive default.
# `timeout` caps a stuck prompt; `script -e` propagates komac's exit code.
timeout 600 script -qefc 'bash /tmp/komac-new.sh' /dev/null \
  < <(while true; do printf '\n'; sleep 2; done)
