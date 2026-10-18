import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundManager } from '../audio';
import { Sparkles, Check } from 'lucide-react';

interface ScratchCardProps {
  encouragementText: string;
  isScratched: boolean;
  onScratchComplete: () => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  encouragementText,
  isScratched,
  onScratchComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentScratched, setPercentScratched] = useState(isScratched ? 100 : 0);
  const [completed, setCompleted] = useState(isScratched);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas coating
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || completed) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 340;
    const height = 120;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Silver gradient with subtle shimmer particles
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#CBD5E1');
    gradient.addColorStop(0.3, '#E2E8F0');
    gradient.addColorStop(0.5, '#F8FAFC');
    gradient.addColorStop(0.7, '#E2E8F0');
    gradient.addColorStop(1, '#94A3B8');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay delicate decorative pattern dots
    ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
    for (let x = 12; x < width; x += 20) {
      for (let y = 12; y < height; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Guide text on silver coating
    ctx.fillStyle = '#475569';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ 用手指或滑鼠刮開銀色塗層 ✨', width / 2, height / 2 - 8);
    ctx.fillStyle = '#64748B';
    ctx.font = '400 11px system-ui, sans-serif';
    ctx.fillText('揭曉明日專屬的溫柔祝福', width / 2, height / 2 + 14);
  }, [completed]);

  useEffect(() => {
    if (!completed) {
      initCanvas();
    }
  }, [initCanvas, completed]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!completed) {
        initCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [completed, initCanvas]);

  // Check progress by sampling pixels
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparentPixels = 0;
      const stride = 32; // sample every 32nd pixel for performance

      for (let i = 3; i < data.length; i += 4 * stride) {
        if (data[i] < 128) {
          transparentPixels++;
        }
      }

      const totalSampled = data.length / (4 * stride);
      const percent = Math.min(100, Math.round((transparentPixels / totalSampled) * 100));
      setPercentScratched(percent);

      if (percent >= 45 && !completed) {
        setCompleted(true);
        soundManager.playBloom();
        onScratchComplete();
      }
    } catch {
      // ignore
    }
  }, [completed, onScratchComplete]);

  // Drawing logic
  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || completed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 36; // comfortable touch radius

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    soundManager.playScratch();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (completed) return;
    setIsDrawing(true);
    lastPointRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || completed) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPointRef.current = null;
      checkScratchPercentage();
    }
  };

  // Instant reveal
  const handleQuickReveal = () => {
    setCompleted(true);
    setPercentScratched(100);
    soundManager.playBloom();
    onScratchComplete();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>明天的專屬鼓勵話語</span>
        </div>
        {!completed ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-600 tabular-nums">已刮開 {percentScratched}%</span>
            <button
              onClick={handleQuickReveal}
              className="text-[11px] text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              直接揭曉
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>已揭曉祝福</span>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[120px] rounded-xl overflow-hidden border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-rose-50/70 select-none shadow-sm flex items-center justify-center p-4"
      >
        {/* Underlying Revealed Content */}
        <div className="text-center px-4 max-w-sm">
          <p className="text-xs font-medium text-amber-700/80 mb-1">【 明日的晨光祝福 】</p>
          <p className="text-sm font-semibold text-stone-800 leading-relaxed tracking-wide">
            {encouragementText}
          </p>
        </div>

        {/* Scratchable Canvas Overlay */}
        {!completed && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="absolute inset-0 cursor-crosshair touch-none z-10 transition-opacity duration-300"
          />
        )}
      </div>

      {!completed && (
        <p className="text-center text-[11px] text-stone-600 mt-2">
          刮開超過 45% 將自動點亮專屬祝福
        </p>
      )}
    </div>
  );
};
