/* Main navigation. How we help (full-width panel) and About us (dropdown) open on hover where there is a mouse, and
   on click or Enter everywhere; Escape, a click outside or tabbing out closes them. On phones the Menu button opens
   the whole list and each group expands in place. */
(()=>{
const nav=document.querySelector('[data-nav]');if(!nav)return;
const btns=[...nav.querySelectorAll('.dd')],toggle=nav.querySelector('.mtoggle'),menu=nav.querySelector('.menu');
const hover=matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)');
const panel=b=>document.getElementById(b.getAttribute('aria-controls')),root=nav.closest('#kba');
// while a panel is open, a light layer dims the page under the bar so the menu has the focus
const scrim=document.createElement('div');scrim.className='scrim';scrim.setAttribute('aria-hidden','true');nav.after(scrim);
const isOpen=b=>b.getAttribute('aria-expanded')==='true';
function set(b,open){b.setAttribute('aria-expanded',String(open));panel(b).classList.toggle('open',open);root.classList.toggle('menu-open',btns.some(isOpen))}
function closeAll(except){btns.forEach(b=>{if(b!==except)set(b,false)})}
// moving from one open panel to the other swaps them on the spot: the drop-in is for the first opening only
function swap(b){const ps=btns.map(panel);ps.forEach(p=>p.classList.add('instant'));closeAll(b);set(b,true);
 requestAnimationFrame(()=>requestAnimationFrame(()=>ps.forEach(p=>p.classList.remove('instant'))))}

btns.forEach(b=>{
 // with a mouse the panel is already open from hovering, so a click keeps it open rather than toggling it shut
 b.addEventListener('click',()=>{const open=hover.matches||b.getAttribute('aria-expanded')!=='true';closeAll(b);set(b,open)});
 const li=b.parentElement;let t=0,o=0;
 // opening waits 120ms, so a pointer only passing over the item on its way along the bar doesn't flash the panel;
 // once a panel is open the other one swaps in at once. A short grace period on leaving, so crossing the gap
 // between the item and its panel doesn't close it
 li.addEventListener('pointerenter',()=>{if(!hover.matches)return;clearTimeout(t);clearTimeout(o);if(isOpen(b))return;
  if(btns.some(isOpen))swap(b);else o=setTimeout(()=>set(b,true),120)});
 li.addEventListener('pointerleave',()=>{if(!hover.matches)return;clearTimeout(o);t=setTimeout(()=>set(b,false),160)});
});

function setMenu(open){if(!toggle)return;toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);
 const ja=document.documentElement.lang==='ja';toggle.querySelector('span').textContent=open?(ja?'閉じる':'Close'):(ja?'メニュー':'Menu');if(!open)closeAll()}
toggle&&toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));

document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
 const b=btns.find(x=>x.getAttribute('aria-expanded')==='true');
 if(b){set(b,false);b.focus()}else if(toggle&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus()}});
document.addEventListener('click',e=>{if(!nav.contains(e.target)){closeAll();setMenu(false)}});
// choosing a link closes everything, so a jump to a section on the same page isn't left under an open panel
nav.querySelectorAll('.menu a').forEach(a=>a.addEventListener('click',()=>{closeAll();setMenu(false)}));
nav.addEventListener('focusout',e=>{if(hover.matches&&!nav.contains(e.relatedTarget))closeAll()});
// arriving from another page's menu with a section in the address: land on it once the layout has settled (fonts
// and images change heights, and smooth scrolling can drop the browser's own jump on load)
if(location.hash.length>1){const go=()=>{const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));t&&t.scrollIntoView({behavior:'instant',block:'start'})};
 addEventListener('load',()=>{document.fonts&&document.fonts.ready?document.fonts.ready.then(go):go()})}
// scrolling down slides the bar away once it has scrolled past; any scroll up brings it straight back. It stays while
// a menu is open or something in it has focus. Small jitters are ignored
let lastY=scrollY,sraf=0;
const busy=()=>btns.some(isOpen)||(toggle&&toggle.getAttribute('aria-expanded')==='true')||nav.contains(document.activeElement);
addEventListener('scroll',()=>{sraf||(sraf=requestAnimationFrame(()=>{sraf=0;const y=Math.max(0,scrollY),d=y-lastY;
 if(y<=nav.offsetHeight||busy())root.classList.remove('nav-away');else if(Math.abs(d)>6)root.classList.toggle('nav-away',d>0);
 if(Math.abs(d)>6||y<=nav.offsetHeight)lastY=y}))},{passive:true});
nav.addEventListener('focusin',()=>root.classList.remove('nav-away'));
// back on a wide screen, the phone menu state no longer applies
matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
})();

/* Footer: live Sydney and Tokyo time (refreshed every 15 seconds), the day and time zone under each, the gap between
   them, and the current year. */
(()=>{
const clocks=[...document.querySelectorAll('[data-clock]')];if(!clocks.length)return;
const ja=document.documentElement.lang==='ja';
const fmt=(tz,o)=>new Intl.DateTimeFormat('en-AU',{timeZone:tz,...o}).format(new Date());
const day=(tz,o)=>new Intl.DateTimeFormat(ja?'ja-JP':'en-AU',{timeZone:tz,...o}).format(new Date());
// minutes ahead of UTC, from how the same instant reads in each zone
const offset=tz=>{const d=new Date(),at=z=>new Date(d.toLocaleString('en-US',{timeZone:z}));return Math.round((at(tz)-at('UTC'))/6e4)};
const zone=tz=>tz==='Asia/Tokyo'?'JST':(fmt(tz,{timeZoneName:'short'}).split(' ').pop()||'');
function tick(){
 clocks.forEach(t=>{const tz=t.dataset.clock,[h,m]=fmt(tz,{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).split(':');
  t.innerHTML=`${h}<span class="c">:</span>${m}`;t.dateTime=`${h}:${m}`});
 document.querySelectorAll('[data-zone]').forEach(z=>{const tz=z.dataset.zone;z.textContent=`${day(tz,{weekday:'short',day:'numeric',month:'short'})} · ${zone(tz)}`});
 const gap=(offset('Australia/Sydney')-offset('Asia/Tokyo'))/60,n=Math.abs(gap),u=n===1?'hour':'hours';
 document.querySelectorAll('[data-diff]').forEach(el=>{el.textContent=ja?(gap===0?'シドニーと東京は同じ時刻です':`シドニーは東京より${n}時間${gap>0?'進んでいます':'遅れています'}`)
  :gap===0?'Sydney and Tokyo share the same time':gap>0?`Sydney is ${n} ${u} ahead of Tokyo`:`Sydney is ${n} ${u} behind Tokyo`});
 document.querySelectorAll('[data-year]').forEach(y=>{y.textContent=String(new Date().getFullYear())});
}
tick();setInterval(tick,15000);
})();

/* Link arrows: the link's last word goes in a no-wrap span that carries the arrow, so the two always wrap together.
   Japanese has no spaces, so there the last word is found with the browser's word segmenter. */
const lastWord=s=>{if(document.documentElement.lang==='ja'&&window.Intl&&Intl.Segmenter){const seg=[...new Intl.Segmenter('ja',{granularity:'word'}).segment(s)];
  const w=seg.reverse().find(x=>x.isWordLike);return w?w.index:Math.max(0,s.length-2)}return s.search(/\S+$/)};
document.querySelectorAll('#kba .lnk').forEach(a=>{const t=[...a.childNodes].reverse().find(n=>n.nodeType===3&&n.textContent.trim());if(!t)return;
 const s=t.textContent.replace(/\s+$/,''),i=lastWord(s),w=document.createElement('span');
 w.className='lw';w.textContent=s.slice(i);t.textContent=s.slice(0,i);t.after(w);a.classList.add('w')});

/* Red dot markers: each starts small and grows to size as it comes into view; dots that share a parent follow one
   another 160ms apart. Without motion or an observer they simply stay at full size */
(()=>{
const dots=[...document.querySelectorAll('#kba .dots > li, #kba .topics .note, #kba .stmt, #kba .dims li, #kba .dsteps > li')];
if(!dots.length||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('grown');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});
dots.forEach(d=>{const k=dots.filter(x=>x.parentElement===d.parentElement).indexOf(d);d.style.setProperty('--gd',k*.16+'s');d.classList.add('grow');io.observe(d)});
})();

/* Closing section: the heading fills in as you scroll, letter by letter in reading order. Each letter starts at 10%
   and reaches full strength as the heading travels from the bottom of the screen to just above its middle; scrolling
   back reverses it. Words (in Japanese, the browser's word segments) stay whole so lines break as before. Screen
   readers get the heading as one label. With reduced motion the heading is simply shown. */
(()=>{
const hs=[...document.querySelectorAll('#kba .cta-s h2')];
if(!hs.length||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const ja=document.documentElement.lang==='ja',FAINT=.1;
const words=t=>ja&&window.Intl&&Intl.Segmenter?[...new Intl.Segmenter('ja',{granularity:'word'}).segment(t)].map(x=>x.segment):t.split(/(\s+)/);
const items=hs.map(h=>{const text=h.textContent.trim().replace(/\s+/g,' ');h.setAttribute('aria-label',text);h.textContent='';const cs=[];
 words(text).forEach(w=>{if(/^\s+$/.test(w)){h.append(' ');return}
  const wrap=document.createElement('span');wrap.className='fw';wrap.setAttribute('aria-hidden','true');
  [...w].forEach(c=>{const s=document.createElement('span');s.className='fc';s.textContent=c;wrap.append(s);cs.push(s)});h.append(wrap)});
 return{h,cs,last:-1}});
let raf=0;
function draw(){raf=0;const vh=innerHeight;
 items.forEach(it=>{const r=it.h.getBoundingClientRect();
  // 0 when the heading's top meets the bottom of the screen, 1 when its middle reaches 40% of the way down
  const p=Math.min(1,Math.max(0,(vh-r.top)/(vh*.6-r.height/2+1e-3)));
  if(Math.abs(p-it.last)<.001)return;it.last=p;
  const n=it.cs.length,head=p*(n+4);   // a soft edge about four letters wide
  it.cs.forEach((c,i)=>{const k=Math.min(1,Math.max(0,(head-i)/4));c.style.setProperty('--o',(FAINT+(1-FAINT)*k).toFixed(3))})})}
const tick=()=>{raf||(raf=requestAnimationFrame(draw))};
addEventListener('scroll',tick,{passive:true});addEventListener('resize',tick);draw();
})();
