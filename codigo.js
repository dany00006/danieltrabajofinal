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
