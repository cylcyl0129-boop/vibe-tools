import React from 'react';
import { SeedState } from '../types';
import { ScratchCard } from './ScratchCard';
import { Sparkles, Heart, X, Flower2 } from 'lucide-react';

interface HealingCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  seedState: SeedState;
  onScratchComplete: () => void;
}

export const HealingCardModal: React.FC<HealingCardModalProps> = ({
  isOpen,
  onClose,
  seedState,
  onScratchComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-stone-50 via-white to-amber-50/40 p-6 sm:p-8 shadow-2xl border border-stone-200/80 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          aria-label="關閉卡片"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100/70 text-rose-500 mb-3 shadow-inner">
            <Flower2 className="w-6 h-6 animate-pulse-gentle" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 tracking-tight">
            情緒價值療癒小卡
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            花朵已盛開，你的煩惱已被土壤溫柔吸收轉化
          </p>
        </div>

        {/* Transformation Note */}
        {seedState.text && (
          <div className="mb-5 p-3.5 rounded-xl bg-stone-100/80 border border-stone-200/60 text-xs text-stone-600">
            <span className="text-stone-400 font-medium">釋懷的煩惱：</span>
            <span className="italic text-stone-700 ml-1">「{seedState.text}」</span>
          </div>
        )}

        {/* Empathy Quote Card */}
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-br from-rose-50/80 via-amber-50/50 to-stone-50 border border-rose-200/50 shadow-sm text-center">
          <div className="absolute top-3 left-4 text-rose-300 opacity-60">
            <Heart className="w-4 h-4 fill-rose-200" />
          </div>
          <div className="absolute bottom-3 right-4 text-amber-300 opacity-60">
            <Sparkles className="w-4 h-4" />
          </div>

          <p className="text-stone-500 text-xs tracking-widest font-medium mb-3">
            · 當下的共情擁抱 ·
          </p>
          <p className="text-base sm:text-lg font-medium text-stone-800 leading-relaxed tracking-wide px-2">
            {seedState.healing_quote || '允許自己偶爾脆弱，就像天空總有下雨的時候。雨過之後，泥土的氣味會特別清新。'}
          </p>
        </div>

        {/* Tomorrow Scratch Card */}
        <div className="pt-2 border-t border-stone-200/60">
          <ScratchCard
            encouragementText={seedState.encouragement}
            isScratched={seedState.scratched}
            onScratchComplete={onScratchComplete}
          />
        </div>

        {/* Bottom Affirmation Action */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            收下溫柔，回到花園
          </button>
        </div>
      </div>
    </div>
  );
};
