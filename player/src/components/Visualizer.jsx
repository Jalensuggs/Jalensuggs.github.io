import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function Visualizer() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const { state, getAnalyser } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const analyser = getAnalyser();

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (!analyser || !state.isPlaying) {
        // Idle flat bars
        const barCount = 40;
        const barW = (W / barCount) * 0.6;
        const gap = (W / barCount) * 0.4;
        for (let i = 0; i < barCount; i++) {
          const x = i * (barW + gap);
          const h = 3;
          ctx.fillStyle = 'rgba(29,185,84,0.25)';
          ctx.beginPath();
          ctx.roundRect(x, H / 2 - h / 2, barW, h, 2);
          ctx.fill();
        }
        return;
      }

      const bufferLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLen);
      analyser.getByteFrequencyData(dataArr);

      const barCount = 40;
      const step = Math.floor(bufferLen / barCount);
      const barW = (W / barCount) * 0.6;
      const gap = (W / barCount) * 0.4;

      for (let i = 0; i < barCount; i++) {
        const val = dataArr[i * step] / 255;
        const h = Math.max(4, val * H * 0.85);
        const x = i * (barW + gap);
        const y = H / 2 - h / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        gradient.addColorStop(0, `rgba(29,185,84,${0.5 + val * 0.5})`);
        gradient.addColorStop(1, `rgba(29,185,84,0.2)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 3);
        ctx.fill();
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.isPlaying, getAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      className="visualizer-canvas"
      width={400}
      height={80}
    />
  );
}
