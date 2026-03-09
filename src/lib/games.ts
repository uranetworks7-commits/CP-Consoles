
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
  developerInfo?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export const GAMES_LIBRARY: Game[] = [];
