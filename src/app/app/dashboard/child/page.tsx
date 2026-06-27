"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { submitGameScore } from "@/api";

// ── Memory Game ───────────────────────────────────────────────
const EMOJIS = ["🦁", "🐯", "🐻", "🦊", "🐸", "🐧", "🦜", "🐬"];

function MemoryGame({ onComplete }: { onComplete: (score: number, time: number) => void }) {
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime] = useState(Date.now());
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const paired = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(paired.map((emoji, id) => ({ id, emoji, flipped: false, matched: false })));
  }, []);

  const handleClick = (id: number) => {
    if (flipped.length === 2 || cards[id].flipped || cards[id].matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newFlipped = [...flipped, id];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setFlipped([]);
        const newMatches = matches + 1;
        setMatches(newMatches);
        if (newMatches === EMOJIS.length) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const score = Math.max(0, 100 - moves * 3);
          setComplete(true);
          setTimeout(() => onComplete(score, elapsed), 500);
        }
      } else {
        setTimeout(() => {
          setCards(c => c.map(card => newFlipped.includes(card.id) ? { ...card, flipped: false } : card));
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <div className="text-center">
      <div className="flex justify-between mb-4 text-sm text-slate-500">
        <span>Moves: {moves}</span>
        <span>Matches: {matches}/{EMOJIS.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <button key={card.id} onClick={() => handleClick(card.id)}
            className={`w-full aspect-square rounded-2xl text-3xl flex items-center justify-center border-2 transition-all duration-300 ${card.flipped || card.matched
              ? card.matched ? "border-green-300 bg-green-50 dark:bg-green-950/40 scale-95" : "border-blue-300 bg-blue-50 dark:bg-blue-950/40"
              : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30"
              }`}>
            {(card.flipped || card.matched) ? card.emoji : "❓"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Attention Game ────────────────────────────────────────────
function AttentionGame({ onComplete }: { onComplete: (score: number, reactionTime: number) => void }) {
  const [target, setTarget] = useState<{ x: number; y: number; emoji: string } | null>(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [round, setRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lastAppear, setLastAppear] = useState(0);

  const showTarget = useCallback(() => {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    const emojis = ["⭐", "🎯", "💎", "🌟", "🔴"];
    setTarget({ x, y, emoji: emojis[Math.floor(Math.random() * emojis.length)] });
    setLastAppear(Date.now());
    setTimeout(() => {
      setTarget(null);
      setMisses(m => m + 1);
    }, 1500);
  }, []);

  useEffect(() => {
    if (round >= 10) {
      const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 999;
      onComplete(score, Math.round(avg));
      return;
    }
    const timer = setTimeout(showTarget, 800 + Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [round, score, reactionTimes, showTarget, onComplete]);

  const handleHit = () => {
    if (!target) return;
    const rt = Date.now() - lastAppear;
    setReactionTimes(r => [...r, rt]);
    setScore(s => s + Math.round(1000 / Math.max(rt, 200)));
    setTarget(null);
    setRound(r => r + 1);
  };

  return (
    <div>
      <div className="flex justify-between mb-3 text-sm text-slate-500">
        <span>Score: {score}</span><span>Round: {round}/10</span><span>Misses: {misses}</span>
      </div>
      <div className="relative w-full h-64 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-100 dark:border-blue-900 overflow-hidden cursor-pointer"
        onClick={() => misses < 5 && setMisses(m => m + 1)}>
        <p className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm select-none">
          {!target && round < 10 ? "Wait for the target..." : ""}
        </p>
        {target && (
          <button onClick={e => { e.stopPropagation(); handleHit(); }}
            className="absolute text-4xl animate-bounce-in transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-100"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}>
            {target.emoji}
          </button>
        )}
      </div>
      <p className="text-center text-xs text-slate-400 mt-2">Tap the targets as fast as you can! 🎯</p>
    </div>
  );
}

// ── Emotion Recognition Game ──────────────────────────────────
const EMOTIONS = [
  { emoji: "😊", name: "Happy", options: ["Happy", "Sad", "Angry", "Surprised"] },
  { emoji: "😢", name: "Sad", options: ["Happy", "Sad", "Scared", "Confused"] },
  { emoji: "😡", name: "Angry", options: ["Happy", "Angry", "Tired", "Excited"] },
  { emoji: "😮", name: "Surprised", options: ["Bored", "Surprised", "Angry", "Sad"] },
  { emoji: "😴", name: "Tired", options: ["Tired", "Happy", "Excited", "Worried"] },
];

function EmotionGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const current = EMOTIONS[idx];

  const handleAnswer = (opt: string) => {
    setSelected(opt);
    const correct = opt === current.name;
    if (correct) setScore(s => s + 20);
    setTimeout(() => {
      if (idx + 1 >= EMOTIONS.length) {
        onComplete(score + (correct ? 20 : 0));
      } else {
        setIdx(i => i + 1);
        setSelected(null);
      }
    }, 800);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-slate-500 mb-4">Question {idx + 1}/{EMOTIONS.length} · Score: {score}</p>
      <div className="text-8xl mb-6 animate-bounce-in">{current.emoji}</div>
      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-4">How is this person feeling?</p>
      <div className="grid grid-cols-2 gap-3">
        {current.options.sort(() => Math.random() - 0.5).map(opt => (
          <button key={opt} onClick={() => !selected && handleAnswer(opt)}
            className={`p-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${selected === opt
              ? opt === current.name ? "border-green-500 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-600"
              : selected && opt === current.name ? "border-green-500 bg-green-50 text-green-700"
                : "border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-700 dark:text-slate-300 dark:border-slate-600"
              }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Child Dashboard ──────────────────────────────────────
export default function ChildDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ game: string; score: number; date: string }>>([
    { game: "Memory Game", score: 78, date: "Yesterday" },
    { game: "Attention Game", score: 85, date: "2 days ago" },
    { game: "Emotion Recognition", score: 60, date: "3 days ago" },
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) { router.push("/app/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleGameComplete = async (gameName: string, score: number, extra?: number) => {
    try {
      if (!user) return;

      // 1. Safely extract target ID footprint from user session
      const childId = (user as any).child?.id || (user as any).id;

      // 2. Transmit analytical game telemetry over the wire to MongoDB
      await submitGameScore({ childId, gameName, score });

      // 3. Dynamically update visual timeline stats inside dashboard
      setResults(r => [{ game: gameName, score, date: "Just now" }, ...r.slice(0, 9)]);
      setActiveGame(null);
    } catch (err) {
      console.error("Failed to sync client game scores to backend core:", err);
    }
  };

  const games = [
    { id: "memory", name: "Memory Match", emoji: "🧠", desc: "Flip and match the cards!", color: "from-blue-400 to-blue-600", component: "memory" },
    { id: "attention", name: "Catch the Star", emoji: "⭐", desc: "Tap the targets as fast as you can!", color: "from-yellow-400 to-orange-500", component: "attention" },
    { id: "emotion", name: "Emotion Explorer", emoji: "😊", desc: "Guess how people are feeling!", color: "from-pink-400 to-rose-500", component: "emotion" },
    { id: "shape", name: "Shape Sorter", emoji: "🔷", desc: "Match the shapes and colors!", color: "from-green-400 to-emerald-600", component: null },
    { id: "puzzle", name: "Brain Puzzle", emoji: "🧩", desc: "Solve fun picture puzzles!", color: "from-purple-400 to-purple-600", component: null },
  ];

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
      <AppSidebar role="parent" userName={user.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="🎮 Game Time!" userName={user.name} role="parent" />
        <main className="flex-1 overflow-y-auto p-6 pt-16 md:pt-6">

          {/* Welcome banner */}
          {!activeGame && (
            <div className="card p-6 mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-0 text-white text-center">
              <h2 className="text-2xl font-extrabold mb-1">Hi, {firstName}! 👋</h2>
              <p className="text-blue-100">Ready to play and learn? Pick a game below!</p>
              <div className="flex justify-center gap-4 mt-3">
                {["⭐ Stars earned: 24", "🏆 Best score: 92", "🎮 Games played: 18"].map(t => (
                  <span key={t} className="text-xs text-white/80 bg-white/10 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Active Game */}
          {activeGame && (
            <div className="card p-6 mb-6 max-w-lg mx-auto animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {games.find(g => g.id === activeGame)?.emoji} {games.find(g => g.id === activeGame)?.name}
                </h3>
                <button onClick={() => setActiveGame(null)} className="btn btn-sm btn-ghost">✕ Exit</button>
              </div>
              {activeGame === "memory" && <MemoryGame onComplete={(s, t) => handleGameComplete("Memory Match", s, t)} />}
              {activeGame === "attention" && <AttentionGame onComplete={(s, rt) => handleGameComplete("Catch the Star", s, rt)} />}
              {activeGame === "emotion" && <EmotionGame onComplete={(s) => handleGameComplete("Emotion Explorer", s)} />}
              {!["memory", "attention", "emotion"].includes(activeGame) && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{games.find(g => g.id === activeGame)?.emoji}</div>
                  <p className="text-slate-500">This game is coming soon! 🚀</p>
                  <button onClick={() => setActiveGame(null)} className="btn btn-primary mt-4 btn-sm">Back to Games</button>
                </div>
              )}
            </div>
          )}

          {/* Game Grid */}
          {!activeGame && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {games.map(game => (
                <button key={game.id} onClick={() => setActiveGame(game.id)}
                  className={`card p-5 text-center group hover:shadow-card-hover hover:scale-105 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br ${game.color} text-white`}>
                  <div className="text-4xl mb-2 group-hover:animate-bounce">{game.emoji}</div>
                  <h3 className="font-bold text-sm mb-1">{game.name}</h3>
                  <p className="text-xs opacity-80">{game.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Recent Scores */}
          {!activeGame && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">🏆 Recent Scores</h3>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{games.find(g => g.name === r.game)?.emoji || "🎮"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{r.game}</p>
                        <p className="text-xs text-slate-400">{r.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{r.score}</p>
                      <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-600 rounded-full mt-1">
                        <div className="h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full" style={{ width: `${r.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
