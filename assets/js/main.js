/* Shri Vallabh Sharanam: site script */

/* Messages from the Write to us forms are sent to this address */
const CONTACT_EMAIL = "shrivallabhsharanam@gmail.com";

(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Theme */
  $("#themeBtn").addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("svs-theme", next); } catch (e) {}
  });

  /* Header height, compact header, back to top */
  const hdr = $("#hdr"), totop = $("#totop");
  const setHH = () => root.style.setProperty("--hh", (hdr.offsetHeight + 18) + "px");
  if ("ResizeObserver" in window) new ResizeObserver(setHH).observe(hdr); else setHH();
  addEventListener("scroll", () => {
    totop.classList.toggle("show", scrollY > 900);
    hdr.classList.toggle("compact", scrollY > 80);
  }, { passive: true });
  totop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  /* Sidebar: keep the current page in view */
  const ac = $("nav.side a[aria-current]");
  if (ac) {
    const box = ac.closest("ul.kids");
    if (box) box.scrollTop = ac.offsetTop - box.clientHeight / 2;
    const sd = ac.closest("nav.side");
    let top = 0, el = ac; while (el && el !== sd) { top += el.offsetTop; el = el.offsetParent; }
    sd.scrollTop = Math.max(0, (box ? box.closest("li").offsetTop : ac.offsetTop) - sd.clientHeight / 3);
  }

  /* Mobile menu */
  const mob = $("#mobmenu"), menuBtn = $("#menuBtn");
  menuBtn.addEventListener("click", () => { mob.classList.add("open"); menuBtn.setAttribute("aria-expanded", "true"); $("#mobClose").focus(); });
  mob.addEventListener("click", e => {
    if (e.target.closest("#mobClose") || e.target.closest("a")) { mob.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });

  /* Search (the index loads the first time search is opened) */
  const sBox = $("#search"), q = $("#q"), res = $("#results");
  let SEARCH = null, sel = 0;
  const openSearch = async () => {
    sBox.classList.add("open"); q.value = ""; setTimeout(() => q.focus(), 0);
    if (!SEARCH) {
      res.innerHTML = '<li class="empty">Loading…</li>';
      try { SEARCH = await (await fetch("assets/search.json")).json(); } catch (e) { SEARCH = []; }
    }
    runSearch();
  };
  const closeSearch = () => sBox.classList.remove("open");
  $("#searchBtn").addEventListener("click", openSearch);
  sBox.addEventListener("click", e => { if (e.target === sBox) closeSearch(); });
  function runSearch() {
    if (!SEARCH) return;
    const t = q.value.trim().toLowerCase(); sel = 0;
    if (!t) { res.innerHTML = '<li class="empty">Type a word, for example Ekadashi, Yamunashtakam or Surdas.</li>'; return; }
    const list = SEARCH.map(p => {
      const i = p.x.toLowerCase().indexOf(t), ti = p.t.toLowerCase().includes(t);
      return { p, i, score: (ti ? 2 : 0) + (i >= 0 ? 1 : 0) };
    }).filter(r => r.score).sort((a, b) => b.score - a.score);
    if (!list.length) { res.innerHTML = `<li class="empty">No pages mention “${esc(q.value)}”. Try a shorter word.</li>`; return; }
    res.innerHTML = list.slice(0, 12).map(({ p, i }, k) => {
      let snip = p.s;
      if (i >= 0) { const a = Math.max(0, i - 50); snip = (a ? "…" : "") + esc(p.x.slice(a, i + 90)) + "…"; }
      return `<li><a href="${p.u}" class="${k === 0 ? "sel" : ""}">${esc(p.t)}<small>${snip}</small></a></li>`;
    }).join("");
  }
  q.addEventListener("input", runSearch);
  q.addEventListener("keydown", e => {
    const a = $$("a", res); if (!a.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); a[sel].classList.remove("sel");
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + a.length) % a.length;
      a[sel].classList.add("sel"); a[sel].scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter") location.href = a[sel].getAttribute("href");
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeSearch(); mob.classList.remove("open"); }
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  /* Share buttons */
  const pageUrl = location.href.split("#")[0];
  const shareText = document.title;
  $$("[data-share]").forEach(a => {
    const u = encodeURIComponent(pageUrl), t = encodeURIComponent(shareText);
    if (a.dataset.share === "facebook") a.href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    if (a.dataset.share === "whatsapp") a.href = `https://wa.me/?text=${t}%20${u}`;
    if (a.dataset.share === "linkedin") a.href = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  });
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(pageUrl); ok = true; } catch (e) {
      const ta = document.createElement("textarea"); ta.value = pageUrl; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove();
    }
    const lab = b.querySelector("span"); const old = lab.textContent;
    lab.textContent = ok ? "Link copied" : "Copy failed"; setTimeout(() => lab.textContent = old, 2000);
  }));

  /* Quiz: the original questions, choices, answers and messages */
  const qz = $("#qz"), qd = $("#quizdata");
  if (qz && qd) {
    const Q = JSON.parse(qd.textContent);
    const draw = () => {
      qz.innerHTML = (Q.intro ? `<p>${esc(Q.intro)}</p>` : "") + Q.questions.map((x, i) =>
        `<fieldset class="qq"><legend>${i + 1}. ${esc(x.q)}</legend>${x.opts.map((o, j) =>
          `<label><input type="radio" name="q${i}" value="${esc(x.vals[j])}"> ${esc(o)}</label>`).join("")}<p class="res" id="r${i}"></p></fieldset>`).join("") +
        `<p><button class="btn" id="qCheck">Check answers</button></p><div id="qOut" aria-live="polite"></div>`;
      $("#qCheck").onclick = () => {
        let c = 0;
        Q.questions.forEach((x, i) => {
          const ch = qz.querySelector(`input[name=q${i}]:checked`), r = $("#r" + i);
          const yours = ch ? ch.value : "";
          if (yours.trim() === String(x.a).trim()) { c++; r.className = "res ok"; r.textContent = "Your answer: " + yours + ". Correct."; }
          else { r.className = "res no"; r.textContent = (yours ? "Your answer: " + yours + ". " : "Not answered. ") + "Correct answer: " + x.a + "."; }
        });
        const pct = c * 10;
        const ok = (op, v) => ({ "<": pct < v, "<=": pct <= v, ">": pct > v, ">=": pct >= v, "==": pct === v })[op];
        const m = Q.messages.find(mm => mm.when.every(([op, v]) => ok(op, v)));
        $("#qOut").innerHTML = `<p class="score">${c} / ${Q.questions.length}</p>` + (m ? `<p class="msg">${esc(m.msg)}</p>` : "") +
          `<p><button class="btn" id="qAgain">Try again</button></p>`;
        $("#qAgain").onclick = () => { draw(); qz.scrollIntoView({ behavior: "smooth" }); };
      };
    };
    draw();
  }

  /* Forms: open the visitor's email app with the filled-in details */
  $$("form.oldform").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const lines = [], seen = new Set();
    $$("[data-label]", f).forEach(el => {
      if (el.type === "radio") {
        if (seen.has(el.name)) return; seen.add(el.name);
        const c = f.querySelector(`input[name="${el.name}"]:checked`);
        lines.push(el.dataset.label + ": " + (c ? c.value : ""));
      } else if (el.type === "checkbox") lines.push(el.dataset.label + ": " + (el.checked ? "Yes" : "No"));
      else lines.push(el.dataset.label + ": " + el.value.trim());
    });
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(f.dataset.subject + " from shrivallabhsharanam website")}&body=${encodeURIComponent(lines.join("\n"))}`;
    $(".fstatus", f).textContent = `Your email app should open with your message ready to send. If it doesn’t, write to ${CONTACT_EMAIL}.`;
  }));
})();
