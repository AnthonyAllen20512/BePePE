(function () {
  const C = window.BurnepepComponents;
  document.querySelector("[data-header]").innerHTML = C.renderHeader();
  document.querySelector("[data-page]").innerHTML = [C.renderHero(), C.renderManifesto(), C.renderToken(), C.renderCommunity(), C.renderRoadmap(), C.renderCta(), C.renderFooter()].join("");

  const stage = document.querySelector("[data-sequence-stage]");
  const canvas = document.querySelector("[data-sequence-canvas]");
  const frameToggle = document.querySelector("[data-keyframe-toggle]");
  const frameCount = document.querySelector("[data-frame-count]");
  const frameScrubber = document.querySelector("[data-keyframe-scrubber]");
  const motionToggle = document.querySelector("[data-motion-toggle]");

  if (stage && canvas) {
    const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
    const totalFrames = Number(stage.dataset.sequenceTotal);
    const framePrefix = stage.dataset.framePrefix;
    const frameExtension = stage.dataset.frameExtension;
    const frameDigits = Number(stage.dataset.frameDigits);
    const sourceFps = Number(stage.dataset.frameFps);
    const lastFrame = totalFrames - 1;
    const images = new Map();
    const loadingFrames = new Map();
    let targetFrame = 0;
    let easedFrame = 0;
    let paintedFrame = -1;
    let isPlaying = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isScrubbing = false;
    let wasPlayingBeforeScrub = false;
    let lastTick = performance.now();
    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let motionEnabled = false;
    let lastPreloadCenter = -Infinity;
    const supportsDeviceMotion = "DeviceOrientationEvent" in window;

    const clampFrame = (frame) => Math.max(0, Math.min(lastFrame, frame));
    const clampUnit = (value) => Math.max(-1, Math.min(1, value));
    const frameSource = (index) => `${framePrefix}${String(index + 1).padStart(frameDigits, "0")}${frameExtension}`;
    const visibleFrame = () => Math.round(clampFrame(easedFrame));

    const updateSceneDepth = () => {
      const sceneX = pointerX * 15 + tiltX * 11;
      const sceneY = pointerY * 10 + tiltY * 8;
      stage.style.setProperty("--scene-x", `${sceneX.toFixed(2)}px`);
      stage.style.setProperty("--scene-y", `${sceneY.toFixed(2)}px`);
      stage.style.setProperty("--scene-rotate", `${(pointerX * 0.3 + tiltX * 0.22).toFixed(3)}deg`);
      stage.style.setProperty("--debris-x", `${(-pointerX * 27 - tiltX * 20).toFixed(2)}px`);
      stage.style.setProperty("--debris-y", `${(-pointerY * 18 - tiltY * 13).toFixed(2)}px`);
      stage.style.setProperty("--debris-rotate", `${(-pointerX * 0.9 - tiltX * 0.55).toFixed(3)}deg`);
    };

    const updateMotionToggle = () => {
      if (!motionToggle) return;
      motionToggle.textContent = motionEnabled ? "TILT ON" : "TILT";
      motionToggle.setAttribute("aria-pressed", String(motionEnabled));
      motionToggle.setAttribute("aria-label", motionEnabled ? "Disable device tilt" : "Enable device tilt");
    };

    const updateControls = (index = visibleFrame()) => {
      if (frameScrubber) frameScrubber.value = String(index);
      if (frameCount) frameCount.textContent = `${String(index + 1).padStart(3, "0")} / ${String(totalFrames).padStart(3, "0")}`;
      if (!frameToggle) return;
      frameToggle.textContent = isPlaying ? "Ⅱ" : "▶";
      frameToggle.setAttribute("aria-label", isPlaying ? "Pause video sequence" : "Play video sequence");
    };

    const loadFrame = (index) => {
      const frame = Math.round(clampFrame(index));
      if (images.has(frame)) return Promise.resolve(images.get(frame));
      if (loadingFrames.has(frame)) return loadingFrames.get(frame);
      const image = new Image();
      image.decoding = "async";
      const pending = new Promise((resolve, reject) => {
        image.onload = () => {
          images.set(frame, image);
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
      const roundedCenter = Math.round(center);
      for (let offset = -12; offset <= 38; offset += 1) {
        const index = Math.round(center + offset);
        if (index >= 0 && index <= lastFrame) loadFrame(index).catch(() => {});
      }
      for (const index of images.keys()) {
        if (Math.abs(index - roundedCenter) > 52) images.delete(index);
      }
      lastPreloadCenter = roundedCenter;
    };

    const paintFrame = (index) => {
      const image = images.get(index);
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
      if (targetFrame >= lastFrame) {
        targetFrame = 0;
        easedFrame = 0;
        paintedFrame = -1;
      }
      isPlaying = true;
      updateControls();
    };

    const animate = (timestamp) => {
      const elapsed = Math.min((timestamp - lastTick) / 1000, 0.08);
      lastTick = timestamp;
      if (isPlaying && !isScrubbing) {
        targetFrame += sourceFps * elapsed;
        if (targetFrame >= lastFrame) {
          targetFrame = lastFrame;
          isPlaying = false;
          updateControls();
        }
      }
      if (Math.abs(targetFrame - lastPreloadCenter) >= 3) preloadAround(targetFrame);
      const distance = targetFrame - easedFrame;
      const smoothing = 1 - Math.exp(-elapsed * (isScrubbing ? 19 : 12));
      if (Math.abs(distance) > 0.015) easedFrame += distance * smoothing;
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
    }).catch(() => {});
    new ResizeObserver(resizeCanvas).observe(stage);
    updateControls(0);
    updateSceneDepth();
    window.requestAnimationFrame(animate);

    const handleDeviceOrientation = (event) => {
      if (!motionEnabled) return;
      tiltX = clampUnit((Number(event.gamma) || 0) / 32);
      tiltY = clampUnit((Number(event.beta) || 0) / 36);
      updateSceneDepth();
    };

    const setMotionEnabled = (enabled) => {
      motionEnabled = enabled;
      if (enabled) window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
      else {
        window.removeEventListener("deviceorientation", handleDeviceOrientation);
        tiltX = 0;
        tiltY = 0;
      }
      updateSceneDepth();
      updateMotionToggle();
    };

    if (motionToggle) {
      if (!supportsDeviceMotion) motionToggle.hidden = true;
      else {
        updateMotionToggle();
        motionToggle.addEventListener("click", async () => {
          if (motionEnabled) {
            setMotionEnabled(false);
            return;
          }
          try {
            const requestPermission = window.DeviceOrientationEvent?.requestPermission;
            if (typeof requestPermission === "function") {
              const permission = await requestPermission.call(window.DeviceOrientationEvent);
              if (permission !== "granted") return;
            }
            setMotionEnabled(true);
          } catch {
            setMotionEnabled(false);
          }
        });
      }
    }

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

    const updatePointerDepth = (event) => {
      if (event.pointerType === "touch") return;
      const bounds = stage.getBoundingClientRect();
      pointerX = clampUnit(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
      pointerY = clampUnit(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
      updateSceneDepth();
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
      updatePointerDepth(event);
      if (isScrubbing) updateFromPointer(event, dragStartFrame, dragStartX);
    });
    stage.addEventListener("pointerup", (event) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      stage.releasePointerCapture(event.pointerId);
      if (wasPlayingBeforeScrub) playSequence();
    });
    stage.addEventListener("pointerleave", () => {
      if (isScrubbing) return;
      pointerX = 0;
      pointerY = 0;
      updateSceneDepth();
    });
    stage.addEventListener("pointercancel", (event) => {
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
