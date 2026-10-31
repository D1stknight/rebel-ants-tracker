// Ant-Thony, giant: spins as you scroll, idles in the hero, and does a move now and then.
// Loaded only on devices that can run it smoothly; otherwise the still image stays.
import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';

const BASE_ROT = 0.35;      // same angle as the still image, so the swap is seamless
const SPIN = 0.0034;        // radians per pixel scrolled (about one turn every 1,850px)

export async function startAnt(canvas, stage) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x1a0c06, 1.1));
  const key = new THREE.DirectionalLight(0xffc48a, 2.4); key.position.set(2.5, 3, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8a2a, 5); rim.position.set(-3, 2, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x6be3a4, 1.6); rim2.position.set(3, 1, -3); scene.add(rim2);
  const camera = new THREE.PerspectiveCamera(28, 2 / 3, 0.01, 100);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('assets/antthony.glb');
  const ant = gltf.scene;
  scene.add(ant);

  const mixer = new THREE.AnimationMixer(ant);
  const clips = Object.fromEntries(gltf.animations.map((c) => [c.name, c]));
  const idle = mixer.clipAction(clips.idle);
  idle.play();
  mixer.update(0.5);

  // Frame it exactly like the still image
  ant.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(ant);
  const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  ant.position.set(-center.x, -box.min.y, -center.z);
  const pivot = new THREE.Group();
  scene.remove(ant); pivot.add(ant); scene.add(pivot);
  pivot.rotation.y = BASE_ROT;
  camera.position.set(0, size.y * 0.52, size.y * 2.55);
  camera.lookAt(0, size.y * 0.5, 0);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; }
  };
  let dirty = true;
  new ResizeObserver(resize).observe(canvas);
  resize();

  // One-off moves (flip kick, cartwheel…) that blend back to idle
  let busy = null;
  function play(name) {
    const clip = clips[name];
    if (!clip || busy) return;
    const a = mixer.clipAction(clip);
    a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false;
    a.crossFadeFrom(idle, 0.25, false).play();
    busy = a;
  }
  mixer.addEventListener('finished', (e) => {
    if (e.action !== busy) return;
    idle.reset().play();
    idle.crossFadeFrom(busy, 0.35, false);
    setTimeout(() => { busy = null; }, 350);
  });

  let target = BASE_ROT, rot = BASE_ROT, inHero = true;
  const clock = new THREE.Clock();
  let slow = 0, frames = 0, stopped = false;

  function frame() {
    if (stopped) return;
    requestAnimationFrame(frame);
    if (document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.1);
    const settling = Math.abs(target - rot) > 0.0004;
    rot += (target - rot) * Math.min(1, dt * 7);
    const animating = inHero || busy;
    if (!animating && !settling && !dirty) return;   // nothing changed: don't redraw
    if (animating) mixer.update(dt);
    pivot.rotation.y = rot;
    renderer.render(scene, camera);
    dirty = false;

    // Safety net: if this device can't keep up in the first seconds, go back to the still image
    if (frames < 90) { frames++; if (dt > 0.045) slow++; if (frames === 90 && slow > 45) { stage.classList.remove('is-3d'); stopped = true; } }
  }
  renderer.render(scene, camera);
  stage.classList.add('is-3d');
  requestAnimationFrame(frame);

  return {
    setScroll(y, p) { target = BASE_ROT + y * SPIN; inHero = p < 0.98; },
    play,
  };
}
