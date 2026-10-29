document.querySelectorAll(".eye").forEach(
  (b) =>
    (b.onclick = () => {
      const i = b.parentElement.querySelector("input");
      i.type = i.type === "password" ? "text" : "password";
    }),
);

/* Chat history sidebar */
(() => {
  const btn = document.getElementById("menuBtn");
  const side = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!btn || !side || !overlay) return;
  const closeBtn = document.getElementById("menuClose");

  const setOpen = (open) => {
    side.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    document.body.classList.toggle("no-scroll", open);
    side.inert = !open;
    btn.setAttribute("aria-expanded", String(open));
    (open ? closeBtn : btn).focus({ preventScroll: true });
  };

  btn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && side.classList.contains("open")) setOpen(false);
  });

  side.querySelectorAll(".s-item").forEach((item) =>
    item.addEventListener("click", () => {
      side.querySelectorAll(".s-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      setOpen(false);
    }),
  );

  document.getElementById("newChat").addEventListener("click", () => {
    setOpen(false);
    const msg = document.getElementById("msg");
    if (msg) { msg.value = ""; msg.focus(); }
  });
})();

/* Home page: prompt likhke send karo ya quick card dabao -> chat.html */
(() => {
  const msg = document.getElementById("msg");
  const form = msg && msg.closest("form");
  if (!form) return;
  const go = (text) => {
    text = (text || "").trim();
    if (text) location.href = "chat.html?q=" + encodeURIComponent(text);
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    go(msg.value);
  });
  msg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      go(msg.value);
    }
  });
  form.querySelectorAll(".qc").forEach((b) =>
    b.addEventListener("click", () => go(b.dataset.p)),
  );
})();
