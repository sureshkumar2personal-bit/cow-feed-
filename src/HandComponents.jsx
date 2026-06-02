import { useRef, useEffect } from 'react';

export function HandModelWrapper({ bodiesRef, scale = 0.15 }) {
  const handRef = useRef(null);
  
  // Sync physics body position
  useEffect(() => {
    if (!handRef.current || !bodiesRef?.current?.hand) return;
    
    const body = bodiesRef.current.hand;
    // Convert physics coordinates to screen coordinates (800x600 is the physics world size)
    const x = (body.position.x / 800) * 100; // Convert to percentage
    const y = (body.position.y / 600) * 100; // Convert to percentage
    
    handRef.current.style.left = `${x}%`;
    handRef.current.style.top = `${y}%`;
    handRef.current.style.transform = 'translate(-50%, -50%)';
  }, [bodiesRef]);

  return (
    <img
      ref={handRef}
      src="/hand.png"
      alt="Hand"
      style={{
        position: 'absolute',
        width: `${30 * scale}px`, // Base width of 30px scaled by the scale prop
        height: 'auto', // Maintain aspect ratio
        maxWidth: '60px', // Maximum width to prevent oversizing
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    />
  );
}