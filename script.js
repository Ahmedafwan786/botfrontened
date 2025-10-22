// ✅ Load previous chat from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedChat = localStorage.getItem("chatHistory");
  if (savedChat) {
    document.querySelector(".chat-container").innerHTML = savedChat;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const chatContainer = document.querySelector(".chat-container");
  const userInput = document.querySelector("#user-input");
  const ageInput = document.querySelector("#age-input");
  const sendButton = document.querySelector("#send-button");

  if (!chatContainer || !userInput || !sendButton) {
    console.error("Required elements not found in DOM");
    return;
  }

  let isWaiting = false; // prevent multiple requests

  // ✅ Display chat message
  function displayMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Save chat to localStorage
    localStorage.setItem("chatHistory", chatContainer.innerHTML);
    return msgDiv;
  }

  // ✅ Clear chat function (optional)
  window.clearChat = function () {
    localStorage.removeItem("chatHistory");
    chatContainer.innerHTML = "";
  };

  // ✅ Send message to backend or dataset
  async function sendMessage() {
    if (isWaiting) return; // prevent spam clicks

    const message = userInput.value.trim();
    const age = ageInput.value.trim();
    if (!message) return;

    // Display user message
    displayMessage("You (" + (age || "N/A") + "): " + message, "user");

    // Display loading message
    const loadingMsg = displayMessage("AI is typing...", "bot");
    loadingMsg.classList.add("loading");

    isWaiting = true;
    sendButton.disabled = true;

    try {
      // Try backend first
      const response = await fetch("https://botbackend-3-h103.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, age: age })
      });

      if (!response.ok) throw new Error("Network error: " + response.statusText);

      const data = await response.json();
      loadingMsg.classList.remove("loading");
      loadingMsg.textContent = data.reply;
    } catch (error) {
      console.warn("Backend unreachable, using local dataset...", error);

      // ✅ Fallback: use dataset.js if backend fails
      loadingMsg.classList.remove("loading");

      if (typeof dataset !== "undefined") {
        const localReply = predictFromDataset(message);
        loadingMsg.textContent = localReply;
      } else {
        loadingMsg.textContent = "Sorry, I couldn't reach the AI service.";
      }
    } finally {
      userInput.value = "";
      ageInput.value = "";
      isWaiting = false;
      sendButton.disabled = false;
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Save updated chat
      localStorage.setItem("chatHistory", chatContainer.innerHTML);
    }
  }

  // ✅ Event listeners
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });
});

// ✅ Predict locally using dataset.js (if backend fails)
function predictFromDataset(message) {
  const text = message.toLowerCase();
  const matches = [];

  dataset.forEach((item) => {
    let score = 0;
    item.symptoms.forEach((sym) => {
      if (text.includes(sym)) score++;
    });
    if (score > 0) matches.push({ ...item, score });
  });

  matches.sort((a, b) => b.score - a.score);

  if (matches.length > 0) {
    let reply = "🤖 Possible Conditions:\n\n";
    matches.slice(0, 3).forEach((d, i) => {
      reply += `🔹 ${d.disease}\nSeverity: ${d.severity}\nPrecautions: ${d.precautions.join(", ")}\n\n`;
    });
    return reply.trim();
  } else {
    return "🤖 Sorry, I couldn't identify your condition locally.";
  }
}
