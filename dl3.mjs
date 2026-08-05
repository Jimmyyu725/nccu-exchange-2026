import { newTab, closeTab, connect, evalJS, sleep } from './cdp.mjs';
const ID='1Frv4DE88pnjhiJCAdIu8NOd0wM3JI-0r';
const tab=await newTab('about:blank');
const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
await cdp.send('Page.enable');await cdp.send('Runtime.enable');
await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:'/home/jimmy/oic',eventsEnabled:true});
let done=false,state='';
cdp.on(m=>{
  if(m.method==='Browser.downloadWillBegin')console.log('DL begin:',m.params.suggestedFilename);
  if(m.method==='Browser.downloadProgress'&&m.params.state!=='inProgress'){done=true;state=m.params.state;}
});
cdp.send('Page.navigate',{url:`https://drive.usercontent.google.com/download?id=${ID}&export=download`}).catch(()=>{});
await sleep(9000);
// 提交确认表单 / 点“仍然下载”
const r=await evalJS(cdp,`(()=>{
  const f=document.querySelector('form'); 
  const btn=[...document.querySelectorAll('button,input[type=submit],a')].find(b=>/下载|download/i.test(b.textContent||b.value||''));
  if(btn){btn.click();return 'clicked: '+(btn.textContent||btn.value||'').trim().slice(0,30);}
  if(f){f.submit();return 'form submitted';}
  return 'nothing found';
})()`).catch(e=>'err '+String(e).slice(0,60));
console.log('确认:',r);
for(let i=0;i<160;i++){ if(done)break; await sleep(5000); }
console.log('完成:',done,state);
await closeTab(tab.id);cdp.close();process.exit(0);
