
"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Eye, MousePointer2, ThumbsUp, ThumbsDown, Play, Share2, Check } from 'lucide-react';
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
  const [isShared, setIsShared] = useState(false);

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(game.url);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
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
      className="group flex flex-col bg-card/5 hover:bg-card/10 border border-border/30 rounded-xl transition-all duration-200 p-3 gap-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border border-border/40 shadow-md bg-black">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-0.5">
          <h3 className="text-lg font-black tracking-tighter uppercase italic text-foreground leading-none">
            {game.title}
          </h3>
          <div className="flex items-center gap-3 text-muted-foreground/30">
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

      <div className="flex items-center gap-2">
        <div className="flex bg-secondary/5 rounded-full p-1 border border-border/20 flex-1 sm:flex-none">
          <button 
            onClick={handleLike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full font-black text-[9px] uppercase transition-all active:scale-95",
              userVote === 'like' 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground/50 hover:bg-primary/5 hover:text-primary"
            )}
          >
            <ThumbsUp className={cn("w-3.5 h-3.5", userVote === 'like' && "fill-current")} />
            {likes.toLocaleString()}
          </button>
          <div className="w-px h-4 bg-border/10 self-center mx-1" />
          <button 
            onClick={handleDislike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full font-black text-[9px] uppercase transition-all active:scale-95",
              userVote === 'dislike' 
                ? "bg-destructive text-white shadow-lg shadow-destructive/20" 
                : "text-muted-foreground/50 hover:bg-destructive/5 hover:text-destructive"
            )}
          >
            <ThumbsDown className={cn("w-3.5 h-3.5", userVote === 'dislike' && "fill-current")} />
            {dislikes.toLocaleString()}
          </button>
        </div>

        <button 
          onClick={handleShare}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full font-black text-[9px] uppercase transition-all border border-border/20 bg-secondary/5 active:scale-95",
            isShared 
              ? "text-green-500 border-green-500/30 bg-green-500/5" 
              : "text-muted-foreground/50 hover:text-accent hover:bg-accent/5 hover:border-accent/20"
          )}
        >
          {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {isShared ? "URL Copied" : "Share"}
        </button>
      </div>

      <Button 
        disabled={isLoading}
        onClick={handlePlayClick}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-xs uppercase tracking-[0.2em] h-10 rounded-lg shadow-md transition-all active:scale-[0.98] border border-white/5"
      >
        {isLoading ? (
          <div className="flex gap-1.5 items-center justify-center">
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </div>
        )}
      </Button>
    </div>
  );
}
