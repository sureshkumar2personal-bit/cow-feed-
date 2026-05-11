import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function HandModelWrapper({ bodiesRef, scale = 0.5, rotation = [0, 0, 0] }) {
  const groupRef = useRef();
  const disposedRef = useRef(false);
  const firstActionRef = useRef(null);
  const animationConfiguredRef = useRef(false);
  
  const { scene, animations } = useGLTF('/hand.glb');
  const { actions } = useAnimations(animations, groupRef);

  // Store first action for animation setup
  useEffect(() => {
    const keys = Object.keys(actions);
    if (keys.length > 0) firstActionRef.current = actions[keys[0]];
  }, [actions]);

  // Clone scene with optimized settings
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        if (child.material) child.material = child.material.clone();
      }
    });
    return clone;
  }, [scene]);

  // Main render loop - handles animation setup and position sync
  useFrame((state) => {
    // Configure animation once
    if (!disposedRef.current && firstActionRef.current && !animationConfiguredRef.current) {
      const action = firstActionRef.current;
      action.setLoop(THREE.LoopRepeat, Infinity);
      animationConfiguredRef.current = true;
      action.play();
    }
    
    // Sync physics body position
    if (!groupRef.current || !bodiesRef?.current?.hand) return;
    const body = bodiesRef.current.hand;
    const cameraZ = state.camera.position.z;
    const aspect = state.viewport.width / state.viewport.height;
    const fovRad = (state.camera.fov / 2) * (Math.PI / 180);
    const worldHeight = 2 * Math.tan(fovRad) * cameraZ;
    const worldWidth = worldHeight * aspect;

    groupRef.current.position.set(
      (body.position.x / 800) * worldWidth - worldWidth / 2,
      -(body.position.y / 600) * worldHeight + worldHeight / 2,
      0
    );
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposedRef.current = true;
      Object.values(actions).forEach(action => action?.stop());
      clonedScene?.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          const disposeMaterial = (m) => m.dispose();
          if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
          else child.material?.dispose();
        }
      });
    };
  }, [actions, clonedScene]);

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={rotation}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}

// Preload model for better UX
useGLTF.preload('/hand.glb');