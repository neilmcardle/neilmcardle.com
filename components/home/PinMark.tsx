"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import type {
  Material,
  MeshPhysicalMaterial,
  Texture,
  WebGLRenderer,
} from "three";
import ProductBadge, {
  MARK_SHAPES,
  N_MARK_SHAPE,
  type BadgeKey,
} from "./ProductBadge";
import { currentTheme, subscribeTheme, type SiteTheme } from "./theme";
import styles from "./home.module.css";

type PinFace = BadgeKey | "portrait" | "mark";

const TILE = 2;
const UNIT = TILE / 62;
const REST_Y = (-149 * Math.PI) / 180;
const TAU = Math.PI * 2;
const COAST = 0.85;
const SETTLE = 0.5;

const PORTRAIT = {
  dark: { plate: 0x0b1213, rim: 0x0b1313, mark: 0xa7b3b1, exposure: 0.63 },
  light: { plate: 0xf6f4ef, rim: 0xe6e3dc, mark: 0x14120e, exposure: 1 },
};

type PortraitParts = {
  renderer: WebGLRenderer;
  plate: MeshPhysicalMaterial;
  rim: MeshPhysicalMaterial;
  mark: MeshPhysicalMaterial;
};

function paintPortrait(parts: PortraitParts, theme: SiteTheme) {
  const tone = PORTRAIT[theme];
  parts.plate.color.setHex(tone.plate);
  parts.rim.color.setHex(tone.rim);
  parts.mark.color.setHex(tone.mark);
  parts.renderer.toneMappingExposure = tone.exposure;
}

const svgDoc = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 63">${inner}</svg>`;

export default function PinMark({
  face,
  size = 48,
  zoom = 5.6,
  tone,
  spin = 0,
}: {
  face: PinFace;
  size?: number;
  zoom?: number;
  tone?: SiteTheme;
  spin?: number;
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const partsRef = useRef<PortraitParts | null>(null);
  const siteTheme = useSyncExternalStore(
    subscribeTheme,
    currentTheme,
    () => "dark" as const,
  );
  const theme = tone ?? siteTheme;
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    if (partsRef.current) paintPortrait(partsRef.current, theme);
  }, [theme]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const portrait = face === "portrait";
    const markOnly = face === "mark";
    let cancelled = false;
    let dispose = () => {};

    const build = async () => {
      const THREE = await import("three");
      const { RoomEnvironment } =
        await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { SVGLoader } =
        await import("three/examples/jsm/loaders/SVGLoader.js");
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(size, size, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = portrait ? 0.63 : markOnly ? 1 : 1.15;
      const canvas = renderer.domElement;
      canvas.style.touchAction = "none";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = environment;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0, zoom);

      const key = new THREE.DirectionalLight(0xfff0d4, 1.6);
      key.position.set(2.5, 3.5, 4);
      const fill = new THREE.DirectionalLight(0x8fc6ff, 0.55);
      fill.position.set(-3.5, -1.5, -2.5);
      scene.add(key, fill);

      const loader = new THREE.TextureLoader();
      const anisotropy = renderer.capabilities.getMaxAnisotropy();
      const textures: Texture[] = [];
      const materials: Material[] = [];

      const markMaterial = new THREE.MeshPhysicalMaterial(
        markOnly
          ? {
              color: 0xf6f3ec,
              metalness: 0,
              roughness: 0.3,
              clearcoat: 1,
              clearcoatRoughness: 0.1,
              envMapIntensity: 0.6,
            }
          : portrait
            ? {
                color: 0xa7b3b1,
                metalness: 0,
                roughness: 0,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
                envMapIntensity: 0,
              }
            : {
                color: 0xfbf9f3,
                metalness: 0,
                roughness: 0.3,
                clearcoat: 1,
                clearcoatRoughness: 0.1,
                envMapIntensity: 0.9,
              },
      );
      materials.push(markMaterial);

      let plateMaterial: MeshPhysicalMaterial;
      let rimMaterial: MeshPhysicalMaterial;
      let overlayMaterial: MeshPhysicalMaterial | null = null;

      if (markOnly) {
        plateMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x16150f,
          metalness: 0,
          roughness: 0.4,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          envMapIntensity: 0.5,
        });
        rimMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x1f1e19,
          metalness: 0.4,
          roughness: 0.35,
          envMapIntensity: 0.6,
        });
        materials.push(plateMaterial, rimMaterial);
      } else if (portrait) {
        const portraitTexture = await loader.loadAsync("/hero/portrait.png");
        portraitTexture.colorSpace = THREE.SRGBColorSpace;
        portraitTexture.repeat.set(-0.5, 0.5);
        portraitTexture.offset.set(0.5, 0.5);
        portraitTexture.anisotropy = anisotropy;
        textures.push(portraitTexture);
        overlayMaterial = new THREE.MeshPhysicalMaterial({
          map: portraitTexture,
          transparent: true,
          depthWrite: false,
          metalness: 0,
          roughness: 0.28,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          envMapIntensity: 0.8,
        });
        plateMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0b1213,
          metalness: 0,
          roughness: 1,
          clearcoat: 1,
          clearcoatRoughness: 0.06,
          envMapIntensity: 0,
        });
        rimMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0b1313,
          metalness: 0.23,
          roughness: 0.4,
          envMapIntensity: 0,
        });
        materials.push(overlayMaterial, plateMaterial, rimMaterial);
      } else {
        const dots = await loader.loadAsync("/hero/dot-matrix.svg");
        textures.push(dots);
        const plateCanvas = document.createElement("canvas");
        plateCanvas.width = 64;
        plateCanvas.height = 64;
        const plateCtx = plateCanvas.getContext("2d");
        if (plateCtx) {
          plateCtx.fillStyle = "#14120e";
          plateCtx.fillRect(0, 0, 64, 64);
          for (let pass = 0; pass < 2; pass += 1)
            plateCtx.drawImage(dots.image, 0, 0, 64, 64);
        }
        const plateTexture = new THREE.CanvasTexture(plateCanvas);
        plateTexture.colorSpace = THREE.SRGBColorSpace;
        plateTexture.wrapS = THREE.RepeatWrapping;
        plateTexture.wrapT = THREE.RepeatWrapping;
        plateTexture.repeat.set(4, 4);
        plateTexture.anisotropy = anisotropy;
        textures.push(plateTexture);
        plateMaterial = new THREE.MeshPhysicalMaterial({
          map: plateTexture,
          emissiveMap: plateTexture,
          emissive: 0xffffff,
          emissiveIntensity: 0.16,
          metalness: 0,
          roughness: 0.32,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.7,
        });
        rimMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x585652,
          metalness: 1,
          roughness: 0.3,
          envMapIntensity: 1,
        });
        materials.push(plateMaterial, rimMaterial);
      }

      const radius = TILE * (10.5 / 62);
      const half = TILE / 2;
      const plate = new THREE.Shape();
      plate.moveTo(-half + radius, -half);
      plate.lineTo(half - radius, -half);
      plate.absarc(
        half - radius,
        -half + radius,
        radius,
        -Math.PI / 2,
        0,
        false,
      );
      plate.lineTo(half, half - radius);
      plate.absarc(half - radius, half - radius, radius, 0, Math.PI / 2, false);
      plate.lineTo(-half + radius, half);
      plate.absarc(
        -half + radius,
        half - radius,
        radius,
        Math.PI / 2,
        Math.PI,
        false,
      );
      plate.lineTo(-half, -half + radius);
      plate.absarc(
        -half + radius,
        -half + radius,
        radius,
        Math.PI,
        Math.PI * 1.5,
        false,
      );

      const tileGeometry = new THREE.ExtrudeGeometry(plate, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 6,
        curveSegments: 24,
      });
      tileGeometry.center();
      tileGeometry.computeBoundingBox();
      const faceZ = tileGeometry.boundingBox?.max.z ?? 0.16;

      const nMark = portrait || markOnly;
      const depth = nMark ? 2.4 : 2.2;
      const bevel = nMark ? 0.6 : 0.3;
      const shapes = new SVGLoader()
        .parse(
          svgDoc(
            face === "portrait" || face === "mark"
              ? N_MARK_SHAPE
              : MARK_SHAPES[face],
          ),
        )
        .paths.flatMap((path) => path.toShapes());
      const glyphGeometry = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel * 0.85,
        bevelSegments: 3,
        curveSegments: 10,
      });
      glyphGeometry.scale(UNIT, UNIT, UNIT);
      glyphGeometry.translate(-31.5 * UNIT, -31.5 * UNIT, 0);
      const lift = faceZ + depth * UNIT - 0.02;

      const pin = new THREE.Group();
      pin.add(new THREE.Mesh(tileGeometry, [plateMaterial, rimMaterial]));

      const faceGeometry = overlayMaterial
        ? new THREE.ShapeGeometry(plate, 32)
        : null;
      if (faceGeometry && overlayMaterial) {
        const overlay = new THREE.Mesh(faceGeometry, overlayMaterial);
        overlay.position.z = faceZ + 0.002;
        pin.add(overlay);
      }

      if (!portrait) {
        const front = new THREE.Mesh(glyphGeometry, markMaterial);
        front.rotation.x = Math.PI;
        front.position.z = lift;
        pin.add(front);
      }
      const back = new THREE.Mesh(glyphGeometry, markMaterial);
      back.rotation.z = Math.PI;
      back.position.z = -lift;
      pin.add(back);

      if (portrait) {
        partsRef.current = {
          renderer,
          plate: plateMaterial,
          rim: rimMaterial,
          mark: markMaterial,
        };
        paintPortrait(partsRef.current, themeRef.current);
      }

      pin.rotation.set(nMark ? (-2 * Math.PI) / 180 : -0.1, REST_Y, 0);
      scene.add(pin);

      const idle = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : spin;
      let velocity = 0;
      let turn = pin.rotation.y;
      let tilt = pin.rotation.x;
      const restTurn = pin.rotation.y;
      const restTilt = pin.rotation.x;
      let dragging = false;
      let lastX = 0;
      let lastY = 0;

      const onDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
      };
      const onMove = (event: PointerEvent) => {
        if (!dragging) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        turn += dx * 0.03;
        tilt = Math.max(-0.6, Math.min(0.6, tilt + dy * 0.016));
        velocity = dx * 1.5;
      };
      const onUp = () => {
        dragging = false;
      };

      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      const clock = new THREE.Clock();
      let frame = 0;
      const draw = () => {
        frame = requestAnimationFrame(draw);
        const delta = Math.min(clock.getDelta(), 0.1);
        if (!dragging) {
          if (Math.abs(velocity) > Math.max(SETTLE, idle)) {
            velocity *= Math.exp(-delta * COAST);
            turn += velocity * delta;
          } else if (idle) {
            velocity = 0;
            turn += idle * delta;
            tilt += (restTilt - tilt) * Math.min(1, delta * 3);
          } else {
            velocity = 0;
            const rest = Math.round((turn - restTurn) / TAU) * TAU + restTurn;
            turn += (rest - turn) * Math.min(1, delta * 4);
            tilt += (restTilt - tilt) * Math.min(1, delta * 3);
          }
        }
        pin.rotation.y = turn;
        pin.rotation.x += (tilt - pin.rotation.x) * Math.min(1, delta * 6);
        renderer.render(scene, camera);
        if (!canvas.dataset.ready) {
          canvas.dataset.ready = "1";
          host.dataset.ready = "1";
        }
      };
      draw();

      dispose = () => {
        cancelAnimationFrame(frame);
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        tileGeometry.dispose();
        glyphGeometry.dispose();
        faceGeometry?.dispose();
        for (const material of materials) material.dispose();
        for (const texture of textures) texture.dispose();
        environment.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
        partsRef.current = null;
        delete host.dataset.ready;
      };
    };

    build().catch(() => {
      if (!cancelled) host.dataset.fallback = "1";
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [face, size, zoom, spin]);

  return (
    <span
      className={styles.pinMark}
      ref={hostRef}
      style={{ width: size, height: size }}
    >
      {face === "mark" ? (
        <svg viewBox="0 0 63 63" aria-hidden="true">
          <rect
            x="0.5"
            y="0.5"
            width="62"
            height="62"
            rx="10.5"
            fill="#16150f"
          />
          <path d="M45 45L32 31.2985V18H45V45Z" fill="#f6f3ec" />
          <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" fill="#f6f3ec" />
        </svg>
      ) : face === "portrait" ? (
        <Image
          src="/hero/portrait.png"
          alt="Neil McArdle"
          width={480}
          height={480}
          sizes="124px"
          priority
        />
      ) : (
        <ProductBadge badge={face} size={size} />
      )}
    </span>
  );
}
