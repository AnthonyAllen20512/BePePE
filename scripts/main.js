(function () {
  const C = window.BurnepepComponents;
  document.querySelector("[data-header]").innerHTML = C.renderHeader();
  document.querySelector("[data-page]").innerHTML = [C.renderHero(), C.renderManifesto(), C.renderToken(), C.renderCommunity(), C.renderRoadmap(), C.renderCta(), C.renderFooter()].join("");

  const frames = [...document.querySelectorAll(".keyframe-frame")];
  const frameToggle = document.querySelector("[data-keyframe-toggle]");
  const frameCount = document.querySelector("[data-frame-count]");
  let frameIndex = 0;
  let isPlaying = true;
  let timer;

  const showFrame = (index) => {
    frames.forEach((frame, current) => frame.classList.toggle("is-active", current === index));
    frameCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`;
  };
  const startFrames = () => {
    window.clearInterval(timer);
    if (!isPlaying || frames.length < 2) return;
    timer = window.setInterval(() => { frameIndex = (frameIndex + 1) % frames.length; showFrame(frameIndex); }, 1050);
  };

  startFrames();
  frameToggle?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    frameToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    frameToggle.setAttribute("aria-label", isPlaying ? "Pause keyframe animation" : "Play keyframe animation");
    startFrames();
  });

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
