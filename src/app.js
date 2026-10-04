const messages={
  "en": {
    "zayed": "Hi Pop Up! I would like to book a mobile car wash at home in Sheikh Zayed. Can I send my location to confirm coverage and appointments?",
    "october": "Hi Pop Up! I would like to book an at-home car wash in 6th of October City. Can I send my location to confirm coverage and appointments?",
    "general": "Hi Pop Up! I would like to book an at-home car wash. Could you share the available appointments and booking details?",
    "single": "Hi Pop Up! I would like to book a single at-home car wash for EGP 450, including the interior, exterior and trunk. What appointments are available?",
    "two": "Hi Pop Up! I would like to subscribe to the 2 washes per month plan for EGP 750 per month. Could you share the subscription details and available appointments?",
    "four": "Hi Pop Up! I would like to subscribe to the 4 washes per month plan, one wash per week, for EGP 1,000 for the first month, then EGP 1,400 per month. How can I arrange my first wash?",
    "eight": "Hi Pop Up! I would like to subscribe to the 8 washes per month plan, two washes per week, for EGP 1,800 for the first month, then EGP 2,500 per month. How can I arrange my first wash?",
    "coverage": "Hi Pop Up! I would like to check whether your mobile car wash covers my location. Can I send you my location to confirm?",
    "monthly": "Hi Pop Up! I am interested in a monthly car wash subscription. Could you explain the 2, 4 and 8 washes per month plans and their prices?",
    "planHelp": "Hi Pop Up! I would like help choosing between a single wash and a monthly subscription. Which option would suit me?",
    "contact": "Hi Pop Up! I have a question about your at-home car wash service. Could you help me?",
    "support": "Hi Pop Up! I need help with a booking or a car wash visit. Could I speak with your support team?",
    "privacy": "Hi Pop Up! I have a question or request about my personal information and your privacy policy. Could you help me?",
    "terms": "Hi Pop Up! I have a question about your service terms before booking. Could you clarify them for me?"
  },
  "ar": {
    "zayed": "أهلًا بوب اب! حابب أحجز غسيل عربية عند البيت في الشيخ زايد. ممكن أبعت اللوكيشن للتأكد من التغطية والمواعيد؟",
    "october": "أهلًا بوب اب! حابب أحجز غسيل عربية عند البيت في مدينة ٦ أكتوبر. ممكن أبعت اللوكيشن للتأكد من التغطية والمواعيد؟",
    "general": "أهلًا بوب اب! حابب أحجز غسيل للعربية عند البيت. ممكن أعرف المواعيد المتاحة وتفاصيل الحجز؟",
    "single": "أهلًا بوب اب! حابب أحجز غسلة واحدة عند البيت بـ٤٥٠ جنيه، تشمل الداخل والخارج والشنطة. إيه المواعيد المتاحة؟",
    "two": "أهلًا بوب اب! حابب أشترك في باقة غسلتين في الشهر بـ٧٥٠ جنيه شهريًا. ممكن أعرف تفاصيل الاشتراك والمواعيد المتاحة؟",
    "four": "أهلًا بوب اب! حابب أشترك في باقة ٤ غسلات في الشهر، غسلة كل أسبوع، بـ١٠٠٠ جنيه لأول شهر وبعد كده ١٤٠٠ جنيه شهريًا. إزاي نحدد معاد أول غسلة؟",
    "eight": "أهلًا بوب اب! حابب أشترك في باقة ٨ غسلات في الشهر، غسلتين كل أسبوع، بـ١٨٠٠ جنيه لأول شهر وبعد كده ٢٥٠٠ جنيه شهريًا. إزاي نحدد معاد أول غسلة؟",
    "coverage": "أهلًا بوب اب! حابب أتأكد إن خدمة الغسيل المتنقل بتوصل لمنطقتي. ممكن أبعتلكم اللوكيشن عشان نتأكد؟",
    "monthly": "أهلًا بوب اب! مهتم باشتراك شهري لغسيل العربية. ممكن أعرف تفاصيل وأسعار باقات غسلتين و٤ و٨ غسلات في الشهر؟",
    "planHelp": "أهلًا بوب اب! محتاج مساعدة أختار بين غسلة واحدة واشتراك شهري. ممكن تساعدوني أختار الأنسب ليا؟",
    "contact": "أهلًا بوب اب! عندي استفسار عن خدمة غسيل العربية عند البيت. ممكن تساعدوني؟",
    "support": "أهلًا بوب اب! محتاج مساعدة بخصوص حجز أو زيارة غسيل. ممكن أتواصل مع فريق الدعم؟",
    "privacy": "أهلًا بوب اب! عندي استفسار أو طلب بخصوص بياناتي الشخصية وسياسة الخصوصية. ممكن تساعدوني؟",
    "terms": "أهلًا بوب اب! عندي استفسار عن شروط الخدمة قبل الحجز. ممكن توضحولي التفاصيل؟"
  }
};
const number=window.POPUP_CONFIG?.whatsappNumber||'';
if(number&&!/^20\d{10}$/.test(number))throw new Error('Use an Egyptian WhatsApp number: 20 followed by 10 digits.');
const dialog=document.querySelector('dialog'),languageButton=document.querySelector('#language');
let language=document.documentElement.lang==='ar'?'ar':'en',selected='general',engine;
// Each language has a crawlable URL; saved preference never overrides that URL.
function syncThemeButton(){const b=document.querySelector('#theme-toggle');if(!b)return;const dark=document.documentElement.dataset.theme==='dark';b.setAttribute('aria-pressed',String(dark));b.setAttribute('aria-label',language==='ar'?'الوضع الداكن':'Dark mode');b.title=language==='ar'?(dark?'تفعيل الوضع الفاتح':'تفعيل الوضع الداكن'):(dark?'Switch to light mode':'Switch to dark mode');}
function applyLanguage(){
 syncThemeButton();
 document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-en][data-ar]').forEach(el=>el.textContent=el.dataset[language]);
 languageButton.textContent=language==='en'?'العربية':'English';languageButton.lang=language==='en'?'ar':'en';languageButton.setAttribute('aria-label',language==='en'?'Switch to Arabic':'التبديل إلى الإنجليزية');
 const packageRegion=document.querySelector('.plans');if(packageRegion)packageRegion.setAttribute('aria-label',language==='en'?'Wash packages':'باقات الغسيل');
 document.querySelectorAll('.price small').forEach(el=>el.textContent=language==='en'?'EGP':'جنيه');
 document.querySelector('nav').setAttribute('aria-label',language==='en'?'Main navigation':'التنقل الرئيسي');
 const heroImage=document.querySelector('.hero-media img');if(heroImage)heroImage.alt=language==='ar'?'مشهد توضيحي لغسيل عربية عند البيت':'Illustrative scene of a car being washed at home';
 document.querySelectorAll('[data-book]').forEach(a=>{if(number){a.href=`https://wa.me/${number}?text=${encodeURIComponent(messages[language][a.dataset.book])}`;a.target='_blank';a.rel='noopener noreferrer'}});
 document.querySelector('#booking-message').value=messages[language][selected];
 engine?.layout();
}
languageButton.addEventListener('click',()=>{try{localStorage.setItem('popup-language',language==='en'?'ar':'en')}catch{}if(location.hash)languageButton.hash=location.hash;});
applyLanguage();
document.querySelectorAll('[data-book]').forEach(a=>a.addEventListener('click',event=>{if(number)return;event.preventDefault();selected=a.dataset.book;document.querySelector('#booking-message').value=messages[language][selected];document.querySelector('#copy-status').textContent='';dialog.showModal();}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
document.querySelector('#copy-message').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#booking-message').value);document.querySelector('#copy-status').textContent=language==='ar'?'تم نسخ رسالة الاستفسار.':'Enquiry copied.'}catch{document.querySelector('#booking-message').select();document.querySelector('#copy-status').textContent=language==='ar'?'حدد الرسالة وانسخها يدويًا.':'Select the enquiry and copy it manually.'}});
document.querySelector('#year').textContent=new Date().getFullYear();
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const journey=document.querySelector('.journey'),hero=document.querySelector('.hero');
function setupMotion(){engine?.destroy();engine=undefined;if(!motion.matches&&window.ScrollCraft)engine=ScrollCraft.mount(document);updateMotion();}
let queued=false;
function updateMotion(){queued=false; document.querySelectorAll(".story-steps article").forEach(el=>{const rect=el.getBoundingClientRect();el.classList.toggle("is-current",rect.top<innerHeight*.65 && rect.bottom>innerHeight*.25)});
 if(journey){const world=journey.querySelector('.route-world'),travel=Math.max(0,world.clientWidth-(innerWidth<=850?190:290));journey.style.setProperty('--travel',travel+'px');const rect=journey.getBoundingClientRect();const p=motion.matches?1:Math.min(1,Math.max(0,-rect.top/Math.max(1,rect.height-innerHeight)));journey.style.setProperty('--journey-p',p);journey.style.setProperty('--arrived',Math.min(1,Math.max(0,(p-.85)/.15)));journey.querySelectorAll('[data-step]').forEach((el,i)=>{el.classList.toggle('active',i===Math.min(2,Math.floor(p*3)));el.style.opacity=motion.matches?'1':(i<=Math.floor(p*3)?'1':'.55')});}
 if(hero){const rect=hero.getBoundingClientRect(),p=Math.min(1,Math.max(0,-rect.top/rect.height));const reduced=motion.matches;hero.querySelector('.hero-media').style.transform=reduced?'none':`translateY(${p*(innerWidth<850?25:80)}px) scale(${1+p*.04})`;hero.querySelector('.hero-content').style.transform=reduced?'none':`translateY(${-p*65}px)`;hero.querySelector('.hero-outline').style.transform=reduced?'none':`scale(${1.02-p*.055})`;hero.style.setProperty('--wave-p',reduced?0:Math.min(1,Math.max(0,scrollY/Math.max(1,rect.height+rect.top+scrollY))));}
}
function requestMotion(){if(!queued){queued=true;requestAnimationFrame(updateMotion)}}
window.addEventListener('scroll',requestMotion,{passive:true});window.addEventListener('resize',requestMotion,{passive:true});motion.addEventListener('change',setupMotion);setupMotion();



const reviewsSection=document.querySelector('#testimonials');
if(reviewsSection){
 let reviewsVisible=false;
 const syncReviews=()=>reviewsSection.classList.toggle('reviews-offscreen',!reviewsVisible||document.hidden);
 const reviewObserver=new IntersectionObserver(entries=>{reviewsVisible=entries[0].isIntersecting;syncReviews()});
 reviewObserver.observe(reviewsSection);
 document.addEventListener('visibilitychange',syncReviews);
 const reviewWindow=reviewsSection.querySelector('.review-window');
 reviewWindow?.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')reviewWindow.focus({preventScroll:true})});
}

document.querySelector('#theme-toggle')?.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('popup-theme',next)}catch{}syncThemeButton();});

document.querySelectorAll('[data-social]').forEach(a=>{const url=window.POPUP_CONFIG?.[a.dataset.social+'Url'];if(url&&/^https:\/\//.test(url)){a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.removeAttribute('aria-disabled');a.removeAttribute('title')}});
