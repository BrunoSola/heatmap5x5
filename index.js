const cores = {
  verde: "#2e7d32",
  amarelo: "#fdd835",
  laranja: "#fb8c00",
  vermelho: "#e53935",
  vermelhoEscuro: "#b71c1c"
};

function corRisco(valor) {
  if (valor === 0) return cores.verde;
  if (valor <= 4) return cores.amarelo;
  if (valor <= 10) return cores.laranja;
  if (valor <= 15) return cores.vermelho;
  return cores.vermelhoEscuro;
}

function gerarHeatmap() {
  const container = document.getElementById("heatmap");
  container.style.gridTemplateColumns = "repeat(5, 100px)";
  container.style.gridTemplateRows = "repeat(5, 100px)";

  const labelsY = [
    "1 – Nunca aconteceu",
    "2 – Baixa (Raramente)",
    "3 – Média (Às vezes)",
    "4 – Alta (Freq.)",
    "5 – Muito Alta (Sempre)"
  ];

  for (let prob = 1; prob <= 5; prob++) {
    for (let sev = 1; sev <= 5; sev++) {
      const valor = (prob === 1 ? 0 : prob) * sev;
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.backgroundColor = corRisco(valor);
      cell.innerText = valor;
      container.appendChild(cell);
    }
  }
}
gerarHeatmap();
