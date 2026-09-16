(()=>{'use strict';
const JOURNEY_KEY='pinal_boost_journey_v1';
const PLAN_KEY='pinal_boost_rapid_skill_mobility_v4';
const JOB_KEY='boost48JobSearchV11';
const MODULE='jobsearch';
const read=(k,fb={})=>{try{return JSON.parse(localStorage.getItem(k)||'null')||fb}catch{return fb}};
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function mobilityEvidence(){
 const j=read(JOURNEY_KEY,{}),m=j.modules?.skillmobility;
 if(m?.confirmedSkills?.length)return m;
 const p=read(PLAN_KEY,{});
 return p?.confirmedSkills?.length?p:null;
}
function rankedSkills(src){
 const raw=(src?.confirmedSkills||[]).map((x,i)=>({label:String(typeof x==='string'?x:(x?.label||'')).trim(),i})).filter(x=>x.label);
 const freq=new Map();
 for(const c of src?.selectedCareers||[]){for(const label of c?.skills?.transfer||[]){const k=norm(label);if(k)freq.set(k,(freq.get(k)||0)+1)}}
 const seen=new Set();
 return raw.filter(x=>{const k=norm(x.label);if(!k||seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>(freq.get(norm(b.label))||0)-(freq.get(norm(a.label))||0)||a.i-b.i).map(x=>x.label);
}
function addCarryForwardNote(inputs,filled,total){
 if(!inputs.length||document.getElementById('boostMobilitySkillsNote'))return;
 const note=document.createElement('div');note.id='boostMobilitySkillsNote';note.className='preview';note.style.margin='8px 0 2px';
 if(filled>0)note.innerHTML=`<strong>Carried forward from Skill Mobility:</strong> ${filled} confirmed skill area${filled===1?'':'s'} ${filled===1?'was':'were'} added to your inventory. BOOST prioritized skills that also transferred into the careers you researched. Keep, edit, or replace them for the jobs you are targeting now.`;
 else note.innerHTML=`<strong>Skill Mobility evidence available:</strong> BOOST found ${total} confirmed skill area${total===1?'':'s'}, but your saved 48-Hour Job Search inventory was already filled in, so it was left unchanged.`;
 inputs[2]?.insertAdjacentElement('afterend',note);
}
function prefillSkills(){
 const src=mobilityEvidence();if(!src)return;
 const candidates=rankedSkills(src);if(!candidates.length)return;
 const inputs=[...document.querySelectorAll('input[data-list="skills"]')].sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));if(!inputs.length)return;
 const used=new Set(inputs.map(x=>norm(x.value)).filter(Boolean));let filled=0;
 for(const input of inputs){if(input.value.trim())continue;const next=candidates.find(x=>!used.has(norm(x)));if(!next)break;input.value=next;used.add(norm(next));input.dispatchEvent(new Event('input',{bubbles:true}));filled++}
 addCarryForwardNote(inputs,filled,candidates.length);
}
function saveJobSearchJourney(){
 const job=read(JOB_KEY,null);if(!job?.completed)return;
 const j=read(JOURNEY_KEY,{}),now=new Date().toISOString();j.schema_version=Math.max(Number(j.schema_version)||0,2);j.region=j.region||'Pinal County';j.modules=j.modules||{};j.progress=j.progress||{};
 j.modules[MODULE]={module:MODULE,source:'boost_48_hour_job_search',version:12,completedAt:now,targetRole:String(job.values?.targetRole||'').trim()||null,skills:(job.lists?.skills||[]).filter(Boolean),accomplishments:(job.lists?.accomplishments||[]).filter(Boolean),targetEmployers:(job.lists?.employers||[]).filter(Boolean),contacts:(job.lists?.contacts||[]).filter(Boolean),phases:job.phases||{},activities:job.activities||{},commitment:String(job.values?.commitment||'').trim()||null};
 j.progress[MODULE]='complete';j.updated_at=now;localStorage.setItem(JOURNEY_KEY,JSON.stringify(j));
}
function install(){
 setTimeout(prefillSkills,40);
 const finish=document.querySelector('[data-finish]');if(finish)finish.addEventListener('click',()=>setTimeout(saveJobSearchJourney,180));
 if(read(JOB_KEY,{}).completed)saveJobSearchJourney();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();