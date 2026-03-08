"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Cpu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

export function GameCard({ game, onLaunch }: GameCardProps) {
  return (
    <div 
      className="group flex flex-col md:flex-row items-center bg-card/40 hover:bg-card border border-border/50 hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer p-4 gap-6"
      onClick={() => onLaunch(game)}
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden shrink-0">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={game.category.toLowerCase()}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
      </div>
      
      {/* Info Row */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 w-full">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black tracking-tight group-hover:text-accent transition-colors font-headline uppercase">
              {game.title}
            </h3>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/30 text-primary uppercase font-bold">
              {game.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
            {game.description}
          </p>
        </div>

        <div className="flex items-center gap-8 shrink-0">
          <div className="hidden lg:flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <Users className="w-3 h-3" />
              {game.players}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase tracking-wider">
              <Cpu className="w-3 h-3" />
              Direct-Play Ready
            </div>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest px-6 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group-hover:ring-2 ring-accent/20"
          >
            Play Now
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
