import { useState, useEffect, useCallback } from 'react';
import { AppStorageData, SeedState, TaskCategory } from './types';
import { soundManager } from './audio';
import { generateDailyTasks, replaceIncompleteTasks, getRandomHealingQuote, getRandomEncouragement } from './data/quotesAndTasks';
import { Navbar } from './components/Navbar';
import { PlantGarden } from './components/PlantGarden';
import { CardBlindBox } from './components/CardBlindBox';
import { TaskList } from './components/TaskList';
import { HealingCardModal } from './components/HealingCardModal';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'seed_of_mind_daily_state';

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getInitialDefaultState = (todayStr: string, soundEnabled: boolean = true): AppStorageData => ({
  last_drawn_date: todayStr,
  sound_enabled: soundEnabled,
  seed_state: {
    text: '',
    stage: 0,
    unlocked_card: false,
    scratched: false,
    encouragement: '',
    healing_quote: '',
  },
  today_tasks: [],
  replaced_card_count: 0,
});

export default function App() {
  const todayStr = getTodayDateString();

  // Load state from localStorage with midnight reset logic
  const [appData, setAppData] = useState<AppStorageData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AppStorageData = JSON.parse(stored);
        const soundPref = typeof parsed.sound_enabled === 'boolean' ? parsed.sound_enabled : true;

        // Check if day has changed (Midnight Cross Reset)
        if (parsed.last_drawn_date !== todayStr) {
          // Automatic reset for a brand new day!
          return getInitialDefaultState(todayStr, soundPref);
        }

        // Ensure sub-objects have all required keys
        return {
          ...parsed,
          sound_enabled: soundPref,
          seed_state: {
            text: parsed.seed_state?.text || '',
            stage: typeof parsed.seed_state?.stage === 'number' ? parsed.seed_state.stage : 0,
            unlocked_card: !!parsed.seed_state?.unlocked_card,
            scratched: !!parsed.seed_state?.scratched,
            encouragement: parsed.seed_state?.encouragement || '',
            healing_quote: parsed.seed_state?.healing_quote || '',
          },
          today_tasks: Array.isArray(parsed.today_tasks) ? parsed.today_tasks : [],
          replaced_card_count: parsed.replaced_card_count || 0,
        };
      }
    } catch {
      // ignore
    }
    return getInitialDefaultState(todayStr);
  });

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync sound manager enabled flag with app state
  useEffect(() => {
    soundManager.setEnabled(appData.sound_enabled);
  }, [appData.sound_enabled]);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch {
      // storage error fallback
    }
  }, [appData]);

  // Show temporary toast message
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Check for midnight rollover while tab is open
  useEffect(() => {
    const checkMidnight = () => {
      const current = getTodayDateString();
      if (appData.last_drawn_date && appData.last_drawn_date !== current) {
        setAppData((prev) => getInitialDefaultState(current, prev.sound_enabled));
        showToast('新的一天開始了！心靈花園與冒險任務已為您清空歸零。');
      }
    };

    const interval = setInterval(checkMidnight, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkMidnight();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [appData.last_drawn_date, showToast]);

  // Toggle Sound On/Off
  const handleToggleSound = () => {
    const nextState = !appData.sound_enabled;
    soundManager.setEnabled(nextState);
    if (nextState) {
      soundManager.playCheck();
    }
    setAppData((prev) => ({
      ...prev,
      sound_enabled: nextState,
    }));
  };

  // Simulate Midnight Cross-day Reset (for testing & user inspection)
  const handleSimulateMidnightReset = () => {
    const fakeYesterday = '2020-01-01';
    setAppData((prev) => {
      const reset = getInitialDefaultState(getTodayDateString(), prev.sound_enabled);
      return reset;
    });
    showToast('✨ 已重新開始：花園狀態與今日任務已回歸全新開始！');
  };

  // Seed / Garden handlers
  const handleUpdateSeed = (newSeedState: SeedState) => {
    setAppData((prev) => ({
      ...prev,
      seed_state: newSeedState,
    }));
  };

  // Draw 3D Cards
  const handleDrawCards = () => {
    if (appData.today_tasks.length > 0) return;
    const newTasks = generateDailyTasks();
    setAppData((prev) => ({
      ...prev,
      today_tasks: newTasks,
      last_drawn_date: todayStr,
    }));
    showToast('已揭曉今日 3 個微冒險卡牌！');
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    setAppData((prev) => {
      const updated = prev.today_tasks.map((task) => {
        if (task.id === taskId) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            soundManager.playCheck();
          }
          return { ...task, completed: nextCompleted };
        }
        return task;
      });
      return {
        ...prev,
        today_tasks: updated,
      };
    });
  };

  // Add Custom Task
  const handleAddTask = (category: TaskCategory, text: string) => {
    const newTask = {
      id: `${Date.now()}_custom_${Math.random().toString(36).substring(2, 6)}`,
      category,
      text,
      completed: false,
    };
    setAppData((prev) => ({
      ...prev,
      today_tasks: [...prev.today_tasks, newTask],
    }));
    showToast('已新增今日自訂微目標！');
  };

  // Replace incomplete cards (1 daily limit)
  const handleReplaceIncompleteCards = () => {
    if (appData.replaced_card_count >= 1) {
      showToast('今日卡牌更換次數已達上限 (1/1)');
      return;
    }

    const incompleteCount = appData.today_tasks.filter((t) => !t.completed).length;
    if (incompleteCount === 0) {
      showToast('所有任務均已完成，無需更換！');
      return;
    }

    soundManager.playFlip();
    const updatedTasks = replaceIncompleteTasks(appData.today_tasks);
    setAppData((prev) => ({
      ...prev,
      today_tasks: updatedTasks,
      replaced_card_count: prev.replaced_card_count + 1,
    }));
    showToast(`已隨機為您更換 ${incompleteCount} 個未完成的微任務！`);
  };

  // Scratch card complete callback
  const handleScratchComplete = () => {
    setAppData((prev) => ({
      ...prev,
      seed_state: {
        ...prev.seed_state,
        scratched: true,
      },
    }));
  };

  const isCardsDrawn = appData.today_tasks.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-stone-800 antialiased selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        soundEnabled={appData.sound_enabled}
        onToggleSound={handleToggleSound}
        currentDateStr={todayStr}
        onSimulateMidnightReset={handleSimulateMidnightReset}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Warm Peaceful Philosophy Banner */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            將煩惱埋入土中，在微冒險中遇見溫柔
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed text-pretty">
            這裡不記錄累積天數，也沒有連勝打卡負擔。寫下壞心情作為花園養分，翻開今日微任務，每天都是一個嶄新而自由的起點。
          </p>
        </section>

        {/* Module 1: Heart Garden & Worry Seed (心靈花園與壞心情種子) */}
        <section id="garden-section">
          <PlantGarden
            seedState={appData.seed_state}
            onUpdateSeed={handleUpdateSeed}
            onOpenCardModal={() => setIsCardModalOpen(true)}
          />
        </section>

        {/* Module 2: Daily 3D Blind Box Cards (每日抽卡區 3D 盲盒) */}
        <section id="cards-section">
          <CardBlindBox
            tasks={appData.today_tasks}
            isDrawn={isCardsDrawn}
            onDrawCards={handleDrawCards}
            onToggleTask={handleToggleTask}
          />
        </section>

        {/* Module 3: Today's Adventure Task List (今日任務清單) */}
        <section id="tasks-section">
          <TaskList
            tasks={appData.today_tasks}
            replacedCardCount={appData.replaced_card_count}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onReplaceIncompleteCards={handleReplaceIncompleteCards}
          />
        </section>

        {/* Emotional Value Transformation Loop Information */}
        <section className="rounded-3xl bg-stone-100/70 border border-stone-200/80 p-6 sm:p-8">
          <h3 className="text-sm sm:text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
            <span>情緒轉化閉環指南</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-stone-600">
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
              <span className="font-bold text-stone-800 block mb-1">01. 釋放煩惱</span>
              寫下今日的焦慮或疲憊，將它深深埋入心靈沃土中。
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
              <span className="font-bold text-stone-800 block mb-1">02. 灌溉開花</span>
              點擊澆水 3 次，看著綠苗發芽、抽長並盛開出溫暖花朵。
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
              <span className="font-bold text-stone-800 block mb-1">03. 刮出祝福</span>
              收下共情小卡，刮開 Canvas 銀色塗層領取明天的專屬鼓勵。
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-stone-200/70">
              <span className="font-bold text-stone-800 block mb-1">04. 輕盈冒險</span>
              翻開 3 張盲盒卡牌，完成當日微行動，午夜 24:00 自動歸零。
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>隱私優先 · 數據僅存於本機瀏覽器 LocalStorage · 無遠端追蹤</span>
          </div>
          <div className="flex items-center gap-4">
            <span>心靈種子與每日冒險 · 輕盈無負擔生活提案</span>
          </div>
        </div>
      </footer>

      {/* Healing Quote & Tomorrow Scratch Card Modal */}
      <HealingCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        seedState={appData.seed_state}
        onScratchComplete={handleScratchComplete}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
