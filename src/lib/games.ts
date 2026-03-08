
export interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  category: string;
  players?: string;
  views: string;
  played: string;
  likes: number;
  dislikes: number;
}

export const GAMES_LIBRARY: Game[] = [
  {
    id: 'chaos-squad',
    title: 'CS: Chaos Squad',
    description: 'High-octane tactical shooter.',
    url: 'https://html5.gamedistribution.com/dec78e8b416948f19832618a64afb0d7/?utm_source=9000-firebase-studio-1772959678669.cluster-fkltigo73ncaixtmokrzxhwsfc.cloudworkstations.dev&utm_medium=cs:-chaos-squad&utm_campaign=block-and-redirect',
    thumbnail: 'https://picsum.photos/seed/chaos1/600/400',
    category: 'Shooter',
    players: 'Multiplayer',
    views: '1.2M',
    played: '850K',
    likes: 12400,
    dislikes: 120
  },
  {
    id: 'battle-royal',
    title: 'Battle Royale',
    description: 'Ultimate survival arena.',
    url: 'https://zapgames.io/cs-chaos-squad',
    thumbnail: 'https://picsum.photos/seed/battle1/600/400',
    category: 'Action',
    players: 'Multiplayer',
    views: '950K',
    played: '620K',
    likes: 9200,
    dislikes: 80
  },
  {
    id: 'nitro-racer',
    title: 'Nitro Racer',
    description: 'High-speed arcade racing game.',
    url: 'https://2212022025.github.io/Car-Game/',
    thumbnail: 'https://picsum.photos/seed/racing1/600/400',
    category: 'Racing',
    players: 'Single Player',
    views: '800K',
    played: '450K',
    likes: 8500,
    dislikes: 45
  }
];
