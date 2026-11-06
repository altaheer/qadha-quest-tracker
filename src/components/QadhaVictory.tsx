import { Check, Undo2 } from 'lucide-react';
import { useQadhaPrayers } from '@/hooks/useQadhaPrayers';
import { useProgress } from '@/hooks/useProgress';
import { completeQadha, undoQadha } from '@/lib/progress';
import { useTranslation } from '@/lib/i18n';
import { progressCopy } from '@/lib/progressCopy';
import { PRAYER_KEYS } from '@/lib/prayerStats';

export function QadhaVictory() {
 const {counts} = useQadhaPrayers(); const {entries,current,goal}=useProgress();
 const {t,lang}=useTranslation();const c=progressCopy[lang];
 const recent=entries.filter(e=>!e.undone).slice(-3).reverse();
 return <section className="mb-5 rounded-3xl border border-primary/20 bg-primary/5 p-5">
  <div className="mb-2 flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold">{c.record}</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold">{current.qadha}/{goal}</span></div>
  <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{c.recordHint}</p>
  <div className="grid grid-cols-2 gap-2">{PRAYER_KEYS.map(prayer=><button key={prayer} type="button" disabled={!counts[prayer]} onClick={()=>completeQadha(prayer)} className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition active:scale-95 disabled:opacity-30"><span>{t(`prayerNames.${prayer}`)}</span><Check size={16}/></button>)}</div>
  {recent.length>0&&<div className="mt-4 space-y-2 border-t border-border pt-3"><p className="text-xs text-muted-foreground">{c.recent}</p>{recent.map(entry=><div key={entry.id} className="flex items-center justify-between gap-2 text-xs"><span>{t(`prayerNames.${entry.prayer}`)} · {entry.date}</span><button type="button" onClick={()=>undoQadha(entry.id)} className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-primary hover:bg-primary/10"><Undo2 size={13}/>{c.undo}</button></div>)}</div>}
 </section>;
}
