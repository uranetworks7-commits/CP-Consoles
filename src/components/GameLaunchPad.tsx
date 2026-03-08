
"use client";

import { Game } from '@/lib/games';
import { RotateCcw, Monitor, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface GameLaunchPadProps {
  game: Game | null;
  onClose: () => void;
}

export function GameLaunchPad({ game, onClose }: GameLaunchPadProps) {
  if (!game) return null;

  return (
    <Dialog open={!!game} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-full w-full h-full p-0 border-none bg-black rounded-none flex flex-col gap-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">System Engine: {game.title}</DialogTitle>
        
        {/* Unified Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0c10] border-b border-border/30 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Monitor className="text-primary w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic text-foreground">
                {game.title}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
                  {game.category} // {game.players}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-9 h-9 bg-secondary/20 border-border/50 hover:bg-primary/20 hover:text-primary transition-all"
              onClick={() => {
                const iframe = document.querySelector('iframe');
                if (iframe) iframe.src = iframe.src;
              }}
              title="Restart Engine"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-9 h-9 bg-secondary/20 border-border/50 hover:bg-primary/20 hover:text-primary transition-all"
              onClick={() => window.open(game.url, '_blank')}
              title="External Link"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border/30 mx-1" />
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full w-10 h-10 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-lg"
              onClick={onClose}
              title="Close Engine"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
        
        {/* Full Viewport Engine Container */}
        <div className="flex-1 relative bg-black">
          <iframe
            src={game.url}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
