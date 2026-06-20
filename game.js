// ==================== DUST 2 FPS - MOTOR CORRIGIDO ====================

// Three.js
let scene, camera, renderer, controls;
let isLocked = false;

// Jogador
let playerHP = 100;
let playerArmor = 0;
let hasHelmet = false;
let isDead = false;

// Armas
let currentWeapon = null;
let currentSlot = 1;
let weaponSlots = { 1: null, 2: null, 3: null, 4: null, 5: null };
let isReloading = false;
let isSwitchingWeapon = false;
let lastShot = 0;

// Movimento
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isWalkingSilently = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Modos
let isFlyMode = false;
let godMode = false;
let wallhackActive = false;

// Jogo
let bots = [];
let money = 1600;
let scoreT = 0, scoreCT = 0, round = 1;
let bombPlanted = false;
let bombTimer = null;
let hasBomb = true;
let isFrozen = true;
let mapColliders = [];
let particleSystems = [];
let grenades = [];

// Granadas
let playerGrenades = { HE: 1, FLASH: 0, SMOKE: 0, MOLOTOV: 0 };
let selectedGrenadeType = 'HE';
let isHoldingGrenade = false;
let grenadeHoldStartTime = 0;
let grenadeThrowPower = 0;

// Spray
let sprayCounter = 0;
let lastSprayTime = 0;

// Chat
let isChatOpen = false;
let adminMode = false;
let adminLogs = [];

// Anti-trapaça
let tamperAttempts = 0;
let bannedPlayers = JSON.parse(localStorage.getItem('dust2_banned') || '{}');

// Configs
let sensitivity = 0.5;
let musicEnabled = true;
let radioEnabled = true;
let crosshairType = 'cross';
let crosshairColor = '#00ff00';

// Login
let currentPlayer = null;

// Ranking
let playerStats = { kills: 0, deaths: 0, headshots: 0, knifes: 0, bombsPlanted: 0, bombsDefused: 0, mvps: 0 };
let killStreak = 0;
let lastKillTime = 0;

// ==================== COORDENADAS CORRIGIDAS ====================
const CHECKPOINTS = {
    TR_SPAWN: new THREE.Vector3(0, 16, -40),
    CT_SPAWN: new THREE.Vector3(0, 16, 40),
    BOMB_A: new THREE.Vector3(15, 14, 0),
    BOMB_B: new THREE.Vector3(-15, 14, 0)
};

// ==================== ARSENAL ====================
const weaponShop = {
    pistols: [
        { name: "Glock-18", price: 200, dmg: 20, rec: 0.02, rate: 200, type: "Pistol", ammo: 20, max: 20, res: 120, reloadTime: 2000 },
        { name: "USP-S", price: 200, dmg: 22, rec: 0.015, rate: 200, type: "Pistol", ammo: 12, max: 12, res: 24, reloadTime: 2000 },
        { name: "Desert Eagle", price: 700, dmg: 53, rec: 0.09, rate: 400, type: "Pistol", ammo: 7, max: 7, res: 35, reloadTime: 2200 }
    ],
    smgs: [
        { name: "MAC-10", price: 1050, dmg: 20, rec: 0.04, rate: 75, type: "SMG", ammo: 30, max: 30, res: 120, reloadTime: 2100 },
        { name: "P90", price: 2350, dmg: 20, rec: 0.025, rate: 65, type: "SMG", ammo: 50, max: 50, res: 100, reloadTime: 2300 }
    ],
    rifles: [
        { name: "AK-47", price: 2700, dmg: 35, rec: 0.05, rate: 120, type: "Rifle", ammo: 30, max: 30, res: 90, reloadTime: 2500 },
        { name: "M4A4", price: 3100, dmg: 33, rec: 0.04, rate: 110, type: "Rifle", ammo: 30, max: 30, res: 90, reloadTime: 2500 },
        { name: "AWP", price: 4750, dmg: 115, rec: 0.20, rate: 1000, type: "Sniper", ammo: 10, max: 10, res: 30, reloadTime: 3000 }
    ],
    gear: [
        { name: "Faca", price: 0, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "Colete", price: 650, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "Capacete", price: 350, type: "Gear", ammo: 1, max: 1, res: 0 },
        { name: "HE Grenade", price: 300, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Flashbang", price: 200, type: "Grenade", ammo: 1, max: 1, res: 0 },
        { name: "Smoke", price: 300, type: "Grenade", ammo: 1, max: 1, res: 0 }
    ]
};

// ==================== AUDIO ====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    switch(type) {
        case 'shoot':
            osc.type = 'sawtooth';
            osc.frequency.value = 150;
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start(); osc.stop(audioCtx.currentTime + 0.08);
            break;
        case 'headshot':
            osc.type = 'square';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'explode':
            osc.type = 'triangle';
            osc.frequency.value = 60;
            gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.start(); osc.stop(audioCtx.currentTime + 0.6);
            break;
        case 'beep':
            osc.type = 'sine';
            osc.frequency.value = 900;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc.start(); osc.stop(audioCtx.currentTime + 0.04);
            break;
        case 'radio':
            osc.type = 'triangle';
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
            break;
    }
}

// ==================== INICIALIZACAO ====================
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x444444);
    scene.fog = new THREE.Fog(0x444444, 100, 400);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    controls = new THREE.PointerLockControls(camera, document.body);
    controls.pointerSpeed = sensitivity;
    
    setupEventListeners();
    setupWeapons();
    createMap();
    createBots();
    createBuyMenu();
    updateHUD();
    updateWeaponSlots();
    startFreezeTime();
    
    animate();
}

function setupEventListeners() {
    document.addEventListener('click', () => {
        if (!isChatOpen) controls.lock();
    });
    
    controls.addEventListener('lock', () => {
        isLocked = true;
        document.getElementById('crosshair').style.display = 'block';
    });
    
    controls.addEventListener('unlock', () => {
        isLocked = false;
        document.getElementById('crosshair').style.display = 'none';
    });
    
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
}

function setupWeapons() {
    weaponSlots[1] = { name: "AK-47", damage: 35, recoil: 0.05, fireRate: 120, type: "Rifle", ammo: 30, maxAmmo: 30, reserveAmmo: 90, reloadTime: 2500 };
    weaponSlots[2] = { name: "Glock-18", damage: 20, recoil: 0.02, fireRate: 200, type: "Pistol", ammo: 20, maxAmmo: 20, reserveAmmo: 120, reloadTime: 2000 };
    weaponSlots[3] = { name: "Faca", damage: 50, recoil: 0, fireRate: 400, type: "Melee", ammo: 1, maxAmmo: 1, reserveAmmo: 0, reloadTime: 0 };
    weaponSlots[4] = { grenades: { ...playerGrenades } };
    weaponSlots[5] = { hasBomb: true };
    currentWeapon = weaponSlots[1];
    currentSlot = 1;
}

function createMap() {
    // Iluminacao
    scene.add(new THREE.AmbientLight(0x888888, 0.6));
    const sun = new THREE.DirectionalLight(0xffeedd, 0.8);
    sun.position.set(50, 100, 50);
    scene.add(sun);
    
    // Chao
    const floorGeom = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x888866 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 14;
    floor.receiveShadow = true;
    scene.add(floor);
    mapColliders.push(floor);
    
    // Paredes
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x996644 });
    const walls = [
        { pos: [0, 17, -45], size: [80, 6, 2] },
        { pos: [0, 17, 45], size: [80, 6, 2] },
        { pos: [-40, 17, 0], size: [2, 6, 90] },
        { pos: [40, 17, 0], size: [2, 6, 90] }
    ];
    
    walls.forEach(w => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
        wall.position.set(...w.pos);
        scene.add(wall);
        mapColliders.push(wall);
    });
    
    // Bombsites
    const siteMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2 });
    [CHECKPOINTS.BOMB_A, CHECKPOINTS.BOMB_B].forEach(site => {
        const marker = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.1, 16), siteMat);
        marker.position.copy(site);
        marker.position.y = 14;
        scene.add(marker);
    });
}

// ==================== CONTINUA NA PARTE 2 ====================
// ==================== BOTS ====================
function createBots() {
    bots.forEach(b => scene.remove(b));
    bots = [];
    
    const botCount = parseInt(sessionStorage.getItem('botCount') || '5');
    
    for (let i = 0; i < botCount; i++) {
        const bot = new THREE.Group();
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xcc6666 })
        );
        head.position.y = 2.1;
        head.name = "HEADSHOT";
        
        const chest = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 2.2, 1.2),
            new THREE.MeshLambertMaterial({ color: 0x883333 })
        );
        chest.position.y = 0.8;
        
        const legs = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.5, 1.0),
            new THREE.MeshLambertMaterial({ color: 0x662222 })
        );
        legs.position.y = -1.0;
        
        bot.add(head);
        bot.add(chest);
        bot.add(legs);
        
        bot.position.copy(CHECKPOINTS.CT_SPAWN);
        bot.position.x += (Math.random() - 0.5) * 20;
        bot.position.z += (Math.random() - 0.5) * 20;
        bot.position.y = 15;
        
        bot.userData = {
            health: 100,
            name: 'Bot_' + (i + 1),
            team: 'CT',
            lastShotTime: 0,
            targetSite: i % 2 === 0 ? CHECKPOINTS.BOMB_A : CHECKPOINTS.BOMB_B,
            currentState: 'PATROL',
            reactionTime: 800 + Math.random() * 1200,
            accuracy: 0.3
        };
        
        scene.add(bot);
        bots.push(bot);
    }
}

// ==================== TIRO ====================
function shoot() {
    if (isFrozen || isDead || isSwitchingWeapon || isReloading) return;
    if (currentSlot >= 4) return;
    if (!currentWeapon || currentWeapon.ammo <= 0) {
        addKillFeed("SEM MUNICAO", "");
        return;
    }
    if (Date.now() - lastShot < currentWeapon.fireRate) return;
    
    lastShot = Date.now();
    currentWeapon.ammo--;
    updateHUD();
    playSound('shoot');
    
    camera.rotation.x -= currentWeapon.recoil * 0.5;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        createImpactParticles(hit.point);
        
        let target = hit.object;
        while (target && !target.userData.health) {
            target = target.parent;
        }
        
        if (target && target.userData && target.userData.health !== undefined) {
            let damage = currentWeapon.damage;
            
            if (hit.object.name === "HEADSHOT") {
                damage *= 4;
                playSound('headshot');
                addKillFeed("HEADSHOT", target.userData.name);
                playerStats.headshots++;
            }
            
            target.userData.health -= damage;
            
            if (target.userData.health <= 0) {
                handleKill(target);
            }
        }
    }
}

function handleKill(bot) {
    scene.remove(bot);
    bots = bots.filter(b => b !== bot);
    
    money += 300;
    playerStats.kills++;
    killStreak++;
    lastKillTime = Date.now();
    
    addKillFeed("ELIMINOU", bot.userData.name);
    updateHUD();
    updateRanking();
    checkRoundEnd();
}

// ==================== DANO NO JOGADOR ====================
function takeDamage(amount) {
    if (isDead || godMode) return;
    
    let damage = amount;
    
    if (playerArmor > 0) {
        const armorRatio = hasHelmet ? 0.7 : 0.5;
        const armorDmg = Math.floor(damage * armorRatio);
        if (playerArmor >= armorDmg) {
            playerArmor -= armorDmg;
            damage -= armorDmg;
        } else {
            damage -= playerArmor;
            playerArmor = 0;
        }
    }
    
    playerHP -= Math.floor(damage);
    
    const overlay = document.createElement('div');
    overlay.className = 'damage-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 300);
    
    updateHUD();
    updateHealthBars();
    
    if (playerHP <= 0) {
        playerHP = 0;
        playerDeath();
    }
}

function playerDeath() {
    isDead = true;
    killStreak = 0;
    playerStats.deaths++;
    
    const death = document.createElement('div');
    death.className = 'death-screen';
    death.textContent = 'MORTO';
    document.body.appendChild(death);
    
    setTimeout(() => {
        death.remove();
        playerHP = 100;
        playerArmor = 0;
        isDead = false;
        camera.position.copy(CHECKPOINTS.TR_SPAWN);
        velocity.set(0, 0, 0);
        money = Math.floor(money * 0.7);
        updateHUD();
        updateHealthBars();
    }, 2500);
}

// ==================== IA DOS BOTS ====================
function botAI() {
    if (!isLocked || isFrozen || isDead) return;
    const now = Date.now();
    
    bots.forEach(bot => {
        const dist = bot.position.distanceTo(camera.position);
        let canSee = false;
        
        if (dist < 100) {
            const ray = new THREE.Raycaster();
            const dir = new THREE.Vector3().subVectors(camera.position, bot.position).normalize();
            ray.set(bot.position, dir);
            const hits = ray.intersectObjects(mapColliders, true);
            
            if (hits.length === 0 || hits[0].distance > dist) {
                canSee = true;
                bot.userData.currentState = 'ATTACK';
            }
        }
        
        if (bot.userData.currentState === 'ATTACK' && canSee) {
            bot.lookAt(camera.position);
            
            if (now - bot.userData.lastShotTime > bot.userData.reactionTime) {
                bot.userData.lastShotTime = now;
                playSound('shoot');
                
                if (Math.random() < bot.userData.accuracy) {
                    takeDamage(8 + Math.floor(Math.random() * 15));
                }
            }
        } else {
            bot.userData.currentState = 'PATROL';
            const target = bot.userData.targetSite;
            const move = new THREE.Vector3().subVectors(target, bot.position);
            move.y = 0;
            move.normalize();
            
            if (bot.position.distanceTo(target) > 3) {
                bot.position.addScaledVector(move, 0.08);
            }
        }
    });
}

// ==================== GRANADAS ====================
class Grenade {
    constructor(pos, dir, type, power) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({ color: type === 'HE' ? 0x00ff00 : 0xffffff })
        );
        this.mesh.position.copy(pos);
        this.type = type;
        
        const speed = 8 * (0.5 + power * 1.5);
        this.velocity = dir.clone().multiplyScalar(speed);
        this.velocity.y += 5;
        
        this.time = Date.now();
        this.fuse = 3000;
        this.exploded = false;
        
        scene.add(this.mesh);
    }
    
    update() {
        if (this.exploded) return false;
        
        this.velocity.y -= 0.4;
        this.mesh.position.add(this.velocity.clone().multiplyScalar(0.08));
        
        if (this.mesh.position.y < 14) {
            this.mesh.position.y = 14;
            this.velocity.y *= -0.3;
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }
        
        if (Date.now() - this.time > this.fuse) {
            this.explode();
            return false;
        }
        
        return true;
    }
    
    explode() {
        this.exploded = true;
        playSound('explode');
        
        const pos = this.mesh.position;
        
        for (let i = 0; i < 15; i++) {
            createImpactParticles(pos.clone().add(
                new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4)
            ));
        }
        
        if (this.type === 'HE') {
            bots.forEach(bot => {
                if (bot.position.distanceTo(pos) < 10) {
                    bot.userData.health -= 60;
                    if (bot.userData.health <= 0) handleKill(bot);
                }
            });
            
            if (camera.position.distanceTo(pos) < 10) {
                takeDamage(40);
            }
        }
        
        setTimeout(() => scene.remove(this.mesh), 500);
    }
}

function throwGrenade(power = 0.5) {
    if (isFrozen || isDead) return;
    if (playerGrenades[selectedGrenadeType] <= 0) return;
    
    playerGrenades[selectedGrenadeType]--;
    
    const pos = camera.position.clone();
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    pos.add(dir.clone().multiplyScalar(1.5));
    
    const g = new Grenade(pos, dir, selectedGrenadeType, power);
    grenades.push(g);
    updateGrenadeIndicator();
}

// ==================== PARTICULAS ====================
function createImpactParticles(pos) {
    const count = 10;
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const vels = [];
    
    for (let i = 0; i < count; i++) {
        positions.push(pos.x, pos.y, pos.z);
        vels.push((Math.random() - 0.5) * 4, Math.random() * 5, (Math.random() - 0.5) * 4);
    }
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.2, transparent: true, opacity: 1 });
    const sys = new THREE.Points(geom, mat);
    sys.userData = { vels, time: Date.now() };
    scene.add(sys);
    particleSystems.push(sys);
}

function updateParticles(delta) {
    for (let i = particleSystems.length - 1; i >= 0; i--) {
        const sys = particleSystems[i];
        if (Date.now() - sys.userData.time > 500) {
            scene.remove(sys);
            particleSystems.splice(i, 1);
            continue;
        }
        
        const attr = sys.geometry.attributes.position;
        const v = sys.userData.vels;
        for (let j = 0; j < attr.count; j++) {
            attr.setXYZ(j,
                attr.getX(j) + v[j * 3] * delta,
                attr.getY(j) + v[j * 3 + 1] * delta - 9.8 * delta,
                attr.getZ(j) + v[j * 3 + 2] * delta
            );
        }
        attr.needsUpdate = true;
        sys.material.opacity -= delta;
    }
}

// ==================== CONTINUA NA PARTE 3 ====================
// ==================== HUD ====================
function updateHUD() {
    const moneyEl = document.getElementById('hud-money');
    const weaponEl = document.getElementById('hud-weapon');
    const hpEl = document.getElementById('hud-hp');
    
    if (moneyEl) moneyEl.textContent = '$' + money;
    if (hpEl) hpEl.textContent = playerHP + ' HP';
    
    if (currentSlot === 4) {
        if (weaponEl) weaponEl.textContent = 'GRANADA [' + selectedGrenadeType + ']';
    } else if (currentSlot === 5) {
        if (weaponEl) weaponEl.textContent = hasBomb ? 'C4 [DISPONIVEL]' : 'C4 [PLANTADA]';
    } else if (currentWeapon) {
        if (weaponEl) weaponEl.textContent = currentWeapon.name + ' [' + currentWeapon.ammo + '/' + currentWeapon.reserveAmmo + ']';
    }
    
    updateHealthBars();
    updateWeaponSlots();
    updateGrenadeIndicator();
}

function updateHealthBars() {
    const hBar = document.getElementById('health-bar');
    const hText = document.getElementById('health-text');
    const aBar = document.getElementById('armor-bar');
    const aText = document.getElementById('armor-text');
    
    if (hBar) hBar.style.width = playerHP + '%';
    if (hText) hText.textContent = playerHP;
    if (aBar) aBar.style.width = playerArmor + '%';
    if (aText) aText.textContent = playerArmor;
}

function updateWeaponSlots() {
    const container = document.getElementById('weapon-slots');
    if (!container) return;
    
    const slots = [
        { key: 1, w: weaponSlots[1], label: '1' },
        { key: 2, w: weaponSlots[2], label: '2' },
        { key: 3, w: weaponSlots[3], label: '3' },
        { key: 4, label: '4', special: 'GREN' },
        { key: 5, label: '5', special: 'C4' }
    ];
    
    container.innerHTML = slots.map(s => {
        const active = currentSlot === s.key;
        let name = '';
        if (s.key === 4) name = 'GREN';
        else if (s.key === 5) name = hasBomb ? 'C4' : '---';
        else if (s.w) name = s.w.name.substring(0, 4).toUpperCase();
        else name = '---';
        
        return '<div class="slot' + (active ? ' active' : '') + '">[' + s.label + '] ' + name + '</div>';
    }).join('');
}

function updateGrenadeIndicator() {
    const spans = document.querySelectorAll('#grenade-indicator span');
    if (spans.length >= 3) {
        spans[0].textContent = 'HE: ' + playerGrenades.HE;
        spans[1].textContent = 'FLASH: ' + playerGrenades.FLASH;
        spans[2].textContent = 'SMOKE: ' + playerGrenades.SMOKE;
    }
}

function updateRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;
    
    const rankings = [{ name: currentPlayer?.name || 'VOCE', kills: playerStats.kills, you: true }];
    
    bots.forEach(b => {
        rankings.push({ name: b.userData.name, kills: Math.floor(Math.random() * 15), you: false });
    });
    
    rankings.sort((a, b) => b.kills - a.kills);
    
    list.innerHTML = rankings.slice(0, 8).map((r, i) => {
        const prefix = i === 0 ? '1.' : i === 1 ? '2.' : i === 2 ? '3.' : (i + 1) + '.';
        return '<div class="rank-item' + (r.you ? ' you' : '') + '"><span>' + prefix + ' ' + r.name + '</span><span>' + r.kills + '</span></div>';
    }).join('');
}

function toggleRanking() {
    const list = document.getElementById('ranking-list');
    const btn = document.querySelector('#ranking-header button');
    if (list.style.display === 'none') {
        list.style.display = 'block';
        if (btn) btn.textContent = '-';
    } else {
        list.style.display = 'none';
        if (btn) btn.textContent = '+';
    }
}

// ==================== CHAT ====================
function addChatMessage(sender, msg, type) {
    const box = document.getElementById('chat-box');
    if (!box) return;
    
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (type || 'player');
    div.textContent = sender + ': ' + msg;
    box.appendChild(div);
    
    while (box.children.length > 30) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
}

function addKillFeed(killer, victim) {
    const feed = document.getElementById('killfeed');
    if (!feed) return;
    
    const div = document.createElement('div');
    div.className = 'kill-entry';
    div.textContent = killer + ' ' + victim;
    feed.appendChild(div);
    
    setTimeout(() => div.remove(), 3000);
    
    while (feed.children.length > 4) feed.removeChild(feed.firstChild);
}

function toggleChat() {
    isChatOpen = !isChatOpen;
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    
    if (isChatOpen) {
        if (box) box.style.display = 'flex';
        if (input) { input.style.display = 'block'; input.focus(); }
        if (isLocked) controls.unlock();
    } else {
        if (box) box.style.display = 'none';
        if (input) { input.style.display = 'none'; input.value = ''; }
        if (!isLocked) controls.lock();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) { toggleChat(); return; }
    
    if (msg.startsWith('/') && adminMode) {
        processCommand(msg);
    } else {
        addChatMessage(currentPlayer?.name || 'Player', msg, 'player');
    }
    
    input.value = '';
    toggleChat();
}

// ==================== COMANDOS ADMIN ====================
function processCommand(msg) {
    const parts = msg.substring(1).split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (!adminMode) return;
    
    switch(cmd) {
        case 'god':
            godMode = !godMode;
            addAdminLog('/god ' + (godMode ? 'ON' : 'OFF'));
            break;
        case 'fly':
            isFlyMode = !isFlyMode;
            break;
        case 'kick':
            if (args[0]) {
                const bot = bots.find(b => b.userData.name.toLowerCase() === args[0].toLowerCase());
                if (bot) { scene.remove(bot); bots = bots.filter(b => b !== bot); }
                addAdminLog('/kick ' + args[0]);
            }
            break;
        case 'ban':
            if (args[0] && args[1]) {
                const days = args[1] === 'perm' ? 0 : parseInt(args[1]);
                bannedPlayers[args[0].toLowerCase()] = {
                    name: args[0],
                    days: days,
                    time: days > 0 ? Date.now() + days * 86400000 : 0
                };
                localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
                addAdminLog('/ban ' + args[0] + ' ' + args[1]);
                addChatMessage('SISTEMA', args[0] + ' banido', 'system');
            }
            break;
        case 'unban':
            if (args[0]) {
                delete bannedPlayers[args[0].toLowerCase()];
                localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
                addAdminLog('/unban ' + args[0]);
            }
            break;
        case 'give':
            if (args[0] === 'money') money += parseInt(args[1]) || 1000;
            if (args[0] === 'hp') playerHP = Math.min(playerHP + 50, 100);
            if (args[0] === 'ak47') { weaponSlots[1] = { name: "AK-47", damage: 35, recoil: 0.05, fireRate: 120, type: "Rifle", ammo: 30, maxAmmo: 30, reserveAmmo: 90, reloadTime: 2500 }; currentWeapon = weaponSlots[1]; currentSlot = 1; }
            if (args[0] === 'awp') { weaponSlots[1] = { name: "AWP", damage: 115, recoil: 0.20, fireRate: 1000, type: "Sniper", ammo: 10, maxAmmo: 10, reserveAmmo: 30, reloadTime: 3000 }; currentWeapon = weaponSlots[1]; currentSlot = 1; }
            addAdminLog('/give ' + args.join(' '));
            break;
        case 'zumbi':
        case 'zombie':
            bots.forEach(b => { b.userData.health = 200; b.children.forEach(c => { if (c.material && c.material.color) c.material.color.setHex(0x00ff00); }); });
            addChatMessage('SISTEMA', 'Modo Zumbi ativado', 'system');
            addAdminLog('/zumbi');
            break;
        case 'wall':
            wallhackActive = !wallhackActive;
            if (wallhackActive) {
                mapColliders.forEach(c => { if (c.material) { c.material.transparent = true; c.material.opacity = 0.15; } });
            } else {
                mapColliders.forEach(c => { if (c.material) { c.material.transparent = false; c.material.opacity = 1; } });
            }
            addAdminLog('/wall ' + (wallhackActive ? 'ON' : 'OFF'));
            break;
        case 'dance':
            bots.forEach(b => {
                const origY = b.position.y;
                let jumps = 0;
                const int = setInterval(() => {
                    if (jumps >= 5) { clearInterval(int); b.position.y = origY; return; }
                    b.position.y = origY + Math.abs(Math.sin(jumps * 2)) * 2;
                    jumps++;
                }, 200);
            });
            addAdminLog('/dance');
            break;
        case 'admin':
            if (args[0] === 'criar' && currentPlayer?.type === 'dev') {
                const admins = JSON.parse(localStorage.getItem('dust2_admins') || '{}');
                admins[args[1].toLowerCase()] = { name: args[1], password: args[2], expires: args[3] ? Date.now() + parseInt(args[3]) * 86400000 : 0 };
                localStorage.setItem('dust2_admins', JSON.stringify(admins));
                addChatMessage('SISTEMA', 'Admin ' + args[1] + ' criado', 'system');
                addAdminLog('/admin criar ' + args[1]);
            }
            break;
        case 'help':
            addChatMessage('COMANDOS', 'god fly kick ban give zumbi wall dance', 'system');
            break;
    }
    
    updateHUD();
}

function addAdminLog(action) {
    adminLogs.push({ time: new Date().toLocaleTimeString(), action: action });
    const logContent = document.getElementById('log-content');
    if (logContent) {
        logContent.innerHTML = adminLogs.slice(-30).map(l => '<div>' + l.time + ' - ' + l.action + '</div>').join('');
    }
}

// ==================== BOMBA ====================
function plantBomb() {
    if (!hasBomb || bombPlanted || isFrozen || isDead) return;
    
    bombPlanted = true;
    hasBomb = false;
    weaponSlots[5].hasBomb = false;
    playerStats.bombsPlanted++;
    
    addKillFeed("C4 PLANTADA", "");
    playSound('beep');
    
    let seconds = 40;
    bombTimer = setInterval(() => {
        seconds--;
        if (seconds <= 10 && seconds > 0) playSound('beep');
        if (seconds <= 0) {
            clearInterval(bombTimer);
            explodeBomb();
        }
    }, 1000);
    
    updateHUD();
}

function explodeBomb() {
    bombPlanted = false;
    playSound('explode');
    scoreT++;
    document.getElementById('score-t').textContent = scoreT;
    addKillFeed("BOMBA EXPLODIU", "TR VENCE");
    setTimeout(() => nextRound(), 3000);
}

function checkRoundEnd() {
    if (bots.length === 0) {
        if (bombTimer) clearInterval(bombTimer);
        scoreCT++;
        document.getElementById('score-ct').textContent = scoreCT;
        addKillFeed("TODOS ELIMINADOS", "CT VENCE");
        setTimeout(() => nextRound(), 3000);
    }
}

function nextRound() {
    bombPlanted = false;
    hasBomb = true;
    weaponSlots[5].hasBomb = true;
    round++;
    document.getElementById('hud-round').textContent = round;
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    createBots();
    money += 3200;
    playerHP = 100;
    playerArmor = 0;
    isDead = false;
    killStreak = 0;
    if (currentWeapon && currentSlot <= 3) currentWeapon.ammo = currentWeapon.maxAmmo;
    updateHUD();
    startFreezeTime();
}

// ==================== CONTINUA NA PARTE 4 ====================
// ==================== MOVIMENTAÇÃO ====================
function onMouseDown(e) {
    if (!isLocked || isChatOpen || isDead) return;
    
    if (e.button === 0) {
        e.preventDefault();
        if (!isReloading) shoot();
    }
    if (e.button === 2) {
        e.preventDefault();
        cycleGrenade();
    }
    if (e.button === 1) {
        e.preventDefault();
        throwGrenade(0.5);
    }
}

function onMouseUp(e) {
    if (e.button === 0 && isHoldingGrenade) {
        e.preventDefault();
        releaseGrenade();
    }
}

function onKeyDown(e) {
    if (e.key === 'F1') { e.preventDefault(); toggleSettings(); return; }
    if (e.key === 'F2' && adminMode) { e.preventDefault(); showAdminLog(); return; }
    if (e.key === 'F3' && adminMode) { e.preventDefault(); showSecretChat(); return; }
    if (e.key === 'F12') { e.preventDefault(); detectTamper(); return; }
    
    if ((e.key === 't' || e.key === 'T') && !isChatOpen && currentPlayer?.type !== 'guest') {
        e.preventDefault();
        toggleChat();
        return;
    }
    
    if (e.key === 'Escape') {
        if (isChatOpen) { toggleChat(); return; }
        toggleSettings();
        return;
    }
    
    if (isChatOpen) {
        if (e.key === 'Enter') { e.preventDefault(); sendChatMessage(); }
        return;
    }
    
    if (isDead) return;
    
    if (e.key >= '1' && e.key <= '5') { e.preventDefault(); switchWeapon(parseInt(e.key)); return; }
    if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); quickSwitch(); return; }
    
    if (e.key === 'z' || e.key === 'Z') { sendRadio('gogo'); return; }
    if (e.key === 'x' || e.key === 'X') { sendRadio('enemy'); return; }
    if (e.key === 'c' || e.key === 'C') { sendRadio('help'); return; }
    
    if (!isFrozen) {
        switch(e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': isWalkingSilently = true; break;
            case 'Space': if (canJump || isFlyMode) { velocity.y += isFlyMode ? 300 : 100; canJump = false; } break;
            case 'KeyR': reloadWeapon(); break;
            case 'KeyG': throwGrenade(0.7); break;
            case 'KeyB': toggleBuyMenu(); break;
        }
    }
    
    if ((e.key === 'f' || e.key === 'F') && hasBomb && !bombPlanted && !isFrozen && !isDead) {
        if (camera.position.distanceTo(CHECKPOINTS.BOMB_A) < 20 || camera.position.distanceTo(CHECKPOINTS.BOMB_B) < 20) {
            plantBomb();
        }
    }
}

function onKeyUp(e) {
    switch(e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyD': moveRight = false; break;
        case 'ShiftLeft': isWalkingSilently = false; break;
    }
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function sendRadio(type) {
    if (!radioEnabled || currentPlayer?.type === 'guest') return;
    const msgs = { gogo: 'GO GO GO!', enemy: 'INIMIGO AVISTADO!', help: 'PRECISO DE AJUDA!' };
    addChatMessage(currentPlayer?.name || 'Player', msgs[type] || type, 'radio');
    playSound('radio');
}

function switchWeapon(slot) {
    if (isSwitchingWeapon || isDead || slot === currentSlot) return;
    if (slot < 1 || slot > 5) return;
    
    isSwitchingWeapon = true;
    if (isReloading) { isReloading = false; document.getElementById('reload-indicator').style.display = 'none'; }
    
    setTimeout(() => {
        currentSlot = slot;
        if (slot <= 3) currentWeapon = weaponSlots[slot];
        else currentWeapon = null;
        sprayCounter = 0;
        isSwitchingWeapon = false;
        updateHUD();
        playSound('beep');
    }, 200);
}

function quickSwitch() {
    if (currentSlot >= 4) switchWeapon(1);
    else switchWeapon(currentSlot === 1 ? 2 : 1);
}

function reloadWeapon() {
    if (isReloading || isDead || isSwitchingWeapon || currentSlot >= 3) return;
    if (!currentWeapon || currentWeapon.ammo >= currentWeapon.maxAmmo) return;
    if (currentWeapon.reserveAmmo <= 0) return;
    
    isReloading = true;
    document.getElementById('reload-indicator').style.display = 'block';
    
    setTimeout(() => {
        const need = currentWeapon.maxAmmo - currentWeapon.ammo;
        const avail = Math.min(need, currentWeapon.reserveAmmo);
        currentWeapon.ammo += avail;
        currentWeapon.reserveAmmo -= avail;
        isReloading = false;
        document.getElementById('reload-indicator').style.display = 'none';
        updateHUD();
    }, currentWeapon.reloadTime || 2500);
}

// ==================== GRANADA SEGURANDO ====================
function cycleGrenade() {
    const types = ['HE', 'FLASH', 'SMOKE', 'MOLOTOV'];
    const avail = types.filter(t => playerGrenades[t] > 0);
    if (avail.length === 0) return;
    const idx = avail.indexOf(selectedGrenadeType);
    selectedGrenadeType = avail[(idx + 1) % avail.length];
    updateGrenadeIndicator();
}

function releaseGrenade() {
    if (!isHoldingGrenade) return;
    isHoldingGrenade = false;
    if (grenadeThrowPower < 0.1) grenadeThrowPower = 0.1;
    throwGrenade(grenadeThrowPower);
    document.getElementById('grenade-power-indicator').style.display = 'none';
}

// ==================== CONFIGURAÇÕES ====================
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    const open = panel.style.display === 'block';
    panel.style.display = open ? 'none' : 'block';
    if (open && !isChatOpen) controls.lock();
    else controls.unlock();
}

function showSettings() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('settings-panel').style.display = 'block';
    controls.unlock();
}

// ==================== ADMIN PAINEL ====================
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function showAdminLog() {
    const log = document.getElementById('admin-log');
    if (log) log.style.display = log.style.display === 'block' ? 'none' : 'block';
    updateAdminLogDisplay();
}

function updateAdminLogDisplay() {
    const content = document.getElementById('log-content');
    if (content) content.innerHTML = adminLogs.slice(-30).map(l => '<div>' + l.time + ' - ' + l.action + '</div>').join('');
}

function clearAdminLog() {
    adminLogs = [];
    updateAdminLogDisplay();
}

function showSecretChat() {
    const chat = document.getElementById('secret-chat');
    if (chat) chat.style.display = chat.style.display === 'block' ? 'none' : 'block';
}

function sendSecretMessage() {
    const input = document.getElementById('secret-chat-input');
    const content = document.getElementById('secret-chat-content');
    if (input && content && input.value.trim()) {
        const div = document.createElement('div');
        div.textContent = '[' + new Date().toLocaleTimeString() + '] ' + input.value;
        content.appendChild(div);
        input.value = '';
    }
}

function showCreateRoom() {
    document.getElementById('create-room-form').style.display = 'block';
}

function hideCreateRoom() {
    document.getElementById('create-room-form').style.display = 'none';
}

function createRoom() {
    showCreateRoom();
}

function confirmCreateRoom() {
    const code = document.getElementById('room-code-create').value.trim();
    const mode = document.getElementById('room-mode-create').value;
    const bots = document.getElementById('room-bots-create').value;
    if (code) {
        sessionStorage.setItem('roomCode', code);
        sessionStorage.setItem('gameMode', mode);
        sessionStorage.setItem('botCount', bots);
        addChatMessage('SISTEMA', 'Sala ' + code + ' criada', 'system');
        addAdminLog('Sala criada: ' + code);
    }
    hideCreateRoom();
    startGame();
}

function joinRoom() {
    const code = prompt('DIGITE O CODIGO DA SALA:');
    if (code) {
        sessionStorage.setItem('roomCode', code);
        startGame();
    }
}

function showProfile() {
    alert('PERFIL\n\nKills: ' + playerStats.kills + '\nDeaths: ' + playerStats.deaths + '\nHeadshots: ' + playerStats.headshots + '\nMVPs: ' + playerStats.mvps);
}

function showBotsMenu() {
    const count = prompt('QUANTOS BOTS? (0-20):', '5');
    if (count !== null) {
        sessionStorage.setItem('botCount', count);
        alert('BOTS: ' + count + ' (proxima partida)');
    }
}

function showBanMenu() {
    const list = Object.values(bannedPlayers).map(b => b.name + ' (' + (b.days === 0 ? 'PERM' : b.days + 'd') + ')').join('\n');
    alert('BANIDOS:\n' + (list || 'NENHUM'));
}

function showAdminsMenu() {
    const admins = JSON.parse(localStorage.getItem('dust2_admins') || '{}');
    const list = Object.values(admins).map(a => a.name).join('\n');
    alert('ADMINS:\n' + (list || 'NENHUM'));
}

function showStats() {
    alert('ESTATISTICAS GLOBAIS\n\nJogadores: ' + (Object.keys(JSON.parse(localStorage.getItem('dust2_users') || '{}')).length) + '\nBanidos: ' + Object.keys(bannedPlayers).length);
}

// ==================== LOGIN ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('player-form').style.display = tab === 'player' ? 'flex' : 'none';
    document.getElementById('guest-form').style.display = tab === 'guest' ? 'flex' : 'none';
    document.getElementById('admin-form').style.display = tab === 'admin' ? 'flex' : 'none';
}

function showRegister() {
    document.getElementById('login-step-1').style.display = 'none';
    document.getElementById('register-step').style.display = 'block';
}

function showLogin() {
    document.getElementById('login-step-1').style.display = 'block';
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('verify-step').style.display = 'none';
    document.getElementById('forgot-step').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-step-1').style.display = 'none';
    document.getElementById('forgot-step').style.display = 'block';
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); }
}

function showSuccess(msg) {
    const el = document.getElementById('login-success');
    if (el) { el.textContent = msg; el.style.display = 'block'; setTimeout(() => el.style.display = 'none', 3000); }
}

function registerPlayer() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const conf = document.getElementById('reg-confirm').value;
    
    if (!name || !email || !pass) { showError('PREENCHA TODOS OS CAMPOS'); return; }
    if (pass !== conf) { showError('SENHAS NAO CONFEREM'); return; }
    if (pass.length < 6) { showError('SENHA MINIMO 6 CARACTERES'); return; }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    if (users[name.toLowerCase()]) { showError('NOME JA EM USO'); return; }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('pending', JSON.stringify({ name, email, pass, code }));
    
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('verify-step').style.display = 'block';
    document.getElementById('verify-email-display').textContent = email;
    console.log('CODIGO: ' + code);
    showSuccess('CODIGO ENVIADO (VER CONSOLE)');
}

function verifyEmail() {
    const code = document.getElementById('verify-code').value.trim();
    const pending = JSON.parse(sessionStorage.getItem('pending'));
    
    if (!pending) { showError('SESSAO EXPIRADA'); showLogin(); return; }
    if (code !== pending.code) { showError('CODIGO INCORRETO'); return; }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    users[pending.name.toLowerCase()] = { name: pending.name, email: pending.email, password: btoa(pending.pass), createdAt: Date.now() };
    localStorage.setItem('dust2_users', JSON.stringify(users));
    sessionStorage.removeItem('pending');
    
    showSuccess('CONTA CRIADA!');
    setTimeout(showLogin, 1500);
}

function loginPlayer() {
    const email = document.getElementById('player-email').value.trim();
    const pass = document.getElementById('player-password').value;
    
    if (!email || !pass) { showError('PREENCHA EMAIL E SENHA'); return; }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) { showError('EMAIL NAO ENCONTRADO'); return; }
    if (btoa(pass) !== user.password && pass !== user.password) { showError('SENHA INCORRETA'); return; }
    
    if (bannedPlayers[user.name.toLowerCase()]) {
        const ban = bannedPlayers[user.name.toLowerCase()];
        if (ban.days === 0 || Date.now() < ban.time) { showError('CONTA BANIDA'); return; }
    }
    
    currentPlayer = { name: user.name, email: user.email, type: 'player' };
    playerStats = { kills: 0, deaths: 0, headshots: 0, knifes: 0, bombsPlanted: 0, bombsDefused: 0, mvps: 0 };
    
    showMenu('player');
}

function loginGuest() {
    const diff = document.getElementById('guest-difficulty').value;
    sessionStorage.setItem('difficulty', diff);
    
    const names = ['Convidado_Alpha', 'Convidado_Bravo', 'Convidado_Charlie'];
    currentPlayer = { name: names[Math.floor(Math.random() * 3)] + '_' + Math.floor(Math.random() * 100), type: 'guest' };
    playerStats = { kills: 0, deaths: 0, headshots: 0, knifes: 0, bombsPlanted: 0, bombsDefused: 0, mvps: 0 };
    
    showMenu('guest');
}

function loginAdmin() {
    const pass = document.getElementById('admin-password').value;
    
    if (pass === 'BiteloeOlina') {
        currentPlayer = { name: 'DESENVOLVEDOR', type: 'dev' };
        adminMode = true;
        showMenu('admin');
    } else {
        const admins = JSON.parse(localStorage.getItem('dust2_admins') || '{}');
        const admin = Object.values(admins).find(a => a.password === pass);
        if (admin) {
            if (admin.expires && Date.now() > admin.expires) { showError('ADMIN EXPIRADO'); return; }
            currentPlayer = { name: admin.name, type: 'admin' };
            adminMode = true;
            showMenu('admin');
        } else {
            showError('SENHA INCORRETA');
        }
    }
}

function forgotPassword() {
    const email = document.getElementById('forgot-email').value.trim();
    if (!email) { showError('DIGITE SEU EMAIL'); return; }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('resetCode', code);
    sessionStorage.setItem('resetEmail', email);
    console.log('CODIGO RECUPERACAO: ' + code);
    
    document.getElementById('reset-section').style.display = 'block';
    showSuccess('CODIGO ENVIADO (VER CONSOLE)');
}

function resetPassword() {
    const code = document.getElementById('reset-code').value.trim();
    const pass = document.getElementById('reset-password').value;
    const savedCode = sessionStorage.getItem('resetCode');
    const email = sessionStorage.getItem('resetEmail');
    
    if (code !== savedCode) { showError('CODIGO INCORRETO'); return; }
    if (!pass || pass.length < 6) { showError('SENHA MINIMO 6'); return; }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    const key = Object.keys(users).find(k => users[k].email === email);
    if (key) {
        users[key].password = btoa(pass);
        localStorage.setItem('dust2_users', JSON.stringify(users));
        showSuccess('SENHA ALTERADA!');
        setTimeout(showLogin, 1500);
    }
}

function showMenu(type) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
    
    document.getElementById('admin-menu').style.display = type === 'admin' || type === 'dev' ? 'block' : 'none';
    document.getElementById('player-menu').style.display = type === 'player' ? 'block' : 'none';
    document.getElementById('guest-menu').style.display = type === 'guest' ? 'block' : 'none';
    
    if (type === 'admin' || type === 'dev') document.getElementById('admin-name-display').textContent = currentPlayer.name;
    if (type === 'player') {
        document.getElementById('player-name-display').textContent = currentPlayer.name;
        document.getElementById('player-rank-display').textContent = 'TROFEU PRATA I';
    }
    if (type === 'guest') document.getElementById('guest-name-display').textContent = currentPlayer.name;
}

function logout() {
    currentPlayer = null;
    adminMode = false;
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    showLogin();
}

function startGame() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    if (!scene) init();
}

// ==================== BUY MENU ====================
function toggleBuyMenu() {
    const menu = document.getElementById('buy-menu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function createBuyMenu() {
    const menu = document.getElementById('buy-menu');
    if (!menu) return;
    
    let html = '<h3>MERCADO (B para fechar)</h3>';
    
    for (const cat in weaponShop) {
        html += '<b>' + cat.toUpperCase() + '</b><br>';
        weaponShop[cat].forEach(item => {
            html += '<button onclick="buyItem(\'' + item.name + '\',' + item.price + ',\'' + cat + '\')" style="margin:2px;padding:4px 8px;font-size:10px;">' + item.name + ' $' + item.price + '</button>';
        });
        html += '<br><br>';
    }
    
    menu.innerHTML = html;
}

function buyItem(name, price, category) {
    if (money < price) { addKillFeed("SEM DINHEIRO", ""); return; }
    money -= price;
    
    const item = weaponShop[category].find(i => i.name === name);
    if (!item) return;
    
    if (item.type === 'Pistol') {
        weaponSlots[2] = { ...item };
        if (currentSlot === 2) currentWeapon = weaponSlots[2];
    } else if (item.name === 'Faca') {
        weaponSlots[3] = { ...item };
    } else if (item.type === 'Grenade') {
        if (item.name.includes('HE')) playerGrenades.HE = Math.min(playerGrenades.HE + 1, 5);
        if (item.name.includes('Flash')) playerGrenades.FLASH = Math.min(playerGrenades.FLASH + 1, 3);
        if (item.name.includes('Smoke')) playerGrenades.SMOKE = Math.min(playerGrenades.SMOKE + 1, 3);
    } else if (item.name === 'Colete') {
        playerArmor = 100;
    } else if (item.name === 'Capacete') {
        hasHelmet = true;
    } else {
        weaponSlots[1] = { ...item };
        if (currentSlot === 1 || !currentWeapon) { currentWeapon = weaponSlots[1]; currentSlot = 1; }
    }
    
    updateHUD();
}

// ==================== ANTI-TRAPAÇA ====================
function detectTamper() {
    tamperAttempts++;
    if (currentPlayer && currentPlayer.type !== 'dev') {
        if (tamperAttempts >= 3) {
            bannedPlayers[currentPlayer.name.toLowerCase()] = {
                name: currentPlayer.name,
                days: 31,
                time: Date.now() + 31 * 86400000
            };
            localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
            alert('BANIDO POR 31 DIAS - TRAPACA DETECTADA');
            logout();
        }
    }
}

// ==================== FREEZE TIME ====================
function startFreezeTime() {
    isFrozen = true;
    addKillFeed("FREEZE TIME", "COMPRE ARMAS");
    setTimeout(() => {
        isFrozen = false;
        addKillFeed("VALENDO", "");
    }, 5000);
}

// ==================== GAME LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;
    
    updateParticles(delta);
    grenades = grenades.filter(g => g.update());
    
    if (!isDead && isLocked) {
        velocity.x -= velocity.x * 10 * delta;
        velocity.z -= velocity.z * 10 * delta;
        
        if (isFlyMode) {
            velocity.y -= velocity.y * 10 * delta;
        } else {
            velocity.y -= 9.8 * 30 * delta;
        }
        
        const speed = isWalkingSilently ? 180 : 400;
        
        if (moveForward || moveBackward || moveLeft || moveRight) {
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();
            
            if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;
        }
        
        const oldPos = camera.position.clone();
        
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        if (isFlyMode) {
            camera.position.y += velocity.y * delta;
        } else {
            controls.getObject().position.y += velocity.y * delta;
        }
        
        if (!isFlyMode) {
            const ray = new THREE.Raycaster(oldPos, direction, 0, 3);
            const hits = ray.intersectObjects(mapColliders, true);
            if (hits.length > 0) {
                camera.position.x = oldPos.x;
                camera.position.z = oldPos.z;
            }
            
            if (controls.getObject().position.y < 14) {
                velocity.y = 0;
                controls.getObject().position.y = 14;
                canJump = true;
            }
        }
    }
    
    botAI();
    
    if (camera.rotation.x < 0) camera.rotation.x *= 0.9;
    
    updateRanking();
    
    const debug = document.getElementById('pos-debug');
    if (debug) {
        debug.textContent = 'X:' + camera.position.x.toFixed(1) + ' Y:' + camera.position.y.toFixed(1) + ' Z:' + camera.position.z.toFixed(1);
    }
    
    renderer.render(scene, camera);
}

// ==================== FIM ====================
console.log('DUST 2 FPS - MOTOR CORRIGIDO CARREGADO');
console.log('Senha Dev: BiteloeOlina');
console.log('Comandos: /god /fly /kick /ban /give /zumbi /wall /dance');
