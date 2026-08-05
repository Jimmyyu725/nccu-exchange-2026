import { newTab, closeTab, connect, sleep } from './cdp.mjs';
import { writeFileSync } from 'fs';
const ID='1Frv4DE88pnjhiJCAdIu8NOd0wM3JI-0r';
const tab=await newTab('https://drive.google.com/');
const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
await cdp.send('Page.enable');await cdp.send('Runtime.enable');await sleep(8000);
const r=await cdp.send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:
`(async()=>{const r=await fetch('https://drive.google.com/get_video_info?docid=${ID}&drive_originator_app=303',{credentials:'include'});return await r.text();})()`});
const raw=r.result.value||'';
writeFileSync('/home/jimmy/oic/videoinfo.raw',raw);
console.log('raw len',raw.length);
await closeTab(tab.id);cdp.close();process.exit(0);
