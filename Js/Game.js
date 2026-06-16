let scene, camera, renderer, controls;
let isLocked = false;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88aabb);
    scene.fog = new THREE.Fog(0x88aabb, 300, 1600);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-45, 12, -65); // Spawn aproximado Base TR

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controls (Primeira Pessoa)
    controls = new THREE.PointerLockControls(camera, document.body);

    document.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        isLocked = true;
        document.getElementById('hud').innerHTML = '🎮 Jogando - Dust 2';
    });

    controls.addEventListener('unlock', () => {
        isLocked = false;
        document.getElementById('hud').innerHTML = 'ESC pressionado - Clique na tela para voltar';
    });

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffeedd, 1.1);
    sun.position.set(120, 200, 100);
    scene.add(sun);

    // Carregar Mapa Dust2
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/dust2.glb', (gltf) => {
        const mapa = gltf.scene;
        mapa.scale.set(1.15, 1.15, 1.15);
        mapa.position.y = -3;
        scene.add(mapa);
        document.getElementById('hud').innerHTML = '✅ Dust 2 Carregado! Atire com clique esquerdo';
    }, undefined, (error) => {
        console.error(error);
        document.getElementById('hud').innerHTML = '⚠️ dust2.glb não encontrado na pasta assets/models/';
    });

    // Tiro
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0 && isLocked) {
            shoot();
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function shoot() {
    // Efeito de tiro simples
    const hud = document.getElementById('hud');
    const original = hud.innerHTML;
    hud.innerHTML = '🔫 BANG!';
    setTimeout(() => hud.innerHTML = original, 120);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
