/* global dscc */

// Utilitário: cria um mapa de cores por faixa
function colorFor(val, opts) {
  // faixas típicas da tua matriz 5x5 (ajuste se quiser)
  if (val <= 3) return opts.green;
  if (val <= 8) return opts.yellow;
  if (val <= 16) return opts.orange;
  if (val <= 20) return opts.red;
  return opts.darkred; // 25 etc.
}

function getOptionsFromStyle(style) {
  // Defaults batendo com o manifest.json
  const defaults = {
    green:   '#2e7d32',
    yellow:  '#fdd835',
    orange:  '#fbc02d',
    red:     '#e53935',
    darkred: '#b71c1c',
    showLabels: true,
  };

  const o = Object.assign({}, defaults);
  if (style) {
    // cores
    if (style.green && style.green.color) o.green = style.green.color;
    if (style.yellow && style.yellow.color) o.yellow = style.yellow.color;
    if (style.orange && style.orange.color) o.orange = style.orange.color;
    if (style.red && style.red.color) o.red = style.red.color;
    if (style.darkred && style.darkred.color) o.darkred = style.darkred.color;
    // checkbox
    if (typeof style.showLabels?.value === 'boolean') {
      o.showLabels = style.showLabels.value;
    }
  }
  return o;
}

function draw(data) {
  const root = document.getElementById('root');
  root.innerHTML = '';

  const opts = getOptionsFromStyle(data.style);

  // Espera tabela DEFAULT com 3 colunas: rowDim, colDim, value
  const rows = (data && data.tables && data.tables.DEFAULT) ? data.tables.DEFAULT : [];
  if (!rows.length) {
    root.innerHTML = '<div class="labels" style="margin:24px">Sem dados</div>';
    return;
  }

  // Extrai valores (normalmente virão como strings)
  const parsed = rows.map(r => ({
    row: Number(r[0]?.rawValue ?? r[0]?.value ?? r[0]),
    col: Number(r[1]?.rawValue ?? r[1]?.value ?? r[1]),
    val: Number(r[2]?.rawValue ?? r[2]?.value ?? r[2])
  }));

  // Ordena e cria conjunto de labels 1..5
  const rowsSet = [...new Set(parsed.map(x => x.row))].sort((a,b)=>a-b);
  const colsSet = [...new Set(parsed.map(x => x.col))].sort((a,b)=>a-b);

  // Monta um dicionário para acessar rápido [row][col] = val
  const grid = {};
  for (const r of rowsSet) {
    grid[r] = {};
    for (const c of colsSet) grid[r][c] = null;
  }
  for (const item of parsed) grid[item.row][item.col] = item.val;

  // Desenha tabela simples (linhas = prob, colunas = severidade)
  const table = document.createElement('table');

  // Cabeçalho (col labels)
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  // canto vazio
  const thEmpty = document.createElement('td');
  thEmpty.className = 'labels';
  htr.appendChild(thEmpty);
  // col labels
  colsSet.forEach(c => {
    const th = document.createElement('td');
    th.className = 'labels';
    th.style.background = 'transparent';
    th.style.border = 'none';
    th.style.color = '#333';
    th.textContent = c; // 1..5
    htr.appendChild(th);
  });
  thead.appendChild(htr);
  table.appendChild(thead);

  // Corpo: para cada linha (probabilidade)
  const tbody = document.createElement('tbody');
  rowsSet.forEach(r => {
    const tr = document.createElement('tr');

    const rowLab = document.createElement('td');
    rowLab.className = 'labels';
    rowLab.style.background = 'transparent';
    rowLab.style.border = 'none';
    rowLab.style.color = '#333';
    rowLab.textContent = r; // 1..5
    tr.appendChild(rowLab);

    colsSet.forEach(c => {
      const td = document.createElement('td');
      const value = grid[r][c];
      td.style.background = colorFor(Number(value || 0), opts);
      td.textContent = opts.showLabels && value != null ? String(value) : '';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  root.appendChild(table);
}

// Assina os dados do Looker Studio
dscc.subscribeToData(draw, { transform: dscc.tableTransform });
