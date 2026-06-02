import { useCallback, useState, useEffect, useRef } from 'react';
import './Landscape.css';
import * as Matter from 'matter-js';
import { HandModelWrapper } from './HandComponents';
import SmokeEffect from './SmokeEffect';

// Hook for tab visibility changes
function useVisibilityChange(callback) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof callback === 'function') {
        callback(!document.hidden);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [callback]);
}

// Feed success messages for each item
const feedMessages = {
  agathi1: "Agastya's wisdom awakens - your intellect shines with Mercury's blessing! 🧠✨",
  banana: "Jupiter's abundance flows - prosperity and wisdom bless your path! 🪐💰",
  barmuda: "Mercury's clarity awakens - sharp mind, successful ventures ahead! 🎯🧠",
  greengrass: "Earth's vitality surges - growth and healing manifest in your life! 🌎⚡",
  grass: "Sacred offering accepted - all obstacles dissolve, blessings multiply! 🐄🙏",
  jangiri: "Mars' courage ignites - success and sweetness fill your journey! 🗡️🍯"
};

const sidebarItems = [
  { key: 'agathi1', src: '/agathi1.png', alt: 'Agathi1', coins: 10 },
  { key: 'banana', src: '/banana.png', alt: 'Banana', coins: 8 },
  { key: 'barmuda', src: '/barmuda.png', alt: 'Barmuda', coins: 13 },
  { key: 'greengrass', src: '/greengrass.png', alt: 'Green Grass', coins: 20 },
  { key: 'grass', src: '/grass.png', alt: 'Grass', coins: 11 },
  { key: 'jangiri', src: '/jangiri.png', alt: 'Jangiri', coins: 60 }
];

const initialItemCounts = sidebarItems.reduce((counts, item) => {
  counts[item.key] = 0;
  return counts;
}, {});

function Landscape() {
    const [handVisible, setHandVisible] = useState(false);
    const [isWalking, setIsWalking] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [hoveredItem, setHoveredItem] = useState(null);
    const [heldItem, setHeldItem] = useState(null);
    const [activeRitualCursor, setActiveRitualCursor] = useState(null);
    const [cursorHandSrc, setCursorHandSrc] = useState('/hand.png');
const [feedMessage, setFeedMessage] = useState(null);
    const [noCoinsMessage, setNoCoinsMessage] = useState(null);
    const [coins, setCoins] = useState(130);
    const coinsRef = useRef(coins);
   const [itemCounts, setItemCounts] = useState(initialItemCounts);
   const verticalItemsRef = useRef(null);
   const cowRef = useRef(null);
   const bellAudioRef = useRef(null);
   const landscapeRef = useRef(null);
   const engineRef = useRef(null);
   const runnerRef = useRef(null);
   const renderRef = useRef(null);
   const bodiesRef = useRef({});
   const animationFrameRef = useRef(null);

const showHand = useCallback(() => {
      setHandVisible(true);
      setIsWalking(true);

      if (bodiesRef.current.hand) {
        Matter.Body.setPosition(bodiesRef.current.hand, { x: 80, y: 500 });
        Matter.Body.setVelocity(bodiesRef.current.hand, { x: 0, y: 0 });
        Matter.Body.applyForce(bodiesRef.current.hand, bodiesRef.current.hand.position, { x: 0.008, y: -0.005 });
      }
    }, []);

    const hideHand = useCallback(() => {
      setHandVisible(false);
      setHeldItem(null);
      setActiveRitualCursor(null);
    }, []);

// Hide system cursor (always replaced by custom hand)
     useEffect(() => {
       document.body.style.cursor = 'none';
       return () => { document.body.style.cursor = ''; };
     }, []);

    const updateItemCount = (itemKey, delta) => {
     setItemCounts((counts) => ({
       ...counts,
       [itemKey]: Math.max(0, counts[itemKey] + delta)
     }));
   };

   // Keep coinsRef in sync with coins state
   useEffect(() => {
     coinsRef.current = coins;
   }, [coins]);

const fetchItem = (itemKey) => {
      if (activeRitualCursor) return;

      const item = sidebarItems.find(i => i.key === itemKey);
      if (!item || coinsRef.current < item.coins) {
        setNoCoinsMessage("Not enough coins! 😢 Refresh the page to start over");
        setTimeout(() => setNoCoinsMessage(null), 3000);
        return;
      }
      setCoins(c => c - item.coins);
      updateItemCount(itemKey, 1);
      setHeldItem(itemKey);
      setHoveredItem(null);
    };

    const sprinkleFlowers = () => {
      const target = document.body;
      const flowers = ['🌸','🌺','🌼','🪷','🌻','🌹'];

      let cx = window.innerWidth / 2;
      let cy = window.innerHeight / 2 - 80;

      if (cowRef.current) {
        const rect = cowRef.current.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height * -0.7; // top of cow card
      }

      for (let i = 0; i < 22; i++) {
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        const el = document.createElement('div');
        el.textContent = flower;
        el.style.cssText = `
          position: fixed;
          left: ${cx}px;
          top: ${cy}px;
          font-size: ${24 + Math.random() * 28}px;
          z-index: 10000;
          transition: none;
          opacity: 1;
          pointer-events: none;
          transform: translate(0, 0) rotate(0deg);
        `;
        target.appendChild(el);

        const tx = (Math.random() - 0.5) * 480;
        const ty = 100 + Math.random() * 360;
        const rot = Math.random() * 160 - 80;

        void el.offsetWidth;

        el.style.transition = 'transform 2.2s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 2.2s ease';
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
        el.style.opacity = '0';

        setTimeout(() => el.remove(), 4000);
      }
    };

    const triggerFlowerSprinkle = () => {
      sprinkleFlowers();
    };

    useEffect(() => {
      const handleMouseMove = (e) => {
        setCursorPos({ x: e.clientX, y: e.clientY });

        if (!heldItem && verticalItemsRef.current && !activeRitualCursor) {
          const feedRow = document.elementFromPoint(e.clientX, e.clientY)?.closest('.feed-item-row');
          setHoveredItem(feedRow?.dataset.feedKey || null);
        } else {
          setHoveredItem(null);
        }
      };

      const handleClick = (e) => {
        if (e.target.closest?.('.item-count-control')) return;

        if (heldItem && cowRef.current) {
          // Check if click is over cow area
          const rect = cowRef.current.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            // Show success message and drop item
            setFeedMessage(feedMessages[heldItem]);
            updateItemCount(heldItem, -1);
            setHeldItem(null);
            // Clear message after 3 seconds
            setTimeout(() => setFeedMessage(null), 4000);
          }
        }

        if (hoveredItem && !heldItem && itemCounts[hoveredItem] > 0 && !activeRitualCursor) {
          // Pick up item from sidebar
          setHeldItem(hoveredItem);
          setHoveredItem(null);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
      };
    }, [heldItem, hoveredItem, itemCounts, activeRitualCursor]);

   // Bell sound effect - plays every 7 seconds after user interaction
    const [userInteracted, setUserInteracted] = useState(false);
    useEffect(() => {
      const handleFirstInteraction = () => {
        setUserInteracted(true);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
    }, []);

    useEffect(() => {
      if (!userInteracted) return;
      const playBellSound = () => {
        if (bellAudioRef.current) {
          bellAudioRef.current.currentTime = 0;
          bellAudioRef.current.play().catch(() => {});
        }
      };
      playBellSound();
      const bellInterval = setInterval(playBellSound, 7000);
      return () => clearInterval(bellInterval);
    }, [userInteracted]);

  const [webglAvailable] = useState(() => {
     if (typeof document === 'undefined') return false;
     try {
       const canvas = document.createElement('canvas');
       return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
     } catch {
       return false;
     }
   });

  useVisibilityChange((visible) => {
    if (!visible && runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    } else if (visible && engineRef.current) {
      runnerRef.current = Matter.Runner.create();
      Matter.Runner.run(runnerRef.current, engineRef.current);
    }
  });

  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5 },
      enableSleeping: true
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        showAngleIndicator: false,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;

    const ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true, label: 'ground' });
    const handBody = Matter.Bodies.rectangle(650, 500, 80, 80, {
      label: 'hand', restitution: 0.1, friction: 0.8, density: 0.001
    });
    const cowBody = Matter.Bodies.rectangle(720, 500, 200, 200, {
      label: 'cow', isStatic: true, restitution: 0.1, friction: 0.6
    });
    const grassBody = Matter.Bodies.rectangle(400, 550, 100, 30, {
      label: 'grass', isStatic: true, isSensor: true, render: { opacity: 0 }
    });

    Matter.World.add(engine.world, [ground, handBody, cowBody, grassBody]);
    bodiesRef.current = { hand: handBody, cow: cowBody, grass: grassBody, ground };

    runnerRef.current = Matter.Runner.create();
    Matter.Runner.run(runnerRef.current, engine);
    Matter.Render.run(render);

    const syncPosition = () => {
      if (!document.hidden) {
        const handPos = bodiesRef.current.hand.position;
        const cowPos = bodiesRef.current.cow.position;

        if (Math.abs(handPos.x - cowPos.x) < 100 && isWalking) {
          setIsWalking(false);
          Matter.Body.setVelocity(bodiesRef.current.hand, { x: 0, y: 0 });
        }
      }
      animationFrameRef.current = requestAnimationFrame(syncPosition);
    };
    animationFrameRef.current = requestAnimationFrame(syncPosition);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      Matter.Render.stop(render);
      if (render.canvas?.parentNode) render.canvas.parentNode.removeChild(render.canvas);
    };
  }, [isWalking]);

useEffect(() => {
    if (isWalking && bodiesRef.current.hand) {
      Matter.Body.applyForce(bodiesRef.current.hand, bodiesRef.current.hand.position, { x: 0.008, y: -0.005 });
    }
  }, [isWalking]);

useEffect(() => {
      if (landscapeRef.current) {
        landscapeRef.current.focus();
      }
    }, []);

useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setHeldItem(null);
          setActiveRitualCursor(null);
          if (handVisible) {
            hideHand();
          }
        }
if ((e.key === 'h' || e.key === 'H')) {
           if (handVisible) {
             hideHand();
           } else {
             setHeldItem(null);
             setFeedMessage(null);
             setNoCoinsMessage(null);
             setActiveRitualCursor(null);
             showHand();
           }
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handVisible, heldItem, showHand, hideHand]);

   return (
     <div
       ref={landscapeRef}
       className="landscape"
       tabIndex={0}
onKeyDown={(e) => {
          if (e.key === 'h' || e.key === 'H') {
            if (handVisible) {
              hideHand();
            } else {
              setHeldItem(null);
              setFeedMessage(null);
              setNoCoinsMessage(null);
              setActiveRitualCursor(null);
              showHand();
            }
          }
          if (e.key === 'Escape') {
            setHeldItem(null);
            setActiveRitualCursor(null);
            if (handVisible) hideHand();
          }
        }}
       style={{ position: 'absolute', width: '100%', height: '100vh', overflow: 'hidden' }}
     >
<div className="sky-background"></div>
        <div className="soil-background"></div>
        <div className="greenland-background"></div>



            <div ref={cowRef} className="cow-emoji" style={{ left: '400px', bottom: '0%', position: 'absolute', transform: 'translateX(-50%)', zIndex: 3 }}>
            <video
              src="/cowm.webm"
              className="cow-video"
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={(e) => {
                e.target.currentTime = 2; // Start from 2nd second
              }}
              onTimeUpdate={(e) => {
                if (e.target.currentTime >= 4.8) {
                  e.target.currentTime = 2;
                }
              }}
             />
              {/* Cow Bell on Neck */}

            </div>

      {/* Tree image */}
      {/* <div className="tree-emoji">
        <img src="/neem.png" alt="Neem Tree" className="tree-image" />
      </div> */}

       {/* Main hand - follows physics */}
       {handVisible && <HandModelWrapper bodiesRef={bodiesRef} scale={0.15} />}

      {/* Static hand on right corner - as image fallback */}
      {/* <div
        className="corner-hand"
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '80px',
          height: '80px',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        <img src="/neem.png" alt="Hand" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div> */}

      {/* Fallback when WebGL not available */}
      {!webglAvailable && (
        <div className="hand-fallback" style={{ position: 'absolute', left: '50%', bottom: '10%', transform: 'translateX(-50%)', zIndex: 4, fontSize: '80px' }}>
          🤚
        </div>
      )}

{/* Cursor hand - follows mouse position */}
               <img
                  src={cursorHandSrc}
                 alt="Cursor Hand"
                 style={{
                   position: 'fixed',
                   left: `${cursorPos.x}px`,
                   top: `${cursorPos.y}px`,
                   width: '150px',
                   height: '150px',
                   transform: 'translate(-50%, -50%)',
                   pointerEvents: 'none',
                   zIndex: (heldItem || activeRitualCursor) ? 9998 : 9999,
                   cursor: 'none',
                   visibility: activeRitualCursor ? 'hidden' : 'visible'
                 }}
               />

{/* Held item - follows cursor when picked up, appears above hand */}
               {heldItem && (
                 <img
                   src={`/${heldItem}.png`}
                   alt={heldItem}
                   style={{
                     position: 'fixed',
                     left: `${cursorPos.x}px`,
                     top: `${cursorPos.y}px`,
                     width: '80px',
                     height: '80px',
                     transform: 'translate(-50%, -50%)',
                     pointerEvents: 'none',
                     zIndex: 10000
                   }}
                 />
               )}

{activeRitualCursor && !handVisible && (
                  <div style={{
                    position: 'fixed',
                    left: `${cursorPos.x}px`,
                    top: `${cursorPos.y}px`,
                    fontSize: '42px',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10001
                  }}>
                    {activeRitualCursor === 'camphor' ? '🪔' :
                     activeRitualCursor === 'incense' ? '🕯️' :
                     activeRitualCursor === 'flower' ? '🌺' :
                     activeRitualCursor === 'bell' ? '🔔' : '🪔'}
                  </div>
                )}

                {activeRitualCursor === 'incense' && <SmokeEffect cursorPos={cursorPos} activeRitualCursor={activeRitualCursor} />}

                {/* Insufficient Coins Message */}
          {noCoinsMessage && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #FF6B6B, #EE4444)',
                color: '#fff',
                padding: '24px 36px',
                borderRadius: '16px',
                fontSize: '20px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)',
                border: '3px solid #FF4444',
                zIndex: 10002,
                animation: 'messageGlow 6s ease-in-out'
              }}
            >
              {noCoinsMessage}
            </div>
          )}

          {/* Feed Success Message */}
          {feedMessage && (
            <div
                className="feed-message"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#2D1810',
                padding: '20px 30px',
                borderRadius: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
                border: '3px solid #FF8C00',
                zIndex: 10001,
                animation: 'messageGlow 6s ease-in-out'
              }}
            >
              {feedMessage}
            </div>
          )}

          {/* Coin Balance Display */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              zIndex: 20,
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: '2px solid rgba(255, 255, 255, 0.78)',
              borderRadius: '999px',
              padding: '8px 18px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#2D1810',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>🪙</span>
            <span>{coins}</span>
          </div>

/* Ritual items - right corner vertical */
            <div
              className="ritual-items"
              onMouseEnter={() => setCursorHandSrc('/hand2.png')}
              onMouseLeave={() => setCursorHandSrc('/hand.png')}
            >
              <button
                className="ritual-circle"
                title="Camphor"
                onClick={() => { if (!handVisible && !heldItem) setActiveRitualCursor('camphor'); }}
              >
                🪔
              </button>
              <button
                className="ritual-circle"
                title="Flower"
                onClick={(e) => {
                  if (!handVisible && !heldItem) {
                    e.stopPropagation();
                    triggerFlowerSprinkle();
                    setActiveRitualCursor('flower');
                  }
                }}
              >
                🌸
              </button>
              <button
                className="ritual-circle"
                title="Incense"
                onClick={() => { if (!handVisible && !heldItem) setActiveRitualCursor('incense'); }}
              >
                🕯️
              </button>
              <button
                className="ritual-circle"
                title="Bell"
                onClick={() => { if (!handVisible && !heldItem) setActiveRitualCursor('bell'); }}
              >
                🛎️
              </button>
            </div>

{/* Horizontal arrangement of feed items */}
             <div ref={verticalItemsRef} className="vertical-items"
                  onMouseEnter={() => setCursorHandSrc('/hand.png')}
                  onMouseLeave={() => setCursorHandSrc('/hand.png')}
             >
            {sidebarItems.map((item) => (
               <div
                 key={item.key}
                 className={`feed-item-row ${hoveredItem === item.key && !heldItem ? 'is-hovered' : ''}`}
                 data-feed-key={item.key}
                 onClick={() => fetchItem(item.key)}
               >
                 <div className="item-image-shell">
                   <img
                     src={item.src}
                     alt={item.alt}
                     className="vertical-item"
                   />
                 </div>
                 <span className="item-count" aria-label={`${item.alt} count`}>
                   {itemCounts[item.key]}
                 </span>
                 <span className="item-coin-badge" aria-label={`${item.coins} coins`}>
                   {item.coins} coins
                 </span>
               </div>
            ))}
           </div>



        {/* Cow Bell Sound Effect */}
        <audio
          ref={bellAudioRef}
          src="/cowbell.mp3"
          preload="auto"
          style={{ display: 'none' }}
        />
      </div>
    );
  }

export default Landscape;