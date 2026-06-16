// Dust 2 FPS - Versão Melhorada para PC
let scene, camera, renderer, controls;
let isLocked = false;
let bots = [];

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7799aa);
    scene.fog = new THREE.Fog(0x7799aa, 200, 1300);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-48, 14, -68);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);

    document.addEventListener('click', () => controls.lock());

    controls.addEventListener('lock', () => isLocked = true);
    controls.addEventListener('unlock', () => isLocked = false);

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffeecc, 1.2);
    sun.position.set(120, 220, 150);
    scene.add(sun);

    // Mapa
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/dust2.glb', (gltf) => {
        const mapa = gltf.scene;
        mapa.scale.set(1.25, 1.25, 1.25);
        mapa.position.y = -6;
        scene.add(mapa);
    });

    createBots();
    animate();
}

function createBots() {
    for (let i = 0; i < 5; i++) {
        const bot = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4, 1.5),
            new THREE.MeshLambertMaterial({ color: 0xff0000 })
        );
        bot.position.set(20 + Math.random()*40, 5, -30 + Math.random()*60);
        bot.userData = { health: 100, name: `Bot ${i}` };
        scene.add(bot);
        bots.push(bot);
    }
}

function shoot() {
    // Recoil
    camera.rotation.x -= 0.06;

    // Raycast
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.health) obj = obj.parent;

        if (obj && obj.userData.health) {
            obj.userData.health -= 40;
            if (obj.userData.health <= 0) {
                scene.remove(obj);
                addKillFeed("Você", obj.userData.name || "Bot");
            }
        }
    }

    addKillFeed("Você", "atirou", true);
}

function addKillFeed(killer, victim) {
    const kf = document.getElementById('killfeed') || createKillfeed();
    const entry = document.createElement('div');
    entry.textContent = `${killer} matou ${victim}`;
    entry.style.color = '#ff0';
    entry.style.marginBottom = '4px';
    kf.appendChild(entry);
    setTimeout(() => entry.remove(), 4000);
}

function createKillfeed() {
    const kf = document.createElement('div');
    kf.id = 'killfeed';
    kf.style.position = 'absolute';
    kf.style.top = '80px';
    kf.style.right = '20px';
    kf.style.zIndex = '100';
    document.body.appendChild(kf);
    return kf;
}

function animate() {
    requestAnimationFrame(animate);
    // Recoil volta devagar
    if (camera.rotation.x < 0) camera.rotation.x *= 0.92;
    renderer.render(scene, camera);
}
