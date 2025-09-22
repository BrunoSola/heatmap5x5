/* Espera 2 dimensões e 1 métrica:
   - Dimensão (linhas)  = Probabilidade (ex.: "1 – Nunca aconteceu", "2 – Baixa...", ...)
   - Dimensão (colunas) = Severidade (ex.: "Insignificante","Leve","Moderada","Grave","Crítica")
   - Métrica            = risco_valor_5x5 (ou MAX(risco_valor_5x5))
*/
const el = document.getElementById('root');

const orderAlphaNum = (arr) => [...new Set(arr)].sort((a,b)=> a.localeCompare(b,undefined,{numeric:true}));

function toPivot(table) {
  const rows = orderAlphaNum(table.map(r => r.dimensionValues[0].value));
  const cols = orderAlphaNum(table.map(r => r.dimensionValues[1].value));
  const map = new Map();
  table.forEach(r=>{
    const row = r.dimensionValues[0].value;
    const col = r.dimensionValues[1].value;
    const val = Number(r.metricValues[0].value);
    map.set(`${row}||${col}`, isFinite(val) ? val : 0);
  });
  return { rows, cols, get:(r,c)=> map.get(`${r}||${c}`) ?? 0 };
}

function color(val, s) {
  // Regras da sua matriz 5x5
  if (val === 0) return s.green;
  if (val <= 4)  return s.yellow;
  if (val <= 10) return s.orange;
  if (val <= 15) return s.red;
  return s.darkred;
}

function draw(data) {
  const table = data.tables.DEFAULT || [];
  const style = {
    green:   data.style.green   || '#2e7d32',
    yellow:  data.style.yellow  || '#fdd835',
    orange:  data.style.orange  || '#fb8c00',
    red:     data.style.red     || '#e53935',
    darkred: data.style.darkred || '#b71c1c',
    showLabels: data.style.showLabels !== false
  };

  const p = toPivot(table);
  el.innerHTML = '';
  const W = el.clientWidth || 900, H = el.clientHeight || 600;
  const m = { top: 60, right: 20, bottom: 50, left: 220 };
  const gridW = Math.max(300, W - m.left - m.right);
  const gridH = Math.max(300, H - m.top - m.bottom);
  const cw = gridW / p.cols.length;
  const ch = gridH / p.rows.length;

  const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);

  // Título opcional (vazio – o Looker costuma colocar título do componente)
  // svg.append('text').attr('x', W/2).attr('y', 28).attr('class','axis').attr('text-anchor','middle').text('Matriz 5x5 de Risco Psicossocial');

  // Rótulos Y (Probabilidade)
  const probTitle = 'Probabilidade →';
  svg.append('text')
     .attr('x', m.left - 10).attr('y', m.top - 28)
     .attr('class','axis').attr('text-anchor','end').text(probTitle);

  p.rows.forEach((r, i) => {
    svg.append('text')
      .attr('x', m.left - 10)
      .attr('y', m.top + i*ch + ch/2)
      .attr('class','axis')
      .attr('text-anchor','end')
      .text(r);
  });

  // Rótulos X (Severidade)
  const sevTitle = 'Severidade →';
  svg.append('text')
     .attr('x', m.left + gridW).attr('y', m.top - 28)
     .attr('class','axis').attr('text-anchor','end').text(sevTitle);

  p.cols.forEach((c, j) => {
    svg.append('text')
      .attr('x', m.left + j*cw + cw/2)
      .attr('y', m.top - 8)
      .attr('class','axis')
      .attr('text-anchor','middle')
      .text(c);
  });

  // Células
  p.rows.forEach((r, i) => {
    p.cols.forEach((c, j) => {
      const v = p.get(r,c);
      const x = m.left + j*cw, y = m.top + i*ch;
      svg.append('rect')
        .attr('x', x).attr('y', y).attr('width', cw).attr('height', ch)
        .attr('class','cell').attr('fill', color(v, style));
      if (style.showLabels) {
        svg.append('text')
          .attr('x', x + cw/2).attr('y', y + ch/2)
          .attr('class','lbl').text(v);
      }
    });
  });
}

dscc.subscribeToData(draw, { transform: dscc.tableTransform });
