import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {load} from 'cheerio';
import sharp from 'sharp';
import {build as bundle} from 'esbuild';
import vm from 'node:vm';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const src=join(root,'src'),out=join(root,'dist');
const site=new URL(process.env.SITE_URL||'https://popupwash.com');
if(site.protocol!=='https:'||site.pathname!=='/'||site.search||site.hash||site.username||site.password)throw Error('SITE_URL must be a bare HTTPS origin.');
const origin=site.origin;
const production=process.env.VERCEL_ENV==='production';
const indexable=production&&process.env.INDEXING_ENABLED==='true';
const analytics=production&&process.env.ANALYTICS_ENABLED!=='false';
const titles={
 'service-areas':['Mobile Car Wash: Sheikh Zayed & 6 October Areas | Pop Up','مغسلة سيارات متنقلة في الشيخ زايد و٦ أكتوبر | بوب اب'],
 index:['Mobile Car Wash in Sheikh Zayed & 6 October | Pop Up','غسيل سيارات متنقل في الشيخ زايد و٦ أكتوبر | بوب اب'],
 services:['At-Home Car Wash & Monthly Plans | Pop Up Egypt','غسيل سيارات عند البيت واشتراكات شهرية | بوب اب'],
 pricing:['Car Wash Prices & Monthly Plans | Pop Up Egypt','أسعار غسيل السيارات والاشتراكات الشهرية | بوب اب'],
 about:['About Pop Up | Mobile Car Wash in West Cairo','عن بوب اب | غسيل سيارات متنقل في غرب القاهرة'],
 support:['Contact & Booking Support | Pop Up Car Wash','تواصل معنا ودعم الحجوزات | بوب اب'],
 privacy:['Privacy Policy | Pop Up Car Wash','سياسة الخصوصية | بوب اب'],
 terms:['Terms of Service | Pop Up Car Wash','شروط الخدمة | بوب اب']};
const descriptions={
 'service-areas':['Check Pop Up mobile car wash coverage in Sheikh Zayed and 6th of October. See what to send before booking an at-home wash or monthly plan on WhatsApp.','اعرف مناطق خدمة مغسلة بوب اب المتنقلة في الشيخ زايد و٦ أكتوبر، وإيه المطلوب قبل حجز غسيل العربية عند البيت أو الاشتراك الشهري على واتساب.'],
 index:['Pop Up brings a complete interior, exterior and trunk car wash to your home in Sheikh Zayed and 6th of October. Book a wash or monthly plan on WhatsApp.','بوب اب بتوصلك لغسيل العربية من جوّه وبرّه والشنطة في الشيخ زايد و٦ أكتوبر. احجز غسلة عند البيت أو اشتراك شهري على واتساب.'],
 services:['Interior, exterior and trunk cleaning at your home with quality cleaning products. Explore one-off washes and monthly plans in Sheikh Zayed and 6 October.','غسيل شامل داخلي وخارجي والشنطة بخامات تنظيف عالية الجودة عند بيتك. اعرف خدمات بوب اب في الشيخ زايد و٦ أكتوبر.'],
 pricing:['Single wash EGP 450; 2 washes EGP 750/month. First month: 4 washes EGP 1,000 then 1,400; 8 washes EGP 1,800 then 2,500. Book on WhatsApp.','غسلة بـ٤٥٠ جنيه وغسلتين بـ٧٥٠ شهريًا. ٤ غسلات بـ١٠٠٠ لأول شهر ثم ١٤٠٠، و٨ بـ١٨٠٠ ثم ٢٥٠٠. احجز على واتساب.'],
 about:['Meet Pop Up, the van-based car wash serving homes in Sheikh Zayed and 6th of October, Egypt. Wash your car where you are.','اعرف بوب اب، مغسلة السيارات المتنقلة بعربية مجهزة بتوصلك لحد البيت في الشيخ زايد و٦ أكتوبر. اغسل عربيتك تحت بيتك.'],
 support:['Contact Pop Up on WhatsApp 01010023147 for car wash bookings, coverage, appointment changes and help with your visit.','كلّم بوب اب على واتساب 01010023147 لحجز غسيل العربية، التأكد من التغطية، تغيير الموعد أو المساعدة بعد الزيارة.'],
 privacy:['How Pop Up handles website visits, WhatsApp enquiries, preferences and analytics, and how to contact us about your information.','اعرف إزاي بوب اب بتتعامل مع زيارات الموقع واستفسارات واتساب وتفضيلات العرض والتحليلات، وإزاي تتواصل بخصوص بياناتك.'],
 terms:['Read the terms for Pop Up mobile car wash enquiries, confirmed appointments, monthly plans and service support.','اقرأ شروط الاستفسار والحجز والاشتراكات الشهرية والدعم لخدمة غسيل السيارات المتنقلة من بوب اب.']};
// Temporarily hide pricing; keep its source intact for restoration.
const hiddenPages=['pricing'];
const pageLabels={'service-areas':['Service areas','مناطق التغطية'],services:['Car wash services','خدمات غسيل السيارات'],about:['About Pop Up','عن بوب اب'],support:['Support','الدعم'],privacy:['Privacy policy','سياسة الخصوصية'],terms:['Terms of service','شروط الخدمة']};
const names=Object.keys(titles).filter(name=>!hiddenPages.includes(name)),route=(name,lang)=>lang==='ar'?`/ar/${name}.html`:(name==='index'?'/':`/${name}.html`);
await mkdir(join(out,'ar'),{recursive:true});await mkdir(join(out,'assets'),{recursive:true});
const app=await readFile(join(src,'app.js'),'utf8');
const messageDefinition=app.slice(0,app.indexOf('const number='));
const messages=vm.runInNewContext(messageDefinition+';messages;');
const config=await readFile(join(src,'config.js'),'utf8');
const conf={};vm.runInNewContext(config,{window:conf});const number=conf.POPUP_CONFIG.whatsappNumber;
if(!/^20\d{10}$/.test(number))throw Error('Configure Egyptian WhatsApp number before build.');
for(const name of ['app.js','theme.js','config.js','styles.css','legal.css'])await copyFile(join(src,name),join(out,name));
for(const name of ['styles.css','legal.css'])await bundle({entryPoints:[join(src,name)],outfile:join(out,name),minify:true});
for(const name of ['scrollcraft.js','scrollcraft.css'])await copyFile(join(src,'assets',name),join(out,'assets',name));
const fontRoot=join(root,'node_modules','@fontsource','bricolage-grotesque');
await copyFile(join(fontRoot,'files','bricolage-grotesque-latin-700-normal.woff2'),join(out,'assets','bricolage-grotesque-latin-700.woff2'));
await copyFile(join(fontRoot,'LICENSE'),join(out,'assets','bricolage-grotesque-LICENSE.txt'));
const photo=join(src,'assets','home-service.png');
for(const width of [640,1024,1536])await sharp(photo).resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(join(out,'assets',`home-service-${width}.webp`));
await sharp(join(src,'assets','popup-logo.png')).resize({width:320}).webp({quality:90}).toFile(join(out,'assets','popup-logo.webp'));
await sharp(join(src,'assets','popup-logo.png')).resize({width:64,height:64,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(join(out,'assets','favicon.png'));
await sharp(photo).resize(1200,630,{fit:'cover'}).jpeg({quality:82}).toFile(join(out,'assets','social-preview.jpg'));
await bundle({entryPoints:[join(src,'analytics.js')],outfile:join(out,'analytics.js'),bundle:true,minify:true,platform:'browser',define:{'__PRODUCTION__':JSON.stringify(analytics),'__SITE_HOST__':JSON.stringify(site.hostname)}});
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
for(const name of names){
 const original=await readFile(join(src,'pages',name+'.html'),'utf8');
 for(const lang of ['en','ar']){
  const $=load(original);const i=lang==='ar'?1:0,path=route(name,lang),url=origin+path;
  $('a[href]').each((_,el)=>{const href=$(el).attr('href').split('#')[0];if(hiddenPages.some(page=>href===`/${page}.html`||href===`/ar/${page}.html`))$(el).remove();});
  $('html').attr({lang,dir:i?'rtl':'ltr','data-localized':'true'});
  $('[data-en][data-ar]').each((_,el)=>$(el).text($(el).attr('data-'+lang)));
  if(name==='index'&&lang==='en')$('head').append('<link rel="preload" href="/assets/bricolage-grotesque-latin-700.woff2" as="font" type="font/woff2" crossorigin>');
  $('title').text(titles[name][i]);$('meta[name=description]').attr('content',descriptions[name][i]);
  $('link[rel=canonical],link[rel=alternate][hreflang],meta[property^="og:"],meta[name^="twitter:"],meta[name=robots],script[type="application/ld+json"]').remove();
  if(name!=='index'&&pageLabels[name])$('main').prepend('<nav class="breadcrumbs wrap" aria-label="'+(i?'مسار الصفحة':'Breadcrumb')+'"><ol><li><a href="'+route('index',lang)+'">'+(i?'الرئيسية':'Home')+'</a></li><li aria-current="page">'+pageLabels[name][i]+'</li></ol></nav>');
  const meta=(attrs)=>$('head').append($('<meta>').attr(attrs));
  $('head').append($('<link>').attr({rel:'canonical',href:url}));
  for(const [l,h] of [['en','en'],['ar','ar-EG'],['en','x-default']])$('head').append($('<link>').attr({rel:'alternate',hreflang:h,href:origin+route(name,l)}));
  meta({name:'robots',content:indexable?'index,follow,max-image-preview:large':'noindex,follow'});
  meta({property:'og:type',content:'website'});meta({property:'og:site_name',content:'Pop Up'});meta({property:'og:title',content:titles[name][i]});meta({property:'og:description',content:descriptions[name][i]});meta({property:'og:url',content:url});meta({property:'og:locale',content:i?'ar_EG':'en_EG'});meta({property:'og:locale:alternate',content:i?'en_EG':'ar_EG'});
  meta({property:'og:image',content:origin+'/assets/social-preview.jpg'});meta({property:'og:image:width',content:'1200'});meta({property:'og:image:height',content:'630'});meta({property:'og:image:alt',content:i?'صورة توضيحية لغسيل سيارة عند البيت':'Illustrative at-home mobile car wash scene'});
  meta({name:'twitter:card',content:'summary_large_image'});meta({name:'twitter:title',content:titles[name][i]});meta({name:'twitter:description',content:descriptions[name][i]});meta({name:'twitter:image',content:origin+'/assets/social-preview.jpg'});
  for(const [key,env] of [['google-site-verification','GOOGLE_SITE_VERIFICATION'],['msvalidate.01','BING_SITE_VERIFICATION']]){const token=process.env[env];if(token)meta({name:key,content:token});}
  meta({name:'theme-color',content:'#0B1F3B'});
  $('link[rel=icon]').attr('href','/assets/favicon.png');
  $('img[src="/assets/popup-logo.png"]').attr('src','/assets/popup-logo.webp');
  const hero=$('.hero-media img');hero.attr({src:'/assets/home-service-1024.webp',srcset:'/assets/home-service-640.webp 640w, /assets/home-service-1024.webp 1024w, /assets/home-service-1536.webp 1536w',sizes:'(max-width: 850px) 100vw, 55vw',alt:i?'صورة توضيحية لعامل يغسل سيارة أمام البيت بجانب عربية الخدمة المجهزة':'Illustrative mobile wash van and worker washing a car outside a home',decoding:'async'});
  const lh=$('<a>').attr({id:'language',href:route(name,i?'en':'ar'),lang:i?'en':'ar',hreflang:i?'en':'ar-EG','aria-label':i?'Switch to English':'التبديل إلى العربية'}).text(i?'English':'العربية');$('#language').replaceWith(lh);
  $('a[data-book]').each((_,el)=>{const a=$(el),key=a.attr('data-book');if(!messages[lang][key])throw Error('Unknown booking message '+key);a.attr({href:`https://wa.me/${number}?text=${encodeURIComponent(messages[lang][key])}`,target:'_blank',rel:'noopener noreferrer'});});
  if(!$('.footer-policies').length)$('footer').append(`<nav class="footer-policies" aria-label="${i?'الدعم والسياسات':'Support and policies'}"><a href="/support.html">${i?'الدعم':'Support'}</a><a href="/privacy.html">${i?'سياسة الخصوصية':'Privacy policy'}</a><a href="/terms.html">${i?'شروط الخدمة':'Terms of service'}</a></nav>`);
  $('a[href]').each((_,el)=>{const a=$(el),href=a.attr('href');if(a.attr('id')==='language'||!href.startsWith('/')||href.startsWith('//')||href.startsWith('/assets'))return;const [part,hash]=href.split('#');const target=part==='/'?'index':part.replace(/^\/ar\//,'/').replace(/^\//,'').replace(/\.html$/,'');if(names.includes(target))a.attr('href',route(target,lang)+(hash?'#'+hash:''));});
  $('.coverage-jump').attr('aria-label',i?'دليل مناطق الخدمة':'Service area guide');
  $('.price small').text(i?'جنيه':'EGP');$('.plans').attr('aria-label',i?'باقات الغسيل':'Wash packages');$('header nav').attr('aria-label',i?'التنقل الرئيسي':'Main navigation');$('#theme-toggle').attr('aria-label',i?'الوضع الداكن':'Dark mode');$('#year').text(new Date().getFullYear());
  const graph=[{'@type':'Organization','@id':origin+'/#business',name:'Pop Up',alternateName:'بوب اب',url:origin,logo:origin+'/assets/popup-logo.webp',telephone:'+201010023147',areaServed:[{'@type':'City',name:'Sheikh Zayed City'},{'@type':'City',name:'6th of October City'}],contactPoint:{'@type':'ContactPoint',telephone:'+201010023147',contactType:'customer support',availableLanguage:['Arabic','English'],url:'https://wa.me/201010023147'}},{'@type':'WebSite','@id':origin+'/#website',url:origin,name:'Pop Up',inLanguage:['en','ar'],publisher:{'@id':origin+'/#business'}},{'@type':'WebPage','@id':url+'#page',url,name:titles[name][i],description:descriptions[name][i],inLanguage:lang,isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#business'}}];
  // A service-area operation has no supplied public shop address; do not invent a LocalBusiness location.
  graph[0].alternateName=['Pop Up Wash','بوب اب'];
  graph[0].description=i?'خدمة غسيل سيارات متنقلة عند البيت في الشيخ زايد ومدينة ٦ أكتوبر، مصر.':'Mobile car washing at home in Sheikh Zayed and 6th of October, Egypt.';
  if(['index','services','service-areas'].includes(name)){
   const serviceId=url+'#service';
   graph.push({'@type':'Service','@id':serviceId,name:i?'غسيل سيارات متنقل عند البيت':'At-home mobile car wash',description:descriptions[name][i],serviceType:i?'غسيل داخلي وخارجي والشنطة':'Interior, exterior and trunk car washing',provider:{'@id':origin+'/#business'},areaServed:graph[0].areaServed,url,availableChannel:{'@type':'ServiceChannel',serviceUrl:'https://wa.me/'+number,availableLanguage:['Arabic','English']}});
   graph.find(item=>item['@type']==='WebPage').mainEntity={'@id':serviceId};
  }
  if(name!=='index'&&pageLabels[name]){const id=url+'#breadcrumb';graph.push({'@type':'BreadcrumbList','@id':id,itemListElement:[{'@type':'ListItem',position:1,name:i?'الرئيسية':'Home',item:origin+route('index',lang)},{'@type':'ListItem',position:2,name:pageLabels[name][i],item:url}]});graph.find(item=>item['@type']==='WebPage').breadcrumb={'@id':id};}
  const qs=$('.faq details').map((_,el)=>({'@type':'Question',name:$(el).find('summary').text().replace(/[+−–]\s*$/,'').trim(),acceptedAnswer:{'@type':'Answer',text:$(el).find('p').text().trim()}})).get();if(qs.length)graph.push({'@type':'FAQPage','@id':url+'#faq',mainEntity:qs});
  $('head').append(`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`);
  $('body').append('<script src="/analytics.js" defer></script>');
  await writeFile(join(out,lang==='ar'?'ar':'',name+'.html'),$.html());
 }
}
// Replace any previous generated pricing pages with noindex redirect fallbacks.
// Vercel also serves temporary HTTP redirects for these routes.
for(const name of hiddenPages)for(const lang of ['en','ar']){
 const home=route('index',lang),label=lang==='ar'?'العودة للرئيسية':'Back to home';
 await writeFile(join(out,lang==='ar'?'ar':'',name+'.html'),`<!doctype html><html lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${home}"><title>Pop Up</title></head><body><a href="${home}">${label}</a></body></html>`);
}
const urls=names.flatMap(n=>['en','ar'].map(l=>origin+route(n,l)));
await writeFile(join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+names.flatMap(n=>['en','ar'].map(l=>'<url><loc>'+escape(origin+route(n,l))+'</loc>'+[['en','en'],['ar','ar-EG'],['en','x-default']].map(([lang,code])=>'<xhtml:link rel="alternate" hreflang="'+code+'" href="'+escape(origin+route(n,lang))+'"/>').join('')+'</url>')).join('')+'</urlset>');
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
const err=load(await readFile(join(out,'support.html'),'utf8'));err('title').text('Page not found | Pop Up');err('meta[name=robots]').attr('content','noindex,follow');err('link[rel=canonical],link[hreflang],script[type="application/ld+json"]').remove();err('main').html('<section class="about-hero wrap"><h1>Page not found.</h1><p>This page may have moved. Visit our homepage or contact us for help.</p><div class="actions"><a class="button" href="/">Home</a><a class="text-link" href="/support.html">Get support</a></div></section>');await writeFile(join(out,'404.html'),err.html());
await writeFile(join(out,'build-info.json'),JSON.stringify({origin,indexable,analytics,pages:urls.length},null,2));
console.log(`Built ${urls.length} localized pages for ${origin}. Indexing: ${indexable}. Analytics production bundle: ${analytics}.`);
