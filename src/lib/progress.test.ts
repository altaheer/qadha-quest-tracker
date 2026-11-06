import { beforeEach, it, expect } from 'vitest';
import { completeQadha, undoQadha, progressSummary, COMPLETIONS } from './progress';
import { defaultDailyPrayers, createDefaultSunnah } from './prayerData';
import { getTodayString } from './date';
beforeEach(()=>localStorage.clear());
it('logs a completion and debt together, and undo only restores it once',()=>{
 localStorage.setItem('qadha-prayer-counts','{"fajr":1}');
 const id=completeQadha('fajr')!;
 expect(JSON.parse(localStorage.getItem('qadha-prayer-counts')!).fajr).toBe(0);
 expect(completeQadha('fajr')).toBeNull();
 const entries=JSON.parse(localStorage.getItem(COMPLETIONS)!);
 expect(progressSummary({}, {}, entries,getTodayString(),5).totalXP).toBe(30);
 undoQadha(id); undoQadha(id);
 expect(JSON.parse(localStorage.getItem('qadha-prayer-counts')!).fajr).toBe(1);
 expect(progressSummary({}, {},JSON.parse(localStorage.getItem(COMPLETIONS)!),getTodayString(),5).totalXP).toBe(0);
});
it('does not award XP for balance edits or duplicated event IDs',()=>{
 localStorage.setItem('qadha-prayer-counts','{"fajr":50}');
 expect(progressSummary({}, {},[],getTodayString(),5).totalXP).toBe(0);
 completeQadha('fajr'); const entries=JSON.parse(localStorage.getItem(COMPLETIONS)!);
 expect(progressSummary({}, {},[...entries,...entries],getTodayString(),5).totalXP).toBe(30);
});
it('recomputes toggles, grants fixed bonuses, and ignores future entries',()=>{
 const today=getTodayString();
 const history={ [today]:{prayers:{...defaultDailyPrayers,fajr:{status:'ontime' as const}},sunnah:createDefaultSunnah()} };
 expect(progressSummary(history,{},[],today,5).totalXP).toBe(15);
 history[today].prayers.fajr={status:'pending' as never};
 expect(progressSummary(history,{},[],today,5).totalXP).toBe(0);
 expect(progressSummary({}, {'2099-01-01':{test:true}},[],today,5).totalXP).toBe(0);
});
