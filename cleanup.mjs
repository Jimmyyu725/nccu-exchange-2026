const BASE='http://127.0.0.1:9222';
const tabs=await (await fetch(BASE+'/json')).json();
const mine=tabs.filter(t=>t.type==='page'&&/drive\.google\.com|drive\.usercontent|about:blank/.test(t.url||''));
console.log('总标签:',tabs.filter(t=>t.type==='page').length,'| 我的:',mine.length);
// 先读一个下载页的内容
const dl=mine.find(t=>/usercontent.*download/.test(t.url||''));
if(dl){
  const ws=new WebSocket(dl.webSocketDebuggerUrl); let n=1;
  await new Promise(r=>{ws.onopen=r;});
  const send=(m,p={})=>new Promise(res=>{const id=n++;const h=e=>{const d=JSON.parse(e.data);if(d.id===id){ws.removeEventListener('message',h);res(d.result);}};ws.addEventListener('message',h);ws.send(JSON.stringify({id,method:m,params:p}));});
  await send('Runtime.enable');
  const r=await send('Runtime.evaluate',{expression:"document.body?document.body.innerText.replace(/\\s+/g,' ').slice(0,400):'no body'",returnByValue:true});
  console.log('下载页内容:',(r&&r.result&&r.result.value)||'(空)');
  ws.close();
}
// 关闭我的标签
let closed=0;
for(const t of mine){ try{await fetch(BASE+'/json/close/'+t.id);closed++;}catch{} }
console.log('已关闭:',closed);
