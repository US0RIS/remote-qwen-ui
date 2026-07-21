// Replace this after you create your reserved zrok name.
const API_BASE_URL = "https://REPLACE-ME.share.zrok.io";

const keyPanel = document.querySelector("#key-panel");
const chatPanel = document.querySelector("#chat-panel");
const keyForm = document.querySelector("#key-form");
const keyInput = document.querySelector("#api-key");
const changeKeyButton = document.querySelector("#change-key");
const chatForm = document.querySelector("#chat-form");
const promptInput = document.querySelector("#prompt");
const sendButton = document.querySelector("#send");
const messagesElement = document.querySelector("#messages");
const statusElement = document.querySelector("#status");

const conversation = [];

function getApiKey() {
  return sessionStorage.getItem("remoteQwenApiKey") || "";
}

function setApiKey(value) {
  sessionStorage.setItem("remoteQwenApiKey", value);
}

function clearApiKey() {
  sessionStorage.removeItem("remoteQwenApiKey");
}

function showConnectedView() {
  const hasKey = Boolean(getApiKey());
  keyPanel.hidden = hasKey;
  chatPanel.hidden = !hasKey;
  changeKeyButton.hidden = !hasKey;

  if (hasKey) {
    promptInput.focus();
  } else {
    keyInput.focus();
  }
}

function addMessage(role, content) {
  const element = document.createElement("div");
  element.className = `message ${role}`;
  element.textContent = content;
  messagesElement.appendChild(element);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

async function checkHealth() {
  if (API_BASE_URL.includes("REPLACE-ME")) {
    statusElement.textContent = "Set API_BASE_URL in app.js";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        "skip_zrok_interstitial": "1"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    statusElement.textContent =
      `${data.status || "online"} · ${data.model || "model"}`;
  } catch (error) {
    statusElement.textContent = `Backend unavailable: ${error.message}`;
  }
}

keyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const key = keyInput.value.trim();

  if (!key) {
    return;
  }

  setApiKey(key);
  keyInput.value = "";
  showConnectedView();
});

changeKeyButton.addEventListener("click", () => {
  clearApiKey();
  showConnectedView();
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = promptInput.value.trim();
  const apiKey = getApiKey();

  if (!content || !apiKey) {
    return;
  }

  conversation.push({ role: "user", content });
  addMessage("user", content);
  promptInput.value = "";
  sendButton.disabled = true;
  promptInput.disabled = true;
  statusElement.textContent = "Qwen is responding…";

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "skip_zrok_interstitial": "1"
      },
      body: JSON.stringify({
        messages: conversation,
        temperature: 0.7
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail || `Request failed with HTTP ${response.status}`
      );
    }

    conversation.push({
      role: "assistant",
      content: data.content
    });
    addMessage("assistant", data.content);
    statusElement.textContent = `online · ${data.model}`;
  } catch (error) {
    addMessage("error", error.message);
    statusElement.textContent = "Request failed";
  } finally {
    sendButton.disabled = false;
    promptInput.disabled = false;
    promptInput.focus();
  }
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

showConnectedView();
checkHealth();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {
    // The website still works if service-worker registration is unavailable.
  });
}
