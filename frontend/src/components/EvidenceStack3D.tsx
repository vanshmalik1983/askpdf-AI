import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * The signature element of the landing page: a scattered stack of
 * "papers" on a desk. The top page tilts toward the cursor, and one
 * line of text sits under a highlighter mark with a small citation
 * flag attached — this is a literal, physical dramatization of the
 * product's actual mechanism (an answer that points back at a
 * specific highlighted line, on a specific page) rather than a
 * decorative abstract shape.
 */

function TextLines({ count, width, opacity = 1 }: { count: number; width: number; opacity?: number }) {
  const lines = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        w: width * (0.55 + Math.sin(i * 12.9) * 0.5 * 0.35 + 0.35),
        y: 0.62 - i * 0.16,
      })),
    [count, width]
  );
  return (
    <>
      {lines.map((l, i) => (
        <mesh key={i} position={[-width / 2 + l.w / 2, l.y, 0.041]}>
          <planeGeometry args={[l.w, 0.045]} />
          <meshBasicMaterial color="#C9C7BC" transparent opacity={opacity} />
        </mesh>
      ))}
    </>
  );
}

function TopPage() {
  return (
    <group position={[0, 0, 0.24]}>
      <RoundedBox args={[3.1, 4, 0.04]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} metalness={0} />
      </RoundedBox>

      <TextLines count={5} width={2.5} />

      {/* Highlighter mark under the cited line */}
      <mesh position={[-0.28, 0.14, 0.041]}>
        <planeGeometry args={[1.7, 0.16]} />
        <meshBasicMaterial color="#FFD447" />
      </mesh>
      <mesh position={[-0.28, 0.14, 0.042]}>
        <planeGeometry args={[1.62, 0.05]} />
        <meshBasicMaterial color="#3A3A20" transparent opacity={0.35} />
      </mesh>

      {/* Citation flag */}
      <Html position={[1.62, 0.14, 0.1]} center transform={false} distanceFactor={8} zIndexRange={[10, 0]}>
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-cobalt px-3 py-1.5 text-[11px] font-semibold text-white shadow-flag">
          Page 4 · 92% match
        </div>
      </Html>
    </group>
  );
}

function BackPage({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[3.1, 4, 0.035]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={color} roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

function Scene({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduceMotion) {
      target.current.x = state.pointer.x;
      target.current.y = state.pointer.y;
    }
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target.current.x * 0.28, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -target.current.y * 0.16, 4, delta);
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />
      <directionalLight position={[-3, -2, 2]} intensity={0.25} />

      <Float speed={reduceMotion ? 0 : 1.1} rotationIntensity={reduceMotion ? 0 : 0.15} floatIntensity={reduceMotion ? 0 : 0.5}>
        <group ref={group} rotation={[0.08, -0.12, 0.02]} scale={0.92}>
          <BackPage position={[0.32, -0.22, -0.16]} rotation={[0, 0, 0.16]} color="#E7E4D9" />
          <BackPage position={[-0.28, -0.14, -0.09]} rotation={[0, 0, -0.09]} color="#EFEEE8" />
          <BackPage position={[0.14, -0.06, -0.03]} rotation={[0, 0, 0.045]} color="#F6F5F0" />
          <TopPage />
        </group>
      </Float>
    </>
  );
}

export function EvidenceStack3D() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return (
    <div className="relative h-[380px] w-full sm:h-[440px] md:h-[520px]" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.2], fov: 32 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }}>
        <Scene reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
