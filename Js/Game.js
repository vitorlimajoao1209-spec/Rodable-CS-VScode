let scene, camera, renderer, controls;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88aabb);
    scene.fog = new THREE.Fog(0x88aabb, 300, 1500);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-40, 15, -60);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);
    
    document.addEventListener('click', () => {
        controls.lock();
    });

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(100, 150, 80);
    scene.add(sun);

    // Tentativa de carregar mapa
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/dust2.glb', (gltf) => {
        const mapa = gltf.scene;
        mapa.scale.set(1.1, 1.1, 1.1);
        scene.add(mapa);
        document.getElementById('hud').innerHTML = '✅ Mapa Dust 2 carregado!';
    }, undefined, () => {
        document.getElementById('hud').innerHTML = '⚠️ Mapa não encontrado. Adicione dust2.glb';
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}
