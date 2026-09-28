(function () {
  const C = window.BurnepepComponents;
  document.querySelector("[data-header]").innerHTML = C.renderHeader();
  document.querySelector("[data-page]").innerHTML = [C.renderHero(), C.renderManifesto(), C.renderToken(), C.renderCommunity(), C.renderRoadmap(), C.renderCta(), C.renderFooter()].join("");

  const stage = document.querySelector("[data-sequence-stage]");
  const canvas = document.querySelector("[data-sequence-canvas]");
  const frameToggle = document.querySelector("[data-keyframe-toggle]");
  const frameCount = document.querySelector("[data-frame-count]");
  const frameScrubber = document.querySelector("[data-keyframe-scrubber]");

  if (stage && canvas) {
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    const totalFrames = Number(stage.dataset.sequenceTotal);
    const framePrefix = stage.dataset.framePrefix;
    const frameExtension = stage.dataset.frameExtension;
    const frameDigits = Number(stage.dataset.frameDigits);
    const sourceFps = Number(stage.dataset.frameFps);
    const lastFrame = totalFrames - 1;
    const images = new Array(totalFrames);
    const loadingFrames = new Map();
    let targetFrame = 0;
    let easedFrame = 0;
    let paintedFrame = -1;
    let frameDirection = 1;
    let isPlaying = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isScrubbing = false;
    let wasPlayingBeforeScrub = false;
    let lastTick = performance.now();

    const clampFrame = (frame) => Math.max(0, Math.min(lastFrame, frame));
    const frameSource = (index) => `${framePrefix}${String(index + 1).padStart(frameDigits, "0")}${frameExtension}`;
    const visibleFrame = () => Math.round(clampFrame(easedFrame));

    const updateControls = (index = visibleFrame()) => {
      if (frameScrubber) frameScrubber.value = String(index);
      if (frameCount) frameCount.textContent = `${String(index + 1).padStart(3, "0")} / ${String(totalFrames).padStart(3, "0")}`;
      if (!frameToggle) return;
      frameToggle.textContent = isPlaying ? "Ⅱ" : "▶";
      frameToggle.setAttribute("aria-label", isPlaying ? "Pause video sequence" : "Play video sequence");
    };

    const loadFrame = (index) => {
      const frame = Math.round(clampFrame(index));
      if (images[frame]) return Promise.resolve(images[frame]);
      if (loadingFrames.has(frame)) return loadingFrames.get(frame);
      const image = new Image();
      image.decoding = "async";
      const pending = new Promise((resolve, reject) => {
        image.onload = () => {
          images[frame] = image;
          loadingFrames.delete(frame);
          resolve(image);
        };
        image.onerror = () => {
          loadingFrames.delete(frame);
          reject(new Error(`Could not load video frame ${frame + 1}`));
        };
      });
      loadingFrames.set(frame, pending);
      image.src = frameSource(frame);
      return pending;
    };

    const preloadAround = (center) => {
      for (let offset = -14; offset <= 14; offset += 1) {
        const index = Math.round(center + offset);
        if (index >= 0 && index <= lastFrame) loadFrame(index).catch(() => {});
      }
    };

    const paintFrame = (index) => {
      const image = images[index];
      if (!image || !context) {
        loadFrame(index).then(() => {
          if (index === visibleFrame()) paintFrame(index);
        }).catch(() => {});
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(bounds.width * pixelRatio);
      const height = Math.round(bounds.height * pixelRatio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (bounds.width - drawWidth) / 2, (bounds.height - drawHeight) / 2, drawWidth, drawHeight);
      paintedFrame = index;
      stage.classList.add("is-ready");
    };

    const setTargetFrame = (frame, immediate = false) => {
      targetFrame = clampFrame(frame);
      if (immediate) easedFrame = targetFrame;
      preloadAround(targetFrame);
    };

    const pauseSequence = () => {
      isPlaying = false;
      updateControls();
    };

    const playSequence = () => {
      if (targetFrame >= lastFrame) frameDirection = -1;
      if (targetFrame <= 0) frameDirection = 1;
      isPlaying = true;
      updateControls();
    };

    const animate = (timestamp) => {
      const elapsed = Math.min((timestamp - lastTick) / 1000, 0.08);
      lastTick = timestamp;
      if (isPlaying && !isScrubbing) {
        targetFrame += frameDirection * sourceFps * elapsed;
        if (targetFrame >= lastFrame) {
          targetFrame = lastFrame;
          frameDirection = -1;
        } else if (targetFrame <= 0) {
          targetFrame = 0;
          frameDirection = 1;
        }
      }
      const distance = targetFrame - easedFrame;
      if (Math.abs(distance) > 0.015) easedFrame += distance * (isScrubbing ? 0.42 : 0.2);
      else easedFrame = targetFrame;
      const frame = visibleFrame();
      if (frame !== paintedFrame) paintFrame(frame);
      updateControls(frame);
      window.requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      paintedFrame = -1;
      paintFrame(visibleFrame());
    };

    loadFrame(0).then(() => {
      paintFrame(0);
      preloadAround(0);
      const queue = (start) => {
        window.setTimeout(() => {
          const batch = [];
          for (let index = start; index < Math.min(start + 6, totalFrames); index += 1) batch.push(loadFrame(index));
          Promise.allSettled(batch).finally(() => {
            if (start + 6 < totalFrames) queue(start + 6);
          });
        }, 80);
      };
      queue(15);
    }).catch(() => {});
    new ResizeObserver(resizeCanvas).observe(stage);
    updateControls(0);
    window.requestAnimationFrame(animate);

    frameToggle?.addEventListener("click", () => {
      if (isPlaying) pauseSequence();
      else playSequence();
    });

    frameScrubber?.addEventListener("input", () => {
      pauseSequence();
      setTargetFrame(Number(frameScrubber.value), true);
    });

    const updateFromPointer = (event, startFrame, startX) => {
      const bounds = stage.getBoundingClientRect();
      const travelled = (event.clientX - startX) / bounds.width;
      setTargetFrame(startFrame + travelled * lastFrame, true);
    };

    let dragStartFrame = 0;
    let dragStartX = 0;
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, input")) return;
      wasPlayingBeforeScrub = isPlaying;
      isScrubbing = true;
      pauseSequence();
      dragStartFrame = targetFrame;
      dragStartX = event.clientX;
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", (event) => {
      if (isScrubbing) updateFromPointer(event, dragStartFrame, dragStartX);
    });
    stage.addEventListener("pointerup", (event) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      stage.releasePointerCapture(event.pointerId);
      if (wasPlayingBeforeScrub) playSequence();
    });
    stage.addEventListener("wheel", (event) => {
      event.preventDefault();
      pauseSequence();
      const multiplier = event.deltaMode === 1 ? 1.8 : 0.022;
      setTargetFrame(targetFrame + event.deltaY * multiplier);
    }, { passive: false });
  }

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
