// Use the globally available THREE and STLLoader
document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.STLLoader();

    loader.load('assets/Whistler_-_British_Columbia.STL', function (geometry) {
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        camera.position.z = 5;

        const ambientLight = new THREE.AmbientLight(0xaaaaaa);
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
