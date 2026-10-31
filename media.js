(() => {
  'use strict';
  const media=window.SITE_MEDIA;if(!media)return;
  const photos=media.photos,tracks=media.tracks;
  const grid=document.getElementById('photo-grid'),more=document.getElementById('more-photos'),count=document.getElementById('photo-count');
  const viewer=document.getElementById('photo-viewer'),image=document.getElementById('viewer-image'),error=document.getElementById('viewer-error');
  let series='all',limit=6,selected=0,lastTrigger=null,touchStart=null;
  const filtered=()=>photos.filter(p=>series==='all'||p.series===series);
  function el(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function renderPhotos(){const list=filtered();grid.replaceChildren();list.slice(0,limit).forEach((p,i)=>{const button=el('button','photo-tile');button.type='button';button.setAttribute('aria-label',`Открыть снимок ${p.file}, серия ${p.series}`);const img=el('img');img.src=p.thumb;img.alt=`${p.file} · серия ${p.series}`;img.loading='lazy';img.decoding='async';img.width=p.width;img.height=p.height;const caption=el('span','photo-caption');caption.append(el('span','',`${String(i+1).padStart(2,'0')} / ${p.series}`),el('span','photo-zoom','↗'));button.append(img,caption);button.addEventListener('click',()=>{selected=i;lastTrigger=button;viewer.showModal();document.body.classList.add('viewer-open');showPhoto();});grid.append(button);});count.textContent=`${Math.min(limit,list.length)} / ${list.length} СНИМКОВ`;more.hidden=limit>=list.length;}
  more.addEventListener('click',()=>{const index=grid.children.length;limit+=12;renderPhotos();grid.children[index]?.focus({preventScroll:true});});
  document.querySelectorAll('[data-series]').forEach(button=>button.addEventListener('click',()=>{series=button.dataset.series;limit=6;document.querySelectorAll('[data-series]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderPhotos();}));
  function showPhoto(){const list=filtered();selected=(selected+list.length)%list.length;const p=list[selected];error.hidden=true;image.alt=`${p.file} · серия ${p.series}`;image.src=p.src;document.getElementById('viewer-caption').textContent=`${p.file} · ${p.series}`;document.getElementById('viewer-position').textContent=`${selected+1} / ${list.length}`;document.getElementById('viewer-retry').href=p.src;const next=list[(selected+1)%list.length];const preload=new Image();preload.src=next.src;}
  image.addEventListener('error',()=>{error.hidden=false;});
  document.getElementById('viewer-prev').addEventListener('click',()=>{selected--;showPhoto();});document.getElementById('viewer-next').addEventListener('click',()=>{selected++;showPhoto();});document.getElementById('viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');image.removeAttribute('src');lastTrigger?.focus({preventScroll:true});});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();selected+=event.key==='ArrowRight'?1:-1;showPhoto();}});
  const stage=document.getElementById('viewer-stage');stage.addEventListener('touchstart',e=>{touchStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});stage.addEventListener('touchend',e=>{if(!touchStart||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){selected+=dx<0?1:-1;showPhoto();}},{passive:true});stage.addEventListener('touchcancel',()=>touchStart=null,{passive:true});
  const tabs=[...document.querySelectorAll('.media-tabs [role=tab]')];function activateTab(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateTab(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();activateTab(tabs[next],true);}});});
  const audios=[];const trackGrid=document.getElementById('track-grid');
  function time(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
  const albums=new Map();
  tracks.forEach(track=>{
    const key=track.albumGroup||track.id;
    if(!albums.has(key)){
      const section=el('section','music-album');
      const header=el('div','album-header'),art=el('img');
      art.src=track.cover;art.alt=`Обложка: ${track.album}`;art.loading='lazy';
      const info=el('div');info.append(el('p','track-artist',track.artist),el('h3','album-title',track.album));
      header.append(art,info);const list=el('div','album-tracks');section.append(header,list);trackGrid.append(section);albums.set(key,list);
    }
  });
  tracks.forEach(track=>{const card=el('article','track-card'),button=el('button','track-cover');button.type='button';button.setAttribute('aria-label',`Слушать ${track.title}`);button.setAttribute('aria-pressed','false');const art=el('img');art.src=track.cover;art.alt=`Обложка: ${track.album}`;art.loading='lazy';art.decoding='async';const icon=el('span','cover-play','▶');icon.setAttribute('aria-hidden','true');button.append(icon);const body=el('div','track-content'),heading=el('div','track-heading');heading.append(el('h4','',track.title),el('span','track-duration',time(track.duration)));body.append(heading,el('p','track-artist',track.artist),el('p','track-album',track.coverSong?'КАВЕР · КИНО':track.album));const audio=el('audio');audio.controls=true;audio.preload='none';audio.src=track.src;audio.setAttribute('aria-label',`Плеер: ${track.title}`);audio.textContent='Твой браузер не поддерживает аудио.';const state=el('div','track-state');state.setAttribute('aria-live','polite');const failure=el('p','track-error','Не удалось воспроизвести. Попробуй открыть MP3 отдельно.');failure.hidden=true;const download=el('a','track-download','Открыть MP3 ↗');download.href=track.src;download.target='_blank';download.rel='noopener noreferrer';body.append(audio,state,failure,download);card.append(button,body);albums.get(track.albumGroup||track.id).append(card);audios.push(audio);
    function playing(active){card.classList.toggle('is-playing',active);icon.textContent=active?'Ⅱ':'▶';button.setAttribute('aria-label',`${active?'Пауза:':'Слушать'} ${track.title}`);button.setAttribute('aria-pressed',String(active));}
    audio.addEventListener('play',()=>{audios.forEach(other=>{if(other!==audio)other.pause();});failure.hidden=true;playing(true);state.textContent='ИГРАЕТ';});audio.addEventListener('pause',()=>{playing(false);state.textContent=audio.ended?'':'ПАУЗА';});audio.addEventListener('ended',()=>{playing(false);state.textContent='';});audio.addEventListener('error',()=>{playing(false);state.textContent='';failure.hidden=false;});
    button.addEventListener('click',()=>{if(audio.paused){failure.hidden=true;audio.play().catch(()=>{playing(false);failure.hidden=false;});}else audio.pause();});
  });renderPhotos();
})();
