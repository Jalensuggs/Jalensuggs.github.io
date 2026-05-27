import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const BAR_COUNT = 48;
const GREEN     = '29,185,84';

export default function Visualizer() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const { state, getAnalyser } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      const cssW = canvas.offsetWidth;
      const cssH = canvas.offsetHeight;
      if (!cssW || !cssH) return;

      const dpr   = window.devicePixelRatio || 1;
      const physW = Math.round(cssW * dpr);
      const physH = Math.round(cssH * dpr);

      // 每帧都显式设置 canvas 物理分辨率 + transform
      // 只在尺寸真正变化时才 reset（避免每帧分配内存）
      if (canvas.width !== physW || canvas.height !== physH) {
        canvas.width  = physW;
        canvas.height = physH;
      }

      const ctx = canvas.getContext('2d');
      // 每帧重置 transform，确保 dpr scale 始终正确
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const analyser = getAnalyser();
      const playing  = state.isPlaying && !!analyser;

      const gap  = (cssW * 0.35) / BAR_COUNT;
      const barW = (cssW - gap * BAR_COUNT) / BAR_COUNT;

      let freqData = null;
      if (playing) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * (barW + gap);

        let val = 0;
        if (playing && freqData) {
          const bin = Math.floor((i / BAR_COUNT) * analyser.frequencyBinCount * 0.7);
          val = freqData[bin] / 255;
        }

        const minH = 3;
        const barH = playing ? Math.max(minH, val * cssH * 0.9) : minH;
        const y     = cssH / 2 - barH / 2;
        const alpha = playing ? 0.35 + val * 0.65 : 0.3;

        if (playing && barH > minH) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barH);
          grad.addColorStop(0,   `rgba(${GREEN},${Math.min(1, alpha + 0.25)})`);
          grad.addColorStop(0.5, `rgba(${GREEN},${alpha})`);
          grad.addColorStop(1,   `rgba(${GREEN},${Math.max(0, alpha - 0.15)})`);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = `rgba(${GREEN},0.3)`;
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, Math.min(barW / 2, 3));
        ctx.fill();
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.isPlaying, getAnalyser]);

  return <canvas ref={canvasRef} className="visualizer-canvas" />;
}
