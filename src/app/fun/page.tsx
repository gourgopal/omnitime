"use client";

import { useState, useEffect } from "react";
import { differenceInDays, differenceInYears, format, addYears } from "date-fns";
import { Heart, Sparkles, Gift, BatteryMedium, Plus, Trash2, Crown, Edit2, Check, BellRing, BellOff, Sun, Moon, Hash } from "lucide-react";
import { LIFESPAN_DATA, calculateLifespan } from "@/lib/lifespan";
import { getAstrologyChart } from "@/lib/astrology";
import { getLifePathNumber, getLifePathMeaning } from "@/lib/numerology";
import { useNotifications } from "@/components/notification-provider";

interface SavedPerson { id: string; name: string; dob: string; gender: "male" | "female"; country: string; }
interface SavedItem { id: string; name: string; date: string; }
interface CountdownItem { id: string; name: string; date: string; type: "manual" | "birthday" | "anniversary"; originalId?: string; }

function generateId() { return Math.random().toString(36).substr(2, 9); }

function getNextOccurrence(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0,0,0,0);
  const currentYearDate = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  if (currentYearDate < now) {
     return new Date(now.getFullYear() + 1, date.getMonth(), date.getDate());
  }
  return currentYearDate;
}

export default function FunCalculators() {
  const [tab, setTab] = useState<"age" | "lifespan" | "relationship" | "countdown">("age");
  const [mounted, setMounted] = useState(false);
  
  // Unified States
  const [savedPeople, setSavedPeople] = useState<SavedPerson[]>([]);
  const [savedRels, setSavedRels] = useState<SavedItem[]>([]);
  const [savedCounts, setSavedCounts] = useState<SavedItem[]>([]); // manual countdowns
  
  const { notifGranted, triggerModalWithContext, setIsModalOpen } = useNotifications();

  // Input States
  const [inputName, setInputName] = useState("");
  const [inputDate, setInputDate] = useState("1990-01-01");
  const [inputGender, setInputGender] = useState<"male" | "female">("male");
  const [inputCountry, setInputCountry] = useState("Global Average");
  
  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setMounted(true);
    
    // Data Migration & Loading
    let peopleStr = localStorage.getItem("omnitime_people");
    if (!peopleStr) {
      // Migrate old data
      const ages = JSON.parse(localStorage.getItem("omnitime_ages") || "[]");
      const lifespans = JSON.parse(localStorage.getItem("omnitime_lifespans") || "[]");
      const mappedAges = ages.map((a: any) => ({ id: a.id, name: a.name, dob: a.date, gender: "male", country: "Global Average" }));
      const mappedLifespans = lifespans.map((l: any) => ({ id: l.id, name: l.name, dob: l.dob, gender: l.gender, country: l.country }));
      
      const allPeople = [...mappedLifespans, ...mappedAges];
      const uniquePeople = allPeople.filter((v,i,a)=>a.findIndex((t:any)=>(t.name === v.name))===i);
      
      localStorage.setItem("omnitime_people", JSON.stringify(uniquePeople));
      peopleStr = JSON.stringify(uniquePeople);
    }
    
    setSavedPeople(JSON.parse(peopleStr));
    setSavedRels(JSON.parse(localStorage.getItem("omnitime_rels") || "[]"));
    setSavedCounts(JSON.parse(localStorage.getItem("omnitime_counts") || "[]"));
  }, []);

  const getUnifiedCountdowns = (): CountdownItem[] => {
    const autoBdays: CountdownItem[] = savedPeople.map(p => ({
      id: `bday_${p.id}`, originalId: p.id, name: `${p.name}'s Birthday`, date: getNextOccurrence(p.dob).toISOString(), type: "birthday"
    }));
    const autoAnnis: CountdownItem[] = savedRels.map(r => ({
      id: `anni_${r.id}`, originalId: r.id, name: `${r.name} Anniversary`, date: getNextOccurrence(r.date).toISOString(), type: "anniversary"
    }));
    const manuals: CountdownItem[] = savedCounts.map(c => ({
      ...c, type: "manual"
    }));
    
    return [...autoBdays, ...autoAnnis, ...manuals].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const addPerson = () => {
    if (!inputDate) return;
    const newList: SavedPerson[] = [...savedPeople, { id: generateId(), name: inputName || "Unnamed", dob: inputDate, gender: inputGender, country: inputCountry }];
    setSavedPeople(newList); 
    localStorage.setItem("omnitime_people", JSON.stringify(newList));
    triggerModalWithContext("birthdays");
    resetForm();
  };

  const addRel = () => {
    if (!inputDate) return;
    const newList = [...savedRels, { id: generateId(), name: inputName || "Relationship", date: inputDate }];
    setSavedRels(newList); 
    localStorage.setItem("omnitime_rels", JSON.stringify(newList));
    triggerModalWithContext("birthdays");
    resetForm();
  };

  const addCount = () => {
    if (!inputDate) return;
    const newList = [...savedCounts, { id: generateId(), name: inputName || "Event", date: inputDate }];
    setSavedCounts(newList); 
    localStorage.setItem("omnitime_counts", JSON.stringify(newList));
    triggerModalWithContext("birthdays");
    resetForm();
  };

  const resetForm = () => setInputName("");

  const deleteItem = (type: "person" | "rel" | "count", id: string) => {
    if (type === "person") { const l = savedPeople.filter(x => x.id !== id); setSavedPeople(l); localStorage.setItem("omnitime_people", JSON.stringify(l)); }
    else if (type === "rel") { const l = savedRels.filter(x => x.id !== id); setSavedRels(l); localStorage.setItem("omnitime_rels", JSON.stringify(l)); }
    else if (type === "count") { const l = savedCounts.filter(x => x.id !== id); setSavedCounts(l); localStorage.setItem("omnitime_counts", JSON.stringify(l)); }
  };

  const startEdit = (id: string, currentName: string) => { setEditingId(id); setEditName(currentName); };
  const saveEdit = (type: "person" | "rel" | "count", id: string) => {
    if (type === "person") { const l = savedPeople.map(x => x.id === id ? { ...x, name: editName } : x); setSavedPeople(l); localStorage.setItem("omnitime_people", JSON.stringify(l)); }
    else if (type === "rel") { const l = savedRels.map(x => x.id === id ? { ...x, name: editName } : x); setSavedRels(l); localStorage.setItem("omnitime_rels", JSON.stringify(l)); }
    else if (type === "count") { const l = savedCounts.map(x => x.id === id ? { ...x, name: editName } : x); setSavedCounts(l); localStorage.setItem("omnitime_counts", JSON.stringify(l)); }
    setEditingId(null);
  };

  if (!mounted) return null;

  const renderEditableTitle = (item: any, type: "person" | "rel" | "count", icon?: React.ReactNode) => {
    if (editingId === item.id) {
      return (
        <div className="flex items-center gap-2 mb-4">
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-[var(--background)] border-b-2 border-primary outline-none px-2 py-1 text-xl font-bold w-full" autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(type, item.id)}/>
          <button onClick={() => saveEdit(type, item.id)} className="text-green-500 hover:scale-110 transition-transform"><Check className="w-5 h-5"/></button>
        </div>
      );
    }
    return (
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 group cursor-text" onClick={() => startEdit(item.id, item.name)}>
        {icon} <span className="border-b-2 border-transparent group-hover:border-[var(--glass-border)] transition-colors">{item.name}</span>
        <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted-foreground)] ml-2" />
      </h3>
    );
  };

  const unifiedCountdowns = getUnifiedCountdowns();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      
      {/* Header & Notifications */}
      <div className="flex flex-col items-center mb-10 relative">
        <h1 className="text-4xl font-black mb-2 text-center flex items-center justify-center gap-3 tracking-tighter">
          <Sparkles className="text-primary w-8 h-8" /> Life & Fun
        </h1>
        <p className="text-center text-[var(--muted-foreground)] mb-4 text-sm font-medium">
          Track the days that matter most to you!
        </p>
        
        {/* Browser Notifications Toggle */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${notifGranted ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-primary text-[var(--foreground)]'}`}
        >
          {notifGranted ? <><BellRing className="w-4 h-4" /> Edit Smart Alerts</> : <><BellOff className="w-4 h-4" /> Enable Smart Alerts</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${tab === "age" ? "bg-primary text-white scale-105" : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] text-[var(--muted-foreground)]"}`} onClick={() => setTab("age")}>Age Tracker</button>
        <button className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${tab === "lifespan" ? "bg-primary text-white scale-105" : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] text-[var(--muted-foreground)]"}`} onClick={() => setTab("lifespan")}><BatteryMedium className="w-4 h-4" /> Lifespan Predictor</button>
        <button className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${tab === "relationship" ? "bg-primary text-white scale-105" : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] text-[var(--muted-foreground)]"}`} onClick={() => setTab("relationship")}>Relationships</button>
        <button className={`px-6 py-3 rounded-full font-bold transition-all shadow-sm flex items-center gap-2 ${tab === "countdown" ? "bg-primary text-white scale-105" : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] text-[var(--muted-foreground)]"}`} onClick={() => setTab("countdown")}>Countdowns</button>
      </div>

      <div className="relative min-h-[400px]">
        
        {/* ADD FORM */}
        <div className="max-w-2xl mx-auto mb-12 p-8 rounded-3xl bg-[var(--background)]/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black">
              {(tab === 'age' || tab === 'lifespan') && "Add a Person 👤"}
              {tab === 'relationship' && "Add a Relationship 💖"}
              {tab === 'countdown' && "Create a Countdown ⏳"}
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--muted-foreground)] uppercase tracking-wider">Name</label>
              <input 
                type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} 
                placeholder={(tab === 'age' || tab === 'lifespan') ? "e.g. My Bestie, John..." : tab === 'relationship' ? "e.g. Our Wedding..." : "e.g. Summer Vacation..."} 
                className="w-full text-2xl p-4 rounded-2xl border-none bg-[var(--glass-bg)] focus:ring-2 focus:ring-primary outline-none font-bold" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-[var(--muted-foreground)] uppercase tracking-wider">Date</label>
              <input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="w-full text-xl p-4 rounded-2xl border-none bg-[var(--glass-bg)] focus:ring-2 focus:ring-primary outline-none font-medium" />
            </div>
            
            {(tab === "age" || tab === "lifespan") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-[var(--muted-foreground)] uppercase tracking-wider">Gender</label>
                  <select value={inputGender} onChange={(e) => setInputGender(e.target.value as "male" | "female")} className="w-full p-4 rounded-2xl border-none bg-[var(--glass-bg)] focus:ring-2 focus:ring-primary outline-none font-medium text-lg">
                    <option value="male">Male 👨</option>
                    <option value="female">Female 👩</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-[var(--muted-foreground)] uppercase tracking-wider">Country</label>
                  <select value={inputCountry} onChange={(e) => setInputCountry(e.target.value)} className="w-full p-4 rounded-2xl border-none bg-[var(--glass-bg)] focus:ring-2 focus:ring-primary outline-none font-medium text-lg">
                    {LIFESPAN_DATA.map(c => <option key={c.country} value={c.country}>{c.country}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                if(tab === "age" || tab === "lifespan") addPerson();
                if(tab === "relationship") addRel();
                if(tab === "countdown") addCount();
              }}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xl shadow-lg hover:opacity-90 transition-opacity mt-4 flex justify-center items-center gap-2"
            >
              <Plus className="w-6 h-6" /> Save to Dashboard
            </button>
          </div>
        </div>

        {/* LIST RENDERING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {tab === "age" && savedPeople.map(item => {
            const dateObj = new Date(item.dob);
            const days = differenceInDays(new Date(), dateObj);
            const years = differenceInYears(new Date(), dateObj);
            const emoji = item.gender === "female" ? "👩" : "👨";
            
            // Generate Astrology/Numerology data
            let astro = null;
            let lpNumber = null;
            let lpMeaning = null;
            try {
              astro = getAstrologyChart(dateObj);
              lpNumber = getLifePathNumber(dateObj);
              lpMeaning = getLifePathMeaning(lpNumber);
            } catch(e) {}

            return (
              <div key={item.id} className="relative p-8 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:shadow-xl transition-all group overflow-hidden flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-150"></div>
                <button onClick={() => deleteItem("person", item.id)} className="absolute top-6 right-6 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors z-10"><Trash2 className="w-6 h-6"/></button>
                
                <div>
                  {renderEditableTitle(item, "person", <span className="text-2xl">{emoji}</span>)}
                  <div className="flex flex-col gap-2 mt-4 mb-6">
                    <div><span className="text-6xl font-black tracking-tighter text-primary">{days.toLocaleString()}</span> <span className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">days old</span></div>
                    <div><span className="text-3xl font-bold">{years}</span> <span className="text-sm font-medium text-[var(--muted-foreground)]">years</span></div>
                  </div>
                </div>

                {astro && lpNumber && (
                  <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[var(--glass-border)]">
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                      <Sun className="w-5 h-5 text-yellow-500 mb-1" />
                      <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Sun Sign</span>
                      <span className="font-black text-sm">{astro.sunSign}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-center group/tooltip relative">
                      <Hash className="w-5 h-5 text-pink-500 mb-1" />
                      <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Life Path</span>
                      <span className="font-black text-sm">{lpNumber}</span>
                      
                      {/* Tooltip for Meaning */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
                        {lpMeaning}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {tab === "lifespan" && savedPeople.map(item => {
            const res = calculateLifespan(item.dob, item.gender, item.country);
            const emoji = item.gender === "female" ? "👩" : "👨";
            return (
              <div key={item.id} className="relative p-6 lg:p-8 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:shadow-xl transition-all group overflow-hidden flex flex-col h-full lg:col-span-2 xl:col-span-3">
                <button onClick={() => deleteItem("person", item.id)} className="absolute top-6 right-6 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors z-10"><Trash2 className="w-6 h-6"/></button>
                {renderEditableTitle(item, "person", <span className="text-2xl">{emoji}</span>)}
                <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-6 -mt-2">Demographic: {item.gender}, {item.country}</p>
                
                <div className="mb-8">
                  <div className="w-full h-10 lg:h-12 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex mb-3 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 flex items-center justify-center text-xs lg:text-sm text-white font-black tracking-wider transition-all duration-1000" style={{ width: `${res.percentageLived}%` }}>
                      {res.percentageLived.toFixed(1)}%
                    </div>
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-xs lg:text-sm text-white font-black tracking-wider transition-all duration-1000" style={{ width: `${res.percentageRemaining}%` }}>
                      {res.percentageRemaining.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex justify-between font-bold text-xs lg:text-sm text-[var(--muted-foreground)]">
                    <span>{res.daysLived.toLocaleString()} days gone</span>
                    <span>~{res.daysRemaining.toLocaleString()} days remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mt-auto">
                  <div className="p-4 rounded-2xl bg-[var(--background)]/80 border border-[var(--glass-border)] shadow-sm">
                    <div className="text-2xl lg:text-3xl font-black text-[var(--foreground)] mb-1">{res.expectedAge.toFixed(1)} <span className="text-sm lg:text-lg">y</span></div>
                    <div className="text-[10px] lg:text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Avg Expectancy</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shadow-sm relative overflow-hidden">
                    <div className="text-2xl lg:text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1">{res.eliteExpectedAge.toFixed(1)} <span className="text-sm lg:text-lg">y</span></div>
                    <div className="text-[10px] lg:text-xs font-bold text-yellow-700/70 dark:text-yellow-500/70 uppercase tracking-wider relative z-10">Elite Class</div>
                    <Crown className="w-12 h-12 lg:w-16 lg:h-16 absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4 text-yellow-500/10" />
                  </div>
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-sm">
                    <div className="text-2xl lg:text-3xl font-black text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">{res.nonNaturalRisk}%</div>
                    <div className="text-[10px] lg:text-xs font-bold text-red-700/70 dark:text-red-500/70 uppercase tracking-wider">Non-Natural Risk</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-sm">
                    <div className="text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">{res.cancerRisk}%</div>
                    <div className="text-[10px] lg:text-xs font-bold text-purple-700/70 dark:text-purple-500/70 uppercase tracking-wider">Cancer Risk</div>
                  </div>
                </div>
              </div>
            );
          })}

          {tab === "relationship" && savedRels.map(item => {
            const days = differenceInDays(new Date(), new Date(item.date));
            return (
              <div key={item.id} className="relative p-8 rounded-3xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all text-center group overflow-hidden flex flex-col justify-center h-full min-h-[250px]">
                <button onClick={() => deleteItem("rel", item.id)} className="absolute top-6 right-6 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors"><Trash2 className="w-6 h-6"/></button>
                <div className="flex justify-center mb-4">
                  {renderEditableTitle(item, "rel", <Heart className="text-red-500 w-8 h-8 animate-pulse" fill="currentColor"/>)}
                </div>
                <div className="text-5xl lg:text-6xl font-black tracking-tighter text-red-500 mb-2">{days.toLocaleString()}</div>
                <div className="text-sm font-bold text-red-500/50 uppercase tracking-wider">days together</div>
              </div>
            );
          })}

          {tab === "countdown" && unifiedCountdowns.map(item => {
            const daysToGo = differenceInDays(new Date(item.date), new Date());
            const isToday = daysToGo === 0;
            const isPast = daysToGo < 0; // Only happens for un-updated manuals
            
            const icon = item.type === "birthday" ? <Sparkles className="text-yellow-500 w-8 h-8" /> : 
                         item.type === "anniversary" ? <Heart className="text-red-500 w-8 h-8" /> : 
                         <Gift className={`${isPast ? 'text-[var(--muted-foreground)]' : 'text-primary'} w-8 h-8`}/>;
            
            return (
              <div key={item.id} className={`relative p-8 rounded-3xl border ${isPast ? 'border-[var(--glass-border)] bg-[var(--glass-bg)]' : item.type === 'birthday' ? 'border-yellow-500/30 bg-yellow-500/5' : item.type === 'anniversary' ? 'border-red-500/30 bg-red-500/5' : 'border-primary/30 bg-primary/5'} hover:shadow-xl transition-all text-center group overflow-hidden flex flex-col justify-center h-full min-h-[250px]`}>
                {item.type === "manual" && (
                   <button onClick={() => deleteItem("count", item.id)} className="absolute top-6 right-6 text-red-500/0 group-hover:text-red-500/50 hover:!text-red-500 transition-colors"><Trash2 className="w-6 h-6"/></button>
                )}
                {item.type !== "manual" && (
                   <div className="absolute top-4 right-4 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--glass-bg)] px-2 py-1 rounded-full border border-[var(--glass-border)]">Auto-Synced</div>
                )}
                
                <div className="flex justify-center mb-4 mt-4">
                  {item.type === "manual" ? renderEditableTitle(item, "count", icon) : (
                    <h3 className="text-2xl font-bold flex items-center gap-2">{icon} <span className="text-xl line-clamp-1 break-all">{item.name}</span></h3>
                  )}
                </div>
                
                <div className={`text-5xl lg:text-6xl font-black tracking-tighter mb-2 ${isPast ? 'text-[var(--muted-foreground)]' : item.type === 'birthday' ? 'text-yellow-600 dark:text-yellow-400' : item.type === 'anniversary' ? 'text-red-500' : 'text-primary'}`}>
                  {isToday ? (
                    "Today! 🎉"
                  ) : isPast ? (
                    <>{Math.abs(daysToGo).toLocaleString()}</>
                  ) : (
                    <>{daysToGo.toLocaleString()}</>
                  )}
                </div>
                {!isToday && (
                  <div className={`text-sm font-bold uppercase tracking-wider opacity-50 ${isPast ? 'text-[var(--muted-foreground)]' : item.type === 'birthday' ? 'text-yellow-600 dark:text-yellow-400' : item.type === 'anniversary' ? 'text-red-500' : 'text-primary'}`}>
                    {isPast ? 'days ago' : 'days to go'}
                  </div>
                )}
              </div>
            );
          })}


          {/* Empty States */}
          {tab === "age" && savedPeople.length === 0 && <p className="text-center text-[var(--muted-foreground)] text-lg py-12">No people added yet. Fill the form above!</p>}
          {tab === "lifespan" && savedPeople.length === 0 && <p className="text-center text-[var(--muted-foreground)] text-lg py-12">No people added yet. Add someone to see their life battery!</p>}
          {tab === "relationship" && savedRels.length === 0 && <p className="text-center text-[var(--muted-foreground)] text-lg py-12">No relationships tracked. Add your marriage, friendship, or job anniversary!</p>}
          {tab === "countdown" && unifiedCountdowns.length === 0 && <p className="text-center text-[var(--muted-foreground)] text-lg py-12">No upcoming events. Add a countdown!</p>}

        </div>
      </div>
    </div>
  );
}
