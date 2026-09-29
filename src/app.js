/* Plain browser script: works when index.html is opened directly from the filesystem. */
(function () {
  const sections = window.BurnepepPageSections;
  if (!sections) return;

  const header = document.querySelector("[data-header]");
  const page = document.querySelector("[data-page]");
  header.innerHTML = sections.renderSiteHeader();
  page.innerHTML = [
    sections.renderHeroSection(),
    sections.renderManifestoSection(),
    sections.renderTokenHighlightsSection(),
    sections.renderCommunitySection(),
    sections.renderArchiveSection(),
    sections.renderRoadmapSection(),
    sections.renderCallToActionSection(),
    sections.renderSiteFooter(),
  ].join("");

  const motionScene = document.querySelector("[data-motion-scene]");
  const heroStage = document.querySelector("[data-sequence-stage]");
  const heroCanvas = document.querySelector("[data-sequence-canvas]");

  if (motionScene && heroStage && heroCanvas) {
    const canvasContext = heroCanvas.getContext("2d", { alpha: false, desynchronized: true });
    const totalFrames = Number(heroStage.dataset.sequenceTotal);
    const finalFrameIndex = totalFrames - 1;
    const framePrefix = heroStage.dataset.framePrefix;
    const frameExtension = heroStage.dataset.frameExtension;
    const frameDigits = Number(heroStage.dataset.frameDigits);
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cachedFrames = new Map();
    const pendingFrameLoads = new Map();
    const maxCachedFrames = 24;

    let targetProgress = 0;
    let renderedProgress = 0;
    let renderedFrameIndex = -1;
    let animationFrameId = 0;
    let lastRenderTime = 0;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;

    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const clampProgress = (value) => clamp(value, 0, 1);
    const clampFrameIndex = (value) => clamp(value, 0, finalFrameIndex);
    const getFramePath = (frameIndex) => `${framePrefix}${String(frameIndex + 1).padStart(frameDigits, "0")}${frameExtension}`;
    const getCurrentFrameIndex = () => Math.round(clampFrameIndex(renderedProgress * finalFrameIndex));

    function loadFrame(frameIndex) {
      const safeFrameIndex = Math.round(clampFrameIndex(frameIndex));
      if (cachedFrames.has(safeFrameIndex)) return Promise.resolve(cachedFrames.get(safeFrameIndex));
      if (pendingFrameLoads.has(safeFrameIndex)) return pendingFrameLoads.get(safeFrameIndex);

      const image = new Image();
      image.decoding = "async";
      const pendingLoad = new Promise((resolve, reject) => {
        image.onload = () => {
          cachedFrames.set(safeFrameIndex, image);
          pendingFrameLoads.delete(safeFrameIndex);
          requestRender();
          resolve(image);
        };
        image.onerror = () => {
          pendingFrameLoads.delete(safeFrameIndex);
          reject(new Error(`Unable to load hero frame ${safeFrameIndex + 1}.`));
        };
      });

      pendingFrameLoads.set(safeFrameIndex, pendingLoad);
      image.src = getFramePath(safeFrameIndex);
      return pendingLoad;
    }

    function preloadFramesNear(frameIndex) {
      const centerFrame = Math.round(clampFrameIndex(frameIndex));
      for (let offset = -6; offset <= 12; offset += 1) {
        const candidate = centerFrame + offset;
        if (candidate >= 0 && candidate <= finalFrameIndex) loadFrame(candidate).catch(() => {});
      }

      if (cachedFrames.size <= maxCachedFrames) return;
      [...cachedFrames.keys()]
        .sort((left, right) => Math.abs(left - centerFrame) - Math.abs(right - centerFrame))
        .slice(maxCachedFrames)
        .forEach((frameIndexToDiscard) => cachedFrames.delete(frameIndexToDiscard));
    }

    function findClosestLoadedFrame(frameIndex) {
      const safeFrameIndex = Math.round(clampFrameIndex(frameIndex));
      if (cachedFrames.has(safeFrameIndex)) {
        return { frameIndex: safeFrameIndex, image: cachedFrames.get(safeFrameIndex) };
      }

      for (let distance = 1; distance < totalFrames; distance += 1) {
        const before = safeFrameIndex - distance;
        const after = safeFrameIndex + distance;
        if (cachedFrames.has(before)) return { frameIndex: before, image: cachedFrames.get(before) };
        if (cachedFrames.has(after)) return { frameIndex: after, image: cachedFrames.get(after) };
      }

      return null;
    }

    function drawFrame(frameIndex) {
      const availableFrame = findClosestLoadedFrame(frameIndex);
      if (!availableFrame || !canvasContext) {
        loadFrame(frameIndex).catch(() => {});
        return;
      }

      const bounds = heroCanvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const canvasWidth = Math.round(bounds.width * devicePixelRatio);
      const canvasHeight = Math.round(bounds.height * devicePixelRatio);
      if (heroCanvas.width !== canvasWidth || heroCanvas.height !== canvasHeight) {
        heroCanvas.width = canvasWidth;
        heroCanvas.height = canvasHeight;
      }

      canvasContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      canvasContext.fillStyle = "#0a0a08";
      canvasContext.fillRect(0, 0, bounds.width, bounds.height);

      const scale = Math.min(bounds.width / availableFrame.image.naturalWidth, bounds.height / availableFrame.image.naturalHeight);
      const drawWidth = availableFrame.image.naturalWidth * scale;
      const drawHeight = availableFrame.image.naturalHeight * scale;
      canvasContext.drawImage(availableFrame.image, (bounds.width - drawWidth) / 2, (bounds.height - drawHeight) / 2, drawWidth, drawHeight);

      renderedFrameIndex = availableFrame.frameIndex;
      heroStage.classList.add("is-ready");
    }

    function updateSceneTransform() {
      const sceneScale = 1.006 + renderedProgress * 0.032;
      heroStage.style.setProperty("--scene-x", `${(pointerOffsetX * 9).toFixed(2)}px`);
      heroStage.style.setProperty("--scene-y", `${(pointerOffsetY * 7).toFixed(2)}px`);
      heroStage.style.setProperty("--scene-rotate", `${(pointerOffsetX * 0.16).toFixed(3)}deg`);
      heroStage.style.setProperty("--scene-scale", sceneScale.toFixed(4));
      heroStage.style.setProperty("--scroll-progress", renderedProgress.toFixed(4));
      heroStage.style.setProperty("--ember-opacity", (0.1 + renderedProgress * 0.24).toFixed(3));
    }

    function requestRender() {
      if (!animationFrameId) animationFrameId = window.requestAnimationFrame(render);
    }

    function render(timestamp) {
      animationFrameId = 0;
      const elapsedSeconds = lastRenderTime ? Math.min((timestamp - lastRenderTime) / 1000, 0.05) : 0;
      lastRenderTime = timestamp;
      const smoothing = 1 - Math.exp(-12 * elapsedSeconds);
      renderedProgress += (targetProgress - renderedProgress) * smoothing;

      if (Math.abs(targetProgress - renderedProgress) < 0.0005) {
        renderedProgress = targetProgress;
      }

      const frameIndex = getCurrentFrameIndex();
      if (frameIndex !== renderedFrameIndex) drawFrame(frameIndex);
      preloadFramesNear(frameIndex);
      updateSceneTransform();

      if (Math.abs(targetProgress - renderedProgress) >= 0.0005) requestRender();
    }

    function setSequenceProgress(nextProgress) {
      targetProgress = reducedMotionQuery.matches ? 0 : clampProgress(nextProgress);
      requestRender();
    }

    function scrubSequenceWithWheel(event) {
      if (reducedMotionQuery.matches || !event.deltaY) return;

      const pixelDelta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 16 : event.deltaY;
      const direction = Math.sign(pixelDelta);
      const isAtStart = targetProgress <= 0.001 && renderedProgress <= 0.001;
      const isAtEnd = targetProgress >= 0.999 && renderedProgress >= 0.999;

      if ((direction < 0 && isAtStart) || (direction > 0 && isAtEnd)) return;

      event.preventDefault();
      const progressDelta = clamp(pixelDelta / 1450, -0.07, 0.07);
      setSequenceProgress(targetProgress + progressDelta);
    }

    function updatePointerParallax(event) {
      if (event.pointerType === "touch") return;
      const bounds = heroStage.getBoundingClientRect();
      pointerOffsetX = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1);
      pointerOffsetY = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1);
      requestRender();
    }

    loadFrame(0).then(() => {
      drawFrame(0);
      preloadFramesNear(0);
    }).catch(() => {});

    window.addEventListener("resize", requestRender, { passive: true });
    reducedMotionQuery.addEventListener?.("change", () => setSequenceProgress(targetProgress));

    new ResizeObserver(() => {
      renderedFrameIndex = -1;
      drawFrame(getCurrentFrameIndex());
    }).observe(heroStage);

    heroStage.addEventListener("pointermove", updatePointerParallax);
    heroStage.addEventListener("wheel", scrubSequenceWithWheel, { passive: false });
    heroStage.addEventListener("pointerleave", () => {
      pointerOffsetX = 0;
      pointerOffsetY = 0;
      requestRender();
    });

    requestRender();
  }

  const toast = document.querySelector("[data-toast]");
  document.querySelectorAll("[data-pending]").forEach((button) => button.addEventListener("click", () => {
    toast.textContent = "Official link coming soon.";
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }));
})();
