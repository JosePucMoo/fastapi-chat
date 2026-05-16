const messagesDiv = document.getElementById("messages");
    const input = document.getElementById("msgInput");
    const button = document.getElementById("sendBtn");
    const usernameLabel = document.getElementById("usernameLabel");

    // Pedir nombre al usuario
    let username = prompt("Escribe tu nombre de usuario:");
    if (!username || !username.trim()) {
      const randomId = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
      username = `Invitado-${randomId}`;
    }
    username = username.trim();
    usernameLabel.textContent = username;

    // Conectar al WebSocket con username en query param
    const ws = new WebSocket(`ws://localhost:8000/ws/chat?username=${encodeURIComponent(username)}`);

    ws.onopen = () => {
      addSystemMessage("✅ Conectado al servidor");
    };

    ws.onmessage = (event) => {
      const text = event.data;
      const [msgUser, ...rest] = text.split(":");
      const msgBody = rest.join(":").trim();

      if (text.startsWith("🔵") || text.startsWith("🔴")) {
        addSystemMessage(text);
      } else if (rest.length > 0) {
        const isSelf = msgUser.trim() === username;
        addChatMessage(text, isSelf);
      } else {
        addChatMessage(text, false);
      }
    };

    ws.onclose = () => {
      addSystemMessage("🔴 Desconectado del servidor");
    };

    button.onclick = sendMessage;

    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      ws.send(text);
      input.value = "";
    }

    function addChatMessage(text, isSelf) {
      const div = document.createElement("div");
      div.classList.add("msg", isSelf ? "msg-self" : "msg-other");
      div.textContent = text;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function addSystemMessage(text) {
      const div = document.createElement("div");
      div.classList.add("msg", "msg-system");
      div.textContent = text;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }