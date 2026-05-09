# OpenClaw Dashboard Chat Mark Plugin

Mark / bookmark / star specific chat messages from your OpenClaw conversations — and inject them as context into future messages.

OpenClaw 标记收藏插件：标记、星标、收藏历史对话，自动注入到后续对话中作为上下文参考。

A browser-side plugin for OpenClaw Control UI. Safe to install — it only modifies your local browser UI and sends no data to external servers. Try it risk-free!

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

This lets you give the agent "live" context from specific points in your conversation without copy-pasting manually. Remember to use the `Clear All Marks` button when you do not need referral.

## How It Works

- **@ Button** — appears on hover over every chat message
- **Mark / Unmark** — click @ to toggle a message in/out of context
- **Right Panel** — shows all currently marked messages, click "Clear All Marks" to reset
- **Auto-Inject** — on next send, all marked context is appended to your message automatically via WebSocket interception

## Quick Install (one command)

> **Windows users:** Open **Git Bash** (not CMD or PowerShell) and run the command below.
> If you don't have Git Bash, [install Git first](https://git-scm.com/download/win).

```bash
# Install latest version (main branch)
curl -sL "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/install.sh" | bash

# Install a specific version (e.g., v1.0.0)
VERSION=v1.0.0 curl -sL "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/install.sh" | bash
```

This works on **Linux**, **macOS**, and **Windows (Git Bash)**.

The script will:
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
curl -sL -o "$OPENCLAW_DIST/openclaw-at-plugin.js"   "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/openclaw-at-plugin.js"
```

### Step 3: Inject the script tag into index.html

```bash
if grep -q 'openclaw-at-plugin.js' "$OPENCLAW_DIST/index.html"; then
  echo "Script tag already present — skipping."
else
  node -e "
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<script/g, '<script src=\"./openclaw-at-plugin.js\"></script><script');
fs.writeFileSync(path, content);
console.log('Script tag injected.');
" "$OPENCLAW_DIST/index.html"
fi
```

### Step 4: Restart OpenClaw

Restart the gateway to load the updated Control UI.

## Plugin Removal

Feel free to test the plugin and remove afterwards. Removing the plugin follows the same steps as install but in reverse.

```bash
# Remove script tag from index.html
node -e "
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<script src=\".\/openclaw-at-plugin.js\"><\/script>/g, '');
fs.writeFileSync(path, content);
console.log('Script tag removed.');
" "$OPENCLAW_DIST/index.html"

# Delete plugin file (optional)
rm "$OPENCLAW_DIST/openclaw-at-plugin.js"
```

Then restart OpenClaw gateway.

## Privacy Note

This plugin runs entirely in your browser. It does not send any data to external servers. Marked context is only injected into your local OpenClaw conversation via WebSocket.

## Known Limitations

- The plugin file in `dist/control-ui/` is overwritten on OpenClaw updates. Run the install command again after updating.
- Long messages without spaces may overflow the chat area (CSS `overflow-x: auto` is applied for scroll).
- Currently designed for the OpenClaw Control UI only; other UI surfaces may not support the DOM structure this plugin relies on.

## Versioning

This project uses [Semantic Versioning](https://semver.org/):

- **Latest (dev):** Install from `main` branch — may be unstable
- **Releases:** Use `VERSION=v1.0.0` to install a specific released version

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

# 中文说明

## 这是什么

在使用 OpenClaw 与 agent 进行长对话时，有时你需要回顾之前的某条具体消息。这个插件为每条消息添加一个 **@ 按钮**，点击即可**标记**该消息。

被标记的消息会显示在屏幕右侧的 **Marked Context** 面板中。当你发送新消息时，所有已标记的消息会自动以代码块的形式追加到你的输入框中，格式如下：

```
=== Marked Context (selected by user) ===
<<USER>>
用户的原始消息
<<AGENT>>
Agent 的原始回复
```

这样你就可以让 agent"动态引用"对话中特定位置的上下文，而无需手动复制粘贴。不需要时，记得点击 `Clear All Marks` 清除所有标记。

## 工作原理

- **@ 按钮** — 鼠标悬停于任意消息时出现
- **标记 / 取消标记** — 点击 @ 切换消息的选中状态
- **右侧面板** — 显示所有已标记的消息，点击 "Clear All Marks" 可重置
- **自动注入** — 发送下一条消息时，所有已标记的上下文会通过 WebSocket 拦截自动追加到消息中

## 快速安装（一行命令）

> **Windows 用户：**请打开 **Git Bash**（不是 CMD 或 PowerShell），然后运行下方命令。
> 如果还没有 Git Bash，请先 [安装 Git](https://git-scm.com/download/win)。

```bash
# 安装最新版（main 分支）
curl -sL "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/install.sh" | bash

# 安装指定版本（如 v1.0.0）
VERSION=v1.0.0 curl -sL "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/install.sh" | bash
```

该命令在 **Linux**、**macOS** 和 **Windows (Git Bash)** 上均可运行。

安装脚本会自动：
1. 定位你的 OpenClaw `dist/control-ui/` 目录
2. 下载插件文件到该目录
3. 在 `index.html` 中注入 `<script>` 标签

安装完成后需重启 OpenClaw gateway 使其生效。

## 手动安装

### 第一步：定位 OpenClaw dist 目录

```bash
OPENCLAW_DIST=$(npm root -g)/openclaw/dist/control-ui
echo "Plugin destination: $OPENCLAW_DIST"
```

### 第二步：下载插件文件

```bash
curl -sL -o "$OPENCLAW_DIST/openclaw-at-plugin.js"   "https://raw.githubusercontent.com/TinaQian2017/openclaw-dashboard-chat-mark-plugin/main/openclaw-at-plugin.js"
```

### 第三步：在 index.html 中注入 script 标签

```bash
if grep -q 'openclaw-at-plugin.js' "$OPENCLAW_DIST/index.html"; then
  echo "Script tag already present — skipping."
else
  node -e "
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<script/g, '<script src=\"./openclaw-at-plugin.js\"></script><script');
fs.writeFileSync(path, content);
console.log('Script tag injected.');
" "$OPENCLAW_DIST/index.html"
fi
```

### 第四步：重启 OpenClaw

重启 gateway 以加载更新后的 Control UI。

## 卸载插件

放心试用，如需卸载，执行安装步骤的反向操作即可。

```bash
# 从 index.html 中移除 script 标签
node -e "
const fs = require('fs');
const path = process.argv[1];
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<script src=\".\/openclaw-at-plugin.js\"><\/script>/g, '');
fs.writeFileSync(path, content);
console.log('Script tag removed.');
" "$OPENCLAW_DIST/index.html"

# 删除插件文件（可选）
rm "$OPENCLAW_DIST/openclaw-at-plugin.js"
```

然后重启 OpenClaw gateway。

## 隐私说明

本插件完全运行在你的浏览器中，**不会向任何外部服务器发送数据**。标记的上下文仅通过 WebSocket 注入到你本地的 OpenClaw 对话中。

## 已知限制

- 插件文件位于 `dist/control-ui/`，在 OpenClaw 更新后会被覆盖。更新 OpenClaw 后需重新运行安装命令。
- 无空格的超长消息可能导致聊天区域横向溢出（已应用 CSS `overflow-x: auto`）。
- 目前仅针对 OpenClaw Control UI 设计，其他 UI 界面可能不兼容。

## 版本管理

本项目采用 [语义化版本](https://semver.org/lang/zh-CN/)：

- **最新开发版：** 从 `main` 分支安装 — 可能不稳定
- **正式版本：** 使用 `VERSION=v1.0.0` 安装特定版本

版本历史见 [CHANGELOG.md](./CHANGELOG.md)。
