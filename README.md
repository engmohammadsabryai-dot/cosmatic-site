# 🌸 Kosmetolog Dildora — Luxury Cosmetic Clinic & Academy Website

> الموقع الإلكتروني الرسمي لعيادة وأكاديمية الدكتورة ديلدورا للتجميل الطبي في طشقند، أوزبكستان.
> Official luxury website for Kosmetolog Dildora Aesthetic & Training Clinic in Tashkent, Uzbekistan.

---

## 🌐 Live Preview & Deployment

- **🚀 Live Website (Firebase Hosting):** [https://cosmatic-site.web.app](https://cosmatic-site.web.app)
- **🔗 Alternate Domain:** [https://cosmatic-site.firebaseapp.com](https://cosmatic-site.firebaseapp.com)
- **📦 GitHub Repository:** [https://github.com/engmohammadsabryai-dot/cosmatic-site](https://github.com/engmohammadsabryai-dot/cosmatic-site)

---

## ✨ المميزات الرئيسية (Key Features)

1. **دعم 4 لغات كامل (Full 4-Language i18n):**
   - الأوزبكية (O'zbekcha) — اللغة المحلية الرسمية.
   - الروسية (Русский) — اللغة الأكثر انتشاراً في طشقند.
   - الإنجليزية (English) — للزوار الدوليين وسياحة التجميل.
   - العربية (العربية) — مع دعم كامل لتخطيط اليمين لليسار (RTL).
   - حماية كاملة من تدخل مترجم المتصفح التلقائي لمنع تداخل اللغات.

2. **محرك حجز مباشر مرتبط بـ WhatsApp:**
   - نموذج حجز متكامل لاختيار الخدمة، التاريخ، والوقت.
   - توليد رسالة حجز منسقة تلقائياً وإرسالها مباشرة إلى رقم الواتساب المعتمد: `+998 90 017 9000`.

3. **حاسبة باقات الأسعار المباشرة (Treatment Cost Calculator):**
   - إمكانية اختيار أكثر من علاج تجميلي مع احتساب فوري للتكلفة.
   - خصم تلقائي 10% عند حجز باقة متعددة.
   - عرض الأسعار بعملتي UZS وUSD وفق الأسعار المحددة في الكود؛ لا توجد خدمة أسعار صرف مباشرة.

4. **معرض نتائج تفاعلي (Interactive Before / After Comparison):**
   - شريط تمرير تفاعلي للمقارنة بين نتائج جلسات الفيلر، البوتوكس، وتحديد الفك.

5. **مشغل ريلز وفيديوهات العيادة (Video Reels Showcase):**
   - استعراض حي لفيديوهات الحقن والجلسات العملية من داخل العيادة وقناة التليجرام.

6. **قسم أكاديمية التدريب (Dildora Academy & Masterclasses):**
   - تفاصيل الدورات المعتمدة وشهادات التدريب مع إمكانية التسجيل الفوري.

7. **خريطة وموقع العيادة المعتمد:**
   - إحداثيات GPS المباشرة: `41.274445, 69.191262`.
   - العنوان: طشقند، منطقة تشيلونزور، شارع الخوارزمي، حي 18، منزل 16 (أمام بنك تركستان).

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend:** Semantic HTML5, Modern CSS3 (CSS Variables, Flexbox, Grid, Glassmorphism), Vanilla JavaScript ES6+.
- **Hosting & Infrastructure:** Google Firebase Hosting (Global CDN, SSL, Fast Caching).
- **Version Control:** Git & GitHub.
- **Responsive Design:** 100% Mobile & Tablet & Desktop Optimized.

---

## 👩‍⚕️ معلومات التواصل الرسمية للعيادة

- **الدكتورة:** خبيرة التجميل المعتمدة ديلدورا (Косметолог Дилдора)
- **الهاتف / واتساب:** `+998900179000`
- **قناة التليجرام:** [@kosmetologiya_dilya1](https://t.me/kosmetologiya_dilya1) (أكثر من 135,000 عضو)
- **حساب الإنستغرام:** [@kosmetologdilya1](https://instagram.com/kosmetologdilya1)


## Local preview and deployment

Requires Node.js. Run `node build.mjs` from this directory to create `public/`,
then serve that directory with a local HTTP server (for example,
`python -m http.server 8080 --directory public`). Edit the root source files;
`public/` is generated and replaced on each build.

Firebase Hosting runs the build automatically before deployment. Only the three
frontend files and locally referenced image/video assets are copied. Project
metadata, Telegram exports, backups, raw videos and deployment tools stay outside
the hosting directory. Unknown paths return 404 rather than the homepage.

Security headers are configured in `firebase.json`, including a script policy
that permits only same-origin external scripts. Inline styles remain permitted
for the existing design. Google Fonts, cdnjs fonts/styles and the Google Maps
frame are explicitly permitted. Use Firebase Hosting or its emulator to check
these headers; a generic local file server does not apply them.

Appointments use the current date in Asia/Tashkent. WhatsApp opens with a draft;
the visitor must send it, and the clinic must confirm availability. No appointment
is stored by this static site. A WhatsApp fallback link remains available when
new tabs are blocked. Changing local sources does not update the live website
until a separate deployment is performed.

Run regression checks with `node --test tests/security.test.cjs`.
These tests use Node's built-in runner and a lightweight DOM fixture for logic;
they do not replace browser rendering or a deployed-header integration test.
