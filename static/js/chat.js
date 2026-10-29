/* =========================================================
   BoxBrain · chat.js  (sirf chat.html ke liye)
   - send dabane par: user bubble -> typing dots -> Django se reply
     (fetch) -> reply word-by-word type hota hai
   - sidebar open/close, search, copy buttons
   ========================================================= */
(() => {
  const $ = (id) => document.getElementById(id);
  const side = $("cSide"),
    overlay = $("cOverlay"),
    menuBtn = $("cMenu"),
    closeBtn = $("cSideClose"),
    list = $("cList"),
    search = $("cSearch"),
    emptyMsg = $("cEmpty"),
    thread = $("cThread"),
    scroller = $("cScroll"),
    form = $("cForm"),
    input = $("cInput"),
    sendBtn = $("cSend");

  let busy = false;
  let timer = null;

  /* ---------- small helpers ---------- */
  const tpl = (id) => $(id).content.firstElementChild.cloneNode(true);
  const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;

  function showToast(msg, ms = 1800) {
    // chat.html me #toast nahi hota, isliye zaroorat par bana lo
    let el = $("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => el.classList.remove("on"), ms);
  }

  function copyText(text) {
    const done = () => showToast("Copied");
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove();
      done();
    }
  }

  const nearBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;

  const toBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
      });
    });
  };

  function setBusy(b) {
    busy = b;
    sendBtn.disabled = b || !input.value.trim();
  }

  function getCsrf() {
    const el = form.querySelector("[name=csrfmiddlewaretoken]");
    return el ? el.value : "";
  }

  /* ---------- sidebar ---------- */
  function setSide(open) {
    side.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    menuBtn.setAttribute("aria-expanded", String(open));
    side.inert = isMobile() ? !open : false;
  }

  function refreshList() {
    let label = null,
      shown = 0,
      total = 0;
    [...list.children].forEach((el) => {
      if (el.classList.contains("c-label")) {
        if (label) label.hidden = !shown;
        label = el;
        shown = 0;
      } else if (el.classList.contains("c-item")) {
        if (!el.hidden) { shown++; total++; }
      }
    });
    if (label) label.hidden = !shown;
    if (emptyMsg) emptyMsg.hidden = total > 0;
  }

  // jis chat me abhi baat hui, usse sidebar me sabse upar le aao
  // (server me timestamp update ho chuka hai, ye sirf page par dikhne wala order badalta hai)
  function bumpChatToTop() {
    const chatId = document.body.dataset.chatId;
    const label = list.querySelector(".c-label");
    if (!chatId || !label) return;

    const item = [...list.querySelectorAll(".c-item")].find((el) => el.dataset.chatId === chatId);
    if (!item) {
      console.warn("[sidebar] chat item nahi mila, chatId =", chatId);
      return;
    }
    if (label.nextElementSibling === item) return; // pehle se upar hai

    // item ke saath uske rename/delete modals bhi (agle .c-item tak) saath me le jao
    const group = [item];
    let next = item.nextElementSibling;
    while (next && !next.classList.contains("c-item")) {
      group.push(next);
      next = next.nextElementSibling;
    }
    label.after(...group);
  }

  function goHome(btn) {
    location.href = btn.dataset.href || document.body.dataset.homeUrl || "/";
  }

  /* ---------- typing reveal (static HTML ko word-by-word dikhata hai) ---------- */
  function reveal(msg, done) {
    msg.classList.add("is-typing");
    const bubble = msg.querySelector(".bubble");
    const tools = msg.querySelector(".m-tools");
    if (tools) tools.hidden = true;

    const blocks = [...bubble.children];
    blocks.forEach((b) => (b.hidden = true));

    const items = [];
    const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.nodeValue.trim()) continue;
      if (n.parentElement.closest(".code-h")) continue; // code header ka text type nahi hota
      items.push({
        node: n,
        parts: n.nodeValue.split(/(\s+)/),
        block: blocks.find((b) => b.contains(n)),
      });
      n.nodeValue = "";
    }

    // lambe reply me ek tick me zyada words, taaki ~6 second se zyada na lage
    const totalParts = items.reduce((sum, it) => sum + it.parts.length, 0);
    const perTick = Math.max(3, Math.ceil(totalParts / 200));

    let ni = 0, pi = 0;
    const step = () => {
      if (!document.body.contains(msg)) return;
      const stick = nearBottom();
      let budget = perTick;
      while (budget > 0 && ni < items.length) {
        const it = items[ni];
        if (it.block) it.block.hidden = false;
        it.node.nodeValue += it.parts[pi++];
        budget--;
        if (pi >= it.parts.length) { ni++; pi = 0; }
      }
      if (stick) toBottom();
      if (ni < items.length) {
        timer = setTimeout(step, 28);
      } else {
        timer = null;
        msg.classList.remove("is-typing");
        blocks.forEach((b) => (b.hidden = false));
        if (tools) tools.hidden = false;
        done();
      }
    };
    step();
  }

  // plain text reply ko <p> blocks me todta hai (textContent = XSS safe)
  function fillBubble(bubble, text) {
    bubble.replaceChildren();
    text.split(/\n{2,}/).forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para.trim();
      bubble.appendChild(p);
    });
  }

  /* ---------- reply (typing dots -> server reply -> word-by-word) ---------- */
  const post = (url, body) =>
    fetch(url, {
      method: "POST",
      body,
      headers: { "X-Requested-With": "XMLHttpRequest", "X-CSRFToken": getCsrf() },
      credentials: "same-origin",
    });

  // request = server ko call karne wala function (Response return kare)
  async function playReply(request) {
    setBusy(true);
    const typing = tpl("tplTyping");
    thread.appendChild(typing);
    toBottom();

    try {
      // typing dots kam se kam 900ms dikhein, chahe reply jaldi aa jaye
      const [res] = await Promise.all([request(), new Promise((r) => setTimeout(r, 900))]);
      let data = {};
      try { data = await res.json(); } catch (e) { /* HTML error page (500/403) */ }
      if (!res.ok || data.error) {
        throw new Error(data.error || `Server error ${res.status} (terminal me traceback dekho)`);
      }

      const ai = tpl("tplAi");
      ai.style.animation = "none"; // typing bubble hi reply ban jata hai, dobara pop nahi hota
      ai.querySelector(".m-time").textContent = clock();
      // server markdown ko safe HTML bana kar bhejta hai; na aaye to plain text fallback
      if (data.html) ai.querySelector(".bubble").innerHTML = data.html;
      else fillBubble(ai.querySelector(".bubble"), data.answer);
      typing.replaceWith(ai);
      bumpChatToTop();
      reveal(ai, () => {
        setBusy(false);
        input.focus({ preventScroll: true });
      });
    } catch (err) {
      typing.remove();
      console.error("Reply error:", err);
      showToast(err.message && err.message !== "Request failed" ? err.message : "Reply nahi aa paya, dobara try karo", 6000);
      setBusy(false);
    }
  }

  /* ---------- send ---------- */
  function send(text) {
    text = text.trim();
    if (!text || busy) return;

    // FormData input clear hone se pehle bana lo
    const fd = new FormData(form);
    fd.set("msg", text);

    const u = tpl("tplUser");
    u.querySelector(".bubble").textContent = text;
    u.querySelector(".m-time").textContent = clock();
    thread.appendChild(u);

    input.value = "";
    autosize();
    toBottom();

    playReply(() => post(form.action, fd));
  }

  /* ---------- composer ---------- */
  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 168) + "px";
    sendBtn.disabled = busy || !input.value.trim();
  }

  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !isMobile()) {
      e.preventDefault();
      send(input.value);
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // page reload nahi hoga
    send(input.value);
  });

  /* ---------- events ---------- */
  $("cNew").addEventListener("click", (e) => goHome(e.currentTarget));

  menuBtn.addEventListener("click", () => setSide(true));
  closeBtn.addEventListener("click", () => setSide(false));
  overlay.addEventListener("click", () => setSide(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && side.classList.contains("open")) setSide(false);
  });
  window.addEventListener("resize", () => {
    if (!isMobile()) setSide(false);
    else if (!side.classList.contains("open")) side.inert = true;
  });

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    list.querySelectorAll(".c-item").forEach((it) => {
      it.hidden = !!q && !it.textContent.toLowerCase().includes(q);
    });
    refreshList();
  });

  // thread: copy buttons
  thread.addEventListener("click", (e) => {
    const cc = e.target.closest(".code-copy");
    if (cc) {
      copyText(cc.closest(".code").querySelector("code").textContent);
      cc.textContent = "Copied";
      setTimeout(() => (cc.textContent = "Copy"), 1500);
      return;
    }
    const mc = e.target.closest(".m-copy");
    if (mc) copyText(mc.closest(".msg").querySelector(".bubble").innerText);
  });

  /* ---------- init ---------- */
  if (isMobile()) side.inert = true;
  autosize();

  toBottom();
  window.addEventListener("load", toBottom);
  setTimeout(toBottom, 300);

  // new chat: user ka message server ne save kar diya hai, AI reply abhi baaki hai
  if (thread.dataset.pending) {
    playReply(() => post(thread.dataset.replyUrl, new FormData()));
  }

  [...list.children]
    .filter((el) => !el.classList.contains("c-empty"))
    .forEach((el, i) => {
      el.style.setProperty("--d", 0.08 + i * 0.045 + "s");
      el.addEventListener("animationend", () => el.classList.add("done"), { once: true });
    });
})();