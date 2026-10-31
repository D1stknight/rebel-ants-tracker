// Public text for the tracker. Everything here is shown to visitors — keep it public:
// no internal notes, admin links, keys or wallet addresses.
//
// Names, percentages and links still come from the Rebel Console (economy.rebelants.io/admin/tracker).
// This file only adds the extra public details for each project, matched by its id.
//   title    – shorter public name, used only while the console name still starts with `match`
//              (rename it in the console and your new name wins)
//   url      – link used when the console has none, or a more exact page on the same site
//   status   – 'live' | 'building' | 'planned'  (optional; otherwise worked out from the link and %)
//   self     – this tracker itself (no Open button)
//   icon/cat – app icon glyph and colour family

export const UPDATED_FALLBACK = '2026-10-31';

export const CATS = {
  game:       ['#FFB257', '#E5482B'],
  media:      ['#C7A6FF', '#6D45D6'],
  collection: ['#6FE7B7', '#16876A'],
  tool:       ['#7FD2FF', '#2E6BD8'],
  economy:    ['#FFE07A', '#C7860E'],
  world:      ['#FF9AC4', '#C12F6B'],
  tech:       ['#B9C4D2', '#4B5768'],
};

export const CONTENT = {
  1: {
    match: 'Rebel Ants Playground', title: 'Rebel Ants Playground', icon: 'gamepad-2', cat: 'game',
    tagline: 'Eight browser games where you earn REBEL Points and win prizes.',
    done: ['Eight games live: Faction Wars, The Raid, Ant Tunnel, Queen’s Egg Shuffle, Hive Descent, Bounty Hunters, Rebel Grand Prix and The Siege',
           'Daily points and Discord-linked wins', 'Prize claims with an ApeChain wallet'],
    next: ['New games and seasonal events', 'More prizes to win'],
  },
  2: {
    match: 'Rebel Ants The Warning', title: 'The Warning — Book 1', icon: 'book-open', cat: 'media',
    tagline: 'Our first graphic novel. Read it in the Colony Library.',
    done: ['Free sample to read online', 'Three-part animated prologue', 'Digital edition available'],
    next: ['Print edition', 'Free hardcover for Battle for the Colony holders'],
  },
  3: {
    match: 'Rebel Financial App', icon: 'wallet', cat: 'economy',
    tagline: 'A money app built for the Rebel community.',
    done: ['Early planning'], next: ['Design and first prototype'],
  },
  4: {
    match: 'Rebel 3D App', title: 'Rebel 3D App', icon: 'box', cat: 'tech', status: 'live',
    tagline: 'Our own 3D technology, with the patent acquired.',
    done: ['Patent acquired', 'App complete'], next: ['Public release details coming soon'],
  },
  5: {
    match: 'Rebel Ants Overlay Builder', icon: 'layers', cat: 'tool',
    tagline: 'Add overlays and gear to your Rebel Ant art.',
    done: ['Overlay Builder live at builder.rebelants.io'], next: ['New overlay drops'],
  },
  6: {
    match: 'Rebel Ants Real Life Card Game', title: 'Real-Life Card Game', icon: 'club', cat: 'game',
    tagline: 'Rebel Ants as a card game you can hold in your hands.',
    done: ['Card designs and rules in progress'], next: ['Playtesting', 'Printing'],
  },
  7: {
    match: 'Rebel Ants V3 Collection', title: 'V3 Collection', icon: 'gem', cat: 'collection',
    tagline: 'The next generation of Rebel Ants.',
    done: ['Art and traits in production'], next: ['Launch details'],
  },
  8: {
    match: 'Rebel Ants V2 Alpha Swarm', title: 'V2 Alpha Swarm', icon: 'hexagon', cat: 'collection',
    tagline: 'A new swarm joining Battle for the Colony.',
    done: ['Most of the swarm is ready'], next: ['Release'],
  },
  9: {
    match: 'Rebel Ants Animation', title: 'Rebel Ants Animation', icon: 'clapperboard', cat: 'media',
    tagline: 'The Rebel Ants story, animated.',
    done: ['Three-part prologue released in the Colony Library'], next: ['More episodes'],
  },
  10: {
    match: 'Rebel Ants V2 Image Hosting', title: 'Our Own Image Hosting', icon: 'server', cat: 'tech', status: 'live',
    tagline: 'Our collection art now lives on our own servers.',
    done: ['Collection images moved in-house'], next: [],
  },
  11: {
    match: 'Rebel Ants Strategy Token', title: 'Strategy Token', icon: 'coins', cat: 'economy',
    tagline: 'A token we’re building ourselves for Rebel strategy play.',
    done: ['Early design'], next: ['Design and testing'],
  },
  12: {
    match: 'Rebel Ants Gif', title: 'GIFs & Stickers', icon: 'sticker', cat: 'media',
    tagline: 'Rebel Ants GIFs and stickers to share anywhere.',
    done: ['Sticker and GIF hub live at hub.rebelants.io'], next: ['New sticker packs'],
  },
  13: {
    match: 'Rebel Ants Battle for The Colony Season 2', title: 'Battle for the Colony: Season 2', icon: 'swords', cat: 'game',
    tagline: 'The next season of the battle for the colony.',
    done: ['Season 2 in production'], next: ['Season launch'],
  },
  14: {
    match: 'Rebel Universe', title: 'Rebel Universe', icon: 'orbit', cat: 'world',
    url: 'https://rebeluniverse.io',
    tagline: 'Forge your Rebel Ant in 3D and explore the Hidden Village.',
    done: ['3D character Forge', 'The Hidden Village', 'Sign in with your wallet'],
    next: ['Season 1 dojos', 'The Foundry: AI character creation'],
  },
  15: {
    match: 'Rebel Ants Overlay Builder V2', title: 'Overlay Builder V2', icon: 'layers-3', cat: 'tool',
    tagline: 'The upgraded Overlay Builder.',
    done: ['V2 live at builder.rebelants.io'], next: ['New overlay drops'],
  },
  16: {
    match: 'Rebel Tracker', title: 'Rebel Tracker', icon: 'radar', cat: 'tool', self: true,
    tagline: 'This page. Every Rebel Ants project in one place.',
    done: ['Live progress for every project'], next: [],
  },
  17: {
    match: 'Rebel Store', icon: 'shopping-bag', cat: 'economy',
    tagline: 'Official Rebel Ants merch.',
    done: ['Store build in progress'], next: ['Store launch'],
  },
  18: {
    match: 'Rebel Economy', title: 'Rebel Economy', icon: 'bot', cat: 'economy',
    url: 'https://economy.rebelants.io/shop',
    tagline: 'Ant-Thony on Discord, plus the Rebel Points shop.',
    done: ['Ant-Thony bot: prediction markets, story building, heists and trivia', 'Rebel Points shop: pay by card, APE or ETH'],
    next: ['More ways to use your points'],
  },
  19: {
    match: 'Rebel Toys', icon: 'puzzle', cat: 'collection',
    tagline: 'Rebel Ants you can put on a shelf.',
    done: ['Toy designs nearly finished'], next: ['Release'],
  },
  20: {
    match: 'Rebel Ants V1', title: 'Rebel Ants V1', icon: 'image', cat: 'collection',
    tagline: 'The original Rebel Ants collection.',
    done: ['Collection live on OpenSea'], next: [],
  },
  21: {
    match: 'Rebel Ants V2', title: 'Battle for the Colony', icon: 'swords', cat: 'collection',
    tagline: 'Sold out. Trade on OpenSea.',
    done: ['Sold out'], next: [],
  },
  22: {
    match: 'Rebel Germy Pets', title: 'Rebel Germy Pets', icon: 'paw-print', cat: 'collection',
    tagline: 'A growing collection. New pets keep arriving.',
    done: ['Collection live on OpenSea'], next: ['More pets added over time'],
  },
  23: {
    match: 'Rebel Ants Presents: Unvoiced Echoes', title: 'Unvoiced Echoes', icon: 'audio-waveform', cat: 'collection',
    tagline: 'A Rebel Ants art collection.',
    done: ['Collection live on OpenSea'], next: [],
  },
  24: {
    match: 'Rebel Ants After Dark', title: 'After Dark', icon: 'moon', cat: 'game',
    tagline: 'The Rebel Ants after-hours experience.',
    done: ['Live at afterdark.rebelants.io'], next: [],
  },
  25: {
    match: 'Rebel Autonomous Asset Protocol', title: 'RAAP', icon: 'cpu', cat: 'tech',
    tagline: 'Rebel Autonomous Asset Protocol.',
    done: ['Core build well underway'], next: ['Launch at raap.rebelants.io'],
  },
  26: {
    match: 'Rebel Marketplace', icon: 'store', cat: 'economy',
    tagline: 'Buy and sell Rebel Ants items in one place.',
    done: ['Core build well underway'], next: ['Launch'],
  },
  27: {
    match: 'Rebel Launchpad', icon: 'rocket', cat: 'tech',
    tagline: 'Where new Rebel collections will launch.',
    done: ['Early build'], next: ['Build and testing'],
  },
};

// Live sites that aren't in the console list yet. Each shows until a console project uses the same site.
export const EXTRAS = [
  {
    id: 'staking', name: 'Rebel Staking', pct: 100, url: 'https://staking.rebelants.io',
    icon: 'vault', cat: 'economy',
    tagline: 'Hold your Rebel Ants and earn $REBEL. No lockup.',
    done: ['Sign in with Discord to see your eligible Ants', 'Earn $REBEL while you hold'], next: [],
  },
];
