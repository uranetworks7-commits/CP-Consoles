
"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Play, Eye, MousePointer2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
}

export function GameCard({ game, onLaunch }: GameCardProps) {
  const [likes, setLikes] = useState(game.likes);
  const [dislikes, setDislikes] = useState(game.dislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userVote === 'like') {
      setLikes(prev => prev - 1);
      setUserVote(null);
    } else {
      setLikes(prev => prev + 1);
      if (userVote === 'dislike') setDislikes(prev => prev - 1);
      setUserVote('like');
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userVote === 'dislike') {
      setDislikes(prev => prev - 1);
      setUserVote(null);
    } else {
      setDislikes(prev => prev + 1);
      if (userVote === 'like') setLikes(prev => prev - 1);
      setUserVote('dislike');
    }
  };

  return (
    <div 
      className="group flex flex-col sm:flex-row items-center bg-card/20 hover:bg-card/40 border-b border-border/50 transition-all duration-200 p-4 sm:p-6 gap-6"
    >
      {/* Preview Thumbnail */}
      <div className="relative w-32 h-20 sm:w-48 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-2xl">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Game Info & Stats */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6">
        <div className="flex flex-col gap-2 min-w-[200px]">
          <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground">
            {game.title}
          </h3>
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <Eye className="w-4 h-4" />
              {game.views}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <MousePointer2 className="w-4 h-4" />
              {game.played}
            </div>
          </div>
        </div>

        {/* Big Post-Style Interaction Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary/30 rounded-full p-1 border border-border/50">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm uppercase transition-all active:scale-95",
                userVote === 'like' 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <ThumbsUp className={cn("w-5 h-5", userVote === 'like' && "fill-current")} />
              {likes.toLocaleString()}
            </button>
            <div className="w-px h-6 bg-border/50 self-center mx-1" />
            <button 
              onClick={handleDislike}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm uppercase transition-all active:scale-95",
                userVote === 'dislike' 
                  ? "bg-destructive text-white shadow-lg shadow-destructive/20" 
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <ThumbsDown className={cn("w-5 h-5", userVote === 'dislike' && "fill-current")} />
              {dislikes.toLocaleString()}
            </button>
          </div>

          <Button 
            onClick={() => onLaunch(game)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-sm uppercase tracking-[0.2em] px-10 h-12 rounded-full shadow-xl shadow-accent/20 transition-all active:scale-95 shrink-0"
          >
            Play Now
            <Play className="w-4 h-4 ml-2 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
