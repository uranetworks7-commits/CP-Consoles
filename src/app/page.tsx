"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { GAMES_LIBRARY, Game } from '@/lib/games';
import { GameCard } from '@/components/GameCard';
import { GameLaunchPad } from '@/components/GameLaunchPad';
import { MonitorPlay, LogOut, Cpu, Gamepad2, PlusCircle, History, Settings, Sun, Moon, ArrowLeft, Rocket, Key, CheckCircle2, BarChart3, Edit3, Save, X as CloseIcon, Share2, Check, Trash2, Bookmark, User, Fingerprint, Search, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRTDB } from '@/firebase';
import { ref, get, child, update, push, onValue, off, remove } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogHeader as ShadDialogHeader,
  DialogTitle as ShadDialogTitle,
  DialogFooter as ShadDialogFooter,
} from "@/components/ui/dialog";

export default function Home() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showUserAnalytics, setShowUserAnalytics] = useState(false);
  const [showSavedGames, setShowSavedGames] = useState(false);
  const [viewingDev, setViewingDev] = useState<any>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [appToDelete, setAppToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // RTDB Submissions State
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [savedGames, setSavedGames] = useState<any[]>([]);

  // Admin State
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showAdminKeyDialog, setShowAdminKeyDialog] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Stable random weights for sorting games randomly but consistently per session
  const gameWeights = useRef<Record<string, number>>({});

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
  const { toast } = useToast();

  // Unified RTDB Listener for Submissions
  useEffect(() => {
    if (!rtdb) return;
    const submissionsRef = ref(rtdb, 'submissions');
    const unsubscribe = onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        setAllSubmissions(list);
      } else {
        setAllSubmissions([]);
      }
    });
    return () => off(submissionsRef, 'value', unsubscribe);
  }, [rtdb]);

  // Saved Games Listener
  useEffect(() => {
    if (!rtdb || !loggedInUser) return;
    const savedRef = ref(rtdb, `users/${loggedInUser.username}/savedGames`);
    const unsubscribe = onValue(savedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSavedGames(Object.values(data));
      } else {
        setSavedGames([]);
      }
    });
    return () => off(savedRef, 'value', unsubscribe);
  }, [rtdb, loggedInUser?.username]);

  // Auto Login Logic via User Agent
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (!rtdb) return;
      
      const savedUser = localStorage.getItem('pulse_session');
      if (savedUser) return; // User is already logged in

      const manualLogout = localStorage.getItem('manual_logout') === 'true';
      if (manualLogout) return; // User manually logged out, don't auto-login

      setIsAutoLoggingIn(true);
      try {
        const currentAgent = navigator.userAgent;
        const dbRef = ref(rtdb, 'users');
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          const foundEntry = Object.entries(users).find(([username, data]: [string, any]) => {
            return data['user agent'] === currentAgent;
          });

          if (foundEntry) {
            const [username, userData] = foundEntry;
            const userProfile = { username, ...(typeof userData === 'object' ? userData : {}) };
            setLoggedInUser(userProfile);
            localStorage.setItem('pulse_session', JSON.stringify(userProfile));
            localStorage.removeItem('manual_logout');
          }
        }
      } catch (e) {
        console.error("Auto login failure:", e);
      } finally {
        setTimeout(() => setIsAutoLoggingIn(false), 1500);
      }
    };

    if (isInitialized) {
      attemptAutoLogin();
    }
  }, [rtdb, isInitialized]);

  // Derived filtered lists with STABLE random sorting
  const displayGames = useMemo(() => {
    const dynamicGames = allSubmissions
      .filter(s => s.status === 'approved')
      .map(sub => ({
        id: sub.id,
        title: sub.gameName,
        description: sub.developerInfo,
        url: sub.gameUrl,
        thumbnail: sub.thumbnailUrl || 'https://picsum.photos/seed/app/600/400',
        category: sub.gameType,
        players: 'Online',
        views: sub.views || '0',
        played: sub.played || '0',
        likes: sub.likes || 0,
        dislikes: sub.dislikes || 0,
        developerInfo: sub.developerInfo,
        profileImageUrl: sub.profileImageUrl,
        developerBio: sub.developerBio || 'System Authorized',
        createdAt: sub.createdAt
      }));
    
    const all = [...GAMES_LIBRARY, ...dynamicGames];
    
    // Assign stable random weights if they don't exist for this session
    all.forEach(g => {
      if (gameWeights.current[g.id] === undefined) {
        gameWeights.current[g.id] = Math.random();
      }
    });

    // Sort by the stable session weights
    all.sort((a, b) => gameWeights.current[a.id] - gameWeights.current[b.id]);
    
    if (!searchTerm.trim()) return all;
    
    const term = searchTerm.toLowerCase();
    return all.filter(g => 
      g.title.toLowerCase().includes(term) || 
      g.category.toLowerCase().includes(term)
    );
  }, [allSubmissions, searchTerm]);

  const pendingSubmissions = useMemo(() => 
    allSubmissions.filter(s => s.status === 'under_review'), 
  [allSubmissions]);

  const userSubmissions = useMemo(() => 
    allSubmissions.filter(s => s.userId === loggedInUser?.username), 
  [allSubmissions, loggedInUser?.username]);

  useEffect(() => {
    const savedUser = localStorage.getItem('pulse_session');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setLoggedInUser(user);
      if (user.theme) {
        setTheme(user.theme);
        document.documentElement.classList.toggle('light', user.theme === 'light');
      }
    }
    const savedTheme = localStorage.getItem('console_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
    setIsInitialized(true);
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('console_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    
    if (loggedInUser && rtdb) {
      const userRef = ref(rtdb, `users/${loggedInUser.username}`);
      await update(userRef, { theme: newTheme });
      const updatedUser = { ...loggedInUser, theme: newTheme };
      setLoggedInUser(updatedUser);
      localStorage.setItem('pulse_session', JSON.stringify(updatedUser));
    }
  };

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAdminKeyDialog(true);
      longPressTimer.current = null;
    }, 2000);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const verifyAdminKey = () => {
    if (adminKeyInput === 'Utkarsh225') {
      setIsAdminMode(true);
      setShowAdminKeyDialog(false);
      setAdminKeyInput('');
      toast({ title: "Admin Access Granted", description: "Secure Terminal Online." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Invalid Protocol Key." });
    }
  };

  const handleApproveApp = async (id: string) => {
    if (!rtdb) return;
    try {
      await update(ref(rtdb, `submissions/${id}`), { status: 'approved' });
      toast({ title: "App Approved", description: "Application is now live on the console." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update record." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogin = async () => {
    if (!rtdb) return;
    const username = usernameInput.trim();
    if (!username) {
      toast({ variant: "destructive", title: "Identification Required", description: "Please enter your username." });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `users/${username}`));
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userProfile = { username, ...(typeof userData === 'object' ? userData : {}) };
        setLoggedInUser(userProfile);
        localStorage.setItem('pulse_session', JSON.stringify(userProfile));
        localStorage.removeItem('manual_logout'); // Clear manual logout flag
        if (userData.theme) {
          setTheme(userData.theme);
          localStorage.setItem('console_theme', userData.theme);
          document.documentElement.classList.toggle('light', userData.theme === 'light');
        }
        toast({ title: "Access Granted", description: `Welcome back, ${username}.` });
      } else {
        toast({ variant: "destructive", title: "Identification Failure", description: "username is not found in our system records" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "System Failure", description: "Error connecting to database." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('pulse_session');
    localStorage.setItem('manual_logout', 'true'); // Prevent auto-login until next manual login
    setShowNewProject(false);
    setShowUserAnalytics(false);
    setShowSavedGames(false);
    setViewingDev(null);
    setViewingPostId(null);
    setIsAdminMode(false);
    setAppToDelete(null);
    setEditingApp(null);
  };

  const handleLaunchGame = async (game: Game) => {
    setActiveGame(game);
    if (loggedInUser && rtdb) {
      const userRef = ref(rtdb, `users/${loggedInUser.username}`);
      const playData = { id: game.id, title: game.title, timestamp: new Date().toISOString() };
      const currentXp = parseInt((loggedInUser.xp || "0").toString().replace(/,/g, ''));
      const newXp = (currentXp + 50).toLocaleString();
      const updates = { recentPlayed: playData, xp: newXp };
      try {
        await update(userRef, updates);
        const updatedUser = { ...loggedInUser, ...updates };
        setLoggedInUser(updatedUser);
        localStorage.setItem('pulse_session', JSON.stringify(updatedUser));
        
        const submission = allSubmissions.find(s => s.id === game.id);
        if (submission) {
          const currentPlayed = parseInt(submission.played || "0");
          const currentViews = parseInt(submission.views || "0");
          await update(ref(rtdb, `submissions/${game.id}`), {
            played: (currentPlayed + 1).toString(),
            views: (currentViews + 1).toString()
          });
        }
      } catch (err) {
        console.error("Failed to sync play session:", err);
      }
    }
  };

  const handlePublish = async () => {
    if (!rtdb || !loggedInUser) return;
    if (!formData.gameName || !formData.gameUrl) {
      toast({ variant: "destructive", title: "Missing Parameters", description: "Game name and URL are mandatory." });
      return;
    }

    setIsPublishing(true);
    try {
      const newSubRef = push(ref(rtdb, 'submissions'));
      await update(newSubRef, {
        ...formData,
        userId: loggedInUser.username,
        status: 'under_review',
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        views: "0",
        played: "0",
        developerBio: formData.developerInfo
      });
      toast({ title: "App Published", description: "Your App under Review." });
      setFormData({ profileImageUrl: '', gameName: '', gameType: '', gameUrl: '', thumbnailUrl: '', developerInfo: '' });
      setShowNewProject(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Publish Failure", description: "Failed to upload engine." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateApp = async () => {
    if (!rtdb || !editingApp) return;
    try {
      const { id, ...data } = editingApp;
      await update(ref(rtdb, `submissions/${id}`), data);
      toast({ title: "App Updated", description: "System records modified successfully." });
      setEditingApp(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failure", description: "Failed to update engine parameters." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!rtdb || !appToDelete) return;
    try {
      await remove(ref(rtdb, `submissions/${appToDelete.id}`));
      toast({ title: "App Deleted", description: "Application removed from system permanently." });
      setAppToDelete(null);
      setDeleteConfirmText('');
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to purge record." });
    }
  };

  if (!isInitialized || isAutoLoggingIn) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      <div className="flex gap-2 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
      </div>
      <p className="text-lg font-black uppercase tracking-[0.2em] text-primary animate-pulse italic">Auto Login</p>
    </div>
  );

  if (!loggedInUser) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-card/40 dark:bg-card/20 p-10 rounded-[2.5rem] border border-border shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-accent p-[2px] mx-auto shadow-2xl shadow-primary/20">
              <div className="w-full h-full bg-card rounded-[1.4rem] flex items-center justify-center">
                <MonitorPlay className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground leading-none">Connect Plus Console</h1>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Enter Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="h-12 bg-background dark:bg-card/10 border-border focus:border-primary/50 rounded-xl px-5 text-sm text-foreground"
            />
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn || !usernameInput.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/20"
            >
              {isLoggingIn ? "Initializing..." : <><LogIn className="w-4 h-4 mr-2" /> Login</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setIsAdminMode(false)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Exit Admin
          </Button>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">Review Terminal</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto p-6 space-y-8">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Pending Applications</h1>
          <div className="space-y-6">
            {pendingSubmissions.length === 0 ? (
              <div className="p-10 border border-dashed border-border rounded-3xl text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs italic">Queue Empty // All Systems Optimal</p>
              </div>
            ) : (
              pendingSubmissions.map((app: any) => (
                <div key={app.id} className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden border border-border">
                        <img src={app.thumbnailUrl} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black italic uppercase leading-none">{app.gameName}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{app.gameType} // BY: {app.userId}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleApproveApp(app.id)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] px-6 h-10 shadow-lg"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-2" /> Approve
                    </Button>
                  </div>

                  <div className="grid gap-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border/50">
                      <div className="flex-1 overflow-hidden pr-4">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Engine Core URL</p>
                        <p className="text-xs font-mono truncate text-primary">{app.gameUrl}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(app.gameUrl)} className="rounded-lg h-8 w-8 hover:bg-primary/20">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border/50">
                      <div className="flex-1 overflow-hidden pr-4">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Developer Credentials</p>
                        <p className="text-xs italic text-foreground">{app.developerInfo}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(app.developerInfo)} className="rounded-lg h-8 w-8 hover:bg-primary/20">
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  if (viewingPostId) {
    return (
      <div className="min-h-screen bg-background animate-fade-in flex flex-col">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setViewingPostId(null)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <Fingerprint className="w-5 h-5 text-primary" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border p-12 rounded-[3rem] shadow-2xl text-center space-y-8">
            <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="text-primary w-10 h-10" />
            </div>
            <div>
              <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 select-all group transition-all hover:border-primary/50">
                <p className="font-mono text-primary text-lg break-all group-hover:text-accent transition-colors">
                  {viewingPostId}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => copyToClipboard(viewingPostId)} className="w-full rounded-xl gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10">
              <Share2 className="w-4 h-4" /> Copy Protocol ID
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (viewingDev) {
    return (
      <div className="min-h-screen bg-background animate-fade-in flex flex-col">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setViewingDev(null)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <User className="w-5 h-5 text-primary" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
          <div className="w-full max-sm bg-card border border-border p-10 rounded-[3rem] shadow-2xl text-center space-y-6">
            <Avatar className="h-32 w-32 mx-auto border-4 border-primary/20 shadow-xl">
              <AvatarImage src={viewingDev.profileImageUrl} />
              <AvatarFallback className="bg-secondary text-primary text-3xl font-black">DEV</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase">{viewingDev.developerInfo || 'Unknown'}</h1>
            </div>
            <div className="p-6 bg-secondary/20 rounded-2xl border border-border/50 space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-black uppercase tracking-widest italic">Authorised</p>
              </div>
              <p className="text-sm font-bold leading-relaxed">{viewingDev.developerBio || 'System Developer'}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showNewProject) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowNewProject(false)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <PlusCircle className="w-5 h-5 text-primary" />
        </header>
        <main className="max-w-xl mx-auto p-6 space-y-8 pb-32">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">New Application</h1>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Profile Identification URL (Catbox.moe expected)</Label>
              <Input placeholder="https://files.catbox.moe/..." value={formData.profileImageUrl} onChange={(e) => setFormData({...formData, profileImageUrl: e.target.value})} className="rounded-xl bg-secondary/10" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Game Name (Max 12)</Label>
                <Input placeholder="App Name" maxLength={12} value={formData.gameName} onChange={(e) => setFormData({...formData, gameName: e.target.value})} className="rounded-xl bg-secondary/10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Classification (Max 15)</Label>
                <Input placeholder="Action, Battle, etc." maxLength={15} value={formData.gameType} onChange={(e) => setFormData({...formData, gameType: e.target.value})} className="rounded-xl bg-secondary/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">App Core URL</Label>
              <Input placeholder="https://app-source.com" value={formData.gameUrl} onChange={(e) => setFormData({...formData, gameUrl: e.target.value})} className="rounded-xl bg-secondary/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Visual Thumbnail URL (Catbox.moe expected)</Label>
              <Input placeholder="https://files.catbox.moe/..." value={formData.thumbnailUrl} onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})} className="rounded-xl bg-secondary/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Developer Bio (Max 20)</Label>
              <Input placeholder="Brief identifier..." maxLength={20} value={formData.developerInfo} onChange={(e) => setFormData({...formData, developerInfo: e.target.value})} className="rounded-xl bg-secondary/10" />
            </div>
          </div>
          <Button onClick={handlePublish} disabled={isPublishing || !formData.gameName || !formData.gameUrl} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl shadow-primary/20">
            {isPublishing ? "Initiating Uplink..." : <><Rocket className="w-5 h-5 mr-3" /> Publish App</>}
          </Button>
        </main>
      </div>
    );
  }

  if (showSavedGames) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowSavedGames(false)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <Bookmark className="w-5 h-5 text-primary" />
        </header>
        <main className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Saved Items</h1>
          <div className="grid gap-6">
            {savedGames.length === 0 ? (
              <div className="p-10 border border-dashed border-border rounded-3xl text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No Application Found // Bookmark your favorites</p>
              </div>
            ) : (
              savedGames.map((game) => (
                <GameCard key={game.id} game={game} onLaunch={handleLaunchGame} user={loggedInUser} onAboutDev={setViewingDev} onShowId={setViewingPostId} savedGames={savedGames} />
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  if (showUserAnalytics) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-4 px-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowUserAnalytics(false)} className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" /> Back to Console
          </Button>
          <BarChart3 className="w-5 h-5 text-accent" />
        </header>
        <main className="max-w-2xl mx-auto p-6 space-y-8 pb-32">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">System Analytics</h1>
          <div className="space-y-4">
            {userSubmissions.length === 0 ? (
              <div className="p-10 border border-dashed border-border rounded-3xl text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs italic">No Records Found // Start a New Project</p>
              </div>
            ) : (
              userSubmissions.map((app: any) => (
                <div key={app.id} className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden border border-border">
                        <img src={app.thumbnailUrl} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black italic uppercase leading-none">{app.gameName}</h3>
                        <span className={cn(
                          "text-[8px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest border mt-1 inline-block",
                          app.status === 'approved' ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
                        )}>
                          {app.status === 'approved' ? 'Published' : 'Under Review'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingApp(app)} className="rounded-xl bg-secondary/30 hover:bg-primary/20 hover:text-primary">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setAppToDelete(app)} className="rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/20 rounded-xl border border-border/50 text-center">
                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Likes</p>
                      <p className="text-sm font-black italic">{app.likes || 0}</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-xl border border-border/50 text-center">
                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Views</p>
                      <p className="text-sm font-black italic">{app.views || '0'}</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-xl border border-border/50 text-center">
                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Played</p>
                      <p className="text-sm font-black italic">{app.played || '0'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <ShadDialog open={!!editingApp} onOpenChange={(open) => !open && setEditingApp(null)}>
          <ShadDialogContent className="rounded-3xl border-border bg-card/95 backdrop-blur-xl max-w-lg">
            <ShadDialogHeader>
              <ShadDialogTitle className="text-xl font-black uppercase italic tracking-tighter">Modify Application</ShadDialogTitle>
            </ShadDialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Game Name (Max 12)</Label>
                  <Input value={editingApp?.gameName || ''} maxLength={12} onChange={(e) => setEditingApp({...editingApp, gameName: e.target.value})} className="rounded-xl bg-secondary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Classification (Max 15)</Label>
                  <Input value={editingApp?.gameType || ''} maxLength={15} onChange={(e) => setEditingApp({...editingApp, gameType: e.target.value})} className="rounded-xl bg-secondary/20" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">App Core URL</Label>
                <Input value={editingApp?.gameUrl || ''} onChange={(e) => setEditingApp({...editingApp, gameUrl: e.target.value})} className="rounded-xl bg-secondary/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Thumbnail URL</Label>
                <Input value={editingApp?.thumbnailUrl || ''} onChange={(e) => setEditingApp({...editingApp, thumbnailUrl: e.target.value})} className="rounded-xl bg-secondary/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Developer Bio (Max 20)</Label>
                <Input value={editingApp?.developerInfo || ''} maxLength={20} onChange={(e) => setEditingApp({...editingApp, developerInfo: e.target.value})} className="rounded-xl bg-secondary/20" />
              </div>
            </div>
            <ShadDialogFooter>
              <Button onClick={handleUpdateApp} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-xl">
                <Save className="w-4 h-4 mr-2" /> Save Protocol Changes
              </Button>
            </ShadDialogFooter>
          </ShadDialogContent>
        </ShadDialog>

        <ShadDialog open={!!appToDelete} onOpenChange={(open) => { if(!open) { setAppToDelete(null); setDeleteConfirmText(''); } }}>
          <ShadDialogContent className="rounded-3xl border-destructive/30 bg-card/95 backdrop-blur-xl max-w-sm">
            <ShadDialogHeader>
              <ShadDialogTitle className="text-xl font-black uppercase italic tracking-tighter text-destructive">Delete Application?</ShadDialogTitle>
            </ShadDialogHeader>
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                Do You Want To delete <span className="text-foreground italic">{appToDelete?.gameName}</span>?
                <br />
                Type <span className="text-primary font-black">Delete</span> to Remove it permanent.
              </p>
              <Input 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'Delete' here"
                className="rounded-xl bg-secondary/20 border-destructive/20 text-center"
              />
            </div>
            <ShadDialogFooter>
              <Button 
                variant="destructive"
                disabled={deleteConfirmText !== 'Delete'}
                onClick={handleConfirmDelete}
                className="w-full font-black uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-destructive/20"
              >
                Confirm Deletion
              </Button>
            </ShadDialogFooter>
          </ShadDialogContent>
        </ShadDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShadDialog open={showAdminKeyDialog} onOpenChange={setShowAdminKeyDialog}>
        <ShadDialogContent className="rounded-3xl border-accent/30 bg-card/90 backdrop-blur-xl">
          <ShadDialogHeader>
            <ShadDialogTitle className="text-xl font-black uppercase italic tracking-tighter">Enter Admin Protocol</ShadDialogTitle>
          </ShadDialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="System Key" 
              value={adminKeyInput} 
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="rounded-xl bg-secondary/20 border-accent/20 text-center text-lg tracking-widest"
            />
          </div>
          <ShadDialogFooter>
            <Button onClick={verifyAdminKey} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black uppercase tracking-widest">Authorize Access</Button>
          </ShadDialogFooter>
        </ShadDialogContent>
      </ShadDialog>

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border py-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <MonitorPlay className="text-white w-6 h-6" />
                </div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground leading-none">Connect Plus Console</h1>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full w-10 h-10 border border-border/50"
                    onPointerDown={startLongPress}
                    onPointerUp={endLongPress}
                    onPointerLeave={endLongPress}
                  >
                    <Settings className="w-6 h-6 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background w-full sm:max-w-md p-0 flex flex-col shadow-2xl">
                  <SheetHeader className="p-8 border-b border-border">
                    <SheetTitle>
                      <div 
                        className="flex items-center gap-4 cursor-pointer group hover:opacity-80 transition-opacity"
                        onClick={() => setShowUserAnalytics(true)}
                      >
                        <Avatar className="h-16 w-16 border-2 border-primary/30 group-hover:border-primary">
                          <AvatarImage src={loggedInUser.profileImageUrl} />
                          <AvatarFallback className="bg-secondary text-primary text-xl font-bold">{loggedInUser.username.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic mb-1">Identity</p>
                          <p className="text-2xl font-black italic tracking-tighter text-foreground leading-none">{loggedInUser.username}</p>
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">System Setting</p>
                      <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border">
                        <span className="text-xs font-bold uppercase tracking-widest">Theme</span>
                        <Button variant="outline" size="sm" onClick={toggleTheme} className="rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest">
                          {theme === 'dark' ? <><Moon className="w-3.5 h-3.5" /> Dark</> : <><Sun className="w-3.5 h-3.5 text-orange-500" /> Light</>}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/40 p-5 rounded-2xl border border-border">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">XP Points</p>
                        <p className="text-2xl font-black italic tracking-tighter text-foreground">{loggedInUser.xp || '0'}</p>
                      </div>
                      <button 
                        onClick={() => setShowUserAnalytics(true)}
                        className="bg-secondary/40 p-5 rounded-2xl border border-border text-left hover:border-primary/50 transition-colors group"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 group-hover:text-primary">Analytics</p>
                        <p className="text-xs font-black italic uppercase leading-none">{userSubmissions.length} Apps</p>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setShowSavedGames(true)} 
                        variant="outline"
                        className="w-full h-14 bg-secondary/20 hover:bg-primary/10 text-foreground rounded-2xl border-border text-[10px] font-black uppercase tracking-widest"
                      >
                        <Bookmark className="w-4 h-4 mr-2" /> Saved Items
                      </Button>
                      <Button 
                        onClick={() => setShowNewProject(true)} 
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl border-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" /> New Application
                      </Button>
                      <div className="p-5 bg-card rounded-2xl border border-border shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest italic flex items-center gap-2 mb-4">
                          <History className="w-4 h-4 text-primary" /> Recent Play
                        </p>
                        <div className="p-3 bg-secondary/20 rounded-xl border border-border/50 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <MonitorPlay className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-black italic uppercase">{loggedInUser.recentPlayed?.title || 'No Activity'}</p>
                            <p className="text-[8px] text-muted-foreground uppercase">{loggedInUser.recentPlayed?.timestamp ? `Played ${new Date(loggedInUser.recentPlayed.timestamp).toLocaleTimeString()}` : 'Ready'}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={handleLogout} className="w-full h-14 bg-destructive/5 text-destructive rounded-2xl border border-destructive/20 text-[10px] font-black uppercase tracking-widest">
                        <LogOut className="w-4 h-4 mr-2" /> Logout Console
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search Application" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-11 bg-secondary/10 border-border rounded-xl focus:border-primary/50 text-sm font-bold uppercase tracking-wider italic"
              />
            </div>
          </div>
        </header>

        <section className="pb-20 space-y-6 pt-6">
          <div className="grid gap-6">
            {displayGames.length > 0 ? (
              displayGames.map((game) => (
                <GameCard key={game.id} game={game} onLaunch={handleLaunchGame} user={loggedInUser} onAboutDev={setViewingDev} onShowId={setViewingPostId} savedGames={savedGames} />
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-black uppercase italic tracking-widest text-xs">No Application Found // Match Filter Failed</p>
              </div>
            )}
          </div>
        </section>

        <footer className="py-12 flex flex-col items-center border-t border-border/50">
          <p className="text-sm font-black italic uppercase tracking-[0.3em] text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
            © Connect_Plus_Consoles
          </p>
        </footer>
      </main>

      <GameLaunchPad game={activeGame} onClose={() => setActiveGame(null)} />
    </div>
  );
}
