// Import the necessary modules from Three.js
import * as THREE from 'https://unpkg.com/three@0.132.2/build/three.module.js';
import { STLLoader } from 'https://unpkg.com/three@0.132.2/examples/jsm/loaders/STLLoader.js';

document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new STLLoader();

    loader.load('assets/Whistler_-_British_Columbia.STL', function (geometry) {
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Changed to MeshPhongMaterial for better color effect
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Adjust camera and mesh position as needed to ensure the STL file is visible
        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);

            // Rotate mesh here
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        animate();
    });

    // Add some light to the scene
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);
});
