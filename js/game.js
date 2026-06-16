// ==================== DUST 2 FPS - VERSÃO FINAL ====================
let scene, camera, renderer, controls;
let isLocked = false;
let bots = [];
let currentWeapon = "AK47";
let money = 1600;
let scoreT = 0, scoreCT = 0, round = 1;
let bombPlanted = false;
let hasBomb = true;
let lastShot = 0;

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

    // Mapa Dust 2
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/dust2.glb', (gltf) => {
        const mapa = gltf.scene;
        mapa.scale.set(1.25, 1.25, 1.25);
        mapa.position.y = -6;
        scene.add(mapa);
    });

    createBots();
    createBuyMenu();

    document.addEventListener('mousedown', (e) => { if (e.button === 0 && isLocked) shoot(); });
    document.addEventListener('keydown', onKeyDown);

    animate();
}

function createBots() {
    for (let i = 0; i < 8; i++) {
        const bot = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4.2, 1.6),
            new THREE.MeshLambertMaterial({ color: 0xff2222 })
        );
        bot.position.set(30 + Math.random()*50, 6, -40 + Math.random()*90);
        bot.userData = { health: 100, name: `Bot${i}`, team: 'CT' };
        scene.add(bot);
        bots.push(bot);
    }
}

function shoot() {
    if (Date.now() - lastShot < 120) return;
    lastShot = Date.now();

    camera.rotation.x -= 0.07; // Recoil

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData.health) hit = hit.parent;
        if (hit && hit.userData.health) {
            hit.userData.health -= 45;
            if (hit.userData.health <= 0) {
                scene.remove(hit);
                bots = bots.filter(b => b !== hit);
                addKillFeed("Você", hit.userData.name);
            }
        }
    }
}

function onKeyDown(e) {
    if (e.key === 'b' || e.key === 'B') {
        const menu = document.getElementById('buy-menu');
        if(menu.style.display === 'none') {
            menu.style.display = 'block';
        } else {
            menu.style.display = 'none';
        }
    }
    if (e.key.toLowerCase() === 'f' && hasBomb && !bombPlanted) {
        plantBomb();
    }
}

function plantBomb() {
    bombPlanted = true;
    hasBomb = false;
    addKillFeed("Você", "PLANTED C4");
    setTimeout(() => {
        if (bombPlanted) {
            addKillFeed("Terrorists", "WIN");
            scoreT++;
            document.getElementById('score-t').innerText = scoreT;
            checkGameOver();
        }
    }, 40000);
}

function addKillFeed(killer, victim) {
    let kf = document.getElementById('killfeed');
    if (!kf) {
        kf = document.createElement('div');
        kf.id = 'killfeed';
        kf.style.position = 'absolute';
        kf.style.top = '70px';
        kf.style.right = '20px';
        kf.style.zIndex = '200';
        kf.style.color = '#fff';
        kf.style.background = 'rgba(0,0,0,0.5)';
        kf.style.padding = '5px 10px';
        kf.style.borderRadius = '4px';
        document.body.appendChild(kf);
    }
    const div = document.createElement('div');
    div.style.margin = '3px 0';
    div.innerHTML = `<span style="color:#de9b35">${killer}</span> ➔ <span style="color:#ff3333">${victim}</span>`;
    kf.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function createBuyMenu() {
    const menu = document.createElement('div');
    menu.id = 'buy-menu';
    menu.style.position = 'absolute';
    menu.style.top = '50%';
    menu.style.left = '50%';
    menu.style.transform = 'translate(-50%, -50%)';
    menu.style.background = 'rgba(0,0,0,0.95)';
    menu.style.color = '#fff';
    menu.style.padding = '20px';
    menu.style.border = '3px solid #ff0';
    menu.style.display = 'none';
    menu.style.zIndex = '300';
    menu.innerHTML = `
        <h2 style="color: #ff0; margin-top:0;">LOJA - Pressione B para fechar</h2>
        <p>1 - AK-47</p><p>2 - M4A4</p><p>3 - AWP</p>
        <p>4 - Deagle</p><p>5 - Glock</p><p>6 - HE Grenade</p>
        <small style="color:#aaa;">Demais armas em desenvolvimento</small>
    `;
    document.body.appendChild(menu);
}

function checkGameOver() {
    if (scoreT >= 8 || scoreCT >= 8) {
        alert(`Fim de jogo! Terrorists ${scoreT} x ${scoreCT} CT`);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    if (camera.rotation.x < 0) camera.rotation.x *= 0.9;
    renderer.render(scene, camera);
}
