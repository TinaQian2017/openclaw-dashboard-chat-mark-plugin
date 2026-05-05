# OpenClaw @ Plugin

A browser-side plugin for OpenClaw Control UI that lets you mark individual chat messages as context and inject them into your conversations as reference material.

## What It Does

When you're in a long conversation with an agent, sometimes you want to reference specific earlier messages. This plugin adds a **@ button** to every message. Click it to **mark** that message for context. Selected messages get collected in a **Marked Context** panel on the right side of the screen.

When you send a new message, all marked messages are automatically prepended to your input as a code block, formatted like this:

\`\`\`
=== Marked Context (selected by user) ===
<<USER>>
the user's original message
<<AGENT>>
the agent's original response
```
```

This lets you give the agent "live" context from specific points in your conversation without copy-pasting manually.

## How It Works

- **@ Button** — appears on hover over every chat message
- **Mark / Unmark** — click @ to toggle a message in/out of context
- **Right Panel** — shows all currently marked messages, click "Clear All Marks" to reset
- **Auto-Inject** — on next send, all marked context is appended to your message automatically via WebSocket interception

## How to Install

### Step 1: Copy the plugin file

Copy `openclaw-at-plugin.js` into your OpenClaw `dist/control-ui/` directory:

```bash
cp openclaw-at-plugin.js /usr/local/lib/node_modules/openclaw/dist/control-ui/
```

> Note: This directory may be overwritten on OpenClaw updates. Keep a backup of this file and re-copy after updates.

### Step 2: Reference it in index.html

Add this line inside the `<head>` tag of `dist/control-ui/index.html`, **before** the main module script:

```html
<script src="./openclaw-at-plugin.js"></script>
```

### Step 3: Restart OpenClaw

Restart the gateway to load the updated Control UI.

## File Structure

```
openclaw-at-plugin.js   — The plugin (single file, no dependencies)
README.md               — This file
```

## Privacy Note

This plugin runs entirely in your browser. It does not send any data to external servers. Marked context is only injected into your local OpenClaw conversation via WebSocket.

## Known Limitations

- The plugin file in `dist/control-ui/` is overwritten on OpenClaw updates. Keep a backup and re-copy after updating.
- Long messages without spaces may overflow the chat area (CSS `overflow-x: auto` is applied for scroll).
- Currently designed for the OpenClaw Control UI only; other UI surfaces may not support the DOM structure this plugin relies on.

## License

MIT — do whatever you want with it.
