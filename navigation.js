(() => {
'use strict';
const previous=[],buttons={listening:'openListening',salavat:'openSalavat',dhikr:'openDhikr',esma:'openDhikr',mawlid:'openMawlid',qada:'openQada',ashab:'openAshab'};
let current={view:currentView,mode:null},returning=false;
const routeKey=route=>route.view==='devotional'?'devotional:'+route.mode:route.view==='catalog'?'catalog:'+!!route.favorites:route.view;
function snapshot(route){const value={...route,scroll:window.scrollY};if(route.view==='reader'){capturePlace();value.id=state.lastRead?.id||items[0].id;value.offset=state.lastRead?.offset||0}if(route.view==='catalog'){value.favorites=favOnly;value.search=$('search').value}return value}
function update(){const section=current.view==='devotional'?current.mode:current.view==='reader'||current.view==='catalog'?'salavat':null;for(const id of ['openListening','openSalavat','openDhikr','openMawlid','openQada','openAshab'])$(id).setAttribute('aria-pressed',String(id===buttons[section]));$('appBack').disabled=previous.length===0}
const original=show;
show=function(view){const next={view,mode:view==='devotional'?window.getDevotionalMode():null,favorites:view==='catalog'?favOnly:false};if(!returning&&routeKey(next)!==routeKey(current)){previous.push(snapshot(current));if(previous.length>50)previous.shift()}original(view);current=next;update()};
$('openSalavat').onclick=()=>{if($('sideMenu').open)closeDrawer();if(currentView==='reader'){window.scrollTo({top:0,behavior:'smooth'});return}const last=state.lastRead;openReader(last?.id||items[0].id,last?.offset||0,true);};
$('appBack').onclick=()=>{
const route=previous.pop();if(!route)return;returning=true;
try{if(route.view==='devotional')window.openDevotional(route.mode);else if(route.view==='reader')openReader(route.id||items[0].id,route.offset||0,true);else if(route.view==='catalog'){favOnly=!!route.favorites;$('search').value=route.search||'';renderList();show('catalog')}else{renderStats();show('stats')}
if(route.view!=='reader')requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo(0,route.scroll||0)));
}finally{returning=false;update()}
};
const measure=()=>document.documentElement.style.setProperty('--app-top-height',Math.ceil($('appTop').getBoundingClientRect().height)+'px');
if('ResizeObserver' in window)new ResizeObserver(measure).observe($('appTop'));else window.addEventListener('resize',measure);
measure();update();
})();
