
"use client";

import { useEffect, useState } from 'react';
import { Game } from '@/lib/games';
import { X, Maximize2, RotateCcw, Monitor, ExternalLink } from 'lucide-react';
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
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-background border-none shadow-2xl">
        <DialogTitle className="sr-only">Playing {game.title}</DialogTitle>
        
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-3 bg-sidebar border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Monitor className="text-primary w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-headline">{game.title}</h2>
                <p className="text-xs text-muted-foreground">{game.category} • {game.players}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-9 h-9 border-border hover:bg-muted"
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe) iframe.src = iframe.src;
                  setIsLoading(true);
                }}
                title="Restart Game"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-9 h-9 border-border hover:bg-muted"
                onClick={() => window.open(game.url, '_blank')}
                title="Open in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-destructive/10"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/50 backdrop-blur-sm">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-sm font-medium animate-pulse text-accent">Initializing Engine...</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
