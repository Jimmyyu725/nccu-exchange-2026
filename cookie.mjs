import { newTab, closeTab, connect, sleep } from './cdp.mjs';
import { writeFileSync, chmodSync } from 'fs';
const tab=await newTab('https://drive.google.com/');
const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
await cdp.send('Network.enable');await sleep(3000);
const {cookies}=await cdp.send('Network.getCookies',{urls:['https://drive.google.com','https://.google.com','https://c.drive.google.com','https://drive.usercontent.google.com']});
const seen=new Set(); const parts=[];
for(const c of cookies){ if(seen.has(c.name))continue; seen.add(c.name); parts.push(c.name+'='+c.value); }
const hdr='Cookie: '+parts.join('; ')+'\r\n';
writeFileSync('/home/jimmy/oic/.hdr',hdr,{mode:0o600}); chmodSync('/home/jimmy/oic/.hdr',0o600);
console.log('cookie 数:',parts.length,'| header 长度:',hdr.length,'（值未打印）');
await closeTab(tab.id);cdp.close();process.exit(0);
