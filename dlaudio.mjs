import { newTab, closeTab, connect, sleep } from './cdp.mjs';
import { readFileSync } from 'fs';
const URL=readFileSync('/home/jimmy/oic/audio_url.txt','utf8').trim();
const tab=await newTab('https://drive.google.com/');
const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
await cdp.send('Page.enable');await cdp.send('Runtime.enable');await sleep(7000);
// 1) 先在页面内测试能否取到
const t=await cdp.send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:
`(async()=>{try{const r=await fetch(${JSON.stringify(URL)},{credentials:'include',headers:{Range:'bytes=0-99999'}});
 return {status:r.status,ct:r.headers.get('content-type'),len:(await r.arrayBuffer()).byteLength};}catch(e){return{err:String(e).slice(0,120)}}})()`});
console.log('页面内 fetch:',JSON.stringify(t.result.value));
if(t.result.value&&t.result.value.status&&t.result.value.status<400){
  // 2) 用下载管理器整轨下载
  await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:'/home/jimmy/oic',eventsEnabled:true});
  let done=false;
  cdp.on(m=>{ if(m.method==='Browser.downloadProgress'&&m.params.state!=='inProgress'){done=true;console.log('下载结束:',m.params.state);} });
  await cdp.send('Runtime.evaluate',{expression:`(()=>{const a=document.createElement('a');a.href=${JSON.stringify(URL)};a.download='oic-audio.m4a';document.body.appendChild(a);a.click();return 'clicked'})()`});
  console.log('已触发下载，等待…');
  for(let i=0;i<150;i++){ if(done)break; await sleep(4000); }
  console.log('done=',done);
}
await closeTab(tab.id);cdp.close();process.exit(0);
