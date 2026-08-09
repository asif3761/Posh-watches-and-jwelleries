/* ============================================================
   NOIR & AURUM — product data
   Replace price/desc/images with real inventory when ready.
   ============================================================ */
window.NOIR_PRODUCTS = [
  {
    id: "meridian",
    collection: "timepieces",
    name: "The Meridian",
    price: 18500,
    tagline: "Blackened steel · gold index",
    desc: "A slim automatic dress watch in blackened 316L steel, with a hand-applied gold index dial and a sapphire caseback that reveals the movement.",
    icon: "watch",
  },
  {
    id: "obsidian",
    collection: "timepieces",
    name: "The Obsidian",
    price: 24900,
    tagline: "Automatic movement · sapphire crystal",
    desc: "Our sport-luxury reference — a 41mm automatic with a satin-brushed bezel, sapphire crystal, and 100m of water resistance.",
    icon: "watch",
  },
  {
    id: "regent",
    collection: "timepieces",
    name: "The Regent",
    price: 32000,
    tagline: "Limited run of 50",
    desc: "The house's signature piece. Solid gold indices set into a hand-finished black dial, individually numbered, limited to fifty pieces worldwide.",
    icon: "watch",
  },
  {
    id: "fumee-noire",
    collection: "fragrances",
    name: "Fumée Noire",
    price: 3200,
    tagline: "Smoke · leather · oud",
    desc: "Dark oud wrapped in birch smoke and worn leather, softened by a base of ambergris. 50ml eau de parfum.",
    icon: "bottle",
  },
  {
    id: "aurum-nocturne",
    collection: "fragrances",
    name: "Aurum Nocturne",
    price: 3600,
    tagline: "Amber · gilded musk",
    desc: "Warm amber resin and gilded white musk, opening bright and settling into a golden, skin-close drydown. 50ml eau de parfum.",
    icon: "bottle",
  },
  {
    id: "cendre",
    collection: "fragrances",
    name: "Cendre",
    price: 2900,
    tagline: "Ash · vetiver · vanilla",
    desc: "Smoked vetiver and cool ash, rounded out with a whisper of vanilla bourbon. 50ml eau de parfum.",
    icon: "bottle",
  },
];

window.NOIR_ICONS = {
  watch: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="32" cy="32" r="20"/>
    <circle cx="32" cy="32" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M32 20v12l8 6"/>
    <path d="M27 8h10M27 56h10"/>
    <path d="M20 12l4 6M44 12l-4 6M20 52l4-6M44 52l-4-6"/>
  </svg>`,
  bottle: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="20" y="10" width="10" height="8" rx="1"/>
    <path d="M22 18v6c-6 3-9 9-9 16v14a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V40c0-7-3-13-9-16v-6"/>
    <path d="M17 46h20" opacity=".5"/>
  </svg>`,
};
