import * as THREE from 'three';
console.log("Script 1 loaded successfully");
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'; // Make sure the path is correct

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
    stlModel.rotation.x = Math.PI / 2; // Adjust the model's initial rotation as needed
    scene.add(stlModel);
}, undefined, function (error) {
    console.error(error);
});

camera.position.z = 50; // Adjust camera distance so the STL model fits into view

function animate() {
    requestAnimationFrame(animate);
    if (stlModel) {
        stlModel.rotation.z += 0.01; // Rotate the STL model
    }
    renderer.render(scene, camera);
}

animate();
