import { useState, useEffect, useRef, Suspense } from 'react';
import './Landscape.css';
import * as Matter from 'matter-js';
import { Canvas } from '@react-three/fiber';
import { HandModelWrapper } from './HandComponents';

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

function Landscape() {
  const [handVisible, setHandVisible] = useState(false);
  const [hasReached, setHasReached] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [grassPos, setGrassPos] = useState({ x: 80, y: 60 });
  const [webglAvailable] = useState(() => {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });
  
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const bodiesRef = useRef({});
  const animationFrameRef = useRef(null);

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
        setGrassPos({ x: (handPos.x / 800) * 100, y: (handPos.y / 600) * 100 });

        if (Math.abs(handPos.x - cowPos.x) < 100 && isWalking) {
          setHasReached(true);
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
    const handleKeyDown = (e) => {
      if ((e.key === 'h' || e.key === 'H') && !handVisible) {
        setHandVisible(true);
        setIsWalking(true);
        setHasReached(false);
        if (bodiesRef.current.hand) {
          Matter.Body.setPosition(bodiesRef.current.hand, { x: 80, y: 500 });
          Matter.Body.setVelocity(bodiesRef.current.hand, { x: 0, y: 0 });
          Matter.Body.applyForce(bodiesRef.current.hand, bodiesRef.current.hand.position, { x: 0.008, y: -0.005 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handVisible]);

  return (
    <div className="landscape" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div className="sky-background"></div>
      <div className="temple-background"></div>
      <div className="soil-background"></div>
      <div className="greenland-background"></div>

      <div className="satham-emoji" style={{ position: 'absolute', top: '68%', left: '37%', transform: 'translateX(-50%)', zIndex: 1 }}>
        <img src="/satham.png" alt="Satham" className="satham-image" />
      </div>

      <div className="group-emoji" style={{ position: 'absolute', bottom: '15%', left: '80%', transform: 'translateX(-50%)', zIndex: 2 }}>
        <img src="/group.png" alt="Group" className="group-image" />
      </div>

      {handVisible && !hasReached && (
        <div className="grass-bundle" style={{ opacity: 1, position: 'absolute', left: `${grassPos.x}%`, top: `${grassPos.y}%`, transform: 'translate(-50%, -50%)', zIndex: 5 }}>
          <img src="/grass.png" alt="Grass" className="hand-grass" style={{ width: '50px', height: 'auto' }} />
        </div>
      )}

      {handVisible && hasReached && (
        <div className="grass-bundle delivered" style={{ opacity: 1, position: 'absolute', left: '8%', bottom: '15%', transform: 'translateX(-50%)', zIndex: 5 }}>
          <img src="/grass.png" alt="Grass" className="hand-grass" style={{ width: '50px', height: 'auto' }} />
        </div>
      )}

      <div className="cow-emoji" style={{ left: '10%', bottom: '5%', position: 'absolute', transform: 'translateX(-50%)', zIndex: 3 }}>
        <video src="/cowm.webm" className="cow-video" autoPlay loop muted playsInline />
      </div>

      <div className="group2-emoji" style={{ position: 'absolute', left: '30%', bottom: '18%', transform: 'translateX(-50%)', zIndex: 3 }}>
        <img src="/group2.png" alt="Group2" className="group2-image" />
      </div>

      {/* Tree image */}
      <div className="tree-emoji">
        <img src="/neem.png" alt="Neem Tree" className="tree-image" />
      </div>

      {/* Single WebGL Canvas - main hand follows physics */}
      {webglAvailable && (
        <Suspense fallback={null}>
          <Canvas
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            {handVisible && <HandModelWrapper bodiesRef={bodiesRef} scale={0.15} />}
          </Canvas>
        </Suspense>
      )}

      {/* Static hand on right corner - as image fallback */}
      <div
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
      </div>

      {/* Fallback when WebGL not available */}
      {!webglAvailable && (
        <div className="hand-fallback" style={{ position: 'absolute', left: '50%', bottom: '10%', transform: 'translateX(-50%)', zIndex: 4, fontSize: '80px' }}>
          🤚
        </div>
      )}

      {!handVisible && (
        <div className="hint-text">Press <kbd>H</kbd> to send hand with grass to cow</div>
      )}
    </div>
  );
}

export default Landscape;