document.addEventListener("DOMContentLoaded", () => {
    const minus = document.querySelector(".guest-minus");
    const plus = document.querySelector(".guest-plus");
    const count = document.querySelector(".guest-count");

    let guests = 1;

    plus.addEventListener("click", () => {
      guests++;
      count.textContent = guests;
    });

    minus.addEventListener("click", () => {
      if (guests > 1) guests--;
      count.textContent = guests;
    });
});