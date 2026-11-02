(function(root){
'use strict';
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'grapheme'}):null;
const glyphs=s=>segmenter?Array.from(segmenter.segment(String(s)),x=>x.segment):Array.from(String(s));
const text=s=>typeof s==='string'?s.slice(0,200000):'';
function makeNote(){const now=new Date().toISOString();return {id:globalThis.crypto?.randomUUID?.()||'n'+Date.now()+Math.random().toString(36).slice(2),title:'',body:'',createdAt:now,updatedAt:now,pinned:false,fontSize:18,paper:true,cue:{text:'',mode:'direct',step:1,cursor:0},previous:null};}
function normalizeNote(raw){if(!raw||typeof raw!=='object')return null;const n=makeNote();n.id=text(raw.id)||n.id;n.title=text(raw.title).slice(0,300);n.body=text(raw.body);n.createdAt=Number.isFinite(Date.parse(raw.createdAt))?raw.createdAt:n.createdAt;n.updatedAt=Number.isFinite(Date.parse(raw.updatedAt))?raw.updatedAt:n.updatedAt;n.pinned=raw.pinned===true;n.paper=raw.paper!==false;n.fontSize=[16,18,20,22,24,26].includes(raw.fontSize)?raw.fontSize:18;n.cue.text=text(raw.cue?.text);n.cue.step=[1,2,3,5].includes(raw.cue?.step)?raw.cue.step:1;n.cue.cursor=Math.max(0,Math.min(glyphs(n.cue.text).length,Math.floor(Number(raw.cue?.cursor)||0)));n.cue.mode=raw.cue?.mode==='cue'?'cue':'direct';if(n.cue.mode==='cue')n.body=glyphs(n.cue.text).slice(0,n.cue.cursor).join('');if(raw.previous&&typeof raw.previous.body==='string')n.previous={body:text(raw.previous.body),title:text(raw.previous.title).slice(0,300)};return n;}
function normalizeStore(raw){if(!raw||raw.version!==1||!Array.isArray(raw.notes))throw Error('메모 백업 파일을 확인해 주세요.');const seen=new Set(),notes=raw.notes.slice(0,500).map(normalizeNote).filter(n=>n&&!seen.has(n.id)&&seen.add(n.id));return {version:1,notes,lastOpenId:notes.some(n=>n.id===raw.lastOpenId)?raw.lastOpenId:null,showDates:false};}
function cueTo(n,index){const all=glyphs(n.cue.text);n.cue.cursor=Math.max(0,Math.min(all.length,Math.floor(Number(index)||0)));n.body=all.slice(0,n.cue.cursor).join('');return n.body;}
function advance(n){return cueTo(n,n.cue.cursor+n.cue.step);}
function rewind(n){return cueTo(n,n.cue.cursor-1);}
function applyCue(n,script,mode,step,start){script=text(script);if(mode==='cue'&&!script.trim())throw Error('준비 문장을 먼저 입력해 주세요.');const changed=n.cue.text!==script;n.cue.text=script;n.cue.step=[1,2,3,5].includes(Number(step))?Number(step):1;if(mode==='cue'){if(n.cue.mode!=='cue'||changed)n.previous={body:n.body,title:n.title};n.cue.mode='cue';cueTo(n,start);}else n.cue.mode='direct';}
root.NotesCore={glyphs,makeNote,normalizeStore,normalizeNote,cueTo,advance,rewind,applyCue};
})(globalThis);
