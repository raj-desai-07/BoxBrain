/* =========================================================
   BoxBrain · index.js  (sirf index.html ke liye)

   Index page = "New chat" welcome screen.
   - sidebar open/close + search
   - composer (autosize, Enter se send)
   - quick chips
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
    input = $("cInput"),
    sendBtn = $("cSend"),
    form = $("cForm");

  const isMobile = () => window.matchMedia("(max-width: 860px)").matches;

  /* ---------- sidebar ---------- */
  function setSide(open) {
    side.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
    menuBtn.setAttribute("aria-expanded", String(open));
    side.inert = isMobile() ? !open : false;
  }

  // group labels / "No chats found" ko items ke hisaab se dikhao-chhupao
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

  /* ---------- composer ---------- */
  function autosize() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 168) + "px";
    sendBtn.disabled = !input.value.trim();
  }

  input.addEventListener("input", autosize);

  // Enter = send, Shift+Enter = new line (mobile par Enter = new line)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !isMobile()) {
      e.preventDefault();
      if (input.value.trim()) form.requestSubmit();
    }
  });

  // double click / double Enter par do chat na bane
  form.addEventListener("submit", (e) => {
    if (!input.value.trim() || form.dataset.sent) return e.preventDefault();
    form.dataset.sent = "1";
    sendBtn.disabled = true;
  });

  // browser ke Back button se wapas aane par form dobara use ho sake
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      delete form.dataset.sent;
      autosize();
    }
  });

  // quick chips: text input me aa jaye
  document.querySelectorAll(".qc").forEach((chip) =>
    chip.addEventListener("click", () => {
      input.value = chip.dataset.p || "";
      autosize();
      input.focus();
    }),
  );

  /* ---------- events ---------- */
  // New chat: hum pehle se new chat screen par hain
  $("cNew").addEventListener("click", () => {
    if (isMobile()) setSide(false);
    input.focus();
  });

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

  /* ---------- init ---------- */
  if (isMobile()) side.inert = true;
  autosize();

  // sidebar ke items ek-ek karke aayein (animation ek hi baar chalti hai)
  [...list.children]
    .filter((el) => el.classList.contains("c-item"))
    .forEach((el, i) => {
      el.style.setProperty("--d", 0.08 + i * 0.045 + "s");
      el.addEventListener("animationend", () => el.classList.add("done"), { once: true });
    });
})();