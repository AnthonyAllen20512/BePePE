(function () {
  const C = window.BurnepepComponents;
  document.querySelector("[data-header]").innerHTML = C.renderHeader();
  document.querySelector("[data-page]").innerHTML = [C.renderHero(), C.renderManifesto(), C.renderToken(), C.renderCommunity(), C.renderRoadmap(), C.renderCta(), C.renderFooter()].join("");

  const frames = [...document.querySelectorAll(".keyframe-frame")];
  const frameToggle = document.querySelector("[data-keyframe-toggle]");
  const frameCount = document.querySelector("[data-frame-count]");
  const frameScrubber = document.querySelector("[data-keyframe-scrubber]");
  const frameStage = document.querySelector("[data-keyframe-stage]");
  let frameIndex = 0;
  let frameDirection = 1;
  let isPlaying = true;
  let timer;
  let wasPlayingBeforeScrub = false;
  let isScrubbing = false;

  const showFrame = (index) => {
    frameIndex = Math.max(0, Math.min(frames.length - 1, index));
    frames.forEach((frame, current) => frame.classList.toggle("is-active", current === frameIndex));
    if (frameScrubber) frameScrubber.value = String(frameIndex);
    if (frameCount) frameCount.textContent = `${String(frameIndex + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`;
  };
  const updateToggle = () => {
    if (!frameToggle) return;
    frameToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    frameToggle.setAttribute("aria-label", isPlaying ? "Pause keyframe animation" : "Play keyframe animation");
  };
  const stopFrames = () => {
    window.clearInterval(timer);
    timer = undefined;
  };
  const pauseFrames = () => {
    isPlaying = false;
    stopFrames();
    updateToggle();
  };
  const startFrames = () => {
    stopFrames();
    isPlaying = true;
    updateToggle();
    timer = window.setInterval(() => {
      // Ping-pong through the supplied keyframes so the loop never makes a harsh 08 → 01 jump.
      if (frameIndex >= frames.length - 1) frameDirection = -1;
      if (frameIndex <= 0) frameDirection = 1;
      showFrame(frameIndex + frameDirection);
    }, 750);
  };

  showFrame(0);
  startFrames();
  frameToggle?.addEventListener("click", () => {
    if (isPlaying) pauseFrames();
    else {
      if (frameIndex >= frames.length - 1) frameDirection = -1;
      if (frameIndex <= 0) frameDirection = 1;
      startFrames();
    }
  });

  frameScrubber?.addEventListener("input", () => {
    pauseFrames();
    showFrame(Number(frameScrubber.value));
  });

  const updateFromPointer = (event) => {
    const rect = frameStage.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    showFrame(Math.round(progress * (frames.length - 1)));
  };

  frameStage?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, input")) return;
    wasPlayingBeforeScrub = isPlaying;
    isScrubbing = true;
    pauseFrames();
    frameStage.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  });
  frameStage?.addEventListener("pointermove", (event) => { if (isScrubbing) updateFromPointer(event); });
  frameStage?.addEventListener("pointerup", (event) => {
    if (!isScrubbing) return;
    isScrubbing = false;
    frameStage.releasePointerCapture(event.pointerId);
    if (wasPlayingBeforeScrub) {
      if (frameIndex >= frames.length - 1) frameDirection = -1;
      if (frameIndex <= 0) frameDirection = 1;
      startFrames();
    }
  });

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
