"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import styles from "./capture.module.css";

const FPS = 24;
const FRAMES = 124;
const HOLD = 59;

export default function Capture() {
  const router = useRouter();
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bones = useRef<THREE.SkeletonHelper | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [skeleton, setSkeleton] = useState(false);

  useEffect(() => {
    const mount = stage.current;
    const clip = video.current;
    if (!mount || !clip) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, mount.clientWidth < 600 ? 1.5 : 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a6, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun, sun.target);
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.ShadowMaterial({ opacity: 0.16 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const size = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const sizer = new ResizeObserver(size);
    sizer.observe(mount);

    let mixer: THREE.AnimationMixer | null = null;
    let length = 0;
    let gone = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load("/explorations/creature-capture/dragon-roar.glb", (gltf) => {
      if (gone) return;
      const model = gltf.scene;
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.frustumCulled = false;
        }
      });
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const centre = box.getCenter(new THREE.Vector3());
      const reach = Math.max(...box.getSize(new THREE.Vector3()).toArray());
      ground.position.y = box.min.y;
      sun.position.set(
        centre.x + reach * 2,
        centre.y + reach * 4,
        centre.z + reach * 2.5,
      );
      sun.target.position.copy(centre);
      Object.assign(sun.shadow.camera, {
        left: -reach * 2,
        right: reach * 2,
        top: reach * 2,
        bottom: -reach * 2,
      });
      sun.shadow.camera.updateProjectionMatrix();
      controls.target.copy(centre);
      camera.position.set(
        centre.x + reach * 1.5,
        centre.y + reach * 0.45,
        centre.z + reach * 1.8,
      );
      controls.minDistance = reach * 0.8;
      controls.maxDistance = reach * 5;

      const helper = new THREE.SkeletonHelper(model);
      helper.visible = false;
      (helper.material as THREE.LineBasicMaterial).depthTest = false;
      helper.renderOrder = 10;
      scene.add(helper);
      bones.current = helper;

      const take = gltf.animations[0];
      if (take) {
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(take).play();
        length = take.duration;
      }
      setReady(true);
    });

    const sync = () => setPlaying(!clip.paused);
    clip.addEventListener("play", sync);
    clip.addEventListener("pause", sync);
    const start = () => {
      if (still) clip.currentTime = (HOLD + 0.5) / FPS;
      else clip.play().catch(() => {});
    };
    if (clip.readyState >= 1) start();
    else clip.addEventListener("loadedmetadata", start, { once: true });

    let shown = -1;
    renderer.setAnimationLoop(() => {
      const t = clip.currentTime;
      if (mixer) mixer.setTime(Math.min(t, length));
      const now = Math.min(FRAMES - 1, Math.floor(t * FPS + 0.001));
      if (now !== shown) {
        shown = now;
        setFrame(now);
      }
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      gone = true;
      renderer.setAnimationLoop(null);
      sizer.disconnect();
      controls.dispose();
      clip.removeEventListener("play", sync);
      clip.removeEventListener("pause", sync);
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as
          THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(material)
          ? material
          : material
            ? [material]
            : []
        ).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const toggle = () => {
    const clip = video.current;
    if (!clip) return;
    if (clip.paused) clip.play().catch(() => {});
    else clip.pause();
  };

  const scrub = (value: number) => {
    const clip = video.current;
    if (!clip) return;
    clip.pause();
    clip.currentTime = (value + 0.5) / FPS;
    setFrame(value);
  };

  const showBones = () => {
    const helper = bones.current;
    if (!helper) return;
    helper.visible = !helper.visible;
    setSkeleton(helper.visible);
  };

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <Link
          href="/"
          className={styles.close}
          aria-label="Close"
          onClick={(event) => {
            if (
              document.referrer &&
              new URL(document.referrer).origin === window.location.origin
            ) {
              event.preventDefault();
              router.back();
            }
          }}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </Link>
        <p className={styles.eyebrow}>Exploration</p>
        <h1 className={styles.title}>Creature capture</h1>
        <p className={styles.lede}>
          A video model films the dragon from the front and the side in one
          clip. A joint reader finds every joint in both views, the two views
          pin each joint in 3D, and the rig follows. Nobody animated it by hand.
        </p>
      </header>

      <figure className={styles.clip}>
        <video
          ref={video}
          className={styles.video}
          src="/explorations/creature-capture/roar-clip.mp4"
          poster="/explorations/creature-capture/roar-clip.jpg"
          aria-label="The AI clip: the dragon roaring, seen from the front on the left and the side on the right"
          muted
          loop
          playsInline
          preload="auto"
        />
        <figcaption className={styles.label}>
          AI clip, two cameras in one frame
        </figcaption>
      </figure>

      <figure className={styles.fit}>
        <div
          ref={stage}
          className={styles.stage}
          role="img"
          aria-label="The rigged 3D dragon performing the same roar. Drag to turn it."
        />
        {ready ? null : <p className={styles.loading}>Loading the rig</p>}
        <figcaption className={styles.label}>3D fit, drag to turn</figcaption>
      </figure>

      <div className={styles.transport}>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? "Pause" : "Play"}
          onClick={toggle}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {playing ? (
              <path d="M4.5 3h2.4v10H4.5zM9.1 3h2.4v10H9.1z" />
            ) : (
              <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5z" />
            )}
          </svg>
        </button>
        <input
          className={styles.scrub}
          type="range"
          min={0}
          max={FRAMES - 1}
          step={1}
          value={frame}
          aria-label="Frame"
          aria-valuetext={`Frame ${frame + 1} of ${FRAMES}`}
          onChange={(event) => scrub(Number(event.target.value))}
        />
        <span className={styles.count}>
          {frame + 1} / {FRAMES}
        </span>
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={skeleton}
          disabled={!ready}
          onClick={showBones}
        >
          Skeleton
        </button>
      </div>

      <footer className={styles.notes}>
        <p>
          Made with{" "}
          <a
            href="https://github.com/Patch-gg/anymove"
            target="_blank"
            rel="noopener noreferrer"
          >
            anymove
          </a>{" "}
          by{" "}
          <a
            href="https://x.com/patch_gg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Patch
          </a>
          , from{" "}
          <a
            href="https://www.youtube.com/watch?v=AS92HYsEBqo"
            target="_blank"
            rel="noopener noreferrer"
          >
            @CanItCode
          </a>
          &rsquo;s method.
        </p>
      </footer>
    </div>
  );
}
