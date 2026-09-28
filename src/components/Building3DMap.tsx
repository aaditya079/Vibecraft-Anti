import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { type DayOfWeek } from '../data/rooms';
import { getAllFloorsStatus, type RoomRealTimeStatus } from '../utils/roomFinder';
import { 
  RotateCcw, 
  Layers, 
  Compass
} from 'lucide-react';

interface Props {
  selectedDay: DayOfWeek;
  selectedPeriod: number;
  onSelectRoom: (status: RoomRealTimeStatus) => void;
}

interface RoomPlacement {
  id: string;
  floorIndex: number; // 0=GF, 1=1F, 2=2F, 3=4F, 4=5F, 5=6F, 6=7F
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

// Spatial layout coordinates for campus rooms across floors
const ROOM_PLACEMENTS: RoomPlacement[] = [
  // Ground Floor (floorIndex: 0)
  { id: 'tb-106', floorIndex: 0, x: -5, z: 3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-108', floorIndex: 0, x: 5, z: 3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-020', floorIndex: 0, x: -5, z: -3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-021', floorIndex: 0, x: 5, z: -3, w: 7.5, d: 4.8, h: 2.2 },

  // 1st Floor (floorIndex: 1)
  { id: 'ist-101', floorIndex: 1, x: -4.5, z: 0, w: 8.5, d: 9, h: 2.2 },
  { id: 'ist-105', floorIndex: 1, x: 5, z: 0, w: 7.5, d: 9, h: 2.2 },

  // 2nd Floor (floorIndex: 2)
  { id: 'ist-201', floorIndex: 2, x: -5, z: -3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-211', floorIndex: 2, x: 5, z: -3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-225', floorIndex: 2, x: -5, z: 3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-227', floorIndex: 2, x: 5, z: 3, w: 7.5, d: 4.8, h: 2.2 },

  // 3rd Floor (floorIndex: 3)
  { id: 'ist-301', floorIndex: 3, x: -5, z: 2.5, w: 7.5, d: 5.5, h: 2.2 },
  { id: 'ist-305', floorIndex: 3, x: 5, z: 2.5, w: 7.5, d: 5.5, h: 2.2 },
  { id: 'ist-312', floorIndex: 3, x: -5, z: -3, w: 7.5, d: 4.8, h: 2.2 },
  { id: 'ist-318', floorIndex: 3, x: 5, z: -3, w: 7.5, d: 4.8, h: 2.2 },

  // 4th Floor (floorIndex: 4)
  { id: 'ist-411', floorIndex: 4, x: -5, z: 2.5, w: 7.5, d: 5.5, h: 2.2 },
  { id: 'ist-416', floorIndex: 4, x: 5, z: 2.5, w: 7.5, d: 5.5, h: 2.2 },
  { id: 'ist-418', floorIndex: 4, x: 0, z: -3.5, w: 14, d: 4.2, h: 2.2 },

  // 5th Floor (floorIndex: 5)
  { id: 'ist-502', floorIndex: 5, x: -6.2, z: 3, w: 5.2, d: 4.5, h: 2.2 },
  { id: 'ist-510', floorIndex: 5, x: 0, z: 3, w: 5.5, d: 4.5, h: 2.2 },
  { id: 'ist-518', floorIndex: 5, x: 6.2, z: 3, w: 5.2, d: 4.5, h: 2.2 },
  { id: 'ist-519', floorIndex: 5, x: -4.5, z: -3, w: 7.5, d: 4.5, h: 2.2 },
  { id: 'ist-520', floorIndex: 5, x: 4.5, z: -3, w: 7.5, d: 4.5, h: 2.2 },

  // 6th Floor (floorIndex: 6)
  { id: 'ist-602', floorIndex: 6, x: -6.2, z: 3, w: 5.2, d: 4.5, h: 2.2 },
  { id: 'ist-609', floorIndex: 6, x: 0, z: 3, w: 5.5, d: 4.5, h: 2.2 },
  { id: 'ist-617', floorIndex: 6, x: 6.2, z: 3, w: 5.2, d: 4.5, h: 2.2 },
  { id: 'ist-618', floorIndex: 6, x: -6.2, z: -3, w: 5.2, d: 4.5, h: 2.2 },
  { id: 'ist-625', floorIndex: 6, x: 0, z: -3, w: 5.5, d: 4.5, h: 2.2 },
  { id: 'ist-626', floorIndex: 6, x: 6.2, z: -3, w: 5.2, d: 4.5, h: 2.2 },

  // 7th Floor (floorIndex: 7)
  { id: 'ist-702', floorIndex: 7, x: -4.5, z: 0, w: 8.5, d: 9, h: 2.2 },
  { id: 'ist-710', floorIndex: 7, x: 5, z: 0, w: 7.5, d: 9, h: 2.2 },
];

const FLOOR_LABELS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  '6th Floor',
  '7th Floor'
];

export default function Building3DMap({ selectedDay, selectedPeriod, onSelectRoom }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Controls state
  const [explosionGap, setExplosionGap] = useState<number>(1.2);
  const [focusedFloor, setFocusedFloor] = useState<number | 'all'>('all');
  const [hoveredRoom, setHoveredRoom] = useState<RoomRealTimeStatus | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map of roomId -> status
  const roomStatusMap = useRef<Map<string, RoomRealTimeStatus>>(new Map());
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Compute live room statuses
  useEffect(() => {
    const floors = getAllFloorsStatus(selectedDay, selectedPeriod);
    const map = new Map<string, RoomRealTimeStatus>();
    floors.forEach(f => {
      f.rooms.forEach(r => map.set(r.room.id, r));
    });
    roomStatusMap.current = map;
  }, [selectedDay, selectedPeriod]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background for seamless dark/light mode

    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(30, 32, 40);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.minDistance = 15;
    controls.maxDistance = 85;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 14, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(30, 50, 40);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.4);
    dirLight2.position.set(-30, 20, -30);
    scene.add(dirLight2);

    // Group for building meshes
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    meshGroupRef.current = buildingGroup;

    // Raycaster for Room Clicks & Hovers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Track meshes for interaction
    const interactiveMeshes: THREE.Mesh[] = [];

    // Helper to build floor slabs and rooms
    const baseFloorHeight = 4.2;

    const rebuildModel = () => {
      // Clear previous meshes
      while (buildingGroup.children.length > 0) {
        const obj = buildingGroup.children[0];
        buildingGroup.remove(obj);
      }
      interactiveMeshes.length = 0;

      // Render All Building Floors
      for (let fIdx = 0; fIdx < FLOOR_LABELS.length; fIdx++) {
        // Vertical position of this floor
        const floorY = fIdx * (baseFloorHeight * explosionGap);

        // Check if floor is focused or dimmed
        const isDimmed = focusedFloor !== 'all' && focusedFloor !== fIdx;

        // Floor Slab Mesh
        const slabGeo = new THREE.BoxGeometry(22, 0.35, 15);
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: isDimmed ? 0.08 : 0.35
        });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.set(0, floorY, 0);
        slab.receiveShadow = true;
        buildingGroup.add(slab);

        // Floor Perimeter Wireframe
        const slabEdges = new THREE.EdgesGeometry(slabGeo);
        const slabLineMat = new THREE.LineBasicMaterial({ 
          color: 0x94a3b8, 
          transparent: true, 
          opacity: isDimmed ? 0.05 : 0.4 
        });
        const slabWireframe = new THREE.LineSegments(slabEdges, slabLineMat);
        slabWireframe.position.copy(slab.position);
        buildingGroup.add(slabWireframe);

        // Rooms on this floor
        const floorPlacements = ROOM_PLACEMENTS.filter(p => p.floorIndex === fIdx);
        floorPlacements.forEach(placement => {
          const status = roomStatusMap.current.get(placement.id);
          const isFree = status?.isFree ?? true;

          // Color based on availability:
          // Free = Vibrant Emerald Green (#10b981)
          // Occupied = Vibrant Coral Crimson (#f43f5e)
          const roomColor = isFree ? 0x10b981 : 0xf43f5e;
          const emissiveColor = isFree ? 0x059669 : 0xbe123c;

          const roomGeo = new THREE.BoxGeometry(placement.w, placement.h, placement.d);
          const roomMat = new THREE.MeshStandardMaterial({
            color: roomColor,
            emissive: emissiveColor,
            emissiveIntensity: isDimmed ? 0.05 : 0.3,
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: isDimmed ? 0.15 : 0.88
          });

          const roomMesh = new THREE.Mesh(roomGeo, roomMat);
          roomMesh.position.set(
            placement.x, 
            floorY + placement.h / 2 + 0.18, 
            placement.z
          );
          roomMesh.castShadow = true;
          roomMesh.receiveShadow = true;

          // Store room ID in mesh userData
          roomMesh.userData = { roomId: placement.id, floorIndex: fIdx };
          buildingGroup.add(roomMesh);
          interactiveMeshes.push(roomMesh);

          // Room Edges outline for architectural model aesthetic
          const roomEdges = new THREE.EdgesGeometry(roomGeo);
          const edgeLineMat = new THREE.LineBasicMaterial({
            color: isFree ? 0x34d399 : 0xfb7185,
            transparent: true,
            opacity: isDimmed ? 0.1 : 0.8
          });
          const edgeWireframe = new THREE.LineSegments(roomEdges, edgeLineMat);
          edgeWireframe.position.copy(roomMesh.position);
          buildingGroup.add(edgeWireframe);
        });
      }
    };

    rebuildModel();

    // Mouse Move listener for Hover Tooltips & Raycasting
    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const roomId = hitMesh.userData.roomId;
        const status = roomStatusMap.current.get(roomId);
        if (status) {
          setHoveredRoom(status);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredRoom(null);
        container.style.cursor = 'grab';
      }
    };

    // Click listener to select room
    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const roomId = hitMesh.userData.roomId;
        const status = roomStatusMap.current.get(roomId);
        if (status) {
          onSelectRoom(status);
        }
      }
    };

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      controls.dispose();
    };
  }, [selectedDay, selectedPeriod, explosionGap, focusedFloor]);

  // Focus Camera smoothly onto a Floor
  const handleFloorFocus = (fIdx: number | 'all') => {
    setFocusedFloor(fIdx);
    if (!controlsRef.current || !cameraRef.current) return;

    if (fIdx === 'all') {
      controlsRef.current.target.set(0, 14, 0);
      cameraRef.current.position.set(30, 32, 40);
    } else {
      const targetY = fIdx * (4.2 * explosionGap) + 1.5;
      controlsRef.current.target.set(0, targetY, 0);
      cameraRef.current.position.set(16, targetY + 8, 22);
    }
  };

  const handleResetCamera = () => {
    setFocusedFloor('all');
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.target.set(0, 14, 0);
      cameraRef.current.position.set(30, 32, 40);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-zinc-900/[0.04] to-zinc-900/[0.08] dark:from-zinc-950/40 dark:to-zinc-950/80 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-2xl shadow-xl">
      
      {/* 3D Model Header Controls Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                3D Campus Architectural Model
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                Interactive Three.js
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Click any room to view live countdown timer and dispatch WhatsApp squad invites
            </p>
          </div>
        </div>

        {/* Legend Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Free Now</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Class in Session</span>
          </div>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-zinc-600 dark:text-zinc-400 transition"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Mounting Container */}
      <div className="relative w-full h-[520px] sm:h-[600px] bg-radial from-slate-200/40 via-transparent to-transparent dark:from-slate-900/30">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Hover Floating Tooltip */}
        {hoveredRoom && (
          <div 
            className="absolute pointer-events-none z-20 px-3.5 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-black/[0.1] dark:border-white/[0.15] shadow-2xl backdrop-blur-md text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 transition-opacity animate-in fade-in zoom-in-95 duration-150"
            style={{ 
              left: `${Math.min(Math.max(mousePos.x, 120), (mountRef.current?.clientWidth || 600) - 120)}px`, 
              top: `${Math.max(mousePos.y - 10, 80)}px` 
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-zinc-900 dark:text-white text-sm">
                {hoveredRoom.room.code}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                hoveredRoom.isFree 
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
              }`}>
                {hoveredRoom.isFree ? 'Available' : 'In Session'}
              </span>
            </div>

            <div className="text-zinc-500 text-[11px] truncate max-w-[200px]">
              {hoveredRoom.room.name} · {hoveredRoom.room.floor}
            </div>

            <div className="pt-1 text-[11px] font-medium border-t border-black/[0.06] dark:border-white/[0.06]">
              {hoveredRoom.isFree ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Free for {(hoveredRoom.freeDurationMinutes / 60).toFixed(1)} hrs (until {hoveredRoom.freeUntilTime})
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">
                  Lecture ends at {hoveredRoom.currentOccupant?.untilTime}
                </span>
              )}
            </div>

            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium pt-0.5">
              Click to view countdown & squad invite
            </div>
          </div>
        )}

        {/* Floating Floor Stack Exploder & Focus Selector */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Floor Level Quick Focus Buttons */}
          <div className="p-1 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-lg flex flex-col gap-1">
            <button
              onClick={() => handleFloorFocus('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                focusedFloor === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Floors
            </button>
            {FLOOR_LABELS.map((lbl, idx) => (
              <button
                key={idx}
                onClick={() => handleFloorFocus(idx)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition text-left ${
                  focusedFloor === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {lbl.replace(' Floor', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Floating Bar: Explode Floors Slider */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-lg">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
              Explode Floors:
            </span>
            <input
              type="range"
              min={0.8}
              max={2.6}
              step={0.1}
              value={explosionGap}
              onChange={e => setExplosionGap(parseFloat(e.target.value))}
              className="w-32 sm:w-44 accent-blue-600 cursor-pointer"
            />
            <span className="text-xs font-mono text-zinc-500">
              {explosionGap.toFixed(1)}x
            </span>
          </div>

          <div className="text-[11px] text-zinc-500 font-medium hidden md:flex items-center gap-2">
            <span>Drag to rotate</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>Scroll to zoom</span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span>Right-click to pan</span>
          </div>
        </div>

      </div>

    </div>
  );
}
