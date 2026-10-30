(function(root){
'use strict';
const DAY=86400000,PRAYERS=[['fajr','Sabah',2],['dhuhr','Öğle',4],['asr','İkindi',4],['maghrib','Akşam',3],['isha','Yatsı',4],['witr','Vitir',3]];
const whole=n=>Number.isSafeInteger(Number(n))&&Number(n)>=0?Number(n):0;
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))throw Error('Geçerli bir tarih gir.');const [y,m,d]=s.split('-').map(Number);if(y<1900||y>2200)throw Error('1900–2200 arasında bir tarih gir.');const t=Date.UTC(y,m-1,d),v=new Date(t);if(v.getUTCFullYear()!==y||v.getUTCMonth()!==m-1||v.getUTCDate()!==d)throw Error('Geçerli bir tarih gir.');return t}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function birthday(birth,age){const t=new Date(date(birth)),y=t.getUTCFullYear()+age,m=t.getUTCMonth(),d=t.getUTCDate();return Date.UTC(y,m,Math.min(d,new Date(Date.UTC(y,m+1,0)).getUTCDate()))}
function calculate(config,now=today()){
const b=date(config.birth),end=date(config.start),current=date(now),age=Number(config.age);
if(!Number.isInteger(age)||age<0||age>30)throw Error('Başlangıç yaşını 0–30 arasında seç.');if(b>current)throw Error('Doğum tarihi gelecekte olamaz.');if(end>current)throw Error('Namaza başlama tarihi gelecekte olamaz.');if(end<b)throw Error('Namaza başlama tarihi doğumdan önce olamaz.');
const begin=birthday(config.birth,age);if(begin>end)throw Error('Başlangıç yaşı, namaza başlama tarihinden sonraya düşüyor. Yaşı veya tarihi değiştir.');const days=Math.max(0,Math.round((end-begin)/DAY)),excluded=Number(config.excluded||0);if(!Number.isSafeInteger(excluded)||excluded<0||excluded>days)throw Error('Hesap dışı günler, toplam '+days+' günü aşamaz.');
const count=days-excluded,total={};for(const [id] of PRAYERS)total[id]=id==='witr'&&!config.witr?0:count;return {begin:new Date(begin).toISOString().slice(0,10),end:config.start,days,excluded,count,total};
}
function remaining(plan){const result={};for(const [id] of PRAYERS)result[id]=Math.max(0,whole(plan.total?.[id])-whole(plan.done?.[id]));return result}
function record(plan,ids,n){if(!Number.isSafeInteger(n)||n<1)throw Error('Geçerli bir adet gir.');const left=remaining(plan),change={};for(const id of ids){if(!PRAYERS.some(p=>p[0]===id))continue;const step=Math.min(n,left[id]);if(step)change[id]=step}if(!Object.keys(change).length)return false;plan.done=plan.done||{};for(const [id,step] of Object.entries(change))plan.done[id]=whole(plan.done[id])+step;plan.history=Array.isArray(plan.history)?plan.history:[];plan.history.push({at:today(),change});plan.history=plan.history.slice(-100);return true}
function addMissed(plan,id,n=1){
if(!PRAYERS.some(p=>p[0]===id)||id==='witr'&&!plan.config?.witr)return false;
if(!Number.isSafeInteger(n)||n<1)throw Error('Geçerli bir adet gir.');
const before=whole(plan.total?.[id]),step=Math.min(n,Number.MAX_SAFE_INTEGER-before);if(!step)return false;
plan.added=plan.added||{};plan.total[id]=before+step;plan.added[id]=whole(plan.added[id])+step;
plan.history=Array.isArray(plan.history)?plan.history:[];plan.history.push({kind:'missed',at:today(),change:{[id]:step}});plan.history=plan.history.slice(-100);return true;
}
function recalculate(previous,config,now=today()){
const calc=calculate(config,now),added={...(previous?.added||{})},done={...(previous?.done||{})};
for(const [id] of PRAYERS){added[id]=whole(added[id]);if(id==='witr'&&!config.witr)continue;calc.total[id]=Math.min(Number.MAX_SAFE_INTEGER,calc.total[id]+added[id]);done[id]=Math.min(whole(done[id]),calc.total[id]);}
return {version:1,config,...calc,added,done,history:[]};
}
function undo(plan){const last=plan.history?.pop();if(!last)return false;for(const [id,n] of Object.entries(last.change)){if(last.kind==='missed'){plan.added=plan.added||{};plan.total[id]=Math.max(0,whole(plan.total[id])-whole(n));plan.added[id]=Math.max(0,whole(plan.added?.[id])-whole(n));}else{plan.done=plan.done||{};plan.done[id]=Math.max(0,whole(plan.done[id])-whole(n));}}return true}
root.Qada={PRAYERS,today,calculate,recalculate,remaining,record,addMissed,undo,whole};
})(typeof window!=='undefined'?window:globalThis);
