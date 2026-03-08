"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Eye, MousePointer2, ThumbsUp, ThumbsDown, Play, Share2, MoreVertical, Bookmark, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRTDB } from '@/firebase';
import { ref, update, remove } from 'firebase/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
  user: any;
  onAboutDev: (dev: any) => void;
  savedGames: any[];
}

export function GameCard({ game, onLaunch, user, onAboutDev, savedGames }: GameCardProps) {
  const [likes, setLikes] = useState(game.likes || 0);
  const [dislikes, setDislikes] = useState(game.dislikes || 0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rtdb = useRTDB();

  const isSaved = useMemo(() => {
    return savedGames.some(sg => sg.id === game.id);
  }, [savedGames, game.id]);

  const syncVotes = (newL: number, newD: number) => {
    if (!rtdb) return;
    const gameRef = ref(rtdb, `submissions/${game.id}`);
    update(gameRef, { likes: newL, dislikes: newD });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    let newL = likes;
    let newD = dislikes;

    if (userVote === 'like') {
      newL -= 1;
      setUserVote(null);
    } else {
      newL += 1;
      if (userVote === 'dislike') newD -= 1;
      setUserVote('like');
    }
    
    setLikes(newL);
    setDislikes(newD);
    syncVotes(newL, newD);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    let newL = likes;
    let newD = dislikes;

    if (userVote === 'dislike') {
      newD -= 1;
      setUserVote(null);
    } else {
      newD += 1;
      if (userVote === 'like') newL -= 1;
      setUserVote('dislike');
    }
    
    setLikes(newL);
    setDislikes(newD);
    syncVotes(newL, newD);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(game.url);
  };

  const handleSave = async () => {
    if (!rtdb || !user) return;
    const saveRef = ref(rtdb, `users/${user.username}/savedGames/${game.id}`);
    if (isSaved) {
      remove(saveRef);
    } else {
      update(saveRef, game);
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
      className="group flex flex-col bg-secondary/10 hover:bg-secondary/20 border border-border/50 rounded-[2rem] transition-all duration-300 p-5 gap-5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 relative"
    >
      <div className="flex items-center gap-5">
        <div className="relative w-28 h-20 rounded-2xl overflow-hidden shrink-0 border border-border shadow-xl bg-black group-hover:border-primary/40 transition-colors">
          <Image
            src={game.thumbnail || 'https://picsum.photos/seed/app/600/400'}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 overflow-visible">
            <h3 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none whitespace-normal break-words">
              {game.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/20 hover:bg-primary/20 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl bg-card border-border min-w-[150px]">
                  <DropdownMenuItem onClick={handleShare} className="font-black uppercase italic tracking-widest text-[10px] gap-3 py-2.5 cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSave} className="font-black uppercase italic tracking-widest text-[10px] gap-3 py-2.5 text-primary cursor-pointer">
                    <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} /> {isSaved ? "Saved" : "Save"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAboutDev(game)} className="font-black uppercase italic tracking-widest text-[10px] gap-3 py-2.5 cursor-pointer">
                    <User className="w-3.5 h-3.5" /> About Developer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5 text-primary/70" />
              {game.views}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <MousePointer2 className="w-3.5 h-3.5 text-accent/70" />
              {game.played}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-secondary/30 rounded-2xl p-1.5 border border-border/50 flex-1">
          <button 
            onClick={handleLike}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95",
              userVote === 'like' 
                ? "bg-primary text-white shadow-lg shadow-primary/30" 
                : "text-muted-foreground/80 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", userVote === 'like' && "fill-current")} />
            {likes.toLocaleString()}
          </button>
          <div className="w-px h-5 bg-border/50 self-center mx-1.5" />
          <button 
            onClick={handleDislike}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95",
              userVote === 'dislike' 
                ? "bg-destructive text-white shadow-lg shadow-destructive/30" 
                : "text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <ThumbsDown className={cn("w-4 h-4", userVote === 'dislike' && "fill-current")} />
            {dislikes.toLocaleString()}
          </button>
        </div>
      </div>

      <Button 
        disabled={isLoading}
        onClick={handlePlayClick}
        className="w-full bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.25em] h-12 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] border border-white/10"
      >
        {isLoading ? (
          <div className="flex gap-2 items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Play className="w-5 h-5 fill-current" />
            Play Now
          </div>
        )}
      </Button>
    </div>
  );
}
