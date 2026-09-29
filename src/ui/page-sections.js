/* Page section markup stays framework-free so index.html works when opened directly. */
(function () {
  const assets = window.BurnepepAssets;
  const renderImage = (src, alt, className = "") => `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
  const renderButton = (label, href = "#community", className = "") => `<a class="ink-button ${className}" href="${href}">${label}<span aria-hidden="true">→</span></a>`;

  function renderSiteHeader() {
    const social = assets.shared.socials;
    return `
      <div class="header-inner page-width">
        <a class="brand-link" href="#home" aria-label="BURNEPEP home">${renderImage(assets.shared.brand, "BURNEPEP")}</a>
        <nav class="main-nav" aria-label="Primary navigation">
          <a href="#manifesto">Manifesto</a><a href="#token">Token</a><a href="#community">Community</a><a href="#roadmap">Roadmap</a><a href="#gallery">Gallery</a>
        </nav>
        <div class="header-actions">
          <div class="social-icons" aria-label="Social links">
            <a href="https://x.com/bepep_bsc" target="_blank" rel="noreferrer" aria-label="X">${renderImage(social.x, "")}</a><a href="https://t.me/BEPEP_BSC" target="_blank" rel="noreferrer" aria-label="Telegram">${renderImage(social.telegram, "")}</a>
          </div>
          ${renderButton("ENTER THE BURN", "#burn", "header-cta")}
        </div>
      </div>`;
  }

  function renderHeroSection() {
    const sequence = assets.hero.burnMotion;
    const firstFrame = `${sequence.framePrefix}${String(1).padStart(sequence.frameDigits, "0")}${sequence.frameExtension}`;
    return `
      <section class="hero" id="home" aria-label="BURNEPEP animated introduction">
        <div class="hero-scroll-scene page-width" data-motion-scene>
          <div class="keyframe-stage" data-sequence-stage data-sequence-total="${sequence.frameCount}" data-frame-prefix="${sequence.framePrefix}" data-frame-extension="${sequence.frameExtension}" data-frame-digits="${sequence.frameDigits}" aria-label="BURNEPEP hero animation. Scroll to guide Pepe into the black hole.">
            <div class="sequence-media">
              <img class="sequence-fallback" src="${firstFrame}" alt="" fetchpriority="high" />
              <canvas class="sequence-canvas" data-sequence-canvas role="img" aria-label="BURNEPEP animated video sequence"></canvas>
            </div>
            <div class="ember-layer" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
      </section>`;
  }

  function renderManifestoSection() {
    return `
      <section class="paper-section manifesto" id="manifesto">
        <div class="manifesto-inner page-width">
          <div class="manifesto-copy">
            ${renderImage(assets.manifesto.title, "The BURNEPEP manifesto", "manifesto-title")}
            <div class="manifesto-statement">
              <p class="manifesto-kicker">THE NEW PERSPECTIVE</p>
              <p class="manifesto-lead"><strong>BURNEPEP</strong> is not just a meme.<br />It’s a new perspective.</p>
              <p class="manifesto-body">We flip the ordinary, burn the stale, and turn chaos into something brighter.</p>
            </div>
            ${renderImage(assets.manifesto.tagline, "Same frog. Brighter tomorrow.", "manifesto-tagline")}
          </div>
          <div class="manifesto-visual">
            ${renderImage(assets.manifesto.portrait, "Upside-down BURNEPEP character", "portrait")}
            ${renderImage(assets.manifesto.slogan, "Not a meme. A new beginning.", "manifesto-slogan")}
            ${renderImage(assets.manifesto.butterfly, "", "manifesto-butterfly")}
          </div>
        </div>
      </section>`;
  }

  function renderTokenHighlightsSection() {
    const cards = assets.token.cards.map((card) => `
      <article class="token-card">
        <div class="token-art">${renderImage(card.art, "", "token-art-image")}</div>
        <h3>${card.title}</h3><p>${card.body}</p>
      </article>`).join("");
    return `
      <section class="paper-section token" id="token">
        <div class="page-width">
          <div class="section-title-row">
            ${renderImage(assets.token.title, "Token highlights", "token-title")}
            ${renderImage(assets.token.tagline, "More than a token. A culture.", "token-tagline")}
          </div>
          <div class="token-grid">${cards}</div>
        </div>
      </section>`;
  }

  function renderCommunitySection() {
    const rows = [
      ["x", "X / TWITTER", "Follow the movement", "https://x.com/bepep_bsc"], ["telegram", "TELEGRAM", "Chat with frens", "https://t.me/BEPEP_BSC"],
    ].map(([icon, title, caption, href]) => `<a class="social-row" href="${href}" target="_blank" rel="noreferrer">${renderImage(assets.community.socialIcons[icon], "")}<span><b>${title}</b><small>${caption}</small></span><i aria-hidden="true">→</i></a>`).join("");
    return `
      <section class="paper-section community" id="community">
        <div class="community-inner page-width">
          <div class="community-copy">
            ${renderImage(assets.community.title, "Community — people flip culture.", "community-title")}
            <p>BURNEPEP lives through its community. Artists, creators, holders and dreamers from around the world, all flipping the same narrative. Different perspectives. One movement.</p>
            ${renderButton("JOIN OUR COMMUNITY", "#gallery")}
          </div>
          <div class="community-collage">
            ${renderImage(assets.community.collage, "BURNEPEP community collage")}
            ${renderImage(assets.community.sticker, "", "collage-sticker")}
          </div>
          <div class="social-panel" aria-label="Community channels">${rows}</div>
        </div>
      </section>`;
  }

  function renderArchiveSection() {
    const posters = assets.archive.posters.map((poster) => `
      <figure class="archive-poster">
        ${renderImage(poster.image, poster.label)}
        <figcaption>${poster.label}</figcaption>
      </figure>`).join("");
    return `
      <section class="paper-section archive" id="gallery">
        <div class="archive-inner page-width">
          <div class="archive-copy">
            <p class="archive-kicker">CULTURE WALL</p>
            <h2>THE BURN<br />LIVES ON.</h2>
            <p>Memes, moments and good frens — every post keeps the movement in motion.</p>
            <a class="archive-link" href="https://x.com/bepep_bsc" target="_blank" rel="noreferrer">SEE THE MOVEMENT <span aria-hidden="true">↗</span></a>
          </div>
          <div class="archive-posters">${posters}</div>
        </div>
      </section>`;
  }

  function renderRoadmapSection() {
    const stages = [
      ["01", "IGNITE", ["Build the foundation.", "Grow the community.", "Spread the word."]],
      ["02", "FLIP", ["Expand the ecosystem.", "More utilities.", "More chaos."]],
      ["03", "BURN", ["Activate burn mechanics.", "Reduce supply.", "Increase momentum."]],
      ["04", "BEYOND", ["A brighter tomorrow.", "More than a meme.", "A lasting culture."]],
    ];
    return `
      <section class="paper-section roadmap" id="roadmap">
        <div class="roadmap-inner page-width">
          <div class="roadmap-intro">${renderImage(assets.roadmap.title, "Roadmap", "roadmap-title")}</div>
          <div class="roadmap-steps">
            ${stages.map(([number, title, lines], index) => `<article class="roadmap-card"><span>${number}</span><div class="roadmap-heading"><b>${title}</b>${renderImage(assets.roadmap.icons[index], "", "roadmap-icon")}</div><p>${lines.join("<br />")}</p></article>${index < 3 ? `<div class="roadmap-connector" aria-hidden="true">${renderImage(assets.roadmap.arrows[index], "", "roadmap-arrow")}</div>` : ""}`).join("")}
          </div>
        </div>
      </section>`;
  }

  function renderCallToActionSection() {
    return `
      <section class="bottom-cta" id="burn">
        <div class="bottom-cta-inner page-width">
          ${renderImage(assets.cta.bannerImage, "Flip burn reborn — BURNEPEP $BEPEP", "cta-banner")}
          <a class="cta-hotspot" href="#home"><span class="sr-only">Enter the burn</span></a>
        </div>
      </section>`;
  }

  function renderSiteFooter() {
    return `
      <footer class="site-footer">
        <div class="footer-inner page-width">
          ${renderImage(assets.shared.footerBrand, "BURNEPEP", "footer-brand")}
          <small>© 2026 BURNEPEP. All rights reserved.</small>
        </div>
      </footer>`;
  }

  window.BurnepepPageSections = {
    renderSiteHeader,
    renderHeroSection,
    renderManifestoSection,
    renderTokenHighlightsSection,
    renderCommunitySection,
    renderArchiveSection,
    renderRoadmapSection,
    renderCallToActionSection,
    renderSiteFooter,
  };
})();
