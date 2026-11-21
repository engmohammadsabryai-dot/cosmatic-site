/**
 * Kosmetolog Dildora - Interactive Core Engine
 * Multi-language (UZ, RU, EN, AR), WhatsApp Booking, Price Calculator & Media
 */

// Fixed reference rate used only for old-price estimates; not a live exchange rate.
const USD_RATE = 13000;

// Safe retrieval of stored language and currency
let currentLang = 'uz';
try {
  const savedLang = localStorage.getItem('kd_lang');
  if (savedLang && ['uz', 'ru', 'en', 'ar'].includes(savedLang)) {
    currentLang = savedLang;
  }
} catch (e) {
  console.warn('localStorage read error:', e);
}

let currentCurrency = 'uzs';
try {
  const savedCurr = localStorage.getItem('kd_currency');
  if (savedCurr && ['uzs', 'usd'].includes(savedCurr)) {
    currentCurrency = savedCurr;
  }
} catch (e) {
  console.warn('localStorage read error:', e);
}

let activeCategory = 'all';
let selectedCalcItems = new Set();

// Comprehensive Services Database
const servicesData = [
  {
    id: 'plasmalifting',
    category: 'injections',
    priceUzs: 400000,
    priceUsd: 31,
    oldPriceUzs: 550000,
    durationMin: 60,
    popular: true,
    name: {
      uz: "Plazmolifting + Gialuronka",
      ru: "Плазмалифтинг + Гиалуронка",
      en: "Plasmalifting + Hyaluronic Acid",
      ar: "بلازما مع حمض الهيالورونيك"
    },
    desc: {
      uz: "Terini chuqur namlantirish, o'zining tabiiy kollagenini faollashtirish va ajinlarni silliqlash.",
      ru: "Глубокое увлажнение, стимуляция выработки собственного коллагена и разглаживание морщин.",
      en: "Deep skin hydration, natural collagen synthesis boost, and cellular regeneration.",
      ar: "ترطيب عميق للبشرة وتحفيز إنتاج الكولاجين الطبيعي وتجديد الخلايا."
    }
  },
  {
    id: 'filler',
    category: 'injections',
    priceUzs: 700000,
    priceUsd: 55,
    oldPriceUzs: 1040000,
    oldPriceUsd: 80,
    durationMin: 45,
    popular: true,
    name: {
      uz: "Lab va Yuz Kontur Plastikasi (Filler)",
      ru: "Контурная пластика губ и лица (Филлеры)",
      en: "Lip & Facial Contouring (Fillers)",
      ar: "فيلر الشفاه وتحديد ملامح الوجه"
    },
    desc: {
      uz: "Lab shaklini chiroyli kattalashtirish, assimetriyani tuzatish, yonoq va iyak konturlash.",
      ru: "Увеличение и увлажнение губ, коррекция асимметрии, скул, подбородка и носогубных складок.",
      en: "Natural lip volumizing, asymmetry correction, cheek and jawline harmonization with premium hyaluronic fillers.",
      ar: "تكبير الشفاه وترطيبها وتصحيح التناظر ونحت الخدود والذقن بفيلر معتمد."
    }
  },
  {
    id: 'mesotherapy',
    category: 'injections',
    priceUzs: 400000,
    priceUsd: 31,
    oldPriceUzs: 600000,
    durationMin: 50,
    popular: false,
    name: {
      uz: "Yuz Mezoterapiyasi",
      ru: "Мезотерапия лица",
      en: "Facial Mesotherapy",
      ar: "ميزوثيرابي للوجه"
    },
    desc: {
      uz: "Vitaminli kokteyllar bilan terini oziqlantirish, mayda ajinlarni tekislash va yuz rangini ochish.",
      ru: "Питание витаминными коктейлями, омоложение и улучшение качества и тонуса кожи.",
      en: "Vitamin-rich meso-cocktails for instant glow, complexion improvement and texture refining.",
      ar: "تغذية البشرة بالكوكتيلات والفيتامينات لتحسين النضارة وتوحيد اللون."
    }
  },
  {
    id: 'hair-meso',
    category: 'injections',
    priceUzs: 350000,
    priceUsd: 27,
    oldPriceUzs: 500000,
    durationMin: 40,
    popular: false,
    name: {
      uz: "Soch Mezoterapiyasi",
      ru: "Мезотерапия волос",
      en: "Hair Loss Mesotherapy",
      ar: "ميزوثيرابي لعلاج تساقط الشعر"
    },
    desc: {
      uz: "Soch to'kilishini to'xtatish, ildizlarni mustahkamlash va yangi sochlarning o'sishini tezlashtirish.",
      ru: "Остановка выпадения волос, укрепление луковиц и стимуляция роста новых густых волос.",
      en: "Targeted scalp therapy to halt hair thinning, nourish follicles and boost dense regrowth.",
      ar: "إيقاف تساقط الشعر وتقوية البصيلات وتحفيز نمو شعر صحي وكثيف."
    }
  },
  {
    id: 'botox',
    category: 'injections',
    priceUzs: 600000,
    priceUsd: 46,
    oldPriceUzs: 850000,
    durationMin: 30,
    popular: true,
    name: {
      uz: "Yapon Botoksi (Botox)",
      ru: "Японский Ботокс",
      en: "Japanese Premium Botox",
      ar: "بوتوكس ياباني فائق الجودة"
    },
    desc: {
      uz: "Peshona, ko'z atrofi va qoshlar orasidagi mimik ajinlarni xavfsiz va tabiiy silliqlash.",
      ru: "Разглаживание мимических морщин лба, межбровья и зоны вокруг глаз без эффекта маски.",
      en: "Gentle wrinkle-smoothing for forehead, frown lines and crow's feet while preserving natural expressions.",
      ar: "إزالة تجاعيد الجبهة وما بين الحاجبين وحول العينين مع الحفاظ على التعبير الطبيعي."
    }
  },
  {
    id: 'fullface',
    category: 'injections',
    priceUzs: 1300000,
    priceUsd: 100,
    oldPriceUzs: 1800000,
    durationMin: 90,
    popular: true,
    name: {
      uz: "Full Face Kompleks Yoshartirish",
      ru: "Фул Фейс (Full Face) Омоложение",
      en: "Full Face Rejuvenation Package",
      ar: "باقة النضارة الشاملة (فول فيس)"
    },
    desc: {
      uz: "Yuzning barcha sohalarini botoks, gialuron va biorevitalizatsiya bilan to'liq yoshartirish.",
      ru: "Комплексное преображение лица: ботулинотерапия, биоревитализация и моделирование контуров.",
      en: "Comprehensive whole-face transformation combining botulinum lifting, hydration and contour balance.",
      ar: "برنامج تجميلي شامل للوجه يجمع بين البوتوكس والترطيب العميق وشد الملامح."
    }
  },
  {
    id: 'hyperhidrosis',
    category: 'injections',
    priceUzs: 1040000,
    priceUsd: 80,
    oldPriceUzs: 1400000,
    durationMin: 45,
    popular: false,
    name: {
      uz: "Gipergidroz Davolash (Qo'ltiq terlashi)",
      ru: "Лечение гипергидроза (потливости)",
      en: "Hyperhidrosis Treatment",
      ar: "علاج فرط التعرق (الهيدروزيس)"
    },
    desc: {
      uz: "Qo'ltiq osti va kaftdagi ortiqcha terlashni 6-9 oyga to'liq to'xtatish.",
      ru: "Избавление от повышенного потоотделения подмышек на срок от 6 до 9 месяцев.",
      en: "Effective botulinum protocol eliminating excessive underarm sweating for 6 to 9 months.",
      ar: "علاج فعال يزيل التعرق المفرط تحت الإبطين واليدين لمدة 6 إلى 9 أشهر."
    }
  },
  {
    id: 'facial-cleaning',
    category: 'skincare',
    priceUzs: 200000,
    priceUsd: 15,
    oldPriceUzs: 300000,
    durationMin: 75,
    popular: true,
    name: {
      uz: "Professional 3 Bosqichli Chistka",
      ru: "Профессиональная 3-этапная чистка лица",
      en: "3-Stage Professional Facial Cleansing",
      ar: "تنظيف البشرة العميق ثلاثي المراحل"
    },
    desc: {
      uz: "Ultrasonik, mexanik tozalash, teshiklarni toraytirish va tinchlantiruvchi krem maska.",
      ru: "Ультразвуковое и мануальное очищение пор, антисептическая обработка, сужение пор и маска.",
      en: "Ultrasonic + manual pore extraction, antiseptic detox, soothing mask and pore refining.",
      ar: "تنظيف بالموجات فوق الصوتية واستخراج الشوائب والدهون وتضييق المسام وماسك مهدئ."
    }
  },
  {
    id: 'carbon-peeling',
    category: 'skincare',
    priceUzs: 300000,
    priceUsd: 23,
    oldPriceUzs: 450000,
    durationMin: 60,
    popular: true,
    name: {
      uz: "Karbon Piling + Tozalash + Parvarish",
      ru: "Карбоновый пилинг + Чистка + Уход",
      en: "Carbon Laser Peel + Deep Care",
      ar: "التقشير الكربوني بالليزر مع العناية"
    },
    desc: {
      uz: "Lazerli uglerod nuri yordamida chuqur poralarni tozalash, dog'larni ketkazish va yuzni yaltiratish.",
      ru: "Лазерный карбоновый пилинг для сужения пор, устранения пигментации и гладкой сияющей кожи.",
      en: "Laser carbon peel to shrink dilated pores, fade hyperpigmentation and reveal glass skin.",
      ar: "تقشير بالليزر الكربوني لتضييق المسام، تفتيح التصبغات، ومنح البشرة لمعاناً نضراً."
    }
  },
  {
    id: 'lipolytics',
    category: 'body',
    priceUzs: 300000,
    priceUsd: 23,
    oldPriceUzs: 520000,
    oldPriceUsd: 40,
    durationMin: 35,
    popular: false,
    name: {
      uz: "Lipolitik (Ikkinchi iyak va tana)",
      ru: "Липолитики (Второй подбородок и тело)",
      en: "Lipolytics (Double Chin & Body)",
      ar: "إبر إذابة الدهون (الذقن المزدوج والجسم)"
    },
    desc: {
      uz: "Yuzdagi ikkinchi iyak, yonoq va tana qismlaridagi ortiqcha yog'larni operatsiyasiz parchalash.",
      ru: "Безоперационное расщепление жировых отложений в области подбородка, щёк и тела.",
      en: "Non-surgical fat melting injections for sleek jawline definition and localized contouring.",
      ar: "تفتيت الدهون الموضعية في اللغلوغ والخدين ومناطق الجسم بدون جراحة."
    }
  },
  {
    id: 'mono-threads',
    category: 'lifting',
    priceUzs: 52000,
    priceUsd: 4,
    oldPriceUzs: 75000,
    durationMin: 45,
    popular: false,
    name: {
      uz: "Mono va Skru Iplar (1 dona)",
      ru: "Моно и Скру нити (за 1 шт)",
      en: "Mono & Screw PDO Threads (per piece)",
      ar: "خيوط المونو والسكرو للشد (للقطعة)"
    },
    desc: {
      uz: "Terini ichdan taranglashtirish, elastikligini oshirish va kollagen to'r hosil qilish.",
      ru: "Уплотнение кожи, создание неоколлагенового каркаса и восстановление упругости.",
      en: "Subdermal collagen network reconstruction to firm loose skin and enhance elasticity.",
      ar: "شد الجلد المترهل وتحفيز شبكة الكولاجين الداخلية لاستعادة مرونة البشرة."
    }
  },
  {
    id: 'cog-threads',
    category: 'lifting',
    priceUzs: 195000,
    priceUsd: 15,
    oldPriceUzs: 260000,
    durationMin: 60,
    popular: true,
    name: {
      uz: "Kogi Iplari bilan Kuchli Lifting (1 dona)",
      ru: "Нити Коги (Cog) Мощный лифтинг (за 1 шт)",
      en: "Cog Barbed Threads Lifting (per piece)",
      ar: "خيوط الكوجي الشوكية للشد الفوري (للقطعة)"
    },
    desc: {
      uz: "Yuz shaklini zumda tepaga tortish, tushgan yonoqlarni ko'tarish va aniq oval hosil qilish.",
      ru: "Мгновенная подтяжка овала лица, устранение брылей и гравитационного птоза.",
      en: "Immediate mechanical lifting for sagging jowls, nasolabial folds and contour sculpting.",
      ar: "شد فوري لترهلات الخدود والفك وتحديد الوجه بدون جراحة."
    }
  },
  {
    id: 'body-volume',
    category: 'body',
    priceUzs: 3900000,
    priceUsd: 300,
    oldPriceUzs: 4800000,
    durationMin: 90,
    popular: false,
    name: {
      uz: "Ko'krak va Qomatga Hajm Berish (1 flakon)",
      ru: "Объём груди и ягодиц (1 флакон)",
      en: "Breast & Buttock Body Sculpting (1 vial)",
      ar: "نحت وتكبير الصدر والأرداف (قارورة واحدة)"
    },
    desc: {
      uz: "Xavfsiz tana filleri bilan kerakli hajm berish va tabiiy jozibador shakl yaratish.",
      ru: "Безопасное моделирование и придание женственных объёмов с помощью сертифицированных филлеров.",
      en: "Safe volumetric augmentation with certified body hyaluronic fillers for feminine curves.",
      ar: "تكبير ونحت طبيعي متناسق باستخدام فيلر الجسم المعتمد والآمن."
    }
  },
  {
    id: 'tatoo-removal',
    category: 'skincare',
    priceUzs: 150000,
    priceUsd: 12,
    oldPriceUzs: 250000,
    durationMin: 30,
    popular: false,
    name: {
      uz: "Qosh va Ko'z Tatuajini Lazerda O'chirish",
      ru: "Лазерное удаление татуажа бровей и век",
      en: "Laser Eyebrow & Eyeliner Tattoo Removal",
      ar: "إزالة تاتو الحواجب ومحدد العيون بالليزر"
    },
    desc: {
      uz: "Chandiqsiz, eski va noto'g'ri chizilgan rangli yoki ko'kargan pigmentlarni tozalash.",
      ru: "Удаление старого, посиневшего татуажа без шрамов и ожогов современным лазером.",
      en: "Safe scarless pigment removal of faded, blue, or uneven permanent makeup.",
      ar: "إزالة آمنة لتاتو الحواجب القديم والألوان المتغيرة بدون ندبات أو حروق."
    }
  },
  {
    id: 'eyelash',
    category: 'lashbrow',
    priceUzs: 150000,
    priceUsd: 12,
    oldPriceUzs: 220000,
    durationMin: 90,
    popular: false,
    name: {
      uz: "Kiprik Ekishtirish (Klassika / 2D / 3D)",
      ru: "Наращивание ресниц (Классика / 2D / 3D)",
      en: "Eyelash Extensions (Classic / 2D / 3D)",
      ar: "تركيب رموش احترافي (كلاسيك / 2D / 3D)"
    },
    desc: {
      uz: "Yengil, ko'zga og'irlik qilmaydigan tabiiy va jozibador kipriklar.",
      ru: "Невесомое наращивание качественными гипоаллергенными материалами.",
      en: "Weightless, hypoallergenic lash sets tailored to your eye shape.",
      ar: "تركيب رموش خفيفة عالية الجودة بمظهر طبيعي أو كثيف يدوم لأسابيع."
    }
  }
];

// Clinic Video Stories & Reels
const clinicReels = [
  {
    file: "video_2026-11-18_17-13-29.mp4",
    title: {
      uz: "Lab shakllantirish jarayoni",
      ru: "Процесс моделирования губ",
      en: "Lip Contouring Procedure",
      ar: "جلسة تحديد وتوريد الشفاه"
    },
    tag: "Filler"
  },
  {
    file: "video_2026-11-18_17-13-35.mp4",
    title: {
      uz: "Apparat kosmetologiyasi & tozalash",
      ru: "Аппаратная чистка лица",
      en: "Hardware Facial Therapy",
      ar: "جلسة التنظيف بالأجهزة الحديثة"
    },
    tag: "Skincare"
  },
  {
    file: "video_2026-11-18_17-13-43.mp4",
    title: {
      uz: "Amaliy shogirdlik darsi",
      ru: "Практический урок для учениц",
      en: "Hands-on Masterclass",
      ar: "تدريب عملي لطالبات الأكاديمية"
    },
    tag: "Academy"
  },
  {
    file: "video_2026-11-18_17-13-47.mp4",
    title: {
      uz: "Klinika muhiti va sterillik",
      ru: "Атмосфера клиники и стерильность",
      en: "Clinic Suite & Hygiene",
      ar: "أجواء العيادة والتعقيم الطبي"
    },
    tag: "Clinic"
  }
];

// Multi-language Translations Dictionary
const translations = {
  uz: {
    site_title: "Kosmetolog Dildora | Toshkentdagi Zamonaviy Kosmetologiya",
    promo_badge: "SUPER AKSIYA",
    promo_text: "Barcha protseduralarga 30% gacha CHEGIRMA! Qabulga oldindan yoziling!",
    working_hours: "Har kuni: 09:00 - 20:00 (Yozilish asosida)",
    call_us: "Qo'ng'iroq qilish",
    nav_home: "Bosh sahifa",
    nav_services: "Xizmatlar & Narxlar",
    nav_calc: "Kalkulyator",
    nav_about: "Shifokor haqida",
    nav_academy: "Shogirdlik",
    nav_reels: "Videolar",
    nav_gallery: "Natijalar",
    nav_reviews: "Mijozlar fikri",
    nav_contact: "Manzil",
    btn_book_now: "Qabulga yozilish",
    hero_badge: "Tibbiy ma'lumotga ega sertifikatlangan shifokor-kosmetolog",
    hero_title_1: "Sizning Go'zalligingiz —",
    hero_title_2: "Bizning G'amxo'rligimiz",
    hero_desc: "Toshkent markazida yuz va tana go'zalligini tabiiy saqlash, yoshartirish, lab konturlash va apparat kosmetologiyasi. Siz eng yaxshisiga loyiqsiz!",
    btn_hero_book: "WhatsApp orqali yozilish",
    btn_hero_tg: "Telegram (135K+)",
    stat_clients: "Mamnun mijozlar",
    stat_experience: "Yillik tajriba",
    stat_subs: "Telegram obunachilar",
    float_cert: "100% Original",
    float_cert_sub: "Sertifikatli preparatlar",
    float_award: "Xavfsiz va Tabiiy",
    float_award_sub: "Tibbiy standartlar",
    trust_1_title: "Tibbiy Ma'lumot",
    trust_1_desc: "Oliy toifali tibbiy bilim va xalqaro tasdiqlangan sertifikatlar.",
    trust_2_title: "Original Preparatlar",
    trust_2_desc: "Dunyoga mashhur Juvederm, Dr. CPU, Gigi va rasmiy litsenziyali dorilar.",
    trust_3_title: "Zamonaviy Apparatlar",
    trust_3_desc: "Eng so'nggi lazer, mikrotok, ultratovush va karbon texnologiyalari.",
    trust_4_title: "135 000+ Obunachilar",
    trust_4_desc: "O'zbekiston bo'ylab yuz minglab ayollarning ishonchi va mehriga sazovor.",
    services_tag: "PREMIUM XIZMATLAR",
    services_title: "Barcha Kosmetologik Xizmatlar",
    services_desc: "Bizda barcha muolajalar qat'iy gigiyena, steril asboblar va individual reja asosida amalga oshiriladi.",
    filter_all: "Barchasi",
    filter_injections: "Inyeksiya & Botoks",
    filter_skincare: "Tozalash & Piling",
    filter_lifting: "Iplar & Lifting",
    filter_body: "Qomat & Tana",
    filter_lashbrow: "Kiprik & Qosh",
    btn_book_item: "Band qilish",
    calc_tag: "TEZ VA QULAY",
    calc_title: "Go'zallik Xarajatlarini Hisoblang",
    calc_desc: "O'zingizga kerakli xizmatlarni tanlang va to'plam uchun maxsus chegirmaga ega bo'ling!",
    calc_box_title: "Xizmatlarni tanlang:",
    calc_summary_title: "Tanlangan xizmatlar",
    calc_selected_count: "Tanlangan:",
    calc_discount_text: "2 yoki undan ortiq xizmat uchun 10% chegirma taqdim etildi!",
    calc_total_label: "Jami to'lov:",
    btn_calc_book: "To'plamni WhatsApp'da band qilish",
    about_tag: "KOSMETOLOG HAQIDA",
    about_title: "Shifokor-Kosmetolog Dildora",
    about_lead: "«Har bir ayol tabiatan go'zal, mening vazifam — bu go'zallikni ehtiyotkorlik bilan ochib berish va o'ziga bo'lgan ishonchni mustahkamlashdir.»",
    about_p1: "Men ko'p yillik tibbiy ma'lumotga va amaliy tajribaga ega shifokor-kosmetologman. Toshkentdagi shinam va zamonaviy klinikamda har bir mijozimga individual yondashaman.",
    about_p2: "Doimiy ravishda xalqaro master-klasslar, seminarlar va eng ilg'or estetik tibbiyot konferensiyalarida qatnashib, eng so'nggi xavfsiz texnikalarni amaliyotimda qo'llayman. Innovation Aesthetic va boshqa yetakchi institutlarning diplom va sertifikatlariga egaman.",
    badge_med: "Tibbiy ma'lumot",
    badge_inter: "Xalqaro sertifikatlar",
    badge_sterile: "Mutlaq sterillik",
    badge_custom: "Individual reja",
    academy_tag: "TA'LIM VA AMALIYOT",
    academy_title: "Kosmetologiya Shogirdlik Kursi",
    academy_desc: "Kosmetologiya sohasida professional bo'lishni xohlovchi qizlar uchun amaliy va nazariy darslar. O'rganing, rivojlaning va muvaffaqiyatga erishing!",
    syl_1: "Teri tuzilishi va dermatologik tahlil",
    syl_2: "Chuqur tozalash va apparatli kosmetologiya",
    syl_3: "Kislotali va karbonli piling texnikasi",
    syl_4: "Klassik va lifting massaj uslublari",
    syl_5: "Real mijozlarda individual amaliyot",
    syl_6: "Rasmiy sertifikat beriladi va ish boshlashda ko'mak",
    btn_academy_book: "Shogirdlikka yozilish (WhatsApp)",
    reels_tag: "JONLI JARAYON",
    reels_title: "Klinikamizdan Videolar",
    reels_desc: "Real muolajalar, steril muhit va quvonchli natijalarni videolarda tomosha qiling.",
    gallery_tag: "ISBOTLANGAN NATIJA",
    gallery_title: "Bizning Ishlarimiz va Galereya",
    ba_title: "Kontur Plastikasi va Tabiiy Natija",
    ba_desc: "Bizning asosiy maqsadimiz — tabiiy go'zallikni buzmagan holda, lablarga nafis hajm berish va yuz chiziqlarini yoshartirishdir.",
    ba_tip_1: "Qat'iy sertifikatlangan, so'riluvchi gialuron kislotasi",
    ba_tip_2: "Og'riqsiz muolaja (zamonaviy applikatsion anesteziya)",
    ba_tip_3: "12-18 oygacha saqlanib turuvchi barqaror effekt",
    reviews_tag: "ISHTIYOQ VA ISHONCH",
    reviews_title: "Mijozlarimizning Samimiy Fikrlari",
    reviews_desc: "Klinikamizga tashrif buyurgan mehmonlarimizning WhatsApp va Telegram orqali yozib qoldirgan haqiqiy xabarlari.",
    rev_1_text: "«Dilya opa, siz barbir bittasiz! Hech qachon aldab yoki qilgan ishingiz effekt bermay qolmagan. Mana 2 yildan beri faqat sizga kelaman, boshqasini tan olmayman. Qo'lingiz dard ko'rmasin!»",
    rev_1_author: "Nargiza Karimova",
    rev_1_serv: "Lab filleri va chistka",
    rev_2_text: "«Karbon piling va 3 bosqichli tozalashdan keyin yuzim shisha kabi yarqirab ketdi! Akne izlari yo'qoldi, teshiklar ko'rinmay qoldi. Dildora opaga katta rahmat!»",
    rev_2_author: "Dilnoza Rahimova",
    rev_2_serv: "Karbon piling & chistka",
    rev_3_text: "«Shogirdlik kursini tamomladim. Barcha nazariya va amaliyotni mehr bilan tushuntirib berdilar. Hozir o'zim erkin ishlayapman, sertifikat oldim. Eng zo'r ustoz!»",
    rev_3_author: "Madina Alimova",
    rev_3_serv: "Kosmetologiya akademiyasi",
    booking_tag: "BAND QILISH",
    booking_title: "Qabulga Yozilish",
    booking_banner_h: "Go'zalligingizni Professionallarga Ishoning",
    booking_banner_p: "Quyidagi shaklni to'ldiring va bir zumda WhatsApp orqali tasdiqlash xabarini yuboring. Administratorimiz darhol javob beradi.",
    guar_1: "Navbatsiz, qat'iy belgilangan vaqtda qabul",
    guar_2: "Bepul boshlang'ich tahlil va maslahat",
    guar_3: "Har bir mijozga 100% individual yondashuv",
    form_title: "Uchrashuvni rasmiylashtirish",
    form_subtitle: "Ma'lumotlaringizni kiriting va WhatsApp tugmasini bosing",
    label_name: "Ismingiz:",
    ph_name: "Masalan: Nilufar",
    label_phone: "Telefon raqamingiz:",
    ph_phone: "+998 90 123 45 67",
    label_service: "Kerakli xizmat:",
    select_service_ph: "-- Xizmatni tanlang --",
    label_date: "Qulay sana:",
    label_time: "Qulay vaqt:",
    time_morning: "Ertalab (09:00 - 12:00)",
    time_afternoon: "Tushdan keyin (12:00 - 16:00)",
    time_evening: "Kechki payt (16:00 - 20:00)",
    label_notes: "Qo'shimcha istaklaringiz (ixtiyoriy):",
    ph_notes: "Masalan: birinchi marta kelishim, allergiya haqida so'ramoqchiman...",
    btn_submit_booking: "WhatsApp orqali tasdiqlash",
    faq_tag: "SAVOL-JAVOBLAR",
    faq_title: "Ko'p Beriladigan Savollar",
    q1: "Muolajadan oldin maslahat olish shartmi?",
    a1: "Ha, har qanday protseduradan oldin terining holati, qarshi ko'rsatmalar va mijozning istaklari atroflicha tahlil qilinadi. Boshlang'ich konsultatsiya bepul.",
    q2: "Filler va botoks ta'siri qancha vaqt saqlanadi?",
    a2: "Biz faqat yuqori sifatli sertifikatlangan preparatlardan foydalanamiz. Botoks ta'siri 4-6 oy, gialuron kislotali lab va yuz fillerlari esa 12 oydan 18 oygacha chiroyli saqlanadi.",
    q3: "Inyeksiyalar og'riqlimi?",
    a3: "Barcha muolajalar zamonaviy yuqori sifatli og'riqsizlantiruvchi krem (anesteziya) ostida o'tkaziladi. Siz deyarli hech qanday noqulaylik sezmaysiz.",
    q4: "Klinikangiz qayerda joylashgan va qanday borish mumkin?",
    a4: "Klinikamiz Toshkent shahri, Chilonzor tumani, Al-Xorazmiy 18-kvartal, 16-uyda (Turkiston bank qarshisida) joylashgan. Eshigimiz ustida «KOSMETOLOG DILYA 1» deb yozilgan yorqin lavha bor.",
    contact_tag: "BOG'LANISH VA MANZIL",
    contact_title: "Bizning Manzilimiz",
    addr_title: "Aniq Manzil:",
    addr_val: "Toshkent shahri, Chilonzor tumani, Al-Xorazmiy mavzesi, 18-kvartal, 16-uy, 49-xonadon",
    landmark_title: "Mo'ljal:",
    landmark_val: "Al-Xorazmiy maydoni, Turkiston bank ro'parasida",
    phone_title: "Telefon & WhatsApp:",
    hours_title: "Ish Vaqti:",
    hours_val: "Dushanba - Yakshanba: 09:00 - 20:00",
    btn_gmaps: "Google Xaritada ochish",
    btn_yandex: "Yandex Navigatorda ochish",
    footer_desc: "Toshkentdagi yuqori darajali estetik tibbiyot va go'zallik klinikasi. Tabiiy nafislik va yoshlikni biz bilan saqlang.",
    footer_quick_links: "Tezkor Havolalar",
    footer_services_title: "Mashhur Xizmatlar",
    footer_rights: "Barcha huquqlar himoyalangan.",
    modal_success_title: "Buyurtma tayyor!",
    modal_success_p: "WhatsApp tayyor xabar bilan ochiladi. Yuborish tugmasini bosing. Agar ochilmasa, quyidagi WhatsApp havolasidan foydalaning.",
    btn_modal_close: "Tushunarli"
  },
  ru: {
    site_title: "Косметолог Дилдора | Профессиональная косметология в Ташкенте",
    promo_badge: "СУПЕР СКИДКА",
    promo_text: "Скидка до -30% на все процедуры! Успейте записаться заранее!",
    working_hours: "Ежедневно: 09:00 - 20:00 (По записи)",
    call_us: "Позвонить",
    nav_home: "Главная",
    nav_services: "Услуги и цены",
    nav_calc: "Калькулятор",
    nav_about: "О враче",
    nav_academy: "Обучение",
    nav_reels: "Видео",
    nav_gallery: "Результаты",
    nav_reviews: "Отзывы",
    nav_contact: "Контакты",
    btn_book_now: "Записаться на приём",
    hero_badge: "Сертифицированный косметолог с медицинским образованием",
    hero_title_1: "Ваша красота —",
    hero_title_2: "В надёжных руках",
    hero_desc: "Сохранение естественной молодости, контурная пластика губ, ботулинотерапия и аппаратная косметология премиум-класса в Ташкенте. Вы достойны лучшего!",
    btn_hero_book: "Запись через WhatsApp",
    btn_hero_tg: "Telegram (135 000+)",
    stat_clients: "Довольных клиентов",
    stat_experience: "Лет практики",
    stat_subs: "Подписчиков в Telegram",
    float_cert: "100% Оригинал",
    float_cert_sub: "Сертифицированные препараты",
    float_award: "Безопасно и естественно",
    float_award_sub: "Медицинские стандарты",
    trust_1_title: "Мед образование",
    trust_1_desc: "Глубокие знания анатомии и подтверждённые международные дипломы.",
    trust_2_title: "Оригинальные препараты",
    trust_2_desc: "Используем только лицензированные препараты: Juvederm, Dr. CPU, Gigi.",
    trust_3_title: "Передовые аппараты",
    trust_3_desc: "Современное оборудование для лазерного карбонового пилинга и чистки.",
    trust_4_title: "135 000+ аудитория",
    trust_4_desc: "Доверие сотен тысяч девушек по всему Узбекистану и за его пределами.",
    services_tag: "ПРЕМИУМ УСЛУГИ",
    services_title: "Косметологические услуги и прайс",
    services_desc: "Каждая процедура проводится в условиях идеальной стерильности с персональным подбором программы.",
    filter_all: "Все услуги",
    filter_injections: "Инъекции и Ботокс",
    filter_skincare: "Чистка и Пилинги",
    filter_lifting: "Нити и Лифтинг",
    filter_body: "Фигура и Тело",
    filter_lashbrow: "Ресницы и Брови",
    btn_book_item: "Записаться",
    calc_tag: "УДОБНО И ВЫГОДНО",
    calc_title: "Калькулятор стоимости процедур",
    calc_desc: "Выберите интересующие вас процедуры и получите скидку на комплексный пакет!",
    calc_box_title: "Отметьте необходимые процедуры:",
    calc_summary_title: "Ваш выбранный пакет",
    calc_selected_count: "Выбрано процедур:",
    calc_discount_text: "При выборе от 2 процедур начислена скидка 10%!",
    calc_total_label: "Итоговая стоимость:",
    btn_calc_book: "Забронировать пакет в WhatsApp",
    about_tag: "О КОСМЕТОЛОГЕ",
    about_title: "Доктор-Косметолог Дилдора",
    about_lead: "«Красота — это не просто внешность, это уверенность в себе и любовь к своему отражению в зеркале.»",
    about_p1: "Я являюсь дипломированным косметологом с медицинским образованием. В моей уютной и полностью оборудованной клинике на Чиланзаре создана атмосфера заботы, чистоты и комфорта.",
    about_p2: "Регулярно повышаю квалификацию, обучаясь у ведущих международных экспертов aesthetic medicine. Обладаю сертификатами Innovation Aesthetic и других профильных академий. Мой приоритет — натуральный результат без гиперкоррекции.",
    badge_med: "Медицинский диплом",
    badge_inter: "Сертификаты мастера",
    badge_sterile: "Стерильность 100%",
    badge_custom: "Индивидуальный план",
    academy_tag: "ОБУЧЕНИЕ И КУРСЫ",
    academy_title: "Школа косметологии — Приём учениц",
    academy_desc: "Практические и теоретические курсы для тех, кто хочет освоить профессию косметолога с нуля и начать достойно зарабатывать.",
    syl_1: "Анатомия лица, типы кожи и протоколы безопасности",
    syl_2: "3-этапная профессиональная чистка и ультразвук",
    syl_3: "Химические, поверхностные и карбоновые пилинги",
    syl_4: "Техники моделирующего и лифтинг массажа",
    syl_5: "Практическая отработка на моделях и реальных клиентах",
    syl_6: "Выдача официального сертификата и поддержка после курса",
    btn_academy_book: "Записаться на курс в WhatsApp",
    reels_tag: "ЖИВЫЕ ВИДЕО",
    reels_title: "Атмосфера клиники и процедуры",
    reels_desc: "Посмотрите реальные видеокадры процедур, консультаций и нашего кабинета.",
    gallery_tag: "РЕЗУЛЬТАТЫ",
    gallery_title: "Наши работы и преображения",
    ba_title: "Контурная пластика губ и гармония лица",
    ba_desc: "Коррекция формы, увлажнение и устранение признаков старения с сохранением мягкости и природной эстетики.",
    ba_tip_1: "Сертифицированная гиалуроновая кислота высокой очистки",
    ba_tip_2: "Абсолютный комфорт благодаря качественной анестезии",
    ba_tip_3: "Стойкий эффект от 12 до 18 месяцев",
    reviews_tag: "ОТЗЫВЫ",
    reviews_title: "Что говорят наши клиентки",
    reviews_desc: "Реальные скриншоты и слова благодарности из наших чатов в WhatsApp и Telegram.",
    rev_1_text: "«Диля, вы просто волшебница! Ваши руки золотые. Всегда только к вам уже 2 года, ни на кого не променяю. Результат всегда превосходит ожидания!»",
    rev_1_author: "Наргиза Каримова",
    rev_1_serv: "Филлер губ и уход",
    rev_2_text: "«После карбонового пилинга и чистки кожа сияет, как после дорогого спа-курорта! Поры чистые, пигмент ушел. Спасибо огромное доктору Дилдоре!»",
    rev_2_author: "Дильноза Рахимова",
    rev_2_serv: "Карбоновый пилинг",
    rev_3_text: "«Прошла курс обучения косметологии. Доктор Дилдора так щедро делится опытом! Теперь сама принимаю клиенток и уверенно работаю. Спасибо за путевку в жизнь!»",
    rev_3_author: "Мадина Алимова",
    rev_3_serv: "Выпускница курса",
    booking_tag: "ЗАПИСЬ",
    booking_title: "Забронируйте удобное время",
    booking_banner_h: "Доверьте заботу о себе профессионалу",
    booking_banner_p: "Заполните форму, и мы автоматически подготовим сообщение для отправки в WhatsApp нашему администратору.",
    guar_1: "Приём строго по расписанию без очередей",
    guar_2: "Бесплатная первичная диагностика кожи",
    guar_3: "100% сертифицированные препараты",
    form_title: "Форма предварительной записи",
    form_subtitle: "Заполните поля и нажмите кнопку отправки в WhatsApp",
    label_name: "Ваше имя:",
    ph_name: "Например: Азиза",
    label_phone: "Номер телефона:",
    ph_phone: "+998 90 123 45 67",
    label_service: "Желаемая услуга:",
    select_service_ph: "-- Выберите процедуру --",
    label_date: "Желаемая дата:",
    label_time: "Удобное время:",
    time_morning: "Утро (09:00 - 12:00)",
    time_afternoon: "День (12:00 - 16:00)",
    time_evening: "Вечер (16:00 - 20:00)",
    label_notes: "Пожелания или вопросы (необязательно):",
    ph_notes: "Например: первый раз, хотела бы уточнить противопоказания...",
    btn_submit_booking: "Подтвердить запись в WhatsApp",
    faq_tag: "ВОПРОСЫ И ОТВЕТЫ",
    faq_title: "Часто задаваемые вопросы",
    q1: "Нужна ли предварительная консультация?",
    a1: "Да, перед любой инъекционной или сложной аппаратной процедурой доктор Дилдора проводит осмотр и консультацию. Это гарантирует максимальную безопасность.",
    q2: "Сколько длится эффект от филлеров и ботокса?",
    a2: "Ботокс сохраняет гладкость кожи от 4 до 6 месяцев. Филлеры на основе гиалуроновой кислоты в губах и скулах сохраняют объём от 12 до 18 месяцев.",
    q3: "Болезненны ли инъекционные процедуры?",
    a3: "Перед процедурой наносится мощный гипоаллергенный анестетик в виде крема. Процедура переносится очень легко и комфортно.",
    q4: "Где именно находится клиника?",
    a4: "Мы находимся по адресу: г. Ташкент, Чиланзар-18, дом 16, кв. 49 (прямо напротив Туркистон банка). Над входом расположена яркая золотая вывеска «KOSMETOLOG DILYA 1».",
    contact_tag: "КОНТАКТЫ",
    contact_title: "Как нас найти",
    addr_title: "Точный адрес:",
    addr_val: "г. Ташкент, Чиланзарский район, ул. Аль-Хорезми, 18-й квартал, дом 16, кв. 49",
    landmark_title: "Ориентир:",
    landmark_val: "Площадь Аль-Хорезми, напротив Туркистон банка",
    phone_title: "Телефон и WhatsApp:",
    hours_title: "Часы приёма:",
    hours_val: "Понедельник - Воскресенье: 09:00 - 20:00",
    btn_gmaps: "Открыть в Google Maps",
    btn_yandex: "Открыть в Яндекс Навигаторе",
    footer_desc: "Клиника эстетической косметологии доктора Дилдоры в Ташкенте. Сохранение вашей молодости и естественного очарования.",
    footer_quick_links: "Быстрые ссылки",
    footer_services_title: "Популярные услуги",
    footer_rights: "Все права защищены.",
    modal_success_title: "Заявка сформирована!",
    modal_success_p: "Сейчас откроется WhatsApp с готовым текстом записи. Нажмите «Отправить», и наш администратор сразу же подтвердит бронь.",
    btn_modal_close: "Понятно"
  },
  en: {
    site_title: "Cosmetologist Dildora | Medical Aesthetic Clinic Tashkent",
    promo_badge: "SPECIAL PROMO",
    promo_text: "Up to 30% discount on all aesthetic procedures! Book your appointment today!",
    working_hours: "Daily: 09:00 - 20:00 (By Appointment)",
    call_us: "Call Now",
    nav_home: "Home",
    nav_services: "Services & Prices",
    nav_calc: "Calculator",
    nav_about: "About Doctor",
    nav_academy: "Academy",
    nav_reels: "Videos",
    nav_gallery: "Results",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    btn_book_now: "Book Appointment",
    hero_badge: "Certified Aesthetic Doctor with Medical Education",
    hero_title_1: "Your Beauty —",
    hero_title_2: "In Caring Expert Hands",
    hero_desc: "Advanced medical cosmetology, non-surgical facial rejuvenation, lip contouring and state-of-the-art skincare in Tashkent. Experience elegance tailored to you.",
    btn_hero_book: "Book via WhatsApp",
    btn_hero_tg: "Telegram (135K+)",
    stat_clients: "Happy Clients",
    stat_experience: "Years Practice",
    stat_subs: "Telegram Followers",
    float_cert: "100% Genuine",
    float_cert_sub: "Certified Injectables",
    float_award: "Safe & Natural",
    float_award_sub: "Strict Medical Hygiene",
    trust_1_title: "Medical Credentials",
    trust_1_desc: "Clinical background and international certifications in aesthetic medicine.",
    trust_2_title: "Premium Products",
    trust_2_desc: "Only authentic, globally certified dermal fillers: Juvederm, Dr. CPU, Gigi.",
    trust_3_title: "Modern Devices",
    trust_3_desc: "High-precision ultrasound, carbon laser peeling and hydra-cleansing machines.",
    trust_4_title: "135,000+ Followers",
    trust_4_desc: "Trusted by thousands of clients across Uzbekistan, Moscow and beyond.",
    services_tag: "CLINICAL SERVICES",
    services_title: "Treatments & Price Menu",
    services_desc: "Every procedure is performed under stringent sterile conditions with an individual skin evaluation.",
    filter_all: "All Treatments",
    filter_injections: "Injections & Botox",
    filter_skincare: "Cleansing & Peels",
    filter_lifting: "Threads & Lifting",
    filter_body: "Body & Contouring",
    filter_lashbrow: "Lash & Brow",
    btn_book_item: "Book Now",
    calc_tag: "INTERACTIVE CALCULATOR",
    calc_title: "Estimate Your Treatment Package",
    calc_desc: "Select the procedures you want and unlock an exclusive 10% multi-treatment discount!",
    calc_box_title: "Choose procedures:",
    calc_summary_title: "Package Summary",
    calc_selected_count: "Selected items:",
    calc_discount_text: "10% multi-procedure discount applied!",
    calc_total_label: "Total Price:",
    btn_calc_book: "Confirm Package via WhatsApp",
    about_tag: "MEET THE DOCTOR",
    about_title: "Dr. Dildora, Medical Cosmetologist",
    about_lead: "«True aesthetic medicine enhances your unique features rather than altering who you are. Beauty is self-confidence.»",
    about_p1: "With formal medical education and extensive clinical training, I dedicate my career to safe, natural-looking aesthetic transformations. Our clinic in Chilanzar provides a luxurious, welcoming and sterile space for every guest.",
    about_p2: "I continuously advance my techniques through masterclasses at Innovation Aesthetic and global conferences. We emphasize gentle techniques, pain-free application and harmonious results.",
    badge_med: "Medical Degree",
    badge_inter: "Master Certifications",
    badge_sterile: "Clinical Sterility",
    badge_custom: "Personalized Protocol",
    academy_tag: "TRAINING & COURSES",
    academy_title: "Cosmetology Masterclass & Apprenticeship",
    academy_desc: "Comprehensive hands-on cosmetology training for aspiring specialists. Learn theory, master device operation and gain real clinical client practice.",
    syl_1: "Skin anatomy, histology and contraindications",
    syl_2: "3-stage deep ultrasonic and manual cleansing",
    syl_3: "Chemical, enzymatic and laser carbon peeling",
    syl_4: "Sculpting and lymphatic drainage facial massage",
    syl_5: "Supervised hands-on training on live models",
    syl_6: "Official Certificate of Completion & career guidance",
    btn_academy_book: "Enroll via WhatsApp",
    reels_tag: "CLINIC STORIES",
    reels_title: "Behind The Scenes & Live Procedures",
    reels_desc: "Watch our real treatments, sterile preparation and smiling patients.",
    gallery_tag: "BEFORE & AFTER",
    gallery_title: "Clinical Transformations",
    ba_title: "Lip Contouring & Facial Rejuvenation",
    ba_desc: "Symmetrical volume restoration and wrinkle smoothing with natural mobility and plumpness.",
    ba_tip_1: "Biodegradable, ultrapure hyaluronic acid",
    ba_tip_2: "Topical medical anesthetic for painless comfort",
    ba_tip_3: "Long-lasting results up to 12-18 months",
    reviews_tag: "TESTIMONIALS",
    reviews_title: "Loved by Over 135,000 Clients",
    reviews_desc: "Authentic messages and feedback sent directly by our cherished clients.",
    rev_1_text: "«Doctor Dilya is truly one of a kind! Every treatment produces wonderful, noticeable results. I have been coming here for 2 years and wouldn't trust anyone else.»",
    rev_1_author: "Nargiza Karimova",
    rev_1_serv: "Lip Fillers & Skin Therapy",
    rev_2_text: "«My skin feels radiant and smooth like glass after the carbon peel and deep cleansing. Acne marks faded away completely. Thank you, Dildora!»",
    rev_2_author: "Dilnoza Rakhimova",
    rev_2_serv: "Carbon Peel & Cleansing",
    rev_3_text: "«I completed Doctor Dildora’s cosmetology course. She shared all her practical tips generously. Now I have my own thriving practice with my diploma!»",
    rev_3_author: "Madina Alimova",
    rev_3_serv: "Academy Graduate",
    booking_tag: "APPOINTMENT",
    booking_title: "Schedule Your Visit",
    booking_banner_h: "Reserve Your Private Consultation",
    booking_banner_p: "Fill in the details below. A pre-formatted WhatsApp confirmation will be sent directly to our clinic phone.",
    guar_1: "Punctual appointment without waiting queues",
    guar_2: "Complimentary initial skin assessment",
    guar_3: "100% authentic certified injectables",
    form_title: "Online Booking Form",
    form_subtitle: "Enter your contact details and proceed to WhatsApp",
    label_name: "Your Name:",
    ph_name: "e.g., Jennifer",
    label_phone: "Phone Number:",
    ph_phone: "+998 90 123 45 67",
    label_service: "Desired Service:",
    select_service_ph: "-- Select a service --",
    label_date: "Preferred Date:",
    label_time: "Preferred Time:",
    time_morning: "Morning (09:00 - 12:00)",
    time_afternoon: "Afternoon (12:00 - 16:00)",
    time_evening: "Evening (16:00 - 20:00)",
    label_notes: "Special Requests or Questions (Optional):",
    ph_notes: "e.g., First time visit, would like consultation on fillers...",
    btn_submit_booking: "Send Booking via WhatsApp",
    faq_tag: "FAQ",
    faq_title: "Frequently Asked Questions",
    q1: "Is an initial consultation required?",
    a1: "Yes, Doctor Dildora examines your skin type and health history before any procedure to ensure absolute safety and optimal aesthetic harmony.",
    q2: "How long do filler and Botox results last?",
    a2: "Botox results typically last 4 to 6 months. Hyaluronic acid dermal fillers for lips, cheeks and jawline last 12 to 18 months depending on metabolism.",
    q3: "Are the treatments painful?",
    a3: "We use professional topical anesthetic creams prior to any injection, making the experience gentle, relaxing and virtually painless.",
    q4: "Where is the clinic located?",
    a4: "We are located at: Tashkent, Chilanzar-18, Building 16, Apt 49 (opposite Turkiston Bank). Look for the golden illuminated sign «KOSMETOLOG DILYA 1».",
    contact_tag: "LOCATION & HOURS",
    contact_title: "Find Our Clinic",
    addr_title: "Address:",
    addr_val: "Tashkent, Chilanzar district, Al-Khwarizmi, 18th Block, Building 16, Apt 49",
    landmark_title: "Landmark:",
    landmark_val: "Al-Khwarizmi Square, opposite Turkiston Bank",
    phone_title: "Phone & WhatsApp:",
    hours_title: "Working Hours:",
    hours_val: "Monday - Sunday: 09:00 - 20:00",
    btn_gmaps: "Open in Google Maps",
    btn_yandex: "Open in Yandex Navigator",
    footer_desc: "Luxury medical cosmetology clinic in Tashkent led by certified Doctor Dildora. Elevating your natural beauty with science and care.",
    footer_quick_links: "Quick Links",
    footer_services_title: "Popular Treatments",
    footer_rights: "All rights reserved.",
    modal_success_title: "Booking Prepared!",
    modal_success_p: "WhatsApp is opening with your formatted appointment details. Tap 'Send' to dispatch your booking directly to Dr. Dildora's desk.",
    btn_modal_close: "Got it"
  },
  ar: {
    site_title: "عيادة ديلدورا للتجميل | خبيرة تجميل معتمدة بمؤهل طبي في طشقند",
    promo_badge: "عروض حصرية",
    promo_text: "تخفيضات تصل إلى 30% على جميع الإجراءات التجميلية! احجزي موعدكِ الآن!",
    working_hours: "يومياً: 09:00 ص - 08:00 م (بالحجز المسبق)",
    call_us: "اتصال مباشر",
    nav_home: "الرئيسية",
    nav_services: "الخدمات والأسعار",
    nav_calc: "حاسبة التكلفة",
    nav_about: "عن الخبيرة",
    nav_academy: "الأكاديمية والتدريب",
    nav_reels: "فيديوهات",
    nav_gallery: "النتائج",
    nav_reviews: "آراء العميلات",
    nav_contact: "الموقع والتواصل",
    btn_book_now: "احجزي موعدكِ الآن",
    hero_badge: "خبيرة تجميل معتمدة وحاصلة على مؤهل طبي معتمد",
    hero_title_1: "جمالكِ الطبيعي —",
    hero_title_2: "في أيدٍ طبية أمينة",
    hero_desc: "أحدث التقنيات الطبية غير الجراحية، فيلر الشفاه وتحديد الملامح، البوتوكس، وعلاجات نضارة البشرة في قلب العاصمة طشقند. أنتِ تستحقين الأفضل دوماً!",
    btn_hero_book: "حجز فوري عبر واتساب",
    btn_hero_tg: "قناة التليجرام (135 ألف+)",
    stat_clients: "عميلة راضية",
    stat_experience: "سنوات خبرة طبية",
    stat_subs: "متابع في تليجرام",
    float_cert: "100% أصلي ومعتمد",
    float_cert_sub: "مواد تجميلية مرخصة دولياً",
    float_award: "آمن وطبيعي",
    float_award_sub: "معايير تعقيم طبية صارمة",
    trust_1_title: "مؤهل طبي معتمد",
    trust_1_desc: "دراسة طبية متخصصة وشهادات دولية موثقة في طب التجميل.",
    trust_2_title: "مستحضرات أصلية 100%",
    trust_2_desc: "أجود أنواع الفيلر والبوتوكس العالمية: Juvederm, Dr. CPU, Gigi.",
    trust_3_title: "أجهزة متطورة",
    trust_3_desc: "أحدث أجهزة الليزر الكربوني، التنظيف العميق، والموجات فوق الصوتية.",
    trust_4_title: "مجتمع 135,000+ متابع",
    trust_4_desc: "ثقة مئات الآلاف من السيدات في أوزبكستان وروسيا وخارجها.",
    services_tag: "خدماتنا المتميزة",
    services_title: "قائمة الإجراءات التجميلية والأسعار",
    services_desc: "تُجرى جميع الجلسات في بيئة طبية معقمة وبأعلى معايير السلامة والأناقة.",
    filter_all: "جميع الخدمات",
    filter_injections: "الحقن والبوتوكس",
    filter_skincare: "التنظيف والتقشير",
    filter_lifting: "الخيوط والشد",
    filter_body: "نحت الجسم",
    filter_lashbrow: "الرموش والحواجب",
    btn_book_item: "حجز الخدمة",
    calc_tag: "حاسبة الجمال التفاعلية",
    calc_title: "احسبي تكلفة باقتكِ التجميلية",
    calc_desc: "اختاري الإجراءات التي ترغبين بها واحصلي على خصم فوري 10% عند اختيار أكثر من إجراء!",
    calc_box_title: "حددي الإجراءات المطلوبة:",
    calc_summary_title: "ملخص باقتكِ المختارة",
    calc_selected_count: "عدد الخدمات:",
    calc_discount_text: "تم تطبيق خصم 10% لاختياركِ باقة متعددة الخدمات!",
    calc_total_label: "السعر الإجمالي:",
    btn_calc_book: "حجز هذه الباقة عبر واتساب",
    about_tag: "عن الطبيبة والخبيرة",
    about_title: "الدكتورة خبيرة التجميل ديلدورا",
    about_lead: "«الجمال الحقيقي هو إبراز سحركِ الطبيعي وتعزيز ثقتكِ بنفسكِ دون تغيير لملامحكِ الفريدة.»",
    about_p1: "خبيرة تجميل مرخصة ذات خلفية طبية متخصصة وخبرة واسعة في الطب التجميلي غير الجراحي. في عيادتي الحديثة بمنطقة تشيلونزور، أحرص على تقديم أرقى مستويات الراحة والعناية الفائقة.",
    about_p2: "أحرص دائماً على مواكبة أحدث التطورات بحضور مؤتمرات ودورات أكاديمية Innovation Aesthetic العالمية. شعارنا دوماً: أمان تام، نتائج طبيعية، ورضا كامل.",
    badge_med: "مؤهل طبي معتمد",
    badge_inter: "شهادات تدريب دولية",
    badge_sterile: "تعقيم طبي 100%",
    badge_custom: "خطة علاج مخصصة",
    academy_tag: "الأكاديمية والتدريب",
    academy_title: "دورات تدريب التجميل (برنامج التلمذة)",
    academy_desc: "دورات نظرية وعملية مكثفة للفتيات الراغبات باحتراف مهنة التجميل والبدء بمسيرة مهنية ناجحة ومربحة.",
    syl_1: "تشريح البشرة وطبقات الجلد والتقييم السريري",
    syl_2: "التنظيف العميق للبشرة بالأجهزة والموجات الصوتية",
    syl_3: "بروتوكولات التقشير الكيميائي والتقشير الكربوني",
    syl_4: "تقنيات تدليك الوجه وشد العضلات",
    syl_5: "تطبيق عملي مكثف على عميلات حقيقيات",
    syl_6: "منح شهادة تخرج معتمدة مع التوجيه لبدء العمل",
    btn_academy_book: "التسجيل في الدورة عبر واتساب",
    reels_tag: "فيديوهات حية",
    reels_title: "نبض العيادة وجلسات العلاج",
    reels_desc: "شاهدي مقاطع حية من جلسات الحقن والعناية والتعقيم داخل عيادتنا.",
    gallery_tag: "قبل وبعد",
    gallery_title: "معرض التحولات والنتائج",
    ba_title: "فيلر الشفاه ونضارة الملامح الطبيعية",
    ba_desc: "استعادة امتلاء الشفاه وتناسقها وترطيبها العميق بنتيجة طبيعية ناعمة وجذابة.",
    ba_tip_1: "حمض هيالورونيك نقي وقابل للامتصاص بأمان",
    ba_tip_2: "جلسة مريحة بدون ألم باستخدام تخدير موضعي فعال",
    ba_tip_3: "نتائج تدوم من 12 إلى 18 شهراً",
    reviews_tag: "شهادات نعتز بها",
    reviews_title: "ماذا تقول عميلاتنا العزيزات",
    reviews_desc: "رسائل شكر وثناء حقيقية وصلتنا عبر واتساب وتليجرام من عميلاتنا الدائمات.",
    rev_1_text: "«ديلدورا العزيزة، أنتِ الأفضل بلا منازع! منذ سنتين وأنا زبونة دائمة عندكِ، عملكِ صادق ونتائجه دائماً مبهرة ومضمونة. سلمت يداكِ!»",
    rev_1_author: "نرجس كريموفا",
    rev_1_serv: "فيلر الشفاه وتنظيف البشرة",
    rev_2_text: "«بشرتي بعد التقشير الكربوني والتنظيف أصبحت متوهجة مثل الزجاج! اختفت البقع والمسام أصبحت ناعمة جداً. شكراً جزيلاً دكتورة ديلدورا!»",
    rev_2_author: "دلنوزة رحيموفا",
    rev_2_serv: "تقشير كربوني وعناية",
    rev_3_text: "«تخرجت من دورة التجميل لدى الدكتورة ديلدورا. شرحت لنا كل شيء بتفانٍ وحب. اليوم أعمل بكل ثقة وبدأت مشروعي الخاص بفضل تدريبها!»",
    rev_3_author: "مدينة عليموفا",
    rev_3_serv: "خريجة أكاديمية التجميل",
    booking_tag: "حجز موعد",
    booking_title: "احجزي جلستكِ الخاصة الآن",
    booking_banner_h: "ضعي جمالكِ في أيدي الخبراء",
    booking_banner_p: "املئي البيانات وسيتم تجهيز رسالة حجز رسمية تلقائياً لإرسالها عبر تطبيق واتساب لمكتب الدكتورة ديلدورا.",
    guar_1: "مواعيد دقيقة دون انتظار",
    guar_2: "استشارة وتحديد نوع البشرة مجاناً",
    guar_3: "مواد طبية أصلية ومطابقة للمواصفات",
    form_title: "استمارة الحجز الإلكتروني",
    form_subtitle: "أدخلي بياناتكِ ثم اضغطي على زر التحويل للواتساب",
    label_name: "الاسم الكريم:",
    ph_name: "مثال: مريم",
    label_phone: "رقم الهاتف / الواتساب:",
    ph_phone: "+998 90 123 45 67",
    label_service: "الخدمة المطلوبة:",
    select_service_ph: "-- اختاري الخدمة --",
    label_date: "التاريخ المفضل:",
    label_time: "الوقت المناسب:",
    time_morning: "صباحاً (09:00 ص - 12:00 م)",
    time_afternoon: "ظهراً (12:00 م - 04:00 م)",
    time_evening: "مساءً (04:00 م - 08:00 م)",
    label_notes: "ملاحظات أو استفسار إضافي (اختياري):",
    ph_notes: "مثال: هذه زيارتي الأولى، أود السؤال عن موانع الاستعمال...",
    btn_submit_booking: "تأكيد الحجز والإرسال عبر واتساب",
    faq_tag: "الأسئلة الشائعة",
    faq_title: "إجابات على أكثر ما يشغل بالكِ",
    q1: "هل يلزم إجراء كشف واستشارة قبل الجلسة؟",
    a1: "نعم، تقوم الدكتورة ديلدورا بفحص البشرة والتأكد من عدم وجود موانع صحية قبل البدء بأي إجراء لضمان سلامتكِ الكاملة، والاستشارة الأولية مجانية.",
    q2: "كم تدوم نتائج الفيلر والبوتوكس؟",
    a2: "يدوم تأثير البوتوكس ما بين 4 إلى 6 أشهر، بينما يدوم فيلر الهيالورونيك للشفاه وتحديد الوجه ما بين 12 إلى 18 شهراً بحسب طبيعة الجسم.",
    q3: "هل الإجراءات مؤلمة؟",
    a3: "نستخدم كريماً مخدراً موضعياً عالي الفعالية قبل أي حقن، مما يجعل الجلسة مريحة جداً وخالية من الألم بنسبة كبيرة.",
    q4: "أين تقع العيادة بالتحديد؟",
    a4: "تقع عيادتنا في أوزبكستان، العاصمة طشقند، منطقة تشيلونزور، شارع الخوارزمي، الحي 18، المبنى 16، الشقة 49 (مباشرة أمام بنك تركستان). ستجدين لافتة ذهبية واضحة بالاسم «KOSMETOLOG DILYA 1».",
    contact_tag: "العنوان والتواصل",
    contact_title: "موقعنا وكيفية الوصول إلينا",
    addr_title: "العنوان الدقيق:",
    addr_val: "أوزبكستان، طشقند، منطقة تشيلونزور، شارع الخوارزمي، حي 18، منزل 16، شقة 49",
    landmark_title: "أقرب نقطة دالة:",
    landmark_val: "ميدان الخوارزمي، أمام بنك تركستان مباشرة",
    phone_title: "الهاتف والواتساب:",
    hours_title: "ساعات العمل:",
    hours_val: "من الإثنين إلى الأحد: 09:00 صباحاً - 08:00 مساءً",
    btn_gmaps: "فتح الموقع في Google Maps",
    btn_yandex: "فتح الموقع في Yandex",
    footer_desc: "عيادة التجميل الطبي الراقية للدكتورة ديلدورا في طشقند. رعاية طبية متكاملة للحفاظ على شبابكِ وجمالكِ الطبيعي.",
    footer_quick_links: "روابط سريعة",
    footer_services_title: "أشهر الخدمات",
    footer_rights: "جميع الحقوق محفوظة.",
    modal_success_title: "تم تجهيز تفاصيل حجزكِ!",
    modal_success_p: "سيتم الآن تحويلكِ إلى تطبيق واتساب مع رسالة الحجز الجاهزة. اضغطي على زر 'إرسال' وسيقوم فريق الاستقبال بتأكيد موعدكِ فوراً.",
    btn_modal_close: "تم الفهم"
  }
};

// Format Price based on current Currency and Language
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function clinicToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = type => parts.find(item => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function playVideo(player) {
  const playback = player.play();
  if (playback) playback.catch(() => {}); // Autoplay can be blocked by the browser.
}

function openWhatsApp(url) {
  if (!url || !url.startsWith('https://wa.me/')) return;
  // Keep the direct user gesture so mobile browsers do not block the new tab.
  const fallback = document.getElementById('whatsappFallback');
  if (fallback) fallback.href = url;
  window.open(url, '_blank', 'noopener,noreferrer');
  showModal('successModal');
}

function formatPrice(priceUzs, priceUsd) {
  if (currentCurrency === 'usd') {
    return `$${priceUsd}`;
  }
  return new Intl.NumberFormat(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ').format(priceUzs) + (currentLang === 'ar' ? ' سوم' : ' UZS');
}

// Render Services Grid
function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  const filtered = activeCategory === 'all' 
    ? servicesData 
    : servicesData.filter(s => s.category === activeCategory);

  container.innerHTML = filtered.map(service => {
    const name = escapeHtml(service.name[currentLang] || service.name.uz);
    const desc = escapeHtml(service.desc[currentLang] || service.desc.uz);
    const category = escapeHtml(service.category);
    const priceFormatted = formatPrice(service.priceUzs, service.priceUsd);
    const oldPriceFormatted = service.oldPriceUzs 
      ? (currentCurrency === 'usd' ? `$${service.oldPriceUsd || Math.round(service.oldPriceUzs / USD_RATE)}` : new Intl.NumberFormat('uz-UZ').format(service.oldPriceUzs) + ' UZS')
      : '';

    return `
      <div class="service-card ${service.popular ? 'featured' : ''}" data-category="${category}">
        <div class="service-top">
          <span class="service-category-tag">${category.toUpperCase()}</span>
          <h3 class="service-name">${name}</h3>
          <p class="service-desc">${desc}</p>
          <div class="service-meta-pills">
            <span class="meta-pill"><i class="fa-regular fa-clock"></i> ${service.durationMin} min</span>
            <span class="meta-pill"><i class="fa-solid fa-shield-halved"></i> Sterile</span>
            ${service.popular ? `<span class="meta-pill" style="background:#fde2e4;color:#d90429;"><i class="fa-solid fa-fire"></i> Best Offer</span>` : ''}
          </div>
        </div>
        <div class="service-bottom">
          <div class="price-wrap">
            ${oldPriceFormatted ? `<span class="price-old">${oldPriceFormatted}</span>` : ''}
            <span class="price-current">${priceFormatted}</span>
          </div>
          <button class="btn btn-primary btn-book-service" type="button" data-book-service="${escapeHtml(service.id)}">
            <i class="fa-brands fa-whatsapp"></i>
            <span>${translations[currentLang].btn_book_item}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Calculator Items
function renderCalculator() {
  const container = document.getElementById('calcItemsGrid');
  if (!container) return;

  container.innerHTML = servicesData.map(service => {
    const isSelected = selectedCalcItems.has(service.id);
    const name = escapeHtml(service.name[currentLang] || service.name.uz);
    const priceFormatted = formatPrice(service.priceUzs, service.priceUsd);

    return `
      <label class="calc-checkbox-label ${isSelected ? 'selected' : ''}">
        <input type="checkbox" class="calc-checkbox" ${isSelected ? 'checked' : ''} data-calc-service="${escapeHtml(service.id)}">
        <div class="calc-item-text">
          <span class="calc-item-name">${name}</span>
          <span class="calc-item-price">${priceFormatted}</span>
        </div>
      </label>
    `;
  }).join('');

  updateCalcSummary();
}

// Toggle Calculator Selection
function toggleCalcItem(id) {
  if (!servicesData.some(service => service.id === id)) return;
  if (selectedCalcItems.has(id)) {
    selectedCalcItems.delete(id);
  } else {
    selectedCalcItems.add(id);
  }
  const input = document.querySelector(`[data-calc-service="${id}"]`);
  if (input) {
    input.checked = selectedCalcItems.has(id);
    input.closest('label').classList.toggle('selected', input.checked);
  }
  updateCalcSummary();
}

// Update Calculator Summary Calculation
function updateCalcSummary() {
  const countEl = document.getElementById('calcSelectedCount');
  const discountEl = document.getElementById('calcDiscountNotice');
  const totalEl = document.getElementById('calcTotalVal');
  const bookBtn = document.getElementById('btnCalcBook');

  let totalUzs = 0;
  let totalUsd = 0;

  selectedCalcItems.forEach(id => {
    const s = servicesData.find(item => item.id === id);
    if (s) {
      totalUzs += s.priceUzs;
      totalUsd += s.priceUsd;
    }
  });

  const count = selectedCalcItems.size;
  if (countEl) countEl.textContent = `${translations[currentLang].calc_selected_count} ${count}`;

  // If 2 or more services, apply 10% multi-treatment package discount
  let hasDiscount = count >= 2;
  if (hasDiscount) {
    totalUzs = Math.round(totalUzs * 0.9);
    totalUsd = Math.round(totalUsd * 0.9);
    if (discountEl) discountEl.style.display = 'flex';
  } else {
    if (discountEl) discountEl.style.display = 'none';
  }

  if (totalEl) {
    totalEl.textContent = formatPrice(totalUzs, totalUsd);
  }

  if (bookBtn) {
    bookBtn.disabled = count === 0;
    bookBtn.style.opacity = count === 0 ? '0.6' : '1';
  }
}

// Book Calculated Package via WhatsApp
function bookCalcPackage() {
  if (selectedCalcItems.size === 0) {
    alert(currentLang === 'uz' ? "Iltimos, avval kamida bitta xizmatni tanlang!" : "Пожалуйста, выберите хотя бы одну услугу!");
    return;
  }

  const selectedNames = Array.from(selectedCalcItems).map(id => {
    const s = servicesData.find(item => item.id === id);
    return s ? `• ${s.name[currentLang] || s.name.uz}` : '';
  }).join('\n');

  const totalStr = document.getElementById('calcTotalVal')?.textContent || '';

  const msg = encodeURIComponent(
`🌸 *YANGI TO'PLAM BUYURTMASI / ЗАКАЗ ПАКЕТА УСЛУГ* 🌸

Xizmatlar to'plami:
${selectedNames}

💰 Jami narxi: ${totalStr}

Menga ushbu to'plam bo'yicha qulay vaqt belgilab bersangiz!`
  );

  openWhatsApp(`https://wa.me/998900179000?text=${msg}`);
}

// Populate Service Select in Booking Form
function populateServiceSelect() {
  const select = document.getElementById('bookingServiceSelect');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = `<option value="">${translations[currentLang].select_service_ph}</option>` +
    servicesData.map(s => {
      const name = escapeHtml(s.name[currentLang] || s.name.uz);
      const price = formatPrice(s.priceUzs, s.priceUsd);
      return `<option value="${escapeHtml(s.id)}">${name} (${price})</option>`;
    }).join('');

  if (currentVal) select.value = currentVal;
}

// Preselect Service and Smooth Scroll to Booking Form
function preselectAndBook(serviceId) {
  const select = document.getElementById('bookingServiceSelect');
  if (select) {
    select.value = serviceId;
  }
  const section = document.getElementById('bookingSection');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Switch Language and Refresh UI
function setLanguage(lang) {
  if (!Object.hasOwn(translations, lang)) return;
  currentLang = lang;

  // Safe localStorage save
  try {
    localStorage.setItem('kd_lang', lang);
  } catch (e) {
    console.warn('localStorage write error:', e);
  }

  // Set HTML attributes
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('translate', 'no');
  html.classList.add('notranslate');

  if (lang === 'ar') {
    html.setAttribute('dir', 'rtl');
    document.body.setAttribute('dir', 'rtl');
  } else {
    html.setAttribute('dir', 'ltr');
    document.body.setAttribute('dir', 'ltr');
  }

  // Update page title
  if (translations[lang] && translations[lang].site_title) {
    document.title = translations[lang].site_title;
  }

  // Update active label in dropdown button (if present)
  const currentLangCode = document.getElementById('currentLangCode');
  if (currentLangCode) {
    currentLangCode.textContent = lang.toUpperCase();
  }

  // Update active class on all segmented language buttons
  document.querySelectorAll('.lang-seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update active class on dropdown options (if present)
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // Close dropdown if open
  document.getElementById('langDropdown')?.classList.remove('show');

  // Update static text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && Object.hasOwn(translations[lang], key)) {
      el.textContent = translations[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (translations[lang] && Object.hasOwn(translations[lang], key)) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });

  // Re-render dynamic components
  renderServices();
  renderCalculator();
  populateServiceSelect();
  renderReels();
  document.querySelectorAll('.faq-item.active .faq-answer').forEach(answer => {
    answer.style.maxHeight = answer.scrollHeight + 'px';
  });
}

// Switch Currency (UZS / USD)
function setCurrency(curr) {
  if (!['uzs', 'usd'].includes(curr)) return;
  currentCurrency = curr;
  try {
    localStorage.setItem('kd_currency', curr);
  } catch (e) {
    console.warn('localStorage write error:', e);
  }

  document.querySelectorAll('.curr-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.curr === curr);
  });

  renderServices();
  renderCalculator();
  populateServiceSelect();
}

// Render Video Reels Cards
function renderReels() {
  const container = document.getElementById('reelsGrid');
  if (!container) return;

  container.innerHTML = clinicReels.map((reel, idx) => {
    const title = escapeHtml(reel.title[currentLang] || reel.title.uz);
    return `
      <div class="reel-card" role="button" tabindex="0" aria-label="${title}" data-video="${escapeHtml(reel.file)}">
        <video class="reel-video" src="${escapeHtml(reel.file)}" muted loop playsinline preload="none"></video>
        <div class="reel-overlay">
          <span class="reel-badge"><i class="fa-solid fa-sparkles"></i> ${escapeHtml(reel.tag)}</span>
          <div class="reel-play-btn"><i class="fa-solid fa-play"></i></div>
          <div class="reel-caption">${title}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Video Lightbox Modal Controls
function openVideoModal(videoSrc) {
  if (!clinicReels.some(reel => reel.file === videoSrc)) return;
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('modalVideoPlayer');
  if (modal && player) {
    player.src = videoSrc;
    showModal('videoModal');
    playVideo(player);
  }
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const player = document.getElementById('modalVideoPlayer');
  if (modal && player) {
    player.pause();
    player.removeAttribute('src');
    player.load();
    hideModal('videoModal');
  }
}

// Before / After Slider Interaction
function initBeforeAfterSlider() {
  const slider = document.getElementById('baRange');
  const afterWrap = document.getElementById('baAfterWrap');
  const handle = document.getElementById('baHandle');

  if (!slider || !afterWrap || !handle) return;

  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    afterWrap.style.clipPath = `inset(0 ${100 - Number(val)}% 0 0)`;
    handle.style.left = `${val}%`;
  });
}

// Handle Booking Form Submission -> WhatsApp Dispatch
function handleBookingSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('bookingForm');
  const nameInput = document.getElementById('bookName');
  const dateInput = document.getElementById('bookDate');
  nameInput.value = nameInput.value.trim();
  dateInput.min = clinicToday();
  if (!form.reportValidity()) return;
  const name = nameInput.value;
  const phone = document.getElementById('bookPhone')?.value.trim();
  const serviceId = document.getElementById('bookingServiceSelect')?.value;
  const date = document.getElementById('bookDate')?.value;
  const timeSelect = document.getElementById('bookTime');
  const time = timeSelect?.selectedOptions[0]?.textContent;
  const notes = document.getElementById('bookNotes')?.value.trim();

  if (!name || !phone) {
    alert(currentLang === 'uz' ? "Iltimos, ismingiz va telefon raqamingizni kiriting!" : "Пожалуйста, введите имя и номер телефона!");
    return;
  }

  if (date && date < clinicToday()) {
    alert(currentLang === 'ar' ? 'يرجى اختيار تاريخ حجز يبدأ من اليوم فصاعداً' : (currentLang === 'uz' ? 'Iltimos, bugungi yoki undan keyingi sanani tanlang!' : 'Пожалуйста, выберите сегодняшнюю или будущую дату!'));
    return;
  }

  const selectedService = servicesData.find(s => s.id === serviceId);
  const serviceTitle = selectedService 
    ? `${selectedService.name[currentLang] || selectedService.name.uz} (${formatPrice(selectedService.priceUzs, selectedService.priceUsd)})`
    : (currentLang === 'uz' ? "Boshlang'ich konsultatsiya" : "Первичная консультация");

  const messageText = 
`🌸 *YANGI QABUL BUYURTMASI / ЗАПИСЬ НА ПРИЁМ* 🌸
━━━━━━━━━━━━━━━━━━━━
👤 *Ism / Имя:* ${name}
📱 *Telefon / Номер:* ${phone}
💉 *Xizmat / Услуга:* ${serviceTitle}
📅 *Sana / Дата:* ${date || 'Kelishiladi'}
⏰ *Vaqt / Время:* ${time || 'Kelishiladi'}
${notes ? `💬 *Qo'shimcha / Пожелания:* ${notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━
📍 *Manzil:* Toshkent, Chilonzor-18, 16-dom (Turkiston bank qarshisida)
🌐 *Yuborildi:* Kosmetolog Dildora veb-saytidan`;

  const whatsappUrl = `https://wa.me/998900179000?text=${encodeURIComponent(messageText)}`;

  openWhatsApp(whatsappUrl);
}

function closeSuccessModal() {
  hideModal('successModal');
}

let modalOpener = null;
function showModal(id) {
  modalOpener = document.activeElement;
  const modal = document.getElementById(id);
  modal?.classList.add('open');
  modal?.querySelector('button, a[href]')?.focus();
}

function hideModal(id) {
  document.getElementById(id)?.classList.remove('open');
  modalOpener?.focus();
}

function initActions() {
  document.getElementById('bookingForm')?.addEventListener('submit', handleBookingSubmit);
  document.querySelectorAll('.curr-btn').forEach(button => {
    button.addEventListener('click', () => setCurrency(button.dataset.curr));
  });
  document.getElementById('btnCalcBook')?.addEventListener('click', bookCalcPackage);
  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => button.dataset.closeModal === 'videoModal'
      ? closeVideoModal() : closeSuccessModal());
  });
  document.getElementById('servicesGrid')?.addEventListener('click', event => {
    const button = event.target.closest('[data-book-service]');
    if (button) preselectAndBook(button.dataset.bookService);
  });
  document.getElementById('calcItemsGrid')?.addEventListener('change', event => {
    if (event.target.matches('[data-calc-service]')) toggleCalcItem(event.target.dataset.calcService);
  });
  const reels = document.getElementById('reelsGrid');
  reels?.addEventListener('click', event => {
    const card = event.target.closest('[data-video]');
    if (card) openVideoModal(card.dataset.video);
  });
  reels?.addEventListener('keydown', event => {
    if (event.target.matches('[data-video]') && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openVideoModal(event.target.dataset.video);
    }
  });
  reels?.addEventListener('pointerover', event => {
    const card = event.target.closest('[data-video]');
    if (card && !card.contains(event.relatedTarget)) playVideo(card.querySelector('video'));
  });
  reels?.addEventListener('pointerout', event => {
    const card = event.target.closest('[data-video]');
    if (card && !card.contains(event.relatedTarget)) card.querySelector('video').pause();
  });
  document.addEventListener('keydown', event => {
    const modal = document.querySelector('.video-modal.open, .success-modal.open');
    if (!modal) return;
    if (event.key === 'Escape') {
      modal.id === 'videoModal' ? closeVideoModal() : closeSuccessModal();
    } else if (event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button, a[href], video[controls]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
}

// FAQ Accordion Toggle
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('navMenu');

  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(menu?.classList.contains('open')));
  });

  // Close menu when clicking link
  menu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

// Sticky Header On Scroll
function initScrollHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Language Switcher Controls
function initLangButtons() {
  const btn = document.getElementById('langDropdownBtn');
  const dropdown = document.getElementById('langDropdown');

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dropdown?.classList.remove('show');
  });

  // Attach direct click listeners to all language switcher buttons
  document.querySelectorAll('.lang-seg-btn, .lang-option').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = el.dataset.lang;
      if (lang) {
        setLanguage(lang);
      }
    });
  });
}

// Service Filter Buttons
function initServiceFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      renderServices();
    });
  });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Set current date as default in booking form
  const dateInput = document.getElementById('bookDate');
  if (dateInput) {
    const today = clinicToday();
    dateInput.min = today;
    dateInput.value = today;
  }

  initActions();
  initScrollHeader();
  initMobileMenu();
  initLangButtons();
  initServiceFilters();
  initBeforeAfterSlider();
  initFaq();

  // Initial rendering
  setLanguage(currentLang);
  setCurrency(currentCurrency);
});
