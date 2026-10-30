(() => {
'use strict';
const cacheName='salavat-quran-audio-v2',key='salavat-download-all-v2';
const sizes=window.quranAudioSizes||[],path=n=>'quran-audio/'+String(n).padStart(3,'0')+'.m4a';
const total=sizes.reduce((a,b)=>a+b,0),saved=new Set(),listeners=new Set(),inflight=new Map(),partial=new Map();
let running=false,wanted=false,paused=false,message='',controller,wakeLock,scanned=false,scanPromise;
const packaged=()=>!!(window.embeddedQuranAudio||window.Capacitor?.isNativePlatform?.());
const supported=()=>('caches' in window)&&('serviceWorker' in navigator);
function remember(value){try{localStorage.setItem(key,value?'yes':'no')}catch{}}
function emit(changed=false){for(const callback of listeners)callback();if(changed)window.dispatchEvent(new Event('quran-download-change'))}
function byteCount(){let n=0;for(const i of saved)n+=sizes[i-1]||0;for(const [i,v] of partial)if(!saved.has(i))n+=v;return n}
async function scan(){
if(scanPromise)return scanPromise;
scanPromise=(async()=>{if(!supported()||packaged())return;const cache=await caches.open(cacheName);const keys=await cache.keys();saved.clear();for(const req of keys){const m=/\/quran-audio\/(\d{3})\.m4a$/.exec(new URL(req.url).pathname);if(m)saved.add(Number(m[1]))}scanned=true;emit()})().finally(()=>{scanPromise=null});return scanPromise;
}
async function keepAwake(){if(running&&document.visibilityState==='visible'&&navigator.wakeLock?.request){try{wakeLock=await navigator.wakeLock.request('screen')}catch{}}}
function releaseWakeLock(){wakeLock?.release().catch(()=>{});wakeLock=null}
function abortError(){return new DOMException('İndirme durduruldu.','AbortError')}
async function fetchOne(n,signal){
const inner=new AbortController();let timer;
const abort=()=>inner.abort();if(signal?.aborted)throw abortError();signal?.addEventListener('abort',abort,{once:true});
const reset=()=>{clearTimeout(timer);timer=setTimeout(()=>inner.abort(),45000)};
try{
reset();const response=await fetch(path(n),{cache:'no-store',signal:inner.signal});
if(!response.ok)throw Error('HTTP '+response.status);
const expected=sizes[n-1];let bytes;
if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let length=0;try{while(true){const {done,value}=await reader.read();if(done)break;reset();chunks.push(value);length+=value.byteLength;partial.set(n,length);emit()}bytes=new Uint8Array(length);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength}}finally{reader.releaseLock()}}
else bytes=new Uint8Array(await response.arrayBuffer());
if(signal?.aborted)throw abortError();
if(bytes.byteLength<12||String.fromCharCode(...bytes.subarray(4,8))!=='ftyp'||(expected&&bytes.byteLength!==expected))throw Error('Ses dosyası eksik geldi.');
const cache=await caches.open(cacheName);await cache.put(path(n),new Response(bytes,{headers:{'Content-Type':'audio/mp4','Content-Length':String(bytes.byteLength)}}));saved.add(n);partial.delete(n);emit(true);return true;
}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);partial.delete(n)}
}
async function saveOne(n,{signal}={}){
if(inflight.has(n))return inflight.get(n);
const task=(async()=>{const cache=await caches.open(cacheName);if(await cache.match(path(n))){saved.add(n);emit(true);return true}
let last;for(let attempt=0;attempt<3;attempt++){if(signal?.aborted)throw abortError();try{return await fetchOne(n,signal)}catch(error){last=error;if(signal?.aborted||error.name==='QuotaExceededError')throw error;if(attempt<2){message=n+'. sûre yeniden deneniyor…';emit();await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)))}}}throw last})().finally(()=>inflight.delete(n));inflight.set(n,task);return task;
}
async function start(){
if(running||packaged()||!supported())return;
running=true;wanted=true;paused=false;message='Ses paketi hazırlanıyor…';remember(true);controller=new AbortController();emit();
try{
await scan();
const registration=await navigator.serviceWorker.getRegistration();
if(!registration)await navigator.serviceWorker.register('./sw.js');
// A blocked embedded browser must not leave the button waiting forever.
if(!navigator.serviceWorker.controller){await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('Uygulamayı Safari veya Chrome’da açıp yeniden dene.')),15000))])}
navigator.storage?.persist?.().catch(()=>false);await keepAwake();
const pending=Array.from({length:114},(_,i)=>i+1).filter(n=>!saved.has(n));let next=0;const failed=[];message='Tüm sûreler indiriliyor. Uygulamayı açık tut.';emit();
async function worker(){while(next<pending.length&&!controller.signal.aborted){const n=pending[next++];try{await saveOne(n,{signal:controller.signal})}catch(error){if(error.name==='QuotaExceededError'){message='Cihazda yeterli boş alan yok. Yer açıp “Devam et”e dokun.';controller.abort();break}if(controller.signal.aborted)break;failed.push(n)}}}
await Promise.all([worker(),worker()]);
if(saved.size===114){wanted=false;remember(false);message='114 sûrenin tamamı hazır. İnternet olmadan dinleyebilirsin.'}
else if(!message.includes('boş alan'))message=paused?'İndirme duraklatıldı. Kaydedilen sûreler korunuyor.':navigator.onLine===false?'Bağlantı bekleniyor. İnternet gelince otomatik devam edecek.':failed.length?'Bazı dosyalar indirilemedi. “Devam et” ile kalanların hepsini birlikte indir.':'İndirme tamamlanmadı. “Devam et”e dokun.';
}catch(error){message=error.message?.includes('Safari')?error.message:'İndirme başlayamadı. Uygulamayı Safari veya Chrome’da açıp “Devam et”e dokun.'}
finally{running=false;partial.clear();releaseWakeLock();emit()}
}
function pause(){paused=true;wanted=false;remember(false);controller?.abort();message='İndirme duraklatılıyor…';emit()}
window.QuranDownloads={saveOne,scan,start,pause,getState:()=>({running,count:saved.size,bytes:byteCount(),total,message})};
window.mountOfflineAudio=container=>{
const panel=document.createElement('section');panel.className='card offline-package';panel.setAttribute('aria-label','Kur’an ses paketini indir');
const heading=document.createElement('h3');heading.textContent='Kur’an’ın tamamı tek indirmede';
const status=document.createElement('p');status.className='sub';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const meter=document.createElement('progress');meter.max=total||114;meter.setAttribute('aria-label','Tüm sûrelerin indirme ilerlemesi');
const counts=document.createElement('p');counts.className='offline-count';
const action=document.createElement('button');action.className='gold';const cancel=document.createElement('button');cancel.textContent='Duraklat';cancel.className='minor';
const hint=document.createElement('p');hint.className='sub offline-hint';hint.textContent='Bir kez indir; 114 sûreyi internetsiz dinle. İndirme bitene kadar uygulamayı açık tut. Bölüm değiştirsen de indirme sürer.';
panel.append(heading,status,meter,counts,action,cancel,hint);container.append(panel);
function render(){if(!panel.isConnected){listeners.delete(render);return}const ready=packaged()||saved.size===114;meter.value=ready?meter.max:total?byteCount():saved.size;counts.textContent=(ready?114:saved.size)+' / 114 sûre · '+(total?Math.min(100,Math.floor(Number(meter.value)/total*100))+'%':'');
const text=ready?'Tüm sûreler bu cihazda kayıtlı. İnternetsiz dinlemeye hazır.':message||'Yaklaşık 226 MB. Tek düğmeyle bütün sûreleri birlikte indir.';if(status.textContent!==text)status.textContent=text;
action.textContent=ready?'Tüm sesler hazır ✓':running?'Tüm sûreler indiriliyor…':saved.size||scanned&&message?'Tümünü indirmeye devam et':'Tüm sûreleri tek seferde indir';action.disabled=ready||running||!supported();cancel.hidden=!running;hint.hidden=ready;
if(!supported()&&!packaged()){status.textContent='İndirmek için uygulamayı Safari veya Chrome’da aç.';action.disabled=true}}
action.onclick=start;cancel.onclick=pause;listeners.add(render);render();scan().catch(()=>{message='Cihazın kayıt alanına erişilemedi. Safari veya Chrome’da açmayı dene.';emit()});
};
window.addEventListener('offline',()=>{if(running){message='Bağlantı bekleniyor. İnternet gelince otomatik devam edecek.';controller?.abort();emit()}});
window.addEventListener('online',()=>{if(wanted&&!paused)start()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){keepAwake();if(wanted&&!running&&!paused)start()}});
try{wanted=localStorage.getItem(key)==='yes'}catch{}
if(wanted&&!packaged()&&supported())start();
})();
