/* Get started page: footer year, FAQ one-at-a-time, reveal on scroll */
(() => {
  const yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  const faqs = document.querySelectorAll(".gs-faq details");
  faqs.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) faqs.forEach((o) => o !== d && (o.open = false));
    }),
  );

  if (!("IntersectionObserver" in window)) return;
  const items = document.querySelectorAll(".gs-step, .gs-feat");
  items.forEach((el) => el.classList.add("gs-hide"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove("gs-hide");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.15 },
  );
  items.forEach((el) => io.observe(el));
})();
