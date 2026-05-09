#!/bin/bash
set -e

VERSION="${VERSION:-main}"
REPO="TinaQian2017/openclaw-dashboard-chat-mark-plugin"

echo "=== OpenClaw Chat Mark Plugin Installer ==="
echo "Version: $VERSION"

# Find OpenClaw dist directory
DIST_DIR=$(npm root -g 2>/dev/null)/openclaw/dist/control-ui
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Could not find OpenClaw dist/control-ui directory."
  echo "Is OpenClaw installed? Run: npm list -g openclaw"
  exit 1
fi

echo "Found OpenClaw dist at: $DIST_DIR"

# Determine download URL based on version
if [ "$VERSION" = "main" ]; then
  PLUGIN_URL="https://raw.githubusercontent.com/$REPO/main/openclaw-at-plugin.js"
else
  PLUGIN_URL="https://raw.githubusercontent.com/$REPO/$VERSION/openclaw-at-plugin.js"
fi

echo "Downloading plugin from: $PLUGIN_URL"
curl -sL -o "$DIST_DIR/openclaw-at-plugin.js" "$PLUGIN_URL"
echo "Plugin copied to: $DIST_DIR/openclaw-at-plugin.js"

# Inject script tag into index.html (cross-platform: works on Linux, macOS, Git Bash on Windows)
INDEX="$DIST_DIR/index.html"
if grep -q 'openclaw-at-plugin.js' "$INDEX"; then
  echo "Script tag already present in index.html — skipping injection."
else
  # Use a portable replacement that works on both GNU sed and BSD sed (macOS)
  NODE_SCRIPT="
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');
if (!content.includes('openclaw-at-plugin.js')) {
  content = content.replace(/<script/g, '<script src=\"./openclaw-at-plugin.js\"></script><script');
  fs.writeFileSync(path, content);
  console.log('Script tag injected into: ' + path);
} else {
  console.log('Script tag already present — skipping.');
}
"
  node -e "$NODE_SCRIPT" "$INDEX"
fi

echo ""
echo "=== Done! Restart OpenClaw gateway to take effect ==="