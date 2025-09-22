const el = document.getElementById('root');

function pivot(table) {
  // Espera 2 dimensões: row, col; 1 métrica: value
  const rows = [...new Set(table.map(r => r.dimensionValues[0].value))];
  const cols = [...new Set(table.map(r => r.dimensionValues[1].value))];
  // ordenar com prefixo numérico ("1 – ...", "2 – ...")
  rows.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  cols.sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));

  const map = new Map();
  table.forEach(r=>{
    const row = r.dimensionValues[0].value;
    const col = r.dimensionValues[1].value;
    const val = Number(r.metricValues[0].value);
    map.set(`${row}||${col}`, val);
  });
  return {rows, cols, get:(r,c)=> map.get(`${r}||${c}`) ?? 0};
}

function colorFor(val, opt){
  // Regras da sua matriz 5x5:
  if (val === 0) return opt.green;
  if (val <= 6)  return opt.yellow;
  if (val <= 10) return opt.orange;
  return opt.red;
}

function draw(data) {
  const {tables, style} = data;
  const opt = {
    green:  style.green || '#43A047',
    yellow: style.yellow || '#FBC02D',
    orange: style.orange || '#FB8C00',
    red:    style.red   || '#E53935',
    showLabels: style.showLabels !== false
  };

  const t = pivot(tables.DEFAULT);
  const W = el.clientWidth, H = el.clientHeight;
  el.innerHTML = '';
  const svg = d3.create('svg').attr('width', W).attr('height', H);
  const m = {top: 40, right: 10, bottom: 30, left: 140};
  const gridW = W - m.left - m.right;
  const gridH = H - m.top - m.bottom;
  const cw = gridW / t.cols.length;
  const ch = gridH / t.rows.length;

  // Eixos (labels)
  t.rows.forEach((r,i)=>{
    svg.append('text').attr('x', m.left-8).attr('y', m.top + i*ch + ch/2)
      .attr('class','axis').attr('text-anchor','end').text(r);
  });
  t.cols.forEach((c,j)=>{
    svg.append('text').attr('x', m.left + j*cw + cw/2).attr('y', m.top-12)
      .attr('class','axis').text(c);
  });

  // Células
  t.rows.forEach((r,i)=>{
    t.cols.forEach((c,j)=>{
      const v = Number(t.get(r,c));
      const x = m.left + j*cw, y = m.top + i*ch;
      svg.append('rect')
        .attr('x',x).attr('y',y).attr('width',cw).attr('height',ch)
        .attr('class','cell').attr('fill', colorFor(v,opt));
      if (opt.showLabels){
        svg.append('text').attr('x',x+cw/2).attr('y',y+ch/2)
          .attr('class','label').text(isFinite(v)? v : '');
      }
    });
  });

  el.appendChild(svg.node());
}

dscc.subscribeToData(draw, {transform: dscc.tableTransform});
