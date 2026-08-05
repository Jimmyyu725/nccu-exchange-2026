import { newTab, closeTab, connect, sleep } from './cdp.mjs';
const ID='1Frv4DE88pnjhiJCAdIu8NOd0wM3JI-0r';
const tab=await newTab('https://drive.google.com/');
const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
await cdp.send('Page.enable');await cdp.send('Runtime.enable');await sleep(8000);
const r=await cdp.send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const r=await fetch('https://drive.usercontent.google.com/download?id=${ID}&export=download&confirm=t',{credentials:'include',redirect:'follow'});
  const ct=r.headers.get('content-type')||''; const cl=r.headers.get('content-length')||'';
  let head=''; if(/text|html/i.test(ct)){const t=await r.text();head=t.replace(/\\s+/g,' ').slice(0,400);}
  return {status:r.status,ct,cl,url:r.url.slice(0,140),head};
})()`});
console.log(JSON.stringify(r.result.value,null,1).slice(0,900));
await closeTab(tab.id);cdp.close();process.exit(0);
