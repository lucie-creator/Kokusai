/* Inner pages: scroll reveals, the pinned topic index, the hero video control, article sharing, quotes and the Principals carousel. */
(()=>{
const ja=document.documentElement.lang==='ja';
const root=document.getElementById('kba'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const marked=[...root.querySelectorAll('[data-rv]')];

// reveals: each marked block rises in once as it reaches the screen. With reduced motion (or no observer) the blocks
// are simply shown, diagrams included, in their final state
if(!reduce&&'IntersectionObserver' in window){
 root.classList.add('rv');
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});
 marked.forEach(el=>io.observe(el));
}else marked.forEach(el=>el.classList.add('in'));

// topic index: marks the last topic whose top has passed 40% of the screen
const idx=root.querySelector('.pidx');
if(idx){
 const links=[...idx.querySelectorAll('a')],topics=links.map(a=>document.querySelector(a.getAttribute('href')));
 let raf=0;
 const tick=()=>{raf=0;const y=innerHeight*.4;let k=0;topics.forEach((t,i)=>{if(t.getBoundingClientRect().top<y)k=i});
  links.forEach((a,i)=>{a.classList.toggle('on',i===k);if(i===k)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')})};
 addEventListener('scroll',()=>{raf||(raf=requestAnimationFrame(tick))},{passive:true});
 tick();
}

// service heroes: the shape behind the title fades in at full size, then plays its move, by itself on load.
// Transforms go straight onto the shape (no inherited variables), and only transform and opacity change
const mh=root.querySelector('.mhero');
if(mh&&!reduce){
 const stage=mh.querySelector('.stage'),disc=mh.querySelector('.disc'),title=mh.querySelector('.mh-title'),cue=mh.querySelector('.cue');
 // the alignment variant (Cross-cultural page): two dots that close in and overlap into the lens instead of one
 const align=mh.classList.contains('align'),L=mh.querySelector('.disc.l'),R=mh.querySelector('.disc.r'),lens=mh.querySelector('.disc.lens');
 const APART=.55,OVERLAP=.3;
 const DOT=28,GAP=40,FOLLOW=.14,cl=x=>Math.min(1,Math.max(0,x));
 // service pages: the disc holds that service's homepage shape, which forms over the scroll (the homepage step's
 // forming half, held at its full form)
 const shp=disc&&disc.querySelector('.shape'),GROW=.55;
 const sm=x=>{x=cl(x);return x*x*(3-2*x)},form=t=>sm(t<.5?t/.4:(1-t)/.4);
 const SHAPES={
  two(s,t){const e=form(t),[b,a]=s.children;b.style.transform=`translateX(${30*e}%)`;a.style.transform=`translateX(${-30*e}%)`},
  // as on the homepage: the dot rises and shrinks out of the circle over the bowl, then the whole shape turns once
  // clockwise as the two pieces close back into the circle
  halves(s,t){const e=form(t),[bowl,dot]=s.children;s.style.transform=`rotate(${(360*sm((t-.55)/.45)).toFixed(2)}deg)`;
   bowl.style.transform=`translateY(${9*e}%)`;dot.style.transform=`translateY(${-30*e}%) scale(${1-.58*e})`},
  four(s,t){const e=form(t),ex=sm(e/.6)*36,ey=sm((e-.4)/.6)*36,k=1-.45*e;
   [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([x,y],j)=>{s.children[j].style.transform=`translate(${x*ex}%,${y*ey}%) scale(${k})`})},
  arch(s,t){const [i,svg]=s.children,path=svg.firstElementChild,DOT=.26,FX=58,FY=30,draw=t>.2;
   i.style.visibility=draw?'hidden':'';svg.style.visibility=draw?'':'hidden';
   if(!draw){const q=sm(t/.2);i.style.transform=`translate(${-FX*q}%,${FY*q}%) scale(${1-(1-DOT)*q})`}
   else{path.style.strokeDasharray=`${Math.max(.001,100*sm((t-.2)/.3))} 300`;path.style.strokeDashoffset='0'}}
 };
 const MERGE={two:true},FULL={halves:true},BEATS={four:true},DRAW={arch:true},ROW={row4:true};
 // ease-in-out (cubic) so the dot sets off gently and arrives softly
 const io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
 let s0=.05,y0=0,target=0,shown=-1,raf=0,last=0;
 // the dot starts DOT px wide, GAP px below the title; both measured against the full circle's resting place
 function measure(){const D=disc.offsetWidth||1;s0=DOT/D;y0=title.getBoundingClientRect().bottom-stage.getBoundingClientRect().top+GAP+DOT/2-(disc.offsetTop+D/2)}
 // One continuous move, no pauses: the shape starts 30% smaller (START) and grows to full size over the whole run,
 // fading in over the first FADE of it, while its own move (merge, split, arch...) starts almost at once (LEAD) and
 // runs alongside the growth to the end
 const START=.7,FADE=.3,LEAD=.08,out=x=>1-Math.pow(1-x,3);
 // magnetic pull: barely moving at first, then accelerating hard into the meeting point
 const RK=.44,RSP=.78,APART2=48,magnet=x=>Math.pow(x,3.4),pull=x=>Math.pow(x,2.6);
 // Acquisitions and Post-acquisition end on one circle, which then eases down over the last TAIL of the run to endK of its
 // size: small enough that its top edge sits EB_GAP px below the eyebrow (measured, as the gap changes with the screen),
 // and never more than 70%
 const TAIL=.22,EB_GAP=16;let endK=.7;
 // the Advisory row's width at full size, as a share of the stage; above 92% its circles are scaled down to fit
 let rowFit=1;
 function fitRow(){const D=disc.offsetWidth||1,w=stage.clientWidth*.92,full=D*RK*(1+3*RSP);rowFit=Math.min(1,w/full)}
 function fitEnd(){const eb=mh.querySelector('.mh-head .eb'),D=disc.offsetWidth||1;if(!eb)return;
  const r=disc.getBoundingClientRect(),cy=r.top+r.height/2,room=cy-eb.getBoundingClientRect().bottom-EB_GAP;
  endK=Math.min(.7,Math.max(.3,2*room/D))}
 function draw(p0){const kd=shp&&shp.classList[1],tail=!!(align||kd&&(MERGE[kd]||FULL[kd]||BEATS[kd]||DRAW[kd])),p=tail?cl(p0/(1-TAIL)):p0,
  end=tail?1-(1-(align||BEATS[kd]||DRAW[kd]?.7:endK))*io(cl((p0-(1-TAIL))/TAIL)):1,k=(START+(1-START)*out(cl(p)))*end,f=out(cl(p/FADE)),q=io(cl((p-LEAD)/(1-LEAD))),ql=cl((p-LEAD)/(1-LEAD)),sc=`scale(${k.toFixed(4)})`;
  if(!align&&shp){disc.style.transform=sc;disc.style.opacity=f.toFixed(3);
   // Acquisitions plays its shape backwards: two circles fade in apart, then merge into one
   // each shape's move is mapped onto the stretch of its homepage step where it actually changes (forming takes the
   // first .4 of the step, the arch .5), so it starts at once and runs evenly to the end (the shapes ease themselves)
   const kind=shp.classList[1],R=kind==='arch'?.5:.4;
   // Acquisitions: the circles start well apart (APART2 of a diameter each side) and draw together like magnets: slowly
   // at first, then faster and faster until they click into one circle (no overshoot)
   if(MERGE[kind]){const m=magnet(cl((p-.2)/.8)),[b,a]=shp.children,x=APART2*(1-m);
    b.style.transform=`translateX(${x.toFixed(2)}%)`;a.style.transform=`translateX(${(-x).toFixed(2)}%)`;return}
   // Post-acquisition starts as the two pieces (bowl and dot) and plays the second half of the homepage step: the whole
   // shape spins once as the pieces close into the circle. The others form and hold
   if(FULL[kind]){SHAPES[kind](shp,.5+.5*ql);return}
   // Governance, in two beats with a breath between: each one starts slowly and speeds up into place (like the
   // magnets on Acquisitions). Beat one splits the circle sideways into two; beat two splits each of those into two
   // (four). The circles shrink a little with each beat, then the four ease down 30% together at the end
   // Communication: the arch starts as a dot at its left foot (the stroke's round end, fading in there) and draws
   // itself over to the right foot, easing in and out; then it eases down 30% at the end
   if(DRAW[kind]){const [i,svg]=shp.children,path=svg.firstElementChild;i.style.visibility='hidden';svg.style.visibility='';
    path.style.strokeDasharray=`${Math.max(.001,100*io(cl((p-.15)/.85))).toFixed(3)} 300`;path.style.strokeDashoffset='0';return}
   // Advisory: one circle divides into four in a horizontal row, each just overlapping its neighbours (as on
   // Cross-cultural): the circles slide apart and shrink to RK of the disc (less if the row would not fit the screen),
   // settling from solid red to Cross-cultural's 35% tint, with each overlap in solid red. It starts as plain red: only
   // the first circle shows, and the others and the overlaps fade in as they leave it
   // The circle comes in at its final size (growing only while it fades in) and keeps that size as it divides
   if(ROW[kind]){const e=io(cl((p-.25)/.65)),kc=RK*rowFit,base=1-.65*e,lead=cl(e/.3),
     cs=[...shp.querySelectorAll(':scope > i')],ov=[...shp.querySelectorAll(':scope > .ov')],pos=n=>`translateX(${(n*RSP*kc*100*e).toFixed(2)}%) scale(${kc.toFixed(4)})`;
    disc.style.transform=`scale(${(START+(1-START)*out(cl(p/FADE))).toFixed(4)})`;
    [-1.5,-.5,.5,1.5].forEach((n,j)=>{cs[j].style.transform=pos(n);cs[j].style.opacity=(j?base*lead:base).toFixed(3)});
    // each overlap: a window on circle j+1 holding a solid circle one spacing to its left (in the window's own units)
    [-.5,.5,1.5].forEach((n,j)=>{const w=ov[j];if(!w)return;w.style.transform=pos(n);w.style.opacity=lead.toFixed(3);
     w.firstElementChild.style.transform=`translateX(${(-RSP*100*e).toFixed(2)}%)`});return}
   if(BEATS[kind]){const b1=pull(cl((p-.12)/.36)),b2=pull(cl((p-.56)/.36)),ex=36*b1,ey=36*b2,kc=1-.225*b1-.225*b2;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([x,y],j)=>{shp.children[j].style.transform=`translate(${(x*ex).toFixed(2)}%,${(y*ey).toFixed(2)}%) scale(${kc.toFixed(4)})`});return}
   (SHAPES[kind]||(()=>{}))(shp,R*ql);return}
  if(!align){disc.style.transform=sc;disc.style.opacity=f.toFixed(3);return}
  // Cross-cultural: two circles fade in side by side, then close in until they overlap by OVERLAP of a diameter (then the
  // pair eases down 30% at the end); the lens's inner circle sits twice that offset back, so the window always shows
  // the shared area
  const D=L.offsetWidth||1,x=(APART+(OVERLAP-APART)*q)*D*k,fr=x/(D*k),t=`translate(${x.toFixed(1)}px,0px) ${sc}`;
  L.style.transform=`translate(${(-x).toFixed(1)}px,0px) ${sc}`;R.style.transform=t;lens.style.transform=t;
  lens.firstElementChild.style.transform=`translateX(${(-200*fr).toFixed(2)}%)`;
  // the circles arrive solid red and settle to the tint as they meet
  const o=(f*(1-.65*q)).toFixed(3);L.style.opacity=o;R.style.opacity=o;lens.style.opacity=f.toFixed(3)}
 // plays by itself once the page has loaded (no scrolling needed): DELAY ms, then DUR ms for the fade and the move
 const kind0=shp&&shp.classList[1],DUR=align?2600:kind0&&ROW[kind0]?2000:kind0&&BEATS[kind0]?2300:kind0&&DRAW[kind0]?2000:kind0&&(MERGE[kind0]||FULL[kind0])?1950:shp||align?2400:1400,DELAY=300;let t0=0;
 function run(now){if(!t0)t0=now+DELAY;const p=cl((now-t0)/DUR);draw(p);if(p<1)requestAnimationFrame(run)}
 measure();fitEnd();fitRow();draw(0);requestAnimationFrame(run);
 addEventListener('resize',()=>{fitEnd();fitRow();if(t0&&performance.now()>t0+DUR)draw(1)});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{fitEnd();if(t0&&performance.now()>t0+DUR)draw(1)});
}

// hero video: plays muted on loop; reduced motion keeps it paused
let paused=reduce;
function sync(){root.querySelectorAll('video').forEach(v=>{if(paused)v.pause();else{const p=v.play();p&&p.catch(()=>{})}});}
sync();

// article: a thin red line along the top fills as you read through the article body; copy link confirms itself for
// a moment (and is announced), and the LinkedIn link shares this page's address
const prog=root.querySelector('.rprog'),art=root.querySelector('.prose');
if(prog&&art){let raf=0;const tick=()=>{raf=0;const r=art.getBoundingClientRect(),span=r.height-innerHeight*.6;
  prog.style.scale=`${Math.min(1,Math.max(0,(innerHeight*.4-r.top)/Math.max(1,span))).toFixed(4)} 1`};
 addEventListener('scroll',()=>{raf||(raf=requestAnimationFrame(tick))},{passive:true});tick()}
root.querySelectorAll('[data-share]').forEach(a=>{a.href='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(location.href.split('#')[0])});
root.querySelectorAll('[data-copy]').forEach(b=>{const said=b.parentElement.querySelector('[data-copied]');let t=0;
 b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);b.textContent=ja?'コピーしました':'Link copied';if(said)said.textContent=ja?'リンクをクリップボードにコピーしました':'Link copied to clipboard'}
  catch(e){b.textContent=ja?'コピーできませんでした':'Copy failed'}clearTimeout(t);t=setTimeout(()=>{b.textContent=ja?'リンクをコピー':'Copy link';if(said)said.textContent=''},2000)})});

// quotes: the text is split into its lines as they fall at this width, so each can draw in on its own. Measured
// again once the fonts arrive and whenever the width changes
root.querySelectorAll('.quote p').forEach(p=>{
 const text=p.textContent.trim().replace(/\s+/g,' ');
 // Japanese has no spaces: split it into words with the browser's segmenter instead
 const parts=ja&&window.Intl&&Intl.Segmenter?[...new Intl.Segmenter('ja',{granularity:'word'}).segment(text)].map(x=>x.segment):null;
 const build=()=>{
  p.textContent='';
  const words=(parts||text.split(' ')).map((w,i,a)=>{const s=document.createElement('span');s.textContent=parts?w:w+(i<a.length-1?' ':'');p.append(s);return s});
  const lines=[];let top=null;
  words.forEach(s=>{if(s.offsetTop!==top){lines.push('');top=s.offsetTop}lines[lines.length-1]+=s.textContent});
  p.textContent='';
  lines.forEach((l,i)=>{const s=document.createElement('span');s.className='ql';s.style.setProperty('--i',i);s.textContent=l;p.append(s)});
 };
 build();
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(build);
 let w=p.clientWidth;addEventListener('resize',()=>{if(p.clientWidth!==w){w=p.clientWidth;build()}});
});

// Principals carousel: the arrows move the row by about one screenful of whole cards, and grey out at either end
root.querySelectorAll('[data-tcar]').forEach(c=>{
 const list=c.querySelector('.tcar-list'),prev=c.querySelector('[data-prev]'),next=c.querySelector('[data-next]');
 const step=()=>{const card=list.querySelector('li'),gap=parseFloat(getComputedStyle(list).columnGap)||0,w=card?card.offsetWidth+gap:list.clientWidth;
  return Math.max(1,Math.floor((list.clientWidth-gap)/w))*w};
 const sync=()=>{const max=list.scrollWidth-list.clientWidth-2;prev.disabled=list.scrollLeft<=2;next.disabled=list.scrollLeft>=max};
 const go=d=>list.scrollBy({left:d*step(),behavior:reduce?'auto':'smooth'});
 prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
 let raf=0;list.addEventListener('scroll',()=>{raf||(raf=requestAnimationFrame(()=>{raf=0;sync()}))},{passive:true});
 addEventListener('resize',sync);sync();
});

})();
