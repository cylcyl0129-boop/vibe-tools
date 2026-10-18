import React from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw } from 'lucide-react';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentDateStr?: string;
  onSimulateMidnightReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  onSimulateMidnightReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-100" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
            心靈種子與每日冒險
          </span>
        </div>


        {/* Zone 3: Interactive Controls (Sound Toggle & Reset Simulator) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick simulation button for testing midnight reset */}
          <button
            type="button"
            onClick={onSimulateMidnightReset}
            title="清空當前狀態並重新開始"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新開始</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '靜音' : '開啟音效'}
            title={soundEnabled ? '點擊靜音' : '點擊開啟音效'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50/80 border-amber-200/80 text-amber-800 hover:bg-amber-100'
                : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">音效開</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span className="hidden sm:inline">靜音</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
