import React, { useState } from 'react';
import { SeedState } from '../types';
import { soundManager } from '../audio';
import { getRandomHealingQuote, getRandomEncouragement } from '../data/quotesAndTasks';
import { Droplet, Sparkles, Sprout, Flower2 } from 'lucide-react';

interface PlantGardenProps {
  seedState: SeedState;
  onUpdateSeed: (updated: SeedState) => void;
  onOpenCardModal: () => void;
}

export const PlantGarden: React.FC<PlantGardenProps> = ({
  seedState,
  onUpdateSeed,
  onOpenCardModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isWateringAnim, setIsWateringAnim] = useState(false);
  const [waterSplashKey, setWaterSplashKey] = useState(0);

  // Plant a worry
  const handlePlantWorry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundManager.playPlant();
    onUpdateSeed({
      text: inputText.trim().slice(0, 50),
      stage: 0,
      unlocked_card: false,
      scratched: false,
      encouragement: getRandomEncouragement(),
      healing_quote: getRandomHealingQuote(),
    });
    setInputText('');
  };

  // Water the seed
  const handleWater = () => {
    if (seedState.stage >= 3) return;

    soundManager.playWater();
    setIsWateringAnim(true);
    setWaterSplashKey((prev) => prev + 1);

    setTimeout(() => {
      setIsWateringAnim(false);
    }, 700);

    const nextStage = seedState.stage + 1;
    if (nextStage === 3) {
      setTimeout(() => {
        soundManager.playBloom();
      }, 350);
    }

    onUpdateSeed({
      ...seedState,
      stage: nextStage,
      healing_quote: seedState.healing_quote || getRandomHealingQuote(),
      encouragement: seedState.encouragement || getRandomEncouragement(),
    });
  };

  const stagePercentages = [0, 33, 66, 100];
  const currentPercent = stagePercentages[seedState.stage] || 0;
  const isBloomed = seedState.stage >= 3;
  const isPlanted = !!seedState.text;

  return (
    <div className="w-full rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isBloomed ? 'bg-amber-100/80 opacity-90' : 'bg-emerald-50/70 opacity-50'
        }`} 
      />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
            <span>心靈花園與壞心情種子</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            將心中的沉重當作養分，每天灌溉三次，讓煩惱蛻變為盛開的溫柔。
          </p>
        </div>

        {isPlanted && (
          <div className="flex items-center gap-3 text-xs text-stone-600 bg-stone-50 px-3.5 py-1.5 rounded-full border border-stone-200/60 self-start sm:self-auto">
            <span>成長進度</span>
            <span className="font-semibold text-stone-800 tabular-nums">{currentPercent}%</span>
            <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Garden Layout: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Visual Plant Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div 
            onClick={isBloomed ? onOpenCardModal : undefined}
            className={`relative w-full max-w-md h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-stone-50/90 via-emerald-50/20 to-amber-100/30 border border-stone-200/70 flex flex-col items-center justify-end p-6 select-none transition-all duration-300 ${
              isBloomed ? 'cursor-pointer hover:shadow-md hover:border-rose-300 group' : ''
            }`}
          >
            {/* Water Drops Animation */}
            {isWateringAnim && (
              <div key={waterSplashKey} className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="flex gap-4 animate-water-drop">
                  <span className="w-2.5 h-3.5 bg-sky-400 rounded-full blur-[0.5px] opacity-90" />
                  <span className="w-3 h-4 bg-sky-500 rounded-full blur-[0.5px] opacity-90 -mt-2" />
                  <span className="w-2 h-3 bg-sky-400 rounded-full blur-[0.5px] opacity-90 mt-1" />
                </div>
              </div>
            )}

            {/* Stage Visuals */}
            {!isPlanted ? (
              // Empty Pot waiting for seed
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-400 mb-3 shadow-inner">
                  <Sprout className="w-8 h-8 opacity-60" />
                </div>
                <p className="text-sm font-medium text-stone-600">花盆已備妥鬆軟的泥土</p>
                <p className="text-xs text-stone-600 mt-1 max-w-xs">
                  在右側寫下今天讓你疲憊的心事，埋入土中開始轉化
                </p>
              </div>
            ) : (
              // Plant Growth Stages
              <div className="relative w-full h-full flex flex-col items-center justify-end">
                {/* Visual Graphic */}
                <div className="relative flex items-center justify-center mb-2">
                  {seedState.stage === 0 && (
                    // Stage 0: 0% Buried Seed in Soil with Glow
                    <div className="flex flex-col items-center animate-gentle-float">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-amber-700/80 border-2 border-amber-600 shadow-md flex items-center justify-center">
                          <span className="w-3 h-4 rounded-full bg-amber-400/80 blur-[1px]" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-stone-500 mt-3 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200 shadow-xs">
                        種子深埋土中 · 靜候萌芽
                      </span>
                    </div>
                  )}

                  {seedState.stage === 1 && (
                    // Stage 1: 33% Sprout
                    <div className="flex flex-col items-center animate-gentle-float">
                      <div className="relative">
                        <svg width="68" height="76" viewBox="0 0 68 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Stem */}
                          <path d="M34 76 C34 50 34 38 34 26" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
                          {/* Left Leaf */}
                          <path d="M34 40 C20 38 12 28 14 18 C26 18 32 28 34 38" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
                          {/* Right Leaf */}
                          <path d="M34 32 C48 30 56 20 54 10 C42 10 36 20 34 30" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
                          {/* Morning Dew drop */}
                          <circle cx="18" cy="20" r="2.5" fill="#BAE6FD" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 mt-2 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                        嫩綠嫩芽破土而出 · 迎向晨光
                      </span>
                    </div>
                  )}

                  {seedState.stage === 2 && (
                    // Stage 2: 66% Branching Stem
                    <div className="flex flex-col items-center animate-gentle-float">
                      <div className="relative">
                        <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Main Trunk */}
                          <path d="M45 110 C45 70 43 45 45 22" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
                          {/* Lower Left Leaf */}
                          <path d="M44 80 C24 78 10 65 12 50 C28 50 38 65 44 76" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
                          {/* Lower Right Leaf */}
                          <path d="M46 68 C66 65 80 52 78 38 C62 38 52 52 46 64" fill="#22C55E" stroke="#166534" strokeWidth="2" />
                          {/* Upper Left Leaf */}
                          <path d="M44 48 C28 42 18 30 22 18 C34 20 40 34 44 44" fill="#86EFAC" stroke="#166534" strokeWidth="2" />
                          {/* Small Flower Bud forming */}
                          <circle cx="45" cy="18" r="8" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
                          <circle cx="45" cy="18" r="4" fill="#FDE047" />
                        </svg>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 mt-2 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                        枝葉茁壯生長 · 花苞悄悄孕育
                      </span>
                    </div>
                  )}

                  {seedState.stage === 3 && (
                    // Stage 3: 100% Blooming Flower
                    <div className="flex flex-col items-center animate-bloom-glow">
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <svg width="120" height="130" viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Stem */}
                          <path d="M60 130 C60 90 59 70 60 52" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
                          {/* Leaves */}
                          <path d="M58 95 C35 92 20 80 22 65 C40 65 52 80 58 90" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
                          <path d="M62 82 C85 80 100 68 98 52 C80 52 68 68 62 78" fill="#22C55E" stroke="#166534" strokeWidth="2" />
                          {/* Flower Halo */}
                          <circle cx="60" cy="40" r="34" fill="#FDE047" fillOpacity="0.25" />
                          {/* Petals */}
                          <circle cx="60" cy="20" r="15" fill="#FB7185" />
                          <circle cx="78" cy="30" r="15" fill="#F43F5E" />
                          <circle cx="78" cy="50" r="15" fill="#FDA4AF" />
                          <circle cx="60" cy="60" r="15" fill="#FB7185" />
                          <circle cx="42" cy="50" r="15" fill="#FDA4AF" />
                          <circle cx="42" cy="30" r="15" fill="#F43F5E" />
                          {/* Flower Center with Golden Warmth */}
                          <circle cx="60" cy="40" r="13" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
                          <circle cx="60" cy="40" r="7" fill="#FEF08A" />
                        </svg>
                      </div>

                      {/* Clickable Callout Banner */}
                      <div className="mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white text-xs font-semibold shadow-md group-hover:shadow-lg transition-shadow animate-pulse-gentle">
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>點擊花朵，領取情緒價值療癒小卡</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Soil Garden Bed Mound */}
                <div className="w-full h-12 bg-gradient-to-t from-stone-800 via-stone-700 to-amber-900/90 rounded-2xl border-t-4 border-amber-950/40 relative overflow-hidden flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] [background-size:12px_12px] opacity-25" />
                  <span className="text-[11px] text-amber-200/70 font-medium tracking-wider relative z-10">
                    溫暖的心靈沃土
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interaction Controls */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          {!isPlanted ? (
            // Form to plant worry
            <form onSubmit={handlePlantWorry} className="space-y-4">
              <div>
                <label htmlFor="worry-input" className="block text-sm font-semibold text-stone-800 mb-1">
                  寫下今天的壞心情或煩惱
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  無論是工作的焦慮、人際的委屈或莫名的疲憊，請放心地寫下來（限 50 字）。
                </p>
                <div className="relative">
                  <textarea
                    id="worry-input"
                    rows={3}
                    maxLength={50}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="例：今天會議被主管打槍好挫折，覺得自己不夠好..."
                    className="w-full rounded-xl border border-stone-300 p-3 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 transition-colors resize-none"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[11px] text-stone-400 tabular-nums">
                    {inputText.length}/50
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>種下煩惱，化作養分</span>
              </button>
            </form>
          ) : (
            // Watering Controls & Seed State Details
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
                <span className="text-[11px] font-medium text-stone-400 tracking-wider">
                  已埋入的煩惱
                </span>
                <p className="text-sm font-medium text-stone-800 mt-1 italic">
                  「{seedState.text}」
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-2.5 border-t border-stone-200/50">
                  <span>澆水進度</span>
                  <span className="font-semibold text-stone-700 tabular-nums">
                    {seedState.stage} / 3 次
                  </span>
                </div>
              </div>

              {/* Water Action Button */}
              <div>
                {!isBloomed ? (
                  <button
                    type="button"
                    onClick={handleWater}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    <Droplet className="w-4 h-4 fill-sky-200 text-sky-100 animate-bounce" />
                    <span>為種子澆水 ({3 - seedState.stage} 次後盛開)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenCardModal}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    <Flower2 className="w-4 h-4 text-rose-100" />
                    <span>查看情緒價值小卡與刮刮卡</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                💧 每次澆水代表給自己一次溫和的深呼吸。三次灌溉後花朵將盛開，並賦予你專屬的心靈小卡。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
