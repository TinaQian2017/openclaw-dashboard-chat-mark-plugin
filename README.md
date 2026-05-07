# OpenClaw @ Plugin

A browser-side plugin for OpenClaw Control UI that lets you mark individual chat messages as context and inject them into your conversations as reference material. There is no risk of hurting your Openclaw by installing the plugin, so please feel free to try out! 

<img width="1948" height="1064" alt="20260507230013" src="https://github.com/user-attachments/assets/33319660-06e4-49d2-b473-4fa4bdef51f8" />


## What It Does

When you're in a long conversation with an agent, sometimes you want to reference specific earlier messages. This plugin adds a **@ button** to every message. Click it to **mark** that message for context. Selected messages get collected in a **Marked Context** panel on the right side of the screen.

When you send a new message, all marked messages are automatically prepended to your input as a code block, formatted like this:

```
=== Marked Context (selected by user) ===
<<USER>>
the user's original message
<<AGENT>>
the agent's original response
```

This lets you give the agent "live" context from specific points in your conversation without copy-pasting manually.

## How It Works

- **@ Button** — appears on hover over every chat message
- **Mark / Unmark** — click @ to toggle a message in/out of context
- **Right Panel** — shows all currently marked messages, click "Clear All Marks" to reset
- **Auto-Inject** — on next send, all marked context is appended to your message automatically via WebSocket interception

## Quick Install (one command)

```bash
curl -sL "https://raw.githubusercontent.com/TinaQian2017/openclaw-at-plugin/main/install.sh" | bash
```

This will:
1. Find your OpenClaw `dist/control-ui/` directory
2. Download the plugin file into it
3. Inject the `<script>` tag into `index.html`

Then restart OpenClaw gateway to take effect.

## Manual Install

### Step 1: Find your OpenClaw dist directory

```bash
OPENCLAW_DIST=$(npm root -g)/openclaw/dist/control-ui
echo "Plugin destination: $OPENCLAW_DIST"
```

### Step 2: Download the plugin file

```bash
curl -sL -o "$OPENCLAW_DIST/openclaw-at-plugin.js"   "https://raw.githubusercontent.com/TinaQian2017/openclaw-at-plugin/main/openclaw-at-plugin.js"
```

### Step 3: Inject the script tag into index.html

```bash
if grep -q 'openclaw-at-plugin.js' "$OPENCLAW_DIST/index.html"; then
  echo "Script tag already present — skipping."
else
  sed -i 's|<script|<script src="./openclaw-at-plugin.js"></script><script|'     "$OPENCLAW_DIST/index.html"
fi
```

### Step 4: Restart OpenClaw

Restart the gateway to load the updated Control UI.

## Plugin Removal

Feel free to test the plugin and remove afterwards. Removing the plugin follows the same steps as install but in reverse.

```bash
# Remove script tag from index.html
sed -i 's|<script src="./openclaw-at-plugin.js"></script>|{'   "$OPENCLAW_DIST/index.html"

# Delete plugin file, this is optional
rm "$OPENCLAW_DIST/openclaw-at-plugin.js"
```

Then restart OpenClaw gateway.

## File Structure

```
openclaw-at-plugin.js   — The plugin (single file, no dependencies)
install.sh              — One-command installer
README.md               — This file
```

## Privacy Note

This plugin runs entirely in your browser. It does not send any data to external servers. Marked context is only injected into your local OpenClaw conversation via WebSocket.

## Known Limitations

- The plugin file in `dist/control-ui/` is overwritten on OpenClaw updates. Run the install command again after updating.
- Long messages without spaces may overflow the chat area (CSS `overflow-x: auto` is applied for scroll).
- Currently designed for the OpenClaw Control UI only; other UI surfaces may not support the DOM structure this plugin relies on.

## License

MIT — do whatever you want with it.
