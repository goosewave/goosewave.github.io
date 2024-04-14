import * as THREE from './path/to/three.module.js';
import { STLLoader } from './path/to/STLLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the STL loader
const loader = new STLLoader();

// Load your STL file
loader.load('./Whistler_-_British_Columbia.STL', function (geometry) {
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
    const stlMesh = new THREE.Mesh(geometry, material);
    scene.add(stlMesh);
    // Center and scale the model appropriately
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Rescale the model to normalized space
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 1.0 / maxDim;
    stlMesh.scale.setScalar(scale);
    // Center the model
    stlMesh.position.sub(center.multiplyScalar(scale));

    // Adjust camera position and render the scene
    camera.position.z = 2 * maxDim * scale;
});

function animate() {
    requestAnimationFrame(animate);
    // Add some rotation to the model if desired
    scene.children[1].rotation.x += 0.01;
    scene.children[1].rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
