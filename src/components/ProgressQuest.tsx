import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useTranslation } from '@/lib/i18n';
import { progressCopy } from '@/lib/progressCopy';
import { localeFor } from '@/lib/date';
import { haptics } from '@/lib/haptics';

export function ProgressQuest() {
 const p = useProgress(); const { lang } = useTranslation(); const c = progressCopy[lang];
 const reduced = useReducedMotion();
 const tasks = [
  { label: c.prayers, count: p.current.prayers, target: 5, href: '/prayers', xp: 25 },
  { label: c.habit, count: p.current.habits, target: 3, href: '/habits', xp: 10 },
  { label: c.qadha, count: p.current.qadha, target: p.goal, href: '/qadha', xp: null },
 ];
 return <section className="overflow-hidden rounded-3xl border border-emerald-300/30 bg-card shadow-md" aria-label={c.title}>
  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-5 text-white">
   <div aria-hidden className="absolute -right-8 -top-10 h-40 w-40 rounded-full border-[20px] border-white/5" />
   <div className="relative flex items-center justify-between gap-4">
    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-200"><Sparkles size={14}/>{c.lab}</span>
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{p.totalXP.toLocaleString(localeFor(lang))} XP</span>
   </div>
   <h2 className="relative mt-5 font-display text-2xl font-semibold">{c.title}</h2>
   <p className="mt-1 text-sm text-emerald-100/75">{c.intro}</p>
   <div className="mt-6 flex items-center gap-3">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/40 bg-amber-300/15 text-2xl font-bold text-amber-200">{p.level}</span>
    <div className="flex-1"><div className="mb-2 flex justify-between text-xs"><span>{c.level} {p.level}</span><span className="text-emerald-100/75">{150 - p.levelXP} {c.next}</span></div>
     <div role="progressbar" aria-label={c.level} aria-valuenow={p.levelXP} aria-valuemin={0} aria-valuemax={150} className="h-3 overflow-hidden rounded-full bg-black/20">
      <motion.div initial={false} animate={{width: `${p.levelXP / 150 * 100}%`}} transition={{duration: reduced ? 0 : .6}} className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-100"/>
     </div>
    </div>
   </div>
  </div>
  <div className="space-y-5 p-5">
   <div><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Zap size={16} className="text-amber-600"/>{c.quests}</h3>
    <div className="space-y-2">{tasks.map(task => {
     const done = task.count >= task.target;
     return <Link key={task.href} to={task.href} className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${done ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-border hover:bg-muted/60'}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-emerald-700 text-white' : 'bg-muted text-muted-foreground'}`}>{done ? <Check size={18}/> : <Flame size={18}/>}</span>
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{task.label}</p><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{width: `${Math.min(100, task.count/task.target*100)}%`}}/></div></div>
      <span className="text-sm font-semibold tabular-nums">{done ? c.done : `${task.count}/${task.target}`}</span><ArrowUpRight size={14} className="text-muted-foreground"/>
     </Link>;
    })}</div>
   </div>
   <div className="flex items-end gap-4"><div className="flex-1"><p className="mb-3 text-xs font-semibold text-muted-foreground">{c.week}</p><div className="flex h-16 items-end gap-1.5">{p.week.map(day => <div key={day.date} className="flex h-full flex-1 flex-col justify-end gap-1 text-center"><div title={`${day.date}: ${day.xp} XP`} className="min-h-1 rounded-md bg-emerald-600/75 transition-all duration-500" style={{height: `${Math.max(5,day.xp/Math.max(100,...p.week.map(d=>d.xp))*100)}%`}}/><span className="text-[10px] text-muted-foreground">{new Date(`${day.date}T12:00:00`).toLocaleDateString(localeFor(lang),{weekday:'narrow'})}</span></div>)}</div></div>
    <div className="w-28 rounded-2xl bg-amber-500/10 p-3"><Trophy size={18} className="mb-2 text-amber-600"/><p className="text-xl font-semibold">{p.qadhaTotal}<span className="text-xs text-muted-foreground"> / {p.milestone}</span></p><p className="mt-1 text-[11px] text-muted-foreground">{c.madeUp}</p></div>
   </div>
   <p className="text-xs text-muted-foreground">{p.totalXP === 0 ? c.empty : c.reset}</p>
   <p className="border-t border-border pt-3 text-[10px] leading-relaxed text-muted-foreground">{c.note}</p>
  </div>
 </section>;
}

export function ProgressReward() {
 const p = useProgress(); const { lang } = useTranslation(); const c = progressCopy[lang];
 const previous = useRef({xp:p.totalXP,level:p.level,qadha:p.qadhaTotal});
 const [reward,setReward] = useState<{xp:number;level:boolean;milestone:boolean}|null>(null);
 const reduced = useReducedMotion();
 useEffect(() => {
  const old = previous.current;
  previous.current = {xp:p.totalXP,level:p.level,qadha:p.qadhaTotal};
  if (p.totalXP <= old.xp) return;
  setReward({xp:p.totalXP-old.xp,level:p.level>old.level,milestone:[5,10,25,50,100,250,500,1000].some(n=>old.qadha<n&&p.qadhaTotal>=n)});
  haptics.strong();
 },[p.totalXP,p.level,p.qadhaTotal]);
 useEffect(()=> { if(!reward)return; const id=window.setTimeout(()=>setReward(null),2800);return()=>window.clearTimeout(id); },[reward]);
 return <AnimatePresence>{reward && <motion.div role="status" aria-live="polite" initial={{opacity:0,y:reduced?0:20,scale:reduced?1:.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0}} className="pointer-events-none fixed inset-x-5 bottom-24 z-[100] mx-auto flex max-w-sm items-center gap-4 rounded-2xl border border-amber-300/40 bg-emerald-950 p-4 text-white shadow-xl">
  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-300/20 text-amber-200"><Trophy/></span><div className="flex-1"><p className="font-semibold">{reward.level?c.levelUp:reward.milestone?c.milestone:c.feedback}</p><p className="text-xs text-emerald-100">{c.level} {p.level}</p></div><strong className="text-xl text-amber-200">+{reward.xp} XP</strong>
 </motion.div>}</AnimatePresence>;
}
