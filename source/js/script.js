"use strict";

(function () {
  const nav = document.querySelector(".navigation");
  const navBtn = nav.querySelector(".navigation__toggle");
  const navInner = document.querySelector(".navigation__list");
  const logo = document.querySelector(".logo");

  navBtn.addEventListener("click", function (evt) {
    evt.preventDefault();
    if (navBtn.classList.contains("navigation__toggle--opened")) {
      navBtn.classList.remove("navigation__toggle--opened");
      navBtn.classList.add("navigation__toggle--closed");
    } else {
      navBtn.classList.add("navigation__toggle--opened");
      navBtn.classList.remove("navigation__toggle--closed");
    }

    if (navInner.classList.contains("navigation__list--active")) {
      navInner.classList.remove("navigation__list--active");
      navInner.classList.add("navigation__list--closed");
    } else {
      navInner.classList.add("navigation__list--active");
      navInner.classList.remove("navigation__list--closed");
    }
    document.querySelector("body").classList.toggle("overlay");
  });

  window.onresize = function () {
    if (window.screen.width > 768) {
      document.querySelector("body").classList.remove("overlay");
      if (navInner.classList.contains("navigation__list--active")) {
        navInner.classList.remove("navigation__list--active");
      }
      if (navInner.classList.contains("navigation__list--closed")) {
        navInner.classList.remove("navigation__list--closed");
      }
      if (navBtn.classList.contains("navigation__toggle--opened")) {
        navBtn.classList.remove("navigation__toggle--opened");
      }
    }
  };

  // var phone = document.querySelector("#phone");
  // phone.addEventListener("input", function () {
  //   if (phone.value.length < 16) {
  //     phone.setCustomValidity("Введите номер телефона полностью");
  //   } else {
  //     phone.setCustomValidity("");
  //   }
  // });
})();
