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
            <button type="button" data-pending aria-label="X">${img(social.x, "")}</button><button type="button" data-pending aria-label="Discord">${img(social.discord, "")}</button><button type="button" data-pending aria-label="Telegram">${img(social.telegram, "")}</button><button type="button" data-pending aria-label="Instagram">${img(social.instagram, "")}</button>
          </div>
          ${button("ENTER THE BURN", "#burn", "header-cta")}
        </div>
      </div>`;
  }

  function renderHero() {
    return `
      <section class="hero" id="home" aria-label="BURNEPEP animated introduction">
        <div class="hero-grid page-width">
          <article class="hero-video-card">
            <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${A.poster}">
              <source src="${A.video}" type="video/mp4" />
            </video>
            <button class="video-toggle" type="button" data-video-toggle aria-label="Pause intro video">Ⅱ</button>
          </article>
          <aside class="hero-side-card">
            <span class="eyebrow">THE NEW PERSPECTIVE</span>
            <h1>FLIP THE ORDINARY.<br /><em>BURN THE STALE.</em></h1>
            <p>BURNEPEP turns internet culture into a brighter, louder movement.</p>
            <div class="hero-points"><span>MEME CULTURE</span><span>COMMUNITY</span><span>BRIGHTER TOMORROW</span></div>
            ${button("ENTER THE BURN", "#community")}
            ${img(A.manifesto.slogan, "Not a meme. A new beginning.", "hero-sticker")}
          </aside>
        </div>
      </section>`;
  }

  function renderManifesto() {
    return `
      <section class="paper-section manifesto" id="manifesto">
        <div class="manifesto-inner page-width">
          <div class="manifesto-copy">
            ${img(A.manifesto.title, "The BURNEPEP manifesto", "manifesto-title")}
            <div class="html-copy">
              <p><strong>BURNEPEP</strong> is not just a meme.<br />It’s a new perspective.<br />We flip the ordinary, burn the stale,<br />and turn chaos into something brighter.</p>
              <p>A community that refuses to take things seriously, but takes freedom, creativity and culture seriously.</p>
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
      ["discord", "DISCORD", "Join the community"], ["x", "X / TWITTER", "Follow the movement"], ["telegram", "TELEGRAM", "Chat with frens"], ["gallery", "GALLERY", "Fan art & memes"],
    ].map(([icon, title, caption]) => `<button type="button" class="social-row" data-pending>${img(A.community.socialIcons[icon], "")}<span><b>${title}</b><small>${caption}</small></span><i>›</i></button>`).join("");
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
            ${stages.map(([number, title, lines], index) => `<article class="roadmap-card"><span>${number}</span><div class="roadmap-heading"><b>${title}</b>${img(A.roadmap.icons[index], "", "roadmap-icon")}</div><p>${lines.join("<br />")}</p>${index < 3 ? img(A.roadmap.arrows[index], "", "roadmap-arrow") : ""}</article>`).join("")}
          </div>
        </div>
      </section>
      ${divider(A.texture.roadmapCta)}`;
  }

  function renderCta() {
    return `
      <section class="bottom-cta" id="burn">
        <div class="bottom-cta-inner page-width">
          ${img(A.cta.left, "Flip burn reborn", "cta-left")}
          <div class="cta-center">${img(A.cta.center, "BURNEPEP $BEPEP", "cta-brand")}${img(A.cta.tagline, "Same frog. Brighter tomorrow.", "cta-tagline")}${button("ENTER THE BURN", "#home")}</div>
          ${img(A.cta.right, "BURNEPEP character and brighter tomorrow sign", "cta-right")}
        </div>
      </section>
      ${divider(A.texture.ctaFooter)}`;
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="footer-inner page-width">
          ${img(A.shared.footerBrand, "BURNEPEP", "footer-brand")}
          <nav aria-label="Footer navigation"><a href="#manifesto">Manifesto</a><a href="#token">Token</a><a href="#community">Community</a><a href="#roadmap">Roadmap</a><a href="#gallery">Gallery</a></nav>
          <div class="footer-meta"><span>𝕏&nbsp;&nbsp; ◉&nbsp;&nbsp; ◢&nbsp;&nbsp; ◎</span><b>SAME FROG. BRIGHTER TOMORROW.</b></div>
          <small>© 2024 BURNEPEP. All rights reserved.</small><div class="legal"><button data-pending>Terms</button><button data-pending>Privacy</button><button data-pending>Contact</button></div>
        </div>
      </footer>`;
  }

  window.BurnepepComponents = { renderHeader, renderHero, renderManifesto, renderToken, renderCommunity, renderRoadmap, renderCta, renderFooter };
})();
