/* Homepage hero, "entering" (after the Meridian concept). On wide screens with motion on:
   1. arrive: the red rectangle stays put on screen while the page scrolls under it (it is a fixed layer), so the
      Fuji band rises up to meet it. The film inside settles from just covering the rectangle to its framing for the
      whole band as the band arrives.
   2. open: once the band's centre reaches the rectangle's centre, the hero holds for HOLD screens of scrolling and
      the rectangle opens in place, first to the band's full height, then to its full width. The band's edges contain
      it; its red fades so the film ends in black and white across the band.
   Under it all the photo drifts very slightly larger, for depth. Scrolling back plays it in reverse; the opening eases
   towards the scroll so wheel steps glide. Phones and reduced motion keep the static seal. */
(()=>{
const pin=document.querySelector('.hero-pin'),hero=pin&&pin.querySelector('.hero');if(!hero)return;
const band=hero.querySelector('.band'),photo=band.querySelector(':scope > .media'),win=hero.querySelector('.hanko'),
 seal=win.querySelector('.ground'),film=seal.querySelector('.media');
const wide=matchMedia('(min-width:901px)'),calm=matchMedia('(prefers-reduced-motion: reduce)');
const HOLD=1.2,OPEN_H=.35,FOLLOW=.12,DRIFT=.05,RED=[212,55,42],WHITE=[255,255,255];
const cl=x=>Math.min(1,Math.max(0,x)),io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
// a softer curve for the opening, so it opens gently, gathers, and settles (quint in-out)
const io5=x=>x<.5?16*x**5:1-Math.pow(-2*x+2,5)/2;
let g=null,target=0,shown=-1,raf=0,last=0;
// on load the rectangle draws in from left to right over WIPE ms (rv runs 0..1), as in the Meridian concept
const WIPE=1100,WIPE_DELAY=250;let rv=1,wipeStart=0;

// on wide screens the seal's top edge sits in the gap between the headline's first and second lines (with motion
// on or off); the gap moves with the headline's size, so it is measured rather than set in CSS
function place(){hero.classList.remove('hk');hero.style.removeProperty('--hk');
 const ls=hero.querySelectorAll('.hmain h1 > span');if(!wide.matches||ls.length<2)return;
 const y=(ls[0].getBoundingClientRect().bottom+ls[1].getBoundingClientRect().top)/2-band.getBoundingClientRect().top;
 hero.style.setProperty('--hk',y.toFixed(1)+'px');hero.classList.add('hk')}

// measure the seal and the band in the static layout, then switch the seal to the full-width layer
function measure(){
 hero.classList.remove('enter');win.classList.remove('fx');[win,seal,film,photo].forEach(el=>el.removeAttribute('style'));
 hero.style.top='';pin.style.height='';
 place();
 const on=wide.matches&&!calm.matches;pin.classList.toggle('pin',on);g=null;if(!on)return;
 const hr=hero.getBoundingClientRect(),b=band.getBoundingClientRect(),c=win.getBoundingClientRect(),w=c.width,d=c.height,W=b.width;
 const ar=(film.videoWidth/film.videoHeight)||16/9,fw=Math.max(W,b.height*ar);
 // how far the page scrolls before the band's centre reaches the rectangle's centre; the hero holds from there
 const bandOff=b.top-hr.top,arrive=Math.max(0,(bandOff+b.height/2)-(c.top-hr.top+d/2)),heroDoc=hr.top+scrollY;
 const stick=heroDoc-arrive;                                   // the hero's top on screen while it holds
 // the layer spans the band (and the rectangle, if it is taller than the band), in the band's coordinates
 const top=Math.min(0,(b.height-d)/2);
 g={h:b.height-top,bt:-top,bh:b.height,w,d,heroDoc,arrive,hold:HOLD*innerHeight,
  c:{x:c.left-b.left+w/2,y:-top+b.height/2},                   // the rectangle's centre: its column, the band's middle
  // where the layer sits on screen while the rectangle waits, fixed: exactly where it will be once the hero holds
  fix:{top:stick+bandOff+top,left:b.left,width:W},
  // half-width and half-height of the rectangle that covers the band
  Rw:Math.max(c.left-b.left+w/2,b.right-c.left-w/2)+2,Rh:b.height/2+2,
  s0:Math.max(d*ar,w)/fw};                                     // film scale that just covers the rectangle
 hero.classList.add('enter');
 win.style.setProperty('--wt',top+'px');win.style.setProperty('--wh',g.h+'px');
 win.style.setProperty('--bt',g.bt+'px');win.style.setProperty('--bh',g.bh+'px');
 win.style.setProperty('--xt',g.fix.top+'px');win.style.setProperty('--xl',g.fix.left+'px');win.style.setProperty('--xw',g.fix.width+'px');
 // the film's box is the whole frame (not the band), centred on the band, so object-fit never crops it shorter
 // than the rectangle when it is scaled down to it
 const fh=fw/ar;win.style.setProperty('--fw',fw+'px');win.style.setProperty('--fh',fh+'px');
 win.style.setProperty('--fl',((W-fw)/2)+'px');win.style.setProperty('--ft',(g.bt+(b.height-fh)/2)+'px');
 pin.style.height=(hero.offsetHeight+g.hold)+'px';hero.style.top=stick+'px';
 shown=-1}

// t runs 0..1 while the band arrives under the waiting rectangle, then 1..2 while it opens
function draw(t){if(!g)return;
 const a=io(cl(t)),q=cl(t-1),o=io5(q);
 // the opening runs in two moves: first the rectangle stretches to the band's full height (first OPEN_H of the
 // opening), then it widens to the band's full width
 const oh=io(cl(q/OPEN_H)),ow=io(cl((q-OPEN_H)/(1-OPEN_H)));
 const cx=g.c.x,cy=g.c.y,rw=g.w/2+(g.Rw-g.w/2)*ow,rh=g.d/2+(Math.max(g.Rh,g.d/2)-g.d/2)*oh;
 const W=seal.offsetWidth,Hh=seal.offsetHeight,px=v=>Math.max(0,v).toFixed(1)+'px';
 seal.style.clipPath=`inset(${px(cy-rh)} ${px(W-(cx-rw+2*rw*rv))} ${px(Hh-cy-rh)} ${px(cx-rw)})`;
 // once it opens, the band's top edge contains it
 win.style.clipPath=`inset(${(o>0?g.bt:0).toFixed(1)}px 0 0 0)`;
 // the film grows from just covering the rectangle to covering the band as the band arrives; across, it eases from
 // the rectangle's column back to the band's centre (it always still covers the rectangle)
 const s=g.s0+(1-g.s0)*a;film.style.transform=`translate(${((g.c.x-(seal.offsetWidth/2))*(1-a)).toFixed(1)}px,0px) scale(${s.toFixed(4)})`;
 // red holds while the band arrives and through the first of the opening, then gives way to the film
 const k=io(cl((o-.12)/.6)),col=RED.map((v,i)=>Math.round(v+(WHITE[i]-v)*k));seal.style.backgroundColor=`rgb(${col})`;
 // the photo is scaled from inside: its clip shrinks by the same amount, so it never spills past the band
 const z=1+DRIFT*io(q),ins=((1-1/z)/2*100).toFixed(3);photo.style.transform=`scale(${z.toFixed(4)})`;photo.style.clipPath=`inset(${ins}%)`}

function frame(now){raf=0;const f=1-Math.pow(1-FOLLOW,last?Math.min(4,(now-last)/16.67):1);
 let v=shown<0?target:shown+(target-shown)*f;if(Math.abs(target-v)<.0005)v=target;
 if(v!==shown){shown=v;draw(v)}
 if(v!==target){last=now;raf=requestAnimationFrame(frame)}else last=0}
function tick(){if(!g)return;
 // how far the hero has scrolled: until the band arrives the rectangle's layer is fixed to the screen, so it holds
 // its place without waiting on script; after that it rides in the held (sticky) hero, which is just as still
 const sc=g.heroDoc-pin.getBoundingClientRect().top;win.classList.toggle('fx',sc<g.arrive);
 target=sc<g.arrive?(g.arrive>0?cl(sc/g.arrive):1):1+cl((sc-g.arrive)/g.hold);raf||(raf=requestAnimationFrame(frame))}

function wipe(now){rv=io(cl((now-wipeStart)/WIPE));if(g)draw(shown<0?target:shown);if(rv<1)requestAnimationFrame(wipe)}
function setup(){measure();if(g){if(!wipeStart){wipeStart=performance.now()+WIPE_DELAY;rv=0;requestAnimationFrame(wipe)}tick();shown=target;draw(target)}}
addEventListener('scroll',tick,{passive:true});
let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(setup,120)});
wide.addEventListener('change',setup);calm.addEventListener('change',setup);
setup();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(setup);
addEventListener('load',setup);
film.addEventListener('loadedmetadata',setup);
})();

/* Experience panel: the Fuji film's red panel draws in from left to right the first time it comes into view */
(()=>{
const el=document.querySelector('#kba .pano .hanko2');
if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
el.classList.add('wipe');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){el.classList.add('in');io.disconnect()}}),{threshold:.35});
// watch the panorama, not the panel: while clipped away the panel has no visible area to intersect
io.observe(el.parentElement);
})();
