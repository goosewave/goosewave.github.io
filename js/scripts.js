document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.STLLoader();
    // Use MeshPhongMaterial with improved properties for smoother appearance
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff, // White color for the material
        specular: 0x111111, // Specular highlights to make the surface appear more shiny
        shininess: 100, // Shininess factor to increase the specularity
        flatShading: false // Ensure smooth shading
    });

    loader.load('assets/lucaspoirierlogo.stl', function (geometry) {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Adjust the camera position to ensure the model is fully visible
        camera.position.set(0, 0, 100); // Move the camera back to see large models
        camera.lookAt(scene.position); // Ensure the camera is looking at the scene

        // Enhance the lighting with a directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Add ambient light for softer shadows and smoother appearance
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.x += 0.01; // Continuous rotation on the x-axis
            mesh.rotation.y += 0.01; // Continuous rotation on the y-axis
            renderer.render(scene, camera);
        }

        animate();
    });
});
