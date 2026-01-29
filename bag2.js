import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------------- Camera Video ---------------- */

const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.playsInline = true;

video.style.position = 'fixed';
video.style.top = '0';
video.style.left = '0';
video.style.width = '100%';
video.style.height = '100%';
video.style.objectFit = 'cover';
video.style.zIndex = '-1';

document.body.appendChild(video);

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
  video.srcObject = stream;
}

startCamera();

/* ---------------- Renderer ---------------- */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearAlpha(0);

renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '1';

document.body.appendChild(renderer.domElement);

/* ---------------- Scene ---------------- */

const scene = new THREE.Scene();

/* ---------------- Camera ---------------- */

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.2, 4);

/* ---------------- Controls ---------------- */

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = false;

controls.minDistance = 2;
controls.maxDistance = 6;

controls.target.set(0, 1, 0);
controls.update();

/* ---------------- Lights ---------------- */

scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(3, 5, 3);
scene.add(light);

/* ---------------- Model ---------------- */

let model;

const loader = new GLTFLoader();
loader.load('public/bag/scene.gltf', (gltf) => {

  model = gltf.scene;

  model.scale.set(0.4, 0.4, 0.4);
  model.position.set(0, 0, 0);

  scene.add(model);
});

/* ---------------- Resize ---------------- */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- Animate ---------------- */

function animate() {
  requestAnimationFrame(animate);
  controls.update();        
  renderer.render(scene, camera);
}

animate();
