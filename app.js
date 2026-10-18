/* YourCardJourney Tools - one bookmark for every live tool.
   TOOLS is the whole public page: add a tool = add a line (its icon goes in marks/).
   The master back office is NOT in this file: it lives encrypted in vault.json
   (written by tools/seal.mjs) and only the master key decrypts it. */
(function () {
  const GROUPS = [
    { id: "gold", label: "Gold boards", accent: "#c9971f",
      svg: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.6"/>' },
    { id: "deals", label: "Deals & rewards", accent: "#e11d48",
      svg: '<path d="M13 3.5h7.5V11l-9 9a1.6 1.6 0 0 1-2.2 0L3.8 14.5a1.6 1.6 0 0 1 0-2.2z"/><circle cx="16.4" cy="7.6" r="1.2"/>' },
    { id: "loop", label: "Stay in the loop", accent: "#0891b2",
      svg: '<path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.6 8.4 2.6 8.4H3.4S6 15.5 6 9z"/><path d="M10.2 20.6a2 2 0 0 0 3.6 0"/>' },
  ];

  const TOOLS = [
    { g: "gold", id: "karatboard", name: "Karat Board", tag: "Gold rates. One screen.",
      url: "https://karatboard.yourcardjourney.store", glow: "rgba(201,151,31,.42)" },
    { g: "gold", id: "amazongold", name: "AmazonGold", tag: "Amazon gold, checked.",
      url: "https://amazongold.yourcardjourney.store", glow: "rgba(255,153,0,.42)" },
    { g: "gold", id: "flipkartgold", name: "FlipkartGold", tag: "Flipkart gold, stacked.",
      url: "https://flipkartgold.yourcardjourney.store", glow: "rgba(40,116,240,.40)" },
    { g: "gold", id: "blinkdeal", name: "BlinkDeal", tag: "Myntra gold, in a blink.",
      url: "https://blinkdeal.yourcardjourney.store", glow: "rgba(255,63,108,.40)" },

    { g: "deals", id: "giftdeals", name: "GiftDeals", tag: "Gift-card coupons.",
      url: "https://giftdeals.yourcardjourney.store", glow: "rgba(15,118,110,.40)" },
    { g: "deals", id: "deals", name: "Voucher Deals", tag: "Vouchers in stock.",
      url: "https://deals.yourcardjourney.store", glow: "rgba(192,42,114,.40)" },
    { g: "deals", id: "rewardswitch", name: "Reward Switch", tag: "Rewards, decoded.",
      url: "https://rewardswitch.yourcardjourney.store", glow: "rgba(220,74,15,.40)" },
    { g: "deals", id: "whichbike", name: "WhichBike", tag: "Bikes, card offer off.",
      url: "https://whichbike.in", glow: "rgba(224,22,12,.36)" },

    { g: "loop", id: "ministatement", name: "Mini Statement", tag: "Card news, in short.",
      url: "https://ministatement-api.yourcardjourney.workers.dev", glow: "rgba(33,73,90,.42)" },
    { g: "loop", id: "karatalerts", name: "Karat Alerts", tag: "Gold gaps, pinged.",
      url: "https://t.me/KaratBoardAlertBot", glow: "rgba(138,95,20,.40)" },
    { g: "loop", id: "x", name: "X", tag: "Deals, first on X.",
      url: "https://x.com/YourCardJourney", glow: "rgba(10,10,11,.30)" },
    { g: "loop", id: "reddit", name: "Reddit", tag: "Ask the community.",
      url: "https://www.reddit.com/r/YCJOfficial/", glow: "rgba(255,69,0,.36)" },
  ];

  const MASTER = "ycj.home.master";              // the derived key, never the key itself
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ARROW = '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  const HORN = '<svg viewBox="0 0 24 24"><path d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

  let back = null;                               // decrypted back office, when unlocked

  /* ---------------------------------------------------------------- tiles */
  function render() {
    let i = 0;
    $("#groups").innerHTML = GROUPS.map((g, gi) => {
      const list = TOOLS.filter((t) => t.g === g.id);
      const tiles = list.map((t) => {
        const bc = back && back.broadcast && back.broadcast[t.id];
        return `
        <a class="tile" href="${esc(t.url)}" target="_blank" rel="noopener" data-id="${esc(t.id)}"
           style="--i:${i++};--glow:${t.glow}">
          <span class="ico"><img src="marks/${esc(t.id)}.svg" alt="" width="50" height="50"></span>
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.tag)}</p>
          <span class="go" aria-hidden="true">${ARROW}</span>
          ${bc ? `<span class="bc" role="link" tabindex="0" data-href="${esc(bc)}" title="Broadcast ${esc(t.name)}" aria-label="Broadcast ${esc(t.name)}">${HORN}</span>` : ""}
        </a>`;
      }).join("");
      return `
      <section class="group" style="--g:${gi};--accent:${g.accent}" aria-label="${esc(g.label)}">
        <h2 class="group-head"><svg viewBox="0 0 24 24" aria-hidden="true">${g.svg}</svg><span>${esc(g.label)}</span><span>${list.length}</span></h2>
        <div class="tiles">${tiles}</div>
      </section>`;
    }).join("");

    const dock = $("#dock");
    if (back && back.dock && back.dock.length) {
      $("#dockItems").innerHTML = back.dock.map((d, k) => `
        <a href="${esc(d.url)}" target="_blank" rel="noopener" style="--i:${k}" title="${esc(d.tag || d.name)}">
          <img src="marks/${esc(d.icon)}.svg" alt=""><span>${esc(d.name)}</span></a>`).join("");
      dock.hidden = false;
    } else dock.hidden = true;
  }

  // The megaphone sits inside the tile link; open its own page instead.
  function openBroadcast(e) {
    const bc = e.target.closest(".bc");
    if (!bc) return false;
    e.preventDefault(); e.stopPropagation();
    window.open(bc.dataset.href, "_blank", "noopener");
    return true;
  }
  $("#groups").addEventListener("click", openBroadcast);
  $("#groups").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openBroadcast(e); });

  /* ---------------------------------------------------------------- glint + bell */
  function glint() {
    if (document.hidden) return;
    const tiles = [...document.querySelectorAll(".tile")];
    if (!tiles.length) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    t.classList.remove("shine"); void t.offsetWidth; t.classList.add("shine");
  }
  function ring() {
    const a = $("#alert");
    a.classList.remove("ringing"); void a.offsetWidth; a.classList.add("ringing");
    setTimeout(() => a.classList.add("seen"), 500);
  }

  /* ---------------------------------------------------------------- bookmark chip */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const isTouch = matchMedia("(hover: none)").matches;
  if (isMac) $("#kMod").textContent = "⌘";
  if (isTouch) {                                 // phones: no keyboard - offer Home screen via the share sheet
    $("#bmText").textContent = "Add to Home screen";
    $("#bmKeys").hidden = true;
  }
  $("#bm").addEventListener("click", async () => {
    const b = $("#bm");
    b.classList.remove("pressed"); void b.offsetWidth; b.classList.add("pressed");
    if (isTouch && navigator.share) {
      try { await navigator.share({ title: document.title, url: location.href }); } catch (e) { /* closed */ }
    }
  });

  /* ---------------------------------------------------------------- master vault */
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const toB64 = (u) => btoa(String.fromCharCode(...new Uint8Array(u)));
  let vault = null;

  async function loadVault() {
    if (vault) return vault;
    const r = await fetch("vault.json", { cache: "no-store" });
    if (!r.ok) throw new Error("no vault");
    return (vault = await r.json());
  }
  async function derive(pass, v) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveBits"]);
    return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: b64(v.salt), iterations: v.iter }, base, 256);
  }
  async function open(raw) {
    const v = await loadVault();
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(v.iv) }, key, b64(v.ct));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  function setLocked(locked) {
    const btn = $("#lockBtn");
    btn.setAttribute("aria-pressed", String(!locked));
    btn.setAttribute("aria-label", locked ? "Master sign in" : "Lock the back office");
    btn.title = locked ? "Master sign in" : "Lock (sign out)";
  }

  async function restore() {                     // stay signed in on this device until locked
    let saved = null;
    try { saved = localStorage.getItem(MASTER); } catch (e) {}
    if (!saved) return;
    try { back = await open(b64(saved)); setLocked(false); render(); }
    catch (e) { try { localStorage.removeItem(MASTER); } catch (_) {} }   // vault re-sealed with a new key
  }

  const scrim = $("#scrim"), form = $("#keyForm"), input = $("#keyInput"), err = $("#keyErr");
  function showKey() { err.hidden = true; input.value = ""; scrim.hidden = false; setTimeout(() => input.focus(), 60); }
  function hideKey() { scrim.hidden = true; $("#lockBtn").focus(); }

  $("#lockBtn").addEventListener("click", () => {
    if (!back) return showKey();
    back = null;                                 // lock = sign out on this device
    try { localStorage.removeItem(MASTER); } catch (e) {}
    setLocked(true);
    const btn = $("#lockBtn");
    btn.classList.remove("snap"); void btn.offsetWidth; btn.classList.add("snap");
    render();
  });
  $("#keyCancel").addEventListener("click", hideKey);
  scrim.addEventListener("click", (e) => { if (e.target === scrim) hideKey(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !scrim.hidden) hideKey(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pass = input.value.trim();
    if (!pass) return input.focus();
    const go = $("#keyGo");
    go.disabled = true; err.hidden = true;
    try {
      const v = await loadVault();
      const raw = await derive(pass, v);
      back = await open(raw);
      try { localStorage.setItem(MASTER, toB64(raw)); } catch (e2) {}
      hideKey(); setLocked(false); render();
    } catch (e2) {
      err.hidden = false;
      form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
      input.select();
    } finally { go.disabled = false; }
  });

  /* ---------------------------------------------------------------- go */
  render();
  restore();
  setTimeout(() => document.body.classList.add("settled"), 1500);
  setTimeout(ring, 1300);
  setInterval(() => { if (!document.hidden) ring(); }, 30000);
  setTimeout(() => { glint(); setInterval(glint, 2600); }, 1800);
})();
