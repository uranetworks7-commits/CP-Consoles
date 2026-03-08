
export interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  players?: string;
}

export const GAMES_LIBRARY: Game[] = [
  {
    id: 'nitro-racer',
    title: 'Nitro Racer',
    description: 'High-speed arcade racing game. Conquer the tracks and break speed records.',
    url: 'https://2212022025.github.io/Car-Game/',
    thumbnail: 'https://picsum.photos/seed/racing1/600/400',
    category: 'Racing',
    players: 'Single Player'
  },
  {
    id: 'ura-battle',
    title: 'Ura Battle',
    description: 'Intense tactical combat arena. Master your abilities and defeat your foes.',
    url: 'https://ura-battle.netlify.app/',
    thumbnail: 'https://picsum.photos/seed/battle1/600/400',
    category: 'Action',
    players: 'Multiplayer'
  },
  {
    id: 'space-combat',
    title: 'Void Horizon',
    description: 'Navigate through asteroid fields and engage in epic space dogfights.',
    url: 'https://picsum.photos/seed/space1/800/600',
    thumbnail: 'https://picsum.photos/seed/space1/600/400',
    category: 'Shooter',
    players: 'Single Player'
  },
  {
    id: 'mind-puzzle',
    title: 'Nexus Logic',
    description: 'A challenging puzzle game that tests your spatial awareness and logic.',
    url: 'https://picsum.photos/seed/puzzle1/800/600',
    thumbnail: 'https://picsum.photos/seed/puzzle1/600/400',
    category: 'Puzzle',
    players: 'Single Player'
  },
  {
    id: 'cyber-runner',
    title: 'Cyber Runner',
    description: 'Neon-soaked endless runner in a dystopian future metropolis.',
    url: 'https://picsum.photos/seed/cyber1/800/600',
    thumbnail: 'https://picsum.photos/seed/cyber1/600/400',
    category: 'Arcade',
    players: 'Single Player'
  },
  {
    id: 'star-strategy',
    title: 'Galactic Command',
    description: 'Real-time strategy set in a sprawling galaxy of warring factions.',
    url: 'https://picsum.photos/seed/strategy1/800/600',
    thumbnail: 'https://picsum.photos/seed/strategy1/600/400',
    category: 'Strategy',
    players: 'Multiplayer'
  }
];
