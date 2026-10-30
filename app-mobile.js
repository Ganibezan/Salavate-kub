
const mobileButtons=['mobileCatalog','mobileRead','mobileFavorites','mobileStats'];
function markMobile(id){mobileButtons.forEach(k=>{if(k===id)$(k).setAttribute('aria-current','page');else $(k).removeAttribute('aria-current')})}
const originalShow=show;show=function(view){originalShow(view);markMobile(view==='reader'?'mobileRead':view==='stats'?'mobileStats':favOnly?'mobileFavorites':'mobileCatalog')};
$('mobileCatalog').onclick=()=>{capturePlace();favOnly=false;renderList();show('catalog');window.scrollTo(0,0)};
$('mobileFavorites').onclick=()=>{capturePlace();favOnly=true;$('search').value='';renderList();show('catalog');window.scrollTo(0,0)};
$('mobileRead').onclick=()=>$('resumeBtn').click();$('mobileStats').onclick=()=>$('statsBtn').click();
function applyPreferences(){document.body.classList.toggle('night',!!state.nightMode);document.documentElement.style.setProperty('--reader-size',(Number(state.readerSize)||32)+'px');$('nightMode').checked=!!state.nightMode;$('fontSize').value=Number(state.readerSize)||32;$('fontValue').value=$('fontSize').value}
$('mobilePrefs').onclick=()=>$('mobileSettings').showModal();$('closeSettings').onclick=()=>$('mobileSettings').close();
$('fontSize').oninput=()=>{state.readerSize=Number($('fontSize').value);applyPreferences();save()};$('nightMode').onchange=()=>{state.nightMode=$('nightMode').checked;applyPreferences();save()};
applyPreferences();markMobile('mobileRead');
if('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.() && /^https?:$/.test(location.protocol)){const installOffline=()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});if(document.readyState==='complete')installOffline();else window.addEventListener('load',installOffline,{once:true})}
