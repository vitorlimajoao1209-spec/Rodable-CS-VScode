// ==================== DUST 2 FPS - MOTOR ULTRA COMPLETO ====================
let scene, camera, renderer, controls;
let isLocked = false;
let bots = [];
let money = 1600;
let scoreT = 0, scoreCT = 0, round = 1;
let bombPlanted = false;
let bombTimer = null;
let hasBomb = true;
let lastShot = 0;
let isFrozen = true;

// Movimentação do Jogador
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isWalkingSilently = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Respawns e Bombs
const CHECKPOINTS = {
    TR_SPAWN: new THREE.Vector3(-48, 14, -68),
    CT_SPAWN: new THREE.Vector3(50, 6, 80),
    BOMB_A: new THREE.Vector3(15, 14, -10),
    BOMB_B: new THREE.Vector3(-60, 6, 50)
};

let mapColliders = [];
let particleSystems = []; 

// Configuração da Arma Atual
let currentWeapon = { 
    name: "AK47", damage: 35, recoil: 0.05, fireRate: 120, type: "Rifle",
    ammo: 30, maxAmmo: 30, reserveAmmo: 90 
};

// Banco de dados completo do Arsenal
const weaponShop = {
    pistols: [
        { name: "Glock-18", price: 200, dmg: 20, rec: 0.02, rate: 200, type: "Pistol", ammo: 20, max: 20, res: 120 },
        { name: "P2000", price: 200, dmg: 22, rec: 0.02, rate: 200, type: "Pistol", ammo: 12, max: 12, res: 24 },
        { name: "USP-S", price: 200, dmg: 22, rec: 0.015, rate: 200, type: "Pistol", ammo: 12, max: 12, res: 24 },
        { name: "P250", price: 300, dmg: 26, rec: 0.03, rate: 180, type: "Pistol", ammo: 9, max: 9, res: 26 },
        { name: "Dual Berettas", price: 300, dmg: 22, rec: 0.025, rate: 100, type: "Pistol", ammo: 30, max: 30, res: 120 },
        { name: "Five-SeveN", price: 500, dmg: 28, rec: 0.03, rate: 150, type: "Pistol", ammo: 20, max: 20, res: 100 },
        { name: "Tec-9", price: 500, dmg: 29, rec: 0.035, rate: 120, type: "Pistol", ammo: 18, max: 18, res: 90 },
        { name: "CZ75-Auto", price: 500, dmg: 25, rec: 0.05, rate: 100, type: "Pistol", ammo: 12, max: 12, res: 24 },
        { name: "Desert Eagle", price: 700, dmg: 53, rec: 0.09, rate: 400, type: "Pistol", ammo: 7, max: 7, res: 35 },
        { name: "Revólver R8", price: 600, dmg: 60, rec: 0.08, rate: 500, type: "Pistol", ammo: 8, max: 8, res: 32 }
    ],
    smgs: [
        { name: "MAC-10", price: 1050, dmg: 20, rec: 0.04, rate: 75, type: "SMG", ammo: 30, max: 30, res: 120 },
        { name: "MP9", price: 1250, dmg: 20, rec: 0.035, rate: 70, type: "SMG", ammo: 30, max: 30, res: 120 },
        { name: "MP7", price: 1500, dmg: 22, rec: 0.03, rate: 80, type: "SMG", ammo: 30, max: 30, res: 120 },
        { name: "MP5-SD", price: 1500, dmg: 22, rec: 0.025, rate: 80, type: "SMG", ammo: 30, max: 30, res: 120 },
        { name: "UMP-45", price: 1200, dmg: 28, rec: 0.045, rate: 100, type: "SMG", ammo: 25, max: 25, res: 100 },
        { name: "P90", price: 2350, dmg: 20, rec: 0.025, rate: 65, type: "SMG", ammo: 50, max: 50, res: 100 },
        { name: "PP-Bizon", price: 1400, dmg: 19, rec: 0.02, rate: 80, type: "SMG", ammo: 64, max: 64, res: 128 }
    ],
    shotguns: [
        { name: "Nova", price: 1050, dmg: 60, rec: 0.12, rate: 600, type: "Shotgun", ammo: 8, max: 8, res: 32 },
        { name: "XM1014", price: 2000, dmg: 45, rec: 0.09, rate: 250, type: "Shotgun", ammo: 7, max: 7, res: 32 },
        { name: "Sawed-Off", price: 1100, dmg: 70, rec: 0.15, rate: 650, type: "Shotgun", ammo: 7, max: 7, res: 32 },
        { name: "MAG-7", price: 1300, dmg: 68, rec: 0.11, rate: 500, type: "Shotgun", ammo: 5, max: 5, res: 32 }
    ],
    rifles: [
        { name: "AK-47", price: 2700, dmg: 35, rec: 0.05, rate: 120, type: "Rifle", ammo: 30, max: 30, res: 90 },
        { name: "M4A4", price: 3100, dmg: 33, rec: 0.04, rate: 110, type: "Rifle", ammo: 30, max: 30, res: 90 },
        { name: "M4A1-S", price: 2900, dmg: 33, rec: 0.03, rate: 115, type: "Rifle", ammo: 20, max: 20, res: 80 },
        { name: "Galil AR", price: 1800, dmg: 30, rec: 0.045, rate: 110, type: "Rifle", ammo: 35, max: 35, res: 90 },
        { name: "FAMAS", price: 2050, dmg: 30, rec: 0.04, rate: 110, type: "Rifle", ammo: 25, max: 25, res: 90 },
        { name: "SG 553", price: 3000, dmg: 30, rec: 0.035, rate: 111, type: "Rifle", ammo: 30, max: 30, res: 90 },
        { name: "AUG", price: 3300, dmg: 28, rec: 0.035, rate: 111, type: "Rifle", ammo: 30, max: 30, res: 90 },
        { name: "AWP", price: 4750, dmg: 115, rec: 0.20, rate: 1000, type: "Sniper", ammo: 10, max: 10, res: 30 },
        { name: "SSG 08", price: 1700, dmg: 55, rec: 0.08, rate: 800, type: "Sniper", ammo: 10, max: 10, res: 30 },
        { name: "G3SG1", price: 5000, dmg: 50, rec: 0.07, rate: 250, type: "Sniper", ammo: 20, max: 20, res: 60 },
        { name: "SCAR-20", price: 5000, dmg: 50, rec: 0.07, rate: 250, type: "Sniper", ammo: 20, max: 20, res: 60 }
    ],
    heavy: [
        { name: "M249", price: 5200, dmg: 32, rec: 0.06, rate: 80, type: "Heavy", ammo: 100, max: 100, res: 200 },
        { name: "Negev", price: 1700, dmg: 22, rec: 0.02, rate: 60, type: "Heavy", ammo: 150, max: 150, res: 300 }
    ],
    gear: [
        { name: "Faca", price: 0, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "Colete", price: 650, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "Capacete", price: 350, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "Kit Desarme", price: 400, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "HE Grenade", price: 300, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Incendiária", price: 600, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Molotov", price: 400, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Smoke", price: 300, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Flashbang", price: 200, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Decoy", price: 50, type: "Grenade", ammo: 1, max: 1, res: 0 }
    ]
};

// ÁUDIO ESPACIAL 3D
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const mainListener = audioCtx.listener;

function playSpatialSound(type, sourcePosition) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (mainListener.positionX) {
        mainListener.positionX.setValueAtTime(camera.position.x, audioCtx.currentTime);
        mainListener.positionY.setValueAtTime(camera.position.y, audioCtx.currentTime);
        mainListener.positionZ.setValueAtTime(camera.position.z, audioCtx.currentTime);
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
    panner.refDistance = 1; panner.maxDistance = 500; panner.rolloffFactor = 1;
    panner.positionX.setValueAtTime(sourcePosition.x, audioCtx.currentTime);
    panner.positionY.setValueAtTime(sourcePosition.y, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(sourcePosition.z, audioCtx.currentTime);
    osc.connect(panner); panner.connect(gainNode); gainNode.connect(audioCtx.destination);

    if (type === 'shoot') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(280, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start(); osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'explode') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.9, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
        osc.start(); osc.stop(audioCtx.currentTime + 0.9);
    } else if (type === 'beep') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 0.04);
    }
}
init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7799aa);
    scene.fog = new THREE.Fog(0x7799aa, 200, 1300);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    controls = new THREE.PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());
    controls.addEventListener('lock', () => isLocked = true);
    controls.addEventListener('unlock', () => isLocked = false);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffeecc, 1.2);
    sun.position.set(120, 220, 150); scene.add(sun);

    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/dust2.glb', (gltf) => {
        const mapa = gltf.scene;
        mapa.scale.set(1.25, 1.25, 1.25); mapa.position.y = -6; scene.add(mapa);
        mapa.traverse((child) => { if (child.isMesh) mapColliders.push(child); });
    });

    createBots(); createBuyMenu(); updateHUD(); startFreezeTime();
    document.addEventListener('mousedown', (e) => { if (e.button === 0 && isLocked) shoot(); });
    document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', onKeyUp);
    animate();
}

function startFreezeTime() {
    isFrozen = true; moveForward = moveBackward = moveLeft = moveRight = false;
    addKillFeed("SISTEMA", "FREEZE TIME: COMPRE AS ARMAS");
    setTimeout(() => { isFrozen = false; addKillFeed("SISTEMA", "VALENDO! COMBATE LIBERADO"); }, 5000);
}

function createBots() {
    bots.forEach(b => scene.remove(b)); bots = [];
    for (let i = 0; i < 5; i++) {
        const botGroup = new THREE.Group();
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffaaaa }));
        head.position.y = 2.1; head.name = "HEADSHOT";
        const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 1.2), new THREE.MeshLambertMaterial({ color: 0xff2222 }));
        chest.position.y = 0.8; chest.name = "PEITO";
        const legs = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.0), new THREE.MeshLambertMaterial({ color: 0xaa1111 }));
        legs.position.y = -1.0; legs.name = "PERNAS";
        botGroup.add(head); botGroup.add(chest); botGroup.add(legs);
        botGroup.position.copy(CHECKPOINTS.CT_SPAWN);
        botGroup.position.x += (Math.random() - 0.5) * 15; botGroup.position.z += (Math.random() - 0.5) * 15;
        botGroup.userData = { 
            health: 100, name: `Bot_CT_${i+1}`, team: 'CT', lastShotTime: 0,
            targetSite: (i % 2 === 0) ? CHECKPOINTS.BOMB_A : CHECKPOINTS.BOMB_B, currentState: "PATROL"
        };
        scene.add(botGroup); bots.push(botGroup);
    }
}

function createImpactParticles(position) {
    const pCount = 12; const geom = new THREE.BufferGeometry();
    const positions = []; const velocities = [];
    for (let i = 0; i < pCount; i++) {
        positions.push(position.x, position.y, position.z);
        velocities.push((Math.random() - 0.5) * 5, Math.random() * 6, (Math.random() - 0.5) * 5);
    }
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.3, transparent: true, opacity: 1.0 });
    const pSystem = new THREE.Points(geom, mat);
    pSystem.userData = { velocities: velocities, createdAt: Date.now() };
    scene.add(pSystem); particleSystems.push(pSystem);
}

function updateParticles(delta) {
    for (let i = particleSystems.length - 1; i >= 0; i--) {
        const pSystem = particleSystems[i]; const posAttr = pSystem.geometry.attributes.position;
        const vels = pSystem.userData.velocities;
        if (Date.now() - pSystem.userData.createdAt > 600) { scene.remove(pSystem); particleSystems.splice(i, 1); continue; }
        for (let j = 0; j < posAttr.count; j++) {
            let x = posAttr.getX(j) + vels[j * 3] * delta;
            let y = posAttr.getY(j) + vels[j * 3 + 1] * delta - 9.8 * delta;
            let z = posAttr.getZ(j) + vels[j * 3 + 2] * delta;
            posAttr.setXYZ(j, x, y, z);
        }
        posAttr.needsUpdate = true; pSystem.material.opacity -= delta * 1.5;
    }
}

function updateHUD() {
    const moneyEl = document.getElementById('hud-money'); const weaponEl = document.getElementById('hud-weapon');
    if(moneyEl) moneyEl.innerText = money;
    if(weaponEl) weaponEl.innerText = `${currentWeapon.name} [${currentWeapon.ammo}/${currentWeapon.reserveAmmo}]`;
}

function shoot() {
    if (isFrozen) return;
    if (currentWeapon.ammo <= 0) { addKillFeed("ARMA", "SEM BALAS! APERTE 'R'"); return; }
    if (Date.now() - lastShot < currentWeapon.fireRate) return;
    lastShot = Date.now(); currentWeapon.ammo--; updateHUD();
    playSpatialSound('shoot', camera.position); camera.rotation.x -= currentWeapon.recoil;
    const raycaster = new THREE.Raycaster(); raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        let hitPart = intersects[0].object; let rootEntity = hitPart.parent;
        createImpactParticles(intersects[0].point);
        if (rootEntity && rootEntity.userData && rootEntity.userData.health !== undefined) {
            let finalDamage = currentWeapon.damage;
            if (hitPart.name === "HEADSHOT") { finalDamage *= 4; addKillFeed("💥 HEADSHOT", "Dano Maximo!"); }
            rootEntity.userData.health -= finalDamage;
            if (rootEntity.userData.health <= 0) {
                scene.remove(rootEntity); bots = bots.filter(b => b !== rootEntity);
                money += 300; updateHUD(); checkRoundEnd();
            }
        }
    }
}
function botAIAndAttackLogic() {
    if (!isLocked || isFrozen) return;
    const now = Date.now();
    bots.forEach(bot => {
        const distAteJogador = bot.position.distanceTo(camera.position);
        let temLinhaDeVisao = false;
        if (distAteJogador < 120) {
            const rayToPlayer = new THREE.Raycaster();
            const dir = new THREE.Vector3().subVectors(camera.position, bot.position).normalize();
            rayToPlayer.set(bot.position, dir);
            const obs = rayToPlayer.intersectObjects(mapColliders, true);
            if (obs.length === 0 || (obs.length > 0 && obs[0].distance > distAteJogador)) {
                temLinhaDeVisao = true; bot.userData.currentState = "ATTACK";
            }
        }
        if (bot.userData.currentState === "ATTACK" && temLinhaDeVisao) {
            if (now - bot.userData.lastShotTime > 1400) {
                bot.userData.lastShotTime = now; playSpatialSound('shoot', bot.position);
                camera.position.x += (Math.random() - 0.5) * 1.5;
            }
        } else {
            bot.userData.currentState = "PATROL"; const destino = bot.userData.targetSite;
            let dirMov = new THREE.Vector3().subVectors(destino, bot.position);
            dirMov.y = 0; dirMov.normalize();
            if (bot.position.distanceTo(destino) > 5) bot.position.addScaledVector(dirMov, 0.15);
        }
    });
}

function onKeyDown(e) {
    if (!isFrozen) {
        switch (e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': isWalkingSilently = true; break;
            case 'Space': if (canJump) velocity.y += 100; canJump = false; break;
            case 'KeyR': reloadWeapon(); break;
        }
    }
    if (e.key === 'b' || e.key === 'B') {
        const menu = document.getElementById('buy-menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
    if (e.key.toLowerCase() === 'f' && hasBomb && !bombPlanted && !isFrozen) {
        if (camera.position.distanceTo(CHECKPOINTS.BOMB_A) < 25 || camera.position.distanceTo(CHECKPOINTS.BOMB_B) < 25) plantBomb();
    }
}

function onKeyUp(e) {
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
        case 'ShiftLeft': isWalkingSilently = false; break;
    }
}

function reloadWeapon() {
    const pombos = currentWeapon.maxAmmo - currentWeapon.ammo;
    if (pombos > 0 && currentWeapon.reserveAmmo > 0) {
        const pentes = Math.min(pombos, currentWeapon.reserveAmmo);
        currentWeapon.ammo += pentes; currentWeapon.reserveAmmo -= pentes;
        addKillFeed("SISTEMA", "RECARREGANDO..."); setTimeout(() => updateHUD(), 1000);
    }
}

function plantBomb() {
    bombPlanted = true; hasBomb = false; addKillFeed("Você", "PLANTED C4");
    let secondsLeft = 40;
    bombTimer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) playSpatialSound('beep', CHECKPOINTS.BOMB_A);
        else { clearInterval(bombTimer); explodeBomb(); }
    }, 1000);
}

function explodeBomb() {
    if (!bombPlanted) return;
    playSpatialSound('explode', CHECKPOINTS.BOMB_A); scoreT++;
    document.getElementById('score-t').innerText = scoreT; nextRound();
}

function checkRoundEnd() {
    if (bots.length === 0) {
        if(bombTimer) clearInterval(bombTimer);
        scoreT++; document.getElementById('score-t').innerText = scoreT; nextRound();
    }
}

function nextRound() {
    bombPlanted = false; hasBomb = true; round++;
    document.getElementById('hud-round').innerText = round;
    camera.position.copy(CHECKPOINTS.TR_SPAWN); createBots(); money += 3200; updateHUD(); startFreezeTime();
}

function buyWeapon(name, price, dmg, rec, rate, type, ammo, max, res) {
    if (money >= price) {
        money -= price; currentWeapon = { name, damage: dmg, recoil: rec, fireRate: rate, type, ammo, maxAmmo: max, reserveAmmo: res };
        updateHUD();
    }
}

function addKillFeed(killer, victim) {
    let kf = document.getElementById('killfeed');
    if (!kf) {
        kf = document.createElement('div'); kf.id = 'killfeed';
        kf.style.position = 'absolute'; kf.style.top = '70px'; kf.style.right = '20px';
        kf.style.zIndex = '200'; kf.style.color = '#fff'; document.body.appendChild(kf);
    }
    const div = document.createElement('div'); div.innerHTML = `${killer} → ${victim}`;
    kf.appendChild(div); setTimeout(() => div.remove(), 4000);
}

function createBuyMenu() {
    const menu = document.createElement('div'); menu.id = 'buy-menu';
    menu.style.position = 'absolute'; menu.style.top = '5%'; menu.style.left = '5%';
    menu.style.width = '90%'; menu.style.maxHeight = '85vh'; menu.style.overflowY = 'auto';
    menu.style.background = 'rgba(10,15,20,0.98)'; menu.style.color = '#fff'; menu.style.padding = '20px';
    menu.style.border = '2px solid #de9b35'; menu.style.display = 'none'; menu.style.zIndex = '300'; menu.style.fontFamily = 'monospace';

    let shopLayout = '<h2 style="color: #de9b35; margin-top:0;">MERCADO DUST 2 (Pressione B para fechar)</h2>';
    for (const category in weaponShop) {
        shopLayout += `<h3 style="color:#5d79ae; text-transform: uppercase; margin-bottom:5px;">${category}</h3><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:8px; margin-bottom:15px;">`;
        weaponShop[category].forEach(item => {
            const weaponArgs = `'${item.name}', ${item.price}, ${item.dmg}, ${item.rec}, ${item.rate}, '${item.type}', ${item.ammo}, ${item.max}, ${item.res}`;
            shopLayout += `<button onclick="buyWeapon(${weaponArgs})" style="background:#1c2430; color:#fff; border:1px solid #3a4b63; padding:8px; cursor:pointer; text-align:left;"><b>${item.name}</b><br><span style="color:#00ff00">$${item.price}</span></button>`;
        });
        shopLayout += '</div>';
    }
    menu.innerHTML = shopLayout; document.body.appendChild(menu);
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now(); const delta = (time - prevTime) / 1000;
    updateParticles(delta);

    if (isLocked === true) {
        velocity.x -= velocity.x * 10.0 * delta; velocity.z -= velocity.z * 10.0 * delta; velocity.y -= 9.8 * 30.0 * delta; 
        direction.z = Number(moveForward) - Number(moveBackward); direction.x = Number(moveRight) - Number(moveLeft); direction.normalize();
        const speedModifier = isWalkingSilently ? 180.0 : 400.0;
        if (moveForward || moveBackward) velocity.z -= direction.z * speedModifier * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speedModifier * delta;

        const oldPosition = camera.position.clone();
        controls.moveRight(-velocity.x * delta); controls.moveForward(-velocity.z * delta); controls.getObject().position.y += (velocity.y * delta);

        const playerRay = new THREE.Raycaster(oldPosition, direction, 0, 3);
        const colisoes = playerRay.intersectObjects(mapColliders, true);
        if (colisoes.length > 0) { camera.position.x = oldPosition.x; camera.position.z = oldPosition.z; }
        if (controls.getObject().position.y < 14) { velocity.y = 0; controls.getObject().position.y = 14; canJump = true; }
    }
    prevTime = time; botAIAndAttackLogic();
    if (camera.rotation.x < 0) camera.rotation.x *= 0.9;
    renderer.render(scene, camera);
}
