import { newTab, closeTab, connect, evalJS, sleep } from './cdp.mjs';
import { writeFileSync } from 'fs';
const C=[
 ["09_BusinessDataAnalytics_ML_MGMT225","301767","00"],
];
for(const [name,num,gop] of C){
  const url=`https://newdoc.nccu.edu.tw/teaschm/1151/schmPrv.jsp-yy=115&smt=1&num=${num}&gop=${gop}&s=1.html`;
  const tab=await newTab('about:blank');
  const cdp=connect(tab.webSocketDebuggerUrl);await cdp.ready;
  await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  const L=new Promise(r=>{cdp.on(m=>{if(m.method==='Page.loadEventFired')r();});});
  await cdp.send('Page.navigate',{url});
  await Promise.race([L,sleep(12000)]); await sleep(1500);
  const txt=await evalJS(cdp,`document.body?document.body.innerText:''`).catch(()=>'');
  const missing=/找不到網頁|cannot be found/.test(txt)||txt.length<200;
  if(missing){ console.log(`❌ ${name} — 大綱未上傳`); await closeTab(tab.id); cdp.close(); continue; }
  // 语言比例
  const cjk=(txt.match(/[一-鿿]/g)||[]).length;
  const lat=(txt.match(/[A-Za-z]/g)||[]).length;
  const pct=Math.round(lat/(lat+cjk)*100);
  const pdf=await cdp.send('Page.printToPDF',{printBackground:true,paperWidth:8.27,paperHeight:11.69,marginTop:0.4,marginBottom:0.4,marginLeft:0.4,marginRight:0.4});
  writeFileSync(`/home/jimmy/oic/syllabi/${name}.pdf`,Buffer.from(pdf.data,'base64'));
  console.log(`✅ ${name} — 英文占比 ${pct}% (英文字母 ${lat} / 中文字 ${cjk})`);
  await closeTab(tab.id); cdp.close();
}
process.exit(0);
