import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {load} from 'cheerio';
const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const info=JSON.parse(await readFile(join(root,'build-info.json'),'utf8'));
const names=['index','services','service-areas','about','support','privacy','terms'];
const expected=(n,l)=>info.origin+(l==='ar'?'/ar/'+n+'.html':n==='index'?'/':'/'+n+'.html');
for(const lang of ['en','ar'])for(const name of names){
 const file=join(root,lang==='ar'?'ar':'',name+'.html');const $=load(await readFile(file,'utf8'));
 assert.equal($('html').attr('lang'),lang,file);assert.equal($('html').attr('dir'),lang==='ar'?'rtl':'ltr');assert.equal($('h1').length,1,file+' needs one H1');
 assert.equal($('link[rel=canonical]').attr('href'),expected(name,lang));assert.equal($('link[hreflang]').length,3);
 assert.equal($('link[hreflang="ar-EG"]').attr('href'),expected(name,'ar'));
 assert.equal($('meta[name=robots]').attr('content').startsWith('noindex'),!info.indexable);
 assert($('title').text().length>12);assert($('meta[name=description]').attr('content').length>40);
 const schema=JSON.parse($('script[type="application/ld+json"]').text());assert.equal(schema['@context'],'https://schema.org');assert(schema['@graph'].some(x=>x.telephone==='+201010023147'));
 assert(!JSON.stringify(schema).includes('pricing.html'),'Hidden pricing must not be linked in structured data');
 assert.equal($('a[href*="pricing.html"]').length,0,'Hidden pricing must not be linked');
 if(['services','service-areas'].includes(name)){assert(!/EGP|جنيه/.test($('main').text()),'Service information must not reintroduce hidden prices');assert(!JSON.stringify(schema).includes('"price"'),'No hidden offer prices');}
 if(name!=='index'){assert.equal($('.breadcrumbs [aria-current=page]').length,1);assert(schema['@graph'].some(x=>x['@type']==='BreadcrumbList'));}
 for(const faq of schema['@graph'].filter(x=>x['@type']==='FAQPage')){assert.equal(faq.mainEntity.length,$('.faq details').length);for(const q of faq.mainEntity){assert(!q.name.endsWith('+'));assert($('main').text().includes(q.acceptedAnswer.text));}}
 assert(!JSON.stringify(schema).includes('aggregateRating'));assert.equal($('.footer-policies a').length,3);
 for(const a of $('a[href]').toArray()){
  const href=$(a).attr('href');if(!href.startsWith('/')||href.startsWith('//'))continue;
  const path=href.split('#')[0];await access(join(root,path==='/'?'index.html':path.slice(1)));
 }
 for(const a of $('[data-book]').toArray()){const u=new URL($(a).attr('href'));assert.equal(u.hostname,'wa.me');assert.equal(u.pathname,'/201010023147');assert(u.searchParams.get('text'))}
 for(const el of $('[src]').toArray()){const path=$(el).attr('src');if(path.startsWith('/'))await access(join(root,path.slice(1)))}
 if(name==='pricing'){assert($('.plan').eq(2).text().includes('1,000'));assert($('.plan').eq(3).text().includes('1,800'));const m=new URL($('[data-book=four]').attr('href')).searchParams.get('text');assert(lang==='ar'?m.includes('١٤٠٠'):m.includes('1,400'))}
 if(lang==='ar')assert(!$('h1').text().includes('Support'),'Arabic must exist in raw HTML');
}
for(const lang of ['en','ar']){
 const $=load(await readFile(join(root,lang==='ar'?'ar':'','pricing.html'),'utf8'));
 assert.equal($('.plan').length,0,'Hidden pricing must not expose package cards');
 assert.equal($('meta[name=robots]').attr('content'),'noindex,follow');
 assert.equal($('meta[http-equiv=refresh]').attr('content'),'0;url='+(lang==='ar'?'/ar/index.html':'/'));
}
const map=load(await readFile(join(root,'sitemap.xml'),'utf8'),{xmlMode:true});assert.equal(map('url').length,14);assert.equal(new Set(map('loc').map((_,el)=>map(el).text()).get()).size,14);
assert.equal(map('xhtml\\:link').length,42,'Every URL needs three language alternates');
assert(!map('loc').toArray().some(el=>map(el).text().includes('pricing.html')));
assert((await readFile(join(root,'robots.txt'),'utf8')).includes('User-agent: OAI-SearchBot\nAllow: /'));
assert(load(await readFile(join(root,'404.html'),'utf8'))('meta[name=robots]').attr('content').includes('noindex'));
console.log('PASS: 14 static language pages, hidden pricing redirects, canonical/hreflang, sitemap, metadata, schema, internal assets/links, WhatsApp prices, footer policies and noindex guards.');
