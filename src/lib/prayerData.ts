import type { PrayerEntry, DailyPrayers, PrayerSunnah } from '@/types';

const defaultPrayerEntry: PrayerEntry = { status: 'pending' };

export const defaultDailyPrayers: DailyPrayers = {
  fajr: { ...defaultPrayerEntry },
  dhuhr: { ...defaultPrayerEntry },
  asr: { ...defaultPrayerEntry },
  maghrib: { ...defaultPrayerEntry },
  isha: { ...defaultPrayerEntry },
};

export const createDefaultSunnah = (): PrayerSunnah => ({
  fajr: [
    { id: 'fajr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'fajr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'fajr-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتا الفجر', completed: false },
    { id: 'fajr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'fajr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'fajr-tahlil10', name: '10× La ilaha illa Allah', arabicName: 'التهليل عشرًا', completed: false },
    { id: 'fajr-ajirni7', name: '7× Allahumma ajirni min an-nar', arabicName: 'اللهم أجرني من النار', completed: false },
    { id: 'fajr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  dhuhr: [
    { id: 'dhuhr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'dhuhr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'dhuhr-sunnah-before', name: '2-4 Rak\'at before', arabicName: 'ركعات قبلية', completed: false },
    { id: 'dhuhr-sunnah-after', name: '2-4 Rak\'at after', arabicName: 'ركعات بعدية', completed: false },
    { id: 'dhuhr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'dhuhr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'dhuhr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  asr: [
    { id: 'asr-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'asr-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'asr-sunnah-before', name: '4 Rak\'at before Asr', arabicName: 'أربع ركعات قبل العصر', completed: false },
    { id: 'asr-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'asr-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'asr-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  maghrib: [
    { id: 'maghrib-siwak', name: 'Siwāk', arabicName: 'السواك', completed: false },
    { id: 'maghrib-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'maghrib-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'maghrib-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'maghrib-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'maghrib-tahlil10', name: '10× La ilaha illa Allah', arabicName: 'التهليل عشرًا', completed: false },
    { id: 'maghrib-ajirni7', name: '7× Allahumma inni as\'aluka al-jannah', arabicName: 'اللهم إني أسألك الجنة', completed: false },
    { id: 'maghrib-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
  isha: [
    { id: 'isha-siwak', name: 'Siwāk', arabicName: 'السواک', completed: false },
    { id: 'isha-adhan', name: 'Answer Adhān', arabicName: 'إجابة الأذان', completed: false },
    { id: 'isha-sunnah', name: '2 Rak\'at Sunnah', arabicName: 'ركعتان بعدية', completed: false },
    { id: 'isha-witr', name: 'Witr prayer', arabicName: 'صلاة الوتر', completed: false },
    { id: 'isha-tasbih', name: '33× Subhanallah · Alhamdulillah · Allahu Akbar', arabicName: 'التسبيح بعد الصلاة', completed: false },
    { id: 'isha-kursi', name: 'Āyat al-Kursī', arabicName: 'آية الكرسي', completed: false },
    { id: 'isha-dua', name: 'Du\'ā\' after prayer', arabicName: 'الدعاء بعد الصلاة', completed: false },
  ],
});

