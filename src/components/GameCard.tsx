
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
    // Simulate loading/synthesizing animation before launch
    setTimeout(() => {
      setIsLoading(false);
      onLaunch(game);
    }, 1500);
  };

  return (
    <div 
      className="group flex flex-col bg-card/20 hover:bg-card/40 border-b border-border/50 transition-all duration-200 p-4 sm:p-6 gap-4 sm:gap-6"
    >
      {/* Top Line: Preview + Identity & Metrics */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-xl">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-1 sm:gap-2">
          <h3 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic text-foreground">
            {game.title}
          </h3>
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5" />
              {game.views}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <MousePointer2 className="w-3.5 h-3.5" />
              {game.played}
            </div>
          </div>
        </div>
      </div>

      {/* Second Line: Big Like & Dislike Buttons */}
      <div className="flex items-center">
        <div className="flex bg-secondary/30 rounded-full p-1 border border-border/50">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-full font-black text-sm uppercase transition-all active:scale-95",
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
              "flex items-center gap-2 px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-full font-black text-sm uppercase transition-all active:scale-95",
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

      {/* Third Line: Play Button (Separate line) */}
      <div>
        <Button 
          disabled={isLoading}
          onClick={handlePlayClick}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-sm uppercase tracking-[0.2em] h-12 sm:h-14 rounded-xl shadow-xl shadow-accent/20 transition-all active:scale-95"
        >
          {isLoading ? (
            <div className="flex gap-1 items-center justify-center">
              <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" />
            </div>
          ) : (
            "Play"
          )}
        </Button>
      </div>
    </div>
  );
}
