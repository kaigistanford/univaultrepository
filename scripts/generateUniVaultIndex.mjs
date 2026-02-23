import fs from "node:fs";
import path from "node:path";
const ROOT=process.cwd();
const VAULT=path.join(ROOT,"vault");
const OUT=path.join(ROOT,"assets","js","univault.index.json");
const exts=new Set([".pdf",".pptx",".docx",".xlsx",".xls",".png",".jpg",".jpeg",".webp",".html",".htm"]);
function walk(d){const out=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);
  if(e.isDirectory()) out.push(...walk(f)); else if(e.isFile() && exts.has(path.extname(e.name).toLowerCase())) out.push(f);}return out;}
function fmt(ext){return({".pdf":"PDF",".pptx":"PPTX",".docx":"DOCX",".xlsx":"Excel",".xls":"Excel",".png":"Image",".jpg":"Image",".jpeg":"Image",".webp":"Image",".html":"HTML",".htm":"HTML"}[ext]||"File");}
function slug(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"").slice(0,90);}
function parseMeta(name){const base=name.replace(/\.[^.]+$/,"");const parts=base.split("__").map(x=>x.trim()).filter(Boolean);
  let topic="General",type="Resource",level="All",title=base;
  if(parts.length>=4){topic=parts[0];type=parts[1];level=parts[2];title=parts.slice(3).join(" ");}
  else if(parts.length===3){topic=parts[0];type=parts[1];title=parts[2];}
  else if(parts.length===2){topic=parts[0];title=parts[1];}
  return {topic,type,level,title};}
function categoryFrom(full){const rel=path.relative(VAULT,full);const seg=rel.split(path.sep)[0]||"Resources";return seg.replace(/[-_]+/g," ").replace(/\s+/g," ").trim();}
function relWeb(full){return path.relative(ROOT,full).split(path.sep).join("/");}
if(!fs.existsSync(VAULT)) process.exit(0);
const files=walk(VAULT).sort((a,b)=>a.localeCompare(b));
const items=files.map(full=>{const ext=path.extname(full).toLowerCase();const category=categoryFrom(full);const meta=parseMeta(path.basename(full));
  const format=fmt(ext);const id=slug(`${category}-${meta.topic}-${meta.type}-${meta.level}-${meta.title}-${path.basename(full)}`);
  return {id,title:meta.title.replace(/[-_]+/g," ").trim(),category,type:meta.type.replace(/[-_]+/g," ").trim(),
    level:meta.level.replace(/[-_]+/g," ").trim(),format,tags:[category,meta.topic,meta.type,meta.level,format].filter(Boolean),
    summary:"",path:relWeb(full)};});
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(items,null,2),"utf-8");
console.log(`Generated ${items.length} items -> ${path.relative(ROOT,OUT)}`);