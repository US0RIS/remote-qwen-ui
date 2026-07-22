const API_BASE_URL = "https://us0ris-qwen.shares.zrok.io";
const API_KEY_STORAGE = "felixRemoteApiKey";
const ACTIVE_CHAT_STORAGE = "felixRemoteActiveChat";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const dom = {
  body: document.body,
  sidebar: $("#sidebar"),
  mobileScrim: $("#mobile-scrim"),
  openSidebar: $("#open-sidebar"),
  closeSidebar: $("#close-sidebar"),
  newChat: $("#new-chat"),
  chatSearch: $("#chat-search"),
  chatHistory: $("#chat-history"),
  navButtons: $$(".nav-button"),
  modelPicker: $("#model-picker"),
  selectedModelLabel: $("#selected-model-label"),
  connectionDot: $("#connection-dot"),
  connectionText: $("#connection-text"),
  changeApiKey: $("#change-api-key"),
  pageTitle: $("#page-title"),
  pageSubtitle: $("#page-subtitle"),
  renameChat: $("#rename-chat"),
  queueButton: $("#queue-button"),
  queueBadge: $("#queue-badge"),
  artifactButton: $("#artifact-button"),
  artifactBadge: $("#artifact-badge"),
  conversationScroll: $("#conversation-scroll"),
  emptyState: $("#empty-state"),
  greeting: $("#greeting"),
  suggestions: $("#suggestions"),
  messageList: $("#message-list"),
  composer: $("#composer"),
  prompt: $("#prompt"),
  attachmentTray: $("#attachment-tray"),
  fileControl: $("#file-control"),
  fileInput: $("#file-input"),
  targetControl: $("#target-control"),
  effortControl: $("#effort-control"),
  webControl: $("#web-control"),
  composerStatus: $("#composer-status"),
  stopButton: $("#stop-button"),
  sendButton: $("#send-button"),
  skillsList: $("#skills-list"),
  newSkill: $("#new-skill"),
  skillEnabled: $("#skill-enabled"),
  skillName: $("#skill-name"),
  skillDescription: $("#skill-description"),
  skillInstructions: $("#skill-instructions"),
  skillStatus: $("#skill-status"),
  saveSkill: $("#save-skill"),
  deleteSkill: $("#delete-skill"),
  refreshDetails: $("#refresh-details"),
  runSummary: $("#run-summary"),
  activeRunDetails: $("#active-run-details"),
  runTranscript: $("#run-transcript"),
  refreshLogs: $("#refresh-logs"),
  logsList: $("#logs-list"),
  logContent: $("#log-content"),
  loadModel: $("#load-model"),
  reloadModel: $("#reload-model"),
  resetModel: $("#reset-model"),
  modelEditorStatus: $("#model-editor-status"),
  modelSource: $("#model-source"),
  modelName: $("#model-name"),
  systemPrompt: $("#system-prompt"),
  applySystemPrompt: $("#apply-system-prompt"),
  modelfile: $("#modelfile"),
  modelfileImport: $("#modelfile-import"),
  downloadModelfile: $("#download-modelfile"),
  saveHostModelfile: $("#save-host-modelfile"),
  buildModel: $("#build-model"),
  settingDisplayName: $("#setting-display-name"),
  settingUserAddress: $("#setting-user-address"),
  settingGreetingTemplate: $("#setting-greeting-template"),
  settingPlaceholder: $("#setting-placeholder"),
  settingSuggestions: $("#setting-suggestions"),
  settingOllamaUrl: $("#setting-ollama-url"),
  settingModel: $("#setting-model"),
  serperKey: $("#serper-key"),
  serperStatus: $("#serper-status"),
  saveSerper: $("#save-serper"),
  testSerper: $("#test-serper"),
  clearSerper: $("#clear-serper"),
  settingWebMode: $("#setting-web-mode"),
  webModeDescription: $("#web-mode-description"),
  settingWebCountry: $("#setting-web-country"),
  settingWebLanguage: $("#setting-web-language"),
  settingWebSearches: $("#setting-web-searches"),
  settingWebPages: $("#setting-web-pages"),
  settingWebRead: $("#setting-web-read"),
  settingContext: $("#setting-context"),
  settingSolver: $("#setting-solver"),
  settingCritic: $("#setting-critic"),
  settingFinal: $("#setting-final"),
  settingTarget: $("#setting-target"),
  settingVerification: $("#setting-verification"),
  settingHistory: $("#setting-history"),
  settingArtifacts: $("#setting-artifacts"),
  settingPreview: $("#setting-preview"),
  settingSystemPrompt: $("#setting-system-prompt"),
  openDataFolder: $("#open-data-folder"),
  downloadBackup: $("#download-backup"),
  saveSettings: $("#save-settings"),
  artifactPane: $("#artifact-pane"),
  closeArtifacts: $("#close-artifacts"),
  artifactCount: $("#artifact-count"),
  artifactList: $("#artifact-list"),
  artifactTitle: $("#artifact-title"),
  artifactMeta: $("#artifact-meta"),
  artifactPreviewMode: $("#artifact-preview-mode"),
  artifactSourceMode: $("#artifact-source-mode"),
  artifactEmpty: $("#artifact-empty"),
  artifactPreview: $("#artifact-preview"),
  artifactSource: $("#artifact-source"),
  copyArtifact: $("#copy-artifact"),
  downloadArtifact: $("#download-artifact"),
  openArtifact: $("#open-artifact"),
  queueDrawer: $("#queue-drawer"),
  closeQueue: $("#close-queue"),
  queueList: $("#queue-list"),
  clearQueue: $("#clear-queue"),
  runNext: $("#run-next"),
  popover: $("#popover"),
  modalBackdrop: $("#modal-backdrop"),
  modal: $("#modal"),
  modalTitle: $("#modal-title"),
  modalClose: $("#modal-close"),
  modalMessage: $("#modal-message"),
  modalInput: $("#modal-input"),
  modalTextarea: $("#modal-textarea"),
  modalSecondary: $("#modal-secondary"),
  modalPrimary: $("#modal-primary"),
  connectBackdrop: $("#connect-backdrop"),
  connectForm: $("#connect-form"),
  apiKey: $("#api-key"),
  toast: $("#toast"),
  toastMessage: $("#toast-message"),
  toastAction: $("#toast-action"),
};

const state = {
  apiKey: sessionStorage.getItem(API_KEY_STORAGE) || "",
  connected: false,
  page: "conversation",
  settings: {},
  chats: [],
  currentChatId: localStorage.getItem(ACTIVE_CHAT_STORAGE) || "",
  currentChat: null,
  activeRun: null,
  skills: [],
  selectedSkillId: "",
  models: [],
  pendingAttachments: [],
  effort: "Extra",
  webMode: "Automatic",
  targetMinutes: 0,
  serperStored: false,
  selectedArtifactId: "",
  selectedArtifact: null,
  loadedModelSnapshot: null,
  artifactMode: "preview",
  websocket: null,
  websocketTimer: null,
  toastTimer: null,
  modalResolver: null,
  followBottom: true,
  liveRenderFrame: 0,
  refreshChatsTimer: 0,
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatBytes(bytes) {
  const number = Number(bytes) || 0;
  if (number < 1024) return `${number} B`;
  if (number < 1024 ** 2) return `${(number / 1024).toFixed(1)} KB`;
  return `${(number / 1024 ** 2).toFixed(1)} MB`;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function formatElapsed(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  if (value < 60) return `${value.toFixed(value < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(value / 60);
  const remainder = Math.floor(value % 60);
  return `${minutes}m ${remainder}s`;
}

function formatTarget(minutes) {
  const value = Math.max(0, Number(minutes) || 0);
  if (!value) return "None";
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return [hours ? `${hours}h` : "", rest ? `${rest}m` : ""].filter(Boolean).join(" ");
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function groupLabel(value) {
  const date = new Date(value || 0);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const timestamp = date.getTime();
  if (timestamp >= start) return "Today";
  if (timestamp >= start - 86400000) return "Yesterday";
  if (timestamp >= start - 7 * 86400000) return "Previous 7 days";
  if (date.getFullYear() === now.getFullYear()) return date.toLocaleString(undefined, { month: "long" });
  return String(date.getFullYear());
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(210, textarea.scrollHeight)}px`;
}

function isNearBottom() {
  const element = dom.conversationScroll;
  return element.scrollHeight - element.scrollTop - element.clientHeight < 120;
}

function scrollToBottom(force = false) {
  if (force || state.followBottom) {
    requestAnimationFrame(() => {
      dom.conversationScroll.scrollTop = dom.conversationScroll.scrollHeight;
    });
  }
}

function getApiHeaders(json = true) {
  const headers = {
    Authorization: `Bearer ${state.apiKey}`,
    skip_zrok_interstitial: "1",
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function api(path, options = {}) {
  const request = { ...options };
  request.headers = { ...getApiHeaders(!(request.body instanceof FormData)), ...(options.headers || {}) };
  const response = await fetch(`${API_BASE_URL}${path}`, request);
  if (response.status === 401) {
    disconnect("API key rejected");
    throw new Error("The API key was rejected.");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || `Request failed with HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  const type = response.headers.get("content-type") || "";
  return type.includes("application/json") ? response.json() : response;
}

function disconnect(message = "Enter your API key") {
  state.connected = false;
  state.apiKey = "";
  sessionStorage.removeItem(API_KEY_STORAGE);
  dom.connectBackdrop.hidden = false;
  dom.connectionDot.className = "connection-dot offline";
  dom.connectionText.textContent = message;
  try { state.websocket?.close(); } catch {}
}

function showToast(message, actionText = "", action = null, timeout = 4000) {
  clearTimeout(state.toastTimer);
  dom.toastMessage.textContent = message;
  dom.toastAction.hidden = !actionText;
  dom.toastAction.textContent = actionText;
  dom.toastAction.onclick = action || null;
  dom.toast.hidden = false;
  state.toastTimer = setTimeout(() => { dom.toast.hidden = true; }, timeout);
}

function closePopover() {
  dom.popover.hidden = true;
  dom.popover.replaceChildren();
}

function openPopover(anchor, content, width = 360) {
  closePopover();
  dom.popover.style.width = `${width}px`;
  if (typeof content === "string") dom.popover.innerHTML = content;
  else dom.popover.append(content);
  dom.popover.hidden = false;
  const rect = anchor.getBoundingClientRect();
  const popRect = dom.popover.getBoundingClientRect();
  let left = rect.left;
  let top = rect.top - popRect.height - 8;
  if (top < 8) top = rect.bottom + 8;
  if (left + popRect.width > innerWidth - 8) left = innerWidth - popRect.width - 8;
  dom.popover.style.left = `${Math.max(8, left)}px`;
  dom.popover.style.top = `${Math.max(8, top)}px`;
}

function showModal({ title, message = "", input = false, textarea = false, value = "", primary = "OK", secondary = "Cancel" }) {
  if (state.modalResolver) state.modalResolver(null);
  dom.modalTitle.textContent = title;
  dom.modalMessage.textContent = message;
  dom.modalInput.hidden = !input;
  dom.modalTextarea.hidden = !textarea;
  dom.modalInput.value = input ? value : "";
  dom.modalTextarea.value = textarea ? value : "";
  dom.modalPrimary.textContent = primary;
  dom.modalSecondary.textContent = secondary;
  dom.modalBackdrop.hidden = false;
  requestAnimationFrame(() => (input ? dom.modalInput : textarea ? dom.modalTextarea : dom.modalPrimary).focus());
  return new Promise(resolve => { state.modalResolver = resolve; });
}

function resolveModal(result) {
  if (!state.modalResolver) return;
  const resolve = state.modalResolver;
  state.modalResolver = null;
  dom.modalBackdrop.hidden = true;
  resolve(result);
}

function inlineMarkdown(value) {
  const codeTokens = [];
  const linkTokens = [];
  let source = String(value ?? "");
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
  const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]); index += 1;
      }
      if (index < lines.length) index += 1;
      output.push(`<div class="code-block"><div class="code-block-header"><span>${escapeHtml(language || "code")}</span><button class="copy-code" type="button">Copy</button></div><pre><code>${escapeHtml(code.join("\n"))}</code></pre></div>`);
      continue;
    }
    if (/^#{1,4}\s+/.test(line)) {
      const match = line.match(/^(#{1,4})\s+(.*)$/);
      const level = match[1].length;
      output.push(`<h${level}>${inlineMarkdown(match[2])}</h${level}>`); index += 1; continue;
    }
    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) { output.push("<hr>"); index += 1; continue; }
    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line); const rows = []; index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) { rows.push(splitTableRow(lines[index])); index += 1; }
      output.push(`<table><thead><tr>${headers.map(cell => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map((_, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) { quote.push(lines[index].replace(/^\s*>\s?/, "")); index += 1; }
      output.push(`<blockquote>${quote.map(item => inlineMarkdown(item)).join("<br>")}</blockquote>`); continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) { items.push(lines[index].replace(/^\s*[-*+]\s+/, "")); index += 1; }
      output.push(`<ul>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) { items.push(lines[index].replace(/^\s*\d+[.)]\s+/, "")); index += 1; }
      output.push(`<ol>${items.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</ol>`); continue;
    }
    const paragraph = [line.trim()]; index += 1;
    while (index < lines.length && lines[index].trim() && !/^```/.test(lines[index].trim()) && !/^#{1,4}\s+/.test(lines[index]) && !/^\s*>\s?/.test(lines[index]) && !/^\s*[-*+]\s+/.test(lines[index]) && !/^\s*\d+[.)]\s+/.test(lines[index]) && !(lines[index].includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))) {
      paragraph.push(lines[index].trim()); index += 1;
    }
    output.push(`<p>${paragraph.map(part => inlineMarkdown(part)).join("<br>")}</p>`);
  }
  return output.join("");
}

function decorateMarkdown(container) {
  $$(".copy-code", container).forEach(button => {
    button.onclick = async () => {
      const code = button.closest(".code-block")?.querySelector("code")?.textContent || "";
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy"; }, 1000);
    };
  });
}

function showPage(page) {
  state.page = page;
  $$(".page").forEach(element => element.classList.toggle("active", element.id === `page-${page}`));
  dom.navButtons.forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const conversation = page === "conversation";
  $$(".conversation-action").forEach(element => { element.hidden = !conversation; });
  closePopover();
  closeSidebarMobile();
  if (page === "conversation") renderConversationHeader();
  if (page === "skills") renderSkills();
  if (page === "details") refreshDetails();
  if (page === "model") renderModelEditorState();
  if (page === "settings") populateSettings();
}

function openSidebarMobile() {
  dom.body.classList.add("sidebar-open");
  dom.mobileScrim.hidden = false;
}
function closeSidebarMobile() {
  dom.body.classList.remove("sidebar-open");
  dom.mobileScrim.hidden = true;
}

async function bootstrap() {
  const data = await api("/api/bootstrap");
  state.settings = data.settings || {};
  state.chats = data.chats || [];
  state.skills = data.skills || [];
  state.activeRun = data.active || null;
  state.serperStored = Boolean(data.serper_key_stored);
  state.effort = state.settings.effort || "Extra";
  state.webMode = state.settings.web_mode || "Automatic";
  state.targetMinutes = Number(state.settings.default_minimum_work_minutes) || 0;
  state.connected = true;
  dom.connectBackdrop.hidden = true;
  dom.connectionDot.className = "connection-dot online";
  dom.connectionText.textContent = `${state.settings.model || "Model"} · connected`;
  dom.selectedModelLabel.textContent = state.settings.model || "No model";
  renderAll();
  await ensureCurrentChat();
  connectWebSocket();
  refreshModels().catch(() => {});
}

async function ensureCurrentChat() {
  if (!state.chats.length) {
    const chat = await api("/api/chats", { method: "POST", body: "{}" });
    state.chats.unshift(summaryFromChat(chat));
    state.currentChatId = chat.id;
    localStorage.setItem(ACTIVE_CHAT_STORAGE, chat.id);
    state.currentChat = chat;
  } else {
    if (!state.chats.some(chat => chat.id === state.currentChatId)) state.currentChatId = state.chats[0].id;
    await loadChat(state.currentChatId);
  }
  renderAll();
}

function summaryFromChat(chat) {
  const messages = chat.messages || [];
  const last = [...messages].reverse().find(message => String(message.content || "").trim());
  return {
    id: chat.id,
    title: chat.title || "New chat",
    created_at: chat.created_at,
    activity_at: chat.activity_at,
    preview: last ? String(last.content).replace(/\s+/g, " ").slice(0, 90) : "No messages yet",
    message_count: messages.length,
    queue_count: (chat.queue || []).length,
    working: state.activeRun?.chat_id === chat.id,
  };
}

async function refreshChats() {
  state.chats = await api("/api/chats");
  renderChatHistory();
}

function scheduleChatRefresh() {
  clearTimeout(state.refreshChatsTimer);
  state.refreshChatsTimer = setTimeout(() => refreshChats().catch(() => {}), 180);
}

async function loadChat(chatId, forceBottom = true) {
  const chat = await api(`/api/chats/${encodeURIComponent(chatId)}`);
  state.currentChatId = chat.id;
  state.currentChat = chat;
  localStorage.setItem(ACTIVE_CHAT_STORAGE, chat.id);
  renderAll();
  if (forceBottom) scrollToBottom(true);
}

async function createNewChat() {
  const current = state.currentChat;
  if (current && !(current.messages || []).length && !(current.queue || []).length) {
    showPage("conversation"); dom.prompt.focus(); return;
  }
  const chat = await api("/api/chats", { method: "POST", body: "{}" });
  state.chats.unshift(summaryFromChat(chat));
  state.currentChat = chat;
  state.currentChatId = chat.id;
  localStorage.setItem(ACTIVE_CHAT_STORAGE, chat.id);
  state.pendingAttachments = [];
  showPage("conversation");
  renderAll();
  dom.prompt.focus();
}

async function deleteChat(chatId) {
  const response = await api(`/api/chats/${encodeURIComponent(chatId)}`, { method: "DELETE" });
  state.chats = state.chats.filter(chat => chat.id !== chatId);
  if (state.currentChatId === chatId) {
    state.currentChat = null;
    state.currentChatId = "";
    await ensureCurrentChat();
  }
  renderChatHistory();
  showToast(response.status === "pending" ? "Stopping and deleting chat…" : "Chat deleted", "Undo", async () => {
    try {
      const restored = await api("/api/chats/undo-delete", { method: "POST", body: "{}" });
      await refreshChats();
      await loadChat(restored.id);
      showToast("Chat restored");
    } catch (error) { showToast(error.message); }
  }, 15000);
}

function renderAll() {
  renderChatHistory();
  renderConversationHeader();
  renderConversation();
  renderComposer();
  renderQueue();
  renderSkills();
  renderArtifactPane();
}

function renderChatHistory() {
  const query = dom.chatSearch.value.trim().toLowerCase();
  const filtered = state.chats
    .slice()
    .sort((a, b) => String(b.activity_at || "").localeCompare(String(a.activity_at || "")))
    .filter(chat => !query || `${chat.title} ${chat.preview}`.toLowerCase().includes(query));
  dom.chatHistory.replaceChildren();
  const groups = new Map();
  filtered.forEach(chat => {
    const label = groupLabel(chat.activity_at || chat.created_at);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(chat);
  });
  for (const [label, chats] of groups) {
    const section = document.createElement("section"); section.className = "history-group";
    section.innerHTML = `<div class="history-heading">${escapeHtml(label)}</div>`;
    chats.forEach(chat => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `chat-card${chat.id === state.currentChatId ? " active" : ""}${chat.working ? " working" : ""}`;
      button.innerHTML = `<span class="chat-card-copy"><span class="chat-card-title"></span><span class="chat-card-preview"></span></span><button class="chat-delete" type="button" aria-label="Delete chat">×</button>`;
      $(".chat-card-title", button).textContent = chat.title || "New chat";
      $(".chat-card-preview", button).textContent = chat.preview || "No messages yet";
      button.addEventListener("click", event => {
        if (event.target.closest(".chat-delete")) return;
        loadChat(chat.id).then(() => showPage("conversation")).catch(error => showToast(error.message));
      });
      $(".chat-delete", button).onclick = event => { event.stopPropagation(); deleteChat(chat.id).catch(error => showToast(error.message)); };
      section.append(button);
    });
    dom.chatHistory.append(section);
  }
}

function renderConversationHeader() {
  const chat = state.currentChat;
  dom.pageTitle.textContent = chat?.title || "New chat";
  const activeHere = Boolean(state.activeRun && chat && state.activeRun.chat_id === chat.id);
  dom.pageSubtitle.textContent = activeHere ? `${state.activeRun.stage || "Working"} · ${formatElapsed(state.activeRun.elapsed_seconds)}` : "Local model · private workspace";
  dom.renameChat.hidden = !(chat && (chat.messages || []).length);
  const queueCount = (chat?.queue || []).length;
  dom.queueBadge.hidden = !queueCount;
  dom.queueBadge.textContent = queueCount;
  const artifactCount = (chat?.artifacts || []).length;
  dom.artifactButton.hidden = !artifactCount;
  dom.artifactBadge.textContent = artifactCount;
}

function renderConversation() {
  const chat = state.currentChat;
  const messages = chat?.messages || [];
  dom.emptyState.hidden = messages.length > 0;
  dom.messageList.hidden = messages.length === 0;
  renderGreeting();
  if (!messages.length) { dom.messageList.replaceChildren(); return; }
  dom.messageList.replaceChildren(...messages.map(createMessageElement));
  if (chat && state.activeRun?.chat_id === chat.id) dom.messageList.prepend(createRunStatusCard());
  decorateMarkdown(dom.messageList);
}

function renderGreeting() {
  const name = state.settings.user_display_name || "";
  const template = state.settings.greeting_template || "{time}, {name}";
  dom.greeting.textContent = template.replaceAll("{time}", timeGreeting()).replaceAll("{name}", name).replace(/,\s*$/, "");
  dom.suggestions.hidden = !state.settings.show_suggestions;
  dom.suggestions.replaceChildren();
  (state.settings.suggestions || []).slice(0, 3).forEach(text => {
    const button = document.createElement("button"); button.type = "button"; button.className = "suggestion"; button.textContent = text;
    button.onclick = () => { dom.prompt.value = text; autoResize(dom.prompt); dom.prompt.focus(); };
    dom.suggestions.append(button);
  });
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = `message-row ${message.role}`;
  article.dataset.messageId = message.id;
  const body = document.createElement("div"); body.className = "message-body";
  if (message.role === "assistant") {
    const meta = document.createElement("div"); meta.className = "message-meta";
    const labels = ["Felix", message.effort, message.status === "streaming" ? "Working" : ""] .filter(Boolean);
    meta.textContent = labels.join(" · "); body.append(meta);
    if (message.thinking) {
      const details = document.createElement("details"); details.className = "thinking-disclosure";
      details.open = message.status === "streaming" && !message.content;
      details.innerHTML = `<summary>Thinking trace${message.thinking_seconds ? ` · ${formatElapsed(message.thinking_seconds)}` : ""}</summary><div class="thinking-content"></div>`;
      $(".thinking-content", details).textContent = message.thinking;
      body.append(details);
    }
    const content = document.createElement("div"); content.className = "message-content";
    content.innerHTML = renderMarkdown(message.content || (message.status === "streaming" ? "_Working…_" : ""));
    body.append(content);
    if (message.sources?.length) {
      const sources = document.createElement("div"); sources.className = "source-list attachment-summary";
      message.sources.forEach(source => {
        const link = document.createElement("a"); link.className = "source-tag"; link.href = source.url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = `[${source.number}] ${source.title}`;
        sources.append(link);
      });
      body.append(sources);
    }
    if (message.artifact_ids?.length) {
      const artifacts = document.createElement("div"); artifacts.className = "attachment-summary";
      message.artifact_ids.forEach(id => {
        const button = document.createElement("button"); button.className = "artifact-tag"; button.type = "button"; button.textContent = "Open artifact";
        button.onclick = () => openArtifactPane(id);
        artifacts.append(button);
      });
      body.append(artifacts);
    }
  } else {
    const content = document.createElement("div"); content.className = "message-content"; content.textContent = message.content || ""; body.append(content);
    if (message.attachments?.length) {
      const attachments = document.createElement("div"); attachments.className = "attachment-summary";
      message.attachments.forEach(item => {
        const tag = document.createElement("span"); tag.className = "attachment-tag"; tag.textContent = `${item.name}${item.truncated ? " · truncated" : ""}`; attachments.append(tag);
      }); body.append(attachments);
    }
  }
  article.append(body); return article;
}

function createRunStatusCard() {
  const card = document.createElement("div"); card.className = "run-status-card"; card.id = "live-run-status";
  const active = state.activeRun || {};
  card.innerHTML = `<div><strong>${escapeHtml(active.status || "Felix is working…")}</strong> <span>· ${escapeHtml(active.stage || "")}</span> <span>· ${formatElapsed(active.elapsed_seconds)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Number(active.progress) || 0}%"></div></div>`;
  return card;
}

function renderLiveMessage() {
  if (!state.currentChat || state.activeRun?.chat_id !== state.currentChat.id) return;
  const message = state.currentChat.messages?.find(item => item.id === state.activeRun.message_id || item.id === state.activeRun.assistant_message_id);
  if (!message) return;
  message.content = state.activeRun.answer ?? message.content;
  message.thinking = state.activeRun.thinking ?? message.thinking;
  const row = dom.messageList.querySelector(`[data-message-id="${CSS.escape(message.id)}"]`);
  if (!row) { renderConversation(); scrollToBottom(); return; }
  const content = $(".message-content", row);
  if (content) { content.innerHTML = renderMarkdown(message.content || "_Working…_"); decorateMarkdown(content); }
  let disclosure = $(".thinking-disclosure", row);
  if (message.thinking && !disclosure) { renderConversation(); scrollToBottom(); return; }
  if (disclosure) $(".thinking-content", disclosure).textContent = message.thinking || "";
  const status = $("#live-run-status");
  if (status) status.replaceWith(createRunStatusCard());
  scrollToBottom();
}

function scheduleLiveRender() {
  if (state.liveRenderFrame) return;
  state.liveRenderFrame = requestAnimationFrame(() => { state.liveRenderFrame = 0; renderLiveMessage(); });
}

function renderComposer() {
  dom.prompt.placeholder = state.settings.prompt_placeholder || "How can I help you today?";
  dom.effortControl.textContent = `${state.effort} ▾`;
  dom.targetControl.textContent = `Target: ${formatTarget(state.targetMinutes)} ▾`;
  dom.webControl.textContent = `Web: ${{ Off: "Off", Automatic: "Auto", Always: "Always" }[state.webMode] || "Auto"} ▾`;
  dom.fileControl.textContent = state.pendingAttachments.length ? `＋ File (${state.pendingAttachments.length})` : "＋ File";
  dom.attachmentTray.hidden = !state.pendingAttachments.length;
  dom.attachmentTray.replaceChildren(...state.pendingAttachments.map(item => {
    const chip = document.createElement("span"); chip.className = "attachment-chip";
    chip.innerHTML = `<span>${escapeHtml(item.name)}</span><button type="button" aria-label="Remove attachment">×</button>`;
    $("button", chip).onclick = () => { state.pendingAttachments = state.pendingAttachments.filter(value => value.id !== item.id); renderComposer(); };
    return chip;
  }));
  const busy = Boolean(state.activeRun);
  dom.stopButton.hidden = !busy;
  dom.sendButton.textContent = busy ? "+" : "↑";
  dom.sendButton.title = busy ? "Add to this chat's queue" : "Send message";
  dom.composerStatus.textContent = busy ? `${state.activeRun.stage || "Working"} · new messages queue` : "";
  autoResize(dom.prompt);
}

async function submitPrompt(event) {
  event.preventDefault();
  if (!state.currentChat) return;
  const prompt = dom.prompt.value.trim();
  if (!prompt && !state.pendingAttachments.length) return;
  const payload = {
    prompt,
    effort: state.effort,
    minimum_work_minutes: state.targetMinutes,
    web_mode: state.webMode,
    attachment_ids: state.pendingAttachments.map(item => item.id),
  };
  dom.prompt.value = ""; autoResize(dom.prompt);
  state.pendingAttachments = [];
  renderComposer();
  try {
    await api(`/api/chats/${encodeURIComponent(state.currentChat.id)}/submit`, { method: "POST", body: JSON.stringify(payload) });
    await loadChat(state.currentChat.id);
  } catch (error) {
    showToast(error.message);
    dom.prompt.value = prompt; autoResize(dom.prompt);
  }
}

async function uploadFiles(files) {
  if (!files?.length) return;
  const form = new FormData(); [...files].forEach(file => form.append("files", file));
  dom.fileControl.disabled = true; dom.fileControl.textContent = "Uploading…";
  try {
    const items = await api("/api/attachments", { method: "POST", body: form });
    state.pendingAttachments.push(...items.filter(item => !state.pendingAttachments.some(existing => existing.id === item.id)));
    renderComposer();
  } catch (error) { showToast(error.message); }
  finally { dom.fileControl.disabled = false; renderComposer(); }
}

function showFilePopover() {
  const container = document.createElement("div");
  container.innerHTML = `<div class="popover-title">Attach files</div><button class="popover-option" data-action="picker"><span>＋</span><span class="popover-option-copy"><strong>Choose from this computer</strong><small>Uses the browser's native file picker and supports multiple files.</small></span></button><button class="popover-option" data-action="host"><span>⌂</span><span class="popover-option-copy"><strong>Use paths on the home PC</strong><small>One complete Windows path per line.</small></span></button><button class="popover-option" data-action="clear"><span>×</span><span class="popover-option-copy"><strong>Clear attachments</strong><small>Remove pending files from this prompt.</small></span></button>`;
  container.onclick = async event => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    closePopover();
    if (action === "picker") dom.fileInput.click();
    if (action === "clear") { state.pendingAttachments = []; renderComposer(); }
    if (action === "host") {
      const result = await showModal({ title: "Attach files from home PC", message: "Enter one complete path per line.", textarea: true, primary: "Attach" });
      if (!result) return;
      try {
        const items = await api("/api/attachments/host-paths", { method: "POST", body: JSON.stringify({ paths: result.split(/\r?\n/).map(value => value.trim()).filter(Boolean) }) });
        state.pendingAttachments.push(...items); renderComposer();
      } catch (error) { showToast(error.message); }
    }
  };
  openPopover(dom.fileControl, container, 390);
}

function showEffortPopover() {
  const options = [
    ["Light", "Direct answer · no extended thinking"],
    ["Medium", "Three perspectives, critic, synthesis · no extended thinking"],
    ["High", "Direct answer · extended thinking"],
    ["Extra", "Three perspectives, critic, synthesis · extended thinking"],
  ];
  const container = document.createElement("div"); container.innerHTML = `<div class="popover-title">Effort</div>`;
  options.forEach(([name, description]) => {
    const button = document.createElement("button"); button.className = `popover-option${state.effort === name ? " active" : ""}`; button.type = "button";
    button.innerHTML = `<span>${state.effort === name ? "●" : "○"}</span><span class="popover-option-copy"><strong>${name}</strong><small>${description}</small></span>`;
    button.onclick = () => { state.effort = name; renderComposer(); closePopover(); };
    container.append(button);
  });
  openPopover(dom.effortControl, container, 410);
}

function showWebPopover() {
  const options = [
    ["Off", "The request remains entirely local."],
    ["Automatic", "Felix searches when external/current evidence is materially useful."],
    ["Always", "Every request begins with web research."],
  ];
  const container = document.createElement("div"); container.innerHTML = `<div class="popover-title">Web access</div>`;
  options.forEach(([name, description]) => {
    const button = document.createElement("button"); button.className = `popover-option${state.webMode === name ? " active" : ""}`; button.type = "button";
    button.innerHTML = `<span>${state.webMode === name ? "●" : "○"}</span><span class="popover-option-copy"><strong>${name === "Always" ? "Always search" : name}</strong><small>${description}</small></span>`;
    button.onclick = () => { state.webMode = name; renderComposer(); closePopover(); };
    container.append(button);
  });
  openPopover(dom.webControl, container, 410);
}

function showTargetPopover() {
  const presets = [[0, "None"], [15, "15 minutes"], [60, "1 hour"], [120, "2 hours"], [240, "4 hours"], [480, "8 hours"]];
  const container = document.createElement("div"); container.innerHTML = `<div class="popover-title">Minimum active work target</div>`;
  presets.forEach(([minutes, label]) => {
    const button = document.createElement("button"); button.className = `popover-option${state.targetMinutes === minutes ? " active" : ""}`; button.type = "button";
    button.innerHTML = `<span>${state.targetMinutes === minutes ? "●" : "○"}</span><span class="popover-option-copy"><strong>${label}</strong></span>`;
    button.onclick = () => { state.targetMinutes = minutes; renderComposer(); closePopover(); };
    container.append(button);
  });
  const section = document.createElement("div"); section.className = "popover-section";
  section.innerHTML = `<label>Custom duration<input type="text" placeholder="30m, 2h, 1h 30m"></label><button class="primary-button" type="button">Apply</button>`;
  $("button", section).onclick = () => {
    const value = $("input", section).value.trim(); const matchHours = [...value.matchAll(/(\d+(?:\.\d+)?)\s*h/gi)]; const matchMinutes = [...value.matchAll(/(\d+(?:\.\d+)?)\s*m/gi)];
    let minutes = matchHours.reduce((sum, match) => sum + Number(match[1]) * 60, 0) + matchMinutes.reduce((sum, match) => sum + Number(match[1]), 0);
    if (!minutes && /^\d+$/.test(value)) minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes < 0) { showToast("Enter a duration such as 30m, 2h, or 1h 30m."); return; }
    state.targetMinutes = Math.round(minutes); renderComposer(); closePopover();
  };
  container.append(section); openPopover(dom.targetControl, container, 390);
}

function renderQueue() {
  const queue = state.currentChat?.queue || [];
  dom.queueBadge.hidden = !queue.length;
  dom.queueBadge.textContent = queue.length;
  dom.queueList.replaceChildren();
  if (!queue.length) {
    dom.queueList.innerHTML = `<div class="artifact-empty">No queued messages in this chat.</div>`; return;
  }
  queue.forEach(item => {
    const card = document.createElement("div"); card.className = "queue-item";
    card.innerHTML = `<div><strong>${escapeHtml(item.prompt || "Analyze attached files")}</strong><p>${escapeHtml(item.effort)} · Web ${escapeHtml(item.web_mode)} · Target ${formatTarget(item.minimum_work_minutes)}</p><small>${formatDateTime(item.created_at)}</small></div><button type="button" aria-label="Remove">×</button>`;
    $("button", card).onclick = async () => {
      await api(`/api/chats/${encodeURIComponent(state.currentChat.id)}/queue/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      await loadChat(state.currentChat.id, false);
    };
    dom.queueList.append(card);
  });
}

function renderSkills() {
  dom.skillsList.replaceChildren();
  state.skills.forEach(skill => {
    const button = document.createElement("button"); button.type = "button"; button.className = `section-list-item${state.selectedSkillId === skill.id ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(skill.name)}</strong><span>${skill.enabled ? "Enabled" : "Disabled"} · ${escapeHtml(skill.description || "No description")}</span>`;
    button.onclick = () => { state.selectedSkillId = skill.id; populateSkillEditor(skill); renderSkills(); };
    dom.skillsList.append(button);
  });
  const selected = state.skills.find(skill => skill.id === state.selectedSkillId);
  if (!selected && state.skills.length) { state.selectedSkillId = state.skills[0].id; populateSkillEditor(state.skills[0]); renderSkills(); }
}

function populateSkillEditor(skill = null) {
  dom.skillEnabled.checked = Boolean(skill?.enabled);
  dom.skillName.value = skill?.name || "";
  dom.skillDescription.value = skill?.description || "";
  dom.skillInstructions.value = skill?.instructions || "";
  dom.skillStatus.textContent = skill ? `Last updated ${formatDateTime(skill.updated_at)}` : "New unsaved skill.";
  dom.deleteSkill.disabled = !skill;
}

async function saveSkill() {
  const payload = {
    id: state.selectedSkillId || null,
    name: dom.skillName.value.trim() || "Untitled skill",
    description: dom.skillDescription.value.trim(),
    instructions: dom.skillInstructions.value.trim(),
    enabled: dom.skillEnabled.checked,
  };
  const skill = await api("/api/skills", { method: "POST", body: JSON.stringify(payload) });
  const index = state.skills.findIndex(item => item.id === skill.id);
  if (index >= 0) state.skills[index] = skill; else state.skills.push(skill);
  state.selectedSkillId = skill.id; renderSkills(); showToast("Skill saved");
}

async function refreshDetails() {
  if (!state.connected) return;
  try {
    const data = await api(`/api/details${state.currentChatId ? `?chat_id=${encodeURIComponent(state.currentChatId)}` : ""}`);
    state.activeRun = data.active || state.activeRun;
    const run = data.last_run || state.currentChat?.last_run || {};
    const stats = [
      ["Effort", run.effort || state.activeRun?.effort || "—"],
      ["Thinking", run.thinking_seconds != null ? formatElapsed(run.thinking_seconds) : "—"],
      ["Elapsed", run.elapsed_seconds != null ? formatElapsed(run.elapsed_seconds) : "—"],
      ["Web sources", run.web_sources ?? state.activeRun?.web_sources ?? "—"],
      ["Cycles", run.cycles ?? state.activeRun?.cycle ?? "—"],
      ["Early verified", run.early_verified == null ? "—" : run.early_verified ? "Yes" : "No"],
      ["Completed", run.completed_at ? formatDateTime(run.completed_at) : "—"],
      ["Work log", run.work_log ? run.work_log.split(/[\\/]/).pop() : "—"],
    ];
    dom.runSummary.innerHTML = stats.map(([label, value]) => `<div class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    const active = data.active;
    dom.activeRunDetails.textContent = active ? `${active.status || "Working"}\n${active.stage || ""}\nProgress: ${active.progress || 0}%\nElapsed: ${formatElapsed(active.elapsed_seconds)}\nVerification: ${active.verification_passes || 0}/${active.verification_required || 0}\nWeb: ${active.web_searches || 0} searches, ${active.web_sources || 0} sources` : "No run is active.";
    dom.runTranscript.textContent = run.details || run.error || "No completed run in this chat.";
    await refreshLogs();
  } catch (error) { showToast(error.message); }
}

async function refreshLogs() {
  const logs = await api("/api/logs");
  dom.logsList.replaceChildren();
  logs.forEach(log => {
    const button = document.createElement("button"); button.type = "button"; button.className = "log-button"; button.textContent = `${log.name} · ${formatBytes(log.size)}`;
    button.onclick = async () => {
      const data = await api(`/api/logs/${encodeURIComponent(log.name)}`);
      dom.logContent.hidden = false; dom.logContent.textContent = data.content;
    };
    dom.logsList.append(button);
  });
}

async function refreshModels() {
  state.models = await api("/api/models");
  const names = state.models.map(item => item.name || item.model).filter(Boolean);
  if (names.length && !names.includes(state.settings.model)) {
    state.settings.model = names[0];
  }
  dom.selectedModelLabel.textContent = state.settings.model || "No model";
  dom.settingModel.value = state.settings.model || "";
}

function showModelPicker() {
  const container = document.createElement("div");
  container.innerHTML = `<div class="popover-title">Installed Ollama engines</div><div class="model-popover-list"></div><div class="popover-section"><button class="ghost-button" type="button">Refresh engines</button></div>`;
  const list = $(".model-popover-list", container);
  if (!state.models.length) list.innerHTML = `<div class="popover-option-copy" style="padding:10px"><small>No engines loaded. Use Refresh.</small></div>`;
  state.models.forEach(item => {
    const name = item.name || item.model;
    const button = document.createElement("button"); button.className = `popover-option${name === state.settings.model ? " active" : ""}`; button.type = "button";
    button.innerHTML = `<span>${name === state.settings.model ? "●" : "○"}</span><span class="popover-option-copy"><strong>${escapeHtml(name)}</strong><small>${formatBytes(item.size || 0)}${item.modified_at ? ` · ${formatDateTime(item.modified_at)}` : ""}</small></span>`;
    button.onclick = async () => {
      state.settings.model = name; state.effort = state.settings.effort || state.effort;
      await api("/api/settings", { method: "PATCH", body: JSON.stringify({ settings: { model: name } }) });
      dom.selectedModelLabel.textContent = name; dom.settingModel.value = name; closePopover(); showToast(`Selected ${name}`);
    };
    list.append(button);
  });
  $(".popover-section button", container).onclick = async () => { await refreshModels(); closePopover(); showModelPicker(); };
  openPopover(dom.modelPicker, container, 410);
}

function renderModelEditorState() {
  dom.modelSource.value = state.settings.model || "";
  if (!dom.modelName.value || dom.modelName.value === "felix-custom:latest") {
    const base = (state.settings.model || "felix").split(":")[0]; dom.modelName.value = `${base}-felix:latest`;
  }
}

function extractSystemPrompt(modelfile) {
  const triple = modelfile.match(/^\s*SYSTEM\s+"""([\s\S]*?)"""/im);
  if (triple) return triple[1].trim();
  const quoted = modelfile.match(/^\s*SYSTEM\s+"((?:\\.|[^"\\])*)"/im);
  if (quoted) { try { return JSON.parse(`"${quoted[1]}"`); } catch { return quoted[1]; } }
  return "";
}

function setSystemPromptInModelfile(modelfile, systemPrompt) {
  const block = systemPrompt.trim() ? `SYSTEM """\n${systemPrompt.trim()}\n"""` : "";
  const pattern = /^\s*SYSTEM\s+(?:"""[\s\S]*?"""|"(?:\\.|[^"\\])*")\s*/im;
  if (pattern.test(modelfile)) return modelfile.replace(pattern, block ? `${block}\n` : "").trim();
  if (!block) return modelfile.trim();
  const lines = modelfile.trim().split("\n");
  const fromIndex = lines.findIndex(line => /^\s*FROM\s+/i.test(line));
  lines.splice(fromIndex >= 0 ? fromIndex + 1 : 0, 0, "", block, "");
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function loadSelectedModel() {
  const model = state.settings.model;
  if (!model) { showToast("Select an installed engine first."); return; }
  dom.loadModel.disabled = dom.reloadModel.disabled = dom.buildModel.disabled = true;
  dom.modelEditorStatus.textContent = `Reading ${model} from Ollama…`;
  try {
    const data = await api("/api/models/show", { method: "POST", body: JSON.stringify({ model }) });
    let modelfile = String(data.modelfile || "");
    modelfile = modelfile.replace(/^\s*FROM\s+.+$/im, `FROM ${model}`);
    dom.modelfile.value = modelfile;
    dom.systemPrompt.value = extractSystemPrompt(modelfile);
    state.loadedModelSnapshot = { modelfile, systemPrompt: dom.systemPrompt.value, source: model };
    dom.modelSource.value = model;
    dom.modelName.value = `${model.split(":")[0]}-felix:latest`;
    dom.modelEditorStatus.textContent = `Loaded ${model}.`;
  } catch (error) { dom.modelEditorStatus.textContent = error.message; showToast(error.message); }
  finally { dom.loadModel.disabled = dom.reloadModel.disabled = dom.buildModel.disabled = false; }
}

function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function populateSettings() {
  const s = state.settings;
  dom.settingDisplayName.value = s.user_display_name || "";
  dom.settingUserAddress.value = s.user_address || "";
  dom.settingGreetingTemplate.value = s.greeting_template || "{time}, {name}";
  dom.settingPlaceholder.value = s.prompt_placeholder || "";
  dom.settingSuggestions.checked = Boolean(s.show_suggestions);
  dom.settingOllamaUrl.value = s.ollama_url || "";
  dom.settingModel.value = s.model || "";
  dom.serperStatus.textContent = state.serperStored ? "Key stored securely" : "No key stored";
  dom.serperStatus.classList.toggle("stored", state.serperStored);
  setSettingsWebMode(s.web_mode || "Automatic", false);
  dom.settingWebCountry.value = s.web_country || "us";
  dom.settingWebLanguage.value = s.web_language || "en";
  dom.settingWebSearches.value = s.web_max_searches ?? 4;
  dom.settingWebPages.value = s.web_max_pages ?? 3;
  dom.settingWebRead.checked = Boolean(s.web_read_pages);
  dom.settingContext.value = s.context_tokens ?? 16384;
  dom.settingSolver.value = s.solver_tokens ?? 2200;
  dom.settingCritic.value = s.critic_tokens ?? 1600;
  dom.settingFinal.value = s.final_tokens ?? 2200;
  dom.settingTarget.value = formatTarget(s.default_minimum_work_minutes).replace("None", "0");
  dom.settingVerification.value = s.verification_passes_required ?? 3;
  dom.settingHistory.checked = Boolean(s.history_enabled);
  dom.settingArtifacts.checked = Boolean(s.artifacts_enabled);
  dom.settingPreview.checked = Boolean(s.preview_enabled);
  dom.settingSystemPrompt.value = s.custom_system_prompt || "";
}

function setSettingsWebMode(mode, update = true) {
  $$("button", dom.settingWebMode).forEach(button => button.classList.toggle("active", button.dataset.value === mode));
  dom.webModeDescription.textContent = {
    Off: "Felix never sends search queries or fetches public webpages.",
    Automatic: "Felix searches when current or external information is materially useful.",
    Always: "Every request begins with web research before local reasoning.",
  }[mode];
  if (update) state.settings.web_mode = mode;
}

async function saveSettings() {
  const selectedMode = $("button.active", dom.settingWebMode)?.dataset.value || "Automatic";
  const payload = {
    user_display_name: dom.settingDisplayName.value.trim(),
    user_address: dom.settingUserAddress.value.trim(),
    greeting_template: dom.settingGreetingTemplate.value,
    prompt_placeholder: dom.settingPlaceholder.value,
    show_suggestions: dom.settingSuggestions.checked,
    ollama_url: dom.settingOllamaUrl.value.trim(),
    model: state.settings.model,
    web_mode: selectedMode,
    web_country: dom.settingWebCountry.value.trim(),
    web_language: dom.settingWebLanguage.value.trim(),
    web_max_searches: Number(dom.settingWebSearches.value),
    web_max_pages: Number(dom.settingWebPages.value),
    web_read_pages: dom.settingWebRead.checked,
    context_tokens: Number(dom.settingContext.value),
    solver_tokens: Number(dom.settingSolver.value),
    critic_tokens: Number(dom.settingCritic.value),
    final_tokens: Number(dom.settingFinal.value),
    default_minimum_work_minutes: dom.settingTarget.value.trim(),
    verification_passes_required: Number(dom.settingVerification.value),
    history_enabled: dom.settingHistory.checked,
    artifacts_enabled: dom.settingArtifacts.checked,
    preview_enabled: dom.settingPreview.checked,
    custom_system_prompt: dom.settingSystemPrompt.value,
    effort: state.settings.effort || state.effort,
  };
  state.settings = await api("/api/settings", { method: "PATCH", body: JSON.stringify({ settings: payload }) });
  state.effort = state.settings.effort; state.webMode = state.settings.web_mode; state.targetMinutes = Number(state.settings.default_minimum_work_minutes) || 0;
  renderAll(); populateSettings(); showToast("Settings saved");
}

function renderArtifactPane() {
  const artifacts = state.currentChat?.artifacts || [];
  dom.artifactCount.textContent = `${artifacts.length} item${artifacts.length === 1 ? "" : "s"}`;
  dom.artifactList.replaceChildren();
  artifacts.forEach(item => {
    const button = document.createElement("button"); button.type = "button"; button.className = `artifact-list-item${state.selectedArtifactId === item.id ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.type)}${item.language ? ` · ${escapeHtml(item.language)}` : ""}</span>`;
    button.onclick = () => selectArtifact(item.id);
    dom.artifactList.append(button);
  });
}

async function openArtifactPane(id = "") {
  dom.artifactPane.hidden = false; dom.body.classList.add("artifacts-open");
  renderArtifactPane();
  const target = id || state.selectedArtifactId || state.currentChat?.artifacts?.[0]?.id;
  if (target) await selectArtifact(target);
}
function closeArtifactPane() { dom.artifactPane.hidden = true; dom.body.classList.remove("artifacts-open"); }

async function selectArtifact(id) {
  state.selectedArtifactId = id;
  state.selectedArtifact = await api(`/api/artifacts/${encodeURIComponent(id)}`);
  renderArtifactPane(); renderSelectedArtifact();
}

function artifactPreviewDocument(artifact) {
  const content = artifact.content || "";
  if (artifact.type === "html") return content;
  if (artifact.type === "svg") return `<!doctype html><html><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:white">${content}</body></html>`;
  if (artifact.type === "markdown") return `<!doctype html><html><head><meta charset="utf-8"><style>body{font:16px/1.6 system-ui;max-width:850px;margin:40px auto;padding:0 20px;color:#111}pre{background:#eee;padding:12px;overflow:auto}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:7px}</style></head><body>${renderMarkdown(content)}</body></html>`;
  return `<!doctype html><html><body><pre style="white-space:pre-wrap;font:14px/1.5 monospace">${escapeHtml(content)}</pre></body></html>`;
}

function renderSelectedArtifact() {
  const artifact = state.selectedArtifact;
  const enabled = Boolean(artifact);
  [dom.copyArtifact, dom.downloadArtifact, dom.openArtifact].forEach(button => { button.disabled = !enabled; });
  dom.artifactEmpty.hidden = enabled;
  if (!artifact) { dom.artifactTitle.textContent = "Select an artifact"; dom.artifactMeta.textContent = ""; dom.artifactPreview.hidden = dom.artifactSource.hidden = true; return; }
  dom.artifactTitle.textContent = artifact.title;
  dom.artifactMeta.textContent = `${artifact.type}${artifact.language ? ` · ${artifact.language}` : ""} · ${formatDateTime(artifact.created_at)}`;
  dom.artifactPreviewMode.classList.toggle("active", state.artifactMode === "preview");
  dom.artifactSourceMode.classList.toggle("active", state.artifactMode === "source");
  dom.artifactPreview.hidden = state.artifactMode !== "preview";
  dom.artifactSource.hidden = state.artifactMode !== "source";
  if (state.artifactMode === "preview") dom.artifactPreview.srcdoc = artifactPreviewDocument(artifact);
  else dom.artifactSource.textContent = artifact.content || "";
}

function connectWebSocket() {
  if (!state.connected) return;
  clearTimeout(state.websocketTimer);
  try { state.websocket?.close(); } catch {}
  const url = `${API_BASE_URL.replace(/^http/, "ws")}/ws`;
  const socket = new WebSocket(url); state.websocket = socket;
  socket.onopen = () => socket.send(JSON.stringify({ token: state.apiKey }));
  socket.onmessage = event => {
    try { handleSocketEvent(JSON.parse(event.data)); } catch {}
  };
  socket.onclose = () => {
    if (state.connected) state.websocketTimer = setTimeout(connectWebSocket, 2500);
  };
  socket.onerror = () => socket.close();
}

async function handleSocketEvent(event) {
  if (event.type === "auth_error") { disconnect("API key rejected"); return; }
  if (event.type === "auth_ok") { state.activeRun = event.active || state.activeRun; renderAll(); return; }
  if (event.type === "run_started") {
    state.activeRun = { ...event, message_id: event.assistant_message_id, answer: "", thinking: "" };
    state.chats.forEach(chat => { chat.working = chat.id === event.chat_id; });
    if (state.currentChatId === event.chat_id) {
      await loadChat(event.chat_id);
      const draft = (state.currentChat?.messages || []).find(message => message.id === event.assistant_message_id);
      if (draft) {
        state.activeRun.answer = draft.content || "";
        state.activeRun.thinking = draft.thinking || "";
      }
    } else renderChatHistory();
    renderComposer(); return;
  }
  if (["thinking_delta", "content_delta"].includes(event.type)) {
    if (!state.activeRun || state.activeRun.chat_id !== event.chat_id) return;
    if (event.type === "thinking_delta") state.activeRun.thinking = (state.activeRun.thinking || "") + (event.content || "");
    else state.activeRun.answer = (state.activeRun.answer || "") + (event.content || "");
    scheduleLiveRender(); return;
  }
  if (event.type === "run_state") {
    if (state.activeRun?.chat_id === event.chat_id) Object.assign(state.activeRun, event);
    renderConversationHeader(); renderComposer(); scheduleLiveRender();
    if (state.page === "details") refreshDetails(); return;
  }
  if (event.type === "web_stats" && state.activeRun?.chat_id === event.chat_id) {
    state.activeRun.web_searches = event.searches; state.activeRun.web_sources = event.sources; return;
  }
  if (event.type === "queue_changed") {
    if (state.currentChat?.id === event.chat_id) { state.currentChat.queue = event.queue || []; renderQueue(); renderConversationHeader(); }
    scheduleChatRefresh(); return;
  }
  if (["run_completed", "run_failed", "run_cancelled"].includes(event.type)) {
    if (state.currentChatId === event.chat_id) {
      await loadChat(event.chat_id);
      if (event.type === "run_completed" && state.settings.preview_enabled && event.artifacts?.length) {
        await openArtifactPane(event.artifacts[0].id);
      }
    }
    state.activeRun = null; scheduleChatRefresh(); renderComposer();
    if (event.type === "run_failed") showToast(event.error || "Request failed");
    return;
  }
  if (event.type === "run_idle") { state.activeRun = null; state.chats.forEach(chat => { chat.working = false; }); renderAll(); scheduleChatRefresh(); return; }
  if (event.type === "chat_updated") {
    if (state.currentChat?.id === event.chat_id && event.title) state.currentChat.title = event.title;
    scheduleChatRefresh(); renderConversationHeader(); return;
  }
  if (event.type === "chat_deleted") {
    state.chats = state.chats.filter(chat => chat.id !== event.chat_id);
    if (state.currentChatId === event.chat_id) await ensureCurrentChat();
    showToast("Chat deleted", "Undo", async () => { const chat = await api("/api/chats/undo-delete", { method: "POST", body: "{}" }); await refreshChats(); await loadChat(chat.id); }, 15000);
    return;
  }
  if (event.type === "skills_updated") { state.skills = await api("/api/skills"); renderSkills(); return; }
  if (event.type.startsWith("model_build_")) {
    if (event.type === "model_build_started") dom.modelEditorStatus.textContent = `Building ${event.name}…`;
    if (event.type === "model_build_progress") dom.modelEditorStatus.textContent = event.status || "Building…";
    if (event.type === "model_build_completed") { dom.modelEditorStatus.textContent = `Built and selected ${event.name}.`; state.settings.model = event.name; await refreshModels(); showToast("Engine created"); }
    if (event.type === "model_build_failed") { dom.modelEditorStatus.textContent = event.error; showToast(event.error); }
  }
}

// Event bindings

dom.connectForm.addEventListener("submit", async event => {
  event.preventDefault();
  state.apiKey = dom.apiKey.value.trim();
  if (!state.apiKey) return;
  sessionStorage.setItem(API_KEY_STORAGE, state.apiKey);
  dom.connectionText.textContent = "Connecting…";
  try { await bootstrap(); dom.apiKey.value = ""; } catch (error) { disconnect(error.message); }
});

dom.changeApiKey.onclick = () => disconnect();
dom.openSidebar.onclick = openSidebarMobile;
dom.closeSidebar.onclick = closeSidebarMobile;
dom.mobileScrim.onclick = closeSidebarMobile;
dom.newChat.onclick = () => createNewChat().catch(error => showToast(error.message));
dom.chatSearch.oninput = renderChatHistory;
dom.navButtons.forEach(button => button.onclick = () => showPage(button.dataset.page));
dom.modelPicker.onclick = showModelPicker;
dom.renameChat.onclick = async () => {
  if (!state.currentChat) return;
  const title = await showModal({ title: "Rename chat", input: true, value: state.currentChat.title, primary: "Save" });
  if (!title) return;
  const chat = await api(`/api/chats/${encodeURIComponent(state.currentChat.id)}`, { method: "PATCH", body: JSON.stringify({ title }) });
  state.currentChat = chat; await refreshChats(); renderAll();
};
dom.queueButton.onclick = () => { dom.queueDrawer.hidden = false; renderQueue(); };
dom.closeQueue.onclick = () => { dom.queueDrawer.hidden = true; };
dom.clearQueue.onclick = async () => { if (!state.currentChat) return; await api(`/api/chats/${encodeURIComponent(state.currentChat.id)}/queue`, { method: "DELETE" }); await loadChat(state.currentChat.id, false); };
dom.runNext.onclick = async () => { await api("/api/queue/resume", { method: "POST", body: "{}" }); dom.queueDrawer.hidden = true; };
dom.artifactButton.onclick = () => openArtifactPane().catch(error => showToast(error.message));
dom.closeArtifacts.onclick = closeArtifactPane;

dom.composer.addEventListener("submit", submitPrompt);
dom.prompt.addEventListener("input", () => autoResize(dom.prompt));
dom.prompt.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); dom.composer.requestSubmit(); } });
dom.conversationScroll.addEventListener("scroll", () => { state.followBottom = isNearBottom(); }, { passive: true });
dom.fileControl.onclick = showFilePopover;
dom.fileInput.onchange = () => { uploadFiles(dom.fileInput.files); dom.fileInput.value = ""; };
dom.targetControl.onclick = showTargetPopover;
dom.effortControl.onclick = showEffortPopover;
dom.webControl.onclick = showWebPopover;
dom.stopButton.onclick = () => api("/api/run/cancel", { method: "POST", body: "{}" }).catch(error => showToast(error.message));
["dragenter", "dragover"].forEach(type => dom.composer.addEventListener(type, event => { event.preventDefault(); dom.composer.classList.add("dragging"); }));
["dragleave", "drop"].forEach(type => dom.composer.addEventListener(type, event => { event.preventDefault(); dom.composer.classList.remove("dragging"); }));
dom.composer.addEventListener("drop", event => uploadFiles(event.dataTransfer.files));

dom.newSkill.onclick = () => { state.selectedSkillId = ""; populateSkillEditor(); renderSkills(); dom.skillName.focus(); };
dom.saveSkill.onclick = () => saveSkill().catch(error => showToast(error.message));
dom.deleteSkill.onclick = async () => {
  if (!state.selectedSkillId) return;
  const confirmed = await showModal({ title: "Delete skill?", message: "This removes the local reusable skill.", primary: "Delete" });
  if (confirmed === null) return;
  await api(`/api/skills/${encodeURIComponent(state.selectedSkillId)}`, { method: "DELETE" });
  state.skills = state.skills.filter(item => item.id !== state.selectedSkillId); state.selectedSkillId = ""; renderSkills(); populateSkillEditor();
};
dom.refreshDetails.onclick = refreshDetails;
dom.refreshLogs.onclick = () => refreshLogs().catch(error => showToast(error.message));

dom.loadModel.onclick = () => loadSelectedModel();
dom.reloadModel.onclick = () => loadSelectedModel();
dom.resetModel.onclick = () => {
  if (!state.loadedModelSnapshot) { showToast("Load an engine before resetting the editor."); return; }
  dom.modelfile.value = state.loadedModelSnapshot.modelfile;
  dom.systemPrompt.value = state.loadedModelSnapshot.systemPrompt;
  dom.modelSource.value = state.loadedModelSnapshot.source;
  dom.modelEditorStatus.textContent = `Reset to the loaded ${state.loadedModelSnapshot.source} definition.`;
};
dom.applySystemPrompt.onclick = () => { dom.modelfile.value = setSystemPromptInModelfile(dom.modelfile.value, dom.systemPrompt.value); dom.modelEditorStatus.textContent = "System prompt applied to Modelfile."; };
dom.modelfileImport.onchange = async () => { const file = dom.modelfileImport.files[0]; if (!file) return; dom.modelfile.value = await file.text(); dom.systemPrompt.value = extractSystemPrompt(dom.modelfile.value); dom.modelEditorStatus.textContent = `Imported ${file.name}`; dom.modelfileImport.value = ""; };
dom.downloadModelfile.onclick = () => { const content = setSystemPromptInModelfile(dom.modelfile.value, dom.systemPrompt.value); downloadText("Modelfile", content); };
dom.saveHostModelfile.onclick = async () => { const filename = await showModal({ title: "Save Modelfile on home PC", message: "Enter a filename. It will be saved under Felix data/Modelfiles.", input: true, value: `Modelfile-${new Date().toISOString().replace(/[:.]/g, "-")}`, primary: "Save" }); if (!filename) return; const data = await api("/api/models/save-copy", { method: "POST", body: JSON.stringify({ filename, content: setSystemPromptInModelfile(dom.modelfile.value, dom.systemPrompt.value) }) }); showToast(`Saved ${data.filename}`); };
dom.buildModel.onclick = async () => {
  const name = dom.modelName.value.trim(); const source = dom.modelSource.value.trim(); const content = setSystemPromptInModelfile(dom.modelfile.value, dom.systemPrompt.value);
  if (!name) { showToast("Enter a new engine name."); return; }
  const confirmed = await showModal({ title: "Build local engine?", message: `Felix will create '${name}'. The original engine remains unchanged.`, primary: "Build" });
  if (confirmed === null) return;
  await api("/api/models/build", { method: "POST", body: JSON.stringify({ name, source_model: source, modelfile: content }) });
  dom.modelEditorStatus.textContent = `Building ${name}…`;
};

dom.settingWebMode.addEventListener("click", event => { const button = event.target.closest("button[data-value]"); if (button) setSettingsWebMode(button.dataset.value); });
dom.saveSettings.onclick = () => saveSettings().catch(error => showToast(error.message));
dom.saveSerper.onclick = async () => { const key = dom.serperKey.value.trim(); if (!key) { showToast("Paste a Serper API key first."); return; } await api("/api/serper/key", { method: "POST", body: JSON.stringify({ key }) }); state.serperStored = true; dom.serperKey.value = ""; populateSettings(); showToast("Serper key encrypted and saved"); };
dom.testSerper.onclick = async () => { const key = dom.serperKey.value.trim(); const data = await api("/api/serper/test", { method: "POST", body: key ? JSON.stringify({ key }) : "null" }); showToast(`Serper works · ${data.results} results returned`); };
dom.clearSerper.onclick = async () => { await api("/api/serper/key", { method: "DELETE" }); state.serperStored = false; dom.serperKey.value = ""; populateSettings(); showToast("Serper key removed"); };
dom.openDataFolder.onclick = () => api("/api/data/open-folder", { method: "POST", body: "{}" }).then(data => showToast(`Opened ${data.path} on the home PC`)).catch(error => showToast(error.message));
dom.downloadBackup.onclick = async () => {
  const response = await fetch(`${API_BASE_URL}/api/data/backup`, { headers: getApiHeaders(false) });
  if (!response.ok) { showToast("Backup download failed"); return; }
  const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `felix-remote-backup-${new Date().toISOString().slice(0,10)}.zip`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
};

dom.artifactPreviewMode.onclick = () => { state.artifactMode = "preview"; renderSelectedArtifact(); };
dom.artifactSourceMode.onclick = () => { state.artifactMode = "source"; renderSelectedArtifact(); };
dom.copyArtifact.onclick = async () => { if (state.selectedArtifact) { await navigator.clipboard.writeText(state.selectedArtifact.content || ""); showToast("Artifact copied"); } };
dom.downloadArtifact.onclick = () => { if (!state.selectedArtifact) return; const extension = { html: "html", svg: "svg", markdown: "md" }[state.selectedArtifact.type] || "txt"; downloadText(`${state.selectedArtifact.title}.${extension}`, state.selectedArtifact.content || ""); };
dom.openArtifact.onclick = () => { if (!state.selectedArtifact) return; const blob = new Blob([artifactPreviewDocument(state.selectedArtifact)], { type: "text/html" }); window.open(URL.createObjectURL(blob), "_blank", "noopener"); };

dom.modal.addEventListener("submit", event => { event.preventDefault(); resolveModal(dom.modalInput.hidden ? dom.modalTextarea.hidden ? true : dom.modalTextarea.value : dom.modalInput.value); });
dom.modalClose.onclick = () => resolveModal(null);
dom.modalSecondary.onclick = () => resolveModal(null);
dom.modalBackdrop.addEventListener("click", event => { if (event.target === dom.modalBackdrop) resolveModal(null); });
document.addEventListener("click", event => { if (!dom.popover.hidden && !event.target.closest("#popover") && !event.target.closest(".composer-control") && !event.target.closest("#model-picker")) closePopover(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") { closePopover(); dom.queueDrawer.hidden = true; if (!dom.modalBackdrop.hidden) resolveModal(null); } });

async function initialize() {
  renderAll();
  if (!state.apiKey) { dom.connectBackdrop.hidden = false; dom.apiKey.focus(); return; }
  try { await bootstrap(); } catch (error) { disconnect(error.message); }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

initialize();
