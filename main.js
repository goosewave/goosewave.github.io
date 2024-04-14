import * as THREE from '../assets/js/three.module.js';  // Path adjusted for the assets folder
import { STLLoader } from '../assets/js/STLLoader.js';  // Path adjusted for the assets folder

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup STL loader and load the model
const loader = new STLLoader();
loader.load('./assets/models/Whistler_-_British_Columbia.STL', function (geometry) {
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Adjust the camera and the model position based on the geometry
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Move the camera back so the model fits in the view
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2)); // Adjust the / 4 to change how much of the scene is visible
    cameraZ *= 1.1;  // Add a bit to the calculated value so it's not too tight

    camera.position.z = cameraZ;
    const minZ = boundingBox.min.z;
    const cameraToFloorDistance = camera.position.z - minZ;
    camera.position.y = center.y;
    camera.lookAt(center);

    // Set an animation loop
    const animate = function () {
        requestAnimationFrame(animate);
        // Optional: Rotate the mesh for a dynamic view
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;

        renderer.render(scene, camera);
    };

    animate();
});

// Handle window resizing
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
