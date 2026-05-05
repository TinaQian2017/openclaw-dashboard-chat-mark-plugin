#!/bin/bash
set -e

echo "=== OpenClaw @ Plugin Installer ==="

# Find OpenClaw dist directory
DIST_DIR=$(npm root -g 2>/dev/null)/openclaw/dist/control-ui
if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Could not find OpenClaw dist/control-ui directory."
  echo "Is OpenClaw installed? Run: npm list -g openclaw"
  exit 1
fi

echo "Found OpenClaw dist at: $DIST_DIR"

# Download openclaw-at-plugin.js
PLUGIN_URL="https://raw.githubusercontent.com/TinaQian2017/openclaw-at-plugin/main/openclaw-at-plugin.js"
echo "Downloading plugin from GitHub..."
curl -s -o "$DIST_DIR/openclaw-at-plugin.js" "$PLUGIN_URL"
echo "Plugin copied to: $DIST_DIR/openclaw-at-plugin.js"

# Inject script tag into index.html
INDEX="$DIST_DIR/index.html"
if grep -q 'openclaw-at-plugin.js' "$INDEX"; then
  echo "Script tag already present in index.html — skipping injection."
else
  sed -i 's|<script|<script src="./openclaw-at-plugin.js"></script><script|' "$INDEX"
  echo "Script tag injected into: $INDEX"
fi

echo ""
echo "=== Done! Restart OpenClaw gateway to take effect ==="