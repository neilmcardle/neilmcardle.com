import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const BASE = "/explorations/puddle-high";

export type Colourway = { wet: number; fade: number };

export const COLOURWAYS: Record<string, Colourway> = {
  "As found": { wet: 0, fade: 0 },
  Wet: { wet: 1, fade: 0 },
  "Dipped in concrete": { wet: 0, fade: 1 },
};

export type Pose = {
  x: number;
  y: number;
  scale: number;
  rotY: number;
  rotX: number;
  lines: number;
  solid: number;
  explode: number;
  dims: number;
  spin: number;
};

const PARTS: Record<string, [number, number, number]> = {
  Collar: [0, 9, 0],
  Strap: [0, 5, 6],
  Shaft: [0, 3, 0],
  Foot: [5, -1, 0],
  Sole: [3, -7, 0],
  Heel: [-3, -11, 0],
};

function material(
  map: THREE.Texture,
  uniforms: Record<string, { value: unknown }>,
) {
  const m = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.85,
    transparent: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  m.customProgramCacheKey = () => "wellie-photo";
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uWet;\nuniform float uFade;",
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 concrete = vec3(0.2, 0.195, 0.185) * (0.7 + lum * 1.8);
        diffuseColor.rgb = mix(diffuseColor.rgb, concrete, uFade * 0.92);
        diffuseColor.rgb *= 1.0 - uWet * 0.38;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.22, uWet);
        roughnessFactor = mix(roughnessFactor, 1.0, uFade);`,
      );
  };
  return m;
}

export async function createScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.5 : 2),
  );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight("#fff4e2", 1.7);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rimLight = new THREE.DirectionalLight("#dfe8ff", 1.2);
  rimLight.position.set(-6, 4, -5);
  scene.add(rimLight);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const rig = new THREE.Group();
  const model = new THREE.Group();
  const SCALE = 3.3 / 45;
  model.scale.setScalar(SCALE);
  model.position.set(-15 * SCALE, -21.5 * SCALE, 0);
  rig.add(model);
  scene.add(rig);

  const [gltf, lineData] = await Promise.all([
    new GLTFLoader().loadAsync(`${BASE}/wellie.glb`),
    fetch(`${BASE}/lines.json`).then(
      (r) => r.json() as Promise<Record<string, number[]>>,
    ),
  ]);

  const uniforms = { uWet: { value: 0 }, uFade: { value: 0 } };
  const lineMaterial = new THREE.LineBasicMaterial({
    color: "#f1efe8",
    transparent: true,
    depthWrite: false,
  });
  const materials: THREE.MeshStandardMaterial[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const parts: {
    name: string;
    group: THREE.Group;
    explode: THREE.Vector3;
    anchor: THREE.Vector3;
  }[] = [];
  gltf.scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    const name = PARTS[node.name] ? node.name : (node.parent?.name ?? "");
    const explode = PARTS[name];
    if (!explode) return;
    const source = node.material as THREE.MeshStandardMaterial;
    const mat = material(source.map!, uniforms);
    materials.push(mat);
    const geometry = node.geometry as THREE.BufferGeometry;
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.renderOrder = 0;
    let lineGeometry: THREE.BufferGeometry;
    if (lineData[name]) {
      lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(lineData[name], 3),
      );
    } else {
      lineGeometry = new THREE.EdgesGeometry(geometry, 28);
    }
    geometries.push(lineGeometry);
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    lines.renderOrder = 1;
    const group = new THREE.Group();
    group.add(mesh, lines);
    model.add(group);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const anchor = new THREE.Vector3(
      box.max.x,
      (box.min.y + box.max.y) / 2,
      (box.min.z + box.max.z) / 2,
    );
    parts.push({ name, group, explode: new THREE.Vector3(...explode), anchor });
  });

  const dims = new THREE.Group();
  const dimMaterial = new THREE.LineBasicMaterial({
    color: "#f1efe8",
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const seg = (pts: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    geometries.push(g);
    dims.add(new THREE.LineSegments(g, dimMaterial));
  };
  seg([-4, 0, 0, -4, 43, 0, -5, 0, 0, -3, 0, 0, -5, 43, 0, -3, 43, 0]);
  seg([0, -4, 0, 30.7, -4, 0, 0, -5, 0, 0, -3, 0, 30.7, -5, 0, 30.7, -3, 0]);
  seg([-5.5, 0, 0, 35, 0, 0]);
  model.add(dims);

  const labelPoints = {
    height: new THREE.Vector3(-4, 21.5, 0),
    length: new THREE.Vector3(15.3, -4, 0),
  };

  let width = 1;
  let height = 1;
  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();

  const project = (v: THREE.Vector3, target: THREE.Object3D) => {
    const p = v.clone();
    target.localToWorld(p);
    p.project(camera);
    return { x: ((p.x + 1) / 2) * width, y: ((1 - p.y) / 2) * height };
  };

  let spin = 0;
  const render = (pose: Pose, dt: number, drag: number) => {
    spin += dt * 0.25 * pose.spin;
    rig.position.set(pose.x, pose.y, 0);
    rig.scale.setScalar(pose.scale);
    rig.rotation.set(pose.rotX, pose.rotY + spin * pose.spin + drag, 0);
    for (const part of parts)
      part.group.position.copy(part.explode).multiplyScalar(pose.explode);
    lineMaterial.opacity = pose.lines * 0.85;
    lineMaterial.visible = pose.lines > 0.01;
    for (const m of materials) {
      m.opacity = pose.solid;
      m.colorWrite = pose.solid > 0.01;
    }
    dimMaterial.opacity = pose.dims * 0.6;
    renderer.render(scene, camera);
    const labels: Record<string, { x: number; y: number }> = {};
    for (const part of parts)
      labels[part.name] = project(part.anchor, part.group);
    labels.height = project(labelPoints.height, model);
    labels.length = project(labelPoints.length, model);
    return labels;
  };

  const setColourway = (c: Colourway) => {
    uniforms.uWet.value = c.wet;
    uniforms.uFade.value = c.fade;
  };

  const dispose = () => {
    renderer.dispose();
    pmrem.dispose();
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => {
      m.map?.dispose();
      m.dispose();
    });
    lineMaterial.dispose();
    dimMaterial.dispose();
  };

  return { render, resize, setColourway, dispose };
}
