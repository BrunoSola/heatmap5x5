const cores = ["green", "yellow", "orange", "red", "darkred"];

function gerarHeatmap() {
  const container = document.getElementById("heatmap");

  for (let prob = 1; prob <= 5; prob++) {
    for (let sev = 1; sev <= 5; sev++) {
      const valor = prob * sev;
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.style.backgroundColor = cores[Math.min(cores.length - 1, Math.floor(valor / 6))];
      cell.innerText = valor;
      container.appendChild(cell);
    }
  }
}

gerarHeatmap();
