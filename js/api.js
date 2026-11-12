/* ==========================================================================
   api.js — الاتصال بـ Supabase (من غير مكتبات، fetch عادي)

   - fetchProducts(): بيقرأ الكوتشيات الظاهرة من جدول products
   - submitOrder():  بيبعت الطلب عن طريق الدالة place_order في قاعدة البيانات
                     (السيرفر هو اللي بيحسب السعر ويتأكد من البيانات)

   لو إعدادات Supabase مش موجودة في data.js، الطلب بيتحفظ في المتصفح بس (وضع تجريبي).
   ========================================================================== */

window.SneakzAPI = (() => {
  const cfg = (window.SNEAKZ_CONFIG && window.SNEAKZ_CONFIG.supabase) || {};
  const base = String(cfg.url || "").replace(/\/$/, "");
  const enabled = Boolean(base && cfg.key);

  /** نداء REST عام مع مهلة زمنية */
  async function request(path, opts = {}, timeoutMs = 8000) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(base + path, {
        ...opts,
        headers: { apikey: cfg.key, "Content-Type": "application/json", ...(opts.headers || {}) },
        signal: ctrl.signal,
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (_) { /* مش JSON */ }
      if (!res.ok) {
        const err = new Error((data && (data.message || data.hint)) || "HTTP " + res.status);
        err.status = res.status;
        throw err;
      }
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  /** صف من قاعدة البيانات ← نفس شكل المنتج اللي الموقع شغال بيه */
  const mapProduct = (r) => ({
    id: Number(r.id),
    slug: r.slug,
    cat: r.cat,
    price: Number(r.price),
    image: r.image,
    sizes: (r.sizes || []).map(Number),
    name: { ar: r.name_ar, en: r.name_en },
    desc: { ar: r.desc_ar || "", en: r.desc_en || "" },
  });

  async function fetchProducts() {
    if (!enabled) return null;
    const rows = await request("/rest/v1/products?select=*&active=eq.true&order=sort.asc,id.asc");
    if (!Array.isArray(rows)) return null;
    return rows.map(mapProduct).filter((p) => p.id && p.image && p.sizes.length);
  }

  /** نسخة تجريبية: بتحفظ في المتصفح بس */
  async function demoSubmit(order) {
    await new Promise((r) => setTimeout(r, 600));
    const orderNo = "SNZ-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    try {
      const key = "sneakz_demo_orders";
      const all = JSON.parse(localStorage.getItem(key) || "[]");
      all.push({ ...order, orderNo, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(all.slice(-20)));
    } catch (_) { /* التخزين مقفول: مش مشكلة */ }
    return { orderNo };
  }

  async function submitOrder(order) {
    if (!enabled) return demoSubmit(order);
    const orderNo = await request("/rest/v1/rpc/place_order", {
      method: "POST",
      body: JSON.stringify({
        p_product_id: order.product_id,
        p_size: order.size,
        p_qty: order.qty,
        p_name: order.customer_name,
        p_phone: order.phone,
        p_country: order.country,
        p_city: order.city,
        p_address: order.address,
        p_notes: order.notes || "",
      }),
    }, 12000);
    return { orderNo: String(orderNo) };
  }

  return { enabled, fetchProducts, submitOrder };
})();
