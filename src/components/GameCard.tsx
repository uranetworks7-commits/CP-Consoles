
"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

export function GameCard({ game, onLaunch }: GameCardProps) {
  return (
    <div 
      className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden game-card-hover cursor-pointer"
      onClick={() => onLaunch(game)}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint={game.category.toLowerCase()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-accent border-accent/20">
            {game.category}
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary p-4 rounded-full shadow-lg shadow-primary/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="fill-current w-8 h-8" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col p-5 space-y-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors font-headline">
            {game.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {game.players}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-accent hover:text-accent hover:bg-accent/10 p-0 h-auto font-medium"
          >
            Launch Game
          </Button>
        </div>
      </div>
    </div>
  );
}
