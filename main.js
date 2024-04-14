import * as THREE from 'three';
console.log("Script 1 loaded successfully");
console.log("test");

// Ensure the path is correct and accessible
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

console.log("Script 2 loaded successfully");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// STL model
let stlModel;

const loader = new STLLoader();
loader.load('Whistler_-_British_Columbia.STL', function (geometry) {
    const material = new THREE.MeshNormalMaterial({ flatShading: true });
    stlModel = new THREE.Mesh(geometry, material);
    stlModel.rotation.x = Math.PI / 2;
    scene.add(stlModel);
}, undefined, function (error) {
    console.error('Error loading STL file:', error);
});

camera.position.z = 50;

function animate() {
    requestAnimationFrame(animate);
    if (stlModel) {
        stlModel.rotation.z += 0.01;
    }
    renderer.render(scene, camera);
}

animate();
