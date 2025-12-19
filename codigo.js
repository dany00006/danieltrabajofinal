document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnAjustes");
  const panel = document.getElementById("panelAjustes");

  btn.addEventListener("click", () => {
    panel.classList.toggle("activo");
  });
});

function modoOscuro() {
  document.body.classList.toggle("dark-mode");
}

function aumentarFuente() {
  document.body.style.fontSize = "18px";
}

function reducirFuente() {
  document.body.style.fontSize = "14px";
}

function restablecer() {
  document.body.style.fontSize = "";
  document.body.classList.remove("dark-mode");
}

function enviarMensaje() {
  const input = document.getElementById("userInput");
  const chat = document.getElementById("chatBody");
  const mensaje = input.value.toLowerCase();

  if (mensaje === "") return;

  // Mensaje del usuario
  chat.innerHTML += `<div class="mensaje-user">${input.value}</div>`;
  input.value = "";

  let respuesta = "No entiendo tu pregunta 🤔";

  if (mensaje.includes("ferrari")) {
    respuesta = "Ferrari es uno de los equipos más históricos de la Fórmula 1 🟥";
  } else if (mensaje.includes("red bull")) {
    respuesta = "Red Bull es uno de los equipos más dominantes en los últimos años 🔵";
  } else if (mensaje.includes("mercedes")) {
    respuesta = "Mercedes dominó la era híbrida con Hamilton 🖤";
  } else if (mensaje.includes("campeón")) {
    respuesta = "Max Verstappen es uno de los campeones recientes 🏆";
  } else if (mensaje.includes("hola")) {
    respuesta = "¡Hola! Pregúntame sobre Fórmula 1 🏎️";
  }

  // Respuesta del bot
  setTimeout(() => {
    chat.innerHTML += `<div class="mensaje-bot">${respuesta}</div>`;
    chat.scrollTop = chat.scrollHeight;
  }, 500);
}
