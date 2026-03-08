
"use client";

import { useState } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, User, PlusCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const { auth } = useAuth();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({
        title: "Welcome Back",
        description: "Successfully authenticated with Pulse Core.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const handleNewProject = () => {
    if (!user) {
      handleLogin();
    } else {
      toast({
        title: "Access Denied",
        description: "New Project creation is currently locked to Admin levels.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-0 space-y-6">
        {/* Header - Fixed/Sticky */}
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-md border-b border-border/30 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <MonitorPlay className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground">
                  Connect Pulse Consoles
                </h1>
              </div>

              {/* Profile / Login */}
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                        <Avatar className="h-10 w-10 border border-primary/20">
                          <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogin}
                    className="rounded-full bg-primary/10 border-primary/20 hover:bg-primary hover:text-white transition-all gap-2 h-9 px-4 font-bold uppercase text-[10px] tracking-widest"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Sub-Header Actions */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleNewProject}
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-10 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-accent/10"
              >
                <PlusCircle className="w-4 h-4" />
                New Project
              </Button>
              <div className="flex-1 h-px bg-border/20" />
            </div>
          </div>
        </header>

        {/* Separated Game Units */}
        <section className="pb-10 pt-4">
          <div className="flex flex-col">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 flex justify-between items-center text-muted-foreground/30 border-t border-border/10">
          <p className="text-[10px] font-mono uppercase tracking-widest">NEXUS_OS_CORE v3.0</p>
          <div className="flex gap-4">
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
            <div className="w-1 h-1 bg-primary rounded-full" />
          </div>
        </footer>
      </main>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}
