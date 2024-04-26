document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.STLLoader();
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

    loader.load('assets/Whistler_-_British_Columbia.STL', function (geometry) {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Adjust the camera
        camera.position.set(0, 0, 100); // Move the camera back so we can see large models
        camera.lookAt(scene.position); // Ensure the camera is looking at the scene

        // Add a directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Add ambient light for softer shadows
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        }

        animate();
    });
});
