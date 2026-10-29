(() => {
  const modal = document.getElementById("confirmModal");
  if (!modal) return;

  const titleEl = modal.querySelector("[data-mo-title]");
  const textEl = modal.querySelector("[data-mo-text]");
  const nameEl = modal.querySelector("[data-mo-name]");
  const nameTxt = modal.querySelector("[data-mo-name-text]");
  const okBtn = modal.querySelector("[data-mo-ok]");
  const cancelBtn = modal.querySelector("[data-mo-cancel]");
  let trigger = null;

  const isOpen = () => modal.classList.contains("open");

  function open(btn) {
    trigger = btn;
    titleEl.textContent = btn.dataset.title || "Are you sure?";
    textEl.textContent = btn.dataset.text || "";
    textEl.hidden = !btn.dataset.text;
    nameEl.hidden = !btn.dataset.name;
    nameTxt.textContent = btn.dataset.name || "";
    okBtn.textContent = btn.dataset.ok || "Delete";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("mo-lock");
    cancelBtn.focus({ preventScroll: true }); // galti se Enter dabne par delete na ho
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("mo-lock");
    if (trigger) trigger.focus({ preventScroll: true });
  }

  // trigger buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-confirm]");
    if (!btn) return;
    e.preventDefault();
    open(btn);
  });

  cancelBtn.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close(); // overlay par click
  });
  okBtn.addEventListener("click", () => {
    const t = trigger;
    close();
    if (t) t.dispatchEvent(new CustomEvent("confirmed", { bubbles: true }));
  });

  // Esc se band, Tab popup ke andar hi ghume
  document.addEventListener(
    "keydown",
    (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        e.stopPropagation(); // sidebar wala Esc ek saath na chale
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
        (document.activeElement === cancelBtn ? okBtn : cancelBtn).focus();
      }
    },
    true,
  );
})();

(() => {
  const openModal = () => document.querySelector(".mo:target");
  const closeModal = () => { location.hash = ""; };

  // Focus the input and select its text when a rename modal opens
  function focusInput() {
    const modal = openModal();
    const input = modal && modal.querySelector(".mo-input");
    if (input) {
      input.focus();
      input.select();
    }
  }

  window.addEventListener("hashchange", focusInput);

  // Esc closes the modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openModal()) closeModal();
  });

  // Click on the dark overlay closes the modal
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("mo") && e.target === openModal()) closeModal();
  });
})();