import { useEffect, useRef } from "react";

/**
 * Floating gold particle system — matches guapexplorer.com behaviour.
 * Particles rise from bottom, drift slightly right, fade in at 10% life
 * and fade out at 90% life. New particles spawn every 2s.
 * Color: #FFD700 at 0.3 opacity.
 */
export default function GoldParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: Array<{
      el: HTMLDivElement;
      startTime: number;
      duration: number;
    }> = [];

    function createParticle() {
      if (!container) return;

      const el = document.createElement("div");
      const size = Math.random() * 2 + 1; // 1–3px
      const left = Math.random() * 100; // % across screen
      const duration = 15000 + Math.random() * 10000; // 15–25s
      const delay = Math.random() * 2000; // 0–2s stagger

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #FFD700;
        border-radius: 50%;
        left: ${left}%;
        bottom: -10px;
        opacity: 0;
        pointer-events: none;
        animation: guap-particle-float ${duration}ms linear ${delay}ms forwards;
      `;

      container.appendChild(el);

      const particle = { el, startTime: Date.now() + delay, duration };
      particles.push(particle);

      // Remove after animation completes
      setTimeout(() => {
        el.remove();
        const idx = particles.indexOf(particle);
        if (idx > -1) particles.splice(idx, 1);
      }, duration + delay + 500);
    }

    // Inject keyframe once
    const styleId = "guap-particle-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes guap-particle-float {
          0%   { transform: translateY(0) translateX(0);    opacity: 0; }
          10%  { opacity: 0.3; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(80px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Seed initial particles staggered
    for (let i = 0; i < 30; i++) {
      setTimeout(createParticle, i * 200);
    }

    // Continuously spawn new particles every 2s
    const interval = setInterval(createParticle, 2000);

    return () => {
      clearInterval(interval);
      particles.forEach((p) => p.el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
