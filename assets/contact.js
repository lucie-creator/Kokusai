/* Contact form. Each field is checked when you leave it, and again as you type once it has shown an error, so a fix
   clears the message straight away. Sending with problems lists them at the top (each one a link to its field) and
   moves focus there. While it sends, the button says so and can't be pressed twice; once sent, a thank-you panel
   replaces the form and takes focus. Until the form has a real action URL it only simulates sending. */
(()=>{
const form=document.querySelector('[data-cf]');if(!form)return;
const done=document.querySelector('.cf-done'),sum=form.querySelector('.cf-sum'),fail=form.querySelector('.cf-fail');
const btn=form.querySelector('button[type="submit"]'),btnLabel=btn.querySelector('span');
const fields=[...form.querySelectorAll('input[required],textarea[required],input[data-fmt]')];
const ja=document.documentElement.lang==='ja';
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,PHONE=/^[\d\s()+.-]{6,}$/;

// the message for a field, or '' when it's fine
function problem(el){const v=el.value.trim();
 if(!v)return el.required?el.dataset.msg:'';
 if(el.type==='email'&&!EMAIL.test(v))return el.dataset.fmt;
 if(el.type==='tel'&&!PHONE.test(v))return el.dataset.fmt;
 return ''}

function show(el,msg){const box=el.closest('.cf-f'),id=el.id+'-e';let e=document.getElementById(id);
 const hint=box.querySelector('.cf-hint');const desc=[hint&&hint.id,msg&&id].filter(Boolean).join(' ');
 if(msg){if(!e){e=document.createElement('p');e.className='cf-err';e.id=id;el.after(e)}e.textContent=msg}
 else if(e)e.remove();
 box.classList.toggle('bad',!!msg);el.setAttribute('aria-invalid',String(!!msg));
 desc?el.setAttribute('aria-describedby',desc):el.removeAttribute('aria-describedby')}

fields.forEach(el=>{
 el.addEventListener('blur',()=>{if(el.value.trim()||el.closest('.cf-f').classList.contains('bad'))show(el,problem(el))});
 el.addEventListener('input',()=>{if(el.closest('.cf-f').classList.contains('bad'))show(el,problem(el))});
});

function setBusy(on){btn.disabled=on;btn.setAttribute('aria-busy',String(on));btnLabel.textContent=on?(ja?'送信中…':'Sending…'):(ja?'送信する':'Send enquiry');form.classList.toggle('busy',on)}

form.addEventListener('submit',async e=>{e.preventDefault();fail.hidden=true;
 const bad=fields.map(el=>[el,problem(el)]).filter(([,m])=>m);
 fields.forEach(el=>show(el,problem(el)));
 if(bad.length){
  sum.querySelector('h2').textContent=ja?`${bad.length}件の項目をご確認ください`:bad.length===1?'There is a problem with 1 field':`There are problems with ${bad.length} fields`;
  const ul=sum.querySelector('ul');ul.replaceChildren(...bad.map(([el,m])=>{const li=document.createElement('li'),a=document.createElement('a');
   a.href='#'+el.id;a.textContent=m;a.addEventListener('click',ev=>{ev.preventDefault();el.focus()});li.append(a);return li}));
  sum.hidden=false;sum.focus();return}
 sum.hidden=true;
 // the hidden field catches bots, which fill in everything: pretend it worked
 const bot=form.querySelector('[name="website"]').value!=='';
 setBusy(true);
 try{
  const url=form.getAttribute('action');
  if(url&&url!=='#'&&!bot){const r=await fetch(url,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!r.ok)throw new Error(r.status)}
  else await new Promise(r=>setTimeout(r,900));
  const first=form.querySelector('[name="name"]').value.trim().split(/\s+/)[0];
  done.querySelector('h2').textContent=ja?(first?`${first}様、ありがとうございました`:'ありがとうございました'):first?`Thank you, ${first}`:'Thank you';
  form.hidden=true;done.hidden=false;done.focus({preventScroll:true});
  done.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 }catch(err){setBusy(false);fail.hidden=false}
});
})();
