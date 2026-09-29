/* Plain scripts deliberately support opening index.html directly from the filesystem. */
(function () {
  const designKitRoot = "./assets/design-kit/burnepep-web-slices-v2";
  const webpRoot = `${designKitRoot}/webp`;
  const transparentWebpRoot = `${designKitRoot}/transparent_webp`;
  const buildAssetPath = (group, file) => `${webpRoot}/${group}/${file}.webp`;
  const buildTransparentAssetPath = (group, file) => `${transparentWebpRoot}/${group}/${file}_alpha.webp`;

  window.BurnepepAssets = {
    hero: {
      burnMotion: {
        framePrefix: "./assets/hero/burn-motion/frames/frame_",
        frameExtension: ".webp",
        frameDigits: 3,
        frameCount: 49,
        sourceFrameRate: 12,
      },
    },
    shared: {
      brand: buildTransparentAssetPath("01_shared", "B01_header-brand"),
      footerBrand: buildTransparentAssetPath("01_shared", "B10_footer-brand"),
      socials: {
        x: buildTransparentAssetPath("01_shared", "B06_header-x"),
        telegram: buildTransparentAssetPath("01_shared", "B08_header-telegram"),
      },
    },
    manifesto: {
      title: buildTransparentAssetPath("02_manifesto", "M01_manifesto-title"),
      portrait: buildAssetPath("02_manifesto", "M02_frog-portrait"),
      tagline: buildTransparentAssetPath("02_manifesto", "M04_same-frog-tagline"),
      slogan: buildTransparentAssetPath("02_manifesto", "M06_not-a-meme-slogan"),
      butterfly: buildTransparentAssetPath("02_manifesto", "M09_butterfly"),
    },
    token: {
      title: buildTransparentAssetPath("03_token", "T01_token-title"),
      tagline: buildTransparentAssetPath("03_token", "T02_token-tagline"),
      cards: [
        { title: "MEME CULTURE", body: "Born from internet culture. Powered by creativity. For the degenerates, dreamers and difference makers.", art: buildAssetPath("03_token", "T05_meme-culture-art") },
        { title: "COMMUNITY ENERGY", body: "A global community that flips perspectives, creates together and burns the boring.", art: buildTransparentAssetPath("03_token", "T08_community-energy-art") },
        { title: "BURN MECHANIC", body: "Deflationary by design. We burn, we build, we go higher. Less supply. A brighter tomorrow.", art: buildAssetPath("03_token", "T11_burn-mechanic-art") },
        { title: "VISUAL IDENTITY", body: "An iconic character. A unique style. Recognizable. Unmistakable. BURNEPEP.", art: buildAssetPath("03_token", "T14_visual-identity-art") },
      ],
    },
    community: {
      title: buildTransparentAssetPath("04_community", "C01_community-title"),
      collage: buildAssetPath("04_community", "C04_community-collage"),
      sticker: buildTransparentAssetPath("04_community", "C11_frog-sticker"),
      socialIcons: {
        x: buildTransparentAssetPath("04_community", "C19_x-icon"),
        telegram: buildTransparentAssetPath("04_community", "C20_telegram-icon"),
      },
    },
    roadmap: {
      title: buildTransparentAssetPath("05_roadmap", "R01_roadmap-title"),
      icons: [
        buildTransparentAssetPath("05_roadmap", "R08_ignite-flame"),
        buildTransparentAssetPath("05_roadmap", "R09_flip-butterfly"),
        buildTransparentAssetPath("05_roadmap", "R10_burn-flame"),
        buildTransparentAssetPath("05_roadmap", "R11_beyond-vortex"),
      ],
      arrows: [
        buildTransparentAssetPath("05_roadmap", "R12_arrow-1"),
        buildTransparentAssetPath("05_roadmap", "R13_arrow-2"),
        buildTransparentAssetPath("05_roadmap", "R14_arrow-3"),
      ],
    },
    cta: {
      bannerImage: "./assets/images/cta/bottom-cta-banner.png",
    },
  };
})();
