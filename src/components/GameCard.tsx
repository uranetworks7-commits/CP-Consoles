
"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Eye, MousePointer2, ThumbsUp, ThumbsDown } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePlayClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLaunch(game);
    }, 1200);
  };

  return (
    <div 
      className="group flex flex-col bg-card/10 hover:bg-card/30 border-b border-border/30 transition-all duration-200 p-4 gap-4"
    >
      {/* Top Line: Preview + Identity & Metrics */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 shadow-lg">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-0.5">
          <h3 className="text-base sm:text-lg font-black tracking-tighter uppercase italic text-foreground leading-tight">
            {game.title}
          </h3>
          <div className="flex items-center gap-3 text-muted-foreground/50">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest">
              <Eye className="w-3 h-3" />
              {game.views}
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest">
              <MousePointer2 className="w-3 h-3" />
              {game.played}
            </div>
          </div>
        </div>
      </div>

      {/* Second Line: Large "Post-Style" Interaction Buttons */}
      <div className="flex items-center">
        <div className="flex bg-secondary/20 rounded-full p-1 border border-border/40 w-full sm:w-auto">
          <button 
            onClick={handleLike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black text-sm uppercase transition-all active:scale-95",
              userVote === 'like' 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <ThumbsUp className={cn("w-5 h-5", userVote === 'like' && "fill-current")} />
            {likes.toLocaleString()}
          </button>
          <div className="w-px h-6 bg-border/30 self-center mx-1" />
          <button 
            onClick={handleDislike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black text-sm uppercase transition-all active:scale-95",
              userVote === 'dislike' 
                ? "bg-destructive text-white shadow-lg shadow-destructive/20" 
                : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <ThumbsDown className={cn("w-5 h-5", userVote === 'dislike' && "fill-current")} />
            {dislikes.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Third Line: Distinct Play Button with Loading Animation */}
      <Button 
        disabled={isLoading}
        onClick={handlePlayClick}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xs uppercase tracking-[0.2em] h-12 rounded-lg shadow-lg shadow-accent/10 transition-all active:scale-95"
      >
        {isLoading ? (
          <div className="flex gap-1.5 items-center justify-center">
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" />
          </div>
        ) : (
          "Play"
        )}
      </Button>
    </div>
  );
}
