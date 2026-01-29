import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ---------------- Camera Video ---------------- */

const video = document.createElement('video');
video.autoplay = true;
video.muted = true;
video.playInLine = true;

video.style.position = 'fixed';
video.style.top = '0';
video.style.left = '0';
video.style.width = '100%';
video.style.height = '100%';
video.style.objectFit = 'cover';
video.style.zIndex = '-1';

document.body.appendChild(video);

async function startCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment'
      },
      audio: false
    });
    video.srcObject = stream;
  } catch (e) {
    console.error('Camera access failed:', e);
  }
}

startCamera();

/* ---------------- Renderer ---------------- */

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
//renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

/* ---------------- Scene ---------------- */

const scene = new THREE.Scene();

/* ---------------- Camera ---------------- */

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);  //45 is the veiwing angle. fov?!

camera.position.set(0, 0, 10);

/* ---------------- Lights ---------------- */

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
//dirLight.castShadow = true;
scene.add(dirLight);

/* ---------------- Marker Anchor ---------------- */

const markerAnchor = new THREE.Group();  //model goes to this group. This group represents the real marker.
scene.add(markerAnchor);

/* ---------------- Load Model ---------------- */

let model = null;  //variable for the model

const loader = new GLTFLoader().setPath('public/bag/');  //path of the model file.
loader.load('scene.gltf', (gltf) => {

  model = gltf.scene;

  model.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // تنظیم اولیه
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);

  markerAnchor.add(model);
});

/* ---------------- Marker Data (INPUT) ---------------- */

// این داده‌ها باید REAL-TIME آپدیت شوند
const markerData = {
  x: 0,
  y: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0
};  //This object should be updated! with the data from parsa's code.

/* ---------------- Update From Marker ---------------- */

const targetPosition = new THREE.Vector3();  //Vector3 = position of target
const targetQuaternion = new THREE.Quaternion();   //its rotation.  quaternion = rotation
//This two lines are Anti-jitter! makes rendering smooth.

function updateFromMarker(data) {

  // موقعیت (معمولاً Z برعکس است)
  targetPosition.set(
    data.x,
    data.y,
    -data.z   //it might need to change
  );  //This function connects markers with the model(not sure)

  markerAnchor.position.lerp(targetPosition, 0.2);  //حذف لرزش مارکرها

  // rotation
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(data.rx),
    THREE.MathUtils.degToRad(data.ry),
    THREE.MathUtils.degToRad(data.rz),
    'XYZ'  //Order of the axises
  );

  targetQuaternion.setFromEuler(euler);
  markerAnchor.quaternion.slerp(targetQuaternion, 0.2);  //حذف لرزش مارکرها
}

/* ---------------- Animation Loop ---------------- */

function animate() {
  requestAnimationFrame(animate);

  // هر فریم داده‌ی مارکر اعمال می‌شود
  updateFromMarker(markerData);  //If the marker changes, it would be aplied here!

  renderer.render(scene, camera);
}

animate();

/* ---------------- Resize ---------------- */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});