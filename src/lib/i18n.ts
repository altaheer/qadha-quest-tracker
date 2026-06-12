import { useSyncExternalStore, useCallback, useEffect } from 'react';

export type Language = 'en' | 'sv' | 'tr' | 'ar';

export type Translations = {
  nav: { home: string; prayers: string; qadha: string; habits: string; insights: string; calendar: string; settings: string; more: string };
  prayers: { title: string; subtitle: string; backfillMode: string; backfillDesc: string; combo: string; comboLabel: string; multiplier: string; streak: string; bestStreak: string; empty: string; jumpToToday: string; previous: string; next: string; today: string; tapForToday: string };
  prayerNames: { fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string };
  status: { pending: string; onTime: string; jamaah: string; late: string; missed: string };
  qadha: { title: string; subtitle: string; dailyGoal: string; daysToComplete: string; totalRemaining: string; empty: string; resetAll: string; timeEstimate: string; perDay: string; total: string; daysNeeded: string; duration: string; completion: string };
  habits: { title: string; subtitle: string; level: string; easy: string; medium: string; hard: string; sahabah: string; custom: string; morning: string; evening: string; sleep: string; daily: string; paused: string; selectLevel: string; pointsToday: string; completed: string; active: string; pauseHint: string; activateHint: string; timeBound: string };
  habitCategoryNames: Record<string, string>;
  habitNames: Record<string, string>;
  insights: { title: string; subtitle: string; streak: string; bestDay: string; quran: string; weekly: string; punctuality: string; heatmap: string; balance: string; burndown: string; wheel: string; empty: string; heatmapTip: string; achievements: string; unlockedCount: string };
  calendar: { title: string; gregorian: string; hijri: string; today: string };
  settings: { title: string; subtitle: string; language: string; notifications: string; backup: string; restore: string; darkMode: string; appearance: string; appearanceDesc: string; theme: string; showArabic: string; showArabicDesc: string; dataMgmt: string; dataMgmtDesc: string; dataInfo: string; dataInfoDesc: string; export: string; import: string; resetOnboarding: string; resetOnboardingDone: string; autoMissed: string; autoMissedDesc: string; autoMissedTime: string; autoMissedTimeDesc: string };
  common: { save: string; cancel: string; done: string; skip: string; next: string; back: string; close: string; loading: string; getStarted: string };
  onboarding: { step1Title: string; step1Desc: string; step2Title: string; step2Desc: string; step3Title: string; step3Desc: string; dontKnow: string; step: string; autoMissedNote: string; editLaterNote: string };
  fab: { markFajr: string; addQadha: string; logHabit: string; quickActions: string };
  combo: { onFire: string; firstTimeTitle: string; firstTimeDesc: string };
  hadith: { source: string; fadl: string; comingSoon: string };
  missions: { title: string; subtitle: string; newMission: string; iIntendTo: string; for: string; days: string; begin: string; active: string; completed: string; endedTitle: string; accepted: string; endedEarly: string; tryAgain: string; bonus: string; missesUsed: string; remaining: string; allFive: string; onTime: string; inJamaah: string; custom: string; allowingUpTo: string; misses: string };
};


const en: Translations = {
  nav: { home: 'Home', prayers: 'Prayers', qadha: 'Qadha', habits: 'Habits', insights: 'Insights', calendar: 'Calendar', settings: 'Settings', more: 'More' },
  prayers: { title: "Today's Prayers", subtitle: 'Mark your obligatory prayers and sunnah', backfillMode: 'Backfill mode', backfillDesc: 'Prayers marked "Missed" auto-add to Qadha.', combo: 'Combo', comboLabel: 'prayers in a row', multiplier: 'Multiplier', streak: 'Streak', bestStreak: 'Best', empty: 'Start your day with Fajr ☀️', jumpToToday: 'Back to today', previous: 'Previous day', next: 'Next day', today: 'Today', tapForToday: 'Tap to go to today' },
  prayerNames: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  status: { pending: 'Pending', onTime: 'On Time', jamaah: 'Jamaah', late: 'Late', missed: 'Missed' },
  qadha: { title: 'Qadha Prayers', subtitle: 'Track your missed prayers', dailyGoal: 'Daily Goal', daysToComplete: 'Days to complete', totalRemaining: 'Total remaining', empty: 'You have no Qadha prayers to make up, mashaAllah!', resetAll: 'Reset all counters', timeEstimate: 'Time Estimate', perDay: 'Prayers per day', total: 'Total Qadha', daysNeeded: 'Days Needed', duration: 'Estimated Duration', completion: 'Expected Completion' },
  habits: { title: 'Daily Habits', subtitle: 'Tap the pause icon to grey out habits you don\'t want to track', level: 'Level', easy: 'Easy', medium: 'Medium', hard: 'Hard', sahabah: 'Sahabah', custom: 'Custom', morning: 'Morning', evening: 'Evening', sleep: 'Sleep', daily: 'Daily', paused: 'Paused', selectLevel: 'Select level (template)', pointsToday: 'Points today', completed: 'Completed', active: 'active', pauseHint: 'Pause this habit', activateHint: 'Activate this habit', timeBound: 'Time-bound deeds' },
  habitCategoryNames: { morning: 'Morning routine', evening: 'Evening routine', sleep: 'Before sleep', daily: 'During the day', sahabah: 'Sahabah level', mealtime: 'Mealtime', home: 'Home', bathroom: 'Bathroom', misc: 'Miscellaneous' },
  habitNames: {
    'morning-adhkar': 'Morning adhkār', 'wake-dua': 'Waking duʿāʾ', 'wake-siwak': 'Siwāk on waking',
    'evening-adhkar': 'Evening adhkār',
    'sleep-wudu': 'Wudu before sleep', 'sleep-kursi': 'Āyat al-Kursī', 'sleep-mulk': 'Sūrah Al-Mulk',
    'sleep-3quls': '3 Quls', 'sleep-baqarah': 'Last 2 verses of Al-Baqarah', 'sleep-dua': 'Sleep duʿāʾ', 'sleep-right': 'Sleep on right side',
    'duha': 'Duha prayer', 'bismillah': 'Bismillah before eating', 'right-hand': 'Eat with right hand', 'smile': 'Smile at others',
    'tahajjud-prep': 'Intention for Tahajjud', 'quran-daily': 'Daily Quran reading (min 1 page)',
    'istighfar-100': '100x Istighfar', 'salawat-100': '100x Salawat on the Prophet ﷺ',
    'sadaqah-daily': 'Daily sadaqah', 'dua-parents': 'Duʿāʾ for parents',
    'dua-after-eating': 'Du\'a after eating',
    'dua-leave-home': 'Du\'a when leaving home', 'dua-enter-home': 'Du\'a when entering home',
    'dua-before-bathroom': 'Du\'a before entering', 'dua-after-bathroom': 'Du\'a after leaving',
    'misc-salaam': 'Say salaam', 'misc-gaze': 'Lower your gaze',
    'misc-speech': 'Speak good or remain silent', 'misc-parents': 'Respect parents in word and tone',
    'misc-husn': 'Think well of others', 'misc-harm': 'Remove harm from the path',
    'misc-water': 'Do not waste water', 'misc-walk': 'Walk humbly',
    'misc-bismillah-all': 'Begin every action with Bismillah',
  },
  insights: { title: 'Insights', subtitle: 'Your spiritual progress', streak: 'Current Streak', bestDay: 'Best Day', quran: 'Quran Pages', weekly: 'Weekly Overview', punctuality: 'Punctuality per Prayer', heatmap: 'Iman Heatmap', balance: 'Prayer Balance', burndown: 'Qadha Burndown', wheel: 'Spiritual Wheel', empty: 'Log prayers for a few days to see your statistics', heatmapTip: 'Darker green = more points that day. Each square is one day.', achievements: 'Achievements', unlockedCount: 'unlocked' },
  calendar: { title: 'Calendar', gregorian: 'Gregorian', hijri: 'Hijri', today: 'Today' },
  settings: { title: 'Settings', subtitle: 'Manage your app and data', language: 'Language', notifications: 'Notifications', backup: 'Backup Data', restore: 'Restore Data', darkMode: 'Dark Mode', appearance: 'Appearance', appearanceDesc: 'Theme and display options', theme: 'Theme', showArabic: 'Show Arabic names', showArabicDesc: 'Display Arabic transliteration under prayers and habits', dataMgmt: 'Data management', dataMgmtDesc: 'Export and import your data', dataInfo: 'Your data', dataInfoDesc: 'Information about data storage', export: 'Export data', import: 'Import data', resetOnboarding: 'Reset onboarding', resetOnboardingDone: 'Onboarding reset – reload the app', autoMissed: 'Auto-mark missed prayers', autoMissedDesc: 'Any prayer left unmarked is moved to Qadha after the day ends.', autoMissedTime: 'Day reset time', autoMissedTimeDesc: 'When the previous day closes and unmarked prayers become missed.' },
  common: { save: 'Save', cancel: 'Cancel', done: 'Done', skip: 'Skip', next: 'Next', back: 'Back', close: 'Close', loading: 'Loading...', getStarted: 'Get Started' },
  onboarding: { step1Title: 'Welcome to Qadha Companion', step1Desc: 'Track your prayers, habits, and spiritual growth', step2Title: 'Set your Qadha', step2Desc: 'How many missed prayers do you need to make up?', step3Title: 'Choose your level', step3Desc: 'Select Easy, Medium, Hard, or Sahabah mode', dontKnow: "I don't know yet", step: 'Step', autoMissedNote: 'Unmarked prayers will be moved to Qadha at this time each night. You can change this later in Settings.', editLaterNote: 'Forgot to mark a prayer you actually prayed? Open that day in Prayers and update it.' },
  fab: { markFajr: 'Mark Fajr', addQadha: 'Add Qadha', logHabit: 'Log habit', quickActions: 'Quick actions' },
  combo: { onFire: 'On fire!', firstTimeTitle: 'Combo started!', firstTimeDesc: 'Pray on time or in jamaah in a row to grow your combo and earn bonus points.' },
  hadith: { source: 'Source', fadl: 'Benefit', comingSoon: 'More info coming soon' },
  missions: { title: 'Missions', subtitle: 'A personal commitment, written and witnessed', newMission: 'New mission', iIntendTo: 'I intend to', for: 'for', days: 'days', begin: 'Begin — Bismillah', active: 'Active missions', completed: 'Completed', endedTitle: 'Ended', accepted: 'May Allah accept it', endedEarly: 'Ended early — your intention was written', tryAgain: 'Try again', bonus: 'Bonus', missesUsed: 'misses used', remaining: 'remaining', allFive: 'all 5 prayers', onTime: 'on time', inJamaah: 'in jamaah', custom: 'custom' },
};


const sv: Translations = {
  nav: { home: 'Hem', prayers: 'Böner', qadha: 'Qadha', habits: 'Vanor', insights: 'Insikter', calendar: 'Kalender', settings: 'Inställningar', more: 'Mer' },
  prayers: { title: 'Dagens böner', subtitle: 'Markera dina obligatoriska böner och sunnah', backfillMode: 'Backfill-läge', backfillDesc: 'Böner markerade som "Missad" läggs automatiskt till i Qadha.', combo: 'Combo', comboLabel: 'böner i rad', multiplier: 'Multiplikator', streak: 'Streak', bestStreak: 'Bästa', empty: 'Börja din dag med Fajr ☀️', jumpToToday: 'Tillbaka till idag', previous: 'Föregående dag', next: 'Nästa dag', today: 'Idag', tapForToday: 'Tryck för att gå till idag' },
  prayerNames: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  status: { pending: 'Väntar', onTime: 'I tid', jamaah: 'Jamaah', late: 'Sent', missed: 'Missad' },
  qadha: { title: 'Qadha böner', subtitle: 'Håll koll på dina missade böner', dailyGoal: 'Dagligt mål', daysToComplete: 'Dagar kvar', totalRemaining: 'Totalt kvar', empty: 'Du har inga Qadha-böner att ta igen, mashaAllah!', resetAll: 'Återställ alla räknare', timeEstimate: 'Tidsuppskattning', perDay: 'Böner per dag', total: 'Totalt Qadha', daysNeeded: 'Dagar behövs', duration: 'Uppskattad tid', completion: 'Förväntad klar' },
  habits: { title: 'Dagliga vanor', subtitle: 'Tryck på paus-ikonen för att gråa ut vanor du inte vill spåra just nu', level: 'Nivå', easy: 'Easy', medium: 'Medium', hard: 'Hard', sahabah: 'Sahabah', custom: 'Custom', morning: 'Morgon', evening: 'Kväll', sleep: 'Sömn', daily: 'Dagligt', paused: 'Pausad', selectLevel: 'Välj nivå (mall)', pointsToday: 'Dagens poäng', completed: 'Avklarade', active: 'aktiva', pauseHint: 'Pausa denna vana', activateHint: 'Aktivera denna vana', timeBound: 'Tidsbundna gärningar' },
  habitCategoryNames: { morning: 'Morgonrutiner', evening: 'Kvällsrutiner', sleep: 'Innan sömn', daily: 'Under dagen', sahabah: 'Sahabah-nivå', mealtime: 'Mältid', home: 'Hem', bathroom: 'Badrum', misc: 'Övrigt' },
  habitNames: {
    'morning-adhkar': 'Morgon-adhkār', 'wake-dua': 'Vakna-duʿāʾ', 'wake-siwak': 'Siwāk vid uppvaknande',
    'evening-adhkar': 'Kvälls-adhkār',
    'sleep-wudu': 'Wudu före sömn', 'sleep-kursi': 'Āyat al-Kursī', 'sleep-mulk': 'Sūrah Al-Mulk',
    'sleep-3quls': '3 Quls', 'sleep-baqarah': 'Sista 2 verserna Al-Baqarah', 'sleep-dua': 'Sova-duʿāʾ', 'sleep-right': 'Sova på höger sida',
    'duha': 'Duha-bön', 'bismillah': 'Bismillah före mat', 'right-hand': 'Äta med höger hand', 'smile': 'Le mot andra',
    'tahajjud-prep': 'Intention för Tahajjud', 'quran-daily': 'Daglig Quran-läsning (min 1 sida)',
    'istighfar-100': '100x Istighfar', 'salawat-100': '100x Salawat på Profeten ﷺ',
    'sadaqah-daily': 'Daglig sadaqah', 'dua-parents': 'Duʿāʾ för föräldrar',
    'dua-after-eating': 'Dua efter mat',
    'dua-leave-home': 'Dua vid hemgång', 'dua-enter-home': 'Dua vid hemkomst',
    'dua-before-bathroom': 'Dua innan toaletten', 'dua-after-bathroom': 'Dua efter toaletten',
    'misc-salaam': 'Säg salaam', 'misc-gaze': 'Sänk blicken',
    'misc-speech': 'Tala gott eller tig', 'misc-parents': 'Respektera föräldrar',
    'misc-husn': 'Tänk väl om andra', 'misc-harm': 'Avlägsna hinder från vägen',
    'misc-water': 'Slösa inte vatten', 'misc-walk': 'Gå ödmjukt',
    'misc-bismillah-all': 'Börja varje handling med Bismillah',
  },
  insights: { title: 'Insikter', subtitle: 'Din spirituella utveckling', streak: 'Nuvarande streak', bestDay: 'Bästa dag', quran: 'Quran-sidor', weekly: 'Veckokollen', punctuality: 'Punktlighet per bön', heatmap: 'Iman-heatmap', balance: 'Böne-balansen', burndown: 'Qadha Burn-down', wheel: 'Spirituellt hjul', empty: 'Logga böner i några dagar för att se din statistik', heatmapTip: 'Mörkare grönt = fler poäng den dagen. Varje ruta är en dag.', achievements: 'Prestationer', unlockedCount: 'upplåsta' },
  calendar: { title: 'Kalender', gregorian: 'Gregoriansk', hijri: 'Hijri', today: 'Idag' },
  settings: { title: 'Inställningar', subtitle: 'Hantera din app och data', language: 'Språk', notifications: 'Aviseringar', backup: 'Säkerhetskopiera', restore: 'Återställ', darkMode: 'Mörkt läge', appearance: 'Utseende', appearanceDesc: 'Tema och visningsalternativ', theme: 'Tema', showArabic: 'Visa arabiska namn', showArabicDesc: 'Visa arabisk translitterering under böner och vanor', dataMgmt: 'Datahantering', dataMgmtDesc: 'Exportera och importera din data', dataInfo: 'Din data', dataInfoDesc: 'Information om datalagring', export: 'Exportera data', import: 'Importera data', resetOnboarding: 'Återställ onboarding', resetOnboardingDone: 'Onboarding återställd – ladda om appen', autoMissed: 'Markera missade böner automatiskt', autoMissedDesc: 'Böner som inte markerats flyttas till Qadha när dagen är slut.', autoMissedTime: 'Tid för dagsskifte', autoMissedTimeDesc: 'När gårdagen stängs och omarkerade böner blir missade.' },
  common: { save: 'Spara', cancel: 'Avbryt', done: 'Klar', skip: 'Hoppa över', next: 'Nästa', back: 'Tillbaka', close: 'Stäng', loading: 'Laddar...', getStarted: 'Kom igång' },
  onboarding: { step1Title: 'Välkommen till Qadha Companion', step1Desc: 'Spåra dina böner, vanor och andliga utveckling', step2Title: 'Sätt din Qadha', step2Desc: 'Hur många missade böner behöver du ta igen?', step3Title: 'Välj din nivå', step3Desc: 'Välj Easy, Medium, Hard eller Sahabah-läge', dontKnow: 'Jag vet inte än', step: 'Steg', autoMissedNote: 'Omarkerade böner flyttas till Qadha vid denna tid varje natt. Du kan ändra detta senare i Inställningar.', editLaterNote: 'Glömde du markera en bön du faktiskt bad? Öppna den dagen i Böner och uppdatera den.' },
  fab: { markFajr: 'Markera Fajr', addQadha: 'Lägg till Qadha', logHabit: 'Logga vana', quickActions: 'Snabbåtgärder' },
  combo: { onFire: 'On fire!', firstTimeTitle: 'Combo startad!', firstTimeDesc: 'Be i tid eller i jamaah i rad för att öka din combo och få bonuspoäng.' },
  hadith: { source: 'Källa', fadl: 'Förtjänst', comingSoon: 'Mer info kommer snart' },
  missions: { title: 'Uppdrag', subtitle: 'Ett personligt åtagande, nedskrivet och bevittnat', newMission: 'Nytt uppdrag', iIntendTo: 'Jag har för avsikt att', for: 'i', days: 'dagar', begin: 'Börja — Bismillah', active: 'Aktiva uppdrag', completed: 'Avklarade', endedTitle: 'Avslutade', accepted: 'Må Allah acceptera det', endedEarly: 'Avslutades tidigt — din avsikt skrevs', tryAgain: 'Försök igen', bonus: 'Bonus', missesUsed: 'missar använda', remaining: 'kvar', allFive: 'alla 5 böner', onTime: 'i tid', inJamaah: 'i jamaah', custom: 'eget' },
};


const tr: Translations = {
  nav: { home: 'Ana Sayfa', prayers: 'Namazlar', qadha: 'Kaza', habits: 'Alışkanlıklar', insights: 'İstatistikler', calendar: 'Takvim', settings: 'Ayarlar', more: 'Daha Fazla' },
  prayers: { title: 'Günün Namazları', subtitle: 'Farz ve sünnet namazlarını işaretle', backfillMode: 'Geriye dönük mod', backfillDesc: '"Kaçırıldı" işaretlenen namazlar otomatik olarak Kaza\'ya eklenir.', combo: 'Kombo', comboLabel: 'arka arkaya namaz', multiplier: 'Çarpan', streak: 'Seri', bestStreak: 'En iyi', empty: 'Güne Sabah namazıyla başla ☀️', jumpToToday: 'Bugüne dön', previous: 'Önceki gün', next: 'Sonraki gün', today: 'Bugün', tapForToday: 'Bugüne gitmek için dokun' },
  prayerNames: { fajr: 'Sabah', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
  status: { pending: 'Bekliyor', onTime: 'Vaktinde', jamaah: 'Cemaat', late: 'Geç', missed: 'Kaçırıldı' },
  qadha: { title: 'Kaza Namazları', subtitle: 'Kaçırdığın namazları takip et', dailyGoal: 'Günlük Hedef', daysToComplete: 'Tamamlama süresi (gün)', totalRemaining: 'Toplam kalan', empty: 'Kaza edecek namazın yok, maşaAllah!', resetAll: 'Tüm sayaçları sıfırla', timeEstimate: 'Süre Tahmini', perDay: 'Günde namaz', total: 'Toplam Kaza', daysNeeded: 'Gerekli gün', duration: 'Tahmini süre', completion: 'Beklenen bitiş' },
  habits: { title: 'Günlük Alışkanlıklar', subtitle: 'Takip etmek istemediğin alışkanlıkları duraklat simgesiyle gri yapabilirsin', level: 'Seviye', easy: 'Kolay', medium: 'Orta', hard: 'Zor', sahabah: 'Sahabe', custom: 'Özel', morning: 'Sabah', evening: 'Akşam', sleep: 'Uyku', daily: 'Günlük', paused: 'Duraklatıldı', selectLevel: 'Seviye seç (şablon)', pointsToday: 'Bugünkü puan', completed: 'Tamamlanan', active: 'aktif', pauseHint: 'Bu alışkanlığı duraklat', activateHint: 'Bu alışkanlığı etkinleştir', timeBound: 'Zamana bağlı ameller' },
  habitCategoryNames: { morning: 'Sabah rutini', evening: 'Akşam rutini', sleep: 'Uyumadan önce', daily: 'Gün içinde', sahabah: 'Sahabe seviyesi', mealtime: 'Yemek Vakti', home: 'Ev', bathroom: 'Banyo', misc: 'Çeşitli' },
  habitNames: {
    'morning-adhkar': 'Sabah zikirleri', 'wake-dua': 'Uyanma duası', 'wake-siwak': 'Uyanınca misvak',
    'evening-adhkar': 'Akşam zikirleri',
    'sleep-wudu': 'Uyumadan önce abdest', 'sleep-kursi': 'Âyetü\'l-Kürsî', 'sleep-mulk': 'Mülk Sûresi',
    'sleep-3quls': '3 Kul (Muavvizat)', 'sleep-baqarah': 'Bakara\'nın son 2 ayeti', 'sleep-dua': 'Uyku duası', 'sleep-right': 'Sağ tarafa yatarak uyumak',
    'duha': 'Kuşluk namazı', 'bismillah': 'Yemekten önce Bismillah', 'right-hand': 'Sağ elle yemek', 'smile': 'Başkalarına gülümsemek',
    'tahajjud-prep': 'Teheccüd niyeti', 'quran-daily': 'Günlük Kuran okuma (en az 1 sayfa)',
    'istighfar-100': '100x İstiğfar', 'salawat-100': 'Peygamber\'e ﷺ 100x salavat',
    'sadaqah-daily': 'Günlük sadaka', 'dua-parents': 'Anne-baba için dua',
    'dua-after-eating': 'Yemekten sonra dua',
    'dua-leave-home': 'Evden çıkarken dua', 'dua-enter-home': 'Eve girerken dua',
    'dua-before-bathroom': 'Tuvaletten önce dua', 'dua-after-bathroom': 'Tuvaletten sonra dua',
    'misc-salaam': 'Selam ver', 'misc-gaze': 'Gözlerini koru',
    'misc-speech': 'İyi konuş ya da sus', 'misc-parents': 'Anne babaya saygı',
    'misc-husn': 'İyi zan besle', 'misc-harm': 'Yoldan eziyet veren şeyi kaldır',
    'misc-water': 'Su israf etme', 'misc-walk': 'Alçakgönüllü yürü',
    'misc-bismillah-all': 'Her işe Bismillah ile başla',
  },
  insights: { title: 'İstatistikler', subtitle: 'Manevi gelişimin', streak: 'Mevcut seri', bestDay: 'En iyi gün', quran: 'Kuran sayfası', weekly: 'Haftalık genel', punctuality: 'Namaza göre dakiklik', heatmap: 'İman ısı haritası', balance: 'Namaz dengesi', burndown: 'Kaza azalması', wheel: 'Manevi çark', empty: 'İstatistiklerini görmek için birkaç gün namaz kaydı tut', heatmapTip: 'Daha koyu yeşil = o gün daha çok puan. Her kare bir gündür.', achievements: 'Başarımlar', unlockedCount: 'açıldı' },
  calendar: { title: 'Takvim', gregorian: 'Miladi', hijri: 'Hicri', today: 'Bugün' },
  settings: { title: 'Ayarlar', subtitle: 'Uygulamanı ve verini yönet', language: 'Dil', notifications: 'Bildirimler', backup: 'Yedekle', restore: 'Geri yükle', darkMode: 'Koyu mod', appearance: 'Görünüm', appearanceDesc: 'Tema ve görüntü seçenekleri', theme: 'Tema', showArabic: 'Arapça isimleri göster', showArabicDesc: 'Namaz ve alışkanlıkların altında Arapça çeviriyi göster', dataMgmt: 'Veri yönetimi', dataMgmtDesc: 'Verini dışa ve içe aktar', dataInfo: 'Verin', dataInfoDesc: 'Veri depolama hakkında bilgi', export: 'Veriyi dışa aktar', import: 'Veriyi içe aktar', resetOnboarding: 'Tanıtımı sıfırla', resetOnboardingDone: 'Tanıtım sıfırlandı – uygulamayı yeniden yükle', autoMissed: 'Kaçırılan namazları otomatik işaretle', autoMissedDesc: 'İşaretlenmemiş namazlar gün bittiğinde Kazaya eklenir.', autoMissedTime: 'Gün sıfırlama saati', autoMissedTimeDesc: 'Önceki gün kapanır ve işaretlenmemiş namazlar kaçırılmış sayılır.' },
  common: { save: 'Kaydet', cancel: 'İptal', done: 'Tamam', skip: 'Atla', next: 'İleri', back: 'Geri', close: 'Kapat', loading: 'Yükleniyor...', getStarted: 'Başla' },
  onboarding: { step1Title: 'Qadha Companion\'a hoş geldin', step1Desc: 'Namazlarını, alışkanlıklarını ve manevi gelişimini takip et', step2Title: 'Kaza\'nı belirle', step2Desc: 'Kaç tane kaçırılmış namazın var?', step3Title: 'Seviyeni seç', step3Desc: 'Kolay, Orta, Zor veya Sahabe modunu seç', dontKnow: 'Henüz bilmiyorum', step: 'Adım', autoMissedNote: 'İşaretlenmemiş namazlar her gece bu saatte Kazaya eklenir. Bunu daha sonra Ayarlardan değiştirebilirsin.', editLaterNote: 'Aslında kıldığın bir namazı işaretlemeyi mi unuttun? Namazlar sayfasından o günü açıp güncelle.' },
  fab: { markFajr: 'Sabah namazını işaretle', addQadha: 'Kaza ekle', logHabit: 'Alışkanlık kaydet', quickActions: 'Hızlı işlemler' },
  combo: { onFire: 'Ateş gibi!', firstTimeTitle: 'Kombo başladı!', firstTimeDesc: 'Vaktinde ya da cemaatle arka arkaya kıl, kombo büyüsün, bonus puan kazan.' },
  hadith: { source: 'Kaynak', fadl: 'Faydası', comingSoon: 'Yakında daha fazla bilgi' },
  missions: { title: 'Görevler', subtitle: 'Yazıya dökülmüş kişisel bir niyet', newMission: 'Yeni görev', iIntendTo: 'Niyet ediyorum', for: 'boyunca', days: 'gün', begin: 'Başla — Bismillah', active: 'Aktif görevler', completed: 'Tamamlanan', endedTitle: 'Sonlandı', accepted: 'Allah kabul etsin', endedEarly: 'Erken bitti — niyetin yazıldı', tryAgain: 'Tekrar dene', bonus: 'Bonus', missesUsed: 'kaçırma hakkı', remaining: 'kaldı', allFive: '5 vakit namaz', onTime: 'vaktinde', inJamaah: 'cemaatle', custom: 'özel' },
};


const ar: Translations = {
  nav: { home: 'الرئيسية', prayers: 'الصلوات', qadha: 'القضاء', habits: 'العادات', insights: 'الإحصاءات', calendar: 'التقويم', settings: 'الإعدادات', more: 'المزيد' },
  prayers: { title: 'صلوات اليوم', subtitle: 'سجّل صلواتك الفريضة والسنن', backfillMode: 'وضع التعويض', backfillDesc: 'الصلوات المعلّمة "فائتة" تُضاف تلقائياً إلى القضاء.', combo: 'سلسلة', comboLabel: 'صلوات متتالية', multiplier: 'المضاعِف', streak: 'سلسلة', bestStreak: 'الأفضل', empty: 'ابدأ يومك بصلاة الفجر ☀️', jumpToToday: 'العودة إلى اليوم', previous: 'اليوم السابق', next: 'اليوم التالي', today: 'اليوم', tapForToday: 'اضغط للعودة إلى اليوم' },
  prayerNames: { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' },
  status: { pending: 'قيد الانتظار', onTime: 'في الوقت', jamaah: 'جماعة', late: 'متأخر', missed: 'فائت' },
  qadha: { title: 'صلوات القضاء', subtitle: 'تابع صلواتك الفائتة', dailyGoal: 'الهدف اليومي', daysToComplete: 'أيام للإكمال', totalRemaining: 'المجموع المتبقي', empty: 'ليس لديك صلوات قضاء، ما شاء الله!', resetAll: 'إعادة ضبط جميع العدّادات', timeEstimate: 'تقدير الوقت', perDay: 'صلوات في اليوم', total: 'مجموع القضاء', daysNeeded: 'الأيام المطلوبة', duration: 'المدة المقدّرة', completion: 'الإنجاز المتوقع' },
  habits: { title: 'العادات اليومية', subtitle: 'اضغط على أيقونة الإيقاف لتعطيل العادات التي لا تريد متابعتها', level: 'المستوى', easy: 'سهل', medium: 'متوسط', hard: 'صعب', sahabah: 'الصحابة', custom: 'مخصّص', morning: 'الصباح', evening: 'المساء', sleep: 'النوم', daily: 'يومي', paused: 'متوقف', selectLevel: 'اختر المستوى (قالب)', pointsToday: 'نقاط اليوم', completed: 'المنجَز', active: 'نشطة', pauseHint: 'إيقاف هذه العادة', activateHint: 'تفعيل هذه العادة', timeBound: 'أعمال موقوتة' },
  habitCategoryNames: { morning: 'روتين الصباح', evening: 'روتين المساء', sleep: 'قبل النوم', daily: 'خلال اليوم', sahabah: 'مستوى الصحابة', mealtime: 'وقت الطعام', home: 'المنزل', bathroom: 'الحمام', misc: 'متفرقات' },
  habitNames: {
    'morning-adhkar': 'أذكار الصباح', 'wake-dua': 'دعاء الاستيقاظ', 'wake-siwak': 'السواك عند الاستيقاظ',
    'evening-adhkar': 'أذكار المساء',
    'sleep-wudu': 'الوضوء قبل النوم', 'sleep-kursi': 'آية الكرسي', 'sleep-mulk': 'سورة الملك',
    'sleep-3quls': 'المعوذات الثلاث', 'sleep-baqarah': 'آخر آيتين من البقرة', 'sleep-dua': 'دعاء النوم', 'sleep-right': 'النوم على الشق الأيمن',
    'duha': 'صلاة الضحى', 'bismillah': 'البسملة قبل الأكل', 'right-hand': 'الأكل باليمين', 'smile': 'التبسم في وجه الآخرين',
    'tahajjud-prep': 'نية قيام الليل', 'quran-daily': 'قراءة القرآن يومياً (صفحة على الأقل)',
    'istighfar-100': '100 استغفار', 'salawat-100': '100 صلاة على النبي ﷺ',
    'sadaqah-daily': 'صدقة يومية', 'dua-parents': 'الدعاء للوالدين',
    'dua-after-eating': 'دعاء بعد الأكل',
    'dua-leave-home': 'دعاء الخروج من المنزل', 'dua-enter-home': 'دعاء الدخول إلى المنزل',
    'dua-before-bathroom': 'دعاء دخول الخلاء', 'dua-after-bathroom': 'دعاء الخروج من الخلاء',
    'misc-salaam': 'إلقاء السلام', 'misc-gaze': 'غض البصر',
    'misc-speech': 'قل خيراً أو اصمت', 'misc-parents': 'بر الوالدين',
    'misc-husn': 'حسن الظن', 'misc-harm': 'إماطة الأذى',
    'misc-water': 'عدم إسراف الماء', 'misc-walk': 'التواضع في المشية',
    'misc-bismillah-all': 'البسملة عند كل عمل',
  },
  insights: { title: 'الإحصاءات', subtitle: 'تقدّمك الروحي', streak: 'السلسلة الحالية', bestDay: 'أفضل يوم', quran: 'صفحات القرآن', weekly: 'النظرة الأسبوعية', punctuality: 'الالتزام بالأوقات لكل صلاة', heatmap: 'خريطة الإيمان', balance: 'توازن الصلوات', burndown: 'تناقص القضاء', wheel: 'العجلة الروحية', empty: 'سجّل صلواتك لبضعة أيام لرؤية الإحصاءات', heatmapTip: 'الأخضر الأغمق = نقاط أكثر في ذلك اليوم. كل مربع يمثّل يوماً.', achievements: 'الإنجازات', unlockedCount: 'مفتوحة' },
  calendar: { title: 'التقويم', gregorian: 'ميلادي', hijri: 'هجري', today: 'اليوم' },
  settings: { title: 'الإعدادات', subtitle: 'إدارة التطبيق والبيانات', language: 'اللغة', notifications: 'الإشعارات', backup: 'نسخ احتياطي', restore: 'استعادة', darkMode: 'الوضع الداكن', appearance: 'المظهر', appearanceDesc: 'إعدادات السمة والعرض', theme: 'السمة', showArabic: 'إظهار الأسماء العربية', showArabicDesc: 'عرض الأسماء العربية تحت الصلوات والعادات', dataMgmt: 'إدارة البيانات', dataMgmtDesc: 'تصدير واستيراد بياناتك', dataInfo: 'بياناتك', dataInfoDesc: 'معلومات عن تخزين البيانات', export: 'تصدير البيانات', import: 'استيراد البيانات', resetOnboarding: 'إعادة تشغيل التعريف', resetOnboardingDone: 'تم إعادة ضبط التعريف – أعد تحميل التطبيق', autoMissed: 'تعليم الصلوات الفائتة تلقائياً', autoMissedDesc: 'أي صلاة لم تُعلَّم تُنقل إلى القضاء عند انتهاء اليوم.', autoMissedTime: 'وقت بداية اليوم', autoMissedTimeDesc: 'الوقت الذي يُغلق فيه اليوم السابق وتُعتبر الصلوات غير المعلَّمة فائتة.' },
  common: { save: 'حفظ', cancel: 'إلغاء', done: 'تم', skip: 'تخطّي', next: 'التالي', back: 'رجوع', close: 'إغلاق', loading: 'جاري التحميل...', getStarted: 'ابدأ' },
  onboarding: { step1Title: 'مرحباً بك في رفيق القضاء', step1Desc: 'تابع صلواتك وعاداتك ونموّك الروحي', step2Title: 'حدّد القضاء', step2Desc: 'كم عدد الصلوات التي تحتاج إلى قضائها؟', step3Title: 'اختر مستواك', step3Desc: 'اختر سهل، متوسط، صعب أو وضع الصحابة', dontKnow: 'لا أعرف بعد', step: 'الخطوة', autoMissedNote: 'الصلوات غير المعلَّمة ستُنقل إلى القضاء في هذا الوقت كل ليلة. يمكنك تغيير ذلك لاحقاً من الإعدادات.', editLaterNote: 'نسيت أن تعلّم صلاة أدّيتها فعلاً؟ افتح ذلك اليوم في الصلوات وحدّثه.' },
  fab: { markFajr: 'سجّل الفجر', addQadha: 'أضف قضاء', logHabit: 'سجّل عادة', quickActions: 'إجراءات سريعة' },
  combo: { onFire: 'مشتعل!', firstTimeTitle: 'بدأت السلسلة!', firstTimeDesc: 'صلّ في الوقت أو في جماعة على التوالي لتنمو سلسلتك وتحصل على نقاط إضافية.' },
  hadith: { source: 'المصدر', fadl: 'الفضل', comingSoon: 'قريباً' },
  missions: { title: 'المهمات', subtitle: 'عهد شخصي مكتوب', newMission: 'مهمة جديدة', iIntendTo: 'نويت أن', for: 'لمدة', days: 'يوماً', begin: 'ابدأ — بسم الله', active: 'المهمات النشطة', completed: 'المكتملة', endedTitle: 'منتهية', accepted: 'تقبل الله', endedEarly: 'انتهت مبكراً — نيتك كُتبت', tryAgain: 'حاول مجدداً', bonus: 'مكافأة', missesUsed: 'أيام فائتة', remaining: 'متبقي', allFive: 'الصلوات الخمس', onTime: 'في الوقت', inJamaah: 'في جماعة', custom: 'مخصص' },
};


export const translations: Record<Language, Translations> = { en, sv, tr, ar };

export const languageLabels: Record<Language, string> = {
  en: 'English',
  sv: 'Svenska',
  tr: 'Türkçe',
  ar: 'العربية',
};

const STORAGE_KEY = 'app-language';

function detectInitial(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && translations[stored]) return stored;
  const nav = navigator.language?.slice(0, 2).toLowerCase();
  if (nav === 'sv' || nav === 'tr' || nav === 'ar' || nav === 'en') return nav as Language;
  return 'en';
}

let currentLanguage: Language = detectInitial();
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentLanguage;
}

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  applyHtmlLangDir(lang);
  listeners.forEach((l) => l());
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function applyHtmlLangDir(lang: Language) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// Apply on first import
applyHtmlLangDir(currentLanguage);

type DeepKey<T, K extends string = ''> = {
  [P in keyof T & string]: T[P] extends object
    ? DeepKey<T[P], `${K}${P}.`>
    : `${K}${P}`;
}[keyof T & string];

export type TKey = DeepKey<Translations>;

function lookup(obj: any, path: string): string {
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return path;
  }
  return typeof cur === 'string' ? cur : path;
}

export function useTranslation() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    applyHtmlLangDir(lang);
  }, [lang]);

  const t = useCallback(
    (key: TKey) => lookup(translations[lang], key as string),
    [lang]
  );

  const dict = translations[lang];
  const tHabit = useCallback(
    (id: string) => dict.habitNames[id] || id,
    [dict]
  );
  const tHabitCategory = useCallback(
    (id: string) => dict.habitCategoryNames[id] || id,
    [dict]
  );

  return { t, lang, setLanguage, isRTL: lang === 'ar', tHabit, tHabitCategory };
}
