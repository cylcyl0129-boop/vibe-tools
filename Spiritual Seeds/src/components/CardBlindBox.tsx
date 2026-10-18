import React, { useState } from 'react';
import { TaskItem, TaskCategory } from '../types';
import { soundManager } from '../audio';
import { Sparkles, CheckCircle2, Circle, Compass, Heart, Activity, TrendingUp } from 'lucide-react';

interface CardBlindBoxProps {
  tasks: TaskItem[];
  isDrawn: boolean;
  onDrawCards: () => void;
  onToggleTask: (taskId: string) => void;
}

export const getCategoryColorClasses = (category: TaskCategory) => {
  switch (category) {
    case '健康':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'text-emerald-700 bg-emerald-100/70',
        accent: 'text-emerald-600',
        cardBg: 'from-emerald-50/50 to-white',
        border: 'border-emerald-200/80',
        icon: Activity,
      };
    case '心靈':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        badge: 'text-purple-700 bg-purple-100/70',
        accent: 'text-purple-600',
        cardBg: 'from-purple-50/50 to-white',
        border: 'border-purple-200/80',
        icon: Heart,
      };
    case '探索':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'text-blue-700 bg-blue-100/70',
        accent: 'text-blue-600',
        cardBg: 'from-blue-50/50 to-white',
        border: 'border-blue-200/80',
        icon: Compass,
      };
    case '成長':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        badge: 'text-orange-700 bg-orange-100/70',
        accent: 'text-orange-600',
        cardBg: 'from-orange-50/50 to-white',
        border: 'border-orange-200/80',
        icon: TrendingUp,
      };
  }
};

export const CardBlindBox: React.FC<CardBlindBoxProps> = ({
  tasks,
  isDrawn,
  onDrawCards,
  onToggleTask,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlipClick = () => {
    if (isDrawn || isFlipping) return;
    setIsFlipping(true);
    soundManager.playFlip();

    // Trigger draw after flip animation starts
    setTimeout(() => {
      onDrawCards();
      setIsFlipping(false);
    }, 450);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <span>每日抽卡區 (3D 盲盒)</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {isDrawn
              ? '今日卡牌已翻開，為今天的生活添入 3 個輕盈的微冒險。'
              : '今日卡牌包已就緒，請翻開您的三張卡，開啟今天的微冒險。'}
          </p>
        </div>

        {isDrawn ? (
          <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>今日冒險已領取 ({completedCount}/{tasks.length} 完成)</span>
          </div>
        ) : (
          <button
            onClick={handleFlipClick}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>翻開全部卡牌</span>
          </button>
        )}
      </div>

      {/* 3D Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000">
        {[0, 1, 2].map((idx) => {
          const task = tasks[idx];
          const hasTask = isDrawn && !!task;
          const flipped = hasTask || isFlipping;

          const categoryStyle = task
            ? getCategoryColorClasses(task.category)
            : getCategoryColorClasses('心靈');
          const IconComp = categoryStyle.icon;

          // Gentle staggered animation class for un-flipped state
          const floatClass = idx === 0 
            ? 'animate-gentle-float' 
            : idx === 1 
            ? 'animate-gentle-float-delayed' 
            : 'animate-gentle-float-slow';

          return (
            <div
              key={task?.id || `card_${idx}`}
              onClick={!isDrawn ? handleFlipClick : undefined}
              className={`relative h-64 sm:h-72 w-full transition-transform duration-700 preserve-3d cursor-pointer ${
                !isDrawn ? floatClass : ''
              } ${flipped ? 'rotate-y-180' : ''}`}
            >
              {/* Card Back Face (Shown before draw) */}
              <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 p-6 flex flex-col items-center justify-between text-center backface-hidden shadow-md border-2 border-amber-600/30 hover:border-amber-500/60 transition-colors">
                <div className="text-stone-400 text-[11px] tracking-widest font-mono">
                  CARD NO. {idx + 1}
                </div>

                {/* Mystical Sacred Seed Emblem */}
                <div className="w-20 h-20 rounded-full border border-amber-400/40 bg-amber-400/5 flex items-center justify-center relative shadow-inner">
                  <div className="w-14 h-14 rounded-full border border-dashed border-amber-300/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-300 animate-pulse-gentle" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-200">
                    點擊翻牌
                  </p>
                  <p className="text-[11px] text-stone-400">
                    探索今日微任務
                  </p>
                </div>
              </div>

              {/* Card Front Face (Revealed Task) */}
              <div
                className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b ${categoryStyle.cardBg} p-5 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md border ${categoryStyle.border} transition-all`}
              >
                {/* Card Top: Category Badge & Index */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${categoryStyle.badge}`}>
                      {task ? task.category : '微冒險'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-600">
                    #{idx + 1}
                  </span>
                </div>

                {/* Card Body: Task Content */}
                <div className="my-auto py-2">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-stone-200/70 flex items-center justify-center mb-3">
                    <IconComp className={`w-5 h-5 ${categoryStyle.accent}`} />
                  </div>
                  <p className={`text-sm sm:text-base font-semibold leading-snug ${
                    task?.completed ? 'line-through text-stone-400' : 'text-stone-800'
                  }`}>
                    {task ? task.text : '載入中...'}
                  </p>
                </div>

                {/* Card Footer: Interactive Check button */}
                {task && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80 shadow-xs'
                    }`}
                  >
                    {task.completed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>已完成此任務</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-stone-400" />
                        <span>標記為完成</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isDrawn && (
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-600">
            👆 點擊任意卡牌或按鈕翻開，每日任務跨日自動清空，無打卡連勝負擔。
          </p>
        </div>
      )}
    </div>
  );
};
