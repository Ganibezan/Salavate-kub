(() => {
'use strict';
const names=window.esmaNames;
const dhikrs=[{id:'dhikr-istighfar',name:'Estağfirullah',arabic:'أَسْتَغْفِرُ اللّٰهَ',meaning:'Allah’tan bağışlanma dilerim.',target:50000},{id:'dhikr-tawhid',name:'Lâ ilâhe illallah',arabic:'لَا إِلٰهَ إِلَّا اللّٰهُ',meaning:'Allah’tan başka ilâh yoktur.',target:70000}];
window.listeningItems=[
{id:'listen-mawlid',name:'Mevlid-i Şerif',arabic:'',meaning:'',detail:'Şeyh Nâzım Kıbrısî · Mevlid-i Şerif'},
{id:'listen-yasin',name:'Yâsîn Suresi',arabic:'',meaning:'',url:'https://sufilive.com/surah-yasin-recitatiton-by-mawlana-shaykh-nazim--725.html',detail:'Şeyh Nâzım Kıbrısî · Lefke · 1 Aralık 2006 · SufiLive arşivi'},
{id:'listen-rahman',name:'Rahmân Suresi',arabic:'',meaning:'',url:'https://sufilive.com/Surah-Ar-Rahman-724.html',detail:'Şeyh Nâzım Kıbrısî · Lefke · 1 Aralık 2006 · SufiLive arşivi'},
{id:'listen-kahf',name:'Kehf Suresi',arabic:'',meaning:'',detail:'Şeyh Nâzım Kıbrısî’ye ait kayıt henüz doğrulanmadı.'},
{id:'listen-dukhan',name:'Duhân Suresi',arabic:'',meaning:'',detail:'Şeyh Nâzım Kıbrısî’ye ait kayıt henüz doğrulanmadı.'},
{id:'listen-mulk',name:'Mülk Suresi',arabic:'',meaning:'',detail:'Şeyh Nâzım Kıbrısî’ye ait kayıt henüz doğrulanmadı.'},
{id:'listen-naba',name:'Nebe Suresi',arabic:'',meaning:'',detail:'Şeyh Nâzım Kıbrısî’ye ait kayıt henüz doğrulanmadı.'}
];
let mode='dhikr';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i');
function counts(){if(!state.devotions||typeof state.devotions!=='object'||Array.isArray(state.devotions))state.devotions={};return state.devotions}
function countFor(x){const all=counts();let r=all[x.id];if(!r||typeof r!=='object'||Array.isArray(r))r=all[x.id]={};r.current=clean(r.current);r.lifetime=Math.max(r.current,clean(r.lifetime));r.target=x.target||clean(r.target);return r}
function persist(){const ok=save();$('devotionNotice').textContent=ok?'Sayaçlar bu cihazda kaydedildi.':'Kayıt yapılamadı. Tacım bölümünden yedek al.';return ok}
function createCounter(x,number){const r=countFor(x),card=el('article','card devotion-card');card.dataset.devotion=x.id;
if(number)card.append(el('div','eyebrow',number+' / 99'));
card.append(el('h2','',x.name));const ar=el('div','arabic',x.arabic);ar.dir='rtl';ar.lang='ar';card.append(ar,el('p','meaning',x.meaning));
const current=el('output','devotion-count',fmt(r.current));current.setAttribute('aria-label',x.name+' güncel zikir sayısı');current.setAttribute('aria-live','polite');
const progress=el('progress');progress.setAttribute('aria-label',x.name+' hedef ilerlemesi');
const remaining=el('p','sub'),life=el('p','sub');
function update(){current.textContent=fmt(r.current);life.textContent='Ömürlük: '+fmt(r.lifetime);progress.hidden=!r.target;progress.max=r.target||1;progress.value=Math.min(r.current,r.target||1);remaining.textContent=r.target?(r.current>=r.target?'Hedef tamamlandı ✓ · '+fmt(r.target):'Hedef: '+fmt(r.target)+' · Kalan: '+fmt(r.target-r.current)):'Serbest zikir · Kendi hedefini belirleyebilirsin.'}
const actions=el('div','wrap devotion-actions');for(const n of [1,33,100]){const b=el('button',n===1?'gold devotion-tap':'minor','＋ '+(n===1?'Zikrettim':n));b.type='button';b.setAttribute('aria-label',x.name+' sayacına '+n+' ekle');b.onclick=()=>{const step=Math.min(n,Number.MAX_SAFE_INTEGER-r.lifetime,Number.MAX_SAFE_INTEGER-r.current);r.current+=step;r.lifetime+=step;persist();update()};actions.append(b)}
const options=el('details','details');options.append(el('summary','','Sayaç ayarları'));
if(!x.target){const label=el('label','sub','Hedef sayısı (0 = serbest)');const input=el('input');input.type='number';input.min='0';input.max=String(Number.MAX_SAFE_INTEGER);input.step='1';input.value=String(r.target);input.setAttribute('aria-label',x.name+' hedef sayısı');const apply=el('button','minor','Hedefi kaydet');apply.type='button';apply.onclick=()=>{if(!input.checkValidity()||!Number.isSafeInteger(Number(input.value))){$('devotionNotice').textContent='Geçerli bir tam sayı gir.';return}r.target=clean(input.value);persist();update()};label.append(input);options.append(label,apply)}
const reset=el('button','minor','Güncel sayacı sıfırla');reset.type='button';reset.onclick=()=>{if(!confirm(x.name+' güncel sayacı sıfırlansın mı? Ömürlük sayı korunacak.'))return;r.current=0;persist();update()};options.append(reset);
card.append(current,progress,remaining,actions,life,options);update();return card}
function pauseMawlid(){$('devotionBody').querySelectorAll('[data-id="listen-mawlid"]').forEach(card=>{card.mawlidCleanup?.();card.querySelectorAll('audio').forEach(player=>player.pause())})}
function render(){$('devotional').classList.toggle('mawlid-view',mode==='mawlid');const body=$('devotionBody');pauseMawlid();body.replaceChildren();$('devotionHeading').textContent=mode==='listening'?'Kur’an-ı Kerim':mode==='mawlid'?'Mevlid-i Şerif':mode==='qada'?'Kaza namazı':mode==='ashab'?'Hazreti Ehl-i Beyt ve Ashâb-ı Kirâm':'Zikirlerim';
for(const [id,m] of [['openDhikr','dhikr'],['openListening','listening'],['openMawlid','mawlid'],['openQada','qada'],['openAshab','ashab']])$(id).setAttribute('aria-pressed',String(mode===m||mode==='esma'&&m==='dhikr'));window.unmountQuran?.();
if(mode==='ashab'){window.mountAshab(body);return}
if(mode==='qada'){window.mountQada(body);return}
if(mode==='mawlid'){const x=window.listeningItems.find(x=>x.id==='listen-mawlid'),card=el('article','card readCard');card.dataset.id=x.id;body.append(card);window.mountMawlid(card);return}
if(mode==='dhikr'){const intro=el('p','devotion-intro','50.000 istiğfar ve 70.000 kelime-i tevhid hedefini kaldığın yerden sürdür.');body.append(intro);const entry=el('div','card esma-entry');entry.append(el('h2','','Esmâü’l-Hüsnâ'),el('p','sub','99 güzel isim · Anlamları ve ayrı zikir sayaçları'));const go=el('button','gold','99 Esmâ’yı aç');go.type='button';go.onclick=()=>open('esma');entry.append(go);body.append(entry);for(const x of dhikrs)body.append(createCounter(x));return}
if(mode==='esma'){const intro=el('div','card');const back=el('button','minor','← Zikirlerime dön');back.type='button';back.onclick=()=>open('dhikr');intro.append(back,el('h2','','Esmâü’l-Hüsnâ')); intro.append(el('p','','99 isim · Arapça yazılış, kısa anlam ve her isim için ayrı zikir sayacı.'));const search=el('input');search.type='search';search.placeholder='İsim, sıra veya anlam ara…';search.setAttribute('aria-label','Esmâ ara');const result=el('p','sub');result.setAttribute('aria-live','polite');intro.append(search,result);const source=el('details','details');source.append(el('summary','','Anlamların kaynakları'));source.append(el('p','sub','Kısa anlamlar genel başvuru kaynakları karşılaştırılarak özetlenmiştir. Ahmed el-Bûnî’den doğrulanmış bir şerh veya ona ait özel zikir sayısı aktarılmamıştır. Hedefleri kendin belirleyebilirsin.'));for(const [title,url] of [['Diyanet · Allah’ın 99 ismi','https://kurul.diyanet.gov.tr/Cevap-Ara/2/allahin-99-ismi-hakkinda-bilgi-verir-misiniz'],['TDV · Esmâ-i Hüsnâ','https://islamansiklopedisi.org.tr/esma-i-husna']]){const a=el('a','devotion-source',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';source.append(a)}intro.append(source);body.append(intro);const grid=el('div','esma-grid');body.append(grid);const cards=names.map((x,i)=>createCounter(x,i+1));cards.forEach(c=>grid.append(c));search.oninput=()=>{let shown=0;const q=norm(search.value.trim());names.forEach((x,i)=>{const match=norm((i+1)+' '+x.name+' '+x.arabic+' '+x.meaning).includes(q);cards[i].hidden=!match;if(match)shown++});result.textContent=shown+' isim'};result.textContent='99 isim';return}
window.mountQuran(body);
}
function open(which){window.unmountQuran?.();capturePlace();if($('sideMenu').open)closeDrawer();mode=which;show('devotional');for(const id of mobileButtons)$(id).removeAttribute('aria-current');render();window.scrollTo(0,0)}
for(const [id,m] of [['openDhikr','dhikr'],['openListening','listening'],['openMawlid','mawlid'],['openQada','qada'],['openAshab','ashab']])$(id).onclick=e=>{e.preventDefault();open(m)};
const priorShow=show;show=function(view){if(view!=='devotional'){window.unmountQuran?.();pauseMawlid();}priorShow(view)};
window.openDevotional=open;window.getDevotionalMode=()=>mode;
})();
