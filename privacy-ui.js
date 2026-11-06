(() => {
let dialog;
async function openPolicy(title,file){
 if(!dialog){dialog=document.createElement('dialog');dialog.id='privacyDialog';dialog.className='policy-dialog';dialog.setAttribute('aria-labelledby','policyTitle');const header=document.createElement('div');header.className='row';const heading=document.createElement('h2');heading.id='policyTitle';const close=document.createElement('button');close.textContent='✕';close.setAttribute('aria-label','Bilgi penceresini kapat');close.onclick=()=>dialog.close();header.append(heading,close);const body=document.createElement('div');body.className='policy-body';dialog.append(header,body);document.body.append(dialog)}
 dialog.querySelector('#policyTitle').textContent=title;const body=dialog.querySelector('.policy-body');body.textContent='Açılıyor…';dialog.showModal();
 try{const response=await fetch(file);if(!response.ok)throw Error();const page=new DOMParser().parseFromString(await response.text(),'text/html');page.body.querySelectorAll('script,h1').forEach(node=>node.remove());page.body.querySelectorAll('a').forEach(node=>{if(!node.getAttribute('href')?.startsWith('mailto:'))node.remove()});body.replaceChildren(...page.body.childNodes)}catch{body.textContent='Bilgiler açılamadı. Uygulamayı yeniden açıp dene.'}
}
const button=(label,file)=>{const b=document.createElement('button');b.type='button';b.className='minor';b.textContent=label;b.onclick=()=>openPolicy(label,file);return b};
for(const container of [document.querySelector('.search-summary'),document.getElementById('mobileSettings')]){const links=document.createElement('div');links.className='privacy-links';links.append(button('Gizlilik ve mikrofon kullanımı','gizlilik.html'),button('Kullanım yardımı','destek.html'));container.append(links)}
})();
