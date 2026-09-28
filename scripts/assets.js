/* Plain scripts deliberately support opening index.html directly from the filesystem. */
(function () {
  const root = "./BURNEPEP_Web_Slices_V2/webp";
  const alphaRoot = "./BURNEPEP_Web_Slices_V2/transparent_webp";
  const asset = (group, file) => `${root}/${group}/${file}.webp`;
  const alpha = (group, file) => `${alphaRoot}/${group}/${file}_alpha.webp`;

  window.BurnepepAssets = {
    asset,
    alpha,
    video: "./video/jimeng-2026-09-28-1906-10秒低算力趣味meme动画，严格参考上传的涂鸦画面：绿色佩佩蛙在米黄色复古涂鸦....mp4",
    poster: "./video/1.png",
    shared: {
      brand: alpha("01_shared", "B01_header-brand"),
      footerBrand: alpha("01_shared", "B10_footer-brand"),
      socials: {
        x: alpha("01_shared", "B06_header-x"),
        discord: alpha("01_shared", "B07_header-discord"),
        telegram: alpha("01_shared", "B08_header-telegram"),
        instagram: alpha("01_shared", "B09_header-instagram"),
      },
    },
    manifesto: {
      title: alpha("02_manifesto", "M01_manifesto-title"),
      portrait: asset("02_manifesto", "M02_frog-portrait"),
      tagline: alpha("02_manifesto", "M04_same-frog-tagline"),
      slogan: alpha("02_manifesto", "M06_not-a-meme-slogan"),
      butterfly: alpha("02_manifesto", "M09_butterfly"),
    },
    token: {
      title: alpha("03_token", "T01_token-title"),
      tagline: alpha("03_token", "T02_token-tagline"),
      crown: alpha("03_token", "T03_token-crown"),
      cards: [
        { title: "MEME CULTURE", body: "Born from internet culture. Powered by creativity. For the degenerates, dreamers and difference makers.", art: asset("03_token", "T05_meme-culture-art") },
        { title: "COMMUNITY ENERGY", body: "A global community that flips perspectives, creates together and burns the boring.", art: alpha("03_token", "T08_community-energy-art") },
        { title: "BURN MECHANIC", body: "Deflationary by design. We burn, we build, we go higher. Less supply. A brighter tomorrow.", art: asset("03_token", "T11_burn-mechanic-art") },
        { title: "VISUAL IDENTITY", body: "An iconic character. A unique style. Recognizable. Unmistakable. BURNEPEP.", art: asset("03_token", "T14_visual-identity-art") },
      ],
    },
    community: {
      title: alpha("04_community", "C01_community-title"),
      crown: alpha("04_community", "C22_community-crown"),
      collage: asset("04_community", "C04_community-collage"),
      sticker: alpha("04_community", "C11_frog-sticker"),
      socialIcons: {
        discord: alpha("04_community", "C18_discord-icon"),
        x: alpha("04_community", "C19_x-icon"),
        telegram: alpha("04_community", "C20_telegram-icon"),
        gallery: alpha("04_community", "C21_gallery-icon"),
      },
    },
    roadmap: {
      title: alpha("05_roadmap", "R01_roadmap-title"),
      tagline: alpha("05_roadmap", "R02_roadmap-tagline"),
      crown: alpha("05_roadmap", "R03_roadmap-crown"),
      icons: [
        alpha("05_roadmap", "R08_ignite-flame"),
        alpha("05_roadmap", "R09_flip-butterfly"),
        alpha("05_roadmap", "R10_burn-flame"),
        alpha("05_roadmap", "R11_beyond-vortex"),
      ],
      arrows: [
        alpha("05_roadmap", "R12_arrow-1"),
        alpha("05_roadmap", "R13_arrow-2"),
        alpha("05_roadmap", "R14_arrow-3"),
      ],
    },
    cta: {
      left: asset("06_bottom_cta", "A02_left-composition"),
      center: asset("06_bottom_cta", "A03_center-brand"),
      tagline: alpha("06_bottom_cta", "A06_same-frog-tagline"),
      right: asset("06_bottom_cta", "A10_right-composition"),
    },
    texture: {
      paper: asset("07_textures", "X01_paper-sample"),
      manifestoToken: asset("07_textures", "X07_manifesto-token-divider"),
      tokenCommunity: asset("07_textures", "X03_token-community-divider"),
      communityRoadmap: asset("07_textures", "X08_community-roadmap-divider"),
      roadmapCta: asset("07_textures", "X04_roadmap-cta-divider"),
      ctaFooter: asset("07_textures", "X09_cta-footer-divider"),
    },
  };
})();
