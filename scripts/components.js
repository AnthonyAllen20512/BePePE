(function () {
  const A = window.BurnepepAssets;
  const img = (src, alt, className = "") => `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
  const divider = (src) => `<div class="section-divider" aria-hidden="true" style="--divider:url('${src}')"></div>`;
  const button = (label, href = "#community", className = "") => `<a class="ink-button ${className}" href="${href}">${label}<span aria-hidden="true">→</span></a>`;

  function renderHeader() {
    const social = A.shared.socials;
    return `
      <div class="header-inner page-width">
        <a class="brand-link" href="#home" aria-label="BURNEPEP home">${img(A.shared.brand, "BURNEPEP")}</a>
        <nav class="main-nav" aria-label="Primary navigation">
          <a href="#manifesto">Manifesto</a><a href="#token">Token</a><a href="#community">Community</a><a href="#roadmap">Roadmap</a><a href="#gallery">Gallery</a>
        </nav>
        <div class="header-actions">
          <div class="social-icons" aria-label="Social links">
            <a href="https://x.com/bepep_bsc" target="_blank" rel="noreferrer" aria-label="X">${img(social.x, "")}</a><a href="https://t.me/BEPEP_BSC" target="_blank" rel="noreferrer" aria-label="Telegram">${img(social.telegram, "")}</a>
          </div>
          ${button("ENTER THE BURN", "#burn", "header-cta")}
        </div>
      </div>`;
  }

  function renderHero() {
    const sequence = A.hero.sequence;
    const firstFrame = `${sequence.prefix}${String(1).padStart(sequence.digits, "0")}${sequence.extension}`;
    const particles = [
      [8, 18, 4, 12, 0], [16, 73, 3, 17, -600], [27, 28, 5, 14, -1900], [38, 82, 3, 18, -850],
      [53, 16, 4, 16, -1300], [65, 71, 3, 13, -2400], [74, 30, 5, 19, -500], [88, 17, 3, 15, -1600],
      [92, 66, 4, 18, -1000], [45, 48, 2, 12, -2100], [5, 48, 2, 20, -300], [83, 88, 2, 15, -2700],
    ].map(([x, y, size, duration, delay]) => `<i class="scene-particle" style="--particle-x:${x}%;--particle-y:${y}%;--particle-size:${size}px;--particle-duration:${duration}s;--particle-delay:${delay}ms"></i>`).join("");
    return `
      <section class="hero" id="home" aria-label="BURNEPEP animated introduction">
        <div class="keyframe-stage page-width" data-sequence-stage data-sequence-total="${sequence.frameCount}" data-frame-prefix="${sequence.prefix}" data-frame-extension="${sequence.extension}" data-frame-digits="${sequence.digits}" data-frame-fps="${sequence.fps}" aria-label="BURNEPEP hero animation. Use scroll or drag to explore the video.">
          <div class="sequence-media" data-sequence-media>
            <img class="sequence-fallback" src="${firstFrame}" alt="" fetchpriority="high" />
            <canvas class="sequence-canvas" data-sequence-canvas role="img" aria-label="BURNEPEP animated video sequence"></canvas>
          </div>
          <div class="scene-spotlight" aria-hidden="true"></div>
          <img class="sequence-debris" src="${A.hero.foregroundDebris}" alt="" aria-hidden="true" />
          <div class="scene-particle-field" aria-hidden="true">${particles}</div>
          <i class="scene-reticle" aria-hidden="true"></i>
          <i class="scene-pulse" aria-hidden="true"></i>
          <div class="keyframe-ui">
            <button class="keyframe-toggle" type="button" data-keyframe-toggle aria-label="Pause keyframe animation">Ⅱ</button>
            <button class="motion-toggle" type="button" data-motion-toggle aria-pressed="false">GYRO</button>
            <label class="keyframe-scrubber"><span>DRAG / WHEEL</span><input type="range" min="0" max="${sequence.frameCount - 1}" value="0" step="1" data-keyframe-scrubber aria-label="Video frame" /><b data-frame-count>001 / ${String(sequence.frameCount).padStart(3, "0")}</b></label>
          </div>
        </div>
      </section>`;
  }

  function renderManifesto() {
    return `
      <section class="paper-section manifesto" id="manifesto">
        <div class="manifesto-inner page-width">
          <div class="manifesto-copy">
            ${img(A.manifesto.title, "The BURNEPEP manifesto", "manifesto-title")}
            <div class="manifesto-statement">
              <p class="manifesto-kicker">THE NEW PERSPECTIVE</p>
              <p class="manifesto-lead"><strong>BURNEPEP</strong> is not just a meme.<br />It’s a new perspective.</p>
              <p class="manifesto-body">We flip the ordinary, burn the stale, and turn chaos into something brighter.</p>
            </div>
            ${img(A.manifesto.tagline, "Same frog. Brighter tomorrow.", "manifesto-tagline")}
          </div>
          <div class="manifesto-visual">
            ${img(A.manifesto.portrait, "Upside-down BURNEPEP character", "portrait")}
            ${img(A.manifesto.slogan, "Not a meme. A new beginning.", "manifesto-slogan")}
            ${img(A.manifesto.butterfly, "", "manifesto-butterfly")}
          </div>
        </div>
      </section>
      ${divider(A.texture.manifestoToken)}`;
  }

  function renderToken() {
    const cards = A.token.cards.map((card) => `
      <article class="token-card">
        <div class="token-art">${img(card.art, "", "token-art-image")}</div>
        <h3>${card.title}</h3><p>${card.body}</p>
      </article>`).join("");
    return `
      <section class="paper-section token" id="token">
        <div class="page-width">
          <div class="section-title-row">
            ${img(A.token.title, "Token highlights", "token-title")}
            ${img(A.token.tagline, "More than a token. A culture.", "token-tagline")}
          </div>
          <div class="token-grid">${cards}</div>
        </div>
      </section>
      ${divider(A.texture.tokenCommunity)}`;
  }

  function renderCommunity() {
    const rows = [
      ["x", "X / TWITTER", "Follow the movement", "https://x.com/bepep_bsc"], ["telegram", "TELEGRAM", "Chat with frens", "https://t.me/BEPEP_BSC"],
    ].map(([icon, title, caption, href]) => `<a class="social-row" href="${href}" target="_blank" rel="noreferrer">${img(A.community.socialIcons[icon], "")}<span><b>${title}</b><small>${caption}</small></span><i aria-hidden="true">→</i></a>`).join("");
    return `
      <section class="paper-section community" id="community">
        <div class="community-inner page-width">
          <div class="community-copy">
            ${img(A.community.title, "Community — people flip culture.", "community-title")}
            <p>BURNEPEP lives through its community. Artists, creators, holders and dreamers from around the world, all flipping the same narrative. Different perspectives. One movement.</p>
            ${button("JOIN OUR COMMUNITY", "#gallery")}
          </div>
          <div class="community-collage" id="gallery">
            ${img(A.community.collage, "BURNEPEP community collage")}
            ${img(A.community.sticker, "", "collage-sticker")}
          </div>
          <div class="social-panel" aria-label="Community channels">${rows}</div>
        </div>
      </section>
      ${divider(A.texture.communityRoadmap)}`;
  }

  function renderRoadmap() {
    const stages = [
      ["01", "IGNITE", ["Build the foundation.", "Grow the community.", "Spread the word."]],
      ["02", "FLIP", ["Expand the ecosystem.", "More utilities.", "More chaos."]],
      ["03", "BURN", ["Activate burn mechanics.", "Reduce supply.", "Increase momentum."]],
      ["04", "BEYOND", ["A brighter tomorrow.", "More than a meme.", "A lasting culture."]],
    ];
    return `
      <section class="paper-section roadmap" id="roadmap">
        <div class="roadmap-inner page-width">
          <div class="roadmap-intro">${img(A.roadmap.title, "Roadmap", "roadmap-title")}</div>
          <div class="roadmap-steps">
            ${stages.map(([number, title, lines], index) => `<article class="roadmap-card"><span>${number}</span><div class="roadmap-heading"><b>${title}</b>${img(A.roadmap.icons[index], "", "roadmap-icon")}</div><p>${lines.join("<br />")}</p></article>${index < 3 ? `<div class="roadmap-connector" aria-hidden="true">${img(A.roadmap.arrows[index], "", "roadmap-arrow")}</div>` : ""}`).join("")}
          </div>
        </div>
      </section>
      ${divider(A.texture.roadmapCta)}`;
  }

  function renderCta() {
    return `
      <section class="bottom-cta" id="burn">
        <div class="bottom-cta-inner page-width">
          ${img(A.cta.banner, "Flip burn reborn — BURNEPEP $BEPEP", "cta-banner")}
          <a class="cta-hotspot" href="#home"><span class="sr-only">Enter the burn</span></a>
        </div>
      </section>
      ${divider(A.texture.ctaFooter)}`;
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="footer-inner page-width">
          ${img(A.shared.footerBrand, "BURNEPEP", "footer-brand")}
          <small>© 2024 BURNEPEP. All rights reserved.</small>
        </div>
      </footer>`;
  }

  window.BurnepepComponents = { renderHeader, renderHero, renderManifesto, renderToken, renderCommunity, renderRoadmap, renderCta, renderFooter };
})();
