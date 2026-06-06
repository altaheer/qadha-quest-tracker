/**
 * Qadha estimation helper.
 *
 * Lets a user estimate how many prayers they owe (qadha) based on:
 *   - the age they became accountable (bulugh)
 *   - the age they began praying consistently
 *   - their current age
 *
 * The gap between bulugh and "started praying consistently" is treated as
 * the period of missed prayers. We deliberately count the full gap (we do
 * NOT subtract scattered prayers the user may have prayed) because the
 * scholarly safer position is to over-estimate qadha rather than under-count.
 * The user can always adjust the numbers down manually afterwards.
 *
 * This is an ESTIMATE, not a religious ruling. The UI shows a disclaimer.
 *
 * Language handling mirrors hadith.ts:
 *   'en' and 'sv' → English text (sv falls back to en)
 *   'tr'          → Turkish text
 *   'ar'          → Arabic text
 */

export interface QadhaEstimateInput {
  bulughAge: number;        // age of accountability, e.g. 13
  startedPrayingAge: number; // age they began praying consistently
  currentAge: number;        // their age now
}

export interface QadhaEstimateResult {
  years: number;             // estimated years of missed prayers
  totalPrayers: number;      // years * 365 * 5 (all five daily prayers)
  perPrayer: number;         // totalPrayers / 5 (count for each prayer type)
}

/**
 * Core calculation.
 * The missed period is from bulugh until they started praying consistently.
 * If startedPrayingAge <= bulughAge, there is no missed period (returns 0).
 */
export function estimateQadha(input: QadhaEstimateInput): QadhaEstimateResult {
  const { bulughAge, startedPrayingAge } = input;

  const missedYears = Math.max(0, startedPrayingAge - bulughAge);
  const daysPerYear = 365;
  const perPrayer = Math.round(missedYears * daysPerYear);
  const totalPrayers = perPrayer * 5;

  return {
    years: missedYears,
    totalPrayers,
    perPrayer,
  };
}

/**
 * UI text for all four languages.
 * sv intentionally falls back to en (same decision as hadith content).
 */
export interface QadhaEstimateStrings {
  title: string;
  intro: string;
  bulughLabel: string;
  bulughHint: string;
  startedLabel: string;
  startedHint: string;
  currentAgeLabel: string;
  calculate: string;
  resultPrefix: string;     // shown before the number, e.g. "Estimated missed prayers:"
  resultPerPrayer: string;  // e.g. "per prayer (Fajr, Dhuhr, ...)"
  applyButton: string;      // "Use this estimate"
  cancelButton: string;
  saferNote: string;        // the "count it all, safer to over-estimate" note
  disclaimer: string;       // "this is an estimate, not a ruling"
}

type Lang = 'en' | 'sv' | 'tr' | 'ar';

const STRINGS: Record<'en' | 'tr' | 'ar', QadhaEstimateStrings> = {
  en: {
    title: 'Help me estimate',
    intro:
      'Not sure how many prayers you owe? Answer a few questions and we will estimate it for you.',
    bulughLabel: 'Age you became accountable (bulugh)',
    bulughHint:
      'The age you reached religious maturity. If unsure, many estimate around 12–15.',
    startedLabel: 'Age you began praying consistently',
    startedHint: 'Roughly when praying became a regular daily habit.',
    currentAgeLabel: 'Your age now',
    calculate: 'Calculate estimate',
    resultPrefix: 'Estimated missed prayers',
    resultPerPrayer: 'for each prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)',
    applyButton: 'Use this estimate',
    cancelButton: 'Cancel',
    saferNote:
      'You likely prayed some prayers during this time. You can estimate and subtract them yourself — but many choose to count it all, to be safe. It is better to pray a few extra than to miss some.',
    disclaimer:
      'This is only an estimate, not a religious ruling. If in doubt, ask a knowledgeable person.',
  },
  tr: {
    title: 'Tahmin etmeme yardım et',
    intro:
      'Kaç namaz borcun olduğundan emin değil misin? Birkaç soruyu yanıtla, senin için tahmin edelim.',
    bulughLabel: 'Sorumlu olduğun yaş (bulûğ)',
    bulughHint:
      'Dinî olarak ergenliğe (bulûğa) eriştiğin yaş. Emin değilsen birçok kişi 12–15 civarı tahmin eder.',
    startedLabel: 'Düzenli namaz kılmaya başladığın yaş',
    startedHint: 'Namazın günlük düzenli bir alışkanlık hâline geldiği yaklaşık yaş.',
    currentAgeLabel: 'Şu anki yaşın',
    calculate: 'Tahmini hesapla',
    resultPrefix: 'Tahmini kaçırılan namaz',
    resultPerPrayer: 'her namaz için (Sabah, Öğle, İkindi, Akşam, Yatsı)',
    applyButton: 'Bu tahmini kullan',
    cancelButton: 'İptal',
    saferNote:
      'Bu süre zarfında muhtemelen bazı namazları kıldın. Bunları kendin tahmin edip çıkarabilirsin — ancak birçok kişi, ihtiyaten hepsini saymayı tercih eder. Birkaç fazla namaz kılmak, bazılarını eksik bırakmaktan daha iyidir.',
    disclaimer:
      'Bu yalnızca bir tahmindir, dinî bir hüküm değildir. Şüphen varsa bilen birine danış.',
  },
  ar: {
    title: 'ساعدني في التقدير',
    intro: 'لست متأكداً من عدد الصلوات التي عليك قضاؤها؟ أجب عن بعض الأسئلة وسنقدّرها لك.',
    bulughLabel: 'سن التكليف (البلوغ)',
    bulughHint: 'السن الذي بلغت فيه. إن لم تكن متأكداً، يقدّره الكثيرون بين 12 و15 عاماً.',
    startedLabel: 'السن الذي بدأت فيه الصلاة بانتظام',
    startedHint: 'تقريباً عندما أصبحت الصلاة عادة يومية منتظمة.',
    currentAgeLabel: 'عمرك الآن',
    calculate: 'احسب التقدير',
    resultPrefix: 'الصلوات الفائتة المقدّرة',
    resultPerPrayer: 'لكل صلاة (الفجر، الظهر، العصر، المغرب، العشاء)',
    applyButton: 'استخدم هذا التقدير',
    cancelButton: 'إلغاء',
    saferNote:
      'من المرجّح أنك صلّيت بعض الصلوات خلال هذه الفترة. يمكنك تقديرها وطرحها بنفسك — لكن كثيرين يختارون عدّها كاملة احتياطاً. أن تصلّي بضع صلوات زائدة خير من أن تفوتك بعضها.',
    disclaimer: 'هذا تقدير فقط وليس فتوى. إن كنت في شك فاسأل أهل العلم.',
  },
};

export function getQadhaStrings(lang: string): QadhaEstimateStrings {
  if (lang === 'tr') return STRINGS.tr;
  if (lang === 'ar') return STRINGS.ar;
  return STRINGS.en; // 'en' and 'sv'
}
