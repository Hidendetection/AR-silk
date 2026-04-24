/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const TRASH_EMOJIS = ['🌪️', '☄️', '🗑️'];
const SATELLITE_EMOJIS = ['🔭', '🛰️'];
const PINCH_THRESHOLD = 55; // pixels
const GRAB_RADIUS = 100; // pixels

const translations = {
  en: {
    store: 'Store',
    crafting: 'Crafting',
    settings: 'Settings',
    plasmaFurnace: 'Plasma Furnace',
    dropTrashHere: 'Drop Trash Here',
    gameModifiers: 'Game Modifiers',
    alienInvasions: 'Alien Invasions',
    alienDesc: 'Hostile enemies will spawn and attack the furnace.',
    itemSpawning: 'Item Spawning',
    itemDesc: 'Trash and materials will drop from the sky.',
    sfx: 'Sound Effects',
    sfxDesc: 'Play sounds when grabbing, scoring, or burning.',
    highPerf: 'High Performance',
    highPerfDesc: 'Disables particles and glows for better FPS.',
    language: 'Language',
    languageDesc: 'Choose your preferred language.',
    restoreDefaults: 'RESTORE DEFAULT SETTINGS',
    gameProgression: 'Game Progression',
    resetDesc: 'Resetting will permanently delete your score and all purchased items.',
    areYouSure: 'Are you absolutely sure?',
    cancel: 'CANCEL',
    yesReset: 'YES, RESET',
    resetProgress: 'RESET ALL PROGRESS',
    hunterStore: 'Hunter Store',
    owned: 'OWNED',
    pts: 'pts',
    gravityWell: 'Quantum Magnet',
    gravityDesc: 'Permanently magnetizes hands. Pulls trash & materials from a wide radius.',
    timeDilator: 'Chronos Field',
    timeDesc: 'Slows all falling debris and enemies to a crawl (0.2x speed) for 30s. Held:',
    plasmaShield: 'Aegis Deflector',
    shieldDesc: 'Equips furnace with a shield. Blocks 1 alien breach and vaporizes it. Charges:',
    comboBoost: 'Supernova Combo',
    comboDesc: 'Ignites scoring potential. Instantly maxes combo to 10x for 30s. Held:',
    furnaceOverdrive: 'Singularity Core',
    overdriveDesc: 'Furnace becomes a black hole. Violently sucks in trash, materials, and enemies for 30s. Held:',
    botFactory: 'Bot Factory',
    plasmaCores: 'Plasma Cores',
    craft: 'CRAFT',
    cost: 'Cost:',
    minionBot: 'Minion Bot',
    minionDesc: 'Automatically grabs trash and throws it into the furnace.',
    ownedCount: 'Owned:',
    gunnerBot: 'Gunner Bot',
    gunnerDesc: 'Shoots fast bullets at incoming aliens.',
    rocketBot: 'Rocket Bot',
    rocketDesc: 'Fires homing rockets with area-of-effect damage.',
    tankBot: 'Tank Bot',
    tankDesc: 'Orbits closely and crushes any alien it touches.',
    timeWarpActive: 'Time Warp Active',
    overdriveActive: 'Overdrive Active',
    useTimeWarp: 'Use Time Warp',
    useComboBoost: 'Use Combo Boost',
    useOverdrive: 'Use Overdrive',
    shield: 'Shield x',
    breach: 'BREACH!',
    vaporized: 'VAPORIZED!',
    deflected: 'DEFLECTED!',
    crushed: 'CRUSHED!',
    killed: 'KILLED!',
    core: 'Core',
    overheat: 'OVERHEAT!',
    coreTemp: 'CORE TEMP',
    bonus: 'BONUS',
    coreStatus: 'Core Status',
    levelHunter: 'Level 24 Hunter',
    totalBounty: 'Total Bounty',
    score: 'Score',
    combo: 'COMBO',
    multiplierActive: 'Multiplier Active',
    resetScore: 'RESET SCORE',
    initializingAR: 'Initializing AR Core...',
    cameraError: 'Camera Error',
    grantPermission: 'GRANT PERMISSION',
    retryRefresh: 'RETRY & REFRESH',
    oops: 'OOPS!',
    shielded: 'SHIELDED!',
    enemyCrowdness: 'Enemy Crowdness',
    enemyCrowdnessDesc: 'Adjust the amount of enemies. Higher density yields more points.',
    crowdLow: 'Low',
    crowdNormal: 'Normal',
    crowdHigh: 'High',
    bossEncounters: 'Boss Encounters',
    bossEncountersDesc: 'Powerful bosses appear when the Boss Meter fills up.',
    bossMeter: 'BOSS',
    bossLevel: 'LVL',
    manualGuide: 'Player Manual',
    manualBasicsTitle: 'Game Basics',
    manualBasicsContent: 'Grab trash (📦🗑️) and materials (🔮) by pinching your index and thumb. Drop them into the glowing Plasma Furnace. Watch the Core Temp: if it hits 100% the furnace overheats, losing points and combo. Keeping temp above 50% gives a 1.5x score multiplier, and above 80% gives 2.0x multiplier. Build Combos by continuously feeding the furnace!',
    manualEnemiesTitle: 'Enemies & Bosses',
    manualEnemiesContent: 'Aliens (👾👽🛸) attack the furnace, reducing your score. Grab and "shake" an alien rapidly to destroy them! When the Boss Meter reaches 1000, a Boss spawns. Bosses shoot red projectiles that steal 30 points. Swipe your hand rapidly across the screen near projectiles to deflect them back at the Boss!',
    manualBotsTitle: 'Bots & Items',
    manualBotsContent: 'Craft bots using Purple Plasma Cores (🔮): Minion Tank Bots gather items. Gunner Bots shoot lasers (5 dmg). Rocket Bots fire rockets (15 dmg) that also damage Bosses. Use the Store with your score: Magnet (pulls items), Time Warp (slows general time), Overdrive (auto-consume for points), and Shield (blocks aliens).',
    close: 'CLOSE'
  },
  vi: {
    store: 'Cửa hàng',
    crafting: 'Chế tạo',
    settings: 'Cài đặt',
    plasmaFurnace: 'Lò Plasma',
    dropTrashHere: 'Thả rác vào đây',
    gameModifiers: 'Tùy chỉnh Game',
    alienInvasions: 'Xâm lăng',
    alienDesc: 'Kẻ thù sẽ xuất hiện và tấn công lò.',
    itemSpawning: 'Rơi vật phẩm',
    itemDesc: 'Rác và nguyên liệu sẽ rơi từ trên trời xuống.',
    sfx: 'Âm thanh',
    sfxDesc: 'Phát âm thanh khi nhặt, ghi điểm hoặc đốt rác.',
    highPerf: 'Hiệu suất cao',
    highPerfDesc: 'Tắt hiệu ứng hạt và ánh sáng để tăng FPS.',
    language: 'Ngôn ngữ',
    languageDesc: 'Chọn ngôn ngữ của bạn.',
    restoreDefaults: 'KHÔI PHỤC MẶC ĐỊNH',
    gameProgression: 'Tiến trình Game',
    resetDesc: 'Xóa toàn bộ điểm số và vật phẩm đã mua.',
    areYouSure: 'Bạn có chắc chắn không?',
    cancel: 'HỦY',
    yesReset: 'CÓ, XÓA',
    resetProgress: 'XÓA MỌI TIẾN TRÌNH',
    hunterStore: 'Cửa hàng',
    owned: 'ĐÃ SỞ HỮU',
    pts: 'điểm',
    gravityWell: 'Nam châm Lượng tử',
    gravityDesc: 'Hút rác và nguyên liệu từ khoảng cách xa.',
    timeDilator: 'Trường Thời gian',
    timeDesc: 'Làm chậm mọi vật thể rơi và kẻ thù (tốc độ 0.2x) trong 30s. Đang có:',
    plasmaShield: 'Khiên Aegis',
    shieldDesc: 'Tạo khiên cho lò. Chặn 1 lần xâm nhập và bốc hơi kẻ thù. Lượt:',
    comboBoost: 'Siêu Combo',
    comboDesc: 'Lập tức đạt combo 10x trong 30s. Đang có:',
    furnaceOverdrive: 'Lõi Kỳ dị',
    overdriveDesc: 'Lò biến thành hố đen, hút mạnh rác, nguyên liệu và kẻ thù trong 30s. Đang có:',
    botFactory: 'Nhà máy Robot',
    plasmaCores: 'Lõi Plasma',
    craft: 'CHẾ TẠO',
    cost: 'Giá:',
    minionBot: 'Robot Thu thập',
    minionDesc: 'Tự động nhặt rác và ném vào lò.',
    ownedCount: 'Đã có:',
    gunnerBot: 'Robot Xạ thủ',
    gunnerDesc: 'Bắn đạn nhanh vào kẻ thù đang tới.',
    rocketBot: 'Robot Tên lửa',
    rocketDesc: 'Bắn tên lửa tự động tìm mục tiêu.',
    tankBot: 'Robot Đỡ đòn',
    tankDesc: 'Bay quanh lò và nghiền nát kẻ thù chạm phải.',
    timeWarpActive: 'Đang làm chậm thời gian',
    overdriveActive: 'Đang quá tải lò',
    useTimeWarp: 'Dùng Làm chậm',
    useComboBoost: 'Dùng Siêu Combo',
    useOverdrive: 'Dùng Quá tải',
    shield: 'Khiên x',
    breach: 'XÂM NHẬP!',
    vaporized: 'BỐC HƠI!',
    deflected: 'ĐÃ CHẶN!',
    crushed: 'NGHIỀN NÁT!',
    killed: 'TIÊU DIỆT!',
    core: 'Lõi',
    overheat: 'QUÁ NHIỆT!',
    coreTemp: 'NHIỆT ĐỘ LÕI',
    bonus: 'THƯỞNG',
    coreStatus: 'Trạng thái Lõi',
    levelHunter: 'Thợ săn Cấp 24',
    totalBounty: 'Tổng tiền thưởng',
    score: 'Điểm',
    combo: 'COMBO',
    multiplierActive: 'Đang nhân điểm',
    resetScore: 'XÓA ĐIỂM',
    initializingAR: 'Đang khởi tạo AR Core...',
    cameraError: 'Lỗi Camera',
    grantPermission: 'CẤP QUYỀN',
    retryRefresh: 'THỬ LẠI & LÀM MỚI',
    oops: 'ỐI!',
    shielded: 'ĐÃ BẢO VỆ!',
    enemyCrowdness: 'Mật độ kẻ thù',
    enemyCrowdnessDesc: 'Chỉnh số lượng kẻ thù. Càng đông càng nhiều điểm.',
    crowdLow: 'Ít',
    crowdNormal: 'Thường',
    crowdHigh: 'Đông',
    bossEncounters: 'Chạm trán Trùm',
    bossEncountersDesc: 'Trùm mạnh mẽ sẽ xuất hiện khi Thanh Trùm đầy.',
    bossMeter: 'TRÙM',
    bossLevel: 'CẤP',
    manualGuide: 'Cẩm nang Người chơi',
    manualBasicsTitle: 'Cơ bản',
    manualBasicsContent: 'Gắp rác (📦🗑️) và nguyên liệu (🔮) bằng cách chụm ngón trỏ và ngón cái. Thả chúng vào Lò Plasma. Chú ý Nhiệt độ Lõi: vượt 100% lò sẽ quá nhiệt, giảm điểm/combo. Giữ trên 50% để nhân 1.5 điểm, trên 80% nhân 2 điểm. Tạo Combo bằng cách cho lò ăn liên tục.',
    manualEnemiesTitle: 'Kẻ thù & Trùm',
    manualEnemiesContent: 'Người ngoài hành tinh (👾👽) tống vào lò sẽ trừ điểm. Bạn có thể gắp và "lắc" chúng thật nhanh để tiêu diệt! Làm đầy Thanh Trùm để gọi Trùm! Trùm bắn đạn đỏ trừ 30 điểm. Vung tay qua lửa đạn thật nhanh để đẩy lùi đạn về phía Trùm!',
    manualBotsTitle: 'Robot & Trang bị',
    manualBotsContent: 'Chế tạo Robot bằng Lõi điện màu tím (🔮): Minion Tank đi nhặt đồ tống vào lò; Gunner bắn pháo (5 DMG); Rocket bắn tên lửa (15 DMG) có thể đánh Trùm. Cửa hàng (mua bằng điểm số): Nam châm (hút đồ), Ngưng đọng (làm chậm tgian), Quá tải (tự động ăn điểm) và Khiên (chặn địch).',
    close: 'ĐÓNG'
  }
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

interface GameObject {
  id: number;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  isGrabbed: boolean;
  type: 'trash' | 'satellite' | 'material' | 'enemy' | 'boss_projectile';
  size: number;
  rotation: number;
  rotationSpeed: number;
  isTractored?: boolean;
  shakeAmount?: number;
  vx?: number;
  vy?: number;
}

interface Bot {
  id: number;
  type: 'minion' | 'gunner' | 'rocket' | 'tank';
  x: number;
  y: number;
  targetId: number | null;
  cooldown: number;
  angle: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'bullet' | 'rocket';
  targetId: number | null;
  life: number;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement>(null);
  const furnaceRef = useRef<HTMLDivElement>(null);
  
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('silk-ar-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [combo, setCombo] = useState(0);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('silk-ar-items');
    return saved ? JSON.parse(saved) : { magnet: false, timeWarp: 0, shield: 0, comboBoost: 0, overdrive: 0 };
  });
  const [activeEffects, setActiveEffects] = useState({ timeWarpUntil: 0, overdriveUntil: 0 });
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [storeMessage, setStoreMessage] = useState<string | null>(null);
  const [craftingMessage, setCraftingMessage] = useState<string | null>(null);
  const [coreTemp, setCoreTemp] = useState(0);
  const [bossDisplay, setBossDisplay] = useState({ active: false, hp: 0, maxHp: 0, level: 1, meter: 0 });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('silk-ar-settings');
    const defaultSettings = { enemiesEnabled: true, itemsEnabled: true, sfxEnabled: true, highPerformanceMode: false, language: 'en', enemyCrowdness: 'normal', bossesEnabled: true };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const t = (key: keyof typeof translations.en) => {
    return translations[settings.language as 'en' | 'vi']?.[key] || translations.en[key];
  };

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('silk-ar-inventory');
    return saved ? JSON.parse(saved) : { materials: 0, minions: 0, gunners: 0, rockets: 0, tanks: 0 };
  });

  useEffect(() => {
    localStorage.setItem('silk-ar-score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('silk-ar-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('silk-ar-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('silk-ar-inventory', JSON.stringify(inventory));
    gameState.current.minionCount = inventory.minions || 0;
    gameState.current.gunnerCount = inventory.gunners || 0;
    gameState.current.rocketCount = inventory.rockets || 0;
    gameState.current.tankCount = inventory.tanks || 0;
  }, [inventory]);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFurnaceActive, setIsFurnaceActive] = useState(false);
  const [isManualOpen, setManualOpen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: 'grab' | 'burn' | 'score') => {
    if (!audioCtxRef.current || !gameState.current.settingsRef.sfxEnabled) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'grab') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'burn') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'score') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  };

  // Mutable game state to avoid re-renders in the animation loop
  const gameState = useRef({
    objects: [] as GameObject[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    handLandmarks: null as any,
    wasPinching: false,
    grabbedObjectId: null as number | null,
    lastSpawnTime: 0,
    nextSpawnId: 0,
    smoothedPinchX: 0,
    smoothedPinchY: 0,
    combo: 0,
    comboExpiry: 0,
    lastMaterialSpawnTime: 0,
    materialSpawnInterval: 15000,
    lastEnemySpawnTime: 0,
    enemySpawnInterval: 10000,
    minionCount: 0,
    gunnerCount: 0,
    rocketCount: 0,
    tankCount: 0,
    bots: [] as Bot[],
    projectiles: [] as Projectile[],
    lastPinchX: 0,
    lastPinchY: 0,
    settingsRef: { enemiesEnabled: true, itemsEnabled: true, sfxEnabled: true, highPerformanceMode: false, language: 'en', enemyCrowdness: 'normal', bossesEnabled: true },
    coreTemp: 0,
    overheatCooldown: 0,
    boss: null as any,
    bossMeter: 0,
    bossLevel: 1,
    handVelocityX: 0,
    handVelocityY: 0,
    isModalOpen: false,
    lastTimestamp: 0,
  });

  const isModalOpen = isStoreOpen || isSettingsOpen || isCraftingOpen || isManualOpen || isGuideOpen;

  useEffect(() => {
    gameState.current.isModalOpen = isModalOpen;
  }, [isModalOpen]);

  // Sync settings ref
  useEffect(() => {
    gameState.current.settingsRef = settings;
  }, [settings]);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      gameState.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color,
        size: Math.random() * 5 + 2
      });
    }
  };

  // Initialize MediaPipe and Camera
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let hands: any;
    let isComponentMounted = true;
    let frameLoopId: number;
    let stream: MediaStream | null = null;
    let initAttempts = 0;
    const MAX_INIT_ATTEMPTS = 100; // 10 seconds at 100ms per attempt

    const initMediaPipe = async () => {
      // Check for mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isComponentMounted) {
          setCameraError("Your browser doesn't support camera access. Please use a modern browser like Chrome or Safari.");
        }
        return;
      }

      // Wait for scripts to be available
      if (!window.Hands) {
        initAttempts++;
        if (initAttempts > MAX_INIT_ATTEMPTS) {
          if (isComponentMounted) {
            setCameraError("Failed to load AR models. Please check your internet connection or disable adblockers.");
          }
          return;
        }
        if (isComponentMounted) setTimeout(initMediaPipe, 100);
        return;
      }

      hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          gameState.current.handLandmarks = results.multiHandLandmarks[0];
        } else {
          gameState.current.handLandmarks = null;
        }
      });

      // Initialize Camera using MediaPipe's utility for better compatibility
      try {
        if (!videoRef.current) return;

        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (!isComponentMounted || !videoRef.current) return;
            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) return;
            
            // Only set camera ready when we actually receive the first frame
            setIsCameraReady(prev => {
              if (!prev) {
                setCameraError(null);
                return true;
              }
              return prev;
            });

            try {
              await hands.send({ image: videoRef.current });
            } catch (e) {
              console.error("MediaPipe error:", e);
            }
          },
          width: 1280,
          height: 720
        });

        let cameraStarted = false;
        
        camera.start().then(() => {
          cameraStarted = true;
        }).catch((err: any) => {
          console.error("Camera start error:", err);
          if (isComponentMounted) {
            let userFriendlyError = "Failed to start camera. Please ensure permissions are granted.";
            if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
              userFriendlyError = "Camera access denied. Please click 'GRANT PERMISSION' below. If it still fails, try opening the app in a new tab using the icon in the top right.";
            } else if (err.name === 'NotFoundError') {
              userFriendlyError = "No camera found. Please connect a camera and try again.";
            }
            setCameraError(userFriendlyError);
          }
        });

        // Timeout if camera doesn't start within 15 seconds
        setTimeout(() => {
          if (isComponentMounted && !cameraStarted && !isCameraReady) {
            setCameraError("Camera initialization timed out. Please check your camera connection and permissions.");
          }
        }, 15000);
        
        // Store camera instance for cleanup if needed
        (videoRef.current as any).cameraInstance = camera;

      } catch (err: any) {
        console.error("Camera setup error:", err);
        if (isComponentMounted) {
          setCameraError(err.message || "Failed to setup camera.");
        }
      }
    };

    initMediaPipe();

    return () => {
      isComponentMounted = false;
      if (frameLoopId) cancelAnimationFrame(frameLoopId);
      if (videoRef.current && (videoRef.current as any).cameraInstance) {
        (videoRef.current as any).cameraInstance.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (hands) hands.close();
    };
  }, []);

  // Game Loop
  useEffect(() => {
    if (!isCameraReady || !canvasRef.current || !uiCanvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const uiCanvas = uiCanvasRef.current;
    const uiCtx = uiCanvas.getContext('2d');
    if (!ctx || !uiCtx) return;

    let animationFrameId: number;

    const loop = (timestamp: number) => {
      // Delta time calculation for pausing
      const state = gameState.current;
      if (!state.lastTimestamp) state.lastTimestamp = timestamp;
      const delta = timestamp - state.lastTimestamp;
      state.lastTimestamp = timestamp;

      // Resize canvas to match window
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      if (uiCanvas.width !== window.innerWidth || uiCanvas.height !== window.innerHeight) {
        uiCanvas.width = window.innerWidth;
        uiCanvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

      // 1. Spawn objects
      if (!state.isModalOpen && state.settingsRef.itemsEnabled && timestamp - state.lastSpawnTime > 1500) {
        const isTrash = Math.random() > 0.4;
        const emojis = isTrash ? TRASH_EMOJIS : SATELLITE_EMOJIS;
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        state.objects.push({
          id: state.nextSpawnId++,
          emoji,
          x: Math.random() * (canvas.width - 100) + 50,
          y: -50,
          speed: Math.random() * 2 + 1.5,
          isGrabbed: false,
          type: isTrash ? 'trash' : 'satellite',
          size: 40 + Math.random() * 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        });
        state.lastSpawnTime = timestamp;
      }

      // 1.5 Spawn Materials
      if (!state.isModalOpen && state.settingsRef.itemsEnabled && timestamp - state.lastMaterialSpawnTime > state.materialSpawnInterval) {
        state.objects.push({
          id: state.nextSpawnId++,
          emoji: '🔮',
          x: Math.random() * (canvas.width - 100) + 50,
          y: -50,
          speed: Math.random() * 1.5 + 1.5,
          isGrabbed: false,
          type: 'material',
          size: 35,
          rotation: 0,
          rotationSpeed: 0.02,
        });
        state.lastMaterialSpawnTime = timestamp;
        state.materialSpawnInterval *= 1.1; // Increase interval by 10% each time
      }

      let spawnMultiplier = 1.0;
      let crowdMultiplier = 1.0;
      if (state.settingsRef.enemyCrowdness === 'low') {
        spawnMultiplier = 1.5; // Longer interval
        crowdMultiplier = 0.5; // Less points
      } else if (state.settingsRef.enemyCrowdness === 'high') {
        spawnMultiplier = 0.5; // Shorter interval
        crowdMultiplier = 2.0; // More points
      }

      // 1.6 Spawn Enemies
      if (!state.isModalOpen && state.settingsRef.enemiesEnabled && timestamp - state.lastEnemySpawnTime > state.enemySpawnInterval * spawnMultiplier && !state.boss) {
        const enemyEmojis = ['👾', '👽', '🛸'];
        const emoji = enemyEmojis[Math.floor(Math.random() * enemyEmojis.length)];
        state.objects.push({
          id: state.nextSpawnId++,
          emoji,
          x: Math.random() * (canvas.width - 100) + 50,
          y: -50,
          speed: Math.random() * 1.5 + 1.0,
          isGrabbed: false,
          type: 'enemy',
          size: 45,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          shakeAmount: 0,
        });
        state.lastEnemySpawnTime = timestamp;
        state.enemySpawnInterval = Math.max(3000, state.enemySpawnInterval * 0.95); // Speeds up over time
      }

      // Boss Spawning
      if (!state.isModalOpen && state.settingsRef.bossesEnabled && !state.boss) {
        if (state.bossMeter >= 1000) {
          state.bossMeter = 0;
          state.boss = {
            hp: 200 * state.bossLevel,
            maxHp: 200 * state.bossLevel,
            x: canvas.width / 2,
            y: -100,
            vx: 3,
            vy: 0,
            cooldown: 2000,
            state: 'entering'
          };
          state.floatingTexts.push({ x: canvas.width / 2, y: canvas.height / 2, text: state.settingsRef.language === 'vi' ? 'TRÙM XUẤT HIỆN!' : 'BOSS APPROACHING!', life: 3.0, color: '#ef4444' });
          setBossDisplay({ active: true, hp: state.boss.hp, maxHp: state.boss.maxHp, level: state.bossLevel, meter: 0 });
        }
      }

      // Sync boss UI state
      if (Math.random() < 0.1) {
        setCoreTemp(state.coreTemp);
        setBossDisplay(prev => ({ 
          ...prev, 
          meter: state.bossMeter, 
          level: state.bossLevel, 
          active: !!state.boss, 
          hp: state.boss ? state.boss.hp : prev.hp,
          maxHp: state.boss ? state.boss.maxHp : prev.maxHp 
        }));
      }

      const processFurnaceCollision = (obj: GameObject) => {
        if (timestamp < state.overheatCooldown) {
          // Furnace is overheated, bounce the object
          obj.y -= 20;
          obj.x += (Math.random() - 0.5) * 20;
          return false; // Did not consume
        }

        if (obj.type === 'enemy') {
          if (Date.now() < activeEffects.overdriveUntil) {
            const addedScore = Math.round(30 * crowdMultiplier);
            setScore(s => s + addedScore);
            state.bossMeter += 15;
            playSound('score');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'BỐC HƠI!' : 'VAPORIZED!'} +${addedScore}`, life: 1.5, color: '#a855f7' });
            spawnParticles(obj.x, obj.y, '#a855f7', 40);
          } else if (items.shield > 0) {
            setItems(prev => ({ ...prev, shield: prev.shield - 1 }));
            state.bossMeter += 10;
            playSound('score');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: state.settingsRef.language === 'vi' ? 'ĐÃ CHẶN!' : 'DEFLECTED!', life: 1.5, color: '#3b82f6' });
            spawnParticles(obj.x, obj.y, '#3b82f6', 40);
          } else {
            setScore(s => Math.max(0, s - 15));
            playSound('burn');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'XÂM NHẬP!' : 'BREACH!'} -15`, life: 1.5, color: '#ef4444' });
            spawnParticles(obj.x, obj.y, '#ef4444', 40);
          }
        } else if (obj.type === 'boss_projectile') {
            setScore(s => Math.max(0, s - 30));
            playSound('burn');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'TRÚNG ĐÒN!' : 'DIRECT HIT!'} -30`, life: 2.0, color: '#ef4444' });
            spawnParticles(obj.x, obj.y, '#ef4444', 60);
        } else if (obj.type === 'material') {
          setInventory(prev => ({ ...prev, materials: prev.materials + 1 }));
          playSound('score');
          state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `+1 ${state.settingsRef.language === 'vi' ? 'Lõi' : 'Core'}`, life: 1.5, color: '#c084fc' });
          spawnParticles(obj.x, obj.y, '#c084fc', 20);
        } else if (obj.type === 'trash') {
          state.combo += 1;
          state.comboExpiry = Date.now() + 5000;
          setCombo(state.combo);

          let multiplier = 1;
          if (state.combo >= 10) multiplier = 3;
          else if (state.combo >= 5) multiplier = 2;
          else if (state.combo >= 2) multiplier = 1.5;

          // Core Temp Bonus
          let tempMultiplier = 1;
          if (state.coreTemp > 80) tempMultiplier = 2;
          else if (state.coreTemp > 50) tempMultiplier = 1.5;

          const basePoints = 10;
          const points = Math.round(basePoints * multiplier * tempMultiplier);
          state.bossMeter += 2;

          setScore(s => s + points);
          playSound('score');
          
          const comboLabel = state.combo > 1 ? ` ${state.combo}x ${state.settingsRef.language === 'vi' ? 'COMBO' : 'Combo'}!` : '';
          const multLabel = multiplier > 1 || tempMultiplier > 1 ? ` [${multiplier * tempMultiplier}x]` : '';
          
          state.floatingTexts.push({ 
            x: obj.x, 
            y: obj.y - 20, 
            text: `+${points}${multLabel}`, 
            life: 1.2, 
            color: multiplier > 1 ? '#fbbf24' : '#4ade80' 
          });
          
          if (state.combo > 1) {
            state.floatingTexts.push({
              x: obj.x,
              y: obj.y - 50,
              text: comboLabel,
              life: 1.5,
              color: '#f59e0b'
            });
          }

          spawnParticles(obj.x, obj.y, multiplier > 1 ? '#fbbf24' : '#4ade80', 20);

          // Increase Core Temp
          state.coreTemp += 8;
          if (state.coreTemp >= 100) {
            state.overheatCooldown = timestamp + 5000;
            state.coreTemp = 0;
            state.combo = 0;
            setCombo(0);
            setScore(s => Math.max(0, s - 50));
            playSound('burn');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 80, text: `${state.settingsRef.language === 'vi' ? 'QUÁ NHIỆT!' : 'OVERHEAT!'} -50`, life: 2.0, color: '#ef4444' });
            spawnParticles(obj.x, obj.y, '#ef4444', 100);
          }
        } else {
          // Penalty logic for satellites
          state.combo = 0;
          setCombo(0);

          let penalty = 0;
          let label = state.settingsRef.language === 'vi' ? 'ỐI!' : 'OOPS!';
          if (obj.emoji === '🛰️') {
            penalty = 20;
            label = '-20';
          } else if (obj.emoji === '🔭') {
            penalty = 10;
            label = '-10';
          }

          if (items.shield > 0) {
            setItems(prev => ({ ...prev, shield: prev.shield - 1 }));
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: state.settingsRef.language === 'vi' ? 'ĐÃ BẢO VỆ!' : 'SHIELDED!', life: 1.0, color: '#60a5fa' });
            spawnParticles(obj.x, obj.y, '#60a5fa', 20);
          } else {
            setScore(s => Math.max(0, s - penalty));
            playSound('burn');
            state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: label, life: 1.0, color: '#f87171' });
            spawnParticles(obj.x, obj.y, '#ef4444', 30);
          }
        }
        
        setIsFurnaceActive(true);
        setTimeout(() => setIsFurnaceActive(false), 300);
        return true; // Consumed
      };

      // 2. Process Hand Logic
      let pinchX = 0;
      let pinchY = 0;
      let isPinching = false;

      if (state.handLandmarks) {
        const thumbTip = state.handLandmarks[4];
        const indexTip = state.handLandmarks[8];

        const video = videoRef.current;
        let renderWidth = canvas.width;
        let renderHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (video && video.videoWidth > 0 && video.videoHeight > 0) {
          const videoRatio = video.videoWidth / video.videoHeight;
          const windowRatio = canvas.width / canvas.height;

          if (windowRatio > videoRatio) {
            // Window is wider than video. Video is scaled to fit width.
            renderHeight = canvas.width / videoRatio;
            offsetY = (canvas.height - renderHeight) / 2;
          } else {
            // Window is taller than video. Video is scaled to fit height.
            renderWidth = canvas.height * videoRatio;
            offsetX = (canvas.width - renderWidth) / 2;
          }
        }

        // Map normalized coordinates to canvas, accounting for object-cover
        // and mirroring (1 - x)
        const tx = offsetX + (1 - thumbTip.x) * renderWidth; 
        const ty = offsetY + thumbTip.y * renderHeight;
        const ix = offsetX + (1 - indexTip.x) * renderWidth;
        const iy = offsetY + indexTip.y * renderHeight;

        const dist = Math.hypot(ix - tx, iy - ty);
        isPinching = dist < PINCH_THRESHOLD;
        
        const targetPinchX = (tx + ix) / 2;
        const targetPinchY = (ty + iy) / 2;

        // Calculate hand velocity
        state.handVelocityX = targetPinchX - (state.lastPinchX || targetPinchX);
        state.handVelocityY = targetPinchY - (state.lastPinchY || targetPinchY);
        state.lastPinchX = targetPinchX;
        state.lastPinchY = targetPinchY;
        const handSpeed = Math.hypot(state.handVelocityX, state.handVelocityY);

        // Check for projectile deflection (wiping gesture)
        if (handSpeed > 15 && state.boss) {
          for (let i = 0; i < state.objects.length; i++) {
            const obj = state.objects[i];
            if (obj.type === 'boss_projectile') {
              const dToHand = Math.hypot(obj.x - targetPinchX, obj.y - targetPinchY);
              if (dToHand < 60) {
                // Deflect!
                obj.vy = -15; // Send back up fast
                obj.vx = state.handVelocityX * 0.3; // Give it some horizontal sway
                
                playSound('score'); // Using score sound as clink
                state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: state.settingsRef.language === 'vi' ? 'ĐÃ CHẶN!' : 'DEFLECTED!', life: 1.5, color: '#60a5fa' });
                spawnParticles(obj.x, obj.y, '#60a5fa', 20);
                
                // Add a player projectile aimed at boss
                state.projectiles.push({
                  id: Math.random(),
                  x: obj.x,
                  y: obj.y,
                  vx: obj.vx,
                  vy: obj.vy,
                  type: 'rocket',
                  targetId: null, // we will manually hit boss
                  life: 100
                });
                
                // Remove the original boss projectile
                state.objects.splice(i, 1);
                i--;
              }
            }
          }
        }

        // Initialize or smooth
        if (state.smoothedPinchX === 0 && state.smoothedPinchY === 0) {
          state.smoothedPinchX = targetPinchX;
          state.smoothedPinchY = targetPinchY;
        } else {
          state.smoothedPinchX += (targetPinchX - state.smoothedPinchX) * 0.4;
          state.smoothedPinchY += (targetPinchY - state.smoothedPinchY) * 0.4;
        }

        pinchX = state.smoothedPinchX;
        pinchY = state.smoothedPinchY;

        if (isPinching) {
          if (!state.wasPinching) {
            // AR Hand UI Interaction: Click Buttons
            const el = document.elementFromPoint(pinchX, pinchY);
            if (el) {
              const clickable = el.closest('button, .clickable');
              if (clickable) {
                (clickable as HTMLElement).click();
              }
            }

            // Try to grab the closest object within radius
            let closestObj = null;
            let minDistance = GRAB_RADIUS;
            
            for (let i = state.objects.length - 1; i >= 0; i--) {
              const obj = state.objects[i];
              const objDist = Math.hypot(obj.x - pinchX, obj.y - pinchY);
              if (objDist < minDistance) {
                minDistance = objDist;
                closestObj = obj;
              }
            }

            if (closestObj) {
              closestObj.isGrabbed = true;
              state.grabbedObjectId = closestObj.id;
              playSound('grab');
              spawnParticles(closestObj.x, closestObj.y, '#818cf8', 15);
            }
          } else if (state.grabbedObjectId !== null) {
            // Shake to kill logic for enemies
            const grabbedObj = state.objects.find(o => o.id === state.grabbedObjectId);
            if (grabbedObj && grabbedObj.type === 'enemy') {
              const dx = pinchX - state.lastPinchX;
              const dy = pinchY - state.lastPinchY;
              const dist = Math.hypot(dx, dy);
              grabbedObj.shakeAmount = (grabbedObj.shakeAmount || 0) + dist;
              
              if (grabbedObj.shakeAmount > 800) { // Shake threshold
                // Killed enemy!
                const addedScore = Math.round(20 * crowdMultiplier);
                setScore(s => s + addedScore);
                state.bossMeter += 15;
                playSound('score');
                state.floatingTexts.push({ x: grabbedObj.x, y: grabbedObj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'TIÊU DIỆT!' : 'KILLED!'} +${addedScore}`, life: 1.5, color: '#ef4444' });
                spawnParticles(grabbedObj.x, grabbedObj.y, '#ef4444', 30);
                state.objects = state.objects.filter(o => o.id !== grabbedObj.id);
                state.grabbedObjectId = null;
              }
            }
          }
        } else {
          // Released
          if (state.grabbedObjectId !== null) {
            const grabbedObj = state.objects.find(o => o.id === state.grabbedObjectId);
            if (grabbedObj) {
              grabbedObj.isGrabbed = false;
              
              // Check if dropped in furnace
              if (furnaceRef.current) {
                const rect = furnaceRef.current.getBoundingClientRect();
                if (
                  grabbedObj.x >= rect.left && grabbedObj.x <= rect.right &&
                  grabbedObj.y >= rect.top && grabbedObj.y <= rect.bottom
                ) {
                  // Dropped in furnace!
                  if (processFurnaceCollision(grabbedObj)) {
                    // Remove object if consumed
                    state.objects = state.objects.filter(o => o.id !== grabbedObj.id);
                  }
                }
              }
            }
            state.grabbedObjectId = null;
          }
        }
        state.wasPinching = isPinching;
      } else {
        // Lost hand tracking, release object
        if (state.grabbedObjectId !== null) {
          const grabbedObj = state.objects.find(o => o.id === state.grabbedObjectId);
          if (grabbedObj) grabbedObj.isGrabbed = false;
          state.grabbedObjectId = null;
        }
        state.wasPinching = false;
        state.smoothedPinchX = 0;
        state.smoothedPinchY = 0;
      }

      state.lastPinchX = pinchX;
      state.lastPinchY = pinchY;

      // 3. Update & Draw Objects
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = state.objects.length - 1; i >= 0; i--) {
        const obj = state.objects[i];

        if (obj.isGrabbed) {
          obj.x = pinchX;
          obj.y = pinchY;
        } else if (obj.isTractored) {
          // Movement handled by minion logic
        } else if (!state.isModalOpen) {
          // Apply Magnet effect
          if (items.magnet && state.handLandmarks) {
            const distToHand = Math.hypot(obj.x - pinchX, obj.y - pinchY);
            if (distToHand < 400 && (obj.type === 'trash' || obj.type === 'material')) {
              obj.x += (pinchX - obj.x) * 0.08;
              obj.y += (pinchY - obj.y) * 0.08;
            }
          }

          // Apply Furnace Overdrive effect
          const isOverdriveActive = Date.now() < activeEffects.overdriveUntil;
          if (isOverdriveActive && furnaceRef.current && (obj.type === 'trash' || obj.type === 'material' || obj.type === 'enemy')) {
            const rect = furnaceRef.current.getBoundingClientRect();
            const fx = rect.left + rect.width / 2;
            const fy = rect.top + rect.height / 2;
            const dx = fx - obj.x;
            const dy = fy - obj.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 600) {
              obj.x += (dx / dist) * 10.0;
              obj.y += (dy / dist) * 10.0;
            }
          }

          // Apply Time Warp effect
          const isTimeWarpActive = Date.now() < activeEffects.timeWarpUntil;
          const speedMult = isTimeWarpActive ? 0.2 : 1.0;
          
          // Enemies move towards furnace if they are close enough, otherwise drop
          if (obj.type === 'enemy' && furnaceRef.current) {
            const rect = furnaceRef.current.getBoundingClientRect();
            const fx = rect.left + rect.width / 2;
            const fy = rect.top + rect.height / 2;
            const dx = fx - obj.x;
            const dy = fy - obj.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 500) {
              obj.x += (dx / dist) * obj.speed * speedMult;
              obj.y += (dy / dist) * obj.speed * speedMult;
            } else {
              obj.y += obj.speed * speedMult;
            }
          } else {
            obj.y += obj.speed * speedMult;
          }
          
          // Check collision with furnace directly for ALL objects
          if (furnaceRef.current) {
            const rect = furnaceRef.current.getBoundingClientRect();
            if (obj.x >= rect.left && obj.x <= rect.right && obj.y >= rect.top && obj.y <= rect.bottom) {
              // Only auto-consume enemies, boss projectiles or if overdrive is active. User must drag trash/materials.
              if (obj.type === 'enemy' || obj.type === 'boss_projectile' || isOverdriveActive) {
                if (processFurnaceCollision(obj)) {
                  state.objects.splice(i, 1);
                  continue;
                }
              }
            }
          }
          
          obj.rotation += obj.rotationSpeed * speedMult;
        }

        // Remove if off screen
        if (obj.y > canvas.height + 100) {
          state.objects.splice(i, 1);
          continue;
        }

        // Draw
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.font = `${obj.size}px Arial`;
        
        // Add a subtle glow
        if (!state.settingsRef.highPerformanceMode) {
          ctx.shadowColor = obj.type === 'trash' ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 200, 255, 0.5)';
          ctx.shadowBlur = 15;
        }
        
        ctx.fillText(obj.emoji, 0, 0);
        ctx.restore();
      }

      // Draw Particles
      if (!state.settingsRef.highPerformanceMode) {
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          if (!state.isModalOpen) {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
          }
          if (p.life <= 0) {
            state.particles.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Clear particles to prevent memory leak if toggled off
        state.particles = [];
      }

      // Draw Floating Texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 2;
        ft.life -= 0.02;
        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        if (!state.settingsRef.highPerformanceMode) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#000';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.font = 'bold 32px "Inter", sans-serif';
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw Combo Bar
      if (state.combo > 0) {
        const timeLeft = Math.max(0, state.comboExpiry - Date.now());
        const ratio = timeLeft / 5000;
        
        ctx.save();
        ctx.translate(canvas.width / 2, 80);
        
        // Background bar
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.roundRect(-100, 0, 200, 10, 5);
        ctx.fill();
        
        // Foreground bar
        ctx.fillStyle = ratio > 0.3 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.roundRect(-100, 0, 200 * ratio, 10, 5);
        ctx.fill();
        
        ctx.restore();
      }

      // 4. Bot Logic
      const totalBots = state.minionCount + state.gunnerCount + state.rocketCount + state.tankCount;
      
      // Sync bots array
      while (state.bots.length < totalBots) {
        let type: 'minion' | 'gunner' | 'rocket' | 'tank' = 'minion';
        const currentMinions = state.bots.filter(b => b.type === 'minion').length;
        const currentGunners = state.bots.filter(b => b.type === 'gunner').length;
        const currentRockets = state.bots.filter(b => b.type === 'rocket').length;
        
        if (currentMinions < state.minionCount) type = 'minion';
        else if (currentGunners < state.gunnerCount) type = 'gunner';
        else if (currentRockets < state.rocketCount) type = 'rocket';
        else type = 'tank';

        state.bots.push({
          id: Math.random(),
          type,
          x: canvas.width / 2,
          y: canvas.height / 2,
          targetId: null,
          cooldown: 0,
          angle: Math.random() * Math.PI * 2
        });
      }
      if (state.bots.length > totalBots) {
        state.bots.length = totalBots;
      }

      const furnaceRect = furnaceRef.current?.getBoundingClientRect();
      const furnaceX = furnaceRect ? furnaceRect.left + furnaceRect.width / 2 : canvas.width - 100;
      const furnaceY = furnaceRect ? furnaceRect.top + furnaceRect.height / 2 : canvas.height - 100;

      state.bots.forEach(bot => {
        // Find closest enemy for combat bots
        let closestEnemy = null;
        let minEnemyDist = Infinity;
        if (bot.type !== 'minion') {
          if (state.boss) {
            closestEnemy = { id: -1, x: state.boss.x, y: state.boss.y, type: 'boss' } as any;
          } else {
            for (const obj of state.objects) {
              if (obj.type === 'enemy' && obj.y > 0) {
                const dist = Math.hypot(obj.x - bot.x, obj.y - bot.y);
                if (dist < minEnemyDist) {
                  minEnemyDist = dist;
                  closestEnemy = obj;
                }
              }
            }
          }
        }

        if (bot.type === 'tank') {
          if (closestEnemy) {
            const dx = closestEnemy.x - bot.x;
            const dy = closestEnemy.y - bot.y;
            const dist = Math.hypot(dx, dy);
            bot.x += (dx / dist) * 4; // Tank chase speed
            bot.y += (dy / dist) * 4;
          } else {
            bot.angle += 0.02;
            const orbitRadius = 80;
            const targetX = furnaceX + Math.cos(bot.angle) * orbitRadius;
            const targetY = furnaceY + Math.sin(bot.angle) * orbitRadius;
            bot.x += (targetX - bot.x) * 0.1;
            bot.y += (targetY - bot.y) * 0.1;
          }
        } else {
          bot.angle += 0.02;
          const orbitRadius = bot.type === 'minion' ? 120 : 160;
          bot.x = furnaceX + Math.cos(bot.angle) * orbitRadius;
          bot.y = furnaceY + Math.sin(bot.angle) * orbitRadius;
        }

        if (bot.cooldown > 0) {
          bot.cooldown -= 16;
        }

        if (bot.type === 'minion') {
          if (!bot.targetId && bot.cooldown <= 0) {
            const target = state.objects.find(o => o.type === 'trash' && !o.isGrabbed && !o.isTractored && o.y > 0);
            if (target) {
              bot.targetId = target.id;
              target.isTractored = true;
            }
          }

          if (bot.targetId) {
            const target = state.objects.find(o => o.id === bot.targetId);
            if (target) {
              const dx = furnaceX - target.x;
              const dy = furnaceY - target.y;
              const dist = Math.hypot(dx, dy);
              
              if (dist < 40) {
                target.isGrabbed = false;
                if (processFurnaceCollision(target)) {
                  state.objects = state.objects.filter(o => o.id !== target.id);
                  bot.targetId = null;
                  bot.cooldown = 2000;
                } else {
                  // If not consumed (e.g., overheat), drop it
                  bot.targetId = null;
                  bot.cooldown = 1000;
                }
              } else {
                target.x += dx * 0.08;
                target.y += dy * 0.08;
                
                ctx.beginPath();
                ctx.moveTo(bot.x, bot.y);
                ctx.lineTo(target.x, target.y);
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
              }
            } else {
              bot.targetId = null;
            }
          }
        } else if (bot.type === 'gunner' || bot.type === 'rocket') {
          if (bot.cooldown <= 0 && closestEnemy) {
            const dx = closestEnemy.x - bot.x;
            const dy = closestEnemy.y - bot.y;
            const dist = Math.hypot(dx, dy);
            
            state.projectiles.push({
              id: Math.random(),
              x: bot.x,
              y: bot.y,
              vx: (dx / dist) * (bot.type === 'gunner' ? 20 : 8),
              vy: (dy / dist) * (bot.type === 'gunner' ? 20 : 8),
              type: bot.type === 'gunner' ? 'bullet' : 'rocket',
              targetId: closestEnemy.id,
              life: 100
            });
            
            bot.cooldown = bot.type === 'gunner' ? 800 : 2500;
          }
        } else if (bot.type === 'tank') {
          // Tank crushes nearby enemies
          for (let i = state.objects.length - 1; i >= 0; i--) {
            const obj = state.objects[i];
            if (obj.type === 'enemy') {
              const dist = Math.hypot(obj.x - bot.x, obj.y - bot.y);
              if (dist < 60) {
                setScore(s => s + 20);
                playSound('score');
                state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'NGHIỀN NÁT!' : 'CRUSHED!'} +20`, life: 1.5, color: '#ef4444' });
                spawnParticles(obj.x, obj.y, '#ef4444', 30);
                state.objects.splice(i, 1);
              }
            }
          }
        }
        
        // Draw bot
        ctx.font = bot.type === 'tank' ? '40px Arial' : '30px Arial';
        let botEmoji = '🤖';
        if (bot.type === 'gunner') botEmoji = '🔫';
        if (bot.type === 'rocket') botEmoji = '🚀';
        if (bot.type === 'tank') botEmoji = '🛡️';
        ctx.fillText(botEmoji, bot.x, bot.y);
      });

      // 4.5 Projectiles
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const p = state.projectiles[i];
        
        if (p.targetId) {
          const target = state.objects.find(o => o.id === p.targetId);
          if (target) {
            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const dist = Math.hypot(dx, dy);
            
            if (p.type === 'rocket') {
              p.vx += (dx / dist) * 1.5;
              p.vy += (dy / dist) * 1.5;
              
              // Speed limit for rockets
              const speed = Math.hypot(p.vx, p.vy);
              if (speed > 12) {
                p.vx = (p.vx / speed) * 12;
                p.vy = (p.vy / speed) * 12;
              }
            } else if (p.type === 'bullet') {
              // Bullets have strong homing to ensure they hit moving targets
              p.vx += (dx / dist) * 3.0;
              p.vy += (dy / dist) * 3.0;
              
              // Speed limit for bullets
              const speed = Math.hypot(p.vx, p.vy);
              if (speed > 25) {
                p.vx = (p.vx / speed) * 25;
                p.vy = (p.vy / speed) * 25;
              }
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        // Draw projectile
        ctx.beginPath();
        if (p.type === 'bullet') {
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
        } else {
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
        }
        ctx.fill();

        // Collision with enemies
        let hit = false;
        for (let j = state.objects.length - 1; j >= 0; j--) {
          const obj = state.objects[j];
          if (obj.type === 'enemy') {
            const dist = Math.hypot(obj.x - p.x, obj.y - p.y);
            if (dist < (p.type === 'rocket' ? 40 : 20)) {
              hit = true;
              setScore(s => s + 20);
              playSound('score');
              state.floatingTexts.push({ x: obj.x, y: obj.y - 20, text: `${state.settingsRef.language === 'vi' ? 'TIÊU DIỆT!' : 'KILLED!'} +20`, life: 1.5, color: '#ef4444' });
              spawnParticles(obj.x, obj.y, '#ef4444', p.type === 'rocket' ? 50 : 20);
              state.objects.splice(j, 1);
              break;
            }
          }
        }

        if (hit || p.life <= 0) {
          state.projectiles.splice(i, 1);
        } else if (state.boss) {
          // Check collision with Boss
          const dist = Math.hypot(state.boss.x - p.x, state.boss.y - p.y);
          if (dist < 80) { // boss radius
            state.boss.hp -= (p.type === 'rocket' ? 15 : 5);
            state.projectiles.splice(i, 1);
            spawnParticles(p.x, p.y, '#fbbf24', 20);
            
            // Check boss death
            if (state.boss.hp <= 0) {
              state.floatingTexts.push({ x: state.boss.x, y: state.boss.y, text: state.settingsRef.language === 'vi' ? 'ĐÃ TIÊU DIỆT TRÙM!' : 'BOSS DEFEATED!', life: 3.0, color: '#fbbf24' });
              spawnParticles(state.boss.x, state.boss.y, '#fbbf24', 100);
              const bossPoints = 500 * state.bossLevel;
              setScore(s => s + bossPoints);
              state.floatingTexts.push({ x: state.boss.x, y: state.boss.y + 30, text: `+${bossPoints}`, life: 3.0, color: '#4ade80' });
              playSound('score');
              state.bossLevel += 1;
              state.boss = null;
            }
          }
        }
      }

      // Boss Logic Loop
      if (state.boss) {
        let b = state.boss;
        if (b.state === 'entering') {
          b.y += 2;
          if (b.y > 100) b.state = 'fighting';
        } else if (b.state === 'fighting') {
          b.x += b.vx;
          if (b.x < 100 || b.x > canvas.width - 100) b.vx *= -1;
          
          b.cooldown -= 16;
          if (b.cooldown <= 0) {
            b.cooldown = 2000 - Math.min(1500, state.bossLevel * 100);
            // Spawn boss projectile
            state.objects.push({
              id: state.nextSpawnId++,
              emoji: '🔴',
              x: b.x,
              y: b.y + 50,
              speed: 5 + state.bossLevel,
              isGrabbed: false,
              type: 'boss_projectile',
              size: 50,
              rotation: 0,
              rotationSpeed: 0.1,
              vx: (Math.random() - 0.5) * 5,
              vy: 5 + state.bossLevel * 0.5
            });
            playSound('burn');
          }
        }
        
        // Draw boss
        ctx.font = '80px Arial';
        ctx.fillText('🛸', b.x - 40, b.y + 40);
      }

      // 5. Draw Hand Feedback (Optional, for better UX)
      if (state.handLandmarks) {
        uiCtx.beginPath();
        uiCtx.arc(pinchX, pinchY, isPinching ? 15 : 8, 0, 2 * Math.PI);
        uiCtx.fillStyle = isPinching ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        uiCtx.fill();
        uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        uiCtx.lineWidth = 2;
        uiCtx.stroke();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraReady]);

  const handleResetScore = useCallback(() => {
    setScore(0);
    setCombo(0);
    gameState.current.combo = 0;
  }, []);

  const requestCameraPermission = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      // If successful, stop the stream immediately so MediaPipe can take over
      stream.getTracks().forEach(track => track.stop());
      // Reload the page to trigger the automatic initialization with permission now granted
      window.location.reload();
    } catch (err: any) {
      console.error("Manual camera request error:", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setCameraError("Camera access was denied again. Please check your browser settings and ensure you haven't blocked the camera for this site.");
      } else {
        setCameraError(`Failed to acquire camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleResetProgression = useCallback(() => {
    setScore(0);
    setCombo(0);
    gameState.current.combo = 0;
    setItems({ magnet: false, timeWarp: 0, shield: 0 });
    setInventory({ materials: 0, minions: 0 });
    gameState.current.minionBots = [];
    localStorage.removeItem('silk-ar-score');
    localStorage.removeItem('silk-ar-items');
    localStorage.removeItem('silk-ar-inventory');
    setShowResetConfirm(false);
  }, []);

  const craftMinion = (type: 'minion' | 'gunner' | 'rocket' | 'tank', cost: number) => {
    if (inventory.materials >= cost) {
      setInventory(prev => {
        const next = { ...prev, materials: prev.materials - cost };
        if (type === 'minion') next.minions = (next.minions || 0) + 1;
        if (type === 'gunner') next.gunners = (next.gunners || 0) + 1;
        if (type === 'rocket') next.rockets = (next.rockets || 0) + 1;
        if (type === 'tank') next.tanks = (next.tanks || 0) + 1;
        return next;
      });
      playSound('score');
      setCraftingMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} Bot crafted successfully!`);
      setTimeout(() => setCraftingMessage(null), 2000);
    } else {
      setCraftingMessage("Not enough Plasma Cores!");
      setTimeout(() => setCraftingMessage(null), 2000);
    }
  };

  const getStorePrice = (baseCost: number) => {
    return Math.floor(baseCost * (1 + combo * 0.1));
  };

  const buyItem = (itemType: 'magnet' | 'timeWarp' | 'shield' | 'comboBoost' | 'overdrive', baseCost: number) => {
    const actualCost = getStorePrice(baseCost);
    if (score >= actualCost) {
      setScore(s => s - actualCost);
      if (itemType === 'magnet') {
        setItems(prev => ({ ...prev, magnet: true }));
      } else {
        setItems(prev => ({ ...prev, [itemType]: (prev[itemType] || 0) + 1 }));
      }
      playSound('score');
      setStoreMessage(`Successfully purchased!`);
      setTimeout(() => setStoreMessage(null), 2000);
    } else {
      setStoreMessage("Not enough points!");
      setTimeout(() => setStoreMessage(null), 2000);
    }
  };

  const useTimeWarp = () => {
    if (items.timeWarp > 0) {
      setItems(prev => ({ ...prev, timeWarp: prev.timeWarp - 1 }));
      setActiveEffects(prev => ({ ...prev, timeWarpUntil: Date.now() + 30000 }));
      playSound('score');
    }
  };

  const useComboBoost = () => {
    if (items.comboBoost > 0) {
      setItems(prev => ({ ...prev, comboBoost: prev.comboBoost - 1 }));
      gameState.current.combo = Math.max(gameState.current.combo, 10);
      gameState.current.comboExpiry = Date.now() + 30000;
      setCombo(gameState.current.combo);
      playSound('score');
    }
  };

  const useOverdrive = () => {
    if (items.overdrive > 0) {
      setItems(prev => ({ ...prev, overdrive: prev.overdrive - 1 }));
      setActiveEffects(prev => ({ ...prev, overdriveUntil: Date.now() + 30000 }));
      playSound('score');
    }
  };

  return (
    <div 
      className="bg-background font-body text-on-surface overflow-hidden h-screen w-screen relative"
      onClick={initAudio}
    >
      {/* Bottom Layer: AR Camera Feed */}
      <div className="fixed inset-0 z-0 bg-slate-900 flex items-center justify-center">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover" 
          style={{ transform: 'scaleX(-1)' }}
          autoPlay 
          playsInline 
          muted 
        />
      </div>

      // Middle Layer: Transparent Canvas for AR Entities
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-40 pointer-events-none"
      />
      {/* UI Interaction pointer overlay */}
      <canvas 
        ref={uiCanvasRef}
        className="fixed inset-0 z-[200] pointer-events-none"
      />

      {/* Top Navigation Shell */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-transparent drop-shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-indigo-600 tracking-tight font-headline">Silk AR</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline text-sm font-semibold">
          <button className="text-slate-600 hover:text-indigo-500 transition-colors" onClick={() => setIsStoreOpen(true)}>{t('store')}</button>
          <button className="text-slate-600 hover:text-indigo-500 transition-colors" onClick={() => setIsCraftingOpen(true)}>{t('crafting')}</button>
          <button className="text-slate-600 hover:text-indigo-500 transition-colors" onClick={() => setManualOpen(true)}>{t('manualGuide')}</button>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95 duration-150">
            <span className="material-symbols-outlined text-indigo-600">leaderboard</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined text-indigo-600">settings</span>
          </button>
        </div>
      </nav>

      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 flex-col p-4 bg-slate-100/80 backdrop-blur-md rounded-r-2xl h-[calc(100vh-80px)] mt-20 shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.6)] hidden lg:flex">
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="w-12 h-12 rounded-xl neomorphic-raised bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
          </div>
          <div>
            <h3 className="font-headline font-semibold text-on-background leading-tight">{t('coreStatus')}</h3>
            <p className="text-xs text-on-surface-variant font-medium">{t('levelHunter')}</p>
          </div>
        </div>
        <div className="space-y-4 font-headline text-base font-medium">
          <button 
            className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all"
            onClick={() => setIsStoreOpen(true)}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span>{t('store')}</span>
          </button>
          <button 
            className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all"
            onClick={() => setIsCraftingOpen(true)}
          >
            <span className="material-symbols-outlined">build</span>
            <span>{t('crafting')}</span>
          </button>
          <button 
            className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all"
            onClick={() => setManualOpen(true)}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span>{t('manualGuide')}</span>
          </button>
          <button 
            className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-all"
            onClick={handleResetProgression}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            <span>{t('resetProgress')}</span>
          </button>
        </div>
        <div className="mt-auto p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-indigo-600">DNA STRAND</span>
            <span className="text-on-surface-variant">88%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div className="w-[88%] h-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          </div>
        </div>
      </aside>

      {/* Top Center Content UI: Boss Health Bar and Meter */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all w-full max-w-md px-4">
        {settings.bossesEnabled && (
          bossDisplay.active ? (
            <div className="bg-surface/90 backdrop-blur-md rounded-2xl neomorphic-raised p-4 border border-red-500/30 shadow-[0_4px_24px_rgba(239,68,68,0.3)] animate-in slide-in-from-top flex flex-col gap-2">
              <div className="flex justify-between items-center text-red-600 font-headline font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">warning</span> ALIEN BOSS</span>
                <span className="text-sm bg-red-100 px-2 py-0.5 rounded-lg border border-red-200">LVL {bossDisplay.level}</span>
              </div>
              <div className="w-full h-4 bg-slate-200 neomorphic-inset rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]"
                  style={{ width: `${Math.max(0, (bossDisplay.hp / bossDisplay.maxHp) * 100)}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-surface/40 backdrop-blur-md rounded-2xl neomorphic-raised p-3 border border-white/20 flex flex-col gap-1 w-64 mx-auto opacity-70">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span>{t('bossMeter')}</span>
                <span>{Math.floor(bossDisplay.meter)}/1000</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest neomorphic-inset rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, (bossDisplay.meter / 1000) * 100))}%` }}
                ></div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Top-Left Content UI: Score Display Widget */}
      <div className="fixed top-24 left-8 z-30 pointer-events-none lg:left-72 transition-all">
        <div className="p-5 bg-surface/40 backdrop-blur-xl neomorphic-raised rounded-2xl flex flex-col gap-4 border border-white/20 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface neomorphic-inset flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{t('totalBounty')}</p>
              <p className="text-3xl font-extrabold text-on-surface leading-none font-headline">{t('score')}: <span className="text-indigo-600">{score}</span></p>
            </div>
          </div>

          {combo > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-amber-50/90 rounded-xl border border-amber-200/50 animate-in fade-in slide-in-from-left-2 shadow-lg shadow-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-2xl animate-pulse">local_fire_department</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-amber-600 uppercase tracking-tighter leading-none">{combo} {t('combo')}</span>
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{t('multiplierActive')}</span>
                </div>
              </div>
              <div className="px-2 py-1 bg-amber-500 text-white text-xs font-black rounded-lg shadow-sm shadow-amber-200">
                {combo >= 10 ? '3.0x' : combo >= 5 ? '2.0x' : combo >= 2 ? '1.5x' : '1.0x'}
              </div>
            </div>
          )}

          <button 
            onClick={handleResetScore}
            className="py-2 px-4 bg-surface-container-high hover:bg-surface-dim text-on-surface-variant text-xs font-bold rounded-xl neomorphic-raised transition-all active:scale-95"
          >
            {t('resetScore')}
          </button>
        </div>
        
        {!isCameraReady && !cameraError && (
          <div className="mt-4 px-4 py-2 bg-yellow-100/80 backdrop-blur-md rounded-xl inline-flex items-center gap-3 border border-yellow-200/50">
            <span className="material-symbols-outlined text-xs text-yellow-600 animate-spin">sync</span>
            <span className="text-xs font-semibold text-yellow-800 tracking-wide">{t('initializingAR')}</span>
          </div>
        )}
        
        {cameraError && (
          <div className="mt-4 px-6 py-4 bg-red-50/90 backdrop-blur-xl rounded-2xl flex flex-col gap-3 border border-red-200 shadow-xl max-w-xs pointer-events-auto">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-red-900 leading-tight">{t('cameraError')}</span>
                <span className="text-xs font-medium text-red-700 leading-relaxed">{cameraError}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={requestCameraPermission}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">videocam</span>
                {t('grantPermission')}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all active:scale-95 border border-slate-200"
              >
                {t('retryRefresh')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom-Right Content UI: Plasma Furnace Module */}
      <div className="fixed bottom-10 right-10 z-30">
        <div className="flex flex-col items-end gap-6">
          {/* Energy Status Bar (Vertical) */}
          <div className="flex items-center gap-4">
            <div className="h-48 w-4 bg-surface-container-highest neomorphic-inset rounded-full relative overflow-hidden">
              <div 
                className={`absolute bottom-0 w-full transition-all duration-300 rounded-full ${coreTemp >= 100 ? 'bg-red-600 animate-pulse' : coreTemp > 80 ? 'bg-orange-500' : coreTemp > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ height: `${Math.min(100, coreTemp)}%` }}
              ></div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{t('coreTemp')}</p>
              <p className={`text-xl font-headline font-bold ${coreTemp >= 100 ? 'text-red-600' : coreTemp > 80 ? 'text-orange-500' : coreTemp > 50 ? 'text-yellow-500' : 'text-blue-500'}`}>
                {Math.round(coreTemp)}%
              </p>
            </div>
          </div>
          
          {/* Main Plasma Furnace Controller */}
          <div 
            ref={furnaceRef}
            className={`p-8 bg-surface rounded-[2.5rem] neomorphic-raised relative overflow-hidden group plasma-furnace-module transition-all duration-300 ${isFurnaceActive ? 'scale-110 brightness-150 shadow-[0_0_50px_rgba(220,38,38,0.8)]' : ''}`}
          >
            {/* Inner Decorative Inset */}
            <div className="absolute inset-0 bg-gradient-to-tr from-error/5 to-transparent opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className={`w-24 h-24 rounded-full neomorphic-inset bg-surface-container-highest flex items-center justify-center transition-transform duration-200 ${isFurnaceActive ? 'scale-90' : 'group-active:scale-95'}`}>
                {/* The "Furnace" Core */}
                <div className={`w-16 h-16 rounded-full bg-error flex items-center justify-center transition-all duration-300 ${isFurnaceActive ? 'shadow-[0_0_50px_rgba(255,100,100,1)] scale-125' : 'shadow-[0_0_25px_rgba(220,38,38,0.6)] animate-pulse-heat'}`}>
                  <span className="material-symbols-outlined text-white text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-headline font-extrabold text-on-background tracking-tight">{t('plasmaFurnace')}</h2>
                <p className="text-xs font-medium text-on-surface-variant opacity-75">{t('dropTrashHere')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contextual Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4">
        <div className="bg-surface/90 backdrop-blur-xl rounded-2xl neomorphic-raised flex justify-around items-center p-3 border border-white/20">
          <button 
            onClick={() => setIsStoreOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-indigo-600"
          >
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>shopping_cart</span>
            <span className="text-[10px] font-bold uppercase">Store</span>
          </button>
          <button 
            onClick={() => setIsCraftingOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-indigo-600"
          >
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>build</span>
            <span className="text-[10px] font-bold uppercase">Craft</span>
          </button>
          {/* Center Action */}
          <div className="relative -top-6">
            <button className="w-16 h-16 rounded-full bg-primary shadow-xl shadow-primary/40 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-3xl">view_in_ar</span>
            </button>
          </div>
          <button 
            onClick={() => setManualOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-2xl">menu_book</span>
            <span className="text-[10px] whitespace-nowrap font-bold uppercase">Manual</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-[2.5rem] neomorphic-raised p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-indigo-600">close</span>
            </button>
            
            <h2 className="text-2xl font-headline font-extrabold text-indigo-600 mb-6">{t('settings')}</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low">
                <h3 className="font-bold text-on-surface mb-2">{t('gameModifiers')}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('alienInvasions')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('alienDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, enemiesEnabled: !s.enemiesEnabled }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.enemiesEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.enemiesEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('itemSpawning')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('itemDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, itemsEnabled: !s.itemsEnabled }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.itemsEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.itemsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('sfx')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('sfxDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, sfxEnabled: !s.sfxEnabled }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.sfxEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.sfxEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('highPerf')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('highPerfDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, highPerformanceMode: !s.highPerformanceMode }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.highPerformanceMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.highPerformanceMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('bossEncounters')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('bossEncountersDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, bossesEnabled: !s.bossesEnabled }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.bossesEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.bossesEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('enemyCrowdness')}</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">{t('enemyCrowdnessDesc')}</p>
                  </div>
                  <select
                    className="p-1 rounded bg-slate-100 text-xs font-bold text-slate-700 outline-none"
                    value={settings.enemyCrowdness}
                    onChange={(e) => setSettings(s => ({ ...s, enemyCrowdness: e.target.value as any }))}
                  >
                    <option value="low">{t('crowdLow')}</option>
                    <option value="normal">{t('crowdNormal')}</option>
                    <option value="high">{t('crowdHigh')}</option>
                  </select>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t('language')}</p>
                    <p className="text-[10px] text-on-surface-variant">{t('languageDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings(s => ({ ...s, language: s.language === 'en' ? 'vi' : 'en' }))}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs"
                  >
                    {settings.language === 'en' ? 'English' : 'Tiếng Việt'}
                  </button>
                </div>
                <button 
                  onClick={() => setSettings({ enemiesEnabled: true, itemsEnabled: true, sfxEnabled: true, highPerformanceMode: false, language: 'en' })}
                  className="w-full mt-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                  {t('restoreDefaults')}
                </button>
              </div>

              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low">
                <h3 className="font-bold text-on-surface mb-2">{t('gameProgression')}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{t('resetDesc')}</p>
                
                {showResetConfirm ? (
                  <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95">
                    <p className="text-sm font-bold text-red-600 text-center">{t('areYouSure')}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95"
                      >
                        {t('cancel')}
                      </button>
                      <button 
                        onClick={handleResetProgression}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95"
                      >
                        {t('yesReset')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm neomorphic-raised flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">restart_alt</span>
                    {t('resetProgress')}
                  </button>
                )}
              </div>

              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low">
                <h3 className="font-bold text-on-surface mb-2">Audio</h3>
                <button 
                  onClick={initAudio}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm neomorphic-raised flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">volume_up</span>
                  RE-INITIALIZE AUDIO
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Silk AR v1.2.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Crafting Modal */}
      {isCraftingOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-[2.5rem] neomorphic-raised p-8 relative overflow-hidden">
            <button 
              onClick={() => setIsCraftingOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-indigo-600">close</span>
            </button>
            
            <h2 className="text-2xl font-headline font-extrabold text-indigo-600 mb-6">Crafting</h2>
            
            {craftingMessage && (
              <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-top-2">
                {craftingMessage}
              </div>
            )}

            <div className="mb-6 p-4 rounded-2xl neomorphic-inset bg-surface-container-low flex items-center justify-between">
              <span className="font-bold text-on-surface">Your Materials:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔮</span>
                <span className="text-xl font-black text-indigo-600">{inventory.materials}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Minion Bot */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full neomorphic-raised bg-surface flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Minion Bot</h3>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Automatically pulls trash into the furnace.</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">Owned: {inventory.minions}</p>
                  </div>
                </div>
                <button 
                  onClick={() => craftMinion('minion', 3)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm neomorphic-raised flex flex-col items-center justify-center transition-all active:scale-95"
                >
                  <span>CRAFT</span>
                  <span className="text-[10px] opacity-80">Cost: 3 🔮</span>
                </button>
              </div>

              {/* Gunner Bot */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full neomorphic-raised bg-surface flex items-center justify-center text-2xl">
                    🔫
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Gunner Bot</h3>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Shoots fast projectiles at hostile aliens.</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">Owned: {inventory.gunners}</p>
                  </div>
                </div>
                <button 
                  onClick={() => craftMinion('gunner', 5)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm neomorphic-raised flex flex-col items-center justify-center transition-all active:scale-95"
                >
                  <span>CRAFT</span>
                  <span className="text-[10px] opacity-80">Cost: 5 🔮</span>
                </button>
              </div>

              {/* Rocket Bot */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full neomorphic-raised bg-surface flex items-center justify-center text-2xl">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Rocket Bot</h3>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Fires slow, homing rockets with blast radius.</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">Owned: {inventory.rockets}</p>
                  </div>
                </div>
                <button 
                  onClick={() => craftMinion('rocket', 10)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm neomorphic-raised flex flex-col items-center justify-center transition-all active:scale-95"
                >
                  <span>CRAFT</span>
                  <span className="text-[10px] opacity-80">Cost: 10 🔮</span>
                </button>
              </div>

              {/* Tank Bot */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full neomorphic-raised bg-surface flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Tank Bot</h3>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Orbits closely and crushes any alien it touches.</p>
                    <p className="text-xs font-bold text-indigo-600 mt-1">Owned: {inventory.tanks}</p>
                  </div>
                </div>
                <button 
                  onClick={() => craftMinion('tank', 15)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm neomorphic-raised flex flex-col items-center justify-center transition-all active:scale-95"
                >
                  <span>CRAFT</span>
                  <span className="text-[10px] opacity-80">Cost: 15 🔮</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {isStoreOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-[2.5rem] neomorphic-raised p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsStoreOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-indigo-600">close</span>
            </button>
            
            <h2 className="text-2xl font-headline font-extrabold text-indigo-600 mb-6">Hunter Store</h2>
            
            {storeMessage && (
              <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-top-2">
                {storeMessage}
              </div>
            )}

            <div className="space-y-6">
              {/* Magnet */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-indigo-600">all_inclusive</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Quantum Magnet</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Permanently magnetizes hands. Pulls trash & materials from a wide radius.</p>
                  </div>
                </div>
                <button 
                  disabled={items.magnet}
                  onClick={() => buyItem('magnet', 500)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${items.magnet ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white neomorphic-raised'}`}
                >
                  {items.magnet ? 'OWNED' : `${getStorePrice(500)} pts`}
                </button>
              </div>

              {/* Time Warp */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">hourglass_bottom</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Chronos Field</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Slows all falling debris and enemies to a crawl (0.2x speed) for 30s. Held: {items.timeWarp || 0}</p>
                  </div>
                </div>
                <button 
                  onClick={() => buyItem('timeWarp', 300)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs neomorphic-raised"
                >
                  {getStorePrice(300)} pts
                </button>
              </div>

              {/* Shield */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">security</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Aegis Deflector</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Equips furnace with a shield. Blocks 1 alien breach and vaporizes it. Charges: {items.shield || 0}</p>
                  </div>
                </div>
                <button 
                  onClick={() => buyItem('shield', 400)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs neomorphic-raised"
                >
                  {getStorePrice(400)} pts
                </button>
              </div>

              {/* Combo Boost */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600">flare</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Supernova Combo</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Ignites scoring potential. Instantly maxes combo to 10x for 30s. Held: {items.comboBoost || 0}</p>
                  </div>
                </div>
                <button 
                  onClick={() => buyItem('comboBoost', 1000)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs neomorphic-raised"
                >
                  {getStorePrice(1000)} pts
                </button>
              </div>

              {/* Furnace Overdrive */}
              <div className="flex items-center justify-between p-4 rounded-2xl neomorphic-inset bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600">cyclone</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Singularity Core</p>
                    <p className="text-[10px] text-on-surface-variant max-w-[150px]">Furnace becomes a black hole. Violently sucks in trash, materials, and enemies for 30s. Held: {items.overdrive || 0}</p>
                  </div>
                </div>
                <button 
                  onClick={() => buyItem('overdrive', 800)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs neomorphic-raised"
                >
                  {getStorePrice(800)} pts
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-xs font-bold text-on-surface-variant">Current Balance: <span className="text-indigo-600">{score} pts</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Active Buffs UI */}
      <div className="fixed top-24 right-8 z-30 flex flex-col gap-3">
        {Date.now() < activeEffects.timeWarpUntil && (
          <div className="px-4 py-2 bg-amber-500 text-white rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
            <span className="material-symbols-outlined text-sm">timer</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Time Warp Active</span>
          </div>
        )}
        {Date.now() < activeEffects.overdriveUntil && (
          <div className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
            <span className="material-symbols-outlined text-sm">whatshot</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Overdrive Active</span>
          </div>
        )}
        {items.timeWarp > 0 && Date.now() >= activeEffects.timeWarpUntil && (
          <button 
            onClick={useTimeWarp}
            className="px-4 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl shadow-sm flex items-center gap-2 hover:bg-amber-200 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">timer</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Use Time Warp ({items.timeWarp})</span>
          </button>
        )}
        {items.comboBoost > 0 && (
          <button 
            onClick={useComboBoost}
            className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-xl shadow-sm flex items-center gap-2 hover:bg-purple-200 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Use Combo Boost ({items.comboBoost})</span>
          </button>
        )}
        {items.overdrive > 0 && Date.now() >= activeEffects.overdriveUntil && (
          <button 
            onClick={useOverdrive}
            className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-xl shadow-sm flex items-center gap-2 hover:bg-red-200 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">whatshot</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Use Overdrive ({items.overdrive})</span>
          </button>
        )}
        {items.shield > 0 && (
          <div className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Shield x{items.shield}</span>
          </div>
        )}
      </div>

      {/* Manual Guide Modal */}
      {isManualOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] neomorphic-raised p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setManualOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full neomorphic-raised bg-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-indigo-600">close</span>
            </button>
            
            <div className="flex items-center justify-center gap-3 mb-6 relative">
              <span className="material-symbols-outlined text-4xl text-indigo-600">menu_book</span>
              <h2 className="text-3xl font-headline font-extrabold text-indigo-600 tracking-tight">{t('manualGuide')}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low border border-indigo-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-2xl text-indigo-500">lightbulb</span>
                  <h3 className="text-lg font-bold text-slate-800">{t('manualBasicsTitle')}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {t('manualBasicsContent')}
                </p>
              </div>

              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low border border-red-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-2xl text-red-500">warning</span>
                  <h3 className="text-lg font-bold text-slate-800">{t('manualEnemiesTitle')}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {t('manualEnemiesContent')}
                </p>
              </div>

              <div className="p-6 rounded-2xl neomorphic-inset bg-surface-container-low border border-emerald-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-2xl text-emerald-500">smart_toy</span>
                  <h3 className="text-lg font-bold text-slate-800">{t('manualBotsTitle')}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {t('manualBotsContent')}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setManualOpen(false)}
              className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm neomorphic-raised transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Decorative Overlay: Grid & Crosshairs */}
      <div className="fixed inset-0 z-20 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-indigo-500 rounded-full opacity-50 flex items-center justify-center">
          <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
          <div className="absolute w-full h-px bg-indigo-500/50"></div>
          <div className="absolute h-full w-px bg-indigo-500/50"></div>
        </div>
      </div>
    </div>
  );
}
