/* SNEAKZ admin: دخول + طلبات + منتجات (Supabase REST بدون SDK) */
(() => {
  "use strict";
  const CFG = (window.SNEAKZ_CONFIG && window.SNEAKZ_CONFIG.supabase) || {};
  const URL_ = (CFG.url || "").replace(/\/$/, "");
  const KEY = CFG.key || "";
  const SKEY = "sneakz_admin_session";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const STATUS = { new: "جديد", confirmed: "مؤكد", shipped: "في الشحن", delivered: "اتسلّم", cancelled: "ملغي" };
  const CATS = { classic: "كلاسيك", running: "رانينج", hightop: "هاي توب", special: "إصدارات خاصة" };

  let session = null;
  let orders = [];
  let products = [];
  let editing = null; // null = جديد، أو المنتج

  /* ---------- جلسة الدخول ---------- */
  const loadSession = () => { try { return JSON.parse(sessionStorage.getItem(SKEY)); } catch { return null; } };
  const saveSession = (s) => { session = s; try { s ? sessionStorage.setItem(SKEY, JSON.stringify(s)) : sessionStorage.removeItem(SKEY); } catch {} };

  async function authCall(path, body) {
    const r = await fetch(URL_ + "/auth/v1/" + path, {
      method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error_description || d.msg || d.message || "فشل تسجيل الدخول");
    return { access: d.access_token, refresh: d.refresh_token, exp: Date.now() + (d.expires_in || 3600) * 1000, email: d.user && d.user.email };
  }

  async function refresh() {
    if (!session || !session.refresh) throw new Error("انتهت الجلسة");
    const s = await authCall("token?grant_type=refresh_token", { refresh_token: session.refresh });
    saveSession({ ...s, email: s.email || session.email });
  }

  async function api(path, opt = {}, retry = true) {
    if (session && session.exp - Date.now() < 60000) { try { await refresh(); } catch { return logout(); } }
    const headers = { apikey: KEY, Authorization: "Bearer " + session.access, ...(opt.headers || {}) };
    if (opt.json !== undefined) { headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(opt.json); }
    const r = await fetch(URL_ + path, { method: opt.method || "GET", headers, body: opt.body });
    if (r.status === 401 && retry) { try { await refresh(); return api(path, opt, false); } catch { return logout(); } }
    const txt = await r.text();
    let d = null; try { d = txt ? JSON.parse(txt) : null; } catch { d = { message: txt }; }
    if (!r.ok) throw new Error((d && (d.message || d.error)) || "حصل خطأ (" + r.status + ")");
    return d;
  }

  function logout() {
    saveSession(null);
    $("appView").hidden = true; $("loginView").hidden = false;
    $("lPass").value = "";
    return new Promise(() => {});
  }

  /* ---------- الدخول ---------- */
  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("loginBtn"), err = $("loginErr");
    err.hidden = true; btn.disabled = true;
    try {
      const s = await authCall("token?grant_type=password", { email: $("lEmail").value.trim(), password: $("lPass").value });
      saveSession({ ...s, email: s.email || $("lEmail").value.trim() });
      await enter();
    } catch (ex) {
      err.textContent = /invalid/i.test(ex.message) ? "الإيميل أو كلمة السر غلط." : ex.message;
      err.hidden = false;
    } finally { btn.disabled = false; }
  });
  $("logoutBtn").addEventListener("click", () => { logout(); });

  async function enter() {
    // نتأكد إنه أدمن فعلاً: قراءة الطلبات لازم تنجح
    try { await loadAll(); }
    catch (ex) {
      saveSession(null);
      const err = $("loginErr");
      err.textContent = "الحساب ده مش أدمن، أو ملف SQL رقم 3 لسه ما اتشغّلش. (" + ex.message + ")";
      err.hidden = false; return;
    }
    $("loginView").hidden = true; $("appView").hidden = false;
    $("who").textContent = session.email || "";
  }

  async function loadAll() {
    const [o, p] = await Promise.all([
      api("/rest/v1/orders?select=*&order=created_at.desc&limit=500"),
      api("/rest/v1/products?select=*&order=sort.asc,id.asc"),
    ]);
    orders = o || []; products = p || [];
    renderOrders(); renderProducts();
  }

  /* ---------- التابات ---------- */
  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on); });
    $("tab-orders").hidden = t.dataset.tab !== "orders";
    $("tab-products").hidden = t.dataset.tab !== "products";
  }));

  /* ---------- الطلبات ---------- */
  const f = (o, ...k) => { for (const x of k) if (o[x] !== undefined && o[x] !== null && o[x] !== "") return o[x]; return ""; };
  const pname = (o) => { const p = products.find((x) => String(x.id) === String(o.product_id)); return (p && p.name_ar) || f(o, "product_name") || ("منتج #" + f(o, "product_id")); };
  const money = (n) => (n === "" ? "" : Number(n).toLocaleString("en") + " " + ((window.SNEAKZ_CONFIG.currency || {}).ar || ""));
  const fdate = (s) => { try { return new Date(s).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" }); } catch { return ""; } };

  $("oFilter").innerHTML = '<option value="">كل الحالات</option>' + Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");

  function renderOrders() {
    const q = $("oSearch").value.trim().toLowerCase(), st = $("oFilter").value;
    const list = orders.filter((o) => (!st || o.status === st) &&
      (!q || [f(o, "name", "customer_name"), f(o, "phone"), f(o, "city")].join(" ").toLowerCase().includes(q)));

    const cnt = (s) => orders.filter((o) => o.status === s).length;
    const revenue = orders.filter((o) => o.status === "delivered").reduce((a, o) => a + Number(f(o, "total", "total_price") || 0), 0);
    $("stats").innerHTML = [
      ["كل الطلبات", orders.length], ["جديد", cnt("new")], ["في الشحن", cnt("shipped")],
      ["اتسلّم", cnt("delivered")], ["إيراد المسلَّم", money(revenue) || 0],
    ].map(([l, v]) => `<div class="stat"><b>${esc(v)}</b><span>${l}</span></div>`).join("");
    const nb = $("newBadge"); nb.textContent = cnt("new"); nb.hidden = !cnt("new");

    $("oMsg").textContent = orders.length ? "" : "مفيش طلبات لسه. أول طلب هيظهر هنا.";
    $("orders").innerHTML = list.map((o) => {
      const st = o.status || "new", total = f(o, "total", "total_price");
      const phone = String(f(o, "phone")).replace(/[^\d]/g, "");
      return `<article class="order ${st === "new" ? "is-new" : ""}" data-id="${esc(o.id)}">
        <div class="order__head">
          <strong>${esc(f(o, "name", "customer_name") || "-")}</strong>
          <span class="pill s-${esc(st)}">${esc(STATUS[st] || st)}</span>
          <span class="order__time">${esc(fdate(o.created_at))}</span>
        </div>
        <div class="order__grid">
          <div><small>المنتج</small>${esc(pname(o))}</div>
          <div><small>المقاس / الكمية</small><bdi dir="ltr">${esc(f(o, "size"))} × ${esc(f(o, "qty", "quantity"))}</bdi></div>
          <div><small>الإجمالي</small>${esc(total === "" ? "-" : money(total))}</div>
          <div><small>الموبايل</small><bdi dir="ltr">${esc(f(o, "phone"))}</bdi></div>
          <div><small>الدولة / المدينة</small>${esc(f(o, "country"))} ${esc(f(o, "city"))}</div>
          <div class="wide"><small>العنوان</small>${esc(f(o, "address") || "-")}</div>
          ${f(o, "notes") ? `<div class="wide"><small>ملاحظات</small>${esc(f(o, "notes"))}</div>` : ""}
        </div>
        <div class="order__foot">
          <select data-act="status" aria-label="حالة الطلب">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === st ? "selected" : ""}>${v}</option>`).join("")}</select>
          ${phone ? `<a class="btn btn--ghost btn--sm wa" target="_blank" rel="noopener" href="https://wa.me/${phone}">واتساب</a><a class="btn btn--ghost btn--sm" href="tel:+${phone}">اتصال</a>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  $("orders").addEventListener("change", async (e) => {
    const sel = e.target.closest('[data-act="status"]'); if (!sel) return;
    const id = sel.closest(".order").dataset.id, val = sel.value;
    const o = orders.find((x) => String(x.id) === id), old = o.status;
    try {
      await api("/rest/v1/orders?id=eq." + encodeURIComponent(id), { method: "PATCH", json: { status: val }, headers: { Prefer: "return=minimal" } });
      o.status = val; renderOrders();
    } catch (ex) { sel.value = old; $("oMsg").textContent = "ما اتحفظش: " + ex.message; }
  });
  $("oSearch").addEventListener("input", renderOrders);
  $("oFilter").addEventListener("change", renderOrders);
  $("oReload").addEventListener("click", async () => {
    $("oMsg").textContent = "بيحدّث..."; try { await loadAll(); } catch (ex) { $("oMsg").textContent = ex.message; }
  });

  /* ---------- المنتجات ---------- */
  function renderProducts() {
    $("pCount").textContent = products.length + " منتج";
    $("plist").innerHTML = products.map((p) => `<button class="pcard ${p.active === false ? "is-off" : ""}" data-id="${esc(p.id)}">
      <img src="${esc(p.image)}" alt="" loading="lazy">
      <b>${esc(p.name_ar)}</b>
      <small>${esc(CATS[p.cat] || p.cat)} · ${esc(money(p.price))}${p.active === false ? " · مخفي" : ""}</small>
    </button>`).join("");
  }
  $("plist").addEventListener("click", (e) => {
    const b = e.target.closest(".pcard"); if (!b) return;
    openForm(products.find((p) => String(p.id) === b.dataset.id));
  });
  $("pNew").addEventListener("click", () => openForm(null));

  const modal = $("pModal");
  let pendingImage = "";

  function openForm(p) {
    editing = p; pendingImage = p ? p.image : "";
    $("pTitle").textContent = p ? "تعديل: " + p.name_ar : "منتج جديد";
    $("fNameAr").value = p ? p.name_ar : ""; $("fNameEn").value = p ? p.name_en : "";
    $("fPrice").value = p ? p.price : ""; $("fCat").value = p ? p.cat : "classic";
    $("fSizes").value = p ? (p.sizes || []).join(",") : "40,41,42,43,44";
    $("fSort").value = p ? p.sort : (products.reduce((m, x) => Math.max(m, x.sort || 0), 0) + 1);
    $("fDescAr").value = p ? p.desc_ar || "" : ""; $("fDescEn").value = p ? p.desc_en || "" : "";
    $("fActive").checked = p ? p.active !== false : true;
    $("pPreview").src = pendingImage || ""; $("pFile").value = "";
    $("pErr").hidden = true; $("pDelete").hidden = !p;
    modal.showModal();
  }
  $("pCancel").addEventListener("click", () => modal.close());

  $("pFile").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const err = $("pErr"); err.hidden = true;
    if (file.size > 3 * 1024 * 1024) { err.textContent = "الصورة أكبر من 3 ميجا."; err.hidden = false; return; }
    const ext = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "");
    const name = "p" + Date.now() + "." + ext;
    $("pSave").disabled = true;
    try {
      const r = await fetch(URL_ + "/storage/v1/object/products/" + name, {
        method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + session.access, "Content-Type": file.type, "x-upsert": "true" }, body: file,
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || "فشل رفع الصورة"); }
      pendingImage = URL_ + "/storage/v1/object/public/products/" + name;
      $("pPreview").src = pendingImage;
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { $("pSave").disabled = false; }
  });

  $("pForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("pErr"); err.hidden = true;
    const sizes = $("fSizes").value.split(",").map((s) => s.trim()).filter(Boolean);
    if (!pendingImage) { err.textContent = "ارفع صورة للمنتج."; err.hidden = false; return; }
    if (!sizes.length) { err.textContent = "اكتب مقاس واحد على الأقل."; err.hidden = false; return; }
    const nameEn = $("fNameEn").value.trim();
    const row = {
      name_ar: $("fNameAr").value.trim(), name_en: nameEn, cat: $("fCat").value,
      price: Number($("fPrice").value), sizes: sizes.map(Number).filter((n) => n > 0),
      desc_ar: $("fDescAr").value.trim(), desc_en: $("fDescEn").value.trim(),
      sort: Number($("fSort").value) || 0, active: $("fActive").checked, image: pendingImage,
    };
    $("pSave").disabled = true;
    try {
      if (editing) {
        await api("/rest/v1/products?id=eq." + encodeURIComponent(editing.id), { method: "PATCH", json: row, headers: { Prefer: "return=minimal" } });
      } else {
        row.id = products.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
        row.slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item-" + row.id;
        await api("/rest/v1/products", { method: "POST", json: row, headers: { Prefer: "return=minimal" } });
      }
      modal.close();
      products = await api("/rest/v1/products?select=*&order=sort.asc,id.asc");
      renderProducts(); renderOrders();
      $("pMsg").textContent = "اتحفظ.";
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
    finally { $("pSave").disabled = false; }
  });

  $("pDelete").addEventListener("click", async () => {
    if (!editing || !confirm("متأكد إنك عايز تمسح «" + editing.name_ar + "»؟ لو في طلبات عليه الأحسن تخفيه بدل ما تمسحه.")) return;
    try {
      await api("/rest/v1/products?id=eq." + encodeURIComponent(editing.id), { method: "DELETE", headers: { Prefer: "return=minimal" } });
      modal.close();
      products = products.filter((p) => p.id !== editing.id);
      renderProducts(); $("pMsg").textContent = "اتمسح.";
    } catch (ex) { $("pErr").textContent = ex.message; $("pErr").hidden = false; }
  });

  /* ---------- بداية ---------- */
  if (!URL_ || !KEY) {
    $("loginErr").textContent = "مفاتيح Supabase مش موجودة في js/data.js"; $("loginErr").hidden = false;
  } else {
    const s = loadSession();
    if (s) { session = s; enter(); }
  }
})();
