import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { writeStorage } from '@/lib/localStore';
import { defaultDailyPrayers, createDefaultSunnah } from '@/lib/prayerData';
import { getDateString } from '@/lib/date';
import { PRAYER_KEYS } from '@/lib/prayerStats';
import type { PrayerHistory, HabitsHistory } from '@/types';

/** Only compiled into the isolated hosted preview, never the Android build. */
export function ProgressPreview() {
 const [open,setOpen]=useState(()=>import.meta.env.VITE_PROGRESS_PREVIEW === 'true' && !localStorage.getItem('progress-preview-started') && !localStorage.getItem('prayer-history'));
 if(!open)return null;
 const start=(demo:boolean)=>{
  if(demo){
   const history:PrayerHistory={}; const habits:HabitsHistory={};
   for(let i=6;i>=0;i--){const date=new Date();date.setDate(date.getDate()-i);const key=getDateString(date);
    history[key]={prayers:{...defaultDailyPrayers},sunnah:createDefaultSunnah()};
    PRAYER_KEYS.forEach((p,index)=>{history[key].prayers[p]={status:i===0&&index>1?'pending':(i+index)%4===0?'late':'ontime'};});
    habits[key]={'wake-dua':true,'bismillah':true,'morning-adhkar':i%2===0};
   }
   const entries=Array.from({length:4},(_,i)=>{const date=new Date();date.setDate(date.getDate()-4+i);return {id:crypto.randomUUID(),prayer:'fajr',date:getDateString(date),createdAt:+date,undone:false};});
   writeStorage({'prayer-history':JSON.stringify(history),'habits-tracking':JSON.stringify(habits),'qadha-prayer-counts':JSON.stringify({fajr:30,dhuhr:30,asr:30,maghrib:30,isha:30}),'qadha-completions':JSON.stringify(entries),'onboarding-complete':'1','app-language':'sv'});
  }
  localStorage.setItem('progress-preview-started','1');
  if(demo)window.location.href='/';else setOpen(false);
 };
 return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background p-6"><div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-xl"><Sparkles className="mb-5 h-10 w-10 text-primary"/><p className="text-xs font-semibold uppercase tracking-widest text-primary">Ibadah • Progress Lab</p><h1 className="mt-3 font-display text-3xl font-semibold">Känn hur framsteg känns.</h1><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Prova XP, nivåer och små segrar med en fiktiv vecka. Testa att registrera qadha och nå din första milstolpe.</p><button onClick={()=>start(true)} className="mt-6 min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Prova med exempeldata</button><button onClick={()=>start(false)} className="mt-2 min-h-12 w-full rounded-xl px-4 text-sm text-muted-foreground">Börja med en tom app</button><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Den här testlänken har egen data. Ingenting förs över till din vanliga app.</p></div></div>;
}
