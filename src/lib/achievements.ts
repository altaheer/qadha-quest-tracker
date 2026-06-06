/**
 * Achievement system for the Ibadah app.
 *
 * Every achievement is checkable from data that ALREADY exists in
 * localStorage, so they unlock retroactively the moment this ships.
 * No "streak from ship-date" tracking is required — streaks were swapped
 * for simple cumulative totals.
 *
 * The hook (useAchievements) calls checkAchievements(stats) with computed
 * stats, gets back the set of unlocked ids, and persists unlock dates so an
 * achievement stays earned forever once reached.
 *
 * Language handling mirrors hadith.ts:
 *   'en' and 'sv' → English   |   'tr' → Turkish   |   'ar' → Arabic
 */

export type AchievementCategory =
  | 'prayer'
  | 'qadha'
  | 'habits'
  | 'levels'
  | 'timebound'
  | 'milestone'
  | 'secret';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  icon: string;            // lucide-react icon name
  name_en: string;
  name_tr: string;
  name_ar: string;
  desc_en: string;
  desc_tr: string;
  desc_ar: string;
  /** Returns true when unlocked, given the computed stats. */
  check: (s: AchievementStats) => boolean;
}

/**
 * All the numbers the checker needs. The hook computes these from the
 * existing localStorage data (prayer-history, qadha counts, habit history,
 * nafilah history, timebound history, points, app age, flags).
 */
export interface AchievementStats {
  firstPrayerMarked: boolean;
  fajrOnTimeMax: number;        // longest run of Fajr on-time (still computable from history)
  allFiveDaysMax: number;       // longest run of days with all 5 complete
  anyAllFiveDay: boolean;       // at least one day with all 5 marked
  jamaahTotal: number;          // total jamaah prayers ever
  comboMax: number;             // best combo ever reached

  qadhaLogged: boolean;         // ever logged a qadha
  qadhaMadeUp: number;          // total made up (decrements over time)
  qadhaReachedZero: boolean;    // had some, now zero
  qadhaGoalSet: boolean;        // a daily goal has been set

  // habit cumulative totals (count of days each was completed, ever)
  duaAfterEatingTotal: number;
  siwakTotal: number;
  ishraqTotal: number;
  tahajjudTotal: number;
  quranTotal: number;
  sadaqahTotal: number;
  morningAdhkarTotal: number;
  sleepHabitsAnyDay: boolean;
  allSahabahOneDay: boolean;

  movedUpFromEasy: boolean;
  switchedToSahabah: boolean;

  jumuahTotal: number;
  ayyamAlBeedComplete: number;  // times all 3 days completed
  mondayThursdaySameWeek: boolean;
  arafahLogged: boolean;
  ashuraLogged: boolean;
  ramadanComplete: boolean;

  appDays: number;              // days since earliest history entry
  backupExported: boolean;
  backupRestored: boolean;
  languageChanged: boolean;
  totalPoints: number;

  unlockedCount: number;        // how many OTHER achievements are unlocked (for the meta)
}

export const achievements: Achievement[] = [
  // ───────── PRAYER ─────────
  { id: 'bismillah', category: 'prayer', icon: 'Sparkles',
    name_en: 'Bismillah', name_tr: 'Bismillah', name_ar: 'بسم الله',
    desc_en: 'Marked your first prayer. It begins.',
    desc_tr: 'İlk namazını işaretledin. Başlıyor.',
    desc_ar: 'سجّلت أول صلاة لك. تبدأ الرحلة.',
    check: s => s.firstPrayerMarked },

  { id: 'dawn-patrol', category: 'prayer', icon: 'Sunrise',
    name_en: 'Dawn Patrol', name_tr: 'Şafak Nöbeti', name_ar: 'حُرّاس الفجر',
    desc_en: 'Fajr on time, 7 days. The street was empty. You weren\'t.',
    desc_tr: 'Sabah namazı vaktinde, 7 gün. Sokak boştu. Sen değildin.',
    desc_ar: 'الفجر في وقته، 7 أيام. كان الشارع فارغاً. أنت لم تكن.',
    check: s => s.fajrOnTimeMax >= 7 },

  { id: 'people-of-the-dawn', category: 'prayer', icon: 'Sunrise',
    name_en: 'People of the Dawn', name_tr: 'Fecrin Ehli', name_ar: 'أهل الفجر',
    desc_en: 'Fajr on time, 30 days. Ahl al-Fajr.',
    desc_tr: 'Sabah namazı vaktinde, 30 gün. Ehl-i Fecr.',
    desc_ar: 'الفجر في وقته، 30 يوماً. أهل الفجر.',
    check: s => s.fajrOnTimeMax >= 30 },

  { id: 'five-for-five', category: 'prayer', icon: 'CheckCheck',
    name_en: 'Five for Five', name_tr: 'Beşte Beş', name_ar: 'خمسة من خمسة',
    desc_en: 'All five prayers marked in one day.',
    desc_tr: 'Bir günde beş namazın tamamı işaretlendi.',
    desc_ar: 'الصلوات الخمس كلها في يوم واحد.',
    check: s => s.anyAllFiveDay },

  { id: 'seven-skies', category: 'prayer', icon: 'Layers',
    name_en: 'Seven Skies', name_tr: 'Yedi Gök', name_ar: 'السماوات السبع',
    desc_en: 'Seven days, all five complete.',
    desc_tr: 'Yedi gün, beş namaz tamam.',
    desc_ar: 'سبعة أيام، الصلوات الخمس كاملة.',
    check: s => s.allFiveDaysMax >= 7 },

  { id: 'the-steadfast', category: 'prayer', icon: 'Mountain',
    name_en: 'The Steadfast', name_tr: 'Sabırlı', name_ar: 'الصابر',
    desc_en: 'Thirty days, all five complete. As-Sabir.',
    desc_tr: 'Otuz gün, beş namaz tamam. Es-Sâbir.',
    desc_ar: 'ثلاثون يوماً، الصلوات الخمس كاملة. الصابر.',
    check: s => s.allFiveDaysMax >= 30 },

  { id: 'first-saff', category: 'prayer', icon: 'Users',
    name_en: 'First Saff', name_tr: 'İlk Saf', name_ar: 'الصف الأول',
    desc_en: '50 prayers in Jamaah. The reward is 27 times. You know the math.',
    desc_tr: '50 namaz cemaatle. Sevabı 27 kat. Hesabı biliyorsun.',
    desc_ar: '50 صلاة في جماعة. الأجر 27 ضعفاً. تعرف الحساب.',
    check: s => s.jamaahTotal >= 50 },

  { id: 'heel-to-heel', category: 'prayer', icon: 'Users',
    name_en: 'Heel to Heel', name_tr: 'Omuz Omuza', name_ar: 'كعباً بكعب',
    desc_en: '100 prayers in Jamaah. You know the sunnah of the rows.',
    desc_tr: '100 namaz cemaatle. Safların sünnetini biliyorsun.',
    desc_ar: '100 صلاة في جماعة. تعرف سنة الصفوف.',
    check: s => s.jamaahTotal >= 100 },

  { id: 'the-spark', category: 'prayer', icon: 'Zap',
    name_en: 'The Spark', name_tr: 'Kıvılcım', name_ar: 'الشرارة',
    desc_en: 'Reached a 10-combo.',
    desc_tr: '10\'luk kombo yaptın.',
    desc_ar: 'بلغت سلسلة من 10.',
    check: s => s.comboMax >= 10 },

  { id: 'lantern', category: 'prayer', icon: 'Flame',
    name_en: 'Lantern', name_tr: 'Fener', name_ar: 'المصباح',
    desc_en: 'Reached a 50-combo.',
    desc_tr: '50\'lik kombo yaptın.',
    desc_ar: 'بلغت سلسلة من 50.',
    check: s => s.comboMax >= 50 },

  { id: 'whole-masjid-heard', category: 'prayer', icon: 'Flame',
    name_en: 'The Whole Masjid Heard', name_tr: 'Tüm Cami Duydu', name_ar: 'سمع المسجد كله',
    desc_en: 'Reached a 200-combo. Honestly, respect.',
    desc_tr: '200\'lük kombo yaptın. Gerçekten, saygı.',
    desc_ar: 'بلغت سلسلة من 200. بصدق، احترام.',
    check: s => s.comboMax >= 200 },

  // ───────── QADHA ─────────
  { id: 'turning-back', category: 'qadha', icon: 'RotateCcw',
    name_en: 'Turning Back', name_tr: 'Dönüş', name_ar: 'التوبة',
    desc_en: 'Logged your first Qadha prayer. Tawbah.',
    desc_tr: 'İlk kaza namazını kaydettin. Tövbe.',
    desc_ar: 'سجّلت أول صلاة قضاء. توبة.',
    check: s => s.qadhaLogged },

  { id: 'settling-up', category: 'qadha', icon: 'Check',
    name_en: 'Settling Up', name_tr: 'Hesaplaşma', name_ar: 'تسوية',
    desc_en: 'Made up 10 Qadha prayers.',
    desc_tr: '10 kaza namazı kıldın.',
    desc_ar: 'قضيت 10 صلوات.',
    check: s => s.qadhaMadeUp >= 10 },

  { id: 'brick-by-brick', category: 'qadha', icon: 'Brick',
    name_en: 'Brick by Brick', name_tr: 'Tuğla Tuğla', name_ar: 'لبنة لبنة',
    desc_en: 'Made up 50 Qadha prayers.',
    desc_tr: '50 kaza namazı kıldın.',
    desc_ar: 'قضيت 50 صلاة.',
    check: s => s.qadhaMadeUp >= 50 },

  { id: 'the-reckoning', category: 'qadha', icon: 'Scale',
    name_en: 'The Reckoning', name_tr: 'Muhasebe', name_ar: 'الحساب',
    desc_en: 'Made up 100 Qadha prayers. You faced the count yourself.',
    desc_tr: '100 kaza namazı kıldın. Hesabı kendin karşıladın.',
    desc_ar: 'قضيت 100 صلاة. واجهت الحساب بنفسك.',
    check: s => s.qadhaMadeUp >= 100 },

  { id: 'five-hundred', category: 'qadha', icon: 'Scale',
    name_en: 'Five Hundred', name_tr: 'Beş Yüz', name_ar: 'خمسمئة',
    desc_en: 'Made up 500 Qadha prayers. Quiet, relentless work.',
    desc_tr: '500 kaza namazı kıldın. Sessiz, yılmaz bir çaba.',
    desc_ar: 'قضيت 500 صلاة. عمل هادئ لا يتوقف.',
    check: s => s.qadhaMadeUp >= 500 },

  { id: 'wiped-clean', category: 'qadha', icon: 'Sparkles',
    name_en: 'Wiped Clean', name_tr: 'Tertemiz', name_ar: 'صحيفة بيضاء',
    desc_en: 'Reached zero Qadha. This one hits different.',
    desc_tr: 'Kaza borcun sıfırlandı. Bu bir başka.',
    desc_ar: 'وصلت إلى صفر قضاء. لهذا طعم مختلف.',
    check: s => s.qadhaReachedZero },

  { id: 'ledger-keeper', category: 'qadha', icon: 'BookMarked',
    name_en: 'The Ledger Keeper', name_tr: 'Defter Tutan', name_ar: 'حافظ السجل',
    desc_en: 'Set a daily Qadha goal.',
    desc_tr: 'Günlük kaza hedefi belirledin.',
    desc_ar: 'حدّدت هدفاً يومياً للقضاء.',
    check: s => s.qadhaGoalSet },

  // ───────── HABITS (cumulative totals) ─────────
  { id: 'shukr', category: 'habits', icon: 'Heart',
    name_en: 'Shukr', name_tr: 'Şükür', name_ar: 'شكر',
    desc_en: 'Said du\'a after eating 30 times.',
    desc_tr: 'Yemekten sonra 30 kez dua ettin.',
    desc_ar: 'دعوت بعد الطعام 30 مرة.',
    check: s => s.duaAfterEatingTotal >= 30 },

  { id: 'miswak-militia', category: 'habits', icon: 'Brush',
    name_en: 'The Miswak Militia', name_tr: 'Misvak Takımı', name_ar: 'فرقة السواك',
    desc_en: 'Logged siwak 30 times. Dental hygiene and sunnah. Win-win.',
    desc_tr: 'Misvağı 30 kez kaydettin. Hem diş sağlığı hem sünnet.',
    desc_ar: 'سجّلت السواك 30 مرة. نظافة وسُنّة معاً.',
    check: s => s.siwakTotal >= 30 },

  { id: 'beat-the-sun', category: 'habits', icon: 'Sunrise',
    name_en: 'Beat the Sun', name_tr: 'Güneşi Geç', name_ar: 'سبق الشمس',
    desc_en: 'Completed Ishraq 10 times. You stayed up after Fajr. That\'s hard.',
    desc_tr: 'İşrak\'ı 10 kez kıldın. Sabahtan sonra uyanık kaldın. Bu zor.',
    desc_ar: 'صلّيت الإشراق 10 مرات. بقيت مستيقظاً بعد الفجر. هذا صعب.',
    check: s => s.ishraqTotal >= 10 },

  { id: 'night-caller', category: 'habits', icon: 'Moon',
    name_en: 'The Night Caller', name_tr: 'Gece Çağıran', name_ar: 'منادي الليل',
    desc_en: 'Completed Tahajjud 20 times.',
    desc_tr: 'Teheccüd\'ü 20 kez kıldın.',
    desc_ar: 'صلّيت التهجد 20 مرة.',
    check: s => s.tahajjudTotal >= 20 },

  { id: 'third-of-the-night', category: 'habits', icon: 'Moon',
    name_en: 'The Third of the Night', name_tr: 'Gecenin Üçte Biri', name_ar: 'ثلث الليل',
    desc_en: 'Completed Tahajjud 50 times. He descends, and you\'re awake.',
    desc_tr: 'Teheccüd\'ü 50 kez kıldın. O iner, sen uyanıksın.',
    desc_ar: 'صلّيت التهجد 50 مرة. ينزل سبحانه، وأنت مستيقظ.',
    check: s => s.tahajjudTotal >= 50 },

  { id: 'one-page-closer', category: 'habits', icon: 'BookOpen',
    name_en: 'One Page Closer', name_tr: 'Bir Sayfa Daha', name_ar: 'صفحة أقرب',
    desc_en: 'Read Quran on 7 separate days.',
    desc_tr: '7 ayrı gün Kur\'an okudun.',
    desc_ar: 'قرأت القرآن في 7 أيام.',
    check: s => s.quranTotal >= 7 },

  { id: 'a-juz-a-month', category: 'habits', icon: 'BookOpen',
    name_en: 'A Juz a Month', name_tr: 'Ayda Bir Cüz', name_ar: 'جزء في الشهر',
    desc_en: 'Read Quran on 30 separate days.',
    desc_tr: '30 ayrı gün Kur\'an okudun.',
    desc_ar: 'قرأت القرآن في 30 يوماً.',
    check: s => s.quranTotal >= 30 },

  { id: 'open-hand', category: 'habits', icon: 'HandHeart',
    name_en: 'The Open Hand', name_tr: 'Açık El', name_ar: 'اليد المعطاءة',
    desc_en: 'Gave sadaqah on 7 separate days.',
    desc_tr: '7 ayrı gün sadaka verdin.',
    desc_ar: 'تصدّقت في 7 أيام.',
    check: s => s.sadaqahTotal >= 7 },

  { id: 'river-of-giving', category: 'habits', icon: 'HandHeart',
    name_en: 'River of Giving', name_tr: 'Cömertlik Nehri', name_ar: 'نهر العطاء',
    desc_en: 'Gave sadaqah on 30 separate days.',
    desc_tr: '30 ayrı gün sadaka verdin.',
    desc_ar: 'تصدّقت في 30 يوماً.',
    check: s => s.sadaqahTotal >= 30 },

  { id: 'sons-of-the-morning', category: 'habits', icon: 'Sun',
    name_en: 'Sons of the Morning', name_tr: 'Sabahın Çocukları', name_ar: 'أبناء الصباح',
    desc_en: 'Completed morning adhkar 14 times.',
    desc_tr: 'Sabah zikirlerini 14 kez tamamladın.',
    desc_ar: 'أتممت أذكار الصباح 14 مرة.',
    check: s => s.morningAdhkarTotal >= 14 },

  { id: 'keeper-of-the-night', category: 'habits', icon: 'BedDouble',
    name_en: 'Keeper of the Night', name_tr: 'Gecenin Bekçisi', name_ar: 'حارس الليل',
    desc_en: 'Completed all sleep sunnah in a single night.',
    desc_tr: 'Bir gecede tüm uyku sünnetlerini tamamladın.',
    desc_ar: 'أتممت كل سنن النوم في ليلة واحدة.',
    check: s => s.sleepHabitsAnyDay },

  // ───────── LEVELS (current-state only) ─────────
  { id: 'shifting-gears', category: 'levels', icon: 'TrendingUp',
    name_en: 'Shifting Gears', name_tr: 'Vites Yükseltme', name_ar: 'رفع المستوى',
    desc_en: 'Moved up from Easy level.',
    desc_tr: 'Kolay seviyeden yükseldin.',
    desc_ar: 'ارتقيت من المستوى السهل.',
    check: s => s.movedUpFromEasy },

  { id: 'sahabah-engaged', category: 'levels', icon: 'Star',
    name_en: 'Sahabah Mode: Engaged', name_tr: 'Sahabe Modu: Aktif', name_ar: 'وضع الصحابة: مُفعّل',
    desc_en: 'Switched to Sahabah level. Bismillah. We\'ll pray for you.',
    desc_tr: 'Sahabe seviyesine geçtin. Bismillah. Senin için dua ederiz.',
    desc_ar: 'انتقلت إلى مستوى الصحابة. بسم الله. سندعو لك.',
    check: s => s.switchedToSahabah },

  { id: 'tabiun-energy', category: 'levels', icon: 'Star',
    name_en: 'Tabi\'un Energy', name_tr: 'Tâbiîn Enerjisi', name_ar: 'روح التابعين',
    desc_en: 'Completed all Sahabah habits in a single day. The successors would approve.',
    desc_tr: 'Bir günde tüm Sahabe vanalarını tamamladın. Tâbiîn onaylardı.',
    desc_ar: 'أتممت كل عادات الصحابة في يوم واحد. التابعون يرضون.',
    check: s => s.allSahabahOneDay },

  // ───────── TIME-BOUND ─────────
  { id: 'friday-person', category: 'timebound', icon: 'CalendarDays',
    name_en: 'Friday Person', name_tr: 'Cuma İnsanı', name_ar: 'صاحب الجمعة',
    desc_en: 'Logged Jumu\'ah 4 times.',
    desc_tr: 'Cuma\'yı 4 kez kaydettin.',
    desc_ar: 'سجّلت الجمعة 4 مرات.',
    check: s => s.jumuahTotal >= 4 },

  { id: 'white-nights', category: 'timebound', icon: 'Moon',
    name_en: 'The White Nights', name_tr: 'Beyaz Geceler', name_ar: 'الليالي البيض',
    desc_en: 'Completed Ayyam al-Beed (all three days) once.',
    desc_tr: 'Eyyâm-ı Bîd\'i (üç gün) bir kez tamamladın.',
    desc_ar: 'أتممت أيام البيض (الثلاثة) مرة.',
    check: s => s.ayyamAlBeedComplete >= 1 },

  { id: 'moonchild', category: 'timebound', icon: 'Moon',
    name_en: 'Moonchild', name_tr: 'Ay Çocuğu', name_ar: 'ابن القمر',
    desc_en: 'Completed Ayyam al-Beed three months.',
    desc_tr: 'Eyyâm-ı Bîd\'i üç ay tamamladın.',
    desc_ar: 'أتممت أيام البيض ثلاثة أشهر.',
    check: s => s.ayyamAlBeedComplete >= 3 },

  { id: 'twice-a-week', category: 'timebound', icon: 'CalendarCheck',
    name_en: 'Twice a Week', name_tr: 'Haftada İki', name_ar: 'مرتين في الأسبوع',
    desc_en: 'Fasted Monday and Thursday in the same week. The gates open, deeds rise.',
    desc_tr: 'Aynı hafta Pazartesi ve Perşembe oruç tuttun. Kapılar açılır, ameller yükselir.',
    desc_ar: 'صمت الإثنين والخميس في نفس الأسبوع. تُفتح الأبواب، وتُرفع الأعمال.',
    check: s => s.mondayThursdaySameWeek },

  { id: 'the-standing', category: 'timebound', icon: 'Mountain',
    name_en: 'The Standing', name_tr: 'Vakfe', name_ar: 'الوقوف',
    desc_en: 'Logged the Arafah fast. No day the fire is further from a soul.',
    desc_tr: 'Arefe orucunu kaydettin. Ateşin nefisten en uzak olduğu gün.',
    desc_ar: 'سجّلت صيام عرفة. لا يوم النار فيه أبعد عن النفس.',
    check: s => s.arafahLogged },

  { id: 'the-tenth', category: 'timebound', icon: 'CalendarCheck',
    name_en: 'The Tenth', name_tr: 'Onuncu Gün', name_ar: 'العاشر',
    desc_en: 'Logged the Ashura fast.',
    desc_tr: 'Aşure orucunu kaydettin.',
    desc_ar: 'سجّلت صيام عاشوراء.',
    check: s => s.ashuraLogged },

  { id: 'thirty-sunsets', category: 'timebound', icon: 'Moon',
    name_en: 'Thirty Sunsets', name_tr: 'Otuz Gün Batımı', name_ar: 'ثلاثون غروباً',
    desc_en: 'Logged a full Ramadan.',
    desc_tr: 'Tam bir Ramazan kaydettin.',
    desc_ar: 'سجّلت رمضان كاملاً.',
    check: s => s.ramadanComplete },

  // ───────── MILESTONE / GENERAL ─────────
  { id: 'settling-in', category: 'milestone', icon: 'Home',
    name_en: 'Settling In', name_tr: 'Yerleşiyor', name_ar: 'الاستقرار',
    desc_en: 'Used the app for 7 days.',
    desc_tr: 'Uygulamayı 7 gün kullandın.',
    desc_ar: 'استخدمت التطبيق 7 أيام.',
    check: s => s.appDays >= 7 },

  { id: 'a-moon-cycle', category: 'milestone', icon: 'Moon',
    name_en: 'A Moon Cycle', name_tr: 'Bir Ay Döngüsü', name_ar: 'دورة قمرية',
    desc_en: 'Used the app for 30 days.',
    desc_tr: 'Uygulamayı 30 gün kullandın.',
    desc_ar: 'استخدمت التطبيق 30 يوماً.',
    check: s => s.appDays >= 30 },

  { id: 'a-whole-season', category: 'milestone', icon: 'Leaf',
    name_en: 'A Whole Season', name_tr: 'Koca Bir Mevsim', name_ar: 'فصل كامل',
    desc_en: 'Used the app for 90 days.',
    desc_tr: 'Uygulamayı 90 gün kullandın.',
    desc_ar: 'استخدمت التطبيق 90 يوماً.',
    check: s => s.appDays >= 90 },

  { id: 'safekeeper', category: 'milestone', icon: 'Download',
    name_en: 'The Safekeeper', name_tr: 'Koruyucu', name_ar: 'الحافظ',
    desc_en: 'Exported a backup. Tie your camel.',
    desc_tr: 'Yedek aldın. Deveni bağla.',
    desc_ar: 'صدّرت نسخة احتياطية. اعقل بعيرك.',
    check: s => s.backupExported },

  { id: 'the-return', category: 'milestone', icon: 'Upload',
    name_en: 'The Return', name_tr: 'Dönüş', name_ar: 'العودة',
    desc_en: 'Restored from a backup. Welcome home.',
    desc_tr: 'Yedekten geri yükledin. Tekrar hoş geldin.',
    desc_ar: 'استعدت من نسخة احتياطية. أهلاً بعودتك.',
    check: s => s.backupRestored },

  { id: 'tongues-of-the-ummah', category: 'milestone', icon: 'Languages',
    name_en: 'Tongues of the Ummah', name_tr: 'Ümmetin Dilleri', name_ar: 'ألسنة الأمة',
    desc_en: 'Changed the app language. From Arabia to the world.',
    desc_tr: 'Uygulama dilini değiştirdin. Arabistan\'dan dünyaya.',
    desc_ar: 'غيّرت لغة التطبيق. من الجزيرة إلى العالم.',
    check: s => s.languageChanged },

  { id: 'a-thousand', category: 'milestone', icon: 'Trophy',
    name_en: 'A Thousand', name_tr: 'Bin', name_ar: 'ألف',
    desc_en: 'Earned 1,000 total points.',
    desc_tr: 'Toplam 1.000 puan kazandın.',
    desc_ar: 'جمعت 1000 نقطة.',
    check: s => s.totalPoints >= 1000 },

  { id: 'the-ten-thousand', category: 'milestone', icon: 'Trophy',
    name_en: 'The Ten Thousand', name_tr: 'On Bin', name_ar: 'عشرة آلاف',
    desc_en: 'Earned 10,000 total points.',
    desc_tr: 'Toplam 10.000 puan kazandın.',
    desc_ar: 'جمعت 10000 نقطة.',
    check: s => s.totalPoints >= 10000 },

  { id: 'the-long-walk', category: 'milestone', icon: 'Footprints',
    name_en: 'The Long Walk', name_tr: 'Uzun Yürüyüş', name_ar: 'المسير الطويل',
    desc_en: 'Earned 50,000 total points. This was never about the points, was it.',
    desc_tr: 'Toplam 50.000 puan kazandın. Mesele hiç puan değildi, değil mi.',
    desc_ar: 'جمعت 50000 نقطة. لم يكن الأمر يوماً عن النقاط، أليس كذلك.',
    check: s => s.totalPoints >= 50000 },

  // ───────── SECRET META ─────────
  { id: 'khatam', category: 'secret', icon: 'Award',
    name_en: 'Khatam', name_tr: 'Hatim', name_ar: 'ختم',
    desc_en: 'Unlocked everything else. Now close the app and go make du\'a for whoever built it.',
    desc_tr: 'Diğer her şeyi açtın. Şimdi uygulamayı kapat ve yapana dua et.',
    desc_ar: 'فتحت كل شيء آخر. الآن أغلق التطبيق وادعُ لمن بناه.',
    check: s => s.unlockedCount >= 63 },
];

/** Returns the set of unlocked achievement ids for the given stats. */
export function checkAchievements(stats: AchievementStats): string[] {
  return achievements.filter(a => a.check(stats)).map(a => a.id);
}

export function getAchievementName(a: Achievement, lang: string): string {
  if (lang === 'tr') return a.name_tr;
  if (lang === 'ar') return a.name_ar;
  return a.name_en;
}

export function getAchievementDesc(a: Achievement, lang: string): string {
  if (lang === 'tr') return a.desc_tr;
  if (lang === 'ar') return a.desc_ar;
  return a.desc_en;
}
