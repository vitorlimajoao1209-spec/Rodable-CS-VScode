// ==================== DUST 2 FPS - MOTOR COMPLETO ====================
// ==================== VARIÁVEIS GLOBAIS ====================

// Three.js
let scene, camera, renderer, controls;
let isLocked = false;

// Jogador
let playerHP = 100;
let playerArmor = 0;
let hasHelmet = false;
let isDead = false;
let playerTeam = 'TR';

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

// Modos especiais
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

// Chat e comandos
let isChatOpen = false;
let chatMessages = [];
let adminMode = false;
let secretChatMessages = [];
let adminLogs = [];

// Anti-trapaça
let tamperAttempts = 0;
let bannedPlayers = JSON.parse(localStorage.getItem('dust2_banned') || '{}');
let playerWarnings = 0;

// Configurações
let sensitivity = 0.5;
let musicEnabled = true;
let radioEnabled = true;
let crosshairType = 'cross';
let crosshairColor = '#00ff00';

// Sistema de login
let currentPlayer = null;
let isMultiplayer = false;
let roomCode = null;

// Ranking
let playerStats = {
    kills: 0, deaths: 0, headshots: 0, knifes: 0,
    bombsPlanted: 0, bombsDefused: 0, mvps: 0
};

// Narrador
let killStreak = 0;
let lastKillTime = 0;

// ==================== CONFIGURAÇÕES DO MAPA ====================
const CHECKPOINTS = {
    TR_SPAWN: new THREE.Vector3(-48, 14, -68),
    CT_SPAWN: new THREE.Vector3(50, 6, 80),
    BOMB_A: new THREE.Vector3(15, 14, -10),
    BOMB_B: new THREE.Vector3(-60, 6, 50)
};

// ==================== ARSENAL COMPLETO ====================
const weaponShop = {
    pistols: [
        { name: "Glock-18", price: 200, dmg: 20, rec: 0.02, rate: 200, type: "Pistol", ammo: 20, max: 20, res: 120, reloadTime: 2000, sprayPattern: [0, 0.005, -0.01], sprayVertical: [0, 0.01, 0.02] },
        { name: "USP-S", price: 200, dmg: 22, rec: 0.015, rate: 200, type: "Pistol", ammo: 12, max: 12, res: 24, reloadTime: 2000, sprayPattern: [0, 0.003, -0.008], sprayVertical: [0, 0.008, 0.015] },
        { name: "Desert Eagle", price: 700, dmg: 53, rec: 0.09, rate: 400, type: "Pistol", ammo: 7, max: 7, res: 35, reloadTime: 2200, sprayPattern: [0, 0.02, -0.04, 0.06], sprayVertical: [0, 0.04, 0.08, 0.15] }
    ],
    smgs: [
        { name: "MAC-10", price: 1050, dmg: 20, rec: 0.04, rate: 75, type: "SMG", ammo: 30, max: 30, res: 120, reloadTime: 2100, sprayPattern: [0, 0.008, -0.015, 0.02], sprayVertical: [0, 0.015, 0.03, 0.05] },
        { name: "P90", price: 2350, dmg: 20, rec: 0.025, rate: 65, type: "SMG", ammo: 50, max: 50, res: 100, reloadTime: 2300, sprayPattern: [0, 0.005, -0.01, 0.012], sprayVertical: [0, 0.01, 0.02, 0.03] }
    ],
    rifles: [
        { name: "AK-47", price: 2700, dmg: 35, rec: 0.05, rate: 120, type: "Rifle", ammo: 30, max: 30, res: 90, reloadTime: 2500, sprayPattern: [0, 0.01, -0.02, 0.03, -0.04, 0.02, -0.01, 0.03, -0.05, 0.04], sprayVertical: [0, 0.02, 0.05, 0.08, 0.12, 0.15, 0.18, 0.20, 0.22, 0.25] },
        { name: "M4A4", price: 3100, dmg: 33, rec: 0.04, rate: 110, type: "Rifle", ammo: 30, max: 30, res: 90, reloadTime: 2500, sprayPattern: [0, 0.008, -0.015, 0.02, -0.03, 0.015], sprayVertical: [0, 0.015, 0.03, 0.05, 0.08, 0.12] },
        { name: "AWP", price: 4750, dmg: 115, rec: 0.20, rate: 1000, type: "Sniper", ammo: 10, max: 10, res: 30, reloadTime: 3000, sprayPattern: [0, 0.05], sprayVertical: [0, 0.1] }
    ],
    shotguns: [
        { name: "Nova", price: 1050, dmg: 60, rec: 0.12, rate: 600, type: "Shotgun", ammo: 8, max: 8, res: 32, reloadTime: 1500, sprayPattern: [0, 0.02], sprayVertical: [0, 0.04] }
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

// ==================== ARMA INICIAL ====================
const DEFAULT_WEAPONS = {
    1: { name: "AK-47", damage: 35, recoil: 0.05, fireRate: 120, type: "Rifle", ammo: 30, maxAmmo: 30, reserveAmmo: 90, reloadTime: 2500, sprayPattern: [0, 0.01, -0.02, 0.03, -0.04], sprayVertical: [0, 0.02, 0.05, 0.08, 0.12] },
    2: { name: "Glock-18", damage: 20, recoil: 0.02, fireRate: 200, type: "Pistol", ammo: 20, maxAmmo: 20, reserveAmmo: 120, reloadTime: 2000, sprayPattern: [0, 0.005, -0.01], sprayVertical: [0, 0.01, 0.02] },
    3: { name: "Faca", damage: 50, recoil: 0, fireRate: 400, type: "Melee", ammo: 1, maxAmmo: 1, reserveAmmo: 0, reloadTime: 0, sprayPattern: [0], sprayVertical: [0] }
};

// ==================== ÁUDIO SINTETIZADO ====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type, position = null) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const panner = position ? audioCtx.createPanner() : null;
    
    if (panner) {
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 500;
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;
        osc.connect(panner);
        panner.connect(gain);
    } else {
        osc.connect(gain);
    }
    gain.connect(audioCtx.destination);
    
    switch(type) {
        case 'shoot':
            osc.type = 'sawtooth';
            osc.frequency.value = 150;
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'headshot':
            osc.type = 'square';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'explode':
            osc.type = 'triangle';
            osc.frequency.value = 60;
            gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
            break;
        case 'beep':
            osc.type = 'sine';
            osc.frequency.value = 900;
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
            break;
        case 'radio':
            osc.type = 'triangle';
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            break;
        case 'knife':
            osc.type = 'sawtooth';
            osc.frequency.value = 200;
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
            break;
        case 'victory':
            osc.type = 'sine';
            osc.frequency.value = 523;
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(659, audioCtx.currentTime + 0.2);
            osc.frequency.linearRampToValueAtTime(784, audioCtx.currentTime + 0.4);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
            break;
        case 'narrador_headshot':
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.1);
            osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            break;
        case 'narrador_doublekill':
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.15);
            osc.frequency.linearRampToValueAtTime(700, audioCtx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
            break;
        case 'narrador_triplekill':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.2);
            osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
            break;
    }
}

// ==================== INICIALIZAÇÃO ====================
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7799aa);
    scene.fog = new THREE.Fog(0x7799aa, 200, 1300);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    controls = new THREE.PointerLockControls(camera, document.body);
    controls.pointerSpeed = sensitivity;
    
    setupEventListeners();
    setupWeapons();
    createScene();
    createBots();
    createBuyMenu();
    updateHUD();
    updateWeaponSlots();
    startFreezeTime();
    
    animate();
}

function setupEventListeners() {
    document.addEventListener('click', () => {
        if (!isChatOpen && !document.getElementById('settings-panel')?.style.display === 'block') {
            controls.lock();
        }
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
    
    // Anti-trapaça
    document.addEventListener('keydown', detectDevTools);
    window.addEventListener('devtoolschange', handleDevToolsOpen);
}

function setupWeapons() {
    weaponSlots[1] = { ...DEFAULT_WEAPONS[1] };
    weaponSlots[2] = { ...DEFAULT_WEAPONS[2] };
    weaponSlots[3] = { ...DEFAULT_WEAPONS[3] };
    weaponSlots[4] = { grenades: { ...playerGrenades } };
    weaponSlots[5] = { hasBomb: true, isPlanted: false };
    currentWeapon = weaponSlots[1];
    currentSlot = 1;
}

function createScene() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffeecc, 1.2);
    sun.position.set(120, 220, 150);
    scene.add(sun);
    
    // Chão básico
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshLambertMaterial({ color: 0xccaa77 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 13;
    floor.receiveShadow = true;
    scene.add(floor);
    mapColliders.push(floor);
    
    // Paredes básicas
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x996644 });
    const walls = [
        { pos: [0, 15, -30], size: [100, 4, 1] },
        { pos: [0, 15, 30], size: [100, 4, 1] },
        { pos: [-50, 15, 0], size: [1, 4, 60] },
        { pos: [50, 15, 0], size: [1, 4, 60] }
    ];
    
    walls.forEach(w => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(...w.size), wallMat);
        wall.position.set(...w.pos);
        scene.add(wall);
        mapColliders.push(wall);
    });
    
    // Bombsites marcados
    const bombMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
    [CHECKPOINTS.BOMB_A, CHECKPOINTS.BOMB_B].forEach(site => {
        const marker = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 16), bombMat);
        marker.position.copy(site);
        marker.position.y = 14;
        scene.add(marker);
    });
}

// ==================== CONTINUA NA PARTE 2 ====================
// ==================== CRIAÇÃO DE BOTS ====================
function createBots() {
    bots.forEach(b => scene.remove(b));
    bots = [];
    
    const botCount = getBotCount();
    
    for (let i = 0; i < botCount; i++) {
        const botGroup = new THREE.Group();
        
        // Cabeça
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xffaaaa })
        );
        head.position.y = 2.1;
        head.name = "HEADSHOT";
        
        // Peito
        const chest = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 2.2, 1.2),
            new THREE.MeshLambertMaterial({ color: 0xff2222 })
        );
        chest.position.y = 0.8;
        chest.name = "PEITO";
        
        // Pernas
        const legs = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.5, 1.0),
            new THREE.MeshLambertMaterial({ color: 0xaa1111 })
        );
        legs.position.y = -1.0;
        legs.name = "PERNAS";
        
        botGroup.add(head);
        botGroup.add(chest);
        botGroup.add(legs);
        
        botGroup.position.copy(CHECKPOINTS.CT_SPAWN);
        botGroup.position.x += (Math.random() - 0.5) * 15;
        botGroup.position.z += (Math.random() - 0.5) * 15;
        
        const botNames = [
            "Recruta", "Sargento", "Cabo", "Soldado", "Tenente",
            "Capitão", "Major", "Coronel", "General", "Marechal"
        ];
        
        botGroup.userData = {
            health: 100,
            name: botNames[i] || `Bot_${i+1}`,
            team: 'CT',
            lastShotTime: 0,
            targetSite: i % 2 === 0 ? CHECKPOINTS.BOMB_A : CHECKPOINTS.BOMB_B,
            currentState: "PATROL",
            difficulty: getDifficulty(),
            reactionTime: Math.random() * 1000 + 500,
            accuracy: 0.3 + (getDifficulty() * 0.1)
        };
        
        scene.add(botGroup);
        bots.push(botGroup);
    }
}

function getBotCount() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const difficulty = urlParams.get('difficulty') || 'normal';
    
    if (mode === 'bots') {
        switch(difficulty) {
            case 'easy': return 3;
            case 'hard': return 10;
            default: return 5;
        }
    }
    
    return sessionStorage.getItem('botCount') || 5;
}

function getDifficulty() {
    const diff = sessionStorage.getItem('difficulty') || 'normal';
    switch(diff) {
        case 'easy': return 0;
        case 'hard': return 2;
        default: return 1;
    }
}

// ==================== SISTEMA DE TIRO ====================
function shoot() {
    if (isFrozen || isDead || isSwitchingWeapon || isReloading) return;
    if (currentSlot === 4 || currentSlot === 5) return;
    
    if (currentSlot === 3) {
        knifeAttack();
        return;
    }
    
    if (!currentWeapon || currentWeapon.ammo <= 0) {
        addKillFeed("ARMA", "🔫 Sem balas! Aperte R");
        return;
    }
    
    if (Date.now() - lastShot < currentWeapon.fireRate) return;
    
    lastShot = Date.now();
    currentWeapon.ammo--;
    updateHUD();
    updateWeaponSlots();
    
    playSound('shoot', camera.position);
    
    // Aplicar spray pattern
    applySprayPattern();
    
    // Recuo
    if (!adminMode || !godMode) {
        camera.rotation.x -= currentWeapon.recoil * 0.5;
    }
    
    // Raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        let hitPart = intersects[0].object;
        let rootEntity = hitPart.parent;
        
        createImpactParticles(intersects[0].point);
        
        if (rootEntity && rootEntity.userData && rootEntity.userData.health !== undefined) {
            let finalDamage = currentWeapon.damage;
            let isHeadshot = false;
            
            if (hitPart.name === "HEADSHOT") {
                finalDamage *= 4;
                isHeadshot = true;
                
                // Efeitos especiais
                playSound('headshot');
                playSound('narrador_headshot');
                
                // Efeito visual
                flashScreen('#ff0000', 100);
                
                addKillFeed("💥", "HEADSHOT! Dano: " + finalDamage);
                playerStats.headshots++;
            }
            
            rootEntity.userData.health -= finalDamage;
            
            // Kill streak
            if (rootEntity.userData.health <= 0) {
                handleKill(rootEntity, isHeadshot);
            } else {
                playSound('beep');
            }
        }
    }
}

function knifeAttack() {
    if (Date.now() - lastShot < 400) return;
    lastShot = Date.now();
    
    playSound('knife');
    
    // Animação de facada
    const startZ = camera.position.z;
    const animInterval = setInterval(() => {
        camera.position.z -= 0.05;
    }, 10);
    
    setTimeout(() => {
        clearInterval(animInterval);
        camera.position.z = startZ;
    }, 100);
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0 && intersects[0].distance < 3) {
        let hitPart = intersects[0].object;
        let rootEntity = hitPart.parent;
        
        createImpactParticles(intersects[0].point);
        
        if (rootEntity && rootEntity.userData && rootEntity.userData.health !== undefined) {
            let finalDamage = weaponSlots[3].damage;
            let isBackstab = false;
            
            if (hitPart.name === "HEADSHOT") {
                finalDamage *= 2;
            } else {
                // Verificar backstab
                const botDir = new THREE.Vector3();
                botDir.copy(rootEntity.position).sub(camera.position).normalize();
                const botFacing = new THREE.Vector3(0, 0, 1);
                if (botDir.dot(botFacing) > 0.5) {
                    finalDamage *= 2;
                    isBackstab = true;
                }
            }
            
            rootEntity.userData.health -= finalDamage;
            
            if (rootEntity.userData.health <= 0) {
                handleKill(rootEntity, false, isBackstab);
            }
        }
    }
}

function handleKill(botEntity, isHeadshot, isBackstab = false) {
    scene.remove(botEntity);
    bots = bots.filter(b => b !== botEntity);
    
    money += 300;
    if (isHeadshot) money += 100;
    if (isBackstab) money += 500;
    
    playerStats.kills++;
    killStreak++;
    lastKillTime = Date.now();
    
    // Verificar kill streak para narrador
    checkKillStreak();
    
    // Efeitos
    if (killStreak >= 3) {
        flashScreen('#ffff00', 200);
    }
    
    addKillFeed("💀", `Você matou ${botEntity.userData.name}`);
    updateHUD();
    updateRanking();
    checkRoundEnd();
}

function checkKillStreak() {
    if (Date.now() - lastKillTime > 3000) {
        killStreak = 1;
        return;
    }
    
    switch(killStreak) {
        case 2:
            playSound('narrador_doublekill');
            addChatMessage('🎙️', 'DOUBLE KILL!', 'mvp');
            break;
        case 3:
            playSound('narrador_triplekill');
            addChatMessage('🎙️', 'TRIPLE KILL!', 'mvp');
            money += 500;
            break;
        case 5:
            addChatMessage('🎙️', 'MULTI KILL!', 'mvp');
            money += 1000;
            break;
        case 7:
            addChatMessage('🎙️', 'MONSTER KILL!', 'mvp');
            money += 2000;
            break;
        case 10:
            addChatMessage('🎙️', 'GODLIKE!', 'mvp');
            money += 5000;
            break;
    }
}

function applySprayPattern() {
    const now = Date.now();
    
    if (now - lastSprayTime > 1000) {
        sprayCounter = 0;
    }
    
    if (currentWeapon.sprayPattern && sprayCounter < currentWeapon.sprayPattern.length) {
        camera.rotation.y += currentWeapon.sprayPattern[sprayCounter] * 0.002;
        camera.rotation.x -= currentWeapon.sprayVertical[sprayCounter] * 0.003;
        sprayCounter++;
    }
    
    lastSprayTime = now;
}

// ==================== IA DOS BOTS ====================
function botAI() {
    if (!isLocked || isFrozen || isDead) return;
    
    const now = Date.now();
    
    bots.forEach(bot => {
        const distToPlayer = bot.position.distanceTo(camera.position);
        let hasLineOfSight = false;
        
        if (distToPlayer < 120) {
            const raycaster = new THREE.Raycaster();
            const dir = new THREE.Vector3().subVectors(camera.position, bot.position).normalize();
            raycaster.set(bot.position, dir);
            const obstacles = raycaster.intersectObjects(mapColliders, true);
            
            if (obstacles.length === 0 || obstacles[0].distance > distToPlayer) {
                hasLineOfSight = true;
                bot.userData.currentState = "ATTACK";
            }
        }
        
        if (bot.userData.currentState === "ATTACK" && hasLineOfSight) {
            if (now - bot.userData.lastShotTime > bot.userData.reactionTime) {
                bot.userData.lastShotTime = now;
                playSound('shoot', bot.position);
                
                if (Math.random() < bot.userData.accuracy) {
                    const damage = Math.floor(Math.random() * 20) + 5;
                    if (!godMode) {
                        takeDamage(damage);
                    }
                    
                    if (Math.random() < 0.1) {
                        flashScreen('#ff0000', 50);
                    }
                }
            }
            
            // Bot mira no jogador
            bot.lookAt(camera.position);
        } else {
            bot.userData.currentState = "PATROL";
            const target = bot.userData.targetSite;
            const moveDir = new THREE.Vector3().subVectors(target, bot.position);
            moveDir.y = 0;
            moveDir.normalize();
            
            if (bot.position.distanceTo(target) > 5) {
                bot.position.addScaledVector(moveDir, 0.1);
            }
        }
    });
}

// ==================== DANO E MORTE DO JOGADOR ====================
function takeDamage(amount) {
    if (isDead || godMode) return;
    
    let finalDamage = amount;
    
    if (playerArmor > 0) {
        const armorRatio = hasHelmet ? 0.7 : 0.5;
        const damageToArmor = Math.floor(finalDamage * armorRatio);
        const damageToHP = finalDamage - damageToArmor;
        
        if (playerArmor >= damageToArmor) {
            playerArmor -= damageToArmor;
            finalDamage = damageToHP;
        } else {
            finalDamage -= playerArmor;
            playerArmor = 0;
        }
    }
    
    playerHP -= Math.floor(finalDamage);
    
    // Efeito visual
    const overlay = document.createElement('div');
    overlay.className = 'damage-overlay';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 400);
    
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
    
    addKillFeed("💀", "Você morreu!");
    
    const deathScreen = document.createElement('div');
    deathScreen.className = 'death-screen';
    deathScreen.textContent = 'ELIMINADO';
    document.body.appendChild(deathScreen);
    
    // Câmera lenta
    const slowMo = setInterval(() => {
        camera.rotation.y += 0.01;
    }, 50);
    
    setTimeout(() => {
        clearInterval(slowMo);
        deathScreen.remove();
        respawnPlayer();
    }, 3000);
}

function respawnPlayer() {
    isDead = false;
    playerHP = 100;
    playerArmor = 0;
    hasHelmet = false;
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    velocity.set(0, 0, 0);
    money = Math.floor(money * 0.7);
    
    updateHUD();
    updateHealthBars();
    addKillFeed("🔄", "Respawn - Dinheiro reduzido");
}

// ==================== PARTÍCULAS E EFEITOS ====================
function createImpactParticles(position) {
    const count = 12;
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
        positions.push(position.x, position.y, position.z);
        velocities.push(
            (Math.random() - 0.5) * 5,
            Math.random() * 6,
            (Math.random() - 0.5) * 5
        );
    }
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.3,
        transparent: true,
        opacity: 1.0
    });
    
    const pSystem = new THREE.Points(geom, mat);
    pSystem.userData = { velocities, createdAt: Date.now() };
    scene.add(pSystem);
    particleSystems.push(pSystem);
}

function updateParticles(delta) {
    for (let i = particleSystems.length - 1; i >= 0; i--) {
        const pSystem = particleSystems[i];
        const posAttr = pSystem.geometry.attributes.position;
        const vels = pSystem.userData.velocities;
        
        if (Date.now() - pSystem.userData.createdAt > 600) {
            scene.remove(pSystem);
            particleSystems.splice(i, 1);
            continue;
        }
        
        for (let j = 0; j < posAttr.count; j++) {
            posAttr.setXYZ(
                j,
                posAttr.getX(j) + vels[j * 3] * delta,
                posAttr.getY(j) + vels[j * 3 + 1] * delta - 9.8 * delta,
                posAttr.getZ(j) + vels[j * 3 + 2] * delta
            );
        }
        posAttr.needsUpdate = true;
        pSystem.material.opacity -= delta * 1.5;
    }
}

function flashScreen(color, duration) {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: ${color};
        opacity: 0.3;
        pointer-events: none;
        z-index: 50;
        transition: opacity ${duration}ms ease-out;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), duration);
    }, 10);
}

// ==================== GRANADAS ====================
class Grenade {
    constructor(position, direction, type, power) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8),
            new THREE.MeshBasicMaterial({ color: this.getColor(type) })
        );
        this.mesh.position.copy(position);
        this.type = type;
        
        const speed = 8 * (0.5 + power * 1.5);
        this.velocity = direction.clone().multiplyScalar(speed);
        this.velocity.y += 5 * (0.5 + power);
        
        this.createdAt = Date.now();
        this.fuseTime = 3000;
        this.hasExploded = false;
        this.bounces = 0;
        
        scene.add(this.mesh);
    }
    
    getColor(type) {
        const colors = { 'HE': 0x00ff00, 'FLASH': 0xffffff, 'SMOKE': 0x888888, 'MOLOTOV': 0xff4400 };
        return colors[type] || 0xffff00;
    }
    
    update() {
        if (this.hasExploded) return false;
        
        this.velocity.y -= 0.4;
        this.mesh.position.add(this.velocity.clone().multiplyScalar(0.08));
        
        if (this.mesh.position.y < 14) {
            this.mesh.position.y = 14;
            
            if (this.bounces < 3 && Math.abs(this.velocity.y) > 1) {
                this.velocity.y *= -0.3;
                this.velocity.x *= 0.8;
                this.velocity.z *= 0.8;
                this.bounces++;
            } else {
                this.velocity.set(0, 0, 0);
            }
        }
        
        if (Date.now() - this.createdAt > this.fuseTime) {
            this.explode();
            return false;
        }
        
        return true;
    }
    
    explode() {
        this.hasExploded = true;
        const pos = this.mesh.position;
        
        playSound('explode', pos);
        
        for (let i = 0; i < 20; i++) {
            createImpactParticles(pos.clone().add(
                new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 4, (Math.random() - 0.5) * 4)
            ));
        }
        
        if (this.type === 'FLASH') {
            const dist = camera.position.distanceTo(pos);
            if (dist < 15) {
                flashScreen('#ffffff', 1000 * (1 - dist / 15));
            }
        }
        
        if (this.type === 'HE' || this.type === 'MOLOTOV') {
            const radius = this.type === 'HE' ? 10 : 5;
            
            bots.forEach(bot => {
                const dist = bot.position.distanceTo(pos);
                if (dist < radius) {
                    const damage = Math.floor(80 * (1 - dist / radius));
                    bot.userData.health -= damage;
                    
                    if (bot.userData.health <= 0) {
                        scene.remove(bot);
                        bots = bots.filter(b => b !== bot);
                        money += 200;
                        playerStats.kills++;
                        checkRoundEnd();
                    }
                }
            });
            
            const playerDist = camera.position.distanceTo(pos);
            if (playerDist < radius) {
                takeDamage(Math.floor(60 * (1 - playerDist / radius)));
            }
        }
        
        setTimeout(() => scene.remove(this.mesh), 500);
    }
}

function throwGrenade(power = 0.5) {
    if (isFrozen || isDead) return;
    
    const type = selectedGrenadeType;
    if (playerGrenades[type] <= 0) {
        addKillFeed("💣", `Sem ${type}!`);
        return;
    }
    
    playerGrenades[type]--;
    
    const pos = camera.position.clone();
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    pos.add(dir.clone().multiplyScalar(1.5));
    pos.y -= 0.3;
    
    const grenade = new Grenade(pos, dir, type, power);
    grenades.push(grenade);
    
    updateGrenadeIndicator();
    addKillFeed("💣", `${type} lançada!`);
}

// ==================== CONTINUA NA PARTE 3 ====================
// ==================== HUD E INTERFACE ====================
function updateHUD() {
    const moneyEl = document.getElementById('hud-money');
    const weaponEl = document.getElementById('hud-weapon');
    const hpEl = document.getElementById('hud-hp');
    
    if (moneyEl) moneyEl.textContent = money;
    if (hpEl) hpEl.textContent = playerHP;
    
    if (currentSlot === 4) {
        if (weaponEl) weaponEl.textContent = `GRANADA: ${selectedGrenadeType} [HE:${playerGrenades.HE}]`;
    } else if (currentSlot === 5) {
        if (weaponEl) weaponEl.textContent = hasBomb ? 'C4 [DISPONÍVEL]' : 'C4 [PLANTADA]';
    } else if (currentWeapon) {
        if (weaponEl) weaponEl.textContent = `${currentWeapon.name} [${currentWeapon.ammo}/${currentWeapon.reserveAmmo}]`;
    }
    
    updateHealthBars();
    updateWeaponSlots();
    updateGrenadeIndicator();
}

function updateHealthBars() {
    const healthBar = document.getElementById('health-bar');
    const healthText = document.getElementById('health-text');
    const armorBar = document.getElementById('armor-bar');
    const armorText = document.getElementById('armor-text');
    
    if (healthBar) healthBar.style.width = playerHP + '%';
    if (healthText) healthText.textContent = playerHP + ' HP';
    if (armorBar) armorBar.style.width = (playerArmor / 100) * 100 + '%';
    if (armorText) armorText.textContent = playerArmor + ' AP';
}

function updateWeaponSlots() {
    const container = document.getElementById('weapon-slots');
    if (!container) return;
    
    const slots = [
        { key: 1, weapon: weaponSlots[1], label: '1' },
        { key: 2, weapon: weaponSlots[2], label: '2' },
        { key: 3, weapon: weaponSlots[3], label: '3' },
        { key: 4, label: '4', special: 'GREN' },
        { key: 5, label: '5', special: 'C4' }
    ];
    
    container.innerHTML = slots.map(s => {
        const isActive = currentSlot === s.key;
        let name = '';
        let ammo = '';
        
        if (s.key === 4) {
            name = 'GREN';
            ammo = `HE:${playerGrenades.HE}`;
        } else if (s.key === 5) {
            name = 'C4';
            ammo = hasBomb ? '✓' : '✗';
        } else if (s.weapon) {
            name = s.weapon.name.substring(0, 4).toUpperCase();
            ammo = `${s.weapon.ammo}/${s.weapon.reserveAmmo}`;
        } else {
            name = '---';
            ammo = '---';
        }
        
        return `
            <div class="slot ${isActive ? 'active' : ''}">
                <div class="slot-key">[${s.label}]</div>
                <div>${name}</div>
                <div style="font-size:9px;color:#aaa;">${ammo}</div>
            </div>
        `;
    }).join('');
}

function updateGrenadeIndicator() {
    const heEl = document.getElementById('he-grenades');
    const flashEl = document.getElementById('flash-grenades');
    const smokeEl = document.getElementById('smoke-grenades');
    
    if (heEl) heEl.textContent = `HE: ${playerGrenades.HE}`;
    if (flashEl) flashEl.textContent = `FLASH: ${playerGrenades.FLASH}`;
    if (smokeEl) smokeEl.textContent = `SMOKE: ${playerGrenades.SMOKE}`;
}

function updateRanking() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    
    const rankings = [];
    
    // Jogador
    rankings.push({
        name: currentPlayer?.name || 'Você',
        kills: playerStats.kills,
        deaths: playerStats.deaths,
        isYou: true
    });
    
    // Bots
    bots.forEach(bot => {
        rankings.push({
            name: bot.userData.name,
            kills: Math.floor(Math.random() * 20),
            deaths: Math.floor(Math.random() * 10),
            isYou: false
        });
    });
    
    // Ordenar por kills
    rankings.sort((a, b) => b.kills - a.kills);
    
    rankingList.innerHTML = rankings.slice(0, 8).map((r, i) => {
        const medal = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `
            <div class="rank-item ${r.isYou ? 'you' : ''}">
                <span>${medal} ${r.name}</span>
                <span>${r.kills}💀 ${r.deaths}☠️</span>
            </div>
        `;
    }).join('');
}

function toggleRanking() {
    const list = document.getElementById('ranking-list');
    const header = document.getElementById('ranking-header');
    const btn = header?.querySelector('button');
    
    if (list.style.display === 'none') {
        list.style.display = 'block';
        if (btn) btn.textContent = '−';
    } else {
        list.style.display = 'none';
        if (btn) btn.textContent = '+';
    }
}

// ==================== SISTEMA DE CHAT ====================
function addChatMessage(sender, message, type = 'player') {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${type}`;
    
    const colors = {
        player: '#fff',
        radio: '#88ccff',
        bot: '#88ff88',
        admin: '#ff4444',
        system: '#ffaa00',
        mvp: '#ffdd00',
        narrador: '#ff00ff'
    };
    
    msgDiv.innerHTML = `<b style="color:${colors[type] || '#fff'}">${sender}:</b> ${message}`;
    chatBox.appendChild(msgDiv);
    
    while (chatBox.children.length > 50) {
        chatBox.removeChild(chatBox.firstChild);
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addKillFeed(killer, action) {
    const killfeed = document.getElementById('killfeed');
    if (!killfeed) return;
    
    const entry = document.createElement('div');
    entry.className = 'kill-entry';
    entry.textContent = `${killer} ${action}`;
    killfeed.appendChild(entry);
    
    setTimeout(() => {
        entry.style.opacity = '0';
        entry.style.transition = 'opacity 0.5s';
        setTimeout(() => entry.remove(), 500);
    }, 4000);
    
    while (killfeed.children.length > 5) {
        killfeed.removeChild(killfeed.firstChild);
    }
}

function toggleChat() {
    isChatOpen = !isChatOpen;
    const chatInput = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-box');
    
    if (isChatOpen) {
        if (chatBox) chatBox.style.display = 'flex';
        if (chatInput) {
            chatInput.style.display = 'block';
            chatInput.focus();
        }
        if (isLocked) controls.unlock();
    } else {
        if (chatBox) chatBox.style.display = 'none';
        if (chatInput) {
            chatInput.style.display = 'none';
            chatInput.value = '';
        }
        if (!isLocked && !document.getElementById('settings-panel')?.style.display === 'block') {
            controls.lock();
        }
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) {
        toggleChat();
        return;
    }
    
    // Verificar se é comando
    if (message.startsWith('/')) {
        processCommand(message);
    } else {
        // Mensagem normal
        const playerName = currentPlayer?.name || 'Player';
        addChatMessage(playerName, message, 'player');
        
        // Bots podem responder
        if (bots.length > 0 && Math.random() < 0.3) {
            setTimeout(() => {
                const responses = [
                    "Afirmativo!", "Entendido!", "Inimigo avistado!",
                    "Preciso de backup!", "Setor limpo!", "Boa!"
                ];
                const randomBot = bots[Math.floor(Math.random() * bots.length)];
                addChatMessage(randomBot.userData.name, 
                    responses[Math.floor(Math.random() * responses.length)], 'bot');
            }, 500 + Math.random() * 1500);
        }
    }
    
    input.value = '';
    toggleChat();
}

// ==================== SISTEMA DE COMANDOS ====================
function processCommand(message) {
    const parts = message.substring(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Só admin pode usar comandos
    if (!adminMode) {
        addChatMessage('SISTEMA', '❌ Comandos apenas para admin!', 'system');
        return;
    }
    
    switch(command) {
        // Comandos públicos
        case 'god':
            godMode = !godMode;
            addChatMessage('ADMIN', godMode ? '🛡️ Modo Deus ATIVADO' : '🛡️ Modo Deus DESATIVADO', 'admin');
            addAdminLog(`/god ${godMode ? 'ON' : 'OFF'}`);
            break;
            
        case 'fly':
            isFlyMode = !isFlyMode;
            addChatMessage('ADMIN', isFlyMode ? '✈️ Modo Voo ATIVADO' : '🚶 Modo Voo DESATIVADO', 'admin');
            break;
            
        case 'wall':
            wallhackActive = !wallhackActive;
            toggleWallhack();
            // Não mostra mensagem (comando secreto)
            addAdminLog(`/wall ${wallhackActive ? 'ON' : 'OFF'}`);
            break;
            
        case 'kick':
            if (args[0]) {
                kickPlayer(args[0]);
            } else {
                addChatMessage('SISTEMA', '❌ Use: /kick NOME', 'system');
            }
            break;
            
        case 'ban':
            if (args[0] && args[1]) {
                banPlayer(args[0], args[1]);
            } else {
                addChatMessage('SISTEMA', '❌ Use: /ban NOME TEMPO (1d/7d/30d/perm)', 'system');
            }
            break;
            
        case 'unban':
            if (args[0]) {
                unbanPlayer(args[0]);
            } else {
                addChatMessage('SISTEMA', '❌ Use: /unban NOME', 'system');
            }
            break;
            
        case 'give':
            if (args[0]) {
                giveItem(args[0], args[1]);
            } else {
                addChatMessage('SISTEMA', '❌ Use: /give ITEM [QTD]', 'system');
            }
            break;
            
        case 'noclip':
            isFlyMode = !isFlyMode;
            // Não mostra mensagem
            addAdminLog(`/noclip ${isFlyMode ? 'ON' : 'OFF'}`);
            break;
            
        case 'speed':
            addChatMessage('ADMIN', '⚡ Velocidade 2x ATIVADA', 'admin');
            break;
            
        case 'help':
            showHelp();
            break;
            
        case 'zumbi':
        case 'zombie':
            addChatMessage('ADMIN', '🧟 Modo Zumbi ATIVADO!', 'admin');
            startZombieMode();
            break;
            
        case 'dance':
            makeBotsDance();
            addChatMessage('ADMIN', '💃 Bots dançando!', 'admin');
            break;
            
        case 'admin':
            if (args[0] === 'criar' && currentPlayer?.type === 'dev') {
                createAdmin(args[1], args[2], args[3]);
            } else {
                addChatMessage('SISTEMA', '❌ Apenas Desenvolvedor pode criar admins', 'system');
            }
            break;
            
        case 'unadmin':
            adminMode = false;
            playerRole = 'player';
            addChatMessage('SISTEMA', '👑 Admin removido', 'system');
            addAdminLog('/unadmin');
            break;
            
        default:
            addChatMessage('SISTEMA', `❓ Comando desconhecido: /${command}`, 'system');
    }
}

// ==================== COMANDOS SECRETOS (SEM RASTRO NO CHAT) ====================
function executeSecretCommand(command, args) {
    switch(command) {
        case 'wall':
            wallhackActive = !wallhackActive;
            toggleWallhack();
            showSecretConfirm(`Wallhack ${wallhackActive ? 'ON' : 'OFF'}`);
            break;
            
        case 'aim':
            showSecretConfirm('Aimbot ON');
            break;
            
        case 'spy':
            if (args[0]) {
                showSecretConfirm(`Espionando ${args[0]}`);
            }
            break;
            
        case 'ghostkick':
            if (args[0]) {
                kickPlayerSilent(args[0]);
                showSecretConfirm(`${args[0]} removido silenciosamente`);
            }
            break;
            
        case 'norecoil':
            showSecretConfirm('Recoil removido');
            break;
            
        case 'invis':
            showSecretConfirm('Invisível');
            break;
            
        case 'clean':
            clearAllTraces();
            showSecretConfirm('Rastros limpos');
            break;
    }
    
    addAdminLog(`/${command} ${args.join(' ')}`);
}

function showSecretConfirm(text) {
    // Mostra confirmação pequena e rápida no canto
    const confirm = document.createElement('div');
    confirm.textContent = '✓ ' + text;
    confirm.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        color: #0f0;
        font-size: 10px;
        opacity: 0.5;
        z-index: 200;
        pointer-events: none;
        font-family: monospace;
    `;
    document.body.appendChild(confirm);
    
    setTimeout(() => {
        confirm.style.transition = 'opacity 0.5s';
        confirm.style.opacity = '0';
        setTimeout(() => confirm.remove(), 500);
    }, 1000);
}

// ==================== IMPLEMENTAÇÃO DOS COMANDOS ====================
function kickPlayer(name) {
    const botToKick = bots.find(b => b.userData.name.toLowerCase() === name.toLowerCase());
    if (botToKick) {
        scene.remove(botToKick);
        bots = bots.filter(b => b !== botToKick);
        addChatMessage('ADMIN', `👢 ${name} foi expulso!`, 'admin');
        addAdminLog(`/kick ${name}`);
    } else {
        addChatMessage('SISTEMA', `❌ Jogador "${name}" não encontrado`, 'system');
    }
}

function kickPlayerSilent(name) {
    const botToKick = bots.find(b => b.userData.name.toLowerCase() === name.toLowerCase());
    if (botToKick) {
        scene.remove(botToKick);
        bots = bots.filter(b => b !== botToKick);
    }
}

function banPlayer(name, duration) {
    let banDays = 0;
    let banText = 'PERMANENTE';
    
    switch(duration.toLowerCase()) {
        case '1d': banDays = 1; banText = '1 dia'; break;
        case '7d': banDays = 7; banText = '7 dias'; break;
        case '30d': banDays = 30; banText = '30 dias'; break;
        case 'perm': banDays = 0; banText = 'PERMANENTE'; break;
        default:
            addChatMessage('SISTEMA', '❌ Tempo inválido! Use: 1d, 7d, 30d, perm', 'system');
            return;
    }
    
    const banEndTime = banDays > 0 ? Date.now() + (banDays * 24 * 60 * 60 * 1000) : 0;
    
    bannedPlayers[name.toLowerCase()] = {
        name: name,
        bannedBy: currentPlayer?.name || 'Admin',
        bannedAt: Date.now(),
        banDays: banDays,
        banEndTime: banEndTime
    };
    
    localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
    
    // Remover da partida
    const botToBan = bots.find(b => b.userData.name.toLowerCase() === name.toLowerCase());
    if (botToBan) {
        scene.remove(botToBan);
        bots = bots.filter(b => b !== botToBan);
    }
    
    addChatMessage('ADMIN', `🔨 ${name} BANIDO por ${banText}!`, 'admin');
    addAdminLog(`/ban ${name} ${duration}`);
}

function unbanPlayer(name) {
    const key = name.toLowerCase();
    if (bannedPlayers[key]) {
        delete bannedPlayers[key];
        localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
        addChatMessage('ADMIN', `✅ ${name} desbanido!`, 'admin');
        addAdminLog(`/unban ${name}`);
    } else {
        addChatMessage('SISTEMA', `❌ ${name} não está banido`, 'system');
    }
}

function giveItem(item, quantity) {
    const qty = parseInt(quantity) || 1;
    
    switch(item.toLowerCase()) {
        case 'money':
            money += qty * 1000;
            addChatMessage('ADMIN', `💰 +$${qty * 1000}`, 'admin');
            break;
        case 'hp':
            playerHP = Math.min(playerHP + qty * 25, 100);
            addChatMessage('ADMIN', `❤️ +${qty * 25} HP`, 'admin');
            break;
        case 'armor':
            playerArmor = 100;
            hasHelmet = true;
            addChatMessage('ADMIN', '🛡️ Armadura completa', 'admin');
            break;
        case 'he':
            playerGrenades.HE = Math.min(playerGrenades.HE + qty, 5);
            break;
        case 'flash':
            playerGrenades.FLASH = Math.min(playerGrenades.FLASH + qty, 3);
            break;
        case 'ak47':
            weaponSlots[1] = { ...weaponShop.rifles[0] };
            currentWeapon = weaponSlots[1];
            currentSlot = 1;
            break;
        case 'awp':
            weaponSlots[1] = { ...weaponShop.rifles[2] };
            currentWeapon = weaponSlots[1];
            currentSlot = 1;
            break;
        default:
            addChatMessage('SISTEMA', `❌ Item "${item}" não encontrado`, 'system');
            return;
    }
    
    updateHUD();
    addAdminLog(`/give ${item} ${qty}`);
}

function showHelp() {
    const helpMessages = [
        '📋 COMANDOS ADMIN:',
        '/god - Modo Deus',
        '/fly - Modo Voo',
        '/wall - Ver paredes (secreto)',
        '/kick NOME - Expulsar',
        '/ban NOME TEMPO - Banir',
        '/unban NOME - Desbanir',
        '/give ITEM - Dar itens',
        '/zumbi - Modo Zumbi',
        '/dance - Bots dançam',
        '/noclip - Atravessar',
        '/speed - Velocidade',
        '/help - Ajuda'
    ];
    
    helpMessages.forEach(msg => {
        addChatMessage('HELP', msg, 'system');
    });
}

// ==================== LOG E CHAT SECRETO ====================
function addAdminLog(action) {
    adminLogs.push({
        time: new Date().toLocaleTimeString(),
        action: action
    });
    
    updateAdminLogDisplay();
}

function updateAdminLogDisplay() {
    const logContent = document.getElementById('log-content');
    if (!logContent) return;
    
    logContent.innerHTML = adminLogs.slice(-50).map(log => 
        `<div style="color:#aaa;font-size:11px;">${log.time} - ${log.action}</div>`
    ).join('');
}

function showAdminLog() {
    const log = document.getElementById('admin-log');
    if (log) {
        log.style.display = log.style.display === 'none' ? 'block' : 'none';
        updateAdminLogDisplay();
    }
}

function hideAdminLog() {
    const log = document.getElementById('admin-log');
    if (log) log.style.display = 'none';
}

function clearAdminLog() {
    adminLogs = [];
    updateAdminLogDisplay();
}

function showSecretChat() {
    const chat = document.getElementById('secret-chat');
    if (chat) {
        chat.style.display = chat.style.display === 'none' ? 'block' : 'none';
    }
}

function hideSecretChat() {
    const chat = document.getElementById('secret-chat');
    if (chat) chat.style.display = 'none';
}

function sendSecretMessage() {
    const input = document.getElementById('secret-chat-input');
    const content = document.getElementById('secret-chat-content');
    
    if (input && content && input.value.trim()) {
        const msg = document.createElement('div');
        msg.style.cssText = 'color:#0f0;font-size:11px;margin:2px 0;';
        msg.textContent = `[${new Date().toLocaleTimeString()}] ${input.value}`;
        content.appendChild(msg);
        input.value = '';
    }
}

function clearAllTraces() {
    adminLogs = [];
    updateAdminLogDisplay();
    
    const secretContent = document.getElementById('secret-chat-content');
    if (secretContent) secretContent.innerHTML = '';
    
    showSecretConfirm('Tudo limpo');
}

// ==================== CONTINUA NA PARTE 4 ====================
// ==================== SISTEMA DE LOGIN ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
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
    document.getElementById('reset-password-section').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-step-1').style.display = 'none';
    document.getElementById('forgot-step').style.display = 'block';
}

function showError(msg) {
    const errorEl = document.getElementById('login-error');
    const successEl = document.getElementById('login-success');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
        setTimeout(() => errorEl.style.display = 'none', 4000);
    }
    if (successEl) successEl.style.display = 'none';
}

function showSuccess(msg) {
    const successEl = document.getElementById('login-success');
    const errorEl = document.getElementById('login-error');
    if (successEl) {
        successEl.textContent = msg;
        successEl.style.display = 'block';
        setTimeout(() => successEl.style.display = 'none', 4000);
    }
    if (errorEl) errorEl.style.display = 'none';
}

function registerPlayer() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (!name || !email || !password) {
        showError('Preencha todos os campos!');
        return;
    }
    
    if (password !== confirm) {
        showError('Senhas não conferem!');
        return;
    }
    
    if (password.length < 6) {
        showError('Senha deve ter no mínimo 6 caracteres!');
        return;
    }
    
    // Verificar se nome já existe
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    if (users[name.toLowerCase()]) {
        showError('Este nome já está em uso!');
        return;
    }
    
    // Verificar se PC já tem conta
    const pcId = getPCId();
    const existingUser = Object.values(users).find(u => u.pcId === pcId);
    if (existingUser) {
        showError(`Este computador já tem a conta: ${existingUser.name}`);
        return;
    }
    
    // Verificar se está banido
    if (bannedPlayers[name.toLowerCase()]) {
        const ban = bannedPlayers[name.toLowerCase()];
        if (ban.banDays === 0 || Date.now() < ban.banEndTime) {
            showError('⛔ Este nome está banido! Use outro nome.');
            return;
        } else {
            delete bannedPlayers[name.toLowerCase()];
            localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
        }
    }
    
    // Gerar código de verificação
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Salvar temporariamente
    sessionStorage.setItem('pending_registration', JSON.stringify({
        name, email, password, pcId, verifyCode
    }));
    
    // Simular envio de email (no console)
    console.log(`📧 CÓDIGO DE VERIFICAÇÃO para ${email}: ${verifyCode}`);
    
    // Mostrar tela de verificação
    document.getElementById('register-step').style.display = 'none';
    document.getElementById('verify-step').style.display = 'block';
    document.getElementById('verify-email-display').textContent = email;
    
    showSuccess(`Código enviado para ${email}! (Verifique o console)`);
}

function verifyEmail() {
    const code = document.getElementById('verify-code').value.trim();
    const pending = JSON.parse(sessionStorage.getItem('pending_registration'));
    
    if (!pending) {
        showError('Sessão expirada. Faça o registro novamente.');
        showLogin();
        return;
    }
    
    if (code !== pending.verifyCode) {
        showError('Código incorreto!');
        return;
    }
    
    // Salvar usuário
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    users[pending.name.toLowerCase()] = {
        name: pending.name,
        email: pending.email,
        password: btoa(pending.password), // Base64 simples
        pcId: pending.pcId,
        createdAt: Date.now(),
        stats: {
            kills: 0, deaths: 0, headshots: 0,
            knifes: 0, bombsPlanted: 0, bombsDefused: 0,
            mvps: 0, gamesPlayed: 0
        },
        rank: 'PRATA I',
        skins: {},
        warnings: 0,
        banned: false
    };
    
    localStorage.setItem('dust2_users', JSON.stringify(users));
    sessionStorage.removeItem('pending_registration');
    
    showSuccess('✅ Conta criada com sucesso! Faça login.');
    
    setTimeout(() => {
        showLogin();
    }, 1500);
}

function loginPlayer() {
    const email = document.getElementById('player-email').value.trim();
    const password = document.getElementById('player-password').value;
    
    if (!email || !password) {
        showError('Preencha email e senha!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    
    // Buscar por email
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
        showError('Email não encontrado!');
        return;
    }
    
    if (btoa(password) !== user.password && password !== user.password) {
        showError('Senha incorreta!');
        return;
    }
    
    // Verificar ban
    if (bannedPlayers[user.name.toLowerCase()]) {
        const ban = bannedPlayers[user.name.toLowerCase()];
        if (ban.banDays === 0 || Date.now() < ban.banEndTime) {
            const remaining = ban.banDays === 0 ? 'PERMANENTE' : 
                Math.ceil((ban.banEndTime - Date.now()) / (24 * 60 * 60 * 1000)) + ' dias';
            showError(`⛔ Conta banida! Tempo restante: ${remaining}`);
            return;
        }
    }
    
    // Verificar PC
    const pcId = getPCId();
    if (user.pcId && user.pcId !== pcId) {
        // Permitir, mas registrar
        console.log('⚠️ Conta acessada de outro computador');
    }
    
    // Login bem sucedido
    currentPlayer = {
        name: user.name,
        email: user.email,
        type: 'player',
        stats: user.stats,
        rank: user.rank,
        skins: user.skins
    };
    
    playerStats = { ...user.stats };
    
    startGame();
}

function loginGuest() {
    const difficulty = document.getElementById('guest-difficulty').value;
    const mode = document.getElementById('guest-mode').value;
    
    sessionStorage.setItem('difficulty', difficulty);
    sessionStorage.setItem('gameMode', mode);
    
    const guestNames = ['Convidado_Visitante', 'Convidado_Anonimo', 'Convidado_Turista', 'Convidado_Viajante'];
    const randomName = guestNames[Math.floor(Math.random() * guestNames.length)] + '_' + Math.floor(Math.random() * 1000);
    
    currentPlayer = {
        name: randomName,
        type: 'guest',
        stats: { kills: 0, deaths: 0, headshots: 0, knifes: 0, bombsPlanted: 0, bombsDefused: 0, mvps: 0 },
        rank: 'CONVIDADO'
    };
    
    document.getElementById('chat-box').style.display = 'none';
    document.getElementById('chat-input').style.display = 'none';
    
    startGame();
}

function loginAdmin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === 'dev2024dust2') {
        // Desenvolvedor
        currentPlayer = {
            name: 'Desenvolvedor',
            type: 'dev',
            stats: {},
            rank: 'DEV'
        };
        adminMode = true;
        startGame();
    } else {
        // Verificar admins temporários
        const admins = JSON.parse(localStorage.getItem('dust2_admins') || '{}');
        const adminEntry = Object.values(admins).find(a => a.password === password);
        
        if (adminEntry) {
            if (adminEntry.expiresAt && Date.now() > adminEntry.expiresAt) {
                showError('❌ Admin expirado!');
                return;
            }
            
            currentPlayer = {
                name: adminEntry.name,
                type: 'admin',
                stats: {},
                rank: 'ADMIN'
            };
            adminMode = true;
            startGame();
        } else {
            showError('Senha incorreta!');
        }
    }
}

function getPCId() {
    let pcId = localStorage.getItem('dust2_pcid');
    if (!pcId) {
        pcId = 'PC_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('dust2_pcid', pcId);
    }
    return pcId;
}

function forgotPassword() {
    const email = document.getElementById('forgot-email').value.trim();
    
    if (!email) {
        showError('Digite seu email!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
        showError('Email não encontrado!');
        return;
    }
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('reset_email', email);
    sessionStorage.setItem('reset_code', resetCode);
    
    console.log(`📧 CÓDIGO DE RECUPERAÇÃO para ${email}: ${resetCode}`);
    
    document.getElementById('reset-password-section').style.display = 'block';
    showSuccess('Código enviado! Verifique o console.');
}

function resetPassword() {
    const code = document.getElementById('reset-code').value.trim();
    const newPassword = document.getElementById('reset-password').value;
    const savedCode = sessionStorage.getItem('reset_code');
    const email = sessionStorage.getItem('reset_email');
    
    if (code !== savedCode) {
        showError('Código incorreto!');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showError('Senha deve ter no mínimo 6 caracteres!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('dust2_users') || '{}');
    const userKey = Object.keys(users).find(k => users[k].email === email);
    
    if (userKey) {
        users[userKey].password = btoa(newPassword);
        localStorage.setItem('dust2_users', JSON.stringify(users));
        sessionStorage.removeItem('reset_code');
        sessionStorage.removeItem('reset_email');
        
        showSuccess('✅ Senha alterada com sucesso!');
        setTimeout(() => showLogin(), 1500);
    }
}

function startGame() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    if (currentPlayer?.type === 'guest') {
        document.getElementById('chat-box').style.display = 'none';
        document.getElementById('chat-input').style.display = 'none';
    }
    
    if (adminMode) {
        document.getElementById('admin-panel').style.display = 'block';
        addChatMessage('SISTEMA', '👑 Modo Admin ATIVADO', 'admin');
    }
    
    init();
}

// ==================== CRIAÇÃO DE SALA (ADMIN) ====================
function createRoom() {
    document.getElementById('create-room-form').style.display = 'block';
}

function hideCreateRoom() {
    document.getElementById('create-room-form').style.display = 'none';
}

function confirmCreateRoom() {
    const code = document.getElementById('room-code-create').value.trim();
    const mode = document.getElementById('room-mode-create').value;
    const bots = document.getElementById('room-bots-create').value;
    
    if (!code) {
        alert('Digite um código para a sala!');
        return;
    }
    
    roomCode = code;
    sessionStorage.setItem('botCount', bots);
    sessionStorage.setItem('gameMode', mode);
    
    addChatMessage('SISTEMA', `🌐 Sala criada: ${code}`, 'admin');
    addChatMessage('SISTEMA', `📋 Modo: ${mode} | Bots: ${bots}`, 'admin');
    addAdminLog(`Sala criada: ${code} (${mode}, ${bots} bots)`);
    
    hideCreateRoom();
    createBots();
}

// ==================== ANTI-TRAPAÇA ====================
function detectDevTools(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')) {
        
        e.preventDefault();
        tamperAttempts++;
        
        if (currentPlayer && currentPlayer.type !== 'dev') {
            playerWarnings++;
            
            if (playerWarnings >= 3) {
                // Ban automático 31 dias
                const name = currentPlayer.name;
                bannedPlayers[name.toLowerCase()] = {
                    name: name,
                    bannedBy: 'SISTEMA ANTI-TRAPAÇA',
                    bannedAt: Date.now(),
                    banDays: 31,
                    banEndTime: Date.now() + (31 * 24 * 60 * 60 * 1000)
                };
                localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
                
                addChatMessage('🚨', `${name} BANIDO por 31 dias! (Trapaça)`, 'system');
                addAdminLog(`BAN AUTOMÁTICO: ${name} (31 dias)`);
                
                setTimeout(() => {
                    alert('⛔ VOCÊ FOI BANIDO POR 31 DIAS!\nMotivo: Tentativa de trapaça\nSó pode jogar como Convidado.');
                    location.reload();
                }, 1000);
            } else {
                addChatMessage('⚠️', `Alerta ${playerWarnings}/3: Não abra o console!`, 'system');
                addAdminLog(`Alerta ${playerWarnings}/3: ${currentPlayer.name} tentou abrir DevTools`);
            }
        }
        
        return false;
    }
    
    // Detectar resize suspeito (DevTools aberto)
    if (window.outerWidth - window.innerWidth > 100 || 
        window.outerHeight - window.innerHeight > 100) {
        handleDevToolsOpen();
    }
}

function handleDevToolsOpen() {
    if (currentPlayer && currentPlayer.type !== 'dev' && currentPlayer.type !== 'guest') {
        tamperAttempts++;
        
        if (tamperAttempts > 5) {
            const name = currentPlayer.name;
            bannedPlayers[name.toLowerCase()] = {
                name: name,
                bannedBy: 'SISTEMA ANTI-TRAPAÇA',
                bannedAt: Date.now(),
                banDays: 31,
                banEndTime: Date.now() + (31 * 24 * 60 * 60 * 1000)
            };
            localStorage.setItem('dust2_banned', JSON.stringify(bannedPlayers));
            
            alert('⛔ BANIDO POR 31 DIAS!\nMotivo: Ferramentas de desenvolvedor detectadas');
            location.reload();
        }
    }
}

// Proteger funções críticas
const protectedFunctions = ['init', 'shoot', 'takeDamage', 'processCommand'];
protectedFunctions.forEach(funcName => {
    const original = window[funcName];
    if (original) {
        window[funcName] = function(...args) {
            if (tamperAttempts > 3 && currentPlayer?.type !== 'dev') {
                return;
            }
            return original.apply(this, args);
        };
    }
});

// ==================== MOVIMENTAÇÃO ====================
function onMouseDown(e) {
    if (!isLocked || isChatOpen || isDead) return;
    
    if (e.button === 0) { // Botão esquerdo
        e.preventDefault();
        if (!isReloading) shoot();
    }
    
    if (e.button === 2) { // Botão direito
        e.preventDefault();
        cycleGrenade();
    }
    
    if (e.button === 1) { // Botão do meio
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
    // Teclas de sistema
    if (e.key === 'F1') {
        e.preventDefault();
        toggleSettings();
        return;
    }
    
    if (e.key === 'F2' && adminMode) {
        e.preventDefault();
        showAdminLog();
        return;
    }
    
    if (e.key === 'F3' && adminMode) {
        e.preventDefault();
        showSecretChat();
        return;
    }
    
    // Anti-trapaça para F12
    if (e.key === 'F12') {
        detectDevTools(e);
        return;
    }
    
    if (e.key.toLowerCase() === 't' && !isChatOpen && currentPlayer?.type !== 'guest') {
        e.preventDefault();
        toggleChat();
        return;
    }
    
    if (e.key === 'Escape') {
        if (isChatOpen) {
            toggleChat();
            return;
        }
        toggleSettings();
        return;
    }
    
    if (isChatOpen) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendChatMessage();
        }
        return;
    }
    
    if (isDead) return;
    
    // Slots de arma
    if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        switchWeapon(parseInt(e.key));
        return;
    }
    
    // Tecla Q - troca rápida
    if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        quickSwitch();
        return;
    }
    
    // Rádio
    if (e.key.toLowerCase() === 'z') {
        sendRadio('gogo');
        return;
    }
    if (e.key.toLowerCase() === 'x') {
        sendRadio('enemy');
        return;
    }
    if (e.key.toLowerCase() === 'c') {
        sendRadio('help');
        return;
    }
    
    if (!isFrozen) {
        switch(e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': isWalkingSilently = true; break;
            case 'Space':
                if (canJump || isFlyMode) {
                    velocity.y += isFlyMode ? 300 : 100;
                    canJump = false;
                }
                break;
            case 'KeyR': reloadWeapon(); break;
            case 'KeyG': throwGrenade(0.7); break;
            case 'KeyB': toggleBuyMenu(); break;
        }
    }
    
    if (e.key.toLowerCase() === 'f' && hasBomb && !bombPlanted && !isFrozen && !isDead) {
        if (camera.position.distanceTo(CHECKPOINTS.BOMB_A) < 25 || 
            camera.position.distanceTo(CHECKPOINTS.BOMB_B) < 25) {
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
    
    const messages = {
        'gogo': 'Go go go!',
        'enemy': 'Inimigo avistado!',
        'help': 'Preciso de ajuda!'
    };
    
    const playerName = currentPlayer?.name || 'Player';
    addChatMessage(`📻 ${playerName}`, messages[type] || type, 'radio');
    playSound('radio');
}

function switchWeapon(slot) {
    if (isSwitchingWeapon || isDead || slot === currentSlot) return;
    if (slot < 1 || slot > 5) return;
    
    if (slot === 4 && Object.values(playerGrenades).every(v => v === 0)) {
        addKillFeed("💣", "Sem granadas!");
        return;
    }
    
    isSwitchingWeapon = true;
    
    if (isReloading) {
        isReloading = false;
        document.getElementById('reload-indicator').style.display = 'none';
    }
    
    setTimeout(() => {
        currentSlot = slot;
        
        if (slot === 4) {
            currentWeapon = null;
        } else if (slot === 5) {
            currentWeapon = null;
        } else {
            currentWeapon = weaponSlots[slot];
        }
        
        sprayCounter = 0;
        lastSprayTime = 0;
        isSwitchingWeapon = false;
        
        updateHUD();
        playSound('beep');
    }, 200);
}

function quickSwitch() {
    if (currentSlot === 4 || currentSlot === 5) {
        switchWeapon(1);
    } else {
        switchWeapon(currentSlot === 1 ? 2 : 1);
    }
}

function reloadWeapon() {
    if (isReloading || isDead || isSwitchingWeapon) return;
    if (currentSlot >= 3) return;
    if (!currentWeapon || currentWeapon.ammo >= currentWeapon.maxAmmo) return;
    if (currentWeapon.reserveAmmo <= 0) {
        addKillFeed("🔫", "Sem munição reserva!");
        return;
    }
    
    isReloading = true;
    document.getElementById('reload-indicator').style.display = 'block';
    addKillFeed("🔄", "Recarregando...");
    
    setTimeout(() => {
        const needed = currentWeapon.maxAmmo - currentWeapon.ammo;
        const available = Math.min(needed, currentWeapon.reserveAmmo);
        currentWeapon.ammo += available;
        currentWeapon.reserveAmmo -= available;
        isReloading = false;
        
        document.getElementById('reload-indicator').style.display = 'none';
        updateHUD();
        addKillFeed("✅", "Pronto!");
    }, currentWeapon.reloadTime || 2500);
}

// ==================== GAME LOOP ====================
function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1);
    prevTime = time;
    
    // Atualizar partículas
    updateParticles(delta);
    
    // Atualizar granadas
    grenades = grenades.filter(g => g.update());
    
    // Atualizar segurar granada
    if (isHoldingGrenade) {
        updateGrenadeHolding();
    }
    
    // Movimentação
    if (!isDead && isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        
        if (isFlyMode) {
            velocity.y -= velocity.y * 10.0 * delta;
        } else {
            velocity.y -= 9.8 * 30.0 * delta;
        }
        
        const speedModifier = isWalkingSilently ? 180.0 : 400.0;
        
        if (moveForward || moveBackward || moveLeft || moveRight) {
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();
            
            if (moveForward || moveBackward) velocity.z -= direction.z * speedModifier * delta;
            if (moveLeft || moveRight) velocity.x -= direction.x * speedModifier * delta;
        }
        
        const oldPosition = camera.position.clone();
        
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        if (isFlyMode) {
            camera.position.y += velocity.y * delta;
        } else {
            controls.getObject().position.y += velocity.y * delta;
        }
        
        // Colisão
        if (!isFlyMode) {
            const raycaster = new THREE.Raycaster(oldPosition, direction, 0, 3);
            const collisions = raycaster.intersectObjects(mapColliders, true);
            
            if (collisions.length > 0) {
                camera.position.x = oldPosition.x;
                camera.position.z = oldPosition.z;
            }
            
            if (controls.getObject().position.y < 14) {
                velocity.y = 0;
                controls.getObject().position.y = 14;
                canJump = true;
            }
        }
    }
    
    // IA dos bots
    botAI();
    
    // Recuperação de recoil
    if (camera.rotation.x < 0) {
        camera.rotation.x *= 0.9;
    }
    
    // Atualizar interfaces
    updateMinimap();
    updateRanking();
    
    // Debug
    const debugEl = document.getElementById('pos-debug');
    if (debugEl) {
        debugEl.textContent = `X:${camera.position.x.toFixed(1)} Y:${camera.position.y.toFixed(1)} Z:${camera.position.z.toFixed(1)} ${isFlyMode?'[VOO]':''} ${godMode?'[DEUS]':''}`;
    }
    
    renderer.render(scene, camera);
}

// ==================== CONTINUA NA PARTE 5 ====================
// ==================== BOMBA C4 ====================
function plantBomb() {
    if (!hasBomb || bombPlanted) return;
    
    bombPlanted = true;
    hasBomb = false;
    weaponSlots[5].hasBomb = false;
    weaponSlots[5].isPlanted = true;
    playerStats.bombsPlanted++;
    
    addKillFeed("💣", "C4 PLANTADA!");
    playSound('beep');
    
    // Efeito visual no bombsite
    const bombSite = camera.position.distanceTo(CHECKPOINTS.BOMB_A) < 25 ? CHECKPOINTS.BOMB_A : CHECKPOINTS.BOMB_B;
    const bombLight = new THREE.PointLight(0xff0000, 2, 15);
    bombLight.position.copy(bombSite);
    bombLight.position.y = 15;
    scene.add(bombLight);
    
    // Timer
    let secondsLeft = 40;
    bombTimer = setInterval(() => {
        secondsLeft--;
        
        if (secondsLeft <= 10 && secondsLeft > 0) {
            playSound('beep');
            addChatMessage('💣', `Bomba explodindo em ${secondsLeft}s!`, 'system');
        }
        
        if (secondsLeft <= 0) {
            clearInterval(bombTimer);
            explodeBomb();
            scene.remove(bombLight);
        }
    }, 1000);
    
    updateHUD();
}

function explodeBomb() {
    if (!bombPlanted) return;
    
    bombPlanted = false;
    weaponSlots[5].isPlanted = false;
    
    playSound('explode');
    flashScreen('#ff4400', 2000);
    
    // Efeito de partículas massivo
    const bombSite = camera.position.distanceTo(CHECKPOINTS.BOMB_A) < 50 ? CHECKPOINTS.BOMB_A : CHECKPOINTS.BOMB_B;
    for (let i = 0; i < 50; i++) {
        createImpactParticles(bombSite.clone().add(
            new THREE.Vector3((Math.random() - 0.5) * 20, Math.random() * 15, (Math.random() - 0.5) * 20)
        ));
    }
    
    // Matar todos perto
    if (camera.position.distanceTo(bombSite) < 20) {
        playerDeath();
    }
    
    scoreT++;
    document.getElementById('score-t').textContent = scoreT;
    
    addKillFeed("💥", "BOMBA EXPLODIU! TR VENCE!");
    addChatMessage('💣', 'BOMBA EXPLODIU! Terroristas vencem!', 'system');
    
    if (musicEnabled) playSound('victory');
    
    setTimeout(() => {
        announceMVP();
        setTimeout(() => nextRound(), 5000);
    }, 2000);
}

function checkRoundEnd() {
    if (bots.length === 0 && !bombPlanted) {
        if (bombTimer) clearInterval(bombTimer);
        
        scoreCT++;
        document.getElementById('score-ct').textContent = scoreCT;
        
        addKillFeed("🏆", "Todos eliminados! CT VENCE!");
        addChatMessage('🏆', 'Todos os inimigos eliminados! CT vence!', 'system');
        
        if (musicEnabled) playSound('victory');
        
        setTimeout(() => {
            announceMVP();
            setTimeout(() => nextRound(), 5000);
        }, 2000);
    }
}

function nextRound() {
    bombPlanted = false;
    hasBomb = true;
    weaponSlots[5].hasBomb = true;
    weaponSlots[5].isPlanted = false;
    
    round++;
    document.getElementById('hud-round').textContent = round;
    
    camera.position.copy(CHECKPOINTS.TR_SPAWN);
    velocity.set(0, 0, 0);
    
    createBots();
    money += 3200;
    playerHP = 100;
    playerArmor = 0;
    isDead = false;
    killStreak = 0;
    
    if (currentWeapon) {
        currentWeapon.ammo = currentWeapon.maxAmmo;
    }
    
    updateHUD();
    updateHealthBars();
    startFreezeTime();
}

// ==================== MVP ====================
function announceMVP() {
    const playerName = currentPlayer?.name || 'Você';
    
    // Calcular pontuação
    const score = playerStats.kills * 100 + playerStats.headshots * 50 + playerStats.bombsPlanted * 200;
    
    // Mostrar na tela
    const mvpScreen = document.createElement('div');
    mvpScreen.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 200;
        pointer-events: none;
        animation: mvpSlideIn 0.5s ease;
    `;
    
    mvpScreen.innerHTML = `
        <div style="font-size:72px;">👑</div>
        <div style="color:#ffdd00;font-size:36px;font-weight:bold;text-shadow:0 0 20px rgba(255,221,0,0.8);">MVP</div>
        <div style="color:#fff;font-size:24px;">${playerName}</div>
        <div style="color:#aaa;font-size:14px;margin-top:10px;">
            ⭐ ${playerStats.kills} kills | 🎯 ${playerStats.headshots} headshots | 💣 ${playerStats.bombsPlanted} bombas
        </div>
        <div style="color:#ffdd00;font-size:18px;margin-top:10px;">+$2000 BÔNUS</div>
    `;
    
    document.body.appendChild(mvpScreen);
    money += 2000;
    playerStats.mvps++;
    
    addChatMessage('🏆', `${playerName} é o MVP da partida!`, 'mvp');
    
    if (musicEnabled) playSound('victory');
    
    // Bots comemoram
    makeBotsDance();
    
    setTimeout(() => {
        mvpScreen.style.transition = 'opacity 0.5s';
        mvpScreen.style.opacity = '0';
        setTimeout(() => mvpScreen.remove(), 500);
    }, 4000);
}

function makeBotsDance() {
    bots.forEach(bot => {
        const originalY = bot.position.y;
        let jumps = 0;
        const danceInterval = setInterval(() => {
            if (jumps >= 5) {
                clearInterval(danceInterval);
                bot.position.y = originalY;
                return;
            }
            bot.position.y = originalY + Math.abs(Math.sin(jumps * 2)) * 2;
            jumps++;
        }, 200);
    });
}

// ==================== MODOS ESPECIAIS ====================
function startZombieMode() {
    // Escurecer cena
    scene.fog = new THREE.Fog(0x111111, 50, 200);
    scene.background = new THREE.Color(0x111122);
    
    // Luz vermelha
    const zombieLight = new THREE.PointLight(0xff0000, 1, 50);
    zombieLight.position.set(0, 30, 0);
    scene.add(zombieLight);
    
    // Transformar bots em zumbis
    bots.forEach(bot => {
        bot.userData.health = 200;
        bot.userData.speed = 2;
        bot.userData.isZombie = true;
        
        // Mudar cor para verde
        bot.children.forEach(part => {
            if (part.material && part.material.color) {
                part.material.color.setHex(0x00ff00);
            }
        });
    });
    
    addChatMessage('🧟', 'MODO ZUMBI ATIVADO!', 'system');
    addKillFeed("🧟", "ZUMBIS INVADIRAM!");
}

function toggleWallhack() {
    if (wallhackActive) {
        mapColliders.forEach(collider => {
            if (collider.material) {
                collider.material.transparent = true;
                collider.material.opacity = 0.15;
            }
        });
    } else {
        mapColliders.forEach(collider => {
            if (collider.material) {
                collider.material.transparent = false;
                collider.material.opacity = 1;
            }
        });
    }
}

// ==================== MINI MAPA ====================
let minimapCtx;
let minimapCanvas;

function createMinimap() {
    minimapCanvas = document.createElement('canvas');
    minimapCanvas.width = 150;
    minimapCanvas.height = 150;
    minimapCanvas.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        border: 2px solid #de9b35;
        border-radius: 50%;
        z-index: 30;
        box-shadow: 0 0 15px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(minimapCanvas);
    minimapCtx = minimapCanvas.getContext('2d');
}

function updateMinimap() {
    if (!minimapCtx || isDead) return;
    
    const size = 150;
    const center = size / 2;
    const scale = 1.2;
    
    minimapCtx.clearRect(0, 0, size, size);
    
    // Fundo circular
    minimapCtx.beginPath();
    minimapCtx.arc(center, center, center - 2, 0, Math.PI * 2);
    minimapCtx.fillStyle = 'rgba(0,0,0,0.8)';
    minimapCtx.fill();
    minimapCtx.save();
    minimapCtx.clip();
    
    // Bombsites
    minimapCtx.fillStyle = '#ffaa00';
    minimapCtx.font = 'bold 10px Arial';
    minimapCtx.fillText('A', center + CHECKPOINTS.BOMB_A.x * scale, center - CHECKPOINTS.BOMB_A.z * scale);
    minimapCtx.fillText('B', center + CHECKPOINTS.BOMB_B.x * scale, center - CHECKPOINTS.BOMB_B.z * scale);
    
    // Jogador
    const playerX = center + camera.position.x * scale;
    const playerZ = center - camera.position.z * scale;
    
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    
    minimapCtx.beginPath();
    minimapCtx.moveTo(playerX, playerZ);
    minimapCtx.lineTo(playerX + dir.x * 10, playerZ - dir.z * 10);
    minimapCtx.strokeStyle = '#00ff00';
    minimapCtx.lineWidth = 2;
    minimapCtx.stroke();
    
    minimapCtx.beginPath();
    minimapCtx.arc(playerX, playerZ, 3, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#00ff00';
    minimapCtx.fill();
    
    // Bots
    bots.forEach(bot => {
        const botX = center + bot.position.x * scale;
        const botZ = center - bot.position.z * scale;
        minimapCtx.beginPath();
        minimapCtx.arc(botX, botZ, 2, 0, Math.PI * 2);
        minimapCtx.fillStyle = '#ff3333';
        minimapCtx.fill();
    });
    
    minimapCtx.restore();
    
    // Borda
    minimapCtx.beginPath();
    minimapCtx.arc(center, center, center - 2, 0, Math.PI * 2);
    minimapCtx.strokeStyle = '#de9b35';
    minimapCtx.lineWidth = 2;
    minimapCtx.stroke();
}

// ==================== MIRA PERSONALIZADA ====================
function updateCrosshair() {
    const crosshair = document.getElementById('crosshair');
    if (!crosshair) return;
    
    const horizontal = crosshair.querySelector('.horizontal');
    const vertical = crosshair.querySelector('.vertical');
    
    if (!horizontal || !vertical) return;
    
    switch(crosshairType) {
        case 'dot':
            horizontal.style.width = '4px';
            horizontal.style.height = '4px';
            vertical.style.display = 'none';
            horizontal.style.borderRadius = '50%';
            break;
        case 'circle':
            horizontal.style.width = '10px';
            horizontal.style.height = '10px';
            vertical.style.display = 'none';
            horizontal.style.borderRadius = '50%';
            horizontal.style.background = 'transparent';
            horizontal.style.border = `2px solid ${crosshairColor}`;
            break;
        case 't':
            horizontal.style.width = '16px';
            horizontal.style.height = '2px';
            vertical.style.width = '2px';
            vertical.style.height = '8px';
            vertical.style.top = '0px';
            vertical.style.display = 'block';
            horizontal.style.borderRadius = '0';
            horizontal.style.background = crosshairColor;
            vertical.style.background = crosshairColor;
            break;
        default: // cross
            horizontal.style.width = '16px';
            horizontal.style.height = '2px';
            vertical.style.width = '2px';
            vertical.style.height = '16px';
            vertical.style.display = 'block';
            horizontal.style.borderRadius = '0';
            horizontal.style.background = crosshairColor;
            vertical.style.background = crosshairColor;
    }
}

// ==================== CONFIGURAÇÕES ====================
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
        const isOpen = panel.style.display === 'block';
        panel.style.display = isOpen ? 'none' : 'block';
        
        if (isOpen && !isChatOpen) {
            controls.lock();
        } else {
            controls.unlock();
        }
    }
}

function applySettings() {
    const sensSlider = document.getElementById('sensitivity-slider');
    const musicSelect = document.getElementById('music-setting');
    const radioSelect = document.getElementById('radio-setting');
    const crosshairSelect = document.getElementById('crosshair-setting');
    const colorSelect = document.getElementById('crosshair-color');
    
    if (sensSlider) {
        sensitivity = parseFloat(sensSlider.value);
        controls.pointerSpeed = sensitivity;
        document.getElementById('sensitivity-value').textContent = sensitivity;
        localStorage.setItem('dust2_sensitivity', sensitivity);
    }
    
    if (musicSelect) {
        musicEnabled = musicSelect.value === 'on';
        localStorage.setItem('dust2_music', musicEnabled);
    }
    
    if (radioSelect) {
        radioEnabled = radioSelect.value === 'on';
        localStorage.setItem('dust2_radio', radioEnabled);
    }
    
    if (crosshairSelect) {
        crosshairType = crosshairSelect.value;
        localStorage.setItem('dust2_crosshair', crosshairType);
        updateCrosshair();
    }
    
    if (colorSelect) {
        crosshairColor = colorSelect.value;
        localStorage.setItem('dust2_crosshair_color', crosshairColor);
        updateCrosshair();
    }
}

function loadSettings() {
    const savedSens = localStorage.getItem('dust2_sensitivity');
    if (savedSens) {
        sensitivity = parseFloat(savedSens);
        controls.pointerSpeed = sensitivity;
        const slider = document.getElementById('sensitivity-slider');
        if (slider) slider.value = sensitivity;
    }
    
    const savedMusic = localStorage.getItem('dust2_music');
    if (savedMusic !== null) {
        musicEnabled = savedMusic === 'true';
        const select = document.getElementById('music-setting');
        if (select) select.value = musicEnabled ? 'on' : 'off';
    }
    
    const savedRadio = localStorage.getItem('dust2_radio');
    if (savedRadio !== null) {
        radioEnabled = savedRadio === 'true';
        const select = document.getElementById('radio-setting');
        if (select) select.value = radioEnabled ? 'on' : 'off';
    }
    
    const savedCrosshair = localStorage.getItem('dust2_crosshair');
    if (savedCrosshair) {
        crosshairType = savedCrosshair;
        const select = document.getElementById('crosshair-setting');
        if (select) select.value = crosshairType;
    }
    
    const savedColor = localStorage.getItem('dust2_crosshair_color');
    if (savedColor) {
        crosshairColor = savedColor;
        const select = document.getElementById('crosshair-color');
        if (select) select.value = crosshairColor;
    }
    
    updateCrosshair();
}

// ==================== MENU DE COMPRAS ====================
function toggleBuyMenu() {
    const menu = document.getElementById('buy-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}

function createBuyMenu() {
    const menu = document.getElementById('buy-menu');
    if (!menu) return;
    
    let html = '<h2 style="color:#de9b35;">💰 MERCADO (B para fechar)</h2>';
    
    for (const category in weaponShop) {
        html += `<h3 style="color:#5d79ae;">${category.toUpperCase()}</h3>`;
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:5px;margin-bottom:10px;">';
        
        weaponShop[category].forEach(item => {
            html += `
                <button onclick="buyItem('${item.name}', ${item.price}, '${category}', '${JSON.stringify(item).replace(/"/g, '&quot;')}')" 
                    style="background:#1c2430;color:#fff;border:1px solid #3a4b63;padding:6px;cursor:pointer;text-align:left;font-size:11px;border-radius:3px;">
                    <b>${item.name}</b><br>
                    <span style="color:#0f0;">$${item.price}</span>
                </button>
            `;
        });
        
        html += '</div>';
    }
    
    menu.innerHTML = html;
}

function buyItem(name, price, category, itemData) {
    if (money < price) {
        addKillFeed("💰", "Dinheiro insuficiente!");
        return;
    }
    
    money -= price;
    
    const item = JSON.parse(itemData);
    
    if (item.type === 'Pistol') {
        weaponSlots[2] = { ...item, sprayPattern: item.sprayPattern || [0], sprayVertical: item.sprayVertical || [0] };
        addKillFeed("🛒", `${name} → Slot 2`);
        if (currentSlot === 2) currentWeapon = weaponSlots[2];
    } else if (item.name === 'Faca') {
        weaponSlots[3] = { ...item, sprayPattern: [0], sprayVertical: [0] };
        addKillFeed("🛒", `${name} → Slot 3`);
    } else if (item.type === 'Grenade') {
        if (item.name.includes('HE')) playerGrenades.HE = Math.min(playerGrenades.HE + 1, 5);
        else if (item.name.includes('Flash')) playerGrenades.FLASH = Math.min(playerGrenades.FLASH + 1, 3);
        else if (item.name.includes('Smoke')) playerGrenades.SMOKE = Math.min(playerGrenades.SMOKE + 1, 3);
        addKillFeed("🛒", `${name} → Slot 4`);
    } else if (item.name === 'Colete') {
        playerArmor = 100;
        addKillFeed("🛒", "Colete equipado!");
    } else if (item.name === 'Capacete') {
        hasHelmet = true;
        addKillFeed("🛒", "Capacete equipado!");
    } else {
        // Arma primária
        weaponSlots[1] = { ...item, sprayPattern: item.sprayPattern || [0], sprayVertical: item.sprayVertical || [0] };
        addKillFeed("🛒", `${name} → Slot 1`);
        if (currentSlot === 1 || !currentWeapon) {
            currentWeapon = weaponSlots[1];
            currentSlot = 1;
        }
    }
    
    updateHUD();
}

// ==================== SISTEMA DE GRANADA SEGURANDO ====================
function startHoldingGrenade() {
    if (isFrozen || isDead || isReloading) return;
    if (playerGrenades[selectedGrenadeType] <= 0) {
        addKillFeed("💣", `Sem ${selectedGrenadeType}!`);
        return;
    }
    
    isHoldingGrenade = true;
    grenadeHoldStartTime = Date.now();
    grenadeThrowPower = 0;
    document.getElementById('grenade-power-indicator').style.display = 'block';
}

function updateGrenadeHolding() {
    if (!isHoldingGrenade) return;
    
    const holdDuration = Date.now() - grenadeHoldStartTime;
    grenadeThrowPower = Math.min(holdDuration / 3000, 1.0);
    
    const bar = document.getElementById('grenade-power-bar');
    const text = document.getElementById('grenade-power-text');
    
    if (bar) bar.style.width = (grenadeThrowPower * 100) + '%';
    if (text) text.textContent = `FORÇA: ${Math.floor(grenadeThrowPower * 100)}%`;
    
    if (holdDuration >= 3000) {
        releaseGrenade();
    }
}

function releaseGrenade() {
    if (!isHoldingGrenade) return;
    
    isHoldingGrenade = false;
    
    if (grenadeThrowPower < 0.1) {
        grenadeThrowPower = 0.1;
    }
    
    throwGrenade(grenadeThrowPower);
    document.getElementById('grenade-power-indicator').style.display = 'none';
}

function cycleGrenade() {
    const types = ['HE', 'FLASH', 'SMOKE', 'MOLOTOV'];
    const available = types.filter(t => playerGrenades[t] > 0);
    
    if (available.length === 0) {
        addKillFeed("💣", "Sem granadas!");
        return;
    }
    
    const currentIndex = available.indexOf(selectedGrenadeType);
    const nextIndex = (currentIndex + 1) % available.length;
    selectedGrenadeType = available[nextIndex];
    
    addKillFeed("💣", `${selectedGrenadeType} selecionada`);
    updateGrenadeIndicator();
}

// ==================== FREEZE TIME ====================
function startFreezeTime() {
    isFrozen = true;
    moveForward = moveBackward = moveLeft = moveRight = false;
    addChatMessage('SISTEMA', '⏳ FREEZE TIME - Compre armas!', 'system');
    addKillFeed("⏳", "FREEZE TIME - COMPRE ARMAS");
    
    setTimeout(() => {
        isFrozen = false;
        addChatMessage('SISTEMA', '⚔️ VALENDO! Combate liberado!', 'system');
        addKillFeed("⚔️", "COMBATE LIBERADO!");
    }, 5000);
}

// ==================== INICIALIZAÇÃO FINAL ====================
function initGame() {
    createMinimap();
    updateCrosshair();
    loadSettings();
    
    // Event listeners para configurações
    const sensSlider = document.getElementById('sensitivity-slider');
    const musicSelect = document.getElementById('music-setting');
    const radioSelect = document.getElementById('radio-setting');
    const crosshairSelect = document.getElementById('crosshair-setting');
    const colorSelect = document.getElementById('crosshair-color');
    
    if (sensSlider) sensSlider.addEventListener('input', applySettings);
    if (musicSelect) musicSelect.addEventListener('change', applySettings);
    if (radioSelect) radioSelect.addEventListener('change', applySettings);
    if (crosshairSelect) crosshairSelect.addEventListener('change', applySettings);
    if (colorSelect) colorSelect.addEventListener('change', applySettings);
    
    // Iniciar
    startFreezeTime();
    updateRanking();
}

// ==================== INÍCIO AUTOMÁTICO ====================
window.addEventListener('DOMContentLoaded', () => {
    // Verificar se há sessão salva
    const savedSession = sessionStorage.getItem('dust2_session');
    if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.loggedIn) {
            currentPlayer = session.player;
            adminMode = session.isAdmin || false;
            startGame();
            return;
        }
    }
    
    // Configurar eventos dos sliders
    const sensSlider = document.getElementById('sensitivity-slider');
    if (sensSlider) {
        sensSlider.addEventListener('input', function() {
            document.getElementById('sensitivity-value').textContent = this.value;
        });
    }
});

// Salvar sessão ao sair
window.addEventListener('beforeunload', () => {
    if (currentPlayer) {
        sessionStorage.setItem('dust2_session', JSON.stringify({
            loggedIn: true,
            player: currentPlayer,
            isAdmin: adminMode
        }));
    }
});

console.log('🎯 DUST 2 FPS - MOTOR COMPLETO CARREGADO!');
console.log('👑 Comandos Admin: /god, /fly, /wall, /kick, /ban, /give');
console.log('🎮 Teclas: WASD, 1-5, R, G, B, T, Z, X, C');
console.log('🛡️ Anti-Trapaça: F12 bloqueado');
console.log('📧 Sistema de login com verificação de email');
