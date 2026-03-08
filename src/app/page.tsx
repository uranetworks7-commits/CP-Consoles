"use client";

import { useState, useEffect } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, LogIn, LogOut, Cpu, Gamepad2, PlusCircle, BarChart3, Trophy, History, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRTDB } from '@/firebase';
import { ref, get, child } from 'firebase/database';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const rtdb = useRTDB();
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('pulse_session');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
    const savedTheme = localStorage.getItem('console_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
    setIsInitialized(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('console_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleLogin = async () => {
    if (!rtdb) {
      toast({
        variant: "destructive",
        title: "System Offline",
        description: "Database connection not established.",
      });
      return;
    }

    const username = usernameInput.trim();
    if (!username) {
      toast({
        variant: "destructive",
        title: "Identification Required",
        description: "Please enter your username.",
      });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `users/${username}`));
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userProfile = {
          username: username,
          ...(typeof userData === 'object' ? userData : {})
        };
        
        setLoggedInUser(userProfile);
        localStorage.setItem('pulse_session', JSON.stringify(userProfile));
        
        toast({
          title: "Access Granted",
          description: `Welcome back, ${username}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Identification Failure",
          description: "username is not found in our system records",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "System Failure",
        description: "Error connecting to database.",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('pulse_session');
    toast({
      title: "Session Terminated",
      description: "Successfully logged out.",
    });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Cpu className="text-primary w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 bg-card/20 p-10 rounded-[2.5rem] border border-border/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent p-[2px] mx-auto shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-card rounded-[1.4rem] flex items-center justify-center">
                  <Gamepad2 className="text-primary w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                  Connect Plus Console
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter Username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="h-12 bg-card/10 border-border/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl px-5 text-sm text-foreground"
                />
              </div>

              <Button 
                onClick={handleLogin}
                disabled={isLoggingIn || !usernameInput.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-black uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 text-[10px]"
              >
                {isLoggingIn ? (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Initialize Login
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/20 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20">
                <MonitorPlay className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                Connect Plus Console
              </h1>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-card/40 transition-colors">
                  <Settings className="w-6 h-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-border/20 text-foreground w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-8 border-b border-border/10">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/30">
                        <AvatarFallback className="bg-secondary/50 text-primary text-xl font-bold">
                          {loggedInUser.username.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic mb-1">Console Identity</p>
                        <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{loggedInUser.username}</p>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">System Configuration</p>
                    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/10">
                      <span className="text-xs font-bold uppercase tracking-widest">Console Theme</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleTheme}
                        className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest bg-background"
                      >
                        {theme === 'dark' ? (
                          <><Moon className="w-3.5 h-3.5" /> Dark</>
                        ) : (
                          <><Sun className="w-3.5 h-3.5" /> Light</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">XP Points</p>
                      </div>
                      <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">
                        {loggedInUser.xp || '12,450'}
                      </p>
                    </div>
                    
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border/10">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analytics</p>
                      </div>
                      <p className="text-[11px] font-bold text-foreground">68% Win Rate</p>
                      <p className="text-[9px] text-muted-foreground uppercase mt-1">42h Total Play</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      variant="outline"
                      className="w-full flex items-center justify-center gap-3 h-14 bg-accent/5 hover:bg-accent hover:text-accent-foreground text-accent rounded-2xl border border-accent/10 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      New Project
                    </Button>

                    <div className="p-5 bg-card/40 rounded-2xl border border-border/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest italic">
                          <History className="w-4 h-4 text-primary" />
                          Recent Play
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-secondary/10 rounded-xl border border-border/5">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <MonitorPlay className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black italic uppercase tracking-tighter">CS: Chaos Squad</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Played 2 hours ago</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 h-14 bg-destructive/5 hover:bg-destructive/10 text-destructive rounded-2xl border border-destructive/10 text-[10px] font-black uppercase tracking-widest transition-all mt-4"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Console
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <section className="pb-20 space-y-6 pt-6">
          <div className="grid gap-6">
            {GAMES_LIBRARY.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onLaunch={(game) => setActiveGame(game)} 
              />
            ))}
          </div>
        </section>

        <footer className="py-8 flex flex-col items-center gap-3 text-muted-foreground/10 border-t border-border/5">
          <p className="text-[7px] font-mono uppercase tracking-widest">© Connect_Plus_Consoles</p>
        </footer>
      </main>

      <GameLaunchPad 
        game={activeGame} 
        onClose={() => setActiveGame(null)} 
      />
    </div>
  );
}
