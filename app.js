(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const search = document.getElementById('material-search');
  const container = document.getElementById('materials');
  const materials = window.SITE_MATERIALS || [];
  let filter = 'all';
  const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е');
  function renderMaterials() {
    const query = normalize(search.value.trim());
    const selected = materials.filter(item => (filter === 'all' || item.category === filter) && normalize(`${item.title} ${item.subtitle} ${item.kind}`).includes(query));
    container.replaceChildren();
    selected.forEach(item => {
      let url; try { url = new URL(item.url); } catch { return; }
      if (url.protocol !== 'https:') return;
      const link = document.createElement('a');
      link.className = 'material'; link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const number = document.createElement('span'); number.className = 'material-number'; number.textContent = String(materials.indexOf(item) + 1).padStart(2, '0');
      const body = document.createElement('div'); const title = document.createElement('h3'); title.textContent = item.title;
      const subtitle = document.createElement('p'); subtitle.textContent = item.subtitle; body.append(title, subtitle);
      const kind = document.createElement('span'); kind.className = 'material-kind'; kind.textContent = item.kind;
      const arrow = document.createElement('span'); arrow.className = 'material-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
      link.append(number, body, kind, arrow); container.append(link);
    });
    document.getElementById('empty-state').hidden = container.children.length !== 0;
  }
  search.addEventListener('input', renderMaterials);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => { other.classList.toggle('active', other === button); other.setAttribute('aria-pressed', String(other === button)); });
    renderMaterials();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; renderMaterials(); search.blur(); }
  });
  renderMaterials();
  const bars = document.getElementById('sound-bars');
  if (bars) for (let i = 0; i < 57; i++) { const bar = document.createElement('i'); bar.style.height = `${14 + Math.abs(Math.sin(i * .68) * Math.cos(i * .21)) * 125}px`; bars.append(bar); }

  const canvas = document.getElementById('scope'), ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'robot', width = 0, height = 0, visible = true, frame = 0, phase = 0, lastTime = 0;
  const lime = '#cef56a', dim = '#6a8251';
  function resize() { const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function line(points, color = lime, lineWidth = 1) { ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke(); }
  function dot(x,y,r=3,color=lime) { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); }
  function robot() {
    const scale = Math.min(width / 440, height / 330);
    ctx.save(); ctx.translate(width*.52,height*.52); ctx.scale(scale,scale);
    // Isometric projection of a two-wheel platform; decorative live study.
    const angle = phase*.13+.4;
    function project(x,y,z=0) { const a = x*Math.cos(angle)-y*Math.sin(angle), b=x*Math.sin(angle)+y*Math.cos(angle); return [(a-b)*.82,(a+b)*.37-z]; }
    ctx.save(); ctx.scale(1, .43); ctx.beginPath(); ctx.ellipse(0,0,155,155,0,0,Math.PI*2); ctx.strokeStyle='#607a4340'; ctx.setLineDash([3,6]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    const path=[]; for(let i=0;i<95;i++){const a=i*.045+phase*.2; path.push([Math.cos(a)*155,Math.sin(a)*63]);}line(path,'#9ebd6750');
    const base=[[-70,-54],[70,-54],[70,54],[-70,54],[-70,-54]];
    line(base.map(([x,y])=>project(x,y,29)),lime,1.5); line(base.map(([x,y])=>project(x,y,12)),dim);
    base.slice(0,4).forEach(([x,y])=>line([project(x,y,12),project(x,y,29)],dim));
    for (const x of [-83,83]) { for(const side of [-6,6]) { const points=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2; points.push(project(x+side,Math.cos(a)*34,Math.sin(a)*34));}line(points,side===6?lime:dim); } for(let i=0;i<8;i++){const a=i*Math.PI/4+phase;line([project(x-6,Math.cos(a)*34,Math.sin(a)*34),project(x+6,Math.cos(a)*34,Math.sin(a)*34)],'#92b36390');}}
    line([project(0,0,30),project(0,0,81)],dim); const ring=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI*2;ring.push(project(Math.cos(a)*19,Math.sin(a)*19,81));}line(ring,lime);dot(...project(0,0,83),3);
    line([project(0,-55,29),project(0,-105,29)],lime,1.5);line([project(-9,-95,29),project(0,-105,29),project(9,-95,29)],lime);
    const target=project(65,-115,0);dot(...target,4);ctx.beginPath();ctx.arc(...target,12+Math.sin(phase*2)*3,0,Math.PI*2);ctx.strokeStyle='#cef56a45';ctx.stroke();
    line([project(-100,105,0),project(-55,105,0)],dim);line([project(-100,105,0),project(-100,60,0)],dim);
    ctx.font='9px monospace';ctx.fillStyle='#8b9f72';ctx.fillText('DIFFERENTIAL DRIVE',-101,112);ctx.restore();
  }
  function structure(){const nodes=[];for(let i=0;i<17;i++){const a=i*2.399+phase*.06,r=25+Math.sqrt(i)*28;nodes.push([width/2+Math.cos(a)*r,height/2+Math.sin(a)*r*.75]);}nodes.forEach((p,i)=>{for(let j=i+1;j<nodes.length;j++)if(Math.hypot(p[0]-nodes[j][0],p[1]-nodes[j][1])<105)line([p,nodes[j]],'#718f4860');dot(...p,i===0?6:3,i===0?lime:dim);});ctx.fillStyle=lime;ctx.font='11px monospace';ctx.fillText('O(log n)',width/2-25,height/2+25);}
  function signal(){const points=[];for(let x=35;x<width-30;x+=2){const t=x/width;const envelope=Math.sin(t*Math.PI);points.push([x,height/2+Math.sin(t*23-phase*1.8)*envelope*height*.17+Math.sin(t*61+phase)*envelope*height*.06]);}line([[30,height/2],[width-30,height/2]],'#718f4840');line(points,lime,1.6);const secondary=points.map(([x,y])=>[x,height-y+(Math.sin(x*.01+phase)*15)]);line(secondary,'#cef56a25');}
  function draw(){ctx.clearRect(0,0,width,height);if(mode==='robot')robot();else if(mode==='code')structure();else signal();}
  function tick(time){frame=0;if(!visible||document.hidden||reduced.matches)return;if(lastTime)phase+=Math.min((time-lastTime)/1000,.05);lastTime=time;draw();frame=requestAnimationFrame(tick);}
  function start(){if(!frame&&visible&&!document.hidden&&!reduced.matches){lastTime=0;frame=requestAnimationFrame(tick);}else if(reduced.matches)draw();}
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});const labels={robot:['KINEMATICS','ИССЛЕДОВАТЬ ДВИЖЕНИЕ','Анимированная модель колёсного робота'],code:['ALGORITHMS','НАХОДИТЬ СВЯЗИ','Граф связей'],sound:['WAVEFORM','ПОЙМАТЬ СИГНАЛ','Анимированная звуковая волна']};document.getElementById('mode-caption').textContent=labels[mode][0];document.getElementById('scope-label').textContent=labels[mode][1];canvas.setAttribute('aria-label',labels[mode][2]);draw();}));
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;start();});resize();start();
})();
