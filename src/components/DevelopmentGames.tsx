"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, RefreshCw, Smile, Brain, Heart, Star, Dna, Play, Target, Timer, Trophy } from 'lucide-react';
import { GameScore, Language } from '../types';
import { TRANSLATIONS } from '../data';
import { submitGameScore, getGameScores, getPatients } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DevelopmentGamesProps {
  language: Language;
}

interface CardType {
  id: number;
  val: string;
  flipped: boolean;
  matched: boolean;
}

interface BubbleType {
  id: number;
  x: number; // percentage left
  y: number; // percentage top (starts at 100)
  color: 'sky' | 'emerald' | 'amber' | 'rose';
  size: number; // width/height in px
  speed: number; // speed step
}

export default function DevelopmentGames({ language }: DevelopmentGamesProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [activeGame, setActiveGame] = useState<'memory' | 'emotion' | 'bubbles' | 'shape_sorter' | 'brain_puzzle'>('memory');
  const [highScore, setHighScore] = useState<number>(140);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [scoreHistory, setScoreHistory] = useState<any[]>([]);

  // ----------------------------------------------------
  // GAME 1: MEMORY MATCHING STATES & LOGIC
  // ----------------------------------------------------
  const initialSymbols = ['🧠', '❤️', '⭐', '🧬', '🧠', '❤️', '⭐', '🧬'];
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [tries, setTries] = useState(0);

  // ----------------------------------------------------
  // GAME 4: SHAPE SORTER STATES & LOGIC
  // ----------------------------------------------------
  const [shapeMatches, setShapeMatches] = useState<{ circle: boolean; triangle: boolean; square: boolean }>({ circle: false, triangle: false, square: false });
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [shapeTries, setShapeTries] = useState(0);
  const [shapeWon, setShapeWon] = useState(false);
  const [shapeStartTime, setShapeStartTime] = useState(Date.now());

  const resetShapeSorter = () => {
    setShapeMatches({ circle: false, triangle: false, square: false });
    setSelectedShape(null);
    setShapeTries(0);
    setShapeWon(false);
    setShapeStartTime(Date.now());
  };

  const handleShapeSelect = (shape: string) => {
    if (shapeMatches[shape as keyof typeof shapeMatches]) return;
    setSelectedShape(shape);
  };

  const handleSlotSelect = async (slot: string) => {
    if (!selectedShape) return;
    setShapeTries(prev => prev + 1);

    if (selectedShape === slot) {
      const nextMatches = { ...shapeMatches, [slot]: true };
      setShapeMatches(nextMatches);
      setSelectedShape(null);

      if (nextMatches.circle && nextMatches.triangle && nextMatches.square) {
        setShapeWon(true);
        const completionTime = Math.max(1, Math.round((Date.now() - shapeStartTime) / 1000));
        if (activeChildId) {
          try {
            await submitGameScore({
              childId: activeChildId,
              gameName: 'shape_sorter',
              score: 100,
              maxScore: 100,
              accuracyPercent: Math.round((3 / (shapeTries + 1)) * 100),
              level: 1,
              completionTime,
            });
            loadScores(activeChildId);
          } catch (e) {
            console.error('Failed to log shape sorter score:', e);
          }
        }
      }
    } else {
      setSelectedShape(null);
    }
  };

  // ----------------------------------------------------
  // GAME 5: BRAIN PUZZLE STATES & LOGIC
  // ----------------------------------------------------
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>([0, 1, 2, 3]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [puzzleTries, setPuzzleTries] = useState(0);
  const [puzzleWon, setPuzzleWon] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState(Date.now());

  const resetBrainPuzzle = () => {
    let shuffled = [0, 1, 2, 3];
    while (JSON.stringify(shuffled) === JSON.stringify([0, 1, 2, 3])) {
      shuffled = [...shuffled].sort(() => Math.random() - 0.5);
    }
    setPuzzleTiles(shuffled);
    setSelectedTile(null);
    setPuzzleTries(0);
    setPuzzleWon(false);
    setPuzzleStartTime(Date.now());
  };

  const handleTileClick = async (index: number) => {
    if (puzzleWon) return;
    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      if (selectedTile === index) {
        setSelectedTile(null);
        return;
      }
      setPuzzleTries(prev => prev + 1);
      const newTiles = [...puzzleTiles];
      const temp = newTiles[selectedTile];
      newTiles[selectedTile] = newTiles[index];
      newTiles[index] = temp;
      setPuzzleTiles(newTiles);
      setSelectedTile(null);

      if (JSON.stringify(newTiles) === JSON.stringify([0, 1, 2, 3])) {
        setPuzzleWon(true);
        const completionTime = Math.max(1, Math.round((Date.now() - puzzleStartTime) / 1000));
        if (activeChildId) {
          try {
            await submitGameScore({
              childId: activeChildId,
              gameName: 'brain_puzzle',
              score: 100,
              maxScore: 100,
              accuracyPercent: Math.round((4 / (puzzleTries + 1)) * 100),
              level: 1,
              completionTime,
            });
            loadScores(activeChildId);
          } catch (e) {
            console.error('Failed to log brain puzzle score:', e);
          }
        }
      }
    }
  };
  const [matchesCount, setMatchesCount] = useState(0);
  const [won, setWon] = useState(false);

  const resetMemoryGame = () => {
    const shuffled = [...initialSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        val: symbol,
        flipped: false,
        matched: false
      }));
    setCards(shuffled);
    setSelectedCards([]);
    setTries(0);
    setMatchesCount(0);
    setWon(false);
  };

  const handleCardClick = async (cardId: number) => {
    if (cards[cardId].flipped || cards[cardId].matched || selectedCards.length >= 2) return;

    const newCards = [...cards];
    newCards[cardId].flipped = true;
    setCards(newCards);

    const newSelections = [...selectedCards, cardId];
    setSelectedCards(newSelections);

    if (newSelections.length === 2) {
      setTries(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelections;
      
      if (newCards[firstIdx].val === newCards[secondIdx].val) {
        // MATCH found
        setTimeout(async () => {
          newCards[firstIdx].matched = true;
          newCards[secondIdx].matched = true;
          setCards(newCards);
          setSelectedCards([]);
          
          const newMatches = matchesCount + 1;
          setMatchesCount(newMatches);

          if (newMatches === 4) {
            setWon(true);
            setHighScore(prev => Math.max(prev, 100));
            // Log memory score to backend
            if (activeChildId) {
              try {
                await submitGameScore({
                  childId: activeChildId,
                  gameName: 'memory_game',
                  score: 100 - (tries * 5),
                  maxScore: 100,
                  accuracyPercent: Math.round((4 / (tries + 1)) * 100),
                  level: 1,
                  completionTime: tries * 2,
                });
                loadScores(activeChildId);
              } catch (e) {
                console.error('Failed to log memory game score:', e);
              }
            }
          }
        }, 500);
      } else {
        // NO MATCH, flip back
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setCards(newCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // ----------------------------------------------------
  // GAME 2: EMOTION RECOGNITION STATES & LOGIC
  // ----------------------------------------------------
  const emotionsList = [
    { emoji: '😊', label: 'Happy', arLabel: 'سعيد', category: 'joy' },
    { emoji: '😢', label: 'Sad', arLabel: 'حزين', category: 'sad' },
    { emoji: '😠', label: 'Angry', arLabel: 'غاضب', category: 'angry' },
    { emoji: '😮', label: 'Surprised', arLabel: 'متفاجئ', category: 'surprise' }
  ];
  const [emotionIdx, setEmotionIdx] = useState(0);
  const [emotionScore, setEmotionScore] = useState(0);
  const [emotionTries, setEmotionTries] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleEmotionGuess = async (guess: string) => {
    const currentEmotion = emotionsList[emotionIdx];
    const correct = currentEmotion.label === guess;
    setEmotionTries(prev => prev + 1);

    if (correct) {
      const nextScore = emotionScore + 25;
      setEmotionScore(nextScore);
      if (nextScore > highScore) setHighScore(nextScore);
      setFeedback(isRtl ? 'إجابة رائعة وصحيحة! 🌟' : 'Superb! That is correct! 🌟');

      // Log score to backend if 4 questions completed
      if (emotionTries >= 3 && activeChildId) {
        try {
          await submitGameScore({
            childId: activeChildId,
            gameName: 'emotion_recognition',
            score: nextScore,
            maxScore: 100,
            accuracyPercent: Math.round((nextScore / 100) * 100),
            level: 1,
          });
          loadScores(activeChildId);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      setFeedback(isRtl ? 'حاول مرة أخرى لتكسب النجمة! 💛' : 'Give it another try, you can do it! 💛');
    }

    setTimeout(() => {
      setFeedback(null);
      setEmotionIdx((prev => (prev + 1) % emotionsList.length));
    }, 1200);
  };

  // ----------------------------------------------------
  // GAME 3: SENSORY BUBBLE POP LOGIC (REAL PLAYABLE)
  // ----------------------------------------------------
  const [bubbleGameActive, setBubbleGameActive] = useState(false);
  const [bubbleScore, setBubbleScore] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  const [targetColor, setTargetColor] = useState<'sky' | 'emerald' | 'amber' | 'rose'>('sky');
  const [bubbleTimeLeft, setBubbleTimeLeft] = useState(30);
  const [bubblesStats, setBubblesStats] = useState({ hits: 0, misses: 0, reactionSum: 0 });
  const bubbleGameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleMoveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBubbleGame = () => {
    setBubbleGameActive(true);
    setBubbleScore(0);
    setBubbles([]);
    setBubbleTimeLeft(30);
    setBubblesStats({ hits: 0, misses: 0, reactionSum: 0 });
    
    // Choose initial target color
    const colors: ('sky' | 'emerald' | 'amber' | 'rose')[] = ['sky', 'emerald', 'amber', 'rose'];
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);

    // Start timer interval
    if (bubbleTimerIntervalRef.current) clearInterval(bubbleTimerIntervalRef.current);
    bubbleTimerIntervalRef.current = setInterval(() => {
      setBubbleTimeLeft(prev => {
        if (prev <= 1) {
          endBubbleGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn bubbles periodically
    if (bubbleGameIntervalRef.current) clearInterval(bubbleGameIntervalRef.current);
    bubbleGameIntervalRef.current = setInterval(() => {
      const colorsList: ('sky' | 'emerald' | 'amber' | 'rose')[] = ['sky', 'emerald', 'amber', 'rose'];
      const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)];
      const newBubble: BubbleType = {
        id: Math.random() * 1000000,
        x: Math.floor(Math.random() * 85) + 5, // 5% to 90%
        y: 105, // start below container
        color: randomColor,
        size: Math.floor(Math.random() * 20) + 40, // 40px to 60px
        speed: Math.random() * 1.5 + 1.2 // random vertical float speed
      };
      setBubbles(prev => [...prev, newBubble]);
    }, 800);

    // Frame update for floating motion
    if (bubbleMoveIntervalRef.current) clearInterval(bubbleMoveIntervalRef.current);
    bubbleMoveIntervalRef.current = setInterval(() => {
      setBubbles(prev => 
        prev
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => {
            // If correct target bubble reached the top unpopped, record a miss
            if (b.y < -15) {
              if (b.color === targetColor) {
                setBubblesStats(s => ({ ...s, misses: s.misses + 1 }));
              }
              return false;
            }
            return true;
          })
      );
    }, 40);
  };

  const popBubble = (bubble: BubbleType) => {
    if (bubble.color === targetColor) {
      setBubbleScore(prev => prev + 10);
      setBubblesStats(s => ({ 
        ...s, 
        hits: s.hits + 1,
        reactionSum: s.reactionSum + (30 - bubbleTimeLeft) // rough reaction time indicator
      }));
    } else {
      setBubbleScore(prev => Math.max(0, prev - 5));
      setBubblesStats(s => ({ ...s, misses: s.misses + 1 }));
    }
    // Remove bubble from display
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  const endBubbleGame = async () => {
    setBubbleGameActive(false);
    if (bubbleGameIntervalRef.current) clearInterval(bubbleGameIntervalRef.current);
    if (bubbleTimerIntervalRef.current) clearInterval(bubbleTimerIntervalRef.current);
    if (bubbleMoveIntervalRef.current) clearInterval(bubbleMoveIntervalRef.current);
    
    // Calculate and submit score
    const totalAttempts = bubblesStats.hits + bubblesStats.misses;
    const accuracy = totalAttempts > 0 ? Math.round((bubblesStats.hits / totalAttempts) * 100) : 0;
    const finalScore = bubbleScore;

    setHighScore(prev => Math.max(prev, finalScore));

    if (activeChildId) {
      try {
        await submitGameScore({
          childId: activeChildId,
          gameName: 'attention_game',
          score: finalScore,
          maxScore: 200,
          accuracyPercent: accuracy,
          reactionTime: bubblesStats.hits > 0 ? Math.round((bubblesStats.reactionSum / bubblesStats.hits) * 1000) : 0,
          level: finalScore > 100 ? 2 : 1,
          completionTime: 30
        });
        loadScores(activeChildId);
      } catch (err) {
        console.error('Failed to log game score:', err);
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (bubbleGameIntervalRef.current) clearInterval(bubbleGameIntervalRef.current);
      if (bubbleTimerIntervalRef.current) clearInterval(bubbleTimerIntervalRef.current);
      if (bubbleMoveIntervalRef.current) clearInterval(bubbleMoveIntervalRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // DATA LOADING METHODS
  // ----------------------------------------------------
  const loadScores = async (childId: string) => {
    try {
      const res = await getGameScores(childId);
      if (res.success && res.data) {
        const sorted = res.data
          .filter((s: any) => s.gameName === 'attention_game')
          .slice(0, 7)
          .reverse()
          .map((s: any) => ({
            date: new Date(s.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' }),
            Score: s.score,
            Accuracy: s.accuracyPercent || 0
          }));
        setScoreHistory(sorted);
        
        // Update high score based on real database scores
        const maxDbScore = res.data.reduce((max: number, s: any) => Math.max(max, s.score), 140);
        setHighScore(maxDbScore);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    resetMemoryGame();
    const fetchChild = async () => {
      try {
        const patientsRes = await getPatients();
        if (patientsRes.success && patientsRes.data.length > 0) {
          const childId = patientsRes.data[0]._id;
          setActiveChildId(childId);
          loadScores(childId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchChild();
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md p-6 sm:p-8" id="development-games-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100 pb-6 mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <Smile className="w-5 h-5 text-sky-500 animate-bounce" />
            <span>{t.portalGames}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Fun therapeutic cognitive boards. Play along to sync developmental scores with your therapist.</p>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => { setActiveGame('memory'); endBubbleGame(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'memory'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تطابق الذاكرة' : 'Memory Match'}</span>
          </button>
          <button
            onClick={() => { setActiveGame('emotion'); endBubbleGame(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'emotion'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تعابير الوجوه' : 'Emotions Board'}</span>
          </button>
          <button
            onClick={() => { setActiveGame('bubbles'); resetMemoryGame(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'bubbles'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isRtl ? 'فقاعات الانتباه' : 'Attention Bubbles'}</span>
          </button>
          <button
            onClick={() => { setActiveGame('shape_sorter'); endBubbleGame(); resetShapeSorter(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'shape_sorter'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>{isRtl ? 'فرز الأشكال' : 'Shape Sorter'}</span>
          </button>
          <button
            onClick={() => { setActiveGame('brain_puzzle'); endBubbleGame(); resetBrainPuzzle(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              activeGame === 'brain_puzzle'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تركيب الأحجية' : 'Brain Puzzle'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left pane: Game Canvas Stage */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[400px] bg-slate-50/50 rounded-3xl border border-slate-100 p-6 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* GAME 1: MEMORY CARDS GRID */}
            {activeGame === 'memory' && (
              <motion.div
                key="memory-game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                {won ? (
                  <div className="text-center space-y-4 py-8">
                    <span className="text-5xl animate-bounce block">🏆🌟🎉</span>
                    <h4 className="text-lg font-black text-emerald-700">{isRtl ? 'رائع يا بطل! لقد تطابقت كل الأوراق!' : 'Awesome job, Champion! Match is Complete!'}</h4>
                    <p className="text-xs text-slate-500">Completed in {tries} total tries. Developmental scores synced to therapist portal.</p>
                    <button
                      onClick={resetMemoryGame}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full text-xs cursor-pointer shadow-md transition-all flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>{isRtl ? 'اللعب من جديد' : 'Play Again'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="grid grid-cols-4 gap-4">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card.id)}
                          className={`aspect-square rounded-2xl border shadow-sm flex items-center justify-center text-3xl font-bold cursor-pointer transition-all duration-300 transform select-none ${
                            card.flipped || card.matched
                              ? 'bg-white border-sky-300 rotate-0'
                              : 'bg-gradient-to-br from-sky-400 to-blue-600 border-sky-500 text-white rotate-180 hover:scale-105 hover:shadow-md'
                          }`}
                        >
                          <span className={card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}>
                            {card.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono font-bold bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                      <span>{isRtl ? 'المحاولات:' : 'Tries:'} {tries}</span>
                      <span>{isRtl ? 'التطابقات:' : 'Matches:'} {matchesCount}/4</span>
                      <button onClick={resetMemoryGame} className="text-sky-600 hover:underline cursor-pointer">
                        Reset Map
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* GAME 2: EMOTION RECOGNITION GUESSING BOARD */}
            {activeGame === 'emotion' && (
              <motion.div
                key="emotion-game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center space-y-6 max-w-sm text-center py-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{isRtl ? 'أي من المشاعر يشير إليها هذا الوجه؟' : 'What emotion does this face show?'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Identify visual micro-expressions to earn therapeutic points.</p>
                </div>

                {/* Big interactive Emoji */}
                <motion.div 
                  key={emotionIdx}
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-28 h-28 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-6xl select-none"
                >
                  {emotionsList[emotionIdx].emoji}
                </motion.div>

                {/* Multi choices guessing path */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {emotionsList.map((e) => (
                    <button
                      key={e.label}
                      onClick={() => handleEmotionGuess(e.label)}
                      className="px-4 py-3 bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 hover:border-sky-300 font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {isRtl ? e.arLabel : e.label}
                    </button>
                  ))}
                </div>

                {/* Sparkle Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-2.5 bg-white border border-sky-100/50 shadow rounded-xl text-xs font-bold text-sky-700"
                    >
                      {feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Score panel */}
                <div className="w-full flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 border-t border-slate-100 pt-4">
                  <span>SCORE: {emotionScore} PT</span>
                  <span>TRIES: {emotionTries}</span>
                </div>

              </motion.div>
            )}

            {/* GAME 3: SENSORY BUBBLE POP */}
            {activeGame === 'bubbles' && (
              <motion.div
                key="bubble-game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex flex-col items-center justify-between"
              >
                {!bubbleGameActive ? (
                  <div className="text-center space-y-5 max-w-sm py-8">
                    <span className="text-5xl block animate-bounce">🎈⭐🔵</span>
                    <h4 className="text-lg font-black text-slate-800">
                      {isRtl ? 'لعبة فقاعات الانتباه والتركيز' : 'Sensory Bubble Pop'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isRtl
                        ? 'فرقع الفقاعات ذات اللون المطلوب فقط بأسرع ما يمكن! تتغير الألوان المطلوبة لزيادة مرونة الانتباه.'
                        : 'Pop the bubbles matching the TARGET color! Test speed and color attention filters. Scores are synced to local profile.'}
                    </p>
                    <button
                      onClick={startBubbleGame}
                      className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs uppercase cursor-pointer shadow-md transition-all flex items-center space-x-2 mx-auto"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isRtl ? 'ابدأ اللعبة' : 'Start Attention Game'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-[360px] relative bg-sky-50/20 border border-slate-100 rounded-2xl flex flex-col justify-between overflow-hidden">
                    
                    {/* Floating Bubble Canvas Space */}
                    <div className="absolute inset-0 z-0">
                      {bubbles.map((b) => {
                        const colorMap = {
                          sky: 'bg-sky-400/90 border-sky-300 shadow-sky-400/30',
                          emerald: 'bg-emerald-400/90 border-emerald-300 shadow-emerald-400/30',
                          amber: 'bg-amber-400/90 border-amber-300 shadow-amber-400/30',
                          rose: 'bg-rose-400/90 border-rose-300 shadow-rose-400/30'
                        };
                        return (
                          <motion.button
                            key={b.id}
                            onClick={() => popBubble(b)}
                            style={{
                              left: `${b.x}%`,
                              top: `${b.y}%`,
                              width: `${b.size}px`,
                              height: `${b.size}px`,
                            }}
                            className={`absolute rounded-full border-2 shadow-inner cursor-pointer select-none active:scale-95 transition-transform flex items-center justify-center ${colorMap[b.color]}`}
                          >
                            <span className="w-2.5 h-2.5 bg-white/40 rounded-full absolute top-1.5 left-2" />
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* HUD Header */}
                    <div className="relative z-10 p-3 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-sky-500" />
                        <span>
                          {isRtl ? 'اللون المطلوب:' : 'TARGET COLOR:'}{' '}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] text-white uppercase ${
                            targetColor === 'sky' ? 'bg-sky-500' :
                            targetColor === 'emerald' ? 'bg-emerald-500' :
                            targetColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}>
                            {targetColor}
                          </span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                          <Timer className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-rose-500">{bubbleTimeLeft}s</span>
                        </div>
                        <span className="font-mono bg-sky-50 text-sky-600 px-2 py-0.5 rounded">
                          SCORE: {bubbleScore}
                        </span>
                      </div>
                    </div>

                    {/* Hint at the bottom */}
                    <div className="relative z-10 p-2.5 bg-white/40 text-center text-[10px] text-slate-400 font-bold border-t border-slate-100/50">
                      {isRtl ? 'فرقع فقط الفقاعات ذات اللون الصحيح. الألوان الأخرى تخصم نقاط!' : 'Only pop matching target color bubbles. Other colors decrease score!'}
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* GAME 4: SHAPE SORTER */}
            {activeGame === 'shape_sorter' && (
              <motion.div
                key="shape-sorter-game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                {shapeWon ? (
                  <div className="text-center space-y-4 py-8">
                    <span className="text-5xl animate-bounce block">🏆🔷🌟</span>
                    <h4 className="text-lg font-black text-emerald-700">{isRtl ? 'رائع جداً! تطابقت كل الأشكال!' : 'Superb! All Shapes Sorter Complete!'}</h4>
                    <p className="text-xs text-slate-500">Perfect alignment. Telemetry scores synced to therapist portal.</p>
                    <button
                      onClick={resetShapeSorter}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full text-xs cursor-pointer shadow-md transition-all flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>{isRtl ? 'اللعب من جديد' : 'Play Again'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 w-full max-w-sm flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-500 text-center">
                      {isRtl ? 'اضغط على الشكل بالأسفل ثم اضغط على الظل المناسب له بالأعلى!' : 'Tap a colored shape below, then tap its matching shadow outlines!'}
                    </p>

                    {/* Target Slots */}
                    <div className="flex justify-around w-full">
                      {['circle', 'triangle', 'square'].map((shape) => {
                        const isMatched = shapeMatches[shape as keyof typeof shapeMatches];
                        return (
                          <button
                            key={shape}
                            onClick={() => handleSlotSelect(shape)}
                            className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${
                              isMatched 
                                ? 'bg-sky-50 border-sky-300' 
                                : 'bg-slate-100 border-slate-300 hover:border-sky-400 hover:bg-slate-50'
                            }`}
                          >
                            {isMatched ? (
                              <span className="text-3xl">
                                {shape === 'circle' ? '🔴' : shape === 'triangle' ? '🔵' : '🟢'}
                              </span>
                            ) : (
                              <span className="text-2xl opacity-20 filter grayscale">
                                {shape === 'circle' ? '⭕' : shape === 'triangle' ? '🔺' : '⬛'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Source Draggables */}
                    <div className="flex justify-around w-full pt-4 border-t border-slate-100">
                      {['circle', 'triangle', 'square'].map((shape) => {
                        const isMatched = shapeMatches[shape as keyof typeof shapeMatches];
                        const isSelected = selectedShape === shape;
                        if (isMatched) return <div key={shape} className="w-16 h-16" />;
                        return (
                          <button
                            key={shape}
                            onClick={() => handleShapeSelect(shape)}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold cursor-pointer transition-all transform hover:scale-105 active:scale-95 shadow-sm ${
                              isSelected
                                ? 'bg-sky-200 border-4 border-sky-500 scale-110'
                                : 'bg-white border border-slate-200'
                            }`}
                          >
                            {shape === 'circle' ? '🔴' : shape === 'triangle' ? '🔵' : '🟢'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* GAME 5: BRAIN PUZZLE */}
            {activeGame === 'brain_puzzle' && (
              <motion.div
                key="brain-puzzle-game"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                {puzzleWon ? (
                  <div className="text-center space-y-4 py-8">
                    <span className="text-5xl animate-bounce block">🏆🧩🌟</span>
                    <h4 className="text-lg font-black text-emerald-700">{isRtl ? 'يا لك من ذكي! اكتملت الأحجية!' : 'Fantastic! Brain Puzzle Solved!'}</h4>
                    <p className="text-xs text-slate-500">All blocks aligned correctly in {puzzleTries} swaps.</p>
                    <button
                      onClick={resetBrainPuzzle}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full text-xs cursor-pointer shadow-md transition-all flex items-center space-x-1.5 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>{isRtl ? 'اللعب من جديد' : 'Play Again'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 w-full max-w-sm flex flex-col items-center">
                    <p className="text-xs font-semibold text-slate-500 text-center">
                      {isRtl ? 'اضغط على قطعة ثم قطعة أخرى لتبديل مكانهما وترتيب الصورة!' : 'Tap one tile, then tap another to swap them and build the puzzle!'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 w-60 h-60">
                      {puzzleTiles.map((tileVal, idx) => {
                        const isSelected = selectedTile === idx;
                        // Colorful representation or slice numbers to represent a unified puzzle
                        const colorMap = ['bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'];
                        const emojiMap = ['🐱', '🐰', '🦁', '🐻'];
                        return (
                          <button
                            key={idx}
                            onClick={() => handleTileClick(idx)}
                            className={`rounded-2xl flex flex-col items-center justify-center text-3xl transition-all transform shadow cursor-pointer text-white relative ${
                              colorMap[tileVal]
                            } ${
                              isSelected ? 'border-4 border-white scale-95 shadow-inner' : 'hover:scale-[1.02]'
                            }`}
                          >
                            <span>{emojiMap[tileVal]}</span>
                            <span className="text-[10px] opacity-75 font-mono absolute bottom-2 right-3">#{tileVal + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </div>
        
        {/* Right pane: Playful stats and learning indicators */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono flex items-center space-x-1.5 border-b border-sky-100 pb-2">
              <Award className="w-4 h-4 text-sky-500" />
              <span>Cognitive Outcomes tracker</span>
            </h4>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Active High Score:</span>
                <span className="font-extrabold text-sky-600 font-mono">{highScore} PTS</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Therapist Sync Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] font-mono">LIVE CONNECTED</span>
              </div>
            </div>

            {/* Score History Graph (Recharts) */}
            {scoreHistory.length > 0 && activeGame === 'bubbles' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Attention Span Growth</span>
                <div className="h-28 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 8 }} stroke="#94a3b8" tickLine={false} />
                      <YAxis tick={{ fontSize: 8 }} stroke="#94a3b8" tickLine={false} domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="Score" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isRtl 
                ? 'تقوم الألعاب بقياس زمن ردة الفعل البصري للطفل ودقة اختيار النماذج لتصدير إحصائية مباشرة لملف المعالج والملخص الأسبوعي للوالد.' 
                : 'Interactive memory and attention games provide vital non-interfering diagnostic metrics so therapists can evaluate fine-motor response times without test stress.'}
            </p>
          </div>

          {/* Tips card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Parent sensory advice</span>
            <p className="text-[11px] text-slate-600 leading-normal font-medium">
              Recommend play sessions of up to 15 minutes before lunch. Supports visual focusing triggers when paired with Metafolin® supplementation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
