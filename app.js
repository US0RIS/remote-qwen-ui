const API_BASE_URL = "https://us0ris-qwen.shares.zrok.io";
const CHAT_STORAGE_KEY = "felixRemoteChatsV1";
const ACTIVE_CHAT_KEY = "felixRemoteActiveChatV1";
const API_KEY_STORAGE = "remoteQwenApiKey";

const dom = {
  body: document.body,
  app: document.querySelector("#app"),
  sidebar: document.querySelector("#sidebar"),
  sidebarOverlay: document.querySelector("#sidebar-overlay"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarClose: document.querySelector("#sidebar-close"),
  newChat: document.querySelector("#new-chat"),
  historyQuery: document.querySelector("#history-query"),
  historyList: document.querySelector("#history-list"),
  chatTitle: document.querySelector("#chat-title"),
  status: document.querySelector("#status"),
  sidebarStatus: document.querySelector("#sidebar-status"),
  connectionDot: document.querySelector("#connection-dot"),
  changeKey: document.querySelector("#change-key"),
  changeKeySidebar: document.querySelector("#change-key-sidebar"),
  connectPanel: document.querySelector("#connect-panel"),
  keyForm: document.querySelector("#key-form"),
  keyInput: document.querySelector("#api-key"),
  welcome: document.querySelector("#welcome"),
  messages: document.querySelector("#messages"),
  composer: document.querySelector("#composer"),
  prompt: document.querySelector("#prompt"),
  responseStyle: document.querySelector("#response-style"),
  send: document.querySelector("#send"),
  stop: document.querySelector("#stop"),
  suggestions: [...document.querySelectorAll(".suggestion")],
  chatMenu: document.querySelector("#chat-menu"),
  renameChat: document.querySelector("#rename-chat"),
  deleteChat: document.querySelector("#delete-chat"),
  renameBackdrop: document.querySelector("#rename-backdrop"),
  renameForm: document.querySelector("#rename-form"),
  renameInput: document.querySelector("#rename-input"),
  renameCancel: document.querySelector("#rename-cancel"),
  toast: document.querySelector("#toast"),
  toastMessage: document.querySelector("#toast-message"),
  toastAction: document.querySelector("#toast-action"),
};

let chats = loadChats();
let activeChatId = localStorage.getItem(ACTIVE_CHAT_KEY);
let activeRequest = null;
let menuChatId = null;
let renameChatId = null;
let deletedSnapshot = null;
let toastTimer = null;
let statusTimer = null;
let requestStartedAt = 0;
let streamPhase = "thinking";
let renderFrame = null;

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createChat() {
  const now = Date.now();
  return {
    id: makeId(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function normalizeChat(chat) {
  return {
    id: typeof chat.id === "string" ? chat.id : makeId(),
    title: typeof chat.title === "string" && chat.title.trim() ? chat.title.trim() : "New chat",
    createdAt: Number(chat.createdAt) || Date.now(),
    updatedAt: Number(chat.updatedAt) || Date.now(),
    messages: Array.isArray(chat.messages)
      ? chat.messages.filter((message) => message && ["user", "assistant"].includes(message.role)).map((message) => ({
          id: typeof message.id === "string" ? message.id : makeId(),
          role: message.role,
          content: typeof message.content === "string" ? message.content : "",
          thinking: typeof message.thinking === "string" ? message.thinking : "",
          createdAt: Number(message.createdAt) || Date.now(),
          stopped: Boolean(message.stopped),
        }))
      : [],
  };
}

function loadChats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
    if (Array.isArray(parsed)) return parsed.map(normalizeChat);
  } catch {}
  return [];
}

function saveChats() {
  chats.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

function getApiKey() {
  return sessionStorage.getItem(API_KEY_STORAGE) || "";
}

function getActiveChat() {
  return chats.find((chat) => chat.id === activeChatId) || null;
}

function ensureActiveChat() {
  let chat = getActiveChat();
  if (!chat) {
    chat = createChat();
    chats.unshift(chat);
    activeChatId = chat.id;
    localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    saveChats();
  }
  return chat;
}

function setActiveChat(id) {
  if (!chats.some((chat) => chat.id === id)) return;
  activeChatId = id;
  localStorage.setItem(ACTIVE_CHAT_KEY, id);
  closeChatMenu();
  closeSidebarMobile();
  renderAll();
}

function startNewChat() {
  if (activeRequest) stopGeneration();
  const current = getActiveChat();
  if (current && current.messages.length === 0) {
    setActiveChat(current.id);
    return;
  }
  const chat = createChat();
  chats.unshift(chat);
  activeChatId = chat.id;
  localStorage.setItem(ACTIVE_CHAT_KEY, chat.id);
  saveChats();
  closeSidebarMobile();
  renderAll();
  dom.prompt.focus();
}

function deriveTitle(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New chat";
  return clean.length > 52 ? `${clean.slice(0, 49).trim()}…` : clean;
}

function previewFor(chat) {
  const last = [...chat.messages].reverse().find((message) => message.content.trim());
  return last ? last.content.replace(/\s+/g, " ").slice(0, 70) : "No messages yet";
}

function groupLabel(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  const startWeek = startToday - 6 * 86400000;
  if (timestamp >= startToday) return "Today";
  if (timestamp >= startYesterday) return "Yesterday";
  if (timestamp >= startWeek) return "Previous 7 days";
  if (date.getFullYear() === now.getFullYear()) return date.toLocaleString(undefined, { month: "long" });
  return String(date.getFullYear());
}

function renderHistory() {
  const query = dom.historyQuery.value.trim().toLowerCase();
  const filtered = chats
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((chat) => {
      if (!query) return true;
      const haystack = `${chat.title} ${chat.messages.map((m) => m.content).join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });

  dom.historyList.replaceChildren();
  const groups = new Map();
  for (const chat of filtered) {
    const label = groupLabel(chat.updatedAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(chat);
  }

  for (const [label, groupChats] of groups) {
    const section = document.createElement("section");
    section.className = "history-group";
    const heading = document.createElement("div");
    heading.className = "history-group-title";
    heading.textContent = label;
    section.appendChild(heading);

    for (const chat of groupChats) {
      const wrap = document.createElement("div");
      wrap.className = "chat-row-wrap";

      const row = document.createElement("button");
      row.type = "button";
      row.className = `chat-row${chat.id === activeChatId ? " active" : ""}`;
      row.dataset.chatId = chat.id;
      row.innerHTML = `
        <span class="chat-main">
          <span class="chat-name"></span>
          <span class="chat-preview"></span>
        </span>
        <span class="chat-more" role="button" aria-label="Chat options" tabindex="0">•••</span>
      `;
      row.querySelector(".chat-name").textContent = chat.title;
      row.querySelector(".chat-preview").textContent = previewFor(chat);

      row.addEventListener("click", (event) => {
        if (event.target.closest(".chat-more")) {
          event.stopPropagation();
          openChatMenu(chat.id, event.target.closest(".chat-more"));
          return;
        }
        setActiveChat(chat.id);
      });

      row.querySelector(".chat-more").addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          openChatMenu(chat.id, event.currentTarget);
        }
      });

      wrap.appendChild(row);
      section.appendChild(wrap);
    }

    dom.historyList.appendChild(section);
  }
}

function openChatMenu(chatId, anchor) {
  menuChatId = chatId;
  const rect = anchor.getBoundingClientRect();
  dom.chatMenu.hidden = false;
  const menuWidth = 130;
  const left = Math.min(window.innerWidth - menuWidth - 10, rect.right - menuWidth);
  const top = Math.min(window.innerHeight - 100, rect.bottom + 5);
  dom.chatMenu.style.left = `${Math.max(8, left)}px`;
  dom.chatMenu.style.top = `${Math.max(8, top)}px`;
}

function closeChatMenu() {
  dom.chatMenu.hidden = true;
  menuChatId = null;
}

function openRenameModal(chatId) {
  const chat = chats.find((item) => item.id === chatId);
  if (!chat) return;
  renameChatId = chatId;
  dom.renameInput.value = chat.title;
  dom.renameBackdrop.hidden = false;
  closeChatMenu();
  setTimeout(() => {
    dom.renameInput.focus();
    dom.renameInput.select();
  }, 0);
}

function closeRenameModal() {
  dom.renameBackdrop.hidden = true;
  renameChatId = null;
}

function deleteChat(chatId) {
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index < 0) return;
  deletedSnapshot = { chat: chats[index], index };
  chats.splice(index, 1);
  if (activeChatId === chatId) {
    const replacement = chats[0] || createChat();
    if (!chats.length) chats.push(replacement);
    activeChatId = replacement.id;
    localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
  }
  saveChats();
  closeChatMenu();
  renderAll();
  showToast("Chat deleted", "Undo");
}

function undoDelete() {
  if (!deletedSnapshot) return;
  chats.splice(Math.min(deletedSnapshot.index, chats.length), 0, deletedSnapshot.chat);
  activeChatId = deletedSnapshot.chat.id;
  localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
  deletedSnapshot = null;
  saveChats();
  hideToast();
  renderAll();
}

function showToast(message, action) {
  clearTimeout(toastTimer);
  dom.toastMessage.textContent = message;
  dom.toastAction.textContent = action;
  dom.toast.hidden = false;
  toastTimer = setTimeout(() => {
    deletedSnapshot = null;
    hideToast();
  }, 6000);
}

function hideToast() {
  clearTimeout(toastTimer);
  dom.toast.hidden = true;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(text) {
  const codeTokens = [];
  const linkTokens = [];
  let source = String(text);

  source = source.replace(/`([^`\n]+)`/g, (_, code) => {
    const token = `\u0000CODE${codeTokens.length}\u0000`;
    codeTokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  source = source.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
    const token = `\u0000LINK${linkTokens.length}\u0000`;
    linkTokens.push(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
    return token;
  });

  source = escapeHtml(source);
  source = source.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  source = source.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  source = source.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  source = source.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  source = source.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  source = source.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeTokens[Number(index)] || "");
  source = source.replace(/\u0000LINK(\d+)\u0000/g, (_, index) => linkTokens[Number(index)] || "");
  return source;
}

function isTableSeparator(line) {
  const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      output.push(`
        <div class="code-wrap">
          <div class="code-label"><span>${escapeHtml(language || "code")}</span><button class="copy-code" type="button">Copy</button></div>
          <pre><code>${escapeHtml(code.join("\n"))}</code></pre>
        </div>
      `);
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      const level = match[1].length;
      output.push(`<h${level}>${inlineMarkdown(match[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
      output.push("<hr>");
      index += 1;
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      output.push(`<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      output.push(`<blockquote>${quote.map((item) => inlineMarkdown(item)).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      output.push(`<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      output.push(`<ol>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index].trim()) &&
      !/^#{1,3}\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !(lines[index].includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${paragraph.map((part) => inlineMarkdown(part)).join("<br>")}</p>`);
  }

  return output.join("");
}

function decorateCodeBlocks(container) {
  container.querySelectorAll(".code-wrap").forEach((wrap) => {
    const button = wrap.querySelector(".copy-code");
    const code = wrap.querySelector("code");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy"; }, 1200);
      } catch {
        button.textContent = "Failed";
      }
    });
  });
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = `message ${message.role}`;
  article.dataset.messageId = message.id;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = message.role === "user" ? "Y" : "Q";

  const column = document.createElement("div");
  const heading = document.createElement("div");
  heading.className = "message-heading";
  heading.innerHTML = `<span class="message-author">${message.role === "user" ? "You" : "Qwen"}</span><span class="message-time">${formatTime(message.createdAt)}</span>`;

  const body = document.createElement("div");
  body.className = "message-body";
  if (message.role === "assistant") {
    body.innerHTML = message.content ? renderMarkdown(message.content) : "";
    decorateCodeBlocks(body);
  } else {
    body.textContent = message.content;
  }

  if (message.role === "assistant" && message.thinking) {
    const details = document.createElement("details");
    details.className = "thinking";
    details.innerHTML = `<summary>Thinking trace</summary><div class="thinking-content"></div>`;
    details.querySelector(".thinking-content").textContent = message.thinking;
    column.appendChild(heading);
    column.appendChild(details);
    column.appendChild(body);
  } else {
    column.appendChild(heading);
    column.appendChild(body);
  }

  article.appendChild(avatar);
  article.appendChild(column);
  return article;
}

function renderConversation() {
  const chat = ensureActiveChat();
  dom.chatTitle.textContent = chat.title;
  dom.messages.replaceChildren();
  for (const message of chat.messages) {
    dom.messages.appendChild(createMessageElement(message));
  }

  const hasKey = Boolean(getApiKey());
  dom.connectPanel.hidden = hasKey;
  dom.welcome.hidden = !hasKey || chat.messages.length > 0;
  dom.messages.hidden = chat.messages.length === 0;
  dom.prompt.disabled = !hasKey || Boolean(activeRequest);
  dom.send.disabled = !hasKey || Boolean(activeRequest);
  dom.prompt.placeholder = hasKey ? "Message Qwen…" : "Connect first…";

  requestAnimationFrame(() => {
    const content = document.querySelector("#content");
    content.scrollTop = content.scrollHeight;
  });
}

function renderAll() {
  ensureActiveChat();
  renderHistory();
  renderConversation();
  const hasKey = Boolean(getApiKey());
  dom.changeKey.hidden = !hasKey;
  dom.changeKeySidebar.hidden = !hasKey;
}

function updateStreamingMessage(message) {
  if (renderFrame) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = null;
    const article = dom.messages.querySelector(`[data-message-id="${CSS.escape(message.id)}"]`);
    if (!article) return;
    const column = article.children[1];
    let details = column.querySelector(".thinking");
    if (message.thinking) {
      if (!details) {
        details = document.createElement("details");
        details.className = "thinking";
        details.innerHTML = `<summary>Thinking trace</summary><div class="thinking-content"></div>`;
        column.insertBefore(details, column.querySelector(".message-body"));
      }
      details.querySelector(".thinking-content").textContent = message.thinking;
      details.querySelector(".thinking-content").scrollTop = details.querySelector(".thinking-content").scrollHeight;
    }
    const body = column.querySelector(".message-body");
    body.classList.add("streaming-cursor");
    body.innerHTML = message.content ? renderMarkdown(message.content) : "";
    decorateCodeBlocks(body);
    const content = document.querySelector("#content");
    content.scrollTop = content.scrollHeight;
  });
}

function finishStreamingMessage(message) {
  const article = dom.messages.querySelector(`[data-message-id="${CSS.escape(message.id)}"]`);
  article?.querySelector(".message-body")?.classList.remove("streaming-cursor");
}

function startStatusClock() {
  stopStatusClock();
  requestStartedAt = performance.now();
  streamPhase = "thinking";
  statusTimer = setInterval(() => {
    const elapsed = ((performance.now() - requestStartedAt) / 1000).toFixed(1);
    setStatus(`${streamPhase === "thinking" ? "Thinking" : "Responding"} · ${elapsed}s`, "online");
  }, 100);
}

function stopStatusClock() {
  clearInterval(statusTimer);
  statusTimer = null;
}

function setStatus(text, state = "neutral") {
  dom.status.textContent = text;
  dom.sidebarStatus.textContent = text;
  dom.connectionDot.classList.toggle("online", state === "online");
  dom.connectionDot.classList.toggle("error", state === "error");
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: { "skip_zrok_interstitial": "1" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    setStatus(`${data.status || "online"} · ${data.model || "model"}`, "online");
  } catch (error) {
    setStatus(`Backend unavailable`, "error");
  }
}

function buildApiMessages(chat) {
  return chat.messages
    .filter((message) => message.content.trim())
    .map((message) => ({ role: message.role, content: message.content }));
}

async function sendMessage(text) {
  const apiKey = getApiKey();
  if (!apiKey || activeRequest) return;

  const content = text.trim();
  if (!content) return;

  const chat = ensureActiveChat();
  const userMessage = {
    id: makeId(),
    role: "user",
    content,
    thinking: "",
    createdAt: Date.now(),
    stopped: false,
  };
  chat.messages.push(userMessage);
  if (chat.messages.filter((message) => message.role === "user").length === 1 && chat.title === "New chat") {
    chat.title = deriveTitle(content);
  }
  chat.updatedAt = Date.now();

  const assistantMessage = {
    id: makeId(),
    role: "assistant",
    content: "",
    thinking: "",
    createdAt: Date.now(),
    stopped: false,
  };
  chat.messages.push(assistantMessage);
  saveChats();
  renderAll();
  dom.prompt.value = "";
  autoResizePrompt();

  activeRequest = new AbortController();
  dom.send.hidden = true;
  dom.stop.hidden = false;
  dom.prompt.disabled = true;
  startStatusClock();
  updateStreamingMessage(assistantMessage);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      signal: activeRequest.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "skip_zrok_interstitial": "1",
      },
      body: JSON.stringify({
        messages: buildApiMessages(chat),
        temperature: Number(dom.responseStyle.value),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.detail || `Request failed with HTTP ${response.status}`);
    }
    if (!response.body) throw new Error("Streaming is not supported by this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let modelName = "qwen3:32b";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let event;
        try { event = JSON.parse(line); } catch { continue; }

        if (event.type === "thinking") {
          assistantMessage.thinking += event.content || "";
          updateStreamingMessage(assistantMessage);
        } else if (event.type === "content") {
          streamPhase = "responding";
          assistantMessage.content += event.content || "";
          updateStreamingMessage(assistantMessage);
        } else if (event.type === "done") {
          modelName = event.model || modelName;
        } else if (event.type === "error") {
          throw new Error(event.detail || "Streaming request failed.");
        }
      }
    }

    if (!assistantMessage.content.trim() && assistantMessage.thinking.trim()) {
      assistantMessage.content = "The model completed its reasoning without returning a final answer.";
    }
    if (!assistantMessage.content.trim()) {
      assistantMessage.content = "No response was returned.";
    }
    chat.updatedAt = Date.now();
    saveChats();
    finishStreamingMessage(assistantMessage);
    setStatus(`online · ${modelName}`, "online");
  } catch (error) {
    if (error.name === "AbortError") {
      assistantMessage.stopped = true;
      if (!assistantMessage.content.trim()) assistantMessage.content = "Generation stopped.";
      setStatus("Generation stopped", "online");
    } else {
      assistantMessage.content = assistantMessage.content
        ? `${assistantMessage.content}\n\n---\nError: ${error.message}`
        : `Error: ${error.message}`;
      setStatus("Request failed", "error");
    }
    chat.updatedAt = Date.now();
    saveChats();
    finishStreamingMessage(assistantMessage);
  } finally {
    stopStatusClock();
    activeRequest = null;
    dom.send.hidden = false;
    dom.stop.hidden = true;
    dom.prompt.disabled = false;
    dom.send.disabled = false;
    renderHistory();
    renderConversation();
    dom.prompt.focus();
  }
}

function stopGeneration() {
  activeRequest?.abort();
}

function autoResizePrompt() {
  dom.prompt.style.height = "auto";
  dom.prompt.style.height = `${Math.min(dom.prompt.scrollHeight, 220)}px`;
}

function openSidebarMobile() {
  dom.body.classList.add("sidebar-open");
  dom.sidebarOverlay.hidden = false;
}

function closeSidebarMobile() {
  dom.body.classList.remove("sidebar-open");
  dom.sidebarOverlay.hidden = true;
}

function showConnectPanel() {
  sessionStorage.removeItem(API_KEY_STORAGE);
  dom.connectPanel.hidden = false;
  dom.welcome.hidden = true;
  dom.prompt.disabled = true;
  dom.send.disabled = true;
  dom.changeKey.hidden = true;
  dom.changeKeySidebar.hidden = true;
  dom.keyInput.focus();
}

dom.keyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const key = dom.keyInput.value.trim();
  if (!key) return;
  sessionStorage.setItem(API_KEY_STORAGE, key);
  dom.keyInput.value = "";
  renderAll();
  dom.prompt.focus();
});

dom.changeKey.addEventListener("click", showConnectPanel);
dom.changeKeySidebar.addEventListener("click", showConnectPanel);
dom.newChat.addEventListener("click", startNewChat);
dom.historyQuery.addEventListener("input", renderHistory);
dom.sidebarToggle.addEventListener("click", () => {
  if (window.matchMedia("(max-width: 820px)").matches) {
    openSidebarMobile();
  } else {
    dom.body.classList.toggle("sidebar-collapsed");
  }
});
dom.sidebarClose.addEventListener("click", closeSidebarMobile);
dom.sidebarOverlay.addEventListener("click", closeSidebarMobile);

dom.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(dom.prompt.value);
});

dom.prompt.addEventListener("input", autoResizePrompt);
dom.prompt.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    dom.composer.requestSubmit();
  }
});
dom.stop.addEventListener("click", stopGeneration);

dom.suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    dom.prompt.value = button.textContent;
    autoResizePrompt();
    dom.prompt.focus();
  });
});

dom.renameChat.addEventListener("click", () => {
  if (menuChatId) openRenameModal(menuChatId);
});
dom.deleteChat.addEventListener("click", () => {
  if (menuChatId) deleteChat(menuChatId);
});
dom.renameCancel.addEventListener("click", closeRenameModal);
dom.renameBackdrop.addEventListener("click", (event) => {
  if (event.target === dom.renameBackdrop) closeRenameModal();
});
dom.renameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const chat = chats.find((item) => item.id === renameChatId);
  const title = dom.renameInput.value.trim();
  if (chat && title) {
    chat.title = title;
    chat.updatedAt = Date.now();
    saveChats();
    renderAll();
  }
  closeRenameModal();
});
dom.toastAction.addEventListener("click", undoDelete);

document.addEventListener("click", (event) => {
  if (!dom.chatMenu.hidden && !event.target.closest("#chat-menu") && !event.target.closest(".chat-more")) {
    closeChatMenu();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeChatMenu();
    closeRenameModal();
    closeSidebarMobile();
  }
});
window.addEventListener("resize", closeChatMenu);

ensureActiveChat();
renderAll();
autoResizePrompt();
checkHealth();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").then((registration) => registration.update()).catch(() => {});
}
