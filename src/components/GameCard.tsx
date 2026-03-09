"use client";

import Image from 'next/image';
import { Game } from '@/lib/games';
import { Eye, MousePointer2, ThumbsUp, ThumbsDown, Play, Share2, MoreVertical, Bookmark, User, AlertTriangle, MessageSquare, Fingerprint, Globe, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRTDB } from '@/firebase';
import { ref, update, remove, push, onValue, off, set } from 'firebase/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface GameCardProps {
  game: Game;
  onLaunch: (game: Game) => void;
  user: any;
  onAboutDev: (dev: any) => void;
  onShowId: (id: string) => void;
  savedGames: any[];
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

export function GameCard({ game, onLaunch, user, onAboutDev, onShowId, savedGames }: GameCardProps) {
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  const [feedback, setFeedback] = useState('');
  const [reportReason, setReportReason] = useState('');
  
  const rtdb = useRTDB();
  const { toast } = useToast();

  useEffect(() => {
    if (!rtdb || !user || !game.id) return;
    const voteRef = ref(rtdb, `submissions/${game.id}/userVotes/${user.username}`);
    const unsubscribe = onValue(voteRef, (snapshot) => {
      setUserVote(snapshot.val());
    });
    return () => off(voteRef, 'value', unsubscribe);
  }, [rtdb, user, game.id]);

  const isSaved = useMemo(() => {
    return savedGames.some(sg => {
      if (typeof sg === 'string') return sg === game.id;
      if (sg && typeof sg === 'object' && 'id' in sg) return sg.id === game.id;
      return false;
    });
  }, [savedGames, game.id]);

  const formatK = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rtdb || !user) return;

    let newLikes = game.likes || 0;
    let newDislikes = game.dislikes || 0;
    let nextVote: 'like' | null = null;

    if (userVote === 'like') {
      newLikes = Math.max(0, newLikes - 1);
      nextVote = null;
    } else {
      newLikes += 1;
      if (userVote === 'dislike') {
        newDislikes = Math.max(0, newDislikes - 1);
      }
      nextVote = 'like';
    }

    const updates: any = {};
    updates[`submissions/${game.id}/likes`] = newLikes;
    updates[`submissions/${game.id}/dislikes`] = newDislikes;
    updates[`submissions/${game.id}/userVotes/${user.username}`] = nextVote;
    
    update(ref(rtdb), updates);
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rtdb || !user) return;

    let newLikes = game.likes || 0;
    let newDislikes = game.dislikes || 0;
    let nextVote: 'dislike' | null = null;

    if (userVote === 'dislike') {
      newDislikes = Math.max(0, newDislikes - 1);
      nextVote = null;
    } else {
      newDislikes += 1;
      if (userVote === 'like') {
        newLikes = Math.max(0, newLikes - 1);
      }
      nextVote = 'dislike';
    }

    const updates: any = {};
    updates[`submissions/${game.id}/likes`] = newLikes;
    updates[`submissions/${game.id}/dislikes`] = newDislikes;
    updates[`submissions/${game.id}/userVotes/${user.username}`] = nextVote;
    
    update(ref(rtdb), updates);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(game.url);
    toast({ title: "Link Copied" });
  };

  const handleSave = async () => {
    if (!rtdb || !user) return;
    const saveRef = ref(rtdb, `users/${user.username}/savedGames/${game.id}`);
    if (isSaved) {
      remove(saveRef);
    } else {
      set(saveRef, game.id);
    }
  };

  const handlePlayClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLaunch(game);
    }, 600); // Faster loading sequence
  };

  const handleRefreshLoading = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(false);
    setTimeout(() => setIsLoading(true), 100);
  };

  const submitFeedback = async () => {
    if (!rtdb || !feedback.trim()) return;
    const feedbackRef = push(ref(rtdb, `submissions/${game.id}/feedback`));
    await update(feedbackRef, {
      text: feedback,
      userId: user?.username || 'anonymous',
      timestamp: new Date().toISOString()
    });
    setFeedback('');
    setShowFeedbackDialog(false);
    toast({ title: "Feedback Sent", description: "Your message has been transmitted." });
  };

  const submitReport = async () => {
    if (!rtdb || !reportReason.trim()) return;
    const reportRef = push(ref(rtdb, `submissions/${game.id}/reports`));
    await update(reportRef, {
      reason: reportReason,
      userId: user?.username || 'anonymous',
      timestamp: new Date().toISOString()
    });
    setReportReason('');
    setShowReportDialog(false);
    toast({ title: "Report Submitted", description: "The core team will review this incident." });
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
                  <DropdownMenuItem onClick={() => onShowId(game.id)} className="font-black uppercase italic tracking-widest text-[10px] gap-3 py-2.5 cursor-pointer">
                    <Fingerprint className="w-3.5 h-3.5" /> Post Id
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary/80 dark:text-primary/70">
              <Eye className="w-3.5 h-3.5" />
              {formatK(parseInt(game.views || "0"))}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-green-500 dark:text-accent/80">
              <MousePointer2 className="w-3.5 h-3.5" />
              {formatK(parseInt(game.played || "0"))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
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
            {formatK(game.likes || 0)}
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
            {formatK(game.dislikes || 0)}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/30 rounded-2xl p-1.5 border border-border/50">
            <button 
              onClick={() => setShowFeedbackDialog(true)}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 hover:bg-secondary/30 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-all group/btn"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
              Feedback
            </button>
          </div>
          
          <button 
            onClick={() => setShowReportDialog(true)}
            className="px-4 py-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive hover:opacity-80 transition-all group/btn"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-destructive transition-transform group-hover/btn:scale-110" />
            Report
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button 
          disabled={isLoading}
          onClick={handlePlayClick}
          className="w-full bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.25em] h-12 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] border border-white/20 relative group"
        >
          {isLoading ? (
            <div className="flex gap-2 items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
              <button 
                onClick={handleRefreshLoading}
                className="absolute right-3 p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                title="Refresh Uplink"
              >
                <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Play className="w-5 h-5 fill-current" />
              Play Now
            </div>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-green-500" />
            <span>Published:-</span>
          </div>
          <span className="italic text-foreground">{formatTimeAgo(game.createdAt)}</span>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="rounded-3xl border-border bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Submit Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Your Message</Label>
              <Input 
                placeholder="Transmitting feedback..." 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)}
                className="rounded-xl bg-secondary/10 h-12 border-border focus:border-accent"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={submitFeedback} 
              disabled={!feedback.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black uppercase tracking-widest rounded-xl h-12"
            >
              Sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="rounded-3xl border-destructive/30 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-destructive">Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Reasons for Reporting</Label>
              <Input 
                placeholder="Specify violation..." 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
                className="rounded-xl bg-secondary/10 h-12 border-border focus:border-destructive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={submitReport} 
              disabled={!reportReason.trim()}
              className="w-full bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest rounded-xl h-12"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
