import React, { useState } from 'react';
import { TaskItem, TaskCategory } from '../types';
import { soundManager } from '../audio';
import { getCategoryColorClasses } from './CardBlindBox';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  RefreshCw, 
  CheckCheck,
  X
} from 'lucide-react';

interface TaskListProps {
  tasks: TaskItem[];
  replacedCardCount: number;
  onToggleTask: (taskId: string) => void;
  onAddTask: (category: TaskCategory, text: string) => void;
  onReplaceIncompleteCards: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  replacedCardCount,
  onToggleTask,
  onAddTask,
  onReplaceIncompleteCards,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('心靈');

  const canReplace = replacedCardCount < 1;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAddTask(newCategory, newText.trim());
    setNewText('');
    setShowAddModal(false);
    soundManager.playCheck();
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">
              今日任務清單
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 tabular-nums">
              {completedCount}/{totalCount} 完成
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            專注於當下的微小行動，隨心打勾，跨日自動清空歸零。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Replace Cards Button (1 time limit) */}
          <button
            type="button"
            onClick={onReplaceIncompleteCards}
            disabled={!canReplace || totalCount === 0}
            title={canReplace ? '隨機更換尚未完成的卡牌 (每日限 1 次)' : '今日已達更換上限 (0/1 次)'}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              canReplace && totalCount > 0
                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                : 'bg-stone-100 text-stone-600 border border-stone-200/70 cursor-not-allowed opacity-70'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              更換卡牌 {canReplace ? '(剩餘 1 次)' : '(今日已用)'}
            </span>
          </button>

          {/* Add Custom Task Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增自訂任務</span>
          </button>
        </div>
      </div>

      {/* Task Items List */}
      {tasks.length === 0 ? (
        <div className="py-12 text-center text-stone-400">
          <p className="text-sm font-medium text-stone-500 mb-1">
            今日尚未抽卡
          </p>
          <p className="text-xs">
            請點擊上方的 3D 盲盒翻開今日卡牌，或點擊「新增自訂任務」開始。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const categoryStyle = getCategoryColorClasses(task.category);
            const IconComp = categoryStyle.icon;

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  task.completed
                    ? 'bg-stone-50/70 border-stone-200/50 opacity-75'
                    : 'bg-white hover:bg-stone-50/50 border-stone-200 shadow-xs hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  {/* Category Badge Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${categoryStyle.border} ${categoryStyle.bg}`}
                  >
                    <IconComp className={`w-4 h-4 ${categoryStyle.accent}`} />
                  </div>

                  {/* Task Text & Category indicator */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.2 rounded-md ${categoryStyle.badge}`}
                      >
                        {task.category}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-medium truncate sm:whitespace-normal transition-colors ${
                        task.completed
                          ? 'line-through text-stone-400'
                          : 'text-stone-800'
                      }`}
                    >
                      {task.text}
                    </p>
                  </div>
                </div>

                {/* Checkbox Trigger */}
                <div className="shrink-0 pl-2">
                  {task.completed ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <span className="hidden sm:inline text-[11px]">已完成</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 group-hover:text-stone-400 transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Banner if all tasks are done */}
      {tasks.length > 0 && completedCount === totalCount && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm font-semibold">
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>太棒了！今天的所有微冒險都已圓滿達成。給自己一個溫柔的掌聲吧！</span>
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-800">
                新增今日微目標
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Category Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  選擇任務類別
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['健康', '心靈', '探索', '成長'] as TaskCategory[]).map((cat) => {
                    const style = getCategoryColorClasses(cat);
                    const isSelected = newCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          isSelected
                            ? `${style.bg} ${style.border} ring-2 ring-stone-800/10 shadow-xs`
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task Text */}
              <div>
                <label htmlFor="custom-task-text" className="block text-xs font-semibold text-stone-700 mb-1.5">
                  微任務內容（40 字內）
                </label>
                <input
                  id="custom-task-text"
                  type="text"
                  maxLength={40}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="例：喝一杯花草茶、對身邊的人道早安..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newText.trim()}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
