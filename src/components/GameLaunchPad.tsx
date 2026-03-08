
"use client";

import { useEffect, useState } from 'react';
import { Game } from '@/lib/games';
import { RotateCcw, Monitor, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface GameLaunchPadProps {
  game: Game | null;
  onClose: () => void;
}

export function GameLaunchPad({ game, onClose }: GameLaunchPadProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (game) {
      setIsLoading(true);
    }
  }, [game]);

  if (!game) return null;

  return (
    <Dialog open={!!game} onOpenChange={(open) => !open && onClose()}>
      {/* p-0 and max-w-[100vw] for true full screen experience */}
      <DialogContent 
        className="max-w-full w-full h-full p-0 border-none bg-black rounded-none flex flex-col gap-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">System Engine: {game.title}</DialogTitle>
        
        {/* Unified Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a0c10] border-b border-border/30 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Monitor className="text-primary w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-foreground">
                {game.title}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
                  ENGINE_LOADED // {game.category} // {game.players}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 bg-secondary/20 border-border/50 hover:bg-primary/20 hover:text-primary transition-all"
              onClick={() => {
                const iframe = document.querySelector('iframe');
                if (iframe) iframe.src = iframe.src;
                setIsLoading(true);
              }}
              title="Restart Engine"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 bg-secondary/20 border-border/50 hover:bg-primary/20 hover:text-primary transition-all"
              onClick={() => window.open(game.url, '_blank')}
              title="External Link"
            >
              <ExternalLink className="w-5 h-5" />
            </Button>
            
            <div className="w-px h-8 bg-border/30 mx-2" />
            
            {/* The single main exit button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full w-12 h-12 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg"
              onClick={onClose}
              title="Close Engine"
            >
              <X className="w-7 h-7" />
            </Button>
          </div>
        </div>
        
        {/* Full Viewport Engine Container */}
        <div className="flex-1 relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0a0c10]">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
              </div>
              <p className="mt-6 text-xs font-mono uppercase tracking-[0.5em] animate-pulse text-accent">
                Synthesizing Engine Components...
              </p>
            </div>
          )}
          <iframe
            src={game.url}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
