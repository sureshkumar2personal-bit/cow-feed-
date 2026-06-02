import { useEffect } from 'react';

export default function SmokeEffect({ cursorPos, activeRitualCursor }) {
  useEffect(() => {
    if (activeRitualCursor !== 'incense') return;

    const createSmoke = () => {
      const smoke = document.createElement('div');
      const size = 40 + Math.random() * 30;
      
      smoke.style.cssText = `
        position: fixed;
        left: ${cursorPos.x}px;
        top: ${cursorPos.y}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(180,180,180,0.4) 0%, rgba(150,150,150,0.2) 30%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        opacity: 0;
        animation: smokeRise 3s ease-out forwards;
      `;
      document.body.appendChild(smoke);
      setTimeout(() => smoke.remove(), 3000);
    };

    const interval = setInterval(createSmoke, 150);
    return () => clearInterval(interval);
  }, [cursorPos, activeRitualCursor]);

  return null;
}