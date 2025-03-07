import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', function () {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('magenta');
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create a blue club shape (like a playing card club ♣)
    const clubGroup = new THREE.Group();
    
    // Create three spheres for the club's lobes
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    
    // Top sphere
    const topSphere = new THREE.Mesh(sphereGeometry, blueMaterial);
    topSphere.position.y = 0.8;
    clubGroup.add(topSphere);
    
    // Left sphere
    const leftSphere = new THREE.Mesh(sphereGeometry, blueMaterial);
    leftSphere.position.set(-0.7, 0, 0);
    clubGroup.add(leftSphere);
    
    // Right sphere
    const rightSphere = new THREE.Mesh(sphereGeometry, blueMaterial);
    rightSphere.position.set(0.7, 0, 0);
    clubGroup.add(rightSphere);
    
    // Create a stem for the club
    const stemGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32);
    const stem = new THREE.Mesh(stemGeometry, blueMaterial);
    stem.position.y = -0.75;
    clubGroup.add(stem);
    
    // Add the club to the scene
    scene.add(clubGroup);
    
    // Add lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the club
        clubGroup.rotation.x += 0.01;
        clubGroup.rotation.y += 0.02;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start animation
    animate();
});