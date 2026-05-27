import { useState, useEffect, useEffect as _useEffect } from 'react';
import { gregorianToHijri, hijriMonths } from '@/lib/hijri';

interface HijriDateView {
  day: number;
  month: string;
  monthAr: string;
  year: number;
  formatted: string;
  formattedAr: string;
}

export function useHijriDate(): HijriDateView | null {
  const [hijriDate, setHijriDate] = useState<HijriDateView | null>(null);

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
