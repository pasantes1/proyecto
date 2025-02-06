document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.querySelector(".chat-form");
  const userInput = document.getElementById("message-input");
  const chatMessages = document.querySelector(".mensaje");
  const sendButton = document.getElementById("send-button");
  const textoGrande = document.querySelector(".texto_grande");

  const emojiButton = document.getElementById("emoji-button");
  const emojiPicker = document.getElementById("emojiPicker");
  const emojis = document.querySelectorAll(".emoji");

  // Auto-ajuste del tamaño del input
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = `${userInput.scrollHeight}px`;
  });

  // Función para ocultar el texto inicial
  function desaparecer() {
    if (textoGrande) {
      textoGrande.style.display = "none";
    }
  }

  // Mostrar / Ocultar Emoji Picker
  function toggleEmojiPicker() {
    emojiPicker.style.display = emojiPicker.style.display === "block" ? "none" : "block";
  }

  emojiButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Evita cierre inmediato
    toggleEmojiPicker();
  });

  // Agregar emoji al input
  emojis.forEach((emoji) => {
    emoji.addEventListener("click", () => {
      userInput.value += emoji.textContent;
      userInput.focus(); // Mantener el foco después de agregar un emoji
    });
  });

  // Cerrar emoji picker al hacer clic fuera
  document.addEventListener("click", (event) => {
    if (!emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) {
      emojiPicker.style.display = "none";
    }
  });

  // Enviar mensaje con Enter (sin Shift)
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (userInput.value.trim() !== "") {
        chatForm.dispatchEvent(new Event("submit"));
      }
    }
  });

  // Manejo del envío de mensajes
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    desaparecer(); // Oculta el texto inicial

    // Agregar mensaje del usuario
    addMessage(message, true);

    // Limpiar input
    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    // Mostrar indicador de escritura
    const typingIndicator = showTypingIndicator();

    try {
      // Generar respuesta de la IA
      const response = await generateResponse(message);
      typingIndicator.remove();

      // Agregar respuesta del bot
      addMessage(response, false);
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendButton.disabled = false;
    }
  });

  // Función para obtener respuesta de la API de Gemini
  async function generateResponse(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBZZxsWAZnhu5MHSKLbkNgqSDMvjkyKfIM`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al generar la respuesta");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Función para agregar mensajes al chat
  function addMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `mensaje ${isUser ? "mensaje-usuario" : "bot-mensaje"}`;
    message.innerHTML = `<div class="mensaje-texto">${text}</div>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Indicador de escritura del bot
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "mensaje bot-mensaje";
    indicator.innerHTML = `<div class="mensaje-texto"><i class="fa-solid fa-ellipsis"></i></div>`;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  // Manejo de errores
  function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "mensaje bot-mensaje";
    message.innerHTML = `<div class="mensaje-texto" style="color: red;">Error: ${text}</div>`;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

