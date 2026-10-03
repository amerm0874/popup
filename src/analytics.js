import {inject} from '@vercel/analytics';
// Production traffic only. Query strings and anchors may contain user input.
if (__PRODUCTION__ && location.hostname===__SITE_HOST__ && navigator.doNotTrack!=='1' && !navigator.globalPrivacyControl) {
  inject({mode:'production',beforeSend(event){const clean=new URL(event.url);clean.search='';clean.hash='';return {...event,url:clean.href};}});
}
