import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const mtlLoader = new MTLLoader();
    mtlLoader.load('assets/earth.mtl', function (materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('assets/earth.obj', function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.side = THREE.DoubleSide;
                }
            });

            scene.add(object);
            camera.position.set(0, 0, 7);
            camera.lookAt(scene.position);

            // Lighting setup
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(0, 1, 1);
            scene.add(directionalLight);

            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                object.rotation.x += 0.01;
                object.rotation.y += 0.01;
                renderer.render(scene, camera);
            }

            animate();
        });
    });
});
