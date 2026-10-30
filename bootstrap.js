(() => {
'use strict';
const files=['audio-map.js','audio.js?v=ios-1','app-core.js','app-mobile.js','esma-data.js','quran-data.js','quran-audio-manifest.js','offline-package.js','quran-timings.js','quran-sync.js','quran.js?v=sections-1','mawlid.js?v=mevlid-3','qada-core.js?v=2','qada.js?v=2','ashab.js?v=2','devotions.js?v=ashab-1','navigation.js?v=ashab-1','privacy-ui.js'];
const status=document.getElementById('bootStatus');
async function start(){
try{await (window.nativeReady||Promise.resolve());for(const src of files){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(Error('Uygulama dosyası açılamadı: '+src));document.body.append(script)})}status.remove();document.dispatchEvent(new Event('salavat-ready'))}
catch(error){console.error('salavat-startup',error);status.replaceChildren();const text=document.createElement('p');text.textContent='Uygulama veya cihaz kayıtları açılamadı. Kayıtlarının üzerine yazılmadı. Yeniden açmayı dene.';const retry=document.createElement('button');retry.textContent='Yeniden aç';retry.onclick=()=>location.reload();status.append(text,retry)}
}
start();
})();
