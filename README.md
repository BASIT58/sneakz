# SNEAKZ

موقع HTML + CSS + JavaScript عادي (من غير build). 16 كوتشي، ربط بـ Supabase، وشريط كوتشيات متحرك أول ما الصفحة تفتح.

## إزاي تشغّله
1. **لازم من سيرفر محلي** (مش دبل كليك على index.html):
   - VS Code ← إضافة **Live Server** ← كليك يمين على `index.html` ← Open with Live Server.
   - أو من الترمنال جوه المجلد: `python3 -m http.server 8000` وافتح `http://localhost:8000`.
2. محتاج نت (الخطوط من Google Fonts + Supabase).

## شكل المجلد
```
index.html                    الصفحة
css/style.css                 كل التنسيق (الألوان في أوله)
js/data.js                    الإعدادات + مفاتيح Supabase + المنتجات الاحتياطية + النصوص
js/api.js                     الاتصال بـ Supabase (قراءة المنتجات + إرسال الطلب)
js/app.js                     الرف والشريط والفوكس واللوحة والنموذج
assets/                       اللوجو والأيقونات وصور الكوتشيات (webp شفافة)
supabase-02-more-products.sql منتجات 7 إلى 16 + مخزن الصور
supabase-03-admin-and-notify.sql صلاحيات الأدمن + تريجر إشعار Gmail
admin.html + css/admin.css + js/admin.js  لوحة الأدمن
gmail/Code.gs                 كود Google Apps Script اللي بيبعت الإيميل
```

## Supabase
- الجداول والأمان اتعملوا من الـ SQL الأول. بعده شغّل `supabase-02-more-products.sql` في SQL Editor.
- الموقع بيقرأ المنتجات من جدول `products`. لو السيرفر مش متاح بيعرض النسخة الاحتياطية من `data.js`.
- الطلب بيتبعت عن طريق الدالة `place_order` (السعر بيتحسب من السيرفر، والزائر ما يقدرش يقرأ الطلبات).
- المفتاح في `data.js` من نوع **publishable** وآمن. **ما تحطش أبداً مفتاح secret / service_role.**
- ملحوظة: مشاريع Supabase المجانية بتتوقف بعد أسبوع من عدم الاستخدام. لو الموقع ما بقاش يحمّل الطلبات، ادخل Dashboard واعمل Restore.

## تعدّل إيه وفين
- **الألوان:** أول `css/style.css` في `:root`.
- **العملة:** `js/data.js` ← `SNEAKZ_CONFIG.currency`.
- **سرعة الشريط المتحرك:** `js/app.js` في `renderMarquee` (`PRODUCTS.length * 6` ثانية للفة).
- **إضافة كوتشي:** صورة webp شفافة في `assets/products/` + سطر في جدول `products` (وكتلة في `data.js` كنسخة احتياطية).
- **الفئات:** `classic` أو `running` أو `hightop` أو `special`.

## ملاحظات
- الآراء في الصفحة مكتوب عليها "تجريبية"، وفي الفوتر جملة بتوضّح إنه مشروع للعرض.

## لوحة الأدمن
1. في Supabase: Authentication ← Users ← Add user (إيميل وكلمة سر، وفعّل Auto Confirm). الإيميل ده لازم يكون هو اللي في جدول `admins`.
2. Authentication ← Sign In / Providers ← Email ← **اقفل Allow new users to sign up**.
3. افتح `/admin.html` وادخل. الطلبات (تغيير الحالة، واتساب، اتصال) والمنتجات (إضافة/تعديل/إخفاء/حذف + رفع صورة).

## إشعار Gmail
1. script.google.com ← New project ← الصق `gmail/Code.gs` وغيّر `SECRET` و`NOTIFY_TO`.
2. شغّل الدالة `testEmail` مرة ووافق على الصلاحيات (لازم الإيميل يوصل).
3. Deploy ← New deployment ← Web app ← Execute as: **Me** ← Who has access: **Anyone** ← انسخ الرابط (بينتهي بـ /exec).
4. في `supabase-03-admin-and-notify.sql` غيّر `PASTE_APPS_SCRIPT_URL_HERE` و`PASTE_YOUR_SECRET_HERE` (نفس السر) وشغّله في SQL Editor.
5. أي كود تعدّله في Apps Script لازم تعمل Deploy ← Manage deployments ← New version.
