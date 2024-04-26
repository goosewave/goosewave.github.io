document.addEventListener('DOMContentLoaded', function () {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new THREE.STLLoader();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    loader.load('assets/Whistler_-_British_Columbia.STL', function (geometry) {
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        camera.position.z = 50; // Adjust camera distance so the model fits in view
        animate(mesh);
    });

    function animate(mesh) {
        requestAnimationFrame(function() { animate(mesh); });
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
});
