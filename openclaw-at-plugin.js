(function () {
  'use strict';

  const PANEL_WIDTH = 260;
  const markedMessages = new Map();
  let panelList = null;
  let clearBtn = null;
  let messageCounter = 0;

  // ── WebSocket interception ────────────────────────────────────────────────
  const _OriginalWebSocket = window.WebSocket;
  function PatchedWebSocket(...args) {
    const ws = new _OriginalWebSocket(...args);
    const _origSend = ws.send.bind(ws);
    ws.send = function (data) {
      if (markedMessages.size > 0 && typeof data === 'string') {
        try {
          const msg = JSON.parse(data);
          if (msg?.method === 'chat.send' && msg?.params?.message !== undefined) {
            msg.params.message = msg.params.message + '\n\n' + buildContextBlock();
            data = JSON.stringify(msg);
            console.log('[OC-Plugin] @ context injected into chat.send ✓');
          }
        } catch (e) { /* not JSON */ }
      }
      return _origSend(data);
    };
    return ws;
  }
  PatchedWebSocket.prototype = _OriginalWebSocket.prototype;
  Object.assign(PatchedWebSocket, _OriginalWebSocket);
  window.WebSocket = PatchedWebSocket;

  function buildContextBlock() {
    // Use code block format to avoid Markdown parsing issues.
    // Content inside ``` is rendered verbatim by all Markdown renderers.
    const lines = ['```', '=== Marked Context (selected by user) ==='];
    markedMessages.forEach(({ role, content }) => {
      lines.push(`<<${role.toUpperCase()}>>`);
      lines.push(content.trim());
    });
    lines.push('```');
    return lines.join('\n');
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #oc-at-panel {
      position: fixed; top: 0; right: 0;
      width: ${PANEL_WIDTH}px; height: 100vh;
      background: #f0f2f5;
      border-left: 1px solid #d1d5db;
      display: none; flex-direction: column;
      z-index: 1000;
      font-family: ui-sans-serif, system-ui, sans-serif;
      overflow-y: auto;
    }
    #oc-at-panel.oc-visible { display: flex; }
    #oc-at-panel-header {
      padding: 16px; border-bottom: 1px solid #d1d5db;
      display: flex; align-items: center; gap: 8px;
      color: #374151; font-size: 13px; font-weight: 600;
    }
    #oc-at-panel-header svg { color: #3b82f6; flex-shrink: 0; }
    #oc-at-panel-list {
      flex: 1; overflow-y: auto; padding: 8px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .oc-panel-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 8px;
      background: #fff; border: 1px solid #e5e7eb;
      font-size: 11px; color: #374151; font-family: ui-monospace, monospace;
      word-break: break-word; overflow-wrap: break-word;
      overflow-x: auto;
    }
    .oc-panel-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #3b82f6; flex-shrink: 0;
    }
    #oc-at-panel-footer { padding: 10px; border-top: 1px solid #d1d5db; }
    #oc-clear-btn {
      width: 100%; padding: 10px;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      color: #6b7280; font-size: 11px; cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    #oc-clear-btn:hover:not(:disabled) { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
    #oc-clear-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .oc-msg-wrapper {
      display: flex; align-items: flex-start; gap: 8px; width: 100%;
      overflow-x: auto; min-width: 0; max-width: 100%;
    }
    .oc-msg-wrapper.oc-user { justify-content: flex-end; }
    .oc-msg-wrapper > * { max-width: 100%; overflow-x: auto; white-space: normal; word-break: break-word; }
    .oc-msg-wrapper .oc-at-btn { flex-shrink: 0; white-space: nowrap; }

    .oc-at-btn {
      flex-shrink: 0;
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 1px solid #4b5563;
      background: #374151;
      color: #ffffff;
      font-size: 11px; font-family: ui-monospace, monospace;
      cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
      padding: 0; opacity: 0.4;
      align-self: center;
    }
    .oc-msg-wrapper:hover .oc-at-btn { opacity: 1; }
    .oc-at-btn.oc-active {
      opacity: 1 !important;
      background: #2563eb !important;
      border-color: #2563eb !important;
      color: #fff !important;
    }

    .oc-marked {
      outline: 2px solid rgba(59,130,246,0.7) !important;
      outline-offset: 2px;
      max-width: 100%; overflow-x: auto;
    }
  `;
  document.head.appendChild(style);

  // ── Panel visibility ──────────────────────────────────────────────────────
  function setPanelVisible(visible) {
    const panel = document.getElementById('oc-at-panel');
    if (!panel) return;
    panel.classList.toggle('oc-visible', visible);

    const shell = document.querySelector('.shell');
    if (shell) {
      shell.style.transition = 'padding-right 0.2s ease';
      shell.style.boxSizing = 'border-box';
      shell.style.paddingRight = visible ? `${PANEL_WIDTH}px` : '';
    }
  }

  // ── Panel ─────────────────────────────────────────────────────────────────
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'oc-at-panel';
    panel.innerHTML = `
      <div id="oc-at-panel-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="4"/>
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
        </svg>
        Marked Context
      </div>
      <div id="oc-at-panel-list"></div>
      <div id="oc-at-panel-footer">
        <button id="oc-clear-btn" disabled>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
          Clear All Marks
        </button>
      </div>
    `;
    document.body.appendChild(panel);
    panelList = panel.querySelector('#oc-at-panel-list');
    clearBtn  = panel.querySelector('#oc-clear-btn');
    clearBtn.addEventListener('click', clearAll);
  }

  function refreshPanel() {
    panelList.innerHTML = '';
    if (markedMessages.size === 0) {
      clearBtn.disabled = true;
      setPanelVisible(false);
    } else {
      clearBtn.disabled = false;
      setPanelVisible(true);
      markedMessages.forEach(({ label }) => {
        const item = document.createElement('div');
        item.className = 'oc-panel-item';
        item.innerHTML = `<div class="oc-panel-dot"></div><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(label)}</span>`;
        panelList.appendChild(item);
      });
    }
    window.__ocMarkedContext = [...markedMessages.values()].map(m => ({ role: m.role, content: m.content }));
  }

  function clearAll() {
    [...markedMessages.keys()].forEach(unmarkMessage);
    refreshPanel();
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Mark / Unmark ─────────────────────────────────────────────────────────
  function toggleMark(id, btn, el, role, content) {
    markedMessages.has(id) ? unmarkMessage(id) : markMessage(id, btn, el, role, content);
    refreshPanel();
  }

  function markMessage(id, btn, el, role, content) {
    btn.classList.add('oc-active');
    el.classList.add('oc-marked');
    const label = `${role}_${content.trim().slice(0, 5).replace(/\s+/g, '-')}`;
    markedMessages.set(id, { label, content, role, el });
  }

  function unmarkMessage(id) {
    const entry = markedMessages.get(id);
    if (!entry) return;
    entry.el.classList.remove('oc-marked');
    const btn = document.querySelector(`.oc-at-btn[data-oc-id="${id}"]`);
    if (btn) btn.classList.remove('oc-active');
    markedMessages.delete(id);
  }

  // ── Role detection ────────────────────────────────────────────────────────
  function detectRole(el) {
    const group = el.closest('.chat-group');
    console.log('[detectRole] el:', el.textContent?.slice(0, 20), '| group:', group?.className, '| isUser:', group?.classList.contains('user'));
    if (group && group.classList.contains('user')) return 'user';
    return 'agent';
  }

  // ── Attach @ button ───────────────────────────────────────────────────────
  function attachAtButton(msgEl) {
    if (msgEl.dataset.ocAttached) return;
    if (msgEl.parentElement && msgEl.parentElement.classList.contains('oc-msg-wrapper')) return;

    const text = (msgEl.innerText || msgEl.textContent || '').trim();
    if (!text || text.length < 2) return;

    msgEl.dataset.ocAttached = '1';
    const role   = detectRole(msgEl);
    const isUser = role === 'user';
    const id     = 'oc-msg-' + (++messageCounter);

    const btn = document.createElement('button');
    btn.className    = 'oc-at-btn';
    btn.dataset.ocId = id;
    btn.title        = 'Mark as context (@)';
    btn.textContent  = '@';

    const clone = msgEl.cloneNode(true);
    clone.dataset.ocAttached = '1';
    clone.dataset.ocId       = id;

    const wrapper = document.createElement('div');
    wrapper.className = `oc-msg-wrapper${isUser ? ' oc-user' : ''}`;
    if (isUser) { wrapper.appendChild(clone); wrapper.appendChild(btn); }
    else        { wrapper.appendChild(btn);   wrapper.appendChild(clone); }

    try {
      msgEl.parentNode.insertBefore(wrapper, msgEl);
      msgEl.parentNode.removeChild(msgEl);
    } catch (e) {
      console.warn('[OC-Plugin] insert failed:', e);
      return;
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      toggleMark(id, btn, clone, role, text);
    });

    console.log('[OC-Plugin] attached @btn to:', role, text.slice(0, 20));
  }

  // ── Scan ──────────────────────────────────────────────────────────────────
  function scanAndAttach(root) {
    root.querySelectorAll('.chat-text').forEach(el => {
      if (el.parentElement && el.parentElement.classList.contains('oc-msg-wrapper')) return;
      attachAtButton(el);
    });
  }

  const observer = new MutationObserver((mutations) => {
    let hasNew = false;
    mutations.forEach(mut => mut.addedNodes.forEach(n => { if (n.nodeType === 1) hasNew = true; }));
    if (hasNew) setTimeout(() => scanAndAttach(document.body), 300);
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    buildPanel();
    scanAndAttach(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => scanAndAttach(document.body), 1500);
    setTimeout(() => scanAndAttach(document.body), 3500);
    console.log('[OpenClaw @ Plugin] Loaded ✓  — WebSocket interception active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 1000);
  }
})();
