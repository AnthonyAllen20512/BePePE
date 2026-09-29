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
    let gravityX = 0;
    let gravityY = 0;
    let motionEnabled = false;
    let pointerActive = false;
    let frameMomentum = 0;
    let resumeAfterMomentum = false;
    let lastDragFrame = 0;
    let lastDragTime = 0;
    let pulseTimeout;
    let lastPreloadCenter = -Infinity;
    const supportsDeviceMotion = "DeviceOrientationEvent" in window || "DeviceMotionEvent" in window;

    const clampFrame = (frame) => Math.max(0, Math.min(lastFrame, frame));
    const clampUnit = (value) => Math.max(-1, Math.min(1, value));
    const clampMomentum = (value) => Math.max(-90, Math.min(90, value));
    const frameSource = (index) => `${framePrefix}${String(index + 1).padStart(frameDigits, "0")}${frameExtension}`;
    const visibleFrame = () => Math.round(clampFrame(easedFrame));

    const updateSceneDepth = () => {
      const sceneX = pointerX * 17 + tiltX * 15 + gravityX * 7;
      const sceneY = pointerY * 11 + tiltY * 11 + gravityY * 6;
      stage.style.setProperty("--scene-x", `${sceneX.toFixed(2)}px`);
      stage.style.setProperty("--scene-y", `${sceneY.toFixed(2)}px`);
      stage.style.setProperty("--scene-rotate", `${(pointerX * 0.38 + tiltX * 0.32 + gravityX * 0.18).toFixed(3)}deg`);
      stage.style.setProperty("--debris-x", `${(-pointerX * 31 - tiltX * 24 - gravityX * 12).toFixed(2)}px`);
      stage.style.setProperty("--debris-y", `${(-pointerY * 21 - tiltY * 17 - gravityY * 9).toFixed(2)}px`);
      stage.style.setProperty("--debris-rotate", `${(-pointerX * 1.15 - tiltX * 0.78 - gravityX * 0.42).toFixed(3)}deg`);
      stage.style.setProperty("--particle-field-x", `${(-pointerX * 10 + tiltX * 9 + gravityX * 5).toFixed(2)}px`);
      stage.style.setProperty("--particle-field-y", `${(-pointerY * 8 + tiltY * 7 + gravityY * 4).toFixed(2)}px`);
      stage.style.setProperty("--spotlight-x", `${(50 + pointerX * 34 + tiltX * 9 + gravityX * 4).toFixed(2)}%`);
      stage.style.setProperty("--spotlight-y", `${(50 + pointerY * 34 + tiltY * 8 + gravityY * 4).toFixed(2)}%`);
      stage.style.setProperty("--pulse-x", `${(50 + pointerX * 34).toFixed(2)}%`);
      stage.style.setProperty("--pulse-y", `${(50 + pointerY * 34).toFixed(2)}%`);
    };

    const updateMotionToggle = () => {
      if (!motionToggle) return;
      motionToggle.textContent = motionEnabled ? "GYRO ON" : "GYRO";
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
      if (!isScrubbing && Math.abs(frameMomentum) > 0.05) {
        targetFrame = clampFrame(targetFrame + frameMomentum * elapsed);
        frameMomentum *= Math.exp(-4.4 * elapsed);
      } else if (!isScrubbing && resumeAfterMomentum) {
        resumeAfterMomentum = false;
        playSequence();
      }
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
      const nextTiltX = clampUnit((Number(event.gamma) || 0) / 32);
      const nextTiltY = clampUnit((Number(event.beta) || 0) / 36);
      tiltX += (nextTiltX - tiltX) * 0.16;
      tiltY += (nextTiltY - tiltY) * 0.16;
      updateSceneDepth();
    };

    const handleDeviceMotion = (event) => {
      if (!motionEnabled || !event.accelerationIncludingGravity) return;
      const acceleration = event.accelerationIncludingGravity;
      const nextGravityX = clampUnit((Number(acceleration.x) || 0) / 9.8);
      const nextGravityY = clampUnit((Number(acceleration.y) || 0) / 9.8);
      gravityX += (nextGravityX - gravityX) * 0.1;
      gravityY += (nextGravityY - gravityY) * 0.1;
      updateSceneDepth();
    };

    const setMotionEnabled = (enabled) => {
      motionEnabled = enabled;
      if (enabled) {
        window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
        window.addEventListener("devicemotion", handleDeviceMotion, { passive: true });
        stage.classList.add("is-gravity-on");
      }
      else {
        window.removeEventListener("deviceorientation", handleDeviceOrientation);
        window.removeEventListener("devicemotion", handleDeviceMotion);
        tiltX = 0;
        tiltY = 0;
        gravityX = 0;
        gravityY = 0;
        stage.classList.remove("is-gravity-on");
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
            const permissionRequests = [window.DeviceOrientationEvent, window.DeviceMotionEvent]
              .map((eventInterface) => ({ eventInterface, requestPermission: eventInterface?.requestPermission }))
              .filter(({ requestPermission }) => typeof requestPermission === "function")
              .map(({ eventInterface, requestPermission }) => requestPermission.call(eventInterface));
            if (permissionRequests.length) {
              const permissions = await Promise.all(permissionRequests);
              if (permissions.some((permission) => permission !== "granted")) return;
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
      frameMomentum = 0;
      resumeAfterMomentum = false;
      setTargetFrame(Number(frameScrubber.value), true);
    });

    const triggerScenePulse = () => {
      stage.classList.remove("is-pulsing");
      window.requestAnimationFrame(() => stage.classList.add("is-pulsing"));
      window.clearTimeout(pulseTimeout);
      pulseTimeout = window.setTimeout(() => stage.classList.remove("is-pulsing"), 760);
    };

    const updateFromPointer = (event, startFrame, startX) => {
      const bounds = stage.getBoundingClientRect();
      const travelled = (event.clientX - startX) / bounds.width;
      const previousFrame = targetFrame;
      setTargetFrame(startFrame + travelled * lastFrame, true);
      const now = performance.now();
      if (lastDragTime) {
        const elapsed = Math.max(12, now - lastDragTime);
        frameMomentum = clampMomentum(((targetFrame - previousFrame) / elapsed) * 1000);
      }
      lastDragFrame = targetFrame;
      lastDragTime = now;
    };

    const updatePointerDepth = (event) => {
      if (event.pointerType === "touch") return;
      const bounds = stage.getBoundingClientRect();
      pointerX = clampUnit(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
      pointerY = clampUnit(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
      pointerActive = true;
      stage.classList.add("is-pointer-active");
      updateSceneDepth();
    };

    let dragStartFrame = 0;
    let dragStartX = 0;
    stage.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, input")) return;
      wasPlayingBeforeScrub = isPlaying;
      isScrubbing = true;
      pauseSequence();
      frameMomentum = 0;
      resumeAfterMomentum = false;
      dragStartFrame = targetFrame;
      dragStartX = event.clientX;
      lastDragFrame = targetFrame;
      lastDragTime = performance.now();
      updatePointerDepth(event);
      triggerScenePulse();
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
      resumeAfterMomentum = wasPlayingBeforeScrub && Math.abs(frameMomentum) > 3;
      if (wasPlayingBeforeScrub && !resumeAfterMomentum) playSequence();
    });
    stage.addEventListener("pointerleave", () => {
      if (isScrubbing) return;
      pointerX = 0;
      pointerY = 0;
      pointerActive = false;
      stage.classList.remove("is-pointer-active");
      updateSceneDepth();
    });
    stage.addEventListener("pointercancel", (event) => {
      if (!isScrubbing) return;
      isScrubbing = false;
      stage.releasePointerCapture(event.pointerId);
      frameMomentum = 0;
      if (wasPlayingBeforeScrub) playSequence();
    });
    stage.addEventListener("wheel", (event) => {
      event.preventDefault();
      pauseSequence();
      resumeAfterMomentum = false;
      const multiplier = event.deltaMode === 1 ? 1.8 : 0.022;
      const velocityMultiplier = event.deltaMode === 1 ? 2.4 : 0.085;
      frameMomentum = clampMomentum(frameMomentum + event.deltaY * velocityMultiplier);
      setTargetFrame(targetFrame + event.deltaY * multiplier);
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target?.isContentEditable) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (isPlaying) pauseSequence();
        else playSequence();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        pauseSequence();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        frameMomentum = clampMomentum(frameMomentum + direction * 26);
        setTargetFrame(targetFrame + direction * 9);
      }
    });
  }

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
