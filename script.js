const chatContainer = document.querySelector(".chat-container");
const userInput = document.querySelector("#user-input");
const sendButton = document.querySelector("#send-button");

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");

  try {
    const response = await fetch("https://botbackend-2-scqx.onrender.com", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});

    if (!response.ok) throw new Error("Network error: " + response.statusText);

    const data = await response.json();
    displayMessage(data.reply, "bot");
  } catch (error) {
    console.error("Chat error:", error);
    displayMessage("Sorry, I couldn't reach the AI service.", "bot");
  }

  userInput.value = "";
}

function displayMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
