import { useState, useEffect, useRef } from "react";

const BIBLE_VERSES = [
  { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { verse: "The Lord is my strength and my shield; my heart trusts in him, and he helps me.", ref: "Psalm 28:7" },
  { verse: "But those who hope in the Lord will renew their strength.", ref: "Isaiah 40:31" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { verse: "For God gave us a spirit not of fear but of power and love and self-discipline.", ref: "2 Timothy 1:7" },
  { verse: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  { verse: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest.", ref: "Galatians 6:9" },
  { verse: "The Lord your God is with you, the Mighty Warrior who saves.", ref: "Zephaniah 3:17" },
  { verse: "He who began a good work in you will carry it on to completion.", ref: "Philippians 1:6" },
  { verse: "Do you not know that your bodies are temples of the Holy Spirit?", ref: "1 Corinthians 6:19" },
  { verse: "Physical training is of some value, but godliness has value for all things.", ref: "1 Timothy 4:8" },
  { verse: "So whether you eat or drink or whatever you do, do it all for the glory of God.", ref: "1 Corinthians 10:31" },
  { verse: "The steps of a man are established by the Lord, when he delights in his way.", ref: "Psalm 37:23" },
  { verse: "Discipline yourself for the purpose of godliness.", ref: "1 Timothy 4:7" },
];

const DEFAULT_ITEMS = [
  { id: "1", label: "Pray", emoji: "🙏", type: "daily" },
  { id: "2", label: "200 Crunches", emoji: "💪", type: "daily" },
  { id: "3", label: "200 Pushups", emoji: "🔥", type: "daily" },
  { id: "4", label: "3 Min Plank", emoji: "🧱", type: "daily" },
  { id: "5", label: "50 Squats", emoji: "🦵", type: "daily" },
  { id: "6", label: "50 Toe Raises", emoji: "🦶", type: "daily" },
  { id: "7", label: "1 Mile Run", emoji: "🏃", type: "daily" },
  { id: "8", label: "15 Pull-ups", emoji: "🏋️", type: "daily" },
  { id: "9", label: "Read Bible", emoji: "📖", type: "daily" },
  { id: "10", label: "Weigh-in", emoji: "⚖️", type: "monthly" },
];

const getDateKey = (date = new Date()) => date.toISOString().split("T")[0];
const isFirstOfMonth = (date = new Date()) => date.getDate() === 1;

const getDayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getTodayVerse = () => {
  const dayIndex = getDayOfYear() % BIBLE_VERSES.length;
  return BIBLE_VERSES[dayIndex];
};

// localStorage helpers
const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
};

export default function App() {
  const [items, setItems] = useState(() => loadState("dg_items", DEFAULT_ITEMS));
  const [checkedItems, setCheckedItems] = useState(() => loadState("dg_checked", {}));
  const [view, setView] = useState("today");
  const [showComplete, setShowComplete] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemEmoji, setNewItemEmoji] = useState("✅");
  const [newItemType, setNewItemType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Persist to localStorage
  useEffect(() => { saveState("dg_items", items); }, [items]);
  useEffect(() => { saveState("dg_checked", checkedItems); }, [checkedItems]);

  const today = getDateKey();
  const todayChecked = checkedItems[today] || [];
  const dailyItems = items.filter((i) => i.type === "daily");
  const monthlyItems = items.filter((i) => i.type === "monthly");
  const showMonthly = isFirstOfMonth();
  const visibleItems = showMonthly ? items : dailyItems;
  const completedCount = visibleItems.filter((item) => todayChecked.includes(item.id)).length;
  const progressPct = visibleItems.length > 0 ? (completedCount / visibleItems.length) * 100 : 0;

  const getStreak = () => {
    let streak = 0;
    let d = new Date();
    const todayKey = getDateKey(d);
    const todayItems = checkedItems[todayKey] || [];
    const todayDaily = items.filter((i) => i.type === "daily");
    const todayComplete = todayDaily.every((item) => todayItems.includes(item.id));

    if (!todayComplete) {
      d.setDate(d.getDate() - 1);
    }

    while (true) {
      const key = getDateKey(d);
      const dayChecked = checkedItems[key] || [];
      const dayDailyItems = items.filter((i) => i.type === "daily");
      const dayComplete = dayDailyItems.every((item) => dayChecked.includes(item.id));
      if (dayComplete) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  const toggleItem = (id) => {
    const todayList = [...(checkedItems[today] || [])];
    const wasChecked = todayList.includes(id);
    const newList = wasChecked ? todayList.filter((x) => x !== id) : [...todayList, id];
    const newChecked = { ...checkedItems, [today]: newList };
    setCheckedItems(newChecked);

    const nowAllDone = visibleItems.every((item) => newList.includes(item.id));
    if (nowAllDone && !wasChecked) {
      setShowComplete(true);
      setTimeout(() => setShowComplete(false), 5000);
    }
  };

  const addItem = () => {
    if (!newItemLabel.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      label: newItemLabel.trim(),
      emoji: newItemEmoji || "✅",
      type: newItemType,
    };
    setItems([...items, newItem]);
    setNewItemLabel("");
    setNewItemEmoji("✅");
    setNewItemType("daily");
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const verse = getTodayVerse();

  const getMonthDays = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayChecked = checkedItems[dateKey] || [];
      const dayDailyItems = items.filter((i) => i.type === "daily");
      const isComplete = dayDailyItems.length > 0 && dayDailyItems.every((item) => dayChecked.includes(item.id));
      const isPartial = dayChecked.length > 0 && !isComplete;
      const isToday = dateKey === today;
      const isFuture = new Date(dateKey) > new Date();

      cells.push(
        <div key={day} style={{
          width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: isToday ? 700 : 400,
          background: isComplete ? "#22c55e" : isPartial ? "rgba(234,179,8,0.25)" : isToday ? "rgba(255,255,255,0.1)" : "transparent",
          color: isComplete ? "#000" : isFuture ? "rgba(255,255,255,0.2)" : "#fff",
          border: isToday ? "2px solid #f59e0b" : "2px solid transparent",
          transition: "all 0.2s", fontFamily: "'JetBrains Mono', monospace",
        }}>{day}</div>
      );
    }

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={() => setSelectedDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 20, cursor: "pointer", padding: 8 }}>‹</button>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#fff" }}>{monthNames[month]} {year}</span>
          <button onClick={() => setSelectedDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 20, cursor: "pointer", padding: 8 }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, justifyItems: "center" }}>
          {dayNames.map((d, i) => (
            <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{d}</div>
          ))}
          {cells}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} /> Complete
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(234,179,8,0.4)" }} /> Partial
          </div>
        </div>
      </div>
    );
  };

  const renderConfetti = () => {
    if (!showComplete) return null;
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      color: ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444", "#a855f7", "#fff"][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 6,
    }));

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100 }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: "absolute", top: -10, left: `${p.left}%`, width: p.size, height: p.size,
            borderRadius: p.size > 7 ? "50%" : "1px", background: p.color,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }} />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg, #0a0a0a 0%, #1a1205 50%, #0a0a0a 100%)",
      color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", position: "relative", overflow: "hidden",
      paddingBottom: "env(safe-area-inset-bottom, 20px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes slideUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes checkPop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input:focus, button:focus { outline: none; }
        body { overscroll-behavior: none; }
      `}</style>

      {renderConfetti()}

      {showComplete && (
        <div onClick={() => setShowComplete(false)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99, animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ textAlign: "center", animation: "slideUp 0.5s ease", padding: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔥</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8, color: "#f59e0b" }}>All Done.</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>
              "{verse.verse}"
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#f59e0b" }}>— {verse.ref}</p>
            {streak > 1 && (
              <div style={{ marginTop: 24, padding: "8px 20px", background: "rgba(245,158,11,0.15)", borderRadius: 20, display: "inline-block" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#f59e0b" }}>🔥 {streak} day streak</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", paddingTop: "max(24px, env(safe-area-inset-top))", position: "relative" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, animation: "slideUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, margin: 0, color: "#fff", letterSpacing: "-0.5px" }}>Daily Grind</h1>
            <div style={{ display: "flex", gap: 4 }}>
              {["today", "history", "edit"].map((v) => (
                <button key={v} onClick={() => setView(v)} style={{
                  background: view === v ? "rgba(245,158,11,0.2)" : "transparent",
                  border: "1px solid", borderColor: view === v ? "#f59e0b" : "rgba(255,255,255,0.1)",
                  color: view === v ? "#f59e0b" : "rgba(255,255,255,0.4)",
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s",
                }}>{v}</button>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        {view === "today" && (
          <div style={{ display: "flex", gap: 12, marginBottom: 28, animation: "slideUp 0.5s ease" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{streak}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>day streak</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, textAlign: "center" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{completedCount}/{visibleItems.length}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>completed</div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {view === "today" && (
          <div style={{ marginBottom: 28, animation: "slideUp 0.55s ease" }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progressPct}%`,
                background: progressPct === 100 ? "#22c55e" : "linear-gradient(90deg, #f59e0b, #f97316)",
                borderRadius: 4, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
            </div>
          </div>
        )}

        {/* TODAY */}
        {view === "today" && (
          <div>
            {dailyItems.map((item, index) => {
              const isChecked = todayChecked.includes(item.id);
              return (
                <div key={item.id} onClick={() => toggleItem(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", marginBottom: 8,
                  background: isChecked ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: "1px solid", borderColor: isChecked ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                  borderRadius: 14, cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `slideUp ${0.3 + index * 0.05}s ease`, opacity: isChecked ? 0.7 : 1,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, border: "2px solid",
                    borderColor: isChecked ? "#22c55e" : "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isChecked ? "#22c55e" : "transparent", transition: "all 0.2s", flexShrink: 0,
                    animation: isChecked ? "checkPop 0.3s ease" : "none",
                  }}>
                    {isChecked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span style={{ fontSize: 16, marginRight: 2 }}>{item.emoji}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
                    color: isChecked ? "rgba(255,255,255,0.4)" : "#fff",
                    textDecoration: isChecked ? "line-through" : "none", transition: "all 0.2s",
                  }}>{item.label}</span>
                </div>
              );
            })}

            {(showMonthly || monthlyItems.some((item) => todayChecked.includes(item.id))) && monthlyItems.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, paddingLeft: 4 }}>Monthly</div>
                {monthlyItems.map((item) => {
                  const isChecked = todayChecked.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => toggleItem(item.id)} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", marginBottom: 8,
                      background: isChecked ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.03)",
                      border: "1px solid", borderColor: isChecked ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.06)",
                      borderRadius: 14, cursor: "pointer", transition: "all 0.25s",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, border: "2px solid",
                        borderColor: isChecked ? "#a855f7" : "rgba(255,255,255,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isChecked ? "#a855f7" : "transparent", transition: "all 0.2s", flexShrink: 0,
                      }}>
                        {isChecked && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <span style={{ fontSize: 16, marginRight: 2 }}>{item.emoji}</span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
                        color: isChecked ? "rgba(255,255,255,0.4)" : "#fff",
                        textDecoration: isChecked ? "line-through" : "none",
                      }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{
              marginTop: 28, padding: 20, background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.1)", borderRadius: 14, animation: "slideUp 0.8s ease",
            }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                "{verse.verse}"
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#f59e0b", margin: "8px 0 0 0" }}>— {verse.ref}</p>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && <div style={{ animation: "fadeIn 0.3s ease" }}>{renderCalendar()}</div>}

        {/* EDIT */}
        {view === "edit" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Your Items</div>
              {items.map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", marginBottom: 6,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
                }}>
                  {editingItem === item.id ? (
                    <>
                      <input value={item.emoji} onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, emoji: e.target.value } : i)))}
                        style={{ width: 36, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", textAlign: "center", padding: 4, fontSize: 14 }} />
                      <input value={item.label} onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, label: e.target.value } : i)))}
                        style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }} />
                      <button onClick={() => setEditingItem(null)}
                        style={{ background: "#f59e0b", border: "none", color: "#000", padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Save</button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 16 }}>{item.emoji}</span>
                      <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#fff" }}>{item.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>{item.type}</span>
                      <button onClick={() => setEditingItem(item.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: 4 }}>✎</button>
                      <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: 14, padding: 4 }}>✕</button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Add New Item</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={newItemEmoji} onChange={(e) => setNewItemEmoji(e.target.value)} placeholder="😊"
                  style={{ width: 44, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", textAlign: "center", padding: 8, fontSize: 16 }} />
                <input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} placeholder="Item name..."
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "8px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {["daily", "monthly"].map((t) => (
                    <button key={t} onClick={() => setNewItemType(t)} style={{
                      background: newItemType === t ? "rgba(245,158,11,0.2)" : "transparent",
                      border: "1px solid", borderColor: newItemType === t ? "#f59e0b" : "rgba(255,255,255,0.1)",
                      color: newItemType === t ? "#f59e0b" : "rgba(255,255,255,0.3)",
                      padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                      fontFamily: "'JetBrains Mono', monospace", textTransform: "capitalize",
                    }}>{t}</button>
                  ))}
                </div>
                <button onClick={addItem} style={{
                  marginLeft: "auto", background: "#f59e0b", border: "none", color: "#000",
                  padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}>Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
