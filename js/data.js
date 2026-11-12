/* ==========================================================================
   data.js — الإعدادات + المنتجات + النصوص (عربي / English)
   لإضافة كوتشي جديد: حط صورته في assets/products/ وانسخ أي سطر من PRODUCTS.
   المنتجات بتتقرأ من Supabase، وده الملف بيشتغل كنسخة احتياطية لو السيرفر مش متاح.
   ========================================================================== */

window.SNEAKZ_CONFIG = {
  defaultLang: "ar",
  currency: { ar: "ر.س", en: "SAR" },   // غيّرها لو هتبيع بعملة تانية
  maxQty: 5,

  // Supabase (المفتاح هنا publishable: آمن يتحط في الموقع. ما تحطش أبداً service_role / secret)
  supabase: {
    url: "https://ejmgsdjdlpykjrtowlbm.supabase.co",
    key: "sb_publishable_v29dac7EGcVLnnQ2Q9AWmw_h3r2bRXX",
  },
};

/* cat: classic | running | hightop | special */
window.PRODUCTS = [
  {
    id: 1, slug: "frost-court", cat: "classic", price: 349,
    image: "assets/products/shoe-01.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "فروست كورت", en: "Frost Court" },
    desc: {
      ar: "كوتشي أبيض لو-توب بجلد ناعم وتصميم نظيف. بيمشي مع أي لبس، من الجامعة للخروجة.",
      en: "A clean white low-top in smooth leather. Goes with everything, from campus to the weekend.",
    },
  },
  {
    id: 2, slug: "shadow-runner", cat: "running", price: 429,
    image: "assets/products/shoe-02.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "شادو رانر", en: "Shadow Runner" },
    desc: {
      ar: "رانينج تشانكي أسود ورمادي بشبك تهوية ونعل سميك مريح للمشي الطويل.",
      en: "A chunky black-and-charcoal runner with breathable mesh and a thick, comfy sole.",
    },
  },
  {
    id: 3, slug: "midnight-court", cat: "classic", price: 369,
    image: "assets/products/shoe-03.webp",
    sizes: [39, 40, 41, 42, 43, 44],
    name: { ar: "ميدنايت كورت", en: "Midnight Court" },
    desc: {
      ar: "كحلي وأبيض بستايل ريترو. ألوان هادية وشكل بيلفت النظر.",
      en: "Navy and white with a retro feel. Calm colours, a look that turns heads.",
    },
  },
  {
    id: 4, slug: "sand-gum", cat: "special", price: 389,
    image: "assets/products/shoe-04.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "ساند جم", en: "Sand Gum" },
    desc: {
      ar: "شمواه بيج بنعل كراميل. إحساس دافي وخامة ناعمة، مناسب للشتا والصيف.",
      en: "Beige suede on a caramel gum sole. Warm tones and a soft hand-feel.",
    },
  },
  {
    id: 5, slug: "red-line-high", cat: "hightop", price: 449,
    image: "assets/products/shoe-05.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "ريد لاين هاي", en: "Red Line High" },
    desc: {
      ar: "هاي-توب بسكتبول أحمر وأسود بدعم للكاحل وحضور قوي.",
      en: "A red-and-black basketball high-top with ankle support and a bold presence.",
    },
  },
  {
    id: 6, slug: "dune-trail", cat: "running", price: 459,
    image: "assets/products/shoe-06.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "ديون تريل", en: "Dune Trail" },
    desc: {
      ar: "زيتي وبيج للمشي في الأرض الوعرة، بنعل بتسليح يمسك الأرض كويس.",
      en: "Olive and tan for rougher ground, with a lugged sole that grips well.",
    },
  },
  {
    id: 7, slug: "blackout-court", cat: "classic", price: 359,
    image: "assets/products/shoe-07.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "بلاك آوت كورت", en: "Blackout Court" },
    desc: {
      ar: "أسود بالكامل لو-توب بجلد مطفي. بسيط وقوي وبيمشي مع كل حاجة.",
      en: "All-black low-top in matte leather. Simple, sharp, goes with everything.",
    },
  },
  {
    id: 8, slug: "forest-court", cat: "classic", price: 369,
    image: "assets/products/shoe-08.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "فورست كورت", en: "Forest Court" },
    desc: {
      ar: "أخضر غامق وأبيض بنعل أخضر. ألوان هادية ولمسة كلاسيك.",
      en: "Deep forest green and white with a green sole. Calm colours, classic feel.",
    },
  },
  {
    id: 9, slug: "harbor-court", cat: "classic", price: 369,
    image: "assets/products/shoe-09.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "هاربر كورت", en: "Harbor Court" },
    desc: {
      ar: "أزرق فولاذي وأبيض بتفاصيل قماش على الجنب. شكل رايق للنهار.",
      en: "Steel blue and white with a textured side panel. A fresh daytime look.",
    },
  },
  {
    id: 10, slug: "slate-skate", cat: "classic", price: 379,
    image: "assets/products/shoe-10.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "سليت سكيت", en: "Slate Skate" },
    desc: {
      ar: "رمادي شمواه وأبيض بستايل سكيت. مريح للمشي وثابت على الأرض.",
      en: "Grey suede and white in a skate-inspired cut. Comfy and grounded.",
    },
  },
  {
    id: 11, slug: "silver-stride", cat: "running", price: 449,
    image: "assets/products/shoe-11.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "سيلفر ستراید", en: "Silver Stride" },
    desc: {
      ar: "رانينج أبيض وفضي بشبك تهوية ونعل سميك يمتص الصدمات.",
      en: "White and silver runner with airy mesh and a thick, cushioned sole.",
    },
  },
  {
    id: 12, slug: "blaze-runner", cat: "running", price: 459,
    image: "assets/products/shoe-12.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "بليز رانر", en: "Blaze Runner" },
    desc: {
      ar: "أبيض وبرتقالي ناري بنعل تشانكي. لون يلفت الانتباه من بعيد.",
      en: "White and fiery orange on a chunky sole. A colour you spot from far away.",
    },
  },
  {
    id: 13, slug: "volt-runner", cat: "running", price: 469,
    image: "assets/products/shoe-13.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "فولت رانر", en: "Volt Runner" },
    desc: {
      ar: "أسود وأصفر نيون للأداء العالي. خفيف وشكله جريء.",
      en: "Black and neon yellow built for pace. Light, loud, and bold.",
    },
  },
  {
    id: 14, slug: "atlas-retro", cat: "running", price: 439,
    image: "assets/products/shoe-14.webp",
    sizes: [40, 41, 42, 43, 44, 45],
    name: { ar: "أطلس ريترو", en: "Atlas Retro" },
    desc: {
      ar: "رمادي فاتح وكحلي بتفاصيل شمواه بستايل رانينج ريترو.",
      en: "Light grey and navy with suede overlays in a retro running style.",
    },
  },
  {
    id: 15, slug: "mocha-retro", cat: "special", price: 399,
    image: "assets/products/shoe-15.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "موكا ريترو", en: "Mocha Retro" },
    desc: {
      ar: "بني شوكولاتة وكريمي بستايل ريترو دافي.",
      en: "Chocolate brown and cream in a warm retro court style.",
    },
  },
  {
    id: 16, slug: "blush-court", cat: "special", price: 359,
    image: "assets/products/shoe-16.webp",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    name: { ar: "بلاش كورت", en: "Blush Court" },
    desc: {
      ar: "وردي هادي وأبيض بجلد ناعم. لمسة ناعمة ومختلفة.",
      en: "Soft pastel pink and white in smooth leather. A gentle, different pick.",
    },
  },
];

/* الدول وأكواد الاتصال */
window.COUNTRIES = [
  { id: "SA", code: "+966", name: { ar: "السعودية", en: "Saudi Arabia" } },
  { id: "AE", code: "+971", name: { ar: "الإمارات", en: "United Arab Emirates" } },
  { id: "KW", code: "+965", name: { ar: "الكويت", en: "Kuwait" } },
  { id: "QA", code: "+974", name: { ar: "قطر", en: "Qatar" } },
  { id: "BH", code: "+973", name: { ar: "البحرين", en: "Bahrain" } },
  { id: "OM", code: "+968", name: { ar: "عُمان", en: "Oman" } },
  { id: "EG", code: "+20",  name: { ar: "مصر", en: "Egypt" } },
];

window.CATEGORIES = ["all", "classic", "running", "hightop", "special"];

/* النصوص */
window.I18N = {
  ar: {
    "meta.title": "SNEAKZ | كوتشيات بتفرق",
    "meta.desc": "متجر SNEAKZ للكوتشيات. اختار كوتشيك، اطلب، وادفع عند الاستلام.",
    "nav.shop": "المجموعة",
    "nav.why": "ليه SNEAKZ",
    "lang.toggle": "EN",
    "lang.label": "Switch to English",
    "skip": "تخطي إلى المحتوى",

    "hero.eyebrow": "مجموعة جديدة",
    "hero.title1": "كوتشي واحد.",
    "hero.title2": "إضاءة واحدة.",
    "hero.sub": "اختار اللي يشبهك، اطلبه في دقيقة، وادفع لما يوصلك.",
    "hero.cta": "تصفّح المجموعة",
    "hero.cta2": "الدفع عند الاستلام",
    "hero.marquee": "كوتشيات SNEAKZ",

    "shelf.eyebrow": "الرف",
    "shelf.title": "اختار كوتشيك",
    "shelf.count": "{n} موديل",
    "shelf.empty": "مفيش موديلات في القسم ده دلوقتي.",
    "shelf.view": "شوف التفاصيل",
    "shelf.dot": "الموديل {n}",
    "cat.all": "الكل",
    "cat.classic": "كلاسيك",
    "cat.running": "رانينج",
    "cat.hightop": "هاي-توب",
    "cat.special": "مميز",

    "panel.close": "إغلاق",
    "panel.prev": "السابق",
    "panel.next": "التالي",
    "panel.size": "المقاس",
    "panel.sizeNote": "مقاسات أوروبية (EU)",
    "panel.qty": "الكمية",
    "panel.total": "الإجمالي",
    "panel.order": "اطلب الآن",
    "panel.back": "رجوع",
    "panel.hint": "اضغط Esc للإغلاق، والأسهم للتنقل",
    "panel.perk1": "الدفع عند الاستلام",
    "panel.perk2": "توصيل لباب البيت",
    "panel.perk3": "استبدال المقاس لو ما ناسبش",
    "panel.sizeMissing": "اختار المقاس الأول",

    "form.title": "بيانات التوصيل",
    "form.name": "الاسم بالكامل",
    "form.phone": "رقم الموبايل",
    "form.country": "الدولة",
    "form.city": "المدينة",
    "form.address": "العنوان بالتفصيل",
    "form.notes": "ملاحظات (اختياري)",
    "form.cod": "الدفع كاش عند الاستلام. مفيش أي مبلغ بيتدفع دلوقتي.",
    "form.submit": "تأكيد الطلب",
    "form.sending": "جاري الإرسال...",
    "form.errName": "اكتب اسمك بالكامل",
    "form.errPhone": "رقم الموبايل غير صحيح",
    "form.errCity": "اكتب المدينة",
    "form.errAddress": "اكتب العنوان بالتفصيل",
    "form.errSend": "حصلت مشكلة وإحنا بنبعت الطلب. جرّب تاني.",
    "form.summary": "{size} • الكمية {qty}",

    "done.title": "تم استلام طلبك",
    "done.text": "هنتواصل معاك على الموبايل لتأكيد الطلب وميعاد التوصيل.",
    "done.no": "رقم الطلب",
    "done.more": "كمّل تصفح",
    "done.demo": "ده موقع تجريبي لأغراض العرض، فمفيش شحن فعلي.",

    "why.title": "ليه SNEAKZ",
    "why.1.t": "الدفع عند الاستلام",
    "why.1.p": "شوف الكوتشي في إيدك وبعدين ادفع.",
    "why.2.t": "توصيل سريع",
    "why.2.p": "بنوصّل لباب البيت في السعودية ودول الخليج.",
    "why.3.t": "استبدال المقاس",
    "why.3.p": "المقاس مش مظبوط؟ بنبدّله لك بسهولة.",

    "rev.title": "آراء العملاء",
    "rev.demo": "آراء تجريبية",
    "rev.1": "الكوتشي وصل بسرعة والمقاس مظبوط. الخامة أحلى من الصور.",
    "rev.1.n": "عميل تجريبي، الرياض",
    "rev.2": "الطلب كان سهل جداً من الموبايل والدفع عند الاستلام مريحني.",
    "rev.2.n": "عميل تجريبي، دبي",
    "rev.3": "اللون حلو ومريح في المشي طول اليوم في الكلية.",
    "rev.3.n": "عميل تجريبي، القاهرة",

    "footer.text": "مشروع تجريبي لأغراض العرض (بورتفوليو). المنتجات والآراء والأسعار غير حقيقية.",
    "footer.copy": "© 2026 SNEAKZ",
  },

  en: {
    "meta.title": "SNEAKZ | Sneakers that stand out",
    "meta.desc": "SNEAKZ sneaker store. Pick your pair, order, and pay on delivery.",
    "nav.shop": "Collection",
    "nav.why": "Why SNEAKZ",
    "lang.toggle": "ع",
    "lang.label": "التبديل للعربية",
    "skip": "Skip to content",

    "hero.eyebrow": "New collection",
    "hero.title1": "One pair.",
    "hero.title2": "One light.",
    "hero.sub": "Pick the one that looks like you, order in a minute, and pay when it arrives.",
    "hero.cta": "Browse the collection",
    "hero.cta2": "Cash on delivery",
    "hero.marquee": "SNEAKZ sneakers",

    "shelf.eyebrow": "The shelf",
    "shelf.title": "Pick your pair",
    "shelf.count": "{n} models",
    "shelf.empty": "No models in this category right now.",
    "shelf.view": "View details",
    "shelf.dot": "Model {n}",
    "cat.all": "All",
    "cat.classic": "Classic",
    "cat.running": "Running",
    "cat.hightop": "High-top",
    "cat.special": "Special",

    "panel.close": "Close",
    "panel.prev": "Previous",
    "panel.next": "Next",
    "panel.size": "Size",
    "panel.sizeNote": "EU sizes",
    "panel.qty": "Quantity",
    "panel.total": "Total",
    "panel.order": "Order now",
    "panel.back": "Back",
    "panel.hint": "Press Esc to close, arrows to browse",
    "panel.perk1": "Cash on delivery",
    "panel.perk2": "Delivered to your door",
    "panel.perk3": "Free size exchange",
    "panel.sizeMissing": "Please choose a size first",

    "form.title": "Delivery details",
    "form.name": "Full name",
    "form.phone": "Mobile number",
    "form.country": "Country",
    "form.city": "City",
    "form.address": "Full address",
    "form.notes": "Notes (optional)",
    "form.cod": "Pay in cash on delivery. Nothing is charged now.",
    "form.submit": "Confirm order",
    "form.sending": "Sending...",
    "form.errName": "Please enter your full name",
    "form.errPhone": "Invalid mobile number",
    "form.errCity": "Please enter your city",
    "form.errAddress": "Please enter your full address",
    "form.errSend": "Something went wrong while sending your order. Try again.",
    "form.summary": "{size} • Qty {qty}",

    "done.title": "Order received",
    "done.text": "We'll contact you on your mobile to confirm the order and delivery time.",
    "done.no": "Order number",
    "done.more": "Keep browsing",
    "done.demo": "This is a demo site for portfolio purposes, so nothing is actually shipped.",

    "why.title": "Why SNEAKZ",
    "why.1.t": "Cash on delivery",
    "why.1.p": "Hold the pair in your hands, then pay.",
    "why.2.t": "Fast delivery",
    "why.2.p": "To your door in Saudi Arabia and across the Gulf.",
    "why.3.t": "Size exchange",
    "why.3.p": "Wrong size? We'll swap it for you.",

    "rev.title": "Customer reviews",
    "rev.demo": "Sample reviews",
    "rev.1": "Arrived fast and the size was spot on. The material looks better than the photos.",
    "rev.1.n": "Sample customer, Riyadh",
    "rev.2": "Ordering from my phone was super easy, and paying on delivery is a relief.",
    "rev.2.n": "Sample customer, Dubai",
    "rev.3": "Great colour and comfy for walking around campus all day.",
    "rev.3.n": "Sample customer, Cairo",

    "footer.text": "A demo project for portfolio purposes. Products, reviews and prices are not real.",
    "footer.copy": "© 2026 SNEAKZ",
  },
};
