(()=>{'use strict';
const MODULE='jobsearch';
function params(){const p=new URLSearchParams(location.search);return{returnUrl:p.get('boost_return'),requested:p.get('boost_module'),nonce:p.get('boost_nonce')}}
function validTarget(){const p=params();if(p.requested!==MODULE||!p.returnUrl||!p.nonce)return null;try{const u=new URL(p.returnUrl,location.href);if(u.origin!==location.origin)return null;u.searchParams.set('boost_complete',MODULE);u.searchParams.set('boost_nonce',p.nonce);return u}catch{return null}}
function install(){document.addEventListener('click',e=>{const btn=e.target.closest('#boostSaveReturn');if(!btn)return;const target=validTarget();if(!target)return;e.preventDefault();e.stopImmediatePropagation();window.parent.location.assign(target.toString())},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();