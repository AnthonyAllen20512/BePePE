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
  let isPlaying = true;
  let timer;
  let wasPlayingBeforeScrub = false;
  let isScrubbing = false;

  const showFrame = (index) => {
    frames.forEach((frame, current) => frame.classList.toggle("is-active", current === index));
    if (frameScrubber) frameScrubber.value = String(index);
    frameCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(frames.length).padStart(2, "0")}`;
  };
  const startFrames = () => {
    window.clearInterval(timer);
    if (!isPlaying || frames.length < 2) return;
    timer = window.setInterval(() => { frameIndex = (frameIndex + 1) % frames.length; showFrame(frameIndex); }, 100);
  };

  const setFrame = (index) => {
    frameIndex = Math.max(0, Math.min(frames.length - 1, index));
    frameScrubber.value = String(frameIndex);
    showFrame(frameIndex);
  };

  const pauseFrames = () => {
    isPlaying = false;
    frameToggle.textContent = "▶";
    frameToggle.setAttribute("aria-label", "Play keyframe animation");
    startFrames();
  };

  startFrames();
  frameToggle?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    frameToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    frameToggle.setAttribute("aria-label", isPlaying ? "Pause keyframe animation" : "Play keyframe animation");
    startFrames();
  });

  frameScrubber?.addEventListener("input", () => {
    pauseFrames();
    setFrame(Number(frameScrubber.value));
  });

  const updateFromPointer = (event) => {
    const rect = frameStage.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setFrame(Math.round(progress * (frames.length - 1)));
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
      isPlaying = true;
      frameToggle.textContent = "Ⅱ";
      frameToggle.setAttribute("aria-label", "Pause keyframe animation");
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
