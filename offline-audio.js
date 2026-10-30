(() => {
'use strict';
const cacheName='salavat-quran-audio-v2';
const path=n=>'quran-audio/'+String(n).padStart(3,'0')+'.m4a';
let busy=false,stop=false;
window.mountOfflineAudio=container=>{
const panel=document.createElement('section');panel.className='card';
const title=document.createElement('h3');title.textContent='İnternetsiz dinleme';
const status=document.createElement('p');status.className='sub';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const progress=document.createElement('progress');progress.max=114;progress.value=0;progress.style.width='100%';progress.setAttribute('aria-label','İndirilen sûre sayısı');
const action=document.createElement('button');action.className='gold';action.textContent='114 sûrenin tamamını indir';
const cancel=document.createElement('button');cancel.textContent='İndirmeyi durdur';cancel.hidden=true;
panel.append(title,status,progress,action,cancel);container.append(panel);
const packaged=window.embeddedQuranAudio||window.Capacitor?.isNativePlatform?.();
async function count(cache){let n=0;for(let i=1;i<=114;i++)if(await cache.match(path(i)))n++;return n}
async function refresh(){
if(packaged){progress.value=114;status.textContent='114 sûrenin sesi uygulamaya dahil. İnternetsiz dinlemeye hazır.';action.disabled=true;action.textContent='Tüm sesler hazır ✓';return}
if(!('caches' in window)||!navigator.serviceWorker){status.textContent='Çevrimdışı indirme için uygulamayı Safari veya Chrome’da güvenli bağlantıyla aç.';action.disabled=true;return}
const n=await count(await caches.open(cacheName));progress.value=n;
status.textContent=n===114?'114 sûrenin tamamı bu cihazda kayıtlı. Uçak modunda dinleyebilirsin.':n+' / 114 sûre kayıtlı. Bir kez yaklaşık 226 MB indir; sonra internetsiz dinle. İndirirken uygulamayı açık tut.';
action.textContent=n===114?'Tüm sesler hazır ✓':n?'Kalan sûreleri indir':'114 sûrenin tamamını indir';action.disabled=n===114||busy;
}
cancel.onclick=()=>{stop=true;cancel.disabled=true;status.textContent='Geçerli dosya tamamlanınca duracak. İndirdiklerin korunur.'};
action.onclick=async()=>{
if(busy)return;busy=true;stop=false;action.disabled=true;cancel.hidden=false;cancel.disabled=false;
try{
await navigator.serviceWorker.ready;
if(navigator.storage?.persist)await navigator.storage.persist().catch(()=>false);
const cache=await caches.open(cacheName);let n=await count(cache);progress.value=n;
for(let i=1;i<=114&&!stop;i++){
if(await cache.match(path(i)))continue;
status.textContent=n+' / 114 sûre kayıtlı · '+i+'. sûre indiriliyor…';
const response=await fetch(path(i),{cache:'no-store'});
if(!response.ok)throw Error('Ses dosyası alınamadı (HTTP '+response.status+').');
const bytes=await response.arrayBuffer();
if(bytes.byteLength<12||String.fromCharCode(...new Uint8Array(bytes,4,4))!=='ftyp')throw Error('Geçerli ses dosyası alınamadı.');
await cache.put(path(i),new Response(bytes,{headers:{'Content-Type':'audio/mp4','Content-Length':String(bytes.byteLength)}}));n++;progress.value=n;
}
busy=false;await refresh();
if(stop)status.textContent=progress.value+' / 114 sûre kayıtlı. İndirme durduruldu; kalanlara sonra devam edebilirsin.';
}catch(error){console.error('offline-audio-download',error);busy=false;action.disabled=false;action.textContent='Kaldığı yerden devam et';status.textContent='İndirme tamamlanamadı. Kaydedilen sûreler korunuyor. İnterneti ve cihazındaki boş alanı kontrol edip devam et. '+(error?.message||'')}
finally{busy=false;cancel.hidden=true;cancel.disabled=false}
};
refresh().catch(()=>{status.textContent='Çevrimdışı kayıt durumu okunamadı.';action.disabled=true});
};
})();
