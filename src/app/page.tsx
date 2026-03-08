
"use client";

import { useState, useEffect, useMemo } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, LogIn, LogOut, Cpu, Gamepad2, PlusCircle, BarChart3, Trophy, History, Settings, Sun, Moon, ArrowLeft, Globe, Rocket, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRTDB, useFirestore, useCollection } from '@/firebase';
import { ref, get, child } from 'firebase/database';
import { collection, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
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
  const [showNewProject, setShowNewProject] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    profileImageUrl: '',
    gameName: '',
    gameType: '',
    gameUrl: '',
    thumbnailUrl: '',
    developerInfo: ''
  });
  
  const rtdb = useRTDB();
  const db = useFirestore();
  const { toast } = useToast();

  // Fetch User's Submissions for Analytics
  const submissionsQuery = useMemo(() => {
    if (!db || !loggedInUser?.username) return null;
    return query(collection(db, 'submissions'), where('userId', '==', loggedInUser.username));
  }, [db, loggedInUser?.username]);

  const { data: userSubmissions } = useCollection(submissionsQuery);

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
    setShowNewProject(false);
    toast({
      title: "Session Terminated",
      description: "Successfully logged out.",
    });
  };

  const handlePublish = async () => {
    if (!db || !loggedInUser) return;

    if (!formData.gameName || !formData.gameUrl) {
      toast({
        variant: "destructive",
        title: "Missing Parameters",
        description: "Game name and URL are mandatory.",
      });
      return;
    }

    setIsPublishing(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        userId: loggedInUser.username,
        status: 'under_review',
        createdAt: serverTimestamp()
      });

      toast({
        title: "Engine Published",
        description: "Your App under Review.",
      });

      setFormData({
        profileImageUrl: '',
        gameName: '',
        gameType: '',
        gameUrl: '',
        thumbnailUrl: '',
        developerInfo: ''
      });
      setShowNewProject(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Publish Failure",
        description: "Failed to upload engine to the cloud.",
      });
    } finally {
      setIsPublishing(false);
    }
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
        <div className="w-full max-w-md space-y-8 bg-card/40 dark:bg-card/20 p-10 rounded-[2.5rem] border border-border shadow-2xl backdrop-blur-md relative overflow-hidden">
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
                  className="h-12 bg-background dark:bg-card/10 border-border focus:border-primary/50 focus:ring-primary/20 rounded-xl px-5 text-sm text-foreground"
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

  if (showNewProject) {
    return (
      <div className="min-h-screen bg-background text-foreground animate-fade-in">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowNewProject(false)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <h2 className="text-sm font-black uppercase tracking-tighter italic">Engine Architect</h2>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <PlusCircle className="w-5 h-5 text-primary" />
          </div>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-8 pb-32">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">New Engine Configuration</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Deploy your vision to the Connect Plus network</p>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Profile Identification URL</Label>
              <Input 
                placeholder="https://..." 
                value={formData.profileImageUrl}
                onChange={(e) => setFormData({...formData, profileImageUrl: e.target.value})}
                className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Game Designation (Max 12)</Label>
                <Input 
                  placeholder="Engine Name" 
                  maxLength={12}
                  value={formData.gameName}
                  onChange={(e) => setFormData({...formData, gameName: e.target.value})}
                  className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Engine Classification</Label>
                <Input 
                  placeholder="Action, Battle, etc." 
                  value={formData.gameType}
                  onChange={(e) => setFormData({...formData, gameType: e.target.value})}
                  className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Engine Core URL</Label>
              <Input 
                placeholder="https://game-engine-source.com" 
                value={formData.gameUrl}
                onChange={(e) => setFormData({...formData, gameUrl: e.target.value})}
                className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Visual Thumbnail URL</Label>
              <Input 
                placeholder="https://thumbnail-proxy.png" 
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Developer Bio (Max 20)</Label>
              <Input 
                placeholder="Brief ident..." 
                maxLength={20}
                value={formData.developerInfo}
                onChange={(e) => setFormData({...formData, developerInfo: e.target.value})}
                className="rounded-xl bg-secondary/10 border-border focus:border-primary/50"
              />
            </div>
          </div>

          <Button 
            onClick={handlePublish}
            disabled={isPublishing || !formData.gameName || !formData.gameUrl}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl shadow-primary/20 gap-3"
          >
            {isPublishing ? "Initiating Uplink..." : <><Rocket className="w-5 h-5" /> Publish Engine</>}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-5">
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
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-secondary transition-colors border border-border/50">
                  <Settings className="w-6 h-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-l border-border text-foreground w-full sm:max-w-md p-0 flex flex-col shadow-2xl">
                <SheetHeader className="p-8 border-b border-border">
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-md">
                        <AvatarImage src={loggedInUser.profileImageUrl} />
                        <AvatarFallback className="bg-secondary text-primary text-xl font-bold">
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
                    <div className="flex items-center justify-between p-4 bg-secondary/30 dark:bg-secondary/10 rounded-2xl border border-border">
                      <span className="text-xs font-bold uppercase tracking-widest">Console Theme</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleTheme}
                        className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest bg-background shadow-sm"
                      >
                        {theme === 'dark' ? (
                          <><Moon className="w-3.5 h-3.5" /> Dark</>
                        ) : (
                          <><Sun className="w-3.5 h-3.5 text-orange-500" /> Light</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/40 dark:bg-secondary/20 p-5 rounded-2xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">XP Points</p>
                      </div>
                      <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">
                        {loggedInUser.xp || '12,450'}
                      </p>
                    </div>
                    
                    <div className="bg-secondary/40 dark:bg-secondary/20 p-5 rounded-2xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analytics</p>
                      </div>
                      <p className="text-[11px] font-bold text-foreground">{userSubmissions.length} Submissions</p>
                      <p className="text-[9px] text-muted-foreground uppercase mt-1">Console Master</p>
                    </div>
                  </div>

                  {/* My Apps / Analytics Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">All App Analytics</p>
                    <div className="space-y-3">
                      {userSubmissions.length === 0 ? (
                        <div className="p-6 border border-dashed border-border rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">No Engines Deployed</p>
                        </div>
                      ) : (
                        userSubmissions.map((sub: any) => (
                          <div key={sub.id} className="p-4 bg-secondary/20 rounded-xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Globe className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase italic">{sub.gameName}</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">Status: {sub.status.replace('_', ' ')}</p>
                              </div>
                            </div>
                            {sub.status === 'under_review' && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 border border-accent/20 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-accent" />
                                <span className="text-[8px] font-black text-accent uppercase tracking-widest italic">Reviewing</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      variant="outline"
                      onClick={() => setShowNewProject(true)}
                      className="w-full flex items-center justify-center gap-3 h-14 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary rounded-2xl border border-primary/30 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      New Project
                    </Button>

                    <div className="p-5 bg-card/60 dark:bg-card/40 rounded-2xl border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest italic">
                          <History className="w-4 h-4 text-primary" />
                          Recent Play
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      
                      <div className="flex items-center gap-4 p-3 bg-secondary/20 dark:bg-secondary/10 rounded-xl border border-border/50">
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
                      className="w-full flex items-center justify-center gap-3 h-14 bg-destructive/5 hover:bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-[10px] font-black uppercase tracking-widest transition-all mt-4"
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

        <footer className="py-8 flex flex-col items-center gap-3 text-muted-foreground/30 border-t border-border">
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
