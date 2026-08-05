const BASE='http://127.0.0.1:9222';
export async function newTab(url='about:blank'){const r=await fetch(`${BASE}/json/new?${encodeURIComponent(url)}`,{method:'PUT'});return await r.json();}
export async function closeTab(id){try{await fetch(`${BASE}/json/close/${id}`);}catch{}}
export function connect(ws){const s=new WebSocket(ws);let n=1;const p=new Map();const ready=new Promise((res,rej)=>{s.onopen=()=>res();s.onerror=rej;});const ls=[];
s.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&p.has(m.id)){const{res,rej}=p.get(m.id);p.delete(m.id);m.error?rej(new Error(JSON.stringify(m.error))):res(m.result);}else if(m.method){for(const l of ls)l(m);}};
const send=(method,params={})=>new Promise((res,rej)=>{const id=n++;p.set(id,{res,rej});s.send(JSON.stringify({id,method,params}));});
return{ws:s,ready,send,on:f=>ls.push(f),close:()=>s.close()};}
export async function evalJS(cdp,expr){const r=await cdp.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error('EVAL:'+JSON.stringify(r.exceptionDetails).slice(0,200));return r.result.value;}
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
