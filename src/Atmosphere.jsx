import { useMemo } from 'react';



function SunRays() {
  const beams = [
    { angle: 15, offset: 0, dur: 5, del: 0 },
    { angle: 25, offset: 7, dur: 6.5, del: 1.5 },
    { angle: 8, offset: 14, dur: 5.5, del: 0.8 },
    { angle: 35, offset: -3, dur: 7, del: 2.5 },
    { angle: 20, offset: 20, dur: 6, del: 1 },
  ];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%', width: '80%', height: '100%',
        background: 'radial-gradient(ellipse at 25% 15%, rgba(255,210,100,0.25) 0%, rgba(255,200,80,0.08) 25%, transparent 55%)',
        animation: 'rayPulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '-10%', left: '0%', width: '55%', height: '110%',
        background: 'linear-gradient(180deg, rgba(255,220,140,0.12) 0%, rgba(255,200,100,0.06) 20%, transparent 60%)',
        transform: 'rotate(20deg)',
        transformOrigin: 'top left',
        filter: 'blur(15px)',
        animation: 'raySway 6s ease-in-out 0.5s infinite',
      }} />
      {beams.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: '0%', left: `${5 + b.offset}%`,
          width: '50px', height: '140%',
          background: `linear-gradient(180deg, rgba(255,210,120,0.1) 0%, rgba(255,200,80,0.05) 15%, transparent 55%)`,
          transform: `rotate(${b.angle}deg)`,
          transformOrigin: 'top center',
          filter: 'blur(8px)',
          animation: `raySway ${b.dur}s ease-in-out ${b.del}s infinite`,
          '--ray-angle': `${b.angle}deg`,
        }} />
      ))}
    </div>
  );
}

const LEAF_COUNT = 14;
const leafEmojis = ['🍃', '🍂', '🍁', '🌿'];

function FallingLeaves() {
  const leaves = useMemo(() =>
    Array.from({ length: LEAF_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 60,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 16 + Math.random() * 16,
      emoji: leafEmojis[i % leafEmojis.length],
      sway: 30 + Math.random() * 50,
      rotate: Math.random() * 360,
    })),
    []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      {leaves.map(l => (
        <div
          key={l.id}
          style={{
            position: 'absolute',
            left: `${l.left}%`,
            top: '-8%',
            fontSize: `${l.size}px`,
            animation: `leafFall ${l.duration}s linear ${l.delay}s infinite`,
            '--sway': `${l.sway}px`,
            transform: `rotate(${l.rotate}deg)`,
          }}
        >
          {l.emoji}
        </div>
      ))}
    </div>
  );
}

export default function AtmosphereEffects() {
  return (
    <>
      <SunRays />
      <FallingLeaves />
    </>
  );
}
