"use client";

import { useState, useEffect } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, LogIn, LogOut, Cpu, Gamepad2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRTDB } from '@/firebase';
import { ref, get, child } from 'firebase/database';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const rtdb = useRTDB();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session in local storage
    const savedUser = localStorage.getItem('pulse_session');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
    setIsInitialized(true);
  }, []);

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
        description: "Enter your handle to verify credentials.",
      });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const dbRef = ref(rtdb);
      // Direct check from Realtime Database as per provided snippet
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
          title: "Access Denied",
          description: "Handle not found in system records.",
        });
      }
    } catch (error: any) {
      console.error("Login Exception:", error);
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
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <Cpu className="text-primary w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 bg-card/20 p-10 rounded-[2.5rem] border border-border/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent p-[2px] mx-auto shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-[#0a0c10] rounded-[1.4rem] flex items-center justify-center">
                  <Gamepad2 className="text-primary w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                  Login
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">
                  Enter Username
                </label>
                <Input
                  placeholder="Username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="h-12 bg-card/10 border-border/20 focus:border-primary/50 focus:ring-primary/20 font-mono rounded-xl px-5 text-sm tracking-widest text-foreground"
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
                    Checking...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Check Username
                  </>
                )}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/10">
              <p className="text-[7px] font-mono text-center text-muted-foreground/30 uppercase tracking-[0.2em]">
                System_Initialization // Connection_Locked
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0">
        <header className="sticky top-0 z-30 bg-[#0a0c10]/95 backdrop-blur-xl border-b border-border/20 py-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/20">
                  <MonitorPlay className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none">
                    Connect Plus Console
                  </h1>
                  <p className="text-[8px] font-mono text-primary/60 tracking-[0.2em] mt-1 uppercase">
                    Status: Active
                  </p>
                </div>
              </div>

              <Button 
                variant="outline"
                className="bg-accent/5 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-4 h-9 font-black uppercase text-[9px] tracking-widest gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Project
              </Button>
            </div>

            <div className="flex items-center justify-between bg-card/10 p-2.5 rounded-xl border border-border/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-xl p-0 overflow-hidden border border-primary/20 hover:border-primary">
                      <Avatar className="h-full w-full rounded-none">
                        <AvatarFallback className="bg-secondary/50 rounded-none text-primary text-[10px] font-bold">
                          {loggedInUser.username.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#0a0c10] border-border/30 rounded-xl p-1 mt-2" align="start">
                    <DropdownMenuLabel className="p-3">
                      <p className="text-[10px] font-black italic tracking-tighter text-foreground">
                        {loggedInUser.username}
                      </p>
                      <p className="text-[8px] font-mono text-muted-foreground/60">Verified_User</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/10" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold uppercase text-[9px] tracking-widest p-2.5">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
                      Session: Secured
                    </p>
                  </div>
                  <p className="text-[9px] text-foreground font-black uppercase italic tracking-tighter">
                    {loggedInUser.username}
                  </p>
                </div>
              </div>
            </div>
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
          <p className="text-[7px] font-mono uppercase tracking-[0.3em]">Core_v5.0.0 // LIVE_DATA_SYNC</p>
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
