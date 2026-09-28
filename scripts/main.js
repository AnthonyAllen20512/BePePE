(function () {
  const C = window.BurnepepComponents;
  document.querySelector("[data-header]").innerHTML = C.renderHeader();
  document.querySelector("[data-page]").innerHTML = [C.renderHero(), C.renderManifesto(), C.renderToken(), C.renderCommunity(), C.renderRoadmap(), C.renderCta(), C.renderFooter()].join("");

  const video = document.querySelector(".hero-video");
  const toggle = document.querySelector("[data-video-toggle]");
  video?.play().catch(() => {});
  toggle?.addEventListener("click", () => {
    if (video.paused) { video.play(); toggle.textContent = "Ⅱ"; toggle.setAttribute("aria-label", "Pause intro video"); }
    else { video.pause(); toggle.textContent = "▶"; toggle.setAttribute("aria-label", "Play intro video"); }
  });

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
