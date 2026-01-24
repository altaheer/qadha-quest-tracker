import { useState, useEffect } from 'react';

interface HijriDate {
  day: number;
  month: string;
  monthAr: string;
  year: number;
  formatted: string;
  formattedAr: string;
}

const hijriMonths = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: 'Rabi\' al-Awwal', ar: 'ربيع الأول' },
  { en: 'Rabi\' al-Thani', ar: 'ربيع الثاني' },
  { en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  { en: 'Rajab', ar: 'رجب' },
  { en: 'Sha\'ban', ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: 'Dhu al-Qi\'dah', ar: 'ذو القعدة' },
  { en: 'Dhu al-Hijjah', ar: 'ذو الحجة' },
];

// Simple Hijri date calculation (approximate)
function gregorianToHijri(date: Date): { day: number; month: number; year: number } {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  // Julian Day Number calculation
  const a = Math.floor((14 - gregorianMonth) / 12);
  const y = gregorianYear + 4800 - a;
  const m = gregorianMonth + 12 * a - 3;
  const jdn = gregorianDay + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Convert JDN to Hijri
  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const remainder = l - 10631 * n + 354;
  const j = Math.floor((10985 - remainder) / 5316) * Math.floor((50 * remainder) / 17719) +
            Math.floor(remainder / 5670) * Math.floor((43 * remainder) / 15238);
  const adjustedRemainder = remainder - Math.floor((30 - j) / 15) * 
                           Math.floor((17719 * j) / 50) - Math.floor(j / 16) * 
                           Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * adjustedRemainder) / 709);
  const hijriDay = adjustedRemainder - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return { day: hijriDay, month: hijriMonth, year: hijriYear };
}

export function useHijriDate(): HijriDate | null {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);

  useEffect(() => {
    const today = new Date();
    const hijri = gregorianToHijri(today);
    const monthData = hijriMonths[hijri.month - 1] || hijriMonths[0];

    setHijriDate({
      day: hijri.day,
      month: monthData.en,
      monthAr: monthData.ar,
      year: hijri.year,
      formatted: `${hijri.day} ${monthData.en} ${hijri.year} AH`,
      formattedAr: `${hijri.day} ${monthData.ar} ${hijri.year}`,
    });
  }, []);

  return hijriDate;
}
