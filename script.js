document.addEventListener("DOMContentLoaded", function () {
  var chatContainer = document.querySelector(".chat-container");
  var userInput = document.querySelector("#user-input");
  var ageInput = document.querySelector("#age-input");
  var sendButton = document.querySelector("#send-button");

  if (!chatContainer || !userInput || !sendButton) {
    console.error("Required elements not found in DOM");
    return;
  }

  var isWaiting = false; // Prevent multiple requests

  function displayMessage(text, sender) {
    var msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return msgDiv; // Return so we can update it later
  }

  async function sendMessage() {
    if (isWaiting) return; // Ignore clicks while waiting

    var message = userInput.value.trim();
    var age = ageInput.value.trim();
    if (!message) return;

    // Display user message
    displayMessage("You (" + (age || "N/A") + "): " + message, "user");

    // Display bot loading message
    var loadingMsg = displayMessage("AI is typing...", "bot");
    loadingMsg.classList.add("loading");

    isWaiting = true;
    sendButton.disabled = true;

    try {
      var response = await fetch("https://botbackend-3-h103.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, age: age })
      });

      if (!response.ok) throw new Error("Network error: " + response.statusText);

      var data = await response.json();
      loadingMsg.classList.remove("loading");
      loadingMsg.textContent = data.reply;

    } catch (error) {
      console.error("Chat error:", error);
      loadingMsg.classList.remove("loading");
      loadingMsg.textContent = "Sorry, I couldn't reach the AI service.";
    } finally {
      userInput.value = "";
      ageInput.value = "";
      isWaiting = false;
      sendButton.disabled = false;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // Event listeners
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });
});
