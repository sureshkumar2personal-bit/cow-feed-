import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playConch } from './audio';

const FIVE = 5;
const TEN = 10;
const TWENTY_FIVE = 25;
const FIFTY = 50;

const LEVELS = [
  { name: 'Seeker', min: 0 },
  { name: 'Devotee', min: FIVE },
  { name: 'Bhakta', min: TEN },
  { name: 'Blessed Soul', min: TWENTY_FIVE },
  { name: 'Divine Soul', min: FIFTY },
];

const MANTRA_LIST = ['ॐ', 'Om Namah Shivaya', 'Sri Ram', 'Gomata','sri Kamadhenu','Jai Gopal','Hare Krishna','Shri Radhe','Shri Krishna', 'Shri Vishnu', 'Shri Lakshmi', 'Shri Saraswati','Shri Ganesh','Shri Hanuman','Shri Durga','Shri Kali','Shri Shiva','Shri Parvati','Shri Brahma','Shri Indra','Shri Agni','Shri Varuna','Shri Vayu','Shri Surya','Shri Chandra','Shri Ganga','Shri Yamuna','Shri Narmada','Shri Saraswati','Shri Tulsi','Shri Maruti','Shri Anjaneya'];
const PRASADAM_LIST = [
  { emoji: '🌿', label: 'Vibhuti' },
  { emoji: '✨', label: 'Kumkum' },
  { emoji: '🍚', label: 'Prasadam' },
  { emoji: '🌸', label: 'Temple Flower' },
];
const PETAL_LIST = ['🌹', '🪷', '🌼'];

/* ─── Temple Bell ─── */
function TempleBell({ trigger }) {
  const [active, setActive] = useState(false);
  const [quote, setQuote] = useState('');
  const audioRef = useRef(null);

  const BLESSINGS = [
    'May divine grace bless you',
    'Your offering is accepted',
    'Peace and prosperity be yours',
    'May your heart be filled with light',
    'Blessings of the divine upon you',
    'Your devotion brings sacred blessings',
    'May kindness follow you always',
    'The divine smiles upon your offering',
  ];

  useEffect(() => {
    if (!trigger) return;
    setActive(true);
    setQuote(BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]);
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 2;
    audio.play().catch(() => {});

    const onTime = () => {
      if (audio.currentTime >= 5) {
        audio.pause();
        setActive(false);
      }
    };
    audio.addEventListener('timeupdate', onTime);

    const fallback = setTimeout(() => setActive(false), 5000);
    return () => {
      clearTimeout(fallback);
      audio.removeEventListener('timeupdate', onTime);
      audio.pause();
    };
  }, [trigger]);

  return (
    <>
      <audio ref={audioRef} src="/templebell.mp3" preload="auto" />
      {active && (
        <div className="temple-bell-overlay">
          <span className="temple-bell-icon">🔔</span>
          <div className="temple-bell-glow" />
          <div className="temple-bell-quote">{quote}</div>
        </div>
      )}
    </>
  );
}

/* ─── Blessing Particles ─── */
function BlessingParticles({ trigger, cowRef }) {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const rect = cowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.3;

    const newP = [];
    for (let i = 0; i < 12; i++) {
      idRef.current += 1;
      newP.push({
        id: idRef.current,
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 40,
        size: 3 + Math.random() * 5,
        dx: (Math.random() - 0.5) * 40,
        dy: -(80 + Math.random() * 120),
        dur: 1.2 + Math.random() * 0.8,
        delay: Math.random() * 0.3,
      });
    }
    setParticles((prev) => [...prev, ...newP]);
    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newP.find((n) => n.id === p.id)));
    }, 2000);
    return () => clearTimeout(t);
  }, [trigger, cowRef]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="blessing-particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Light Rays ─── */
function LightRays({ trigger }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!show) return null;

  return (
    <div className="light-rays-container">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="light-ray-beam"
          style={{
            transform: `rotate(${(i - 1) * 15}deg)`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Flower Petal Shower ─── */
function FlowerShower({ trigger }) {
  const [petals, setPetals] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const newP = [];
    for (let i = 0; i < 18; i++) {
      idRef.current += 1;
      newP.push({
        id: idRef.current,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 1.8 + Math.random() * 1.2,
        petal: PETAL_LIST[i % PETAL_LIST.length],
        size: 16 + Math.random() * 12,
        sway: (Math.random() - 0.5) * 80,
      });
    }
    setPetals((prev) => [...prev, ...newP]);
    const t = setTimeout(() => {
      setPetals((prev) => prev.filter((p) => !newP.find((n) => n.id === p.id)));
    }, 3500);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 49 }}>
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal-particle"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            fontSize: `${p.size}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            '--sway': `${p.sway}px`,
          }}
        >
          {p.petal}
        </div>
      ))}
    </div>
  );
}

/* ─── Floating Mantra ─── */
function FloatingMantra() {
  const [mantras, setMantras] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = () => {
      idRef.current += 1;
      const m = MANTRA_LIST[Math.floor(Math.random() * MANTRA_LIST.length)];
      const newM = {
        id: idRef.current,
        text: m,
        left: 10 + Math.random() * 60,
        size: m.length < 3 ? 50 : 30,
        dur: 8 + Math.random() * 6,
      };
      setMantras((prev) => [...prev, newM]);
      setTimeout(() => {
        setMantras((prev) => prev.filter((x) => x.id !== newM.id));
      }, 16000);
    };

    spawn();
    const interval = setInterval(spawn, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {mantras.map((m) => (
        <div
          key={m.id}
          className="floating-mantra"
          style={{
      left: `${m.left}%`,
                top: '60%',
                fontSize: `${m.size}px`,
                animationDuration: `${m.dur}s`,
                color: 'rgba(255, 220, 150, 1)',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
              }}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

/* ─── Punya Meter ─── */
function PunyaMeter({ total }) {
  const level = useMemo(() => {
    let l = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (total >= LEVELS[i].min) {
        l = LEVELS[i];
        break;
      }
    }
    return l;
  }, [total]);

  const currentIdx = LEVELS.findIndex((l) => l.name === level.name);
  const nextLevel = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
  const progress = nextLevel
    ? Math.min(1, (total - level.min) / (nextLevel.min - level.min))
    : 1;

  return (
    <div className="punya-meter" role="status" aria-label={`Spiritual level: ${level.name}`}>
      <div className="punya-header">
        <span className="punya-icon">🪷</span>
        <span className="punya-level">{level.name}</span>
      </div>
      <div className="punya-bar-track">
        <div className="punya-bar-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="punya-footer">
        <span>{total} offerings</span>
        {nextLevel && <span>{nextLevel.name}</span>}
      </div>
    </div>
  );
}

/* ─── Prasadam Reward ─── */
function PrasadamReward({ trigger }) {
  const [reward, setReward] = useState(null);

  useEffect(() => {
    if (!trigger) return;
    if (Math.random() > 0.35) return;
    const r = PRASADAM_LIST[Math.floor(Math.random() * PRASADAM_LIST.length)];
    setReward(r);
    const t = setTimeout(() => setReward(null), 3500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!reward) return null;

  return (
    <div className="prasadam-overlay">
      <div className="prasadam-card">
        <div className="prasadam-emoji">{reward.emoji}</div>
        <div className="prasadam-label">{reward.label}</div>
        <div className="prasadam-sub">Prasadam received!</div>
      </div>
    </div>
  );
}

/* ─── Cow Aura ─── */
function CowAura({ rect, level }) {
  const intensity = Math.min(1, level / FIFTY);

  return (
    <div
      className="cow-aura"
      style={{
        position: 'fixed',
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2,
        width: rect.width * 1.8,
        height: rect.height * 1.2,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 2,
        background: `radial-gradient(ellipse, rgba(255,200,50,${0.06 + intensity * 0.15}) 0%, transparent 70%)`,
        boxShadow: `0 0 ${40 + intensity * 80}px rgba(255, 200, 50, ${0.05 + intensity * 0.2})`,
        transition: 'opacity 1s ease, box-shadow 1s ease',
        opacity: 0.2 + intensity * 0.5,
      }}
    />
  );
}

/* ─── Main Orchestrator ─── */
export default function DevotionalEffects({ offerTrigger = 0, cowRef, totalOfferings = 0, happiness = 0 }) {
  const [cowRect, setCowRect] = useState(null);

  useEffect(() => {
    if (!cowRef.current) return;
    const rect = cowRef.current.getBoundingClientRect();
    setCowRect(rect);
  }, [cowRef]);

  return (
    <>
      <FloatingMantra />
      <PunyaMeter total={totalOfferings} />
      <TempleBell trigger={offerTrigger} />
      <LightRays trigger={offerTrigger} />
      <BlessingParticles trigger={offerTrigger} cowRef={cowRef} />
      <FlowerShower trigger={offerTrigger} />
      <PrasadamReward trigger={offerTrigger} />
      {cowRect && <CowAura rect={cowRect} level={happiness} />}
      {offerTrigger > 0 && offerTrigger % 10 === 0 && <ConchEffect trigger={offerTrigger} />}
    </>
  );
}

function ConchEffect({ trigger }) {
  useEffect(() => {
    playConch();
  }, [trigger]);

  return null;
}

export { CowAura, PrasadamReward };
