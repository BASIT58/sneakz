/* ==========================================================================
   app.js — منطق الموقع
   1) اللغة (عربي/English)     2) رسم الرف والفلتر
   3) الكاروسيل على الموبايل   4) وضع الفوكس + اللوحة (FLIP animation)
   5) نموذج الطلب              6) لوحة الموبايل (سحب للإغلاق)
   ========================================================================== */
(() => {
  "use strict";

  const CFG = window.SNEAKZ_CONFIG;
  let PRODUCTS = window.PRODUCTS;
  const COUNTRIES = window.COUNTRIES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- الحالة ---------- */
  const state = {
    lang: "ar",
    filter: "all",
    visible: [],      // المنتجات الظاهرة حسب الفلتر
    openId: null,     // الكوتشي المفتوح في الفوكس
    size: null,
    qty: 1,
    step: "details",  // details | form | done
    busy: false,      // أنيميشن شغال
    country: "SA",
    origin: "shelf",  // shelf | marquee (منين اتفتح الفوكس)
  };

  /* ---------- عناصر الصفحة ---------- */
  const el = {
    langBtn: $("#langBtn"), filters: $("#filters"), grid: $("#shelfGrid"),
    dots: $("#dots"), count: $("#shelfCount"),
    focus: $("#focus"), focusImg: $("#focusImg"), counter: $("#focusCounter"),
    prev: $("#navPrev"), next: $("#navNext"), close: $("#closeBtn"),
    panel: $("#panel"), scroll: $("#panelScroll"), photo: $("#panelPhoto"),
    cat: $("#pCat"), name: $("#pName"), price: $("#pPrice"), desc: $("#pDesc"),
    sizes: $("#sizes"), sizeErr: $("#sizeError"),
    qMinus: $("#qtyMinus"), qPlus: $("#qtyPlus"), qOut: $("#qtyOut"),
    total: $("#pTotal"), main: $("#mainBtn"), back: $("#backBtn"),
    sumImg: $("#sumImg"), sumName: $("#sumName"), sumMeta: $("#sumMeta"),
    form: $("#orderForm"), country: $("#fCountry"), phoneCode: $("#phoneCode"),
    formErr: $("#formError"), orderNo: $("#orderNo"),
  };

  const isMobile = () => window.matchMedia("(max-width: 800px)").matches;
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isRTL = () => state.lang === "ar";
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ======================================================================
     1) اللغة
     ====================================================================== */
  function t(key, vars) {
    let s = (window.I18N[state.lang] || {})[key] ?? window.I18N.ar[key] ?? key;
    if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }
  const L = (obj) => obj[state.lang] || obj.ar;
  const money = (n) => new Intl.NumberFormat("en-US").format(n) + " " + L(CFG.currency);

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = isRTL() ? "rtl" : "ltr";
    document.title = t("meta.title");
    $('meta[name="description"]').content = t("meta.desc");
    $('meta[property="og:title"]').content = t("meta.title");
    $('meta[property="og:description"]').content = t("meta.desc");

    $$("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });

    $("#marquee")?.setAttribute("aria-label", t("hero.marquee"));
    el.langBtn.textContent = t("lang.toggle");
    el.langBtn.setAttribute("aria-label", t("lang.label"));
    el.prev.setAttribute("aria-label", t("panel.prev"));
    el.next.setAttribute("aria-label", t("panel.next"));
    el.close.setAttribute("aria-label", t("panel.close"));
    updateMainBtn();
  }

  function setLang(lang) {
    state.lang = lang;
    try { localStorage.setItem("sneakz_lang", lang); } catch (_) {}
    applyI18n();
    renderCountries();
    renderFilters();
    renderShelf(false);
    renderMarquee();
    if (state.openId) fillPanel(byId(state.openId));
  }

  /* ======================================================================
     2) الفلتر والرف
     ====================================================================== */
  function renderFilters() {
    el.filters.innerHTML = window.CATEGORIES.map((c) =>
      `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === state.filter}">${t("cat." + c)}</button>`
    ).join("");
  }

  function renderShelf(resetScroll = true) {
    state.visible = PRODUCTS.filter((p) => state.filter === "all" || p.cat === state.filter);

    el.grid.innerHTML = state.visible.length
      ? state.visible.map((p, i) => `
        <button type="button" class="shoe-card" data-id="${p.id}" aria-label="${L(p.name)} — ${money(p.price)}">
          <span class="shoe-card__stage">
            <img class="shoe-card__img" src="${p.image}" alt="" width="1000" height="620" ${i > 2 ? 'loading="lazy"' : ""} decoding="async">
          </span>
          <span class="shoe-card__meta">
            <span class="shoe-card__name">${L(p.name)}</span>
            <span class="shoe-card__price">${money(p.price)}</span>
          </span>
          <span class="shoe-card__cta">${t("shelf.view")}</span>
        </button>`).join("")
      : `<p class="shelf-empty">${t("shelf.empty")}</p>`;

    el.count.textContent = t("shelf.count", { n: state.visible.length });
    if (resetScroll) el.grid.scrollLeft = 0;

    // لو فيه كوتشي مفتوح (مثلاً بعد تغيير اللغة) نرجّع حالته
    if (state.openId) cardOf(state.openId)?.classList.add("is-lifted");

    setupCarousel();
  }

  /* الشريط المتحرك في الهيرو: نسختين ورا بعض عشان اللفة تبقى مستمرة من غير قطع */
  function renderMarquee() {
    const track = $("#marqueeTrack");
    if (!track) return;
    const set = (copy) =>
      `<div class="marquee__set"${copy ? ' aria-hidden="true"' : ""}>` +
      PRODUCTS.map((p, i) =>
        `<button type="button" class="marquee__item" data-id="${p.id}" style="--d:${Math.min(i, 8) * 90}ms;--b:${(i % 5) * -0.9}s"` +
        `${copy ? ' tabindex="-1"' : ""} aria-label="${L(p.name)}">` +
        `<img src="${p.image}" alt="" width="1000" height="620" decoding="async"${i > 3 || copy ? ' loading="lazy"' : ""}></button>`
      ).join("") + `</div>`;
    track.innerHTML = set(false) + set(true);
    track.style.setProperty("--dur", Math.max(40, PRODUCTS.length * 6) + "s");
  }

  const cardOf = (id) => el.grid.querySelector(`.shoe-card[data-id="${id}"]`);

  /* ======================================================================
     3) الكاروسيل (موبايل)
     ====================================================================== */
  let io = null;

  function setupCarousel() {
    if (io) io.disconnect();
    el.dots.innerHTML = "";
    if (!isMobile()) return;

    const cards = $$(".shoe-card", el.grid);
    el.dots.innerHTML = cards.map((_, i) =>
      `<button type="button" data-i="${i}" aria-label="${t("shelf.dot", { n: i + 1 })}" aria-current="${i === 0}"></button>`
    ).join("");

    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("is-active", e.intersectionRatio >= 0.65));
      const idx = cards.findIndex((c) => c.classList.contains("is-active"));
      $$("button", el.dots).forEach((d, i) => d.setAttribute("aria-current", String(i === idx)));
    }, { root: el.grid, threshold: [0, 0.35, 0.65, 0.9] });

    cards.forEach((c) => io.observe(c));
  }

  /* ======================================================================
     4) الفوكس + اللوحة
     ====================================================================== */
  let lastTrigger = null;

  function fillPanel(p) {
    const idx = state.visible.findIndex((x) => x.id === p.id);
    el.cat.textContent = t("cat." + p.cat);
    el.name.textContent = L(p.name);
    el.price.textContent = money(p.price);
    el.desc.textContent = L(p.desc);
    el.photo.src = p.image;
    el.photo.alt = L(p.name);
    el.focusImg.alt = L(p.name);
    el.counter.innerHTML = `<bdi dir="ltr">${String(idx + 1).padStart(2, "0")} / ${String(state.visible.length).padStart(2, "0")}</bdi>`;

    el.sizes.innerHTML = p.sizes.map((s) =>
      `<button type="button" class="size" data-size="${s}" aria-pressed="${state.size === s}">${s}</button>`
    ).join("");

    el.qOut.textContent = state.qty;
    el.total.textContent = money(p.price * state.qty);
    el.sizeErr.textContent = "";
    updateSummary(p);
  }

  function updateSummary(p) {
    el.sumImg.src = p.image;
    el.sumName.textContent = L(p.name);
    el.sumMeta.textContent = t("form.summary", { size: "EU " + (state.size ?? "-"), qty: state.qty }) + " • " + money(p.price * state.qty);
  }

  function setStep(step) {
    state.step = step;
    el.panel.dataset.step = step;
    el.focus.dataset.step = step;
    updateMainBtn();
    el.scroll.scrollTop = 0;
  }

  function updateMainBtn() {
    el.main.textContent = state.step === "form" ? t("form.submit") : t("panel.order");
  }

  /* لقطة مكان صورة الكارت (للأنيميشن) */
  function cardImgRect(id) {
    const img = cardOf(id)?.querySelector(".shoe-card__img");
    return img ? img.getBoundingClientRect() : null;
  }

  function flip(from, to, dur, easing, reverse = false) {
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const s = from.width / to.width;
    const small = `translate(${dx}px, ${dy}px) scale(${s})`;
    return el.focusImg.animate(
      reverse ? [{ transform: "none" }, { transform: small }] : [{ transform: small }, { transform: "none" }],
      { duration: reduceMotion() ? 0 : dur, easing, fill: reverse ? "forwards" : "none" }
    ).finished.catch(() => {});
  }

  async function openFocus(id, trigger, srcImg) {
    if (state.busy || state.openId) return;
    state.busy = true;
    state.origin = srcImg ? "marquee" : "shelf";
    // لو الكوتشي مخفي بسبب الفلتر (فتحناه من الشريط) نرجّع الفلتر لـ "الكل"
    if (!state.visible.some((x) => x.id === id)) { state.filter = "all"; renderFilters(); renderShelf(false); }
    const p = byId(id);
    lastTrigger = trigger || document.activeElement;

    state.openId = id; state.size = null; state.qty = 1;
    fillPanel(p);
    setStep("details");

    const first = !isMobile() ? (srcImg ? srcImg.getBoundingClientRect() : cardImgRect(id)) : null;

    el.focus.hidden = false;
    document.body.classList.add("is-locked");

    if (!isMobile()) {
      el.focusImg.src = p.image;
      try { await el.focusImg.decode(); } catch (_) {}
      el.focusImg.style.visibility = "";
    }
    void el.focus.offsetWidth;            // نجبر المتصفح يحسب الشكل قبل الأنيميشن
    el.focus.classList.add("is-open");
    cardOf(id)?.classList.add("is-lifted");

    if (first) await flip(first, el.focusImg.getBoundingClientRect(), 560, "cubic-bezier(.22,.8,.2,1)");
    else await wait(isMobile() ? 380 : 0);

    el.close.focus({ preventScroll: true });
    state.busy = false;
  }

  async function closeFocus() {
    if (state.busy || !state.openId) return;
    state.busy = true;
    const id = state.openId;

    el.panel.style.transform = "";
    el.focus.classList.remove("is-open");

    const fromMarquee = state.origin === "marquee";
    const target = !isMobile() && !fromMarquee ? cardImgRect(id) : null;
    if (target) await flip(target, el.focusImg.getBoundingClientRect(), 460, "cubic-bezier(.4,0,.2,1)", true);
    else if (!isMobile() && !reduceMotion()) {
      await el.focusImg.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.94)" }],
        { duration: 320, easing: "ease-in", fill: "forwards" }).finished.catch(() => {});
    } else await wait(isMobile() ? 380 : 300);

    el.focus.hidden = true;
    el.focusImg.getAnimations().forEach((a) => a.cancel());
    cardOf(id)?.classList.remove("is-lifted");
    document.body.classList.remove("is-locked");
    state.openId = null; state.busy = false;
    el.form.reset(); clearErrors();
    el.country.value = state.country; syncPhoneCode();
    lastTrigger?.focus?.({ preventScroll: true });
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion() ? 0 : ms));

  /* التنقل بين الكوتشيات داخل الفوكس */
  async function go(delta) {
    if (state.busy || state.step !== "details" || state.visible.length < 2) return;
    state.busy = true;
    const i = state.visible.findIndex((p) => p.id === state.openId);
    const next = state.visible[(i + delta + state.visible.length) % state.visible.length];

    cardOf(state.openId)?.classList.remove("is-lifted");
    state.openId = next.id; state.size = null; state.qty = 1;
    const card = cardOf(next.id);
    card?.classList.add("is-lifted");
    card?.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });

    const dir = (isRTL() ? -1 : 1) * delta;
    if (!isMobile() && !reduceMotion()) {
      await el.focusImg.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-60 * dir}px)` }],
        { duration: 160, easing: "ease-in", fill: "forwards" }
      ).finished.catch(() => {});
      el.focusImg.src = next.image;
      try { await el.focusImg.decode(); } catch (_) {}
      el.focusImg.getAnimations().forEach((a) => a.cancel());
      await el.focusImg.animate(
        [{ opacity: 0, transform: `translateX(${60 * dir}px)` }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: "cubic-bezier(.22,.8,.2,1)" }
      ).finished.catch(() => {});
    } else {
      el.focusImg.src = next.image;
    }
    fillPanel(next);
    el.scroll.scrollTop = 0;
    state.busy = false;
  }

  /* المقاس والكمية */
  function chooseSize(s) {
    state.size = s;
    $$(".size", el.sizes).forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.size) === s)));
    el.sizeErr.textContent = "";
    updateSummary(byId(state.openId));
  }

  function changeQty(d) {
    state.qty = Math.min(CFG.maxQty, Math.max(1, state.qty + d));
    el.qOut.textContent = state.qty;
    const p = byId(state.openId);
    el.total.textContent = money(p.price * state.qty);
    updateSummary(p);
  }

  /* ======================================================================
     5) نموذج الطلب
     ====================================================================== */
  function renderCountries() {
    const cur = el.country.value || state.country;
    el.country.innerHTML = COUNTRIES.map((c) => `<option value="${c.id}">${L(c.name)}</option>`).join("");
    el.country.value = cur;
    syncPhoneCode();
  }

  function syncPhoneCode() {
    const c = COUNTRIES.find((x) => x.id === el.country.value) || COUNTRIES[0];
    state.country = c.id;
    el.phoneCode.textContent = c.code;
  }

  function setErr(inputId, errId, msg) {
    const inp = $("#" + inputId);
    $("#" + errId).textContent = msg || "";
    if (msg) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid");
    return !msg;
  }
  function clearErrors() {
    [["fName", "eName"], ["fPhone", "ePhone"], ["fCity", "eCity"], ["fAddress", "eAddress"]].forEach(([i, e]) => setErr(i, e, ""));
    el.formErr.textContent = "";
  }

  function validate() {
    const v = Object.fromEntries(new FormData(el.form));
    const phone = String(v.phone || "").replace(/\D/g, "").replace(/^0+/, "");
    const ok = [
      setErr("fName", "eName", String(v.name || "").trim().length >= 3 ? "" : t("form.errName")),
      setErr("fPhone", "ePhone", phone.length >= 7 && phone.length <= 11 ? "" : t("form.errPhone")),
      setErr("fCity", "eCity", String(v.city || "").trim().length >= 2 ? "" : t("form.errCity")),
      setErr("fAddress", "eAddress", String(v.address || "").trim().length >= 8 ? "" : t("form.errAddress")),
    ];
    return { valid: ok.every(Boolean), v, phone };
  }

  async function submitOrder(e) {
    e.preventDefault();
    if (state.busy) return;
    const { valid, v, phone } = validate();
    if (!valid) { $('[aria-invalid="true"]', el.form)?.focus(); return; }

    // لو الحقل المخفي اتملا يبقى روبوت: نمثّل النجاح من غير ما نبعت حاجة
    if (v.website) { el.orderNo.textContent = "SNZ-" + Math.random().toString(36).slice(2, 7).toUpperCase(); setStep("done"); return; }

    const p = byId(state.openId);
    const c = COUNTRIES.find((x) => x.id === v.country) || COUNTRIES[0];
    const order = {
      product_id: p.id, product_name: p.name.en, size: state.size, qty: state.qty,
      customer_name: String(v.name).trim(), phone: c.code + phone,
      country: c.name.en, city: String(v.city).trim(), address: String(v.address).trim(),
      notes: String(v.notes || "").trim(), total: p.price * state.qty,
    };

    state.busy = true;
    el.main.disabled = true; el.main.textContent = t("form.sending");
    el.formErr.textContent = "";
    try {
      const res = await window.SneakzAPI.submitOrder(order);
      el.orderNo.textContent = res.orderNo;
      setStep("done");
    } catch (err) {
      console.error(err);
      el.formErr.textContent = t("form.errSend");
    } finally {
      state.busy = false; el.main.disabled = false; updateMainBtn();
    }
  }

  /* ======================================================================
     6) سحب لوحة الموبايل للإغلاق
     ====================================================================== */
  function enableSheetDrag() {
    const grab = document.createElement("div");
    grab.className = "panel__grab";
    el.panel.prepend(grab);

    let startY = 0, dy = 0, dragging = false, t0 = 0;
    grab.addEventListener("pointerdown", (e) => {
      if (!isMobile()) return;
      dragging = true; startY = e.clientY; dy = 0; t0 = performance.now();
      el.panel.classList.add("is-dragging");
      grab.setPointerCapture(e.pointerId);
    });
    grab.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      el.panel.style.transform = `translateY(${dy}px)`;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      el.panel.classList.remove("is-dragging");
      const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
      if (dy > 120 || (fast && dy > 40)) closeFocus();
      else el.panel.style.transform = "";
    };
    grab.addEventListener("pointerup", end);
    grab.addEventListener("pointercancel", end);
  }

  /* ======================================================================
     ربط الأحداث
     ====================================================================== */
  el.langBtn.addEventListener("click", () => setLang(isRTL() ? "en" : "ar"));

  el.filters.addEventListener("click", (e) => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.filter = b.dataset.cat;
    renderFilters(); renderShelf();
  });

  el.grid.addEventListener("click", (e) => {
    const c = e.target.closest(".shoe-card"); if (c) openFocus(Number(c.dataset.id), c);
  });

  $("#marqueeTrack")?.addEventListener("click", (e) => {
    const b = e.target.closest(".marquee__item");
    if (b) openFocus(Number(b.dataset.id), b, b.querySelector("img"));
  });

  el.dots.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$(".shoe-card", el.grid)[Number(b.dataset.i)]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });

  el.focus.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeFocus(); });
  el.prev.addEventListener("click", () => go(-1));
  el.next.addEventListener("click", () => go(1));

  el.sizes.addEventListener("click", (e) => {
    const b = e.target.closest(".size"); if (b) chooseSize(Number(b.dataset.size));
  });
  el.qMinus.addEventListener("click", () => changeQty(-1));
  el.qPlus.addEventListener("click", () => changeQty(1));

  el.main.addEventListener("click", () => {
    if (state.step === "details") {
      if (!state.size) {
        el.sizeErr.textContent = t("panel.sizeMissing");
        el.sizes.classList.remove("is-missing"); void el.sizes.offsetWidth; el.sizes.classList.add("is-missing");
        el.scroll.scrollTo({ top: el.sizes.offsetTop - 120, behavior: "smooth" });
        return;
      }
      updateSummary(byId(state.openId));
      setStep("form");
      if (!isMobile()) $("#fName").focus({ preventScroll: true });
    } else if (state.step === "form") {
      el.form.requestSubmit();
    }
  });
  el.back.addEventListener("click", () => setStep("details"));

  el.form.addEventListener("submit", submitOrder);
  el.form.addEventListener("input", (e) => {
    const map = { fName: "eName", fPhone: "ePhone", fCity: "eCity", fAddress: "eAddress" };
    if (map[e.target.id]) setErr(e.target.id, map[e.target.id], "");
  });
  el.country.addEventListener("change", syncPhoneCode);

  document.addEventListener("keydown", (e) => {
    if (!state.openId) return;
    if (e.key === "Escape") { e.preventDefault(); closeFocus(); return; }

    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if (!typing && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      const toNext = (e.key === "ArrowLeft") === isRTL();
      go(toNext ? 1 : -1);
    }

    if (e.key === "Tab") {  // نحبس التاب جوه الفوكس
      const f = $$("button, input, select, textarea, a[href]", el.focus)
        .filter((n) => !n.disabled && n.tabIndex !== -1 && n.offsetParent !== null && getComputedStyle(n).visibility !== "hidden");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // لو الشاشة اتغيّر حجمها (مثلاً لفّ الموبايل) نعيد ضبط الكاروسيل
  let rz;
  window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(setupCarousel, 150); });

  /* ======================================================================
     التشغيل
     ====================================================================== */
  try { state.lang = localStorage.getItem("sneakz_lang") || CFG.defaultLang; } catch (_) { state.lang = CFG.defaultLang; }
  if (!["ar", "en"].includes(state.lang)) state.lang = "ar";

  function renderAll() { renderShelf(); renderMarquee(); }

  async function boot() {
    enableSheetDrag();
    applyI18n();
    renderCountries();
    renderFilters();

    // نحاول نقرأ المنتجات من Supabase. لو اتأخر أكتر من 1.2 ثانية نعرض النسخة المحلية فوراً
    const remote = window.SneakzAPI.fetchProducts().catch((err) => {
      console.warn("Supabase products unavailable, using local data:", err.message);
      return null;
    });
    const first = await Promise.race([remote, delay(1200).then(() => null)]);
    if (first && first.length) PRODUCTS = first;
    renderAll();

    // لو وصلت متأخرة (ومفيش كوتشي مفتوح) نحدّث بهدوء
    if (!first) {
      remote.then((list) => {
        if (list && list.length && !state.openId && JSON.stringify(list) !== JSON.stringify(PRODUCTS)) {
          PRODUCTS = list; renderAll();
        }
      });
    }
  }

  boot();
})();
