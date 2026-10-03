import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.json':'application/json'};
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return}
 try{
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(root,'.'+requested);
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(403).end();return}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Robots-Tag':'noindex, follow','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{const data=await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Not found'));res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex, follow'});res.end(req.method==='HEAD'?undefined:data)}
}).listen(port,'127.0.0.1',()=>console.log(`Pop Up ready at http://127.0.0.1:${port} from ${root}`));
