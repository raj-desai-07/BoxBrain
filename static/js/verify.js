(() => {
  const boxes = [...document.querySelectorAll(".otp-in")];

  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/\D/g, "").slice(0, 1);

      if (box.value && i < 5) {
        boxes[i + 1].focus();
      }
    });
  });
})();