import { useSyncExternalStore, useCallback, useEffect } from 'react';

export type Language = 'en' | 'sv' | 'tr' | 'ar';

/**
 * Everything that explains the app to a new user: the "what's inside" step in
 * onboarding, the level descriptions, the one-time hint shown the first time a
 * screen is opened, and the permanent guide in Settings. Kept in one block so
 * the same sentence is never written twice in two different tones.
 */
type GuideStrings = {
  insideTitle: string;
  insideDesc: string;
  areaPrayers: string;
  areaPrayersDesc: string;
  areaQadha: string;
  areaQadhaDesc: string;
  areaHabits: string;
  areaHabitsDesc: string;
  areaProgress: string;
  areaProgressDesc: string;
  levelWhat: string;
  levelManual: string;
  habitsCount: string;
  levelEasyDesc: string;
  levelMediumDesc: string;
  levelHardDesc: string;
  levelSahabahDesc: string;
  levelCustomDesc: string;
  hintHome: string;
  hintHomeDesc: string;
  hintPrayers: string;
  hintPrayersDesc: string;
  hintQadha: string;
  hintQadhaDesc: string;
  hintHabits: string;
  hintHabitsDesc: string;
  hintMissions: string;
  hintMissionsDesc: string;
  hintInsights: string;
  hintInsightsDesc: string;
  hintCalendar: string;
  hintCalendarDesc: string;
  title: string;
  subtitle: string;
  openGuide: string;
  openGuideDesc: string;
  replayHints: string;
  replayHintsDone: string;
  sectionScreens: string;
  sectionLevels: string;
  sectionData: string;
  dataDesc: string;
};

/**
 * The guided "work out my qadha" flow. These used to live in a private string
 * table inside qadhaEstimate.ts, where Swedish silently fell back to English.
 */
type QadhaSetupStrings = {
  open: string;
  intro: string;
  pubertyQ: string;
  pubertyHint: string;
  startedQ: string;
  startedYes: string;
  startedYesDesc: string;
  startedNo: string;
  startedNoDesc: string;
  whenQ: string;
  whenHint: string;
  resultLabel: string;
  perPrayer: string;
  totalLabel: string;
  menstrualToggle: string;
  menstrualDesc: string;
  menstrualPerMonth: string;
  excludedNote: string;
  saferNote: string;
  disclaimer: string;
  apply: string;
  manual: string;
  month: string;
  year: string;
};

export type Translations = {
  nav: { home: string; prayers: string; qadha: string; habits: string; insights: string; calendar: string; settings: string; more: string };
  home: { subtitle: string; today: string; rightNow: string; dayComplete: string; moreItems: string; sunnahLabel: string; last5days: string; summary: string; remaining: string; active: string };
  prayers: { title: string; subtitle: string; backfillMode: string; backfillDesc: string; combo: string; comboLabel: string; multiplier: string; streak: string; bestStreak: string; empty: string; jumpToToday: string; previous: string; next: string; today: string; tapForToday: string };
  prayerNames: { fajr: string; dhuhr: string; asr: string; maghrib: string; isha: string };
  status: { pending: string; onTime: string; jamaah: string; late: string; missed: string };
  qadha: { title: string; subtitle: string; dailyGoal: string; daysToComplete: string; totalRemaining: string; empty: string; emptyDesc: string; resetAll: string; resetAllConfirm: string; timeEstimate: string; perDay: string; total: string; daysNeeded: string; duration: string; completion: string; byPrayer: string; increase: string; decrease: string; atThisPace: string; noGoal: string };
  sawm: { title: string; subtitle: string; remaining: string; dailyGoal: string; empty: string; emptyDesc: string; increase: string; decrease: string; reset: string; resetConfirm: string; atThisPace: string; daysLeft: string };
  habits: { title: string; subtitle: string; level: string; easy: string; medium: string; hard: string; sahabah: string; custom: string; morning: string; evening: string; sleep: string; daily: string; paused: string; selectLevel: string; pointsToday: string; completed: string; active: string; pauseHint: string; activateHint: string; timeBound: string };
  nafilah: { title: string; subtitle: string; hard: string; medium: string; easy: string };
  nafilahDesc: Record<string, string>;
  timeBoundDesc: Record<string, string>;
  timeBoundNames: Record<string, string>;
  timeBound: { title: string; weekly: string; monthly: string; yearly: string; today: string; upcoming: string };
  insightsLabels: { qadhaRemaining: string; clearIn: string; atCurrentPace: string; setGoal: string; progress: string; yourLevel: string; balanceHint: string; noPrayerData: string; level: string };
  habitCategoryNames: Record<string, string>;
  habitNames: Record<string, string>;
  insights: { title: string; subtitle: string; streak: string; bestDay: string; quran: string; weekly: string; punctuality: string; heatmap: string; balance: string; burndown: string; wheel: string; empty: string; heatmapTip: string; achievements: string; unlockedCount: string };
  calendar: { title: string; gregorian: string; hijri: string; today: string; openInPrayers: string; prayersOnDay: string; habitsOnDay: string };
  settings: { title: string; subtitle: string; language: string; notifications: string; backup: string; restore: string; darkMode: string; appearance: string; appearanceDesc: string; theme: string; showArabic: string; showArabicDesc: string; dataMgmt: string; dataMgmtDesc: string; dataInfo: string; dataInfoDesc: string; export: string; import: string; resetOnboarding: string; resetOnboardingDone: string; restored: string; restoreFailed: string; restoreInvalid: string; clearData: string; clearDataDesc: string; clearDataConfirm: string; clearDataDone: string; autoMissed: string; autoMissedDesc: string; autoMissedTime: string; autoMissedTimeDesc: string; notificationsDesc: string; notificationsEnable: string; notificationsEnabled: string; notificationsDenied: string; notificationsUnsupported: string };
  common: { save: string; cancel: string; done: string; skip: string; next: string; back: string; close: string; loading: string; getStarted: string };
  onboarding: { step1Title: string; step1Desc: string; step2Title: string; step2Desc: string; step3Title: string; step3Desc: string; dontKnow: string; step: string; autoMissedNote: string; editLaterNote: string };
  fab: { markFajr: string; addQadha: string; logHabit: string; quickActions: string };
  combo: { onFire: string; firstTimeTitle: string; firstTimeDesc: string };
  hadith: { source: string; fadl: string; comingSoon: string };
  missions: { title: string; subtitle: string; newMission: string; iIntendTo: string; for: string; days: string; begin: string; active: string; completed: string; endedTitle: string; accepted: string; endedEarly: string; tryAgain: string; bonus: string; missesUsed: string; remaining: string; allFive: string; onTime: string; inJamaah: string; custom: string; allowingUpTo: string; misses: string; verbPray: string; verbDo: string; verbRead: string; verbGive: string; verbSay: string; missedBeforeLose: string; mayMiss: string };
  guide: GuideStrings;
  qadhaSetup: QadhaSetupStrings;
};


const en: Translations = {
  nav: { home: 'Home', prayers: 'Prayers', qadha: 'Qadha', habits: 'Habits', insights: 'Insights', calendar: 'Calendar', settings: 'Settings', more: 'More' },
  home: { subtitle: 'A new day, a new page', today: 'Today', rightNow: 'Right now', dayComplete: 'The day is complete — may Allah accept it', moreItems: '+{n} more', sunnahLabel: 'Sunnah', last5days: 'Last 5 days', summary: 'Summary', remaining: 'remaining', active: 'active' },
  prayers: { title: "Today's Prayers", subtitle: 'Mark your obligatory prayers and sunnah', backfillMode: 'Backfill mode', backfillDesc: 'Prayers marked "Missed" auto-add to Qadha.', combo: 'Combo', comboLabel: 'prayers in a row', multiplier: 'Multiplier', streak: 'Streak', bestStreak: 'Best', empty: 'Start your day with Fajr ☀️', jumpToToday: 'Back to today', previous: 'Previous day', next: 'Next day', today: 'Today', tapForToday: 'Tap to go to today' },
  prayerNames: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  status: { pending: 'Pending', onTime: 'On Time', jamaah: 'Jamaah', late: 'Late', missed: 'Missed' },
  qadha: { title: 'Qadha Prayers', subtitle: 'Track your missed prayers', dailyGoal: 'Daily goal', daysToComplete: 'Days to complete', totalRemaining: 'Total remaining', empty: 'No qadha prayers to make up', emptyDesc: 'Nothing outstanding, mashaAllah. If you owe prayers from before, add them below.', resetAll: 'Reset all counters', resetAllConfirm: 'Set every qadha counter back to zero? This cannot be undone.', byPrayer: 'By prayer', increase: 'Add one to {prayer}', decrease: 'Subtract one from {prayer}', atThisPace: 'At this pace', noGoal: 'Set a daily goal to see an estimate', timeEstimate: 'Time Estimate', perDay: 'Prayers per day', total: 'Total Qadha', daysNeeded: 'Days Needed', duration: 'Estimated Duration', completion: 'Expected Completion' },
  sawm: { title: 'Sawm qadha', subtitle: 'Fasting days left to make up', remaining: 'Days remaining', dailyGoal: 'Daily goal', empty: 'No fasting qadha', emptyDesc: 'Nothing outstanding. Add days below if you owe fasts.', increase: 'Add one day', decrease: 'Subtract one day', reset: 'Reset counter', resetConfirm: 'Set fasting qadha back to zero?', atThisPace: 'At this pace', daysLeft: 'days' },
  habits: { title: 'Daily Habits', subtitle: 'Tap the pause icon to grey out habits you don\'t want to track', level: 'Level', easy: 'Easy', medium: 'Medium', hard: 'Hard', sahabah: 'Sahabah', custom: 'Custom', morning: 'Morning', evening: 'Evening', sleep: 'Sleep', daily: 'Daily', paused: 'Paused', selectLevel: 'Select level (template)', pointsToday: 'Points today', completed: 'Completed', active: 'active', pauseHint: 'Pause this habit', activateHint: 'Activate this habit', timeBound: 'Time-bound deeds' },
  nafilah: { title: 'Voluntary prayers', subtitle: 'Harder prayers are worth more points', hard: 'Harder — takes extra effort', medium: 'Moderate — takes planning', easy: 'Easier — habit-forming' },
  nafilahDesc: { 'tahajjud': 'The night prayer — waking in the middle of the night', 'tasbih': 'The prayer of forgiveness — 300 tasbih within the prayer', 'ishraq': 'After sunrise — staying awake after Fajr', 'duha': 'The forenoon prayer — during working hours', 'awwabin': 'Between Maghrib and Isha', 'istikhara': 'The prayer for guidance or for a need', 'tahiyatul-masjid': 'Greeting the mosque' },
  timeBoundDesc: { 'jumuah': 'The week\u2019s most important prayer, replacing Dhuhr on Fridays', 'fast-monday': 'A sunnah fast the Prophet ﷺ kept regularly', 'fast-thursday': 'A sunnah fast the Prophet ﷺ kept regularly', 'ayyam-al-beed': 'Fasting the 13th, 14th and 15th of each Hijri month', 'ramadan': 'The obligatory fast, from dawn to sunset', 'eid-fitr': 'The festival closing Ramadan', 'arafah': 'Recommended fast for those not on Hajj', 'eid-adha': 'The festival of sacrifice, remembering Ibrahim (as)', 'ashura': 'Fasting in remembrance of Musa\u2019s (as) deliverance' },
  timeBoundNames: { 'jumuah': 'Jumuʿah', 'fast-monday': 'Fasting (Monday)', 'fast-thursday': 'Fasting (Thursday)', 'ayyam-al-beed': 'Ayyām al-Bīḍ (the white days)', 'ramadan': 'Ramadan (fasting)', 'eid-fitr': 'Eid al-Fitr', 'arafah': 'Day of ʿArafah (fasting)', 'eid-adha': 'Eid al-Adha', 'ashura': 'ʿĀshūrāʾ (fasting)' },
  timeBound: { title: 'Time-bound deeds', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly', today: 'Today', upcoming: 'Upcoming' },
  insightsLabels: { qadhaRemaining: 'Kvarstående qadha', clearIn: 'Skuldfri om ca', atCurrentPace: 'med nuvarande takt', setGoal: 'Ställ in ett dagligt qadha-mål för att se en prognos.', progress: 'Framsteg', yourLevel: 'Din nivå', balanceHint: 'Sträva efter en jämn, stor form – det är balanserad ibadah', noPrayerData: 'Ingen böndata ännu', level: 'Nivå' },
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
  calendar: { title: 'Calendar', gregorian: 'Gregorian', hijri: 'Hijri', today: 'Today', openInPrayers: 'Open in Prayers', prayersOnDay: 'Prayers', habitsOnDay: 'Habits done' },
  settings: { title: 'Settings', subtitle: 'Manage your app and data', language: 'Language', notifications: 'Notifications', backup: 'Backup Data', restore: 'Restore Data', darkMode: 'Dark Mode', appearance: 'Appearance', appearanceDesc: 'Theme and display options', theme: 'Theme', showArabic: 'Show Arabic names', showArabicDesc: 'Display Arabic transliteration under prayers and habits', dataMgmt: 'Data management', dataMgmtDesc: 'Export and import your data', dataInfo: 'Your data', dataInfoDesc: 'Information about data storage', export: 'Export data', import: 'Import data', resetOnboarding: 'Reset onboarding', resetOnboardingDone: 'Onboarding reset – reload the app', restored: 'Data restored from your backup', restoreFailed: 'Could not read that file', restoreInvalid: 'That file is not a backup from this app', clearData: 'Erase all data', clearDataDesc: 'Permanently delete everything stored on this device.', clearDataConfirm: 'Erase all prayers, qadha, habits and settings from this device? This cannot be undone — export a backup first if you want to keep it.', clearDataDone: 'All data erased from this device', autoMissed: 'Auto-mark missed prayers', autoMissedDesc: 'Any prayer left unmarked is moved to Qadha after the day ends.', autoMissedTime: 'Day reset time', autoMissedTimeDesc: 'When the previous day closes and unmarked prayers become missed.', notificationsDesc: 'Local reminders near your day-reset time if prayers are still unmarked. Nothing leaves this device.', notificationsEnable: 'Enable notifications', notificationsEnabled: 'Notifications on', notificationsDenied: 'Permission denied — enable it in browser settings', notificationsUnsupported: 'Notifications are not available in this browser' },
  common: { save: 'Save', cancel: 'Cancel', done: 'Done', skip: 'Skip', next: 'Next', back: 'Back', close: 'Close', loading: 'Loading...', getStarted: 'Get Started' },
  onboarding: { step1Title: 'Welcome to Qadha Companion', step1Desc: 'Track your prayers, habits, and spiritual growth', step2Title: 'Set your Qadha', step2Desc: 'How many missed prayers do you need to make up?', step3Title: 'Choose your level', step3Desc: 'Select Easy, Medium, Hard, or Sahabah mode', dontKnow: "I don't know yet", step: 'Step', autoMissedNote: 'Unmarked prayers will be moved to Qadha at this time each night. You can change this later in Settings.', editLaterNote: 'Forgot to mark a prayer you actually prayed? Open that day in Prayers and update it.' },
  fab: { markFajr: 'Mark Fajr', addQadha: 'Add Qadha', logHabit: 'Log habit', quickActions: 'Quick actions' },
  combo: { onFire: 'On fire!', firstTimeTitle: 'Combo started!', firstTimeDesc: 'Pray on time or in jamaah in a row to grow your combo and earn bonus points.' },
  hadith: { source: 'Source', fadl: 'Benefit', comingSoon: 'More info coming soon' },
  missions: { title: 'Missions', subtitle: 'A personal commitment, written and witnessed', newMission: 'New mission', iIntendTo: 'I intend to', for: 'for', days: 'days', begin: 'Begin — Bismillah', active: 'Active missions', completed: 'Completed', endedTitle: 'Ended', accepted: 'May Allah accept it', endedEarly: 'Ended early — your intention was written', tryAgain: 'Try again', bonus: 'Bonus', missesUsed: 'misses used', remaining: 'remaining', allFive: 'all 5 prayers', onTime: 'on time', inJamaah: 'in jamaah', custom: 'custom', allowingUpTo: 'allowing up to', misses: 'misses', verbPray: 'pray', verbDo: 'complete', verbRead: 'read', verbGive: 'give', verbSay: 'say', missedBeforeLose: 'Missed {used} of {allowed} before losing', mayMiss: 'and may miss' },
  guide: {
    insideTitle: "What's inside",
    insideDesc: 'Four things the app keeps track of. You can ignore any of them.',
    areaPrayers: 'The five daily prayers',
    areaPrayersDesc: 'Mark each one as you pray it — on time, in jamaah, late, or missed. Anything marked missed is added to your qadha on its own.',
    areaQadha: 'Qadha, counted down',
    areaQadhaDesc: 'Your outstanding prayers, one counter each. Set how many you make up per day and the app works out when you will be finished.',
    areaHabits: 'Sunnah habits',
    areaHabitsDesc: "Adhkar, du'as, Quran and the small sunnahs of manner. A level decides which ones are switched on.",
    areaProgress: 'Streaks, missions and charts',
    areaProgressDesc: 'Missions are short commitments you write yourself. Insights draws everything you have marked into charts as the weeks pass.',
    levelWhat: 'A level is simply which sunnah habits are switched on — nothing more.',
    levelManual: 'Levels never change on their own, and nothing is locked. Switch whenever you like; your history is kept either way.',
    habitsCount: '{n} habits',
    levelEasyDesc: "The core adhkar and du'as — morning, evening, and before sleep.",
    levelMediumDesc: "Adds du'as through the day and the Duha prayer.",
    levelHardDesc: 'Adds wudu before sleep and the finer sunnahs of manner.',
    levelSahabahDesc: 'Adds daily Quran, istighfar, salawat and sadaqah.',
    levelCustomDesc: 'Nothing preset — switch on exactly what you want.',
    hintHome: 'Your day at a glance',
    hintHomeDesc: 'The large number is your remaining qadha. Below it is whatever is still open today, then how the last five days went.',
    hintPrayers: 'Marking prayers',
    hintPrayersDesc: 'Tap a status for each prayer. Marking one missed adds it to your qadha. Use the arrows above to fill in an earlier day.',
    hintQadha: 'Paying it back',
    hintQadhaDesc: 'Set a daily goal and the completion date updates as you go. Use +/− on a prayer to log what you have made up.',
    hintHabits: 'Levels are just presets',
    hintHabitsDesc: 'A level switches a set of habits on. To drop a single one, tap its pause icon — the level itself stays as it is.',
    hintMissions: 'Missions',
    hintMissionsDesc: 'A short commitment you write yourself — "all five on time for 7 days". It tracks itself from what you already mark.',
    hintInsights: 'Reading the charts',
    hintInsightsDesc: 'Everything here comes from what you have marked, so it fills out as the weeks pass. An empty chart just means an early week.',
    hintCalendar: 'Both calendars',
    hintCalendarDesc: 'Hijri and Gregorian side by side, with the sunnah fasting days and the two Eids marked.',
    title: 'How it works',
    subtitle: 'Every screen, and what it is for.',
    openGuide: 'How it works',
    openGuideDesc: 'A short guide to every screen',
    replayHints: 'Show the first-time hints again',
    replayHintsDone: 'Hints reset — they will appear as you visit each screen',
    sectionScreens: 'The screens',
    sectionLevels: 'Habit levels',
    sectionData: 'Your data',
    dataDesc: 'Everything stays on this device. There is no account and nothing is uploaded. Export a backup from Settings if you want a copy — that file is the only way your data moves to another device.',
  },
  qadhaSetup: {
    open: 'Help me work it out',
    intro: 'Two rough dates are enough. Nothing here has to be exact.',
    pubertyQ: 'Roughly when did you reach puberty?',
    pubertyHint: 'The age you became accountable. If you are unsure, most estimate somewhere between 12 and 15.',
    startedQ: 'Have you started praying regularly?',
    startedYes: 'Yes',
    startedYesDesc: 'Praying is a regular habit now',
    startedNo: 'Not yet',
    startedNoDesc: 'I am starting today',
    whenQ: 'Roughly when did you start?',
    whenHint: 'About when praying became a daily habit.',
    resultLabel: 'Estimated missed prayers',
    perPrayer: 'for each prayer — Fajr, Dhuhr, Asr, Maghrib and Isha',
    totalLabel: '{n} prayers in total',
    menstrualToggle: 'Account for menstrual days',
    menstrualDesc: 'Prayers missed during menstruation are not made up, so those days can be left out.',
    menstrualPerMonth: 'Days per month',
    excludedNote: '{n} days left out',
    saferNote: 'You likely prayed some prayers during this time. You can estimate and subtract them yourself — but many choose to count it all, to be safe. It is better to pray a few extra than to miss some.',
    disclaimer: 'This is only an estimate, not a religious ruling. If in doubt, ask a knowledgeable person.',
    apply: 'Use this estimate',
    manual: 'I already know my numbers',
    month: 'Month',
    year: 'Year',
  },
};


const sv: Translations = {
  nav: { home: 'Hem', prayers: 'Böner', qadha: 'Qadha', habits: 'Vanor', insights: 'Insikter', calendar: 'Kalender', settings: 'Inställningar', more: 'Mer' },
  home: { subtitle: 'En ny dag, ett nytt blad', today: 'Idag', rightNow: 'Just nu', dayComplete: 'Dagen är klar — må Allah acceptera den', moreItems: '+{n} mer', sunnahLabel: 'Sunnah', last5days: 'Senaste 5 dagarna', summary: 'Sammanfattning', remaining: 'kvar', active: 'aktiva' },
  prayers: { title: 'Dagens böner', subtitle: 'Markera dina obligatoriska böner och sunnah', backfillMode: 'Backfill-läge', backfillDesc: 'Böner markerade som "Missad" läggs automatiskt till i Qadha.', combo: 'Combo', comboLabel: 'böner i rad', multiplier: 'Multiplikator', streak: 'Streak', bestStreak: 'Bästa', empty: 'Börja din dag med Fajr ☀️', jumpToToday: 'Tillbaka till idag', previous: 'Föregående dag', next: 'Nästa dag', today: 'Idag', tapForToday: 'Tryck för att gå till idag' },
  prayerNames: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
  status: { pending: 'Väntar', onTime: 'I tid', jamaah: 'Jamaah', late: 'Sent', missed: 'Missad' },
  qadha: { title: 'Qadha böner', subtitle: 'Håll koll på dina missade böner', dailyGoal: 'Dagligt mål', daysToComplete: 'Dagar kvar', totalRemaining: 'Totalt kvar', empty: 'Inga qadha-böner att ta igen', emptyDesc: 'Inget utestående, mashaAllah. Har du böner sedan tidigare kan du lägga till dem nedan.', resetAll: 'Återställ alla räknare', resetAllConfirm: 'Nollställa alla qadha-räknare? Detta kan inte ångras.', byPrayer: 'Per bön', increase: 'Lägg till en {prayer}', decrease: 'Ta bort en {prayer}', atThisPace: 'I den här takten', noGoal: 'Ange ett dagligt mål för att se en uppskattning', timeEstimate: 'Tidsuppskattning', perDay: 'Böner per dag', total: 'Totalt Qadha', daysNeeded: 'Dagar behövs', duration: 'Uppskattad tid', completion: 'Förväntad klar' },
  sawm: { title: 'Sawm-qadha', subtitle: 'Fastedagar kvar att ta igen', remaining: 'Dagar kvar', dailyGoal: 'Dagligt mål', empty: 'Ingen fasta-qadha', emptyDesc: 'Inget utestående. Lägg till dagar nedan om du är skyldig fastor.', increase: 'Lägg till en dag', decrease: 'Ta bort en dag', reset: 'Nollställ räknare', resetConfirm: 'Sätta fasta-qadha till noll?', atThisPace: 'I den här takten', daysLeft: 'dagar' },
  habits: { title: 'Dagliga vanor', subtitle: 'Tryck på paus-ikonen för att gråa ut vanor du inte vill spåra just nu', level: 'Nivå', easy: 'Easy', medium: 'Medium', hard: 'Hard', sahabah: 'Sahabah', custom: 'Custom', morning: 'Morgon', evening: 'Kväll', sleep: 'Sömn', daily: 'Dagligt', paused: 'Pausad', selectLevel: 'Välj nivå (mall)', pointsToday: 'Dagens poäng', completed: 'Avklarade', active: 'aktiva', pauseHint: 'Pausa denna vana', activateHint: 'Aktivera denna vana', timeBound: 'Tidsbundna gärningar' },
  nafilah: { title: 'Nafila-böner', subtitle: 'Frivilliga böner – svårare böner ger fler poäng', hard: 'Svåra – kräver extra ansträngning', medium: 'Medel – kräver planering', easy: 'Lätta – vanebildande' },
  nafilahDesc: { 'tahajjud': 'Nattbönen – vakna mitt i natten', 'tasbih': 'Förlåtelsebönen – 300 tasbih under bönen', 'ishraq': 'Bönen efter soluppgång – stanna vaken efter Fajr', 'duha': 'Förmiddagsbönen – under arbetstid', 'awwabin': 'Mellan Maghrib och Isha', 'istikhara': 'Väglednings- eller behovsbönen', 'tahiyatul-masjid': 'Hälsning till moskén' },
  timeBoundDesc: { 'jumuah': 'Veckans viktigaste bön som ersätter Dhuhr på fredagar', 'fast-monday': 'Sunnah-fasta som profeten ﷺ utförde regelbundet', 'fast-thursday': 'Sunnah-fasta som profeten ﷺ utförde regelbundet', 'ayyam-al-beed': 'Fasta den 13:e, 14:e och 15:e i varje Hijri-månad', 'ramadan': 'Obligatorisk fasta från gryning till solnedgång', 'eid-fitr': 'Högtiden som avslutar Ramadan', 'arafah': 'Rekommenderad fasta för de som inte är på Hajj', 'eid-adha': 'Offerhögtiden till minne av Ibrahim (as)', 'ashura': 'Fasta till minne av Musa (as) räddning' },
  timeBoundNames: { 'jumuah': 'Jumuʿah', 'fast-monday': 'Fasta (måndag)', 'fast-thursday': 'Fasta (torsdag)', 'ayyam-al-beed': 'Ayyām al-Bīḍ (vita dagarna)', 'ramadan': 'Ramadan (fastan)', 'eid-fitr': 'Eid al-Fitr', 'arafah': 'Arafah-dagen (fasta)', 'eid-adha': 'Eid al-Adha', 'ashura': 'Ashura (fasta)' },
  timeBound: { title: 'Tidsbundna handlingar', weekly: 'Veckovis', monthly: 'Månadsvis', yearly: 'Årligen', today: 'Idag', upcoming: 'Kommande' },
  insightsLabels: { qadhaRemaining: 'Kvarstående qadha', clearIn: 'Skuldfri om ca', atCurrentPace: 'med nuvarande takt', setGoal: 'Ställ in ett dagligt qadha-mål för att se en prognos.', progress: 'Framsteg', yourLevel: 'Din nivå', balanceHint: 'Sträva efter en jämn, stor form – det är balanserad ibadah', noPrayerData: 'Ingen böndata ännu', level: 'Nivå' },
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
  calendar: { title: 'Kalender', gregorian: 'Gregoriansk', hijri: 'Hijri', today: 'Idag', openInPrayers: 'Öppna i Böner', prayersOnDay: 'Böner', habitsOnDay: 'Vanor klara' },
  settings: { title: 'Inställningar', subtitle: 'Hantera din app och data', language: 'Språk', notifications: 'Aviseringar', backup: 'Säkerhetskopiera', restore: 'Återställ', darkMode: 'Mörkt läge', appearance: 'Utseende', appearanceDesc: 'Tema och visningsalternativ', theme: 'Tema', showArabic: 'Visa arabiska namn', showArabicDesc: 'Visa arabisk translitterering under böner och vanor', dataMgmt: 'Datahantering', dataMgmtDesc: 'Exportera och importera din data', dataInfo: 'Din data', dataInfoDesc: 'Information om datalagring', export: 'Exportera data', import: 'Importera data', resetOnboarding: 'Återställ onboarding', resetOnboardingDone: 'Onboarding återställd – ladda om appen', restored: 'Data återställd från din säkerhetskopia', restoreFailed: 'Kunde inte läsa filen', restoreInvalid: 'Filen är inte en säkerhetskopia från den här appen', clearData: 'Radera all data', clearDataDesc: 'Ta bort allt som sparats på den här enheten permanent.', clearDataConfirm: 'Radera alla böner, qadha, vanor och inställningar från enheten? Detta kan inte ångras — exportera en säkerhetskopia först om du vill behålla den.', clearDataDone: 'All data raderad från enheten', autoMissed: 'Markera missade böner automatiskt', autoMissedDesc: 'Böner som inte markerats flyttas till Qadha när dagen är slut.', autoMissedTime: 'Tid för dagsskifte', autoMissedTimeDesc: 'När gårdagen stängs och omarkerade böner blir missade.', notificationsDesc: 'Lokala påminnelser nära din dagsskiftningstid om böner fortfarande är omarkerade. Inget lämnar enheten.', notificationsEnable: 'Aktivera aviseringar', notificationsEnabled: 'Aviseringar på', notificationsDenied: 'Tillstånd nekades — aktivera i webbläsarens inställningar', notificationsUnsupported: 'Aviseringar stöds inte i den här webbläsaren' },
  common: { save: 'Spara', cancel: 'Avbryt', done: 'Klar', skip: 'Hoppa över', next: 'Nästa', back: 'Tillbaka', close: 'Stäng', loading: 'Laddar...', getStarted: 'Kom igång' },
  onboarding: { step1Title: 'Välkommen till Qadha Companion', step1Desc: 'Spåra dina böner, vanor och andliga utveckling', step2Title: 'Sätt din Qadha', step2Desc: 'Hur många missade böner behöver du ta igen?', step3Title: 'Välj din nivå', step3Desc: 'Välj Easy, Medium, Hard eller Sahabah-läge', dontKnow: 'Jag vet inte än', step: 'Steg', autoMissedNote: 'Omarkerade böner flyttas till Qadha vid denna tid varje natt. Du kan ändra detta senare i Inställningar.', editLaterNote: 'Glömde du markera en bön du faktiskt bad? Öppna den dagen i Böner och uppdatera den.' },
  fab: { markFajr: 'Markera Fajr', addQadha: 'Lägg till Qadha', logHabit: 'Logga vana', quickActions: 'Snabbåtgärder' },
  combo: { onFire: 'On fire!', firstTimeTitle: 'Combo startad!', firstTimeDesc: 'Be i tid eller i jamaah i rad för att öka din combo och få bonuspoäng.' },
  hadith: { source: 'Källa', fadl: 'Förtjänst', comingSoon: 'Mer info kommer snart' },
  missions: { title: 'Uppdrag', subtitle: 'Ett personligt åtagande, nedskrivet och bevittnat', newMission: 'Nytt uppdrag', iIntendTo: 'Jag har för avsikt att', for: 'i', days: 'dagar', begin: 'Börja — Bismillah', active: 'Aktiva uppdrag', completed: 'Avklarade', endedTitle: 'Avslutade', accepted: 'Må Allah acceptera det', endedEarly: 'Avslutades tidigt — din avsikt skrevs', tryAgain: 'Försök igen', bonus: 'Bonus', missesUsed: 'missar använda', remaining: 'kvar', allFive: 'alla 5 böner', onTime: 'i tid', inJamaah: 'i jamaah', custom: 'eget', allowingUpTo: 'med upp till', misses: 'missar', verbPray: 'be', verbDo: 'göra', verbRead: 'läsa', verbGive: 'ge', verbSay: 'säga', missedBeforeLose: 'Missat {used} av {allowed} innan du förlorar', mayMiss: 'och får missa' },
  guide: {
    insideTitle: 'Vad som finns här',
    insideDesc: 'Fyra saker appen håller reda på. Du kan strunta i vilken som helst.',
    areaPrayers: 'De fem dagliga bönerna',
    areaPrayersDesc: 'Markera varje bön när du bett den — i tid, i jamaah, sent eller missad. Det du markerar som missat läggs till i din qadha automatiskt.',
    areaQadha: 'Qadha, nedräknad',
    areaQadhaDesc: 'Dina obetalda böner, en räknare per bön. Ange hur många du tar igen per dag så räknar appen ut när du är klar.',
    areaHabits: 'Sunnah-vanor',
    areaHabitsDesc: "Adhkār, du'a, Quran och de små sunnah i uppförande. En nivå avgör vilka som är påslagna.",
    areaProgress: 'Streaks, uppdrag och diagram',
    areaProgressDesc: 'Uppdrag är korta åtaganden du skriver själv. Insikter ritar upp allt du markerat vartefter veckorna går.',
    levelWhat: 'En nivå är helt enkelt vilka sunnah-vanor som är påslagna — inget mer.',
    levelManual: 'Nivåer ändras aldrig av sig själva, och inget är låst. Byt när du vill; historiken sparas oavsett.',
    habitsCount: '{n} vanor',
    levelEasyDesc: "Grundläggande adhkār och du'a — morgon, kväll och före sömn.",
    levelMediumDesc: "Lägger till du'a under dagen och Duha-bönen.",
    levelHardDesc: 'Lägger till wudu före sömn och de finare sunnah i uppförande.',
    levelSahabahDesc: 'Lägger till daglig Quran, istighfār, salawāt och sadaqah.',
    levelCustomDesc: 'Inget förvalt — slå på exakt det du vill.',
    hintHome: 'Dagen i överblick',
    hintHomeDesc: 'Den stora siffran är din återstående qadha. Under den ligger det som är kvar idag, och sedan hur de senaste fem dagarna gick.',
    hintPrayers: 'Att markera böner',
    hintPrayersDesc: 'Tryck på en status för varje bön. Markerar du en som missad hamnar den i din qadha. Använd pilarna ovanför för att fylla i en tidigare dag.',
    hintQadha: 'Att ta igen',
    hintQadhaDesc: 'Sätt ett dagligt mål så uppdateras slutdatumet efterhand. Använd +/− på en bön för att logga det du tagit igen.',
    hintHabits: 'Nivåer är bara mallar',
    hintHabitsDesc: 'En nivå slår på en uppsättning vanor. Vill du plocka bort en enskild, tryck på dess paus-ikon — nivån ligger kvar som den är.',
    hintMissions: 'Uppdrag',
    hintMissionsDesc: 'Ett kort åtagande du skriver själv — "alla fem i tid i 7 dagar". Det följs upp automatiskt från det du redan markerar.',
    hintInsights: 'Att läsa diagrammen',
    hintInsightsDesc: 'Allt här kommer från det du markerat, så det fylls på vartefter veckorna går. Ett tomt diagram betyder bara en tidig vecka.',
    hintCalendar: 'Båda kalendrarna',
    hintCalendarDesc: 'Hijri och gregoriansk sida vid sida, med sunnah-fastedagarna och de två Eid utmarkerade.',
    title: 'Så fungerar appen',
    subtitle: 'Varje skärm, och vad den är till för.',
    openGuide: 'Så fungerar appen',
    openGuideDesc: 'En kort guide till varje skärm',
    replayHints: 'Visa förstagångstipsen igen',
    replayHintsDone: 'Tipsen återställda — de dyker upp när du besöker varje skärm',
    sectionScreens: 'Skärmarna',
    sectionLevels: 'Vanenivåer',
    sectionData: 'Din data',
    dataDesc: 'Allt stannar på den här enheten. Det finns inget konto och inget laddas upp. Exportera en säkerhetskopia i Inställningar om du vill ha en kopia — den filen är enda sättet din data flyttas till en annan enhet.',
  },
  qadhaSetup: {
    open: 'Hjälp mig räkna ut det',
    intro: 'Två ungefärliga datum räcker. Inget här behöver vara exakt.',
    pubertyQ: 'Ungefär när kom du i puberteten?',
    pubertyHint: 'Åldern då du blev ansvarig (bulugh). Är du osäker uppskattar de flesta någonstans mellan 12 och 15.',
    startedQ: 'Har du börjat be regelbundet?',
    startedYes: 'Ja',
    startedYesDesc: 'Bönen är en regelbunden vana nu',
    startedNo: 'Inte än',
    startedNoDesc: 'Jag börjar idag',
    whenQ: 'Ungefär när började du?',
    whenHint: 'Ungefär när bönen blev en daglig vana.',
    resultLabel: 'Uppskattat antal missade böner',
    perPrayer: 'för varje bön — Fajr, Dhuhr, Asr, Maghrib och Isha',
    totalLabel: '{n} böner totalt',
    menstrualToggle: 'Ta hänsyn till menstruation',
    menstrualDesc: 'Böner som missas under menstruation tas inte igen, så de dagarna kan räknas bort.',
    menstrualPerMonth: 'Dagar per månad',
    excludedNote: '{n} dagar borträknade',
    saferNote: 'Du bad förmodligen några böner under den här tiden. Du kan uppskatta och dra av dem själv — men många väljer att räkna allt, för säkerhets skull. Det är bättre att be några extra än att missa några.',
    disclaimer: 'Detta är endast en uppskattning, inte ett religiöst utlåtande. Är du osäker, fråga någon kunnig.',
    apply: 'Använd uppskattningen',
    manual: 'Jag vet redan mina siffror',
    month: 'Månad',
    year: 'År',
  },
};


const tr: Translations = {
  nav: { home: 'Ana Sayfa', prayers: 'Namazlar', qadha: 'Kaza', habits: 'Alışkanlıklar', insights: 'İstatistikler', calendar: 'Takvim', settings: 'Ayarlar', more: 'Daha Fazla' },
  home: { subtitle: 'Yeni bir gün, yeni bir sayfa', today: 'Bugün', rightNow: 'Şu anda', dayComplete: 'Gün tamamlandı — Allah kabul etsin', moreItems: '+{n} daha', sunnahLabel: 'Sünnet', last5days: 'Son 5 gün', summary: 'Özet', remaining: 'kaldı', active: 'aktif' },
  prayers: { title: 'Günün Namazları', subtitle: 'Farz ve sünnet namazlarını işaretle', backfillMode: 'Geriye dönük mod', backfillDesc: '"Kaçırıldı" işaretlenen namazlar otomatik olarak Kaza\'ya eklenir.', combo: 'Kombo', comboLabel: 'arka arkaya namaz', multiplier: 'Çarpan', streak: 'Seri', bestStreak: 'En iyi', empty: 'Güne Sabah namazıyla başla ☀️', jumpToToday: 'Bugüne dön', previous: 'Önceki gün', next: 'Sonraki gün', today: 'Bugün', tapForToday: 'Bugüne gitmek için dokun' },
  prayerNames: { fajr: 'Sabah', dhuhr: 'Öğle', asr: 'İkindi', maghrib: 'Akşam', isha: 'Yatsı' },
  status: { pending: 'Bekliyor', onTime: 'Vaktinde', jamaah: 'Cemaat', late: 'Geç', missed: 'Kaçırıldı' },
  qadha: { title: 'Kaza Namazları', subtitle: 'Kaçırdığın namazları takip et', dailyGoal: 'Günlük Hedef', daysToComplete: 'Tamamlama süresi (gün)', totalRemaining: 'Toplam kalan', empty: 'Kaza edilecek namaz yok', emptyDesc: 'Bekleyen bir şey yok, maşaAllah. Geçmişten borcun varsa aşağıdan ekleyebilirsin.', resetAll: 'Tüm sayaçları sıfırla', resetAllConfirm: 'Tüm kaza sayaçları sıfırlansın mı? Bu geri alınamaz.', byPrayer: 'Namaza göre', increase: '{prayer} sayısını bir artır', decrease: '{prayer} sayısını bir azalt', atThisPace: 'Bu hızla', noGoal: 'Tahmin için günlük bir hedef belirle', timeEstimate: 'Süre Tahmini', perDay: 'Günde namaz', total: 'Toplam Kaza', daysNeeded: 'Gerekli gün', duration: 'Tahmini süre', completion: 'Beklenen bitiş' },
  sawm: { title: 'Oruç kazası', subtitle: 'Kazaya kalan oruç günleri', remaining: 'Kalan gün', dailyGoal: 'Günlük hedef', empty: 'Oruç kazası yok', emptyDesc: 'Bekleyen bir şey yok. Borcun varsa aşağıdan gün ekle.', increase: 'Bir gün ekle', decrease: 'Bir gün çıkar', reset: 'Sayacı sıfırla', resetConfirm: 'Oruç kazası sıfırlansın mı?', atThisPace: 'Bu hızla', daysLeft: 'gün' },
  habits: { title: 'Günlük Alışkanlıklar', subtitle: 'Takip etmek istemediğin alışkanlıkları duraklat simgesiyle gri yapabilirsin', level: 'Seviye', easy: 'Kolay', medium: 'Orta', hard: 'Zor', sahabah: 'Sahabe', custom: 'Özel', morning: 'Sabah', evening: 'Akşam', sleep: 'Uyku', daily: 'Günlük', paused: 'Duraklatıldı', selectLevel: 'Seviye seç (şablon)', pointsToday: 'Bugünkü puan', completed: 'Tamamlanan', active: 'aktif', pauseHint: 'Bu alışkanlığı duraklat', activateHint: 'Bu alışkanlığı etkinleştir', timeBound: 'Zamana bağlı ameller' },
  nafilah: { title: 'Nafile namazlar', subtitle: 'Daha zor namazlar daha çok puan kazandırır', hard: 'Zor — fazladan gayret ister', medium: 'Orta — planlama ister', easy: 'Kolay — alışkanlık kazandırır' },
  nafilahDesc: { 'tahajjud': 'Gece namazı — gecenin ortasında kalkmak', 'tasbih': 'Bağışlanma namazı — namaz içinde 300 tesbih', 'ishraq': 'Güneş doğduktan sonra — Sabah namazından sonra uyanık kalmak', 'duha': 'Kuşluk namazı — çalışma saatleri içinde', 'awwabin': 'Akşam ile Yatsı arasında', 'istikhara': 'İstihare veya hacet namazı', 'tahiyatul-masjid': 'Mescidi selamlama' },
  timeBoundDesc: { 'jumuah': 'Cuma günleri öğle namazının yerine geçen, haftanın en önemli namazı', 'fast-monday': 'Peygamber ﷺ\u2019in düzenli tuttuğu sünnet oruç', 'fast-thursday': 'Peygamber ﷺ\u2019in düzenli tuttuğu sünnet oruç', 'ayyam-al-beed': 'Her hicri ayın 13, 14 ve 15\u2019inde oruç tutmak', 'ramadan': 'Şafaktan gün batımına kadar farz oruç', 'eid-fitr': 'Ramazanı kapatan bayram', 'arafah': 'Hacda olmayanlar için tavsiye edilen oruç', 'eid-adha': 'İbrahim (as)\u2019ı anan kurban bayramı', 'ashura': 'Musa (as)\u2019ın kurtuluşunu anma orucu' },
  timeBoundNames: { 'jumuah': 'Cuma', 'fast-monday': 'Oruç (Pazartesi)', 'fast-thursday': 'Oruç (Perşembe)', 'ayyam-al-beed': 'Eyyâm-ı Bîd (ak günler)', 'ramadan': 'Ramazan (oruç)', 'eid-fitr': 'Ramazan Bayramı', 'arafah': 'Arefe Günü (oruç)', 'eid-adha': 'Kurban Bayramı', 'ashura': 'Aşure (oruç)' },
  timeBound: { title: 'Zamana bağlı ameller', weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık', today: 'Bugün', upcoming: 'Yaklaşan' },
  insightsLabels: { qadhaRemaining: 'Kalan kaza', clearIn: 'Yaklaşık şu sürede biter:', atCurrentPace: 'mevcut hızla', setGoal: 'Tahmin görmek için günlük bir kaza hedefi belirle.', progress: 'İlerleme', yourLevel: 'Seviyen', balanceHint: 'Dengeli bir ibadet için geniş ve düzgün bir şekil hedefle', noPrayerData: 'Henüz namaz verisi yok', level: 'Seviye' },
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
  calendar: { title: 'Takvim', gregorian: 'Miladi', hijri: 'Hicri', today: 'Bugün', openInPrayers: 'Namazlarda aç', prayersOnDay: 'Namazlar', habitsOnDay: 'Tamamlanan alışkanlıklar' },
  settings: { title: 'Ayarlar', subtitle: 'Uygulamanı ve verini yönet', language: 'Dil', notifications: 'Bildirimler', backup: 'Yedekle', restore: 'Geri yükle', darkMode: 'Koyu mod', appearance: 'Görünüm', appearanceDesc: 'Tema ve görüntü seçenekleri', theme: 'Tema', showArabic: 'Arapça isimleri göster', showArabicDesc: 'Namaz ve alışkanlıkların altında Arapça çeviriyi göster', dataMgmt: 'Veri yönetimi', dataMgmtDesc: 'Verini dışa ve içe aktar', dataInfo: 'Verin', dataInfoDesc: 'Veri depolama hakkında bilgi', export: 'Veriyi dışa aktar', import: 'Veriyi içe aktar', resetOnboarding: 'Tanıtımı sıfırla', resetOnboardingDone: 'Tanıtım sıfırlandı – uygulamayı yeniden yükle', restored: 'Veriler yedeğinden geri yüklendi', restoreFailed: 'Dosya okunamadı', restoreInvalid: 'Bu dosya bu uygulamanın yedeği değil', clearData: 'Tüm verileri sil', clearDataDesc: 'Bu cihazda saklanan her şeyi kalıcı olarak sil.', clearDataConfirm: 'Tüm namazlar, kaza, alışkanlıklar ve ayarlar bu cihazdan silinsin mi? Bu geri alınamaz — saklamak istiyorsan önce yedek al.', clearDataDone: 'Tüm veriler cihazdan silindi', autoMissed: 'Kaçırılan namazları otomatik işaretle', autoMissedDesc: 'İşaretlenmemiş namazlar gün bittiğinde Kazaya eklenir.', autoMissedTime: 'Gün sıfırlama saati', autoMissedTimeDesc: 'Önceki gün kapanır ve işaretlenmemiş namazlar kaçırılmış sayılır.', notificationsDesc: 'Namazlar hâlâ işaretsizse gün sıfırlama saatine yakın yerel hatırlatmalar. Hiçbir veri cihazdan çıkmaz.', notificationsEnable: 'Bildirimleri aç', notificationsEnabled: 'Bildirimler açık', notificationsDenied: 'İzin reddedildi — tarayıcı ayarlarından açın', notificationsUnsupported: 'Bu tarayıcıda bildirimler yok' },
  common: { save: 'Kaydet', cancel: 'İptal', done: 'Tamam', skip: 'Atla', next: 'İleri', back: 'Geri', close: 'Kapat', loading: 'Yükleniyor...', getStarted: 'Başla' },
  onboarding: { step1Title: 'Qadha Companion\'a hoş geldin', step1Desc: 'Namazlarını, alışkanlıklarını ve manevi gelişimini takip et', step2Title: 'Kaza\'nı belirle', step2Desc: 'Kaç tane kaçırılmış namazın var?', step3Title: 'Seviyeni seç', step3Desc: 'Kolay, Orta, Zor veya Sahabe modunu seç', dontKnow: 'Henüz bilmiyorum', step: 'Adım', autoMissedNote: 'İşaretlenmemiş namazlar her gece bu saatte Kazaya eklenir. Bunu daha sonra Ayarlardan değiştirebilirsin.', editLaterNote: 'Aslında kıldığın bir namazı işaretlemeyi mi unuttun? Namazlar sayfasından o günü açıp güncelle.' },
  fab: { markFajr: 'Sabah namazını işaretle', addQadha: 'Kaza ekle', logHabit: 'Alışkanlık kaydet', quickActions: 'Hızlı işlemler' },
  combo: { onFire: 'Ateş gibi!', firstTimeTitle: 'Kombo başladı!', firstTimeDesc: 'Vaktinde ya da cemaatle arka arkaya kıl, kombo büyüsün, bonus puan kazan.' },
  hadith: { source: 'Kaynak', fadl: 'Faydası', comingSoon: 'Yakında daha fazla bilgi' },
  missions: { title: 'Görevler', subtitle: 'Yazıya dökülmüş kişisel bir niyet', newMission: 'Yeni görev', iIntendTo: 'Niyet ediyorum', for: 'boyunca', days: 'gün', begin: 'Başla — Bismillah', active: 'Aktif görevler', completed: 'Tamamlanan', endedTitle: 'Sonlandı', accepted: 'Allah kabul etsin', endedEarly: 'Erken bitti — niyetin yazıldı', tryAgain: 'Tekrar dene', bonus: 'Bonus', missesUsed: 'kaçırma hakkı', remaining: 'kaldı', allFive: '5 vakit namaz', onTime: 'vaktinde', inJamaah: 'cemaatle', custom: 'özel', allowingUpTo: 'en fazla', misses: 'kaçırma hakkı ile', verbPray: 'kılmaya', verbDo: 'yapmaya', verbRead: 'okumaya', verbGive: 'vermeye', verbSay: 'söylemeye', missedBeforeLose: 'Kaybetmeden önce {allowed} kaçırma hakkından {used} kullanıldı', mayMiss: 've kaçırabilir' },
  guide: {
    insideTitle: 'Neler var',
    insideDesc: 'Uygulamanın takip ettiği dört şey. Hepsini kullanmak zorunda değilsin.',
    areaPrayers: 'Beş vakit namaz',
    areaPrayersDesc: 'Her namazı kıldıkça işaretle — vaktinde, cemaatle, geç ya da kaçırılmış. Kaçırılmış işaretlediğin kazana kendiliğinden eklenir.',
    areaQadha: 'Kaza, geriye sayarak',
    areaQadhaDesc: 'Borçlu olduğun namazlar, her vakit için ayrı sayaç. Günde kaç tane kaza edeceğini gir, uygulama ne zaman biteceğini hesaplasın.',
    areaHabits: 'Sünnet alışkanlıkları',
    areaHabitsDesc: "Ezkâr, dualar, Kur'an ve edebe dair küçük sünnetler. Hangilerinin açık olacağına seviye karar verir.",
    areaProgress: 'Seriler, görevler ve grafikler',
    areaProgressDesc: 'Görevler kendi yazdığın kısa niyetlerdir. Analizler, işaretlediğin her şeyi haftalar geçtikçe grafiklere döker.',
    levelWhat: 'Seviye, sadece hangi sünnet alışkanlıklarının açık olduğudur — başka bir şey değil.',
    levelManual: 'Seviyeler kendiliğinden değişmez ve hiçbiri kilitli değildir. İstediğin zaman değiştir; geçmişin her hâlükârda korunur.',
    habitsCount: '{n} alışkanlık',
    levelEasyDesc: 'Temel ezkâr ve dualar — sabah, akşam ve uykudan önce.',
    levelMediumDesc: 'Gün içindeki duaları ve Duha namazını ekler.',
    levelHardDesc: 'Uykudan önce abdesti ve edebe dair ince sünnetleri ekler.',
    levelSahabahDesc: "Günlük Kur'an, istiğfar, salavat ve sadakayı ekler.",
    levelCustomDesc: 'Hazır liste yok — tam olarak istediğini aç.',
    hintHome: 'Güne bakış',
    hintHomeDesc: 'Büyük sayı kalan kazandır. Altında bugün hâlâ açık olanlar, sonra son beş günün nasıl geçtiği var.',
    hintPrayers: 'Namazları işaretlemek',
    hintPrayersDesc: 'Her namaz için bir durum seç. Kaçırılmış işaretlediğin kazana eklenir. Önceki bir günü doldurmak için yukarıdaki okları kullan.',
    hintQadha: 'Kaza etmek',
    hintQadhaDesc: 'Günlük bir hedef koy, bitiş tarihi kendiliğinden güncellensin. Kaza ettiklerini işlemek için bir namazın +/− tuşlarını kullan.',
    hintHabits: 'Seviyeler sadece şablondur',
    hintHabitsDesc: 'Seviye bir grup alışkanlığı açar. Tek birini çıkarmak istersen duraklat simgesine bas — seviyen olduğu gibi kalır.',
    hintMissions: 'Görevler',
    hintMissionsDesc: 'Kendi yazdığın kısa bir niyet — "7 gün boyunca beş vakit vaktinde". Zaten işaretlediklerinden kendi kendine takip edilir.',
    hintInsights: 'Grafikleri okumak',
    hintInsightsDesc: 'Buradaki her şey işaretlediklerinden gelir, haftalar geçtikçe dolar. Boş bir grafik sadece haftanın erken olduğu anlamına gelir.',
    hintCalendar: 'İki takvim',
    hintCalendarDesc: 'Hicri ve miladi yan yana, sünnet oruç günleri ve iki bayram işaretli.',
    title: 'Nasıl çalışır',
    subtitle: 'Her ekran ve ne işe yaradığı.',
    openGuide: 'Nasıl çalışır',
    openGuideDesc: 'Her ekran için kısa bir rehber',
    replayHints: 'İlk kullanım ipuçlarını tekrar göster',
    replayHintsDone: 'İpuçları sıfırlandı — her ekrana girdiğinde görünecekler',
    sectionScreens: 'Ekranlar',
    sectionLevels: 'Alışkanlık seviyeleri',
    sectionData: 'Verilerin',
    dataDesc: "Her şey bu cihazda kalır. Hesap yok, hiçbir şey yüklenmez. Bir kopya istiyorsan Ayarlar'dan yedek al — verilerinin başka bir cihaza taşınmasının tek yolu o dosyadır.",
  },
  qadhaSetup: {
    open: 'Hesaplamama yardım et',
    intro: 'İki yaklaşık tarih yeterli. Buradaki hiçbir şeyin kesin olması gerekmiyor.',
    pubertyQ: 'Yaklaşık olarak ne zaman ergenliğe girdin?',
    pubertyHint: 'Dinen sorumlu olduğun yaş (bulûğ). Emin değilsen çoğu kişi 12 ile 15 arasını tahmin eder.',
    startedQ: 'Düzenli namaz kılmaya başladın mı?',
    startedYes: 'Evet',
    startedYesDesc: 'Namaz artık düzenli bir alışkanlık',
    startedNo: 'Henüz değil',
    startedNoDesc: 'Bugün başlıyorum',
    whenQ: 'Yaklaşık olarak ne zaman başladın?',
    whenHint: 'Namazın günlük bir alışkanlık hâline geldiği zaman.',
    resultLabel: 'Tahmini kaçırılan namaz',
    perPrayer: 'her namaz için — Sabah, Öğle, İkindi, Akşam ve Yatsı',
    totalLabel: 'toplam {n} namaz',
    menstrualToggle: 'Âdet günlerini hesaba kat',
    menstrualDesc: 'Âdet döneminde kaçan namazlar kaza edilmez, bu yüzden o günler çıkarılabilir.',
    menstrualPerMonth: 'Ayda kaç gün',
    excludedNote: '{n} gün çıkarıldı',
    saferNote: 'Bu süre zarfında muhtemelen bazı namazları kıldın. Bunları kendin tahmin edip çıkarabilirsin — ancak birçok kişi, ihtiyaten hepsini saymayı tercih eder. Birkaç fazla namaz kılmak, bazılarını eksik bırakmaktan daha iyidir.',
    disclaimer: 'Bu yalnızca bir tahmindir, dinî bir hüküm değildir. Şüphen varsa bilen birine danış.',
    apply: 'Bu tahmini kullan',
    manual: 'Sayılarımı zaten biliyorum',
    month: 'Ay',
    year: 'Yıl',
  },
};


const ar: Translations = {
  nav: { home: 'الرئيسية', prayers: 'الصلوات', qadha: 'القضاء', habits: 'العادات', insights: 'الإحصاءات', calendar: 'التقويم', settings: 'الإعدادات', more: 'المزيد' },
  home: { subtitle: 'يوم جديد، صفحة جديدة', today: 'اليوم', rightNow: 'الآن', dayComplete: 'اكتمل اليوم — تقبّل الله', moreItems: '+{n} المزيد', sunnahLabel: 'سنن', last5days: 'آخر 5 أيام', summary: 'ملخّص', remaining: 'متبقي', active: 'نشطة' },
  prayers: { title: 'صلوات اليوم', subtitle: 'سجّل صلواتك الفريضة والسنن', backfillMode: 'وضع التعويض', backfillDesc: 'الصلوات المعلّمة "فائتة" تُضاف تلقائياً إلى القضاء.', combo: 'سلسلة', comboLabel: 'صلوات متتالية', multiplier: 'المضاعِف', streak: 'سلسلة', bestStreak: 'الأفضل', empty: 'ابدأ يومك بصلاة الفجر ☀️', jumpToToday: 'العودة إلى اليوم', previous: 'اليوم السابق', next: 'اليوم التالي', today: 'اليوم', tapForToday: 'اضغط للعودة إلى اليوم' },
  prayerNames: { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' },
  status: { pending: 'قيد الانتظار', onTime: 'في الوقت', jamaah: 'جماعة', late: 'متأخر', missed: 'فائت' },
  qadha: { title: 'صلوات القضاء', subtitle: 'تابع صلواتك الفائتة', dailyGoal: 'الهدف اليومي', daysToComplete: 'أيام للإكمال', totalRemaining: 'المجموع المتبقي', empty: 'لا توجد صلوات قضاء', emptyDesc: 'لا شيء متبقٍّ، ما شاء الله. إن كان عليك صلوات سابقة فأضفها بالأسفل.', resetAll: 'إعادة ضبط جميع العدّادات', resetAllConfirm: 'إعادة ضبط جميع عدّادات القضاء إلى الصفر؟ لا يمكن التراجع عن ذلك.', byPrayer: 'حسب الصلاة', increase: 'زيادة {prayer} واحدة', decrease: 'إنقاص {prayer} واحدة', atThisPace: 'بهذا المعدل', noGoal: 'حدِّد هدفاً يومياً لرؤية التقدير', timeEstimate: 'تقدير الوقت', perDay: 'صلوات في اليوم', total: 'مجموع القضاء', daysNeeded: 'الأيام المطلوبة', duration: 'المدة المقدّرة', completion: 'الإنجاز المتوقع' },
  sawm: { title: 'قضاء الصيام', subtitle: 'أيام الصيام المتبقية للقضاء', remaining: 'الأيام المتبقية', dailyGoal: 'الهدف اليومي', empty: 'لا قضاء صيام', emptyDesc: 'لا شيء متبقٍّ. أضف أياماً بالأسفل إن كان عليك صيام.', increase: 'إضافة يوم', decrease: 'إنقاص يوم', reset: 'إعادة ضبط العدّاد', resetConfirm: 'إعادة قضاء الصيام إلى الصفر؟', atThisPace: 'بهذا المعدل', daysLeft: 'أيام' },
  habits: { title: 'العادات اليومية', subtitle: 'اضغط على أيقونة الإيقاف لتعطيل العادات التي لا تريد متابعتها', level: 'المستوى', easy: 'سهل', medium: 'متوسط', hard: 'صعب', sahabah: 'الصحابة', custom: 'مخصّص', morning: 'الصباح', evening: 'المساء', sleep: 'النوم', daily: 'يومي', paused: 'متوقف', selectLevel: 'اختر المستوى (قالب)', pointsToday: 'نقاط اليوم', completed: 'المنجَز', active: 'نشطة', pauseHint: 'إيقاف هذه العادة', activateHint: 'تفعيل هذه العادة', timeBound: 'أعمال موقوتة' },
  nafilah: { title: 'صلوات النافلة', subtitle: 'الصلوات الأصعب تُعطي نقاطاً أكثر', hard: 'صعبة — تتطلب جهداً إضافياً', medium: 'متوسطة — تتطلب تخطيطاً', easy: 'سهلة — تبني عادة' },
  nafilahDesc: { 'tahajjud': 'صلاة الليل — القيام في جوف الليل', 'tasbih': 'صلاة المغفرة — ثلاثمائة تسبيحة في الصلاة', 'ishraq': 'بعد شروق الشمس — البقاء مستيقظاً بعد الفجر', 'duha': 'صلاة الضحى — في وقت العمل', 'awwabin': 'بين المغرب والعشاء', 'istikhara': 'صلاة الاستخارة أو الحاجة', 'tahiyatul-masjid': 'تحية المسجد' },
  timeBoundDesc: { 'jumuah': 'أهم صلاة في الأسبوع، تقوم مقام الظهر يوم الجمعة', 'fast-monday': 'صوم سنة كان النبي ﷺ يداوم عليه', 'fast-thursday': 'صوم سنة كان النبي ﷺ يداوم عليه', 'ayyam-al-beed': 'صيام الثالث عشر والرابع عشر والخامس عشر من كل شهر هجري', 'ramadan': 'الصوم الواجب من الفجر إلى المغرب', 'eid-fitr': 'العيد الذي يختم رمضان', 'arafah': 'صوم مستحب لغير الحاج', 'eid-adha': 'عيد الأضحى إحياءً لذكرى إبراهيم عليه السلام', 'ashura': 'صوم إحياءً لنجاة موسى عليه السلام' },
  timeBoundNames: { 'jumuah': 'الجمعة', 'fast-monday': 'صيام الإثنين', 'fast-thursday': 'صيام الخميس', 'ayyam-al-beed': 'أيام البيض', 'ramadan': 'رمضان (الصيام)', 'eid-fitr': 'عيد الفطر', 'arafah': 'يوم عرفة (صيام)', 'eid-adha': 'عيد الأضحى', 'ashura': 'عاشوراء (صيام)' },
  timeBound: { title: 'أعمال مرتبطة بأوقات', weekly: 'أسبوعي', monthly: 'شهري', yearly: 'سنوي', today: 'اليوم', upcoming: 'قادم' },
  insightsLabels: { qadhaRemaining: 'القضاء المتبقي', clearIn: 'ينتهي خلال نحو', atCurrentPace: 'بالمعدل الحالي', setGoal: 'حدِّد هدفاً يومياً للقضاء لرؤية التقدير.', progress: 'التقدم', yourLevel: 'مستواك', balanceHint: 'اسعَ إلى شكل متّسع ومتوازن — تلك هي العبادة المتوازنة', noPrayerData: 'لا توجد بيانات صلاة بعد', level: 'المستوى' },
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
  calendar: { title: 'التقويم', gregorian: 'ميلادي', hijri: 'هجري', today: 'اليوم', openInPrayers: 'فتح في الصلوات', prayersOnDay: 'الصلوات', habitsOnDay: 'العادات المنجزة' },
  settings: { title: 'الإعدادات', subtitle: 'إدارة التطبيق والبيانات', language: 'اللغة', notifications: 'الإشعارات', backup: 'نسخ احتياطي', restore: 'استعادة', darkMode: 'الوضع الداكن', appearance: 'المظهر', appearanceDesc: 'إعدادات السمة والعرض', theme: 'السمة', showArabic: 'إظهار الأسماء العربية', showArabicDesc: 'عرض الأسماء العربية تحت الصلوات والعادات', dataMgmt: 'إدارة البيانات', dataMgmtDesc: 'تصدير واستيراد بياناتك', dataInfo: 'بياناتك', dataInfoDesc: 'معلومات عن تخزين البيانات', export: 'تصدير البيانات', import: 'استيراد البيانات', resetOnboarding: 'إعادة تشغيل التعريف', resetOnboardingDone: 'تم إعادة ضبط التعريف – أعد تحميل التطبيق', restored: 'تمت استعادة البيانات من النسخة الاحتياطية', restoreFailed: 'تعذّرت قراءة الملف', restoreInvalid: 'هذا الملف ليس نسخة احتياطية من هذا التطبيق', clearData: 'محو جميع البيانات', clearDataDesc: 'حذف كل ما هو مخزَّن على هذا الجهاز نهائياً.', clearDataConfirm: 'محو جميع الصلوات والقضاء والعادات والإعدادات من هذا الجهاز؟ لا يمكن التراجع عن ذلك — صدِّر نسخة احتياطية أولاً إن أردت الاحتفاظ بها.', clearDataDone: 'تم محو جميع البيانات من هذا الجهاز', autoMissed: 'تعليم الصلوات الفائتة تلقائياً', autoMissedDesc: 'أي صلاة لم تُعلَّم تُنقل إلى القضاء عند انتهاء اليوم.', autoMissedTime: 'وقت بداية اليوم', autoMissedTimeDesc: 'الوقت الذي يُغلق فيه اليوم السابق وتُعتبر الصلوات غير المعلَّمة فائتة.', notificationsDesc: 'تذكيرات محلية قرب وقت بداية اليوم إذا بقيت صلوات بلا تعليم. لا يغادر شيء هذا الجهاز.', notificationsEnable: 'تفعيل الإشعارات', notificationsEnabled: 'الإشعارات مفعّلة', notificationsDenied: 'رُفض الإذن — فعّله من إعدادات المتصفح', notificationsUnsupported: 'الإشعارات غير متاحة في هذا المتصفح' },
  common: { save: 'حفظ', cancel: 'إلغاء', done: 'تم', skip: 'تخطّي', next: 'التالي', back: 'رجوع', close: 'إغلاق', loading: 'جاري التحميل...', getStarted: 'ابدأ' },
  onboarding: { step1Title: 'مرحباً بك في رفيق القضاء', step1Desc: 'تابع صلواتك وعاداتك ونموّك الروحي', step2Title: 'حدّد القضاء', step2Desc: 'كم عدد الصلوات التي تحتاج إلى قضائها؟', step3Title: 'اختر مستواك', step3Desc: 'اختر سهل، متوسط، صعب أو وضع الصحابة', dontKnow: 'لا أعرف بعد', step: 'الخطوة', autoMissedNote: 'الصلوات غير المعلَّمة ستُنقل إلى القضاء في هذا الوقت كل ليلة. يمكنك تغيير ذلك لاحقاً من الإعدادات.', editLaterNote: 'نسيت أن تعلّم صلاة أدّيتها فعلاً؟ افتح ذلك اليوم في الصلوات وحدّثه.' },
  fab: { markFajr: 'سجّل الفجر', addQadha: 'أضف قضاء', logHabit: 'سجّل عادة', quickActions: 'إجراءات سريعة' },
  combo: { onFire: 'مشتعل!', firstTimeTitle: 'بدأت السلسلة!', firstTimeDesc: 'صلّ في الوقت أو في جماعة على التوالي لتنمو سلسلتك وتحصل على نقاط إضافية.' },
  hadith: { source: 'المصدر', fadl: 'الفضل', comingSoon: 'قريباً' },
  missions: { title: 'المهمات', subtitle: 'عهد شخصي مكتوب', newMission: 'مهمة جديدة', iIntendTo: 'نويت أن', for: 'لمدة', days: 'يوماً', begin: 'ابدأ — بسم الله', active: 'المهمات النشطة', completed: 'المكتملة', endedTitle: 'منتهية', accepted: 'تقبل الله', endedEarly: 'انتهت مبكراً — نيتك كُتبت', tryAgain: 'حاول مجدداً', bonus: 'مكافأة', missesUsed: 'أيام فائتة', remaining: 'متبقي', allFive: 'الصلوات الخمس', onTime: 'في الوقت', inJamaah: 'في جماعة', custom: 'مخصص', allowingUpTo: 'بحد أقصى', misses: 'أيام فائتة', verbPray: 'أصلي', verbDo: 'أؤدي', verbRead: 'أقرأ', verbGive: 'أتصدق بـ', verbSay: 'أقول', missedBeforeLose: 'فاتك {used} من {allowed} قبل الخسارة', mayMiss: 'ويمكنك تفويت' },
  guide: {
    insideTitle: 'ما في التطبيق',
    insideDesc: 'أربعة أمور يتابعها التطبيق. يمكنك تجاهل أيٍّ منها.',
    areaPrayers: 'الصلوات الخمس',
    areaPrayersDesc: 'علّم كل صلاة بعد أدائها — في الوقت، في جماعة، متأخرة، أو فائتة. وما تعلّمه فائتاً يُضاف إلى القضاء تلقائياً.',
    areaQadha: 'القضاء، بالعدّ التنازلي',
    areaQadhaDesc: 'صلواتك الفائتة، عدّاد لكل صلاة. حدّد كم تقضي في اليوم ليحسب التطبيق موعد انتهائك.',
    areaHabits: 'عادات السنّة',
    areaHabitsDesc: 'الأذكار والأدعية والقرآن وسنن الأدب الصغيرة. والمستوى يحدّد أيّها مفعّل.',
    areaProgress: 'السلاسل والمهمات والرسوم',
    areaProgressDesc: 'المهمات عهود قصيرة تكتبها بنفسك. والتحليلات ترسم كل ما علّمته مع مرور الأسابيع.',
    levelWhat: 'المستوى ببساطة هو أي عادات السنّة مفعّلة — لا أكثر.',
    levelManual: 'المستويات لا تتغيّر من تلقاء نفسها، ولا شيء مقفل. بدّل متى شئت؛ سجلّك محفوظ في الحالتين.',
    habitsCount: '{n} عادة',
    levelEasyDesc: 'الأذكار والأدعية الأساسية — الصباح والمساء وقبل النوم.',
    levelMediumDesc: 'يضيف أدعية اليوم وصلاة الضحى.',
    levelHardDesc: 'يضيف الوضوء قبل النوم وسنن الأدب الدقيقة.',
    levelSahabahDesc: 'يضيف القرآن اليومي والاستغفار والصلاة على النبي والصدقة.',
    levelCustomDesc: 'لا شيء جاهز — فعّل ما تريده بالضبط.',
    hintHome: 'يومك في لمحة',
    hintHomeDesc: 'الرقم الكبير هو ما تبقّى من القضاء. تحته ما لم يكتمل اليوم، ثم كيف مرّت الأيام الخمسة الماضية.',
    hintPrayers: 'تعليم الصلوات',
    hintPrayersDesc: 'اختر حالة لكل صلاة. وما تعلّمه فائتاً يُضاف إلى القضاء. استخدم الأسهم في الأعلى لتعبئة يوم سابق.',
    hintQadha: 'قضاء ما فات',
    hintQadhaDesc: 'حدّد هدفاً يومياً ليتحدّث تاريخ الانتهاء تبعاً له. استخدم +/− على أي صلاة لتسجيل ما قضيته.',
    hintHabits: 'المستويات مجرّد قوالب',
    hintHabitsDesc: 'المستوى يفعّل مجموعة عادات. ولإسقاط عادة واحدة اضغط أيقونة الإيقاف — ويبقى مستواك كما هو.',
    hintMissions: 'المهمات',
    hintMissionsDesc: 'عهد قصير تكتبه بنفسك — «الخمس في وقتها سبعة أيام». يُتابَع تلقائياً مما تعلّمه أصلاً.',
    hintInsights: 'قراءة الرسوم',
    hintInsightsDesc: 'كل ما هنا مأخوذ مما علّمته، فيمتلئ مع مرور الأسابيع. والرسم الفارغ يعني ببساطة أن الأسبوع في أوّله.',
    hintCalendar: 'التقويمان معاً',
    hintCalendarDesc: 'الهجري والميلادي جنباً إلى جنب، مع أيام صيام السنّة والعيدين.',
    title: 'كيف يعمل التطبيق',
    subtitle: 'كل شاشة، وما الغرض منها.',
    openGuide: 'كيف يعمل التطبيق',
    openGuideDesc: 'دليل قصير لكل شاشة',
    replayHints: 'إظهار تلميحات البداية من جديد',
    replayHintsDone: 'أُعيد ضبط التلميحات — ستظهر عند زيارة كل شاشة',
    sectionScreens: 'الشاشات',
    sectionLevels: 'مستويات العادات',
    sectionData: 'بياناتك',
    dataDesc: 'كل شيء يبقى على هذا الجهاز. لا حساب ولا رفع لأي بيانات. صدّر نسخة احتياطية من الإعدادات إن أردت نسخة — ذلك الملف هو الطريقة الوحيدة لنقل بياناتك إلى جهاز آخر.',
  },
  qadhaSetup: {
    open: 'ساعدني في الحساب',
    intro: 'تاريخان تقريبيان يكفيان. لا شيء هنا يحتاج إلى دقة.',
    pubertyQ: 'متى بلغت تقريباً؟',
    pubertyHint: 'السن الذي صرت فيه مكلَّفاً. إن لم تكن متأكداً، يقدّره الكثيرون بين 12 و15 عاماً.',
    startedQ: 'هل بدأت الصلاة بانتظام؟',
    startedYes: 'نعم',
    startedYesDesc: 'الصلاة الآن عادة منتظمة',
    startedNo: 'ليس بعد',
    startedNoDesc: 'أبدأ اليوم',
    whenQ: 'متى بدأت تقريباً؟',
    whenHint: 'تقريباً حين صارت الصلاة عادة يومية.',
    resultLabel: 'الصلوات الفائتة المقدّرة',
    perPrayer: 'لكل صلاة — الفجر والظهر والعصر والمغرب والعشاء',
    totalLabel: '{n} صلاة في المجموع',
    menstrualToggle: 'احتساب أيام الحيض',
    menstrualDesc: 'الصلوات التي تفوت في الحيض لا تُقضى، فيمكن استثناء تلك الأيام.',
    menstrualPerMonth: 'أيام في الشهر',
    excludedNote: 'استُثنيت {n} يوماً',
    saferNote: 'من المرجّح أنك صلّيت بعض الصلوات خلال هذه الفترة. يمكنك تقديرها وطرحها بنفسك — لكن كثيرين يختارون عدّها كاملة احتياطاً. أن تصلّي بضع صلوات زائدة خير من أن تفوتك بعضها.',
    disclaimer: 'هذا تقدير فقط وليس فتوى. إن كنت في شك فاسأل أهل العلم.',
    apply: 'استخدم هذا التقدير',
    manual: 'أعرف أرقامي بالفعل',
    month: 'الشهر',
    year: 'السنة',
  },
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
