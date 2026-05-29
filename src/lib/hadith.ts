/**
 * Hadith references for all habits and per-prayer sunnah items.
 *
 * Language handling:
 * - 'en' and 'sv' → display the `en` field
 * - 'tr'          → display the `tr` field
 * - 'ar'          → display `arabic` if available, otherwise `en`
 *
 * If an id is not found, the UI falls back to t('hadith.comingSoon').
 */

export interface HadithInfo {
  en: string;
  tr: string;
  arabic?: string;
  source: string;
  fadl_en: string;
  fadl_tr: string;
}

export const hadithData: Record<string, HadithInfo> = {

  // ─────────────────────────────────────────────
  // DAILY HABITS — Morning
  // ─────────────────────────────────────────────

  'morning-adhkar': {
    en: 'The Prophet ﷺ commanded the morning and evening remembrances as protection throughout the day and night.',
    tr: 'Peygamber ﷺ sabah ve akşam zikirlerini gün ve gece boyunca koruma olarak emretti.',
    source: 'Hisn al-Muslim — compiled from Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud',
    fadl_en: 'Protection from all harm throughout the day.',
    fadl_tr: 'Gün boyunca her türlü zarardan korunma.',
  },

  'wake-dua': {
    en: 'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
    tr: 'Bizi öldürdükten sonra tekrar dirilten Allah\'a hamd olsun; dönüş O\'nadır.',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    source: 'Sahih al-Bukhari 6312 — narrated by Hudhayfah (r.a.)',
    fadl_en: 'Begin the day with gratitude, acknowledging that waking is a gift from Allah.',
    fadl_tr: 'Uyanmanın Allah\'tan bir nimet olduğunu kabul ederek güne şükranla başlamak.',
  },

  'wake-siwak': {
    en: 'When the Prophet ﷺ got up at night, he would clean his mouth with the siwak.',
    tr: 'Peygamber ﷺ gece kalktığında ağzını misvakla temizlerdi.',
    source: 'Sahih al-Bukhari 245, Sahih Muslim 255 — narrated by Hudhayfah (r.a.)',
    fadl_en: 'Purification of the mouth; a consistent habit of the Prophet ﷺ.',
    fadl_tr: 'Ağzı temizlemek; Peygamber ﷺ\'in tutarlı bir alışkanlığı.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Evening
  // ─────────────────────────────────────────────

  'evening-adhkar': {
    en: 'The companion to morning remembrance — protection through the night until morning.',
    tr: 'Sabah zikirlerinin tamamlayıcısı — sabaha kadar gece boyunca koruma.',
    source: 'Hisn al-Muslim — compiled from Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud',
    fadl_en: 'Protection from all harm through the night.',
    fadl_tr: 'Gece boyunca her türlü zarardan korunma.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Before Sleep
  // ─────────────────────────────────────────────

  'sleep-dua': {
    en: 'In Your name, O Allah, I die and I live.',
    tr: 'Allah\'ım, Senin isminle ölür ve yaşarım.',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'Sahih al-Bukhari 6324 — narrated by Hudhayfah (r.a.)',
    fadl_en: 'Entrusting one\'s soul to Allah before sleep.',
    fadl_tr: 'Uyumadan önce ruhunu Allah\'a emanet etmek.',
  },

  'sleep-kursi': {
    en: 'Whoever recites Ayat al-Kursi when going to bed, Allah appoints a guardian over him and no shaytan comes near him until morning.',
    tr: 'Kim yatarken Ayetü\'l-Kürsî\'yi okursa, Allah ona bir koruyucu tayin eder ve sabaha kadar hiçbir şeytan ona yaklaşamaz.',
    source: 'Sahih al-Bukhari 2311 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Continuous protection from shaytan all night.',
    fadl_tr: 'Gece boyunca şeytandan sürekli korunma.',
  },

  'sleep-mulk': {
    en: 'There is a surah in the Quran of thirty verses which interceded for a man until he was forgiven — it is "Blessed is He in Whose Hand is the dominion" (Surah Al-Mulk).',
    tr: 'Kur\'an\'da otuz ayetlik bir sure vardır; bir adam için şefaat etti ve o adam affedildi — bu sure Mülk suresidir.',
    source: 'Sunan Abi Dawud 1400, Sunan al-Tirmidhi 2891 (hasan) — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Intercession on the Day of Judgment and protection from punishment of the grave.',
    fadl_tr: 'Kıyamet gününde şefaat ve kabir azabından korunma.',
  },

  'sleep-3quls': {
    en: 'Every night when the Prophet ﷺ went to bed, he would cup his hands together, blow into them, recite Al-Ikhlas, Al-Falaq, and An-Nas, then wipe over his body starting from his head. He did this three times.',
    tr: 'Peygamber ﷺ her gece yatağa gittiğinde ellerini birleştirip içlerine üfler, İhlâs, Felak ve Nâs surelerini okur, ardından başından başlayarak ellerini vücuduna sürerdi. Bunu üç kez yapardı.',
    source: 'Sahih al-Bukhari 5017 — narrated by Aisha (r.a.)',
    fadl_en: 'Comprehensive protection from all forms of harm.',
    fadl_tr: 'Her türlü zarardan kapsamlı korunma.',
  },

  'sleep-baqarah': {
    en: 'Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.',
    tr: 'Geceleri Bakara suresinin son iki ayetini okuyan kimseye bu iki ayet yeter.',
    source: 'Sahih al-Bukhari 5009, Sahih Muslim 807 — narrated by Abu Mas\'ud al-Ansari (r.a.)',
    fadl_en: 'Sufficient protection for the night.',
    fadl_tr: 'Gece için yeterli koruma.',
  },

  'sleep-wudu': {
    en: 'When you go to your bed, perform wudu as you would for prayer, then lie down on your right side. If you die that night, you die upon the fitrah (natural disposition of Islam).',
    tr: 'Yatağına girdiğinde namaz için abdest aldığın gibi abdest al, sonra sağ tarafına uzan. O gece ölürsen fitrat üzere ölmüş olursun.',
    source: 'Sahih al-Bukhari 247, Sahih Muslim 2710 — narrated by al-Bara ibn Azib (r.a.)',
    fadl_en: 'Dying in a state of purity; sleeping upon the fitrah.',
    fadl_tr: 'Temiz bir halde ölmek; fitrat üzere uyumak.',
  },

  'sleep-right': {
    en: '...then lie down on your right side. (Part of the wudu-before-sleep hadith.)',
    tr: '...sonra sağ tarafına uzan. (Uyumadan önce abdest hadisinin devamı.)',
    source: 'Sahih al-Bukhari 247 — narrated by al-Bara ibn Azib (r.a.)',
    fadl_en: 'Following the Sunnah even in posture during sleep.',
    fadl_tr: 'Uyku pozisyonunda bile sünnete uymak.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Mealtime
  // ─────────────────────────────────────────────

  'bismillah': {
    en: 'When one of you eats, let him mention the name of Allah. If he forgets to mention it at the start, let him say: In the name of Allah at its beginning and its end.',
    tr: 'Biriniz yemek yediğinde Allah\'ın adını ansın. Başında anmayı unutursa: "Bismillahi evvelehu ve âhirehu" desin.',
    arabic: 'بِسْمِ اللهِ أَوَّلَهُ وَآخِرَهُ',
    source: 'Sunan Abi Dawud 3767, Sunan al-Tirmidhi 1858 (sahih) — narrated by Aisha (r.a.)',
    fadl_en: 'Blessing in the food; prevents shaytan from sharing the meal.',
    fadl_tr: 'Yemekte bereket; şeytanın yemekten pay almasını engeller.',
  },

  'dua-after-eating': {
    en: 'Whoever eats food and says: All praise is for Allah who fed me this and provided it for me without any might or power on my part — his past sins will be forgiven.',
    tr: 'Yemek yeyip de "Bunu bana yediren ve herhangi bir güç ve kuvvetim olmaksızın bana rızık olarak veren Allah\'a hamd olsun" diyen kimsenin geçmiş günahları bağışlanır.',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    source: 'Sunan Abi Dawud 4023, Sunan al-Tirmidhi 3458 (hasan) — narrated by Mu\'adh ibn Anas (r.a.)',
    fadl_en: 'Forgiveness of past sins.',
    fadl_tr: 'Geçmiş günahların bağışlanması.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Home
  // ─────────────────────────────────────────────

  'dua-leave-home': {
    en: 'Whoever says upon leaving his house: In the name of Allah, I place my trust in Allah, there is no might and no power except with Allah — it will be said to him: You are guided, sufficed and protected, and shaytan moves away from him.',
    tr: 'Evinden çıkarken "Bismillah, Allah\'a tevekkül ettim, güç ve kuvvet ancak Allah\'a aittir" diyen kişiye "Hidayete erdirildin, sana yetildi ve korundun" denilir ve şeytan ondan uzaklaşır.',
    arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    source: 'Sunan Abi Dawud 5095, Sunan al-Tirmidhi 3426 (sahih) — narrated by Anas (r.a.)',
    fadl_en: 'Guidance, sufficiency and protection when leaving the home.',
    fadl_tr: 'Evden çıkarken hidayet, yeterlilik ve koruma.',
  },

  'dua-enter-home': {
    en: 'When a man enters his house and mentions Allah upon entering and at his meal, shaytan says: No place to stay and no dinner. If he enters without mentioning Allah, shaytan says: You have found a place to stay.',
    tr: 'Bir adam evine girdiğinde hem girişte hem de yemekte Allah\'ı anarsa şeytan "Kalacak yer yok, akşam yemeği de yok" der. Eğer giriş sırasında Allah\'ı anmadan girerse şeytan "Kalacak yer buldun" der.',
    source: 'Sahih Muslim 2018 — narrated by Jabir (r.a.)',
    fadl_en: 'Keeping shaytan out of the home and away from the meal.',
    fadl_tr: 'Şeytanı evden ve yemekten uzak tutmak.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Bathroom
  // ─────────────────────────────────────────────

  'dua-before-bathroom': {
    en: 'When one of you enters the toilet, let him say: O Allah, I seek refuge in You from the male and female unclean spirits.',
    tr: 'Biriniz tuvalete girdiğinde "Allah\'ım, erkek ve dişi pislik ruhlarından Sana sığınırım" desin.',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    source: 'Sahih al-Bukhari 142, Sahih Muslim 375 — narrated by Anas (r.a.)',
    fadl_en: 'Protection from evil jinn in the toilet.',
    fadl_tr: 'Tuvalette kötü cinlerden korunma.',
  },

  'dua-after-bathroom': {
    en: 'The Prophet ﷺ upon leaving the toilet would say: I ask Your forgiveness.',
    tr: 'Peygamber ﷺ tuvaletten çıktığında "Affını dilerim" derdi.',
    arabic: 'غُفْرَانَكَ',
    source: 'Sunan Abi Dawud 30, Sunan al-Tirmidhi 7 (hasan sahih) — narrated by Aisha (r.a.)',
    fadl_en: 'Seeking forgiveness as gratitude for relief.',
    fadl_tr: 'Rahatlama için şükran olarak bağışlanma dilemek.',
  },

  // ─────────────────────────────────────────────
  // DAILY HABITS — Daytime
  // ─────────────────────────────────────────────

  'duha': {
    en: 'Every morning charity is due upon every joint of a person. Every glorification is a charity, every praise is a charity — and two rak\'at one prays in the forenoon suffices for all that.',
    tr: 'Her sabah her eklem için sadaka vermek gerekir. Her tesbih sadakadır, her hamd sadakadır — kuşluk vaktinde kılınan iki rekat namaz ise bunların hepsine yeter.',
    source: 'Sahih Muslim 720 — narrated by Abu Dharr (r.a.)',
    fadl_en: 'Two rak\'at fulfills the gratitude owed for every joint in the body.',
    fadl_tr: 'İki rekat, vücuttaki her eklem için borçlu olunan şükrü yerine getirir.',
  },

  'right-hand': {
    en: 'None of you should eat with his left hand or drink with it, for shaytan eats with his left hand and drinks with it.',
    tr: 'Hiçbiriniz sol eliyle yemek yemesin veya içmesin; zira şeytan sol eliyle yer ve içer.',
    source: 'Sahih Muslim 2020 — narrated by Ibn Umar (r.a.)',
    fadl_en: 'Distinguishing oneself from the way of shaytan.',
    fadl_tr: 'Kendini şeytanın yolundan ayırt etmek.',
  },

  'smile': {
    en: 'Your smiling in the face of your brother is a charity.',
    tr: 'Kardeşinin yüzüne gülümsemen sadakadır.',
    source: 'Sunan al-Tirmidhi 1956 (hasan gharib) — narrated by Abu Dharr (r.a.)',
    fadl_en: 'A smile is counted as an act of charity.',
    fadl_tr: 'Gülümsemek bir sadaka olarak sayılır.',
  },

  // ─────────────────────────────────────────────
  // SAHABAH TIER
  // ─────────────────────────────────────────────

  'tahajjud-prep': {
    en: 'Whoever goes to his bed intending to get up and pray at night, then sleep overcomes him until morning, what he intended is written for him and his sleep is considered a charity from his Lord.',
    tr: 'Kim gece kalkıp namaz kılmak niyetiyle yatağına gider de sabaha kadar uyku onu yenerse, niyeti kendisi için yazılır ve uykusu Rabbinden bir sadaka sayılır.',
    source: 'Sunan al-Nasa\'i 1787, Sunan Ibn Majah 1344 — narrated by Abu al-Darda\' (r.a.) (graded sahih by al-Albani)',
    fadl_en: 'Full reward of tahajjud written even if sleep overtook you.',
    fadl_tr: 'Uyku sizi yenmiş olsa bile teheccüd namazının tam sevabı yazılır.',
  },

  'quran-daily': {
    en: 'Whoever recites a letter of the Book of Allah will have one good deed, and that good deed is worth ten times its like. I do not say that Alif Lam Mim is one letter — rather Alif is a letter, Lam is a letter, and Mim is a letter.',
    tr: 'Kim Allah\'ın Kitabı\'ndan bir harf okursa ona bir hasene vardır ve o hasene on misliyle karşılık bulur. Elif lam mim\'in bir harf olduğunu söylemiyorum; bilakis elif bir harf, lam bir harf, mim bir harftir.',
    source: 'Sunan al-Tirmidhi 2910 (hasan sahih) — narrated by Ibn Mas\'ud (r.a.)',
    fadl_en: 'Each letter of the Quran is rewarded tenfold.',
    fadl_tr: 'Kur\'an\'ın her harfi on kat ödüllendirilir.',
  },

  'istighfar-100': {
    en: 'By Allah, I seek the forgiveness of Allah and turn to Him in repentance more than seventy times a day. And in another narration: O people, repent to Allah, for I repent to Him one hundred times a day.',
    tr: 'Allah\'a yemin olsun ki ben günde yetmişten fazla Allah\'tan bağışlanma diler ve O\'na tövbe ederim. Bir başka rivayette: Ey insanlar, Allah\'a tövbe edin; zira ben O\'na günde yüz kez tövbe ederim.',
    source: 'Sahih al-Bukhari 6307 — narrated by Abu Hurayrah (r.a.) / Sahih Muslim 2702 — narrated by al-Agharr al-Muzani (r.a.)',
    fadl_en: 'Following the personal daily practice of the Prophet ﷺ himself.',
    fadl_tr: 'Peygamber ﷺ\'in bizzat kendi günlük uygulamasına uymak.',
  },

  'salawat-100': {
    en: 'Whoever sends one blessing upon me, Allah will send ten blessings upon him.',
    tr: 'Kim bana bir kez salat getirirse Allah ona on salat getirir.',
    source: 'Sahih Muslim 408 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Ten blessings from Allah for every single salawat sent.',
    fadl_tr: 'Gönderilen her bir salat için Allah\'tan on bereket.',
  },

  'sadaqah-daily': {
    en: 'There is no day on which the people wake up except that two angels descend. One of them says: O Allah, give the one who spends a replacement. The other says: O Allah, give the one who withholds destruction.',
    tr: 'İnsanların sabahladığı hiçbir gün yoktur ki iki melek inmesin. Biri "Allah\'ım, infak edene bir karşılık ver" der, diğeri "Allah\'ım, cimrilik edeni helak et" der.',
    source: 'Sahih al-Bukhari 1442, Sahih Muslim 1010 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Angels make du\'a for the one who gives daily.',
    fadl_tr: 'Melekler her gün sadaka verenin için dua eder.',
  },

  'dua-parents': {
    en: 'And say: My Lord, have mercy upon them as they brought me up when I was small.',
    tr: 'Ve de ki: Rabbim, küçükken beni yetiştirdikleri gibi sen de onlara merhamet et.',
    arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    source: 'Quran, Surah Al-Isra 17:24',
    fadl_en: 'A Quranic command; among the rights owed to parents.',
    fadl_tr: 'Kur\'anî bir emir; anne babaya karşı yerine getirilmesi gereken haklardan biri.',
  },

  // ─────────────────────────────────────────────
  // MISCELLANEOUS
  // ─────────────────────────────────────────────

  'misc-salaam': {
    en: 'You will not enter Paradise until you believe, and you will not believe until you love one another. Shall I not tell you of something that, if you do it, you will love one another? Spread the salaam amongst yourselves.',
    tr: 'İman etmedikçe cennete giremezsiniz, birbirinizi sevmedikçe de iman etmiş olmazsınız. Birbirinizi sevmenizi sağlayacak bir şeyi size haber vereyim mi? Aranızda selamı yayın.',
    source: 'Sahih Muslim 54 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Spreading salaam increases love and leads to Paradise.',
    fadl_tr: 'Selamı yaymak sevgiyi artırır ve cennete götürür.',
  },

  'misc-gaze': {
    en: 'Tell the believing men to lower their gaze and guard their chastity — that is purer for them.',
    tr: 'Mümin erkeklere söyle: Gözlerini haramdan sakınsınlar ve iffetlerini korusunlar. Bu onlar için daha temizdir.',
    source: 'Quran, Surah Al-Nur 24:30',
    fadl_en: 'Purity of heart and protection of chastity.',
    fadl_tr: 'Kalbin temizliği ve iffeti korumak.',
  },

  'misc-speech': {
    en: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    tr: 'Allah\'a ve ahiret gününe iman eden kimse ya hayır söylesin ya da sussun.',
    source: 'Sahih al-Bukhari 6018, Sahih Muslim 47 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Protecting oneself from sin through the tongue.',
    fadl_tr: 'Dil aracılığıyla günahtan korunmak.',
  },

  'misc-parents': {
    en: 'Your Lord has decreed that you worship none but Him, and that you be good to parents. Whether one or both of them reach old age with you, say not to them a word of contempt, nor repel them, but speak to them a gracious word.',
    tr: 'Rabbin, O\'ndan başkasına ibadet etmemenizi ve ana babanıza iyi davranmanızı emretti. İkisi de yahut biri yanında yaşlılığa erişirse, onlara "öf" bile deme, onları azarlama; ikisine de güzel söz söyle.',
    source: 'Quran, Surah Al-Isra 17:23',
    fadl_en: 'Honoring parents is second only to worshipping Allah.',
    fadl_tr: 'Anne babaya saygı, Allah\'a ibadetten hemen sonra gelir.',
  },

  'misc-husn': {
    en: 'Beware of suspicion, for suspicion is the most untruthful of speech. Do not spy on one another, do not be jealous of one another, do not hate one another, and do not abandon one another. Be brothers, O servants of Allah.',
    tr: 'Zandan sakının; zira zan sözlerin en yalanıdır. Birbirinizi gözetlemeyin, birbirinize haset etmeyin, birbirinize buğzetmeyin, birbirinizden yüz çevirmeyin. Allah\'ın kulları, kardeş olun.',
    source: 'Sahih al-Bukhari 6064, Sahih Muslim 2563 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Protecting the brotherhood of believers.',
    fadl_tr: 'Müminler arasındaki kardeşliği korumak.',
  },

  'misc-harm': {
    en: 'Removing a harmful object from the road is a charity.',
    tr: 'Yoldan zararlı bir şeyi kaldırmak sadakadır.',
    source: 'Sahih al-Bukhari 2989, Sahih Muslim 1009 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Even the smallest act for others is counted as charity.',
    fadl_tr: 'Başkaları için yapılan en küçük eylem bile sadaka sayılır.',
  },

  'misc-water': {
    en: 'Do not waste water even if you are on the bank of a flowing river.',
    tr: 'Akan bir nehrin kıyısında bile olsan suyu israf etme.',
    source: 'Sunan Ibn Majah 425 — narrated by Abdullah ibn Amr (r.a.) (graded hasan)',
    fadl_en: 'Moderation and avoiding waste is part of worship.',
    fadl_tr: 'Ölçülülük ve israftan kaçınmak ibadetin bir parçasıdır.',
  },

  'misc-walk': {
    en: 'Do not walk through the land exultantly. Indeed, you will never tear the earth apart, and you will never reach the mountains in height.',
    tr: 'Yeryüzünde böbürlenerek yürüme. Gerçekten sen ne yeri yarabilirsin ne de boyca dağlara ulaşabilirsin.',
    source: 'Quran, Surah Al-Isra 17:37',
    fadl_en: 'Humility in conduct reflects inner submission to Allah.',
    fadl_tr: 'Davranışlardaki alçakgönüllülük, Allah\'a içsel teslimiyeti yansıtır.',
  },

  'misc-bismillah-all': {
    en: 'Every matter of importance that does not begin with the remembrance of Allah is cut off from blessing.',
    tr: 'Allah\'ın zikri ile başlamayan her önemli iş bereketten kesilmiştir.',
    source: 'Musnad Ahmad, Sunan Abi Dawud (graded hasan) — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Barakah in every action that begins with Allah\'s name.',
    fadl_tr: 'Allah\'ın adıyla başlayan her eylemdeki bereket.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Siwak (shared across all prayers)
  // ─────────────────────────────────────────────

  'fajr-siwak': {
    en: 'If I did not think it would be too hard on my ummah, I would have ordered them to use the siwak before every prayer.',
    tr: 'Ümmetim için zor olmayacağını düşünseydim, her namazdan önce misvak kullanmalarını emrederdim.',
    source: 'Sahih al-Bukhari 887, Sahih Muslim 252 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Purification of the mouth before standing before Allah.',
    fadl_tr: 'Allah\'ın huzuruna durmadan önce ağzı temizlemek.',
  },

  'dhuhr-siwak': {
    en: 'If I did not think it would be too hard on my ummah, I would have ordered them to use the siwak before every prayer.',
    tr: 'Ümmetim için zor olmayacağını düşünseydim, her namazdan önce misvak kullanmalarını emrederdim.',
    source: 'Sahih al-Bukhari 887, Sahih Muslim 252 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Purification of the mouth before standing before Allah.',
    fadl_tr: 'Allah\'ın huzuruna durmadan önce ağzı temizlemek.',
  },

  'asr-siwak': {
    en: 'If I did not think it would be too hard on my ummah, I would have ordered them to use the siwak before every prayer.',
    tr: 'Ümmetim için zor olmayacağını düşünseydim, her namazdan önce misvak kullanmalarını emrederdim.',
    source: 'Sahih al-Bukhari 887, Sahih Muslim 252 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Purification of the mouth before standing before Allah.',
    fadl_tr: 'Allah\'ın huzuruna durmadan önce ağzı temizlemek.',
  },

  'maghrib-siwak': {
    en: 'If I did not think it would be too hard on my ummah, I would have ordered them to use the siwak before every prayer.',
    tr: 'Ümmetim için zor olmayacağını düşünseydim, her namazdan önce misvak kullanmalarını emrederdim.',
    source: 'Sahih al-Bukhari 887, Sahih Muslim 252 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Purification of the mouth before standing before Allah.',
    fadl_tr: 'Allah\'ın huzuruna durmadan önce ağzı temizlemek.',
  },

  'isha-siwak': {
    en: 'If I did not think it would be too hard on my ummah, I would have ordered them to use the siwak before every prayer.',
    tr: 'Ümmetim için zor olmayacağını düşünseydim, her namazdan önce misvak kullanmalarını emrederdim.',
    source: 'Sahih al-Bukhari 887, Sahih Muslim 252 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Purification of the mouth before standing before Allah.',
    fadl_tr: 'Allah\'ın huzuruna durmadan önce ağzı temizlemek.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Answer the adhan
  // ─────────────────────────────────────────────

  'fajr-adhan': {
    en: 'When you hear the call to prayer, repeat what the muadhdhin says.',
    tr: 'Ezan sesini duyduğunuzda müezzinin söylediklerini tekrar edin.',
    source: 'Sahih al-Bukhari 611, Sahih Muslim 383 — narrated by Abu Sa\'id al-Khudri (r.a.)',
    fadl_en: 'Answering the adhan is a confirmed sunnah before every prayer.',
    fadl_tr: 'Ezana icabet etmek her namazdan önce müekked sünnettir.',
  },

  'dhuhr-adhan': {
    en: 'When you hear the call to prayer, repeat what the muadhdhin says.',
    tr: 'Ezan sesini duyduğunuzda müezzinin söylediklerini tekrar edin.',
    source: 'Sahih al-Bukhari 611, Sahih Muslim 383 — narrated by Abu Sa\'id al-Khudri (r.a.)',
    fadl_en: 'Answering the adhan is a confirmed sunnah before every prayer.',
    fadl_tr: 'Ezana icabet etmek her namazdan önce müekked sünnettir.',
  },

  'asr-adhan': {
    en: 'When you hear the call to prayer, repeat what the muadhdhin says.',
    tr: 'Ezan sesini duyduğunuzda müezzinin söylediklerini tekrar edin.',
    source: 'Sahih al-Bukhari 611, Sahih Muslim 383 — narrated by Abu Sa\'id al-Khudri (r.a.)',
    fadl_en: 'Answering the adhan is a confirmed sunnah before every prayer.',
    fadl_tr: 'Ezana icabet etmek her namazdan önce müekked sünnettir.',
  },

  'maghrib-adhan': {
    en: 'When you hear the call to prayer, repeat what the muadhdhin says.',
    tr: 'Ezan sesini duyduğunuzda müezzinin söylediklerini tekrar edin.',
    source: 'Sahih al-Bukhari 611, Sahih Muslim 383 — narrated by Abu Sa\'id al-Khudri (r.a.)',
    fadl_en: 'Answering the adhan is a confirmed sunnah before every prayer.',
    fadl_tr: 'Ezana icabet etmek her namazdan önce müekked sünnettir.',
  },

  'isha-adhan': {
    en: 'When you hear the call to prayer, repeat what the muadhdhin says.',
    tr: 'Ezan sesini duyduğunuzda müezzinin söylediklerini tekrar edin.',
    source: 'Sahih al-Bukhari 611, Sahih Muslim 383 — narrated by Abu Sa\'id al-Khudri (r.a.)',
    fadl_en: 'Answering the adhan is a confirmed sunnah before every prayer.',
    fadl_tr: 'Ezana icabet etmek her namazdan önce müekked sünnettir.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Rawatib rak'at
  // ─────────────────────────────────────────────

  'fajr-sunnah': {
    en: 'Whoever prays twelve rak\'at during the day and night, a house will be built for him in Paradise — four before Dhuhr and two after, two after Maghrib, two after Isha, and two before Fajr.',
    tr: 'Gündüz ve gece on iki rekat namaz kılan kişi için cennette bir ev inşa edilir — Öğleden önce dört, sonra iki; Akşamdan sonra iki; Yatsıdan sonra iki; Sabahtan önce iki.',
    source: 'Sahih Muslim 728 — narrated by Umm Habibah (r.a.)',
    fadl_en: 'A house built in Paradise for whoever is consistent with the rawatib prayers.',
    fadl_tr: 'Revâtib namazlarına devam eden kişi için cennette bir ev.',
  },

  'dhuhr-sunnah-before': {
    en: 'Whoever prays twelve rak\'at during the day and night, a house will be built for him in Paradise.',
    tr: 'Gündüz ve gece on iki rekat namaz kılan kişi için cennette bir ev inşa edilir.',
    source: 'Sahih Muslim 728 — narrated by Umm Habibah (r.a.)',
    fadl_en: 'A house built in Paradise.',
    fadl_tr: 'Cennette bir ev.',
  },

  'dhuhr-sunnah-after': {
    en: 'Whoever prays twelve rak\'at during the day and night, a house will be built for him in Paradise.',
    tr: 'Gündüz ve gece on iki rekat namaz kılan kişi için cennette bir ev inşa edilir.',
    source: 'Sahih Muslim 728 — narrated by Umm Habibah (r.a.)',
    fadl_en: 'A house built in Paradise.',
    fadl_tr: 'Cennette bir ev.',
  },

  'asr-sunnah-before': {
    en: 'May Allah have mercy on the one who prays four rak\'at before Asr.',
    tr: 'İkindiden önce dört rekat kılan kişiye Allah merhamet etsin.',
    source: 'Sunan Abi Dawud 1271, Sunan al-Tirmidhi 430 (hasan sahih) — narrated by Ibn Umar (r.a.)',
    fadl_en: 'A specific du\'a of mercy from the Prophet ﷺ for this sunnah.',
    fadl_tr: 'Peygamber ﷺ\'in bu sünnet için özel bir rahmet duası.',
  },

  'maghrib-sunnah': {
    en: 'Whoever prays twelve rak\'at during the day and night, a house will be built for him in Paradise.',
    tr: 'Gündüz ve gece on iki rekat namaz kılan kişi için cennette bir ev inşa edilir.',
    source: 'Sahih Muslim 728 — narrated by Umm Habibah (r.a.)',
    fadl_en: 'A house built in Paradise.',
    fadl_tr: 'Cennette bir ev.',
  },

  'isha-sunnah': {
    en: 'Whoever prays twelve rak\'at during the day and night, a house will be built for him in Paradise.',
    tr: 'Gündüz ve gece on iki rekat namaz kılan kişi için cennette bir ev inşa edilir.',
    source: 'Sahih Muslim 728 — narrated by Umm Habibah (r.a.)',
    fadl_en: 'A house built in Paradise.',
    fadl_tr: 'Cennette bir ev.',
  },

  'isha-witr': {
    en: 'Make Witr the last of your prayers at night.',
    tr: 'Vitri gecenin son namazı yapın.',
    source: 'Sahih al-Bukhari 998, Sahih Muslim 751 — narrated by Ibn Umar (r.a.)',
    fadl_en: 'Closing the night with Witr is a confirmed sunnah.',
    fadl_tr: 'Geceyi Vitir ile kapatmak müekked sünnettir.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Du'a after prayer
  // ─────────────────────────────────────────────

  'fajr-dua': {
    en: 'The Prophet ﷺ would remain seated after the prayer making du\'a and dhikr.',
    tr: 'Peygamber ﷺ namazdan sonra dua ve zikir yaparak oturmaya devam ederdi.',
    source: 'Sahih Muslim 591 — narrated by Thawban (r.a.)',
    fadl_en: 'Remaining after the prayer for dhikr and du\'a is a sunnah.',
    fadl_tr: 'Namazdan sonra zikir ve dua için kalmak sünnettir.',
  },

  'dhuhr-dua': {
    en: 'The Prophet ﷺ would remain seated after the prayer making du\'a and dhikr.',
    tr: 'Peygamber ﷺ namazdan sonra dua ve zikir yaparak oturmaya devam ederdi.',
    source: 'Sahih Muslim 591 — narrated by Thawban (r.a.)',
    fadl_en: 'Remaining after the prayer for dhikr and du\'a is a sunnah.',
    fadl_tr: 'Namazdan sonra zikir ve dua için kalmak sünnettir.',
  },

  'asr-dua': {
    en: 'The Prophet ﷺ would remain seated after the prayer making du\'a and dhikr.',
    tr: 'Peygamber ﷺ namazdan sonra dua ve zikir yaparak oturmaya devam ederdi.',
    source: 'Sahih Muslim 591 — narrated by Thawban (r.a.)',
    fadl_en: 'Remaining after the prayer for dhikr and du\'a is a sunnah.',
    fadl_tr: 'Namazdan sonra zikir ve dua için kalmak sünnettir.',
  },

  'maghrib-dua': {
    en: 'The Prophet ﷺ would remain seated after the prayer making du\'a and dhikr.',
    tr: 'Peygamber ﷺ namazdan sonra dua ve zikir yaparak oturmaya devam ederdi.',
    source: 'Sahih Muslim 591 — narrated by Thawban (r.a.)',
    fadl_en: 'Remaining after the prayer for dhikr and du\'a is a sunnah.',
    fadl_tr: 'Namazdan sonra zikir ve dua için kalmak sünnettir.',
  },

  'isha-dua': {
    en: 'The Prophet ﷺ would remain seated after the prayer making du\'a and dhikr.',
    tr: 'Peygamber ﷺ namazdan sonra dua ve zikir yaparak oturmaya devam ederdi.',
    source: 'Sahih Muslim 591 — narrated by Thawban (r.a.)',
    fadl_en: 'Remaining after the prayer for dhikr and du\'a is a sunnah.',
    fadl_tr: 'Namazdan sonra zikir ve dua için kalmak sünnettir.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Tasbih (33/33/33)
  // ─────────────────────────────────────────────

  'fajr-tasbih': {
    en: 'Whoever says after every obligatory prayer: Subhanallah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — making 99 — and completes it to 100 with La ilaha illa Allah wahdahu la sharika lah, lahu al-mulk wa lahu al-hamd wa huwa ala kulli shay\'in qadir — his sins will be forgiven even if they are like the foam of the sea.',
    tr: 'Her farz namazın ardından otuz üç kez "Sübhanallah", otuz üç kez "Elhamdülillah", otuz üç kez "Allahu Ekber" diyen — ki bu doksan dokuz eder — ve bunu "Lâ ilâhe illallâhu vahdehû lâ şerîke leh, lehü\'l-mülkü ve lehü\'l-hamdü ve hüve alâ külli şey\'in kadîr" ile yüze tamamlayan kişinin günahları, denizin köpüğü kadar olsa da affedilir.',
    source: 'Sahih Muslim 597 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Sins forgiven even if they were like the foam of the sea.',
    fadl_tr: 'Denizin köpüğü kadar olsa da günahlar affedilir.',
  },

  'dhuhr-tasbih': {
    en: 'Whoever says after every obligatory prayer: Subhanallah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — his sins will be forgiven even if they are like the foam of the sea.',
    tr: 'Her farz namazın ardından otuz üç kez Sübhanallah, otuz üç kez Elhamdülillah, otuz üç kez Allahu Ekber diyen kişinin günahları, denizin köpüğü kadar olsa da affedilir.',
    source: 'Sahih Muslim 597 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Sins forgiven even if they were like the foam of the sea.',
    fadl_tr: 'Denizin köpüğü kadar olsa da günahlar affedilir.',
  },

  'asr-tasbih': {
    en: 'Whoever says after every obligatory prayer: Subhanallah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — his sins will be forgiven even if they are like the foam of the sea.',
    tr: 'Her farz namazın ardından otuz üç kez Sübhanallah, otuz üç kez Elhamdülillah, otuz üç kez Allahu Ekber diyen kişinin günahları, denizin köpüğü kadar olsa da affedilir.',
    source: 'Sahih Muslim 597 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Sins forgiven even if they were like the foam of the sea.',
    fadl_tr: 'Denizin köpüğü kadar olsa da günahlar affedilir.',
  },

  'maghrib-tasbih': {
    en: 'Whoever says after every obligatory prayer: Subhanallah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — his sins will be forgiven even if they are like the foam of the sea.',
    tr: 'Her farz namazın ardından otuz üç kez Sübhanallah, otuz üç kez Elhamdülillah, otuz üç kez Allahu Ekber diyen kişinin günahları, denizin köpüğü kadar olsa da affedilir.',
    source: 'Sahih Muslim 597 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Sins forgiven even if they were like the foam of the sea.',
    fadl_tr: 'Denizin köpüğü kadar olsa da günahlar affedilir.',
  },

  'isha-tasbih': {
    en: 'Whoever says after every obligatory prayer: Subhanallah 33 times, Alhamdulillah 33 times, Allahu Akbar 33 times — his sins will be forgiven even if they are like the foam of the sea.',
    tr: 'Her farz namazın ardından otuz üç kez Sübhanallah, otuz üç kez Elhamdülillah, otuz üç kez Allahu Ekber diyen kişinin günahları, denizin köpüğü kadar olsa da affedilir.',
    source: 'Sahih Muslim 597 — narrated by Abu Hurayrah (r.a.)',
    fadl_en: 'Sins forgiven even if they were like the foam of the sea.',
    fadl_tr: 'Denizin köpüğü kadar olsa da günahlar affedilir.',
  },

  // ─────────────────────────────────────────────
  // PER-PRAYER SUNNAH — Ayat al-Kursi after prayer
  // ─────────────────────────────────────────────

  'fajr-kursi': {
    en: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    tr: 'Her farz namazın ardından Ayetü\'l-Kürsî\'yi okuyan kişiyi cennete girmekten yalnızca ölüm alıkoyar.',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'Sunan al-Nasa\'i al-Kubra 9928 — narrated by Abu Umamah (r.a.) (graded sahih by Ibn Hibban and al-Albani)',
    fadl_en: 'Nothing between you and Paradise except death.',
    fadl_tr: 'Seni cennetten yalnızca ölüm ayırır.',
  },

  'dhuhr-kursi': {
    en: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    tr: 'Her farz namazın ardından Ayetü\'l-Kürsî\'yi okuyan kişiyi cennete girmekten yalnızca ölüm alıkoyar.',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'Sunan al-Nasa\'i al-Kubra 9928 — narrated by Abu Umamah (r.a.) (graded sahih by Ibn Hibban and al-Albani)',
    fadl_en: 'Nothing between you and Paradise except death.',
    fadl_tr: 'Seni cennetten yalnızca ölüm ayırır.',
  },

  'asr-kursi': {
    en: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    tr: 'Her farz namazın ardından Ayetü\'l-Kürsî\'yi okuyan kişiyi cennete girmekten yalnızca ölüm alıkoyar.',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'Sunan al-Nasa\'i al-Kubra 9928 — narrated by Abu Umamah (r.a.) (graded sahih by Ibn Hibban and al-Albani)',
    fadl_en: 'Nothing between you and Paradise except death.',
    fadl_tr: 'Seni cennetten yalnızca ölüm ayırır.',
  },

  'maghrib-kursi': {
    en: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    tr: 'Her farz namazın ardından Ayetü\'l-Kürsî\'yi okuyan kişiyi cennete girmekten yalnızca ölüm alıkoyar.',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'Sunan al-Nasa\'i al-Kubra 9928 — narrated by Abu Umamah (r.a.) (graded sahih by Ibn Hibban and al-Albani)',
    fadl_en: 'Nothing between you and Paradise except death.',
    fadl_tr: 'Seni cennetten yalnızca ölüm ayırır.',
  },

  'isha-kursi': {
    en: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing prevents him from entering Paradise except death.',
    tr: 'Her farz namazın ardından Ayetü\'l-Kürsî\'yi okuyan kişiyi cennete girmekten yalnızca ölüm alıkoyar.',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    source: 'Sunan al-Nasa\'i al-Kubra 9928 — narrated by Abu Umamah (r.a.) (graded sahih by Ibn Hibban and al-Albani)',
    fadl_en: 'Nothing between you and Paradise except death.',
    fadl_tr: 'Seni cennetten yalnızca ölüm ayırır.',
  },
};

/**
 * Helper: get the correct hadith text for the current language.
 */
export function getHadithText(info: HadithInfo, lang: string): string {
  if (lang === 'tr') return info.tr;
  if (lang === 'ar') return info.arabic ?? info.en;
  return info.en; // 'en' and 'sv' both use English
}

export function getFadlText(info: HadithInfo, lang: string): string {
  if (lang === 'tr') return info.fadl_tr;
  return info.fadl_en;
}
