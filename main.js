import * as THREE from './js/three.module.min.js'; // Adjust the path as necessary

let scene, camera, renderer, sphere;

init();
animate();

function init() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa); // Grey background

    // Create and position the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 5;

    // Create the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a sphere geometry and material
    const geometry = new THREE.SphereGeometry(1, 32, 32); // radius, widthSegments, heightSegments
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Resize the renderer on window resize
    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    // Rotate the sphere
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
