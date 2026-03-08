"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Play, Eye, MousePointer2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

export function GameCard({ game, onLaunch }: GameCardProps) {
  const [likes, setLikes] = useState(game.likes);
  const [dislikes, setDislikes] = useState(game.dislikes);

  return (
    <div 
      className="group flex flex-col sm:flex-row items-center bg-card/20 hover:bg-card/40 border-b border-border/50 transition-all duration-200 p-3 sm:p-4 gap-4 sm:gap-6"
    >
      {/* Preview Thumbnail */}
      <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-border/50">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Game Info & Stats - Single Line Layout */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <h3 className="text-base sm:text-lg font-bold tracking-tight uppercase min-w-[150px]">
            {game.title}
          </h3>

          {/* Social / Likes */}
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); setLikes(prev => prev + 1); }}
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {likes.toLocaleString()}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setDislikes(prev => prev + 1); }}
              className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              {dislikes.toLocaleString()}
            </button>
          </div>

          {/* Views & Played */}
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
              <Eye className="w-3.5 h-3.5" />
              {game.views}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
              <MousePointer2 className="w-3.5 h-3.5" />
              {game.played}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onLaunch(game)}
          className="bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest px-8 h-10 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
        >
          Play
          <Play className="w-3 h-3 ml-2 fill-current" />
        </Button>
      </div>
    </div>
  );
}
