
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
      className="group flex flex-col bg-card/10 hover:bg-card/20 border border-border/40 rounded-2xl transition-all duration-200 p-5 gap-5 mb-6 last:mb-0 shadow-sm"
    >
      {/* Row 1: Preview + Title + Metrics */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-xl bg-black">
          <Image
            src={game.thumbnail}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          <h3 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none">
            {game.title}
          </h3>
          <div className="flex items-center gap-4 text-muted-foreground/40">
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

      {/* Row 2: Large Post-Style Interaction Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-secondary/10 rounded-full p-1.5 border border-border/30 flex-1 sm:flex-none">
          <button 
            onClick={handleLike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all active:scale-95",
              userVote === 'like' 
                ? "bg-primary text-white shadow-xl shadow-primary/30" 
                : "text-muted-foreground/60 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", userVote === 'like' && "fill-current")} />
            {likes.toLocaleString()}
          </button>
          <div className="w-px h-6 bg-border/20 self-center mx-1" />
          <button 
            onClick={handleDislike}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-full font-black text-[10px] uppercase transition-all active:scale-95",
              userVote === 'dislike' 
                ? "bg-destructive text-white shadow-xl shadow-destructive/30" 
                : "text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <ThumbsDown className={cn("w-4 h-4", userVote === 'dislike' && "fill-current")} />
            {dislikes.toLocaleString()}
          </button>
        </div>

        <button 
          onClick={handleShare}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4.5 rounded-full font-black text-[10px] uppercase transition-all border border-border/30 bg-secondary/10 active:scale-95",
            isShared 
              ? "text-green-500 border-green-500/50 bg-green-500/5" 
              : "text-muted-foreground/60 hover:text-accent hover:bg-accent/10 hover:border-accent/30"
          )}
        >
          {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {isShared ? "URL Copied" : "Share"}
        </button>
      </div>

      {/* Row 3: Full Width Play Button */}
      <Button 
        disabled={isLoading}
        onClick={handlePlayClick}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-sm uppercase tracking-[0.3em] h-14 rounded-xl shadow-xl shadow-accent/5 transition-all active:scale-[0.98] border border-white/5"
      >
        {isLoading ? (
          <div className="flex gap-2 items-center justify-center">
            <div className="w-2.5 h-2.5 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-accent-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-accent-foreground rounded-full animate-bounce" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 fill-current" />
            Play Now
          </div>
        )}
      </Button>
    </div>
  );
}
