// Import the necessary three.js classes
import * as THREE from 'https://threejs.org/build/three.module.js';
import { STLLoader } from 'https://threejs.org/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add controls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);

// Load the STL file
const loader = new STLLoader();
loader.load('Whistler_-_British_Columbia.stl', function (geometry) {
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
});

// Set the camera position
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
