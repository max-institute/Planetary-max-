import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ChessCanvas3DProps {
  selectedSquare: string | null;
  onSelectSquare: (coord: string) => void;
  cameraPreset: 'standard' | 'top' | 'asymmetric';
}

export const ChessCanvas3D: React.FC<ChessCanvas3DProps> = ({
  selectedSquare,
  onSelectSquare,
  cameraPreset,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050914');

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 9.5, 9.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x22d3ee, 1.3);
    dirLight.position.set(6, 12, 8);
    scene.add(dirLight);

    const boardGroup = new THREE.Group();
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const squareMeshes: THREE.Mesh[] = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const isDark = (rank + file) % 2 === 1;
        const geometry = new THREE.BoxGeometry(1, 0.18, 1);
        const material = new THREE.MeshStandardMaterial({
          color: isDark ? 0x0f172a : 0x334155,
          roughness: 0.35,
          metalness: 0.4,
        });

        const square = new THREE.Mesh(geometry, material);
        square.position.set(file - 3.5, 0, 3.5 - rank);
        square.userData = { coord: `${files[file]}${rank + 1}` };
        boardGroup.add(square);
        squareMeshes.push(square);
      }
    }

    const addPiece = (file: number, rank: number, isWhite: boolean, isRoyal: boolean) => {
      const height = isRoyal ? 0.95 : 0.65;
      const geo = isRoyal
        ? new THREE.CylinderGeometry(0.18, 0.32, height, 16)
        : new THREE.ConeGeometry(0.26, height, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: isWhite ? 0x38bdf8 : 0xf43f5e,
        emissive: isWhite ? 0x0284c7 : 0x9f1239,
        emissiveIntensity: 0.35,
        metalness: 0.6,
        roughness: 0.25,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(file - 3.5, height / 2 + 0.09, 3.5 - rank);
      boardGroup.add(mesh);
    };

    for (let f = 0; f < 8; f++) {
      addPiece(f, 0, true, true);
      addPiece(f, 1, true, false);
      addPiece(f, 6, false, false);
      addPiece(f, 7, false, true);
    }

    scene.add(boardGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(squareMeshes);
      if (hits.length > 0 && hits[0].object.userData.coord) {
        onSelectSquare(hits[0].object.userData.coord);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      boardGroup.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [onSelectSquare]);

  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraPreset === 'top') {
      cameraRef.current.position.set(0, 13, 0.01);
    } else if (cameraPreset === 'asymmetric') {
      cameraRef.current.position.set(8.5, 7.5, 8.5);
    } else {
      cameraRef.current.position.set(0, 9.5, 9.5);
    }
    cameraRef.current.lookAt(0, 0, 0);
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-cyan-500/30">
      <div ref={mountRef} className="w-full h-full cursor-pointer" />
      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-950/80 border border-cyan-500/30 rounded font-mono text-[11px] text-cyan-300">
        8×8 TOURNAMENT MATRIX (64 SQUARES) • ACTIVE:{' '}
        <span className="text-white font-bold">{selectedSquare ?? 'e4'}</span>
      </div>
    </div>
  );
};
