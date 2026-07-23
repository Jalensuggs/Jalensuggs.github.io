const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const PHOTO_URLS = Array.from(
  { length: 12 },
  (_, index) => `相片素材/${index + 1}.jpg`,
);

const loadPhotos = () =>
  Promise.all(
    PHOTO_URLS.map(
      (url) =>
        new Promise((resolve) => {
          const image = new Image();
          image.decoding = "async";
          image.onload = () => resolve(image);
          image.onerror = () => {
            console.warn(`Tape photo could not be loaded: ${url}`);
            resolve(null);
          };
          image.src = url;
        }),
    ),
  ).then((photos) => photos.filter(Boolean));

const elements = {
  stage: document.getElementById("tapeGameStage"),
  shell: document.getElementById("tapeGameShell"),
  statusText: document.getElementById("tapeGameStatus"),
  pointCount: document.getElementById("tapePointCount"),
  fps: document.getElementById("tapeFps"),
  orbitStatus: document.getElementById("tapeOrbitStatus"),
  orbitButton: document.getElementById("tapeOrbit"),
  rewindButton: document.getElementById("tapeRewind"),
  resetButton: document.getElementById("tapeReset"),
};

if (Object.values(elements).every(Boolean)) {
  let game = null;
  let loading = false;

  const loadGame = async () => {
    if (game || loading) return;
    loading = true;
    try {
      elements.statusText.textContent = "Loading 12 photos";
      const [THREE, photos] = await Promise.all([import(THREE_URL), loadPhotos()]);
      game = new RollingTapeGame(THREE, elements, photos);
    } catch (error) {
      console.error("Tape game failed to load:", error);
      elements.statusText.textContent = "3D unavailable";
      elements.stage.innerHTML =
        '<div class="tape-game-error">The 3D playground could not load. Check your connection and refresh the page.</div>';
    }
  };

  const loader = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadGame();
        loader.disconnect();
      }
    },
    { rootMargin: "600px 0px" },
  );
  loader.observe(elements.shell);
}

class RollingTapeGame {
  constructor(THREE, ui, photos) {
    this.THREE = THREE;
    this.ui = ui;
    this.stage = ui.stage;
    this.shell = ui.shell;
    this.photos = photos;

    this.rollRadius = 0.94;
    this.ribbonWidth = 1.18;
    this.innerRadius = this.rollRadius * 0.5;
    this.sampleStep = 0.105;
    this.maxPoints = window.matchMedia("(max-width: 720px)").matches ? 460 : 720;
    this.curlSegments = 20;
    this.textureCycle = Math.max(1, photos.length) * this.ribbonWidth;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.position = new THREE.Vector2();
    this.velocity = new THREE.Vector2();
    this.target = new THREE.Vector2(0, 5);
    this.acceleration = new THREE.Vector2();
    this.deltaPosition = new THREE.Vector2();
    this.path = [];
    this.yaw = 0;
    this.totalDistance = 0;
    this.autoAngle = Math.PI * 0.22;
    this.pointerNdc = new THREE.Vector2();
    this.pointerActive = false;
    this.lastPointerTime = -Infinity;
    this.raycaster = new THREE.Raycaster();
    this.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.floorHit = new THREE.Vector3();

    this.paused = false;
    this.pausedBeforeOrbit = false;
    this.isOrbitMode = false;
    this.pointerDown = false;
    this.downInfo = { x: 0, y: 0, time: 0 };
    this.lastPointer = { x: 0, y: 0 };
    this.orbitYaw = 0.65;
    this.orbitPitch = 0.55;
    this.orbitDistance = 11.5;
    this.rewindState = null;

    this.isVisible = false;
    this.isDisposed = false;
    this.rafId = 0;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsStartedAt = this.lastFrameTime;
    this.textures = [];

    this.initScene();
    this.createFloor();
    this.createRoll();
    this.createRibbon();
    this.bindEvents();
    this.resize();
    this.seedTrail();
    this.updateRoll();
    this.rebuildRibbon();
    this.snapCamera();
    this.updateUi("Rolling — move to steer");
  }

  initScene() {
    const THREE = this.THREE;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xd3d3d1, 28, 78);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !window.matchMedia("(max-width: 720px)").matches,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.stage.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x77736c, 2.25));
    this.sun = new THREE.DirectionalLight(0xffffff, 5.6);
    this.sun.position.set(5, 11, 4);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1536, 1536);
    this.sun.shadow.camera.left = -12;
    this.sun.shadow.camera.right = 12;
    this.sun.shadow.camera.top = 12;
    this.sun.shadow.camera.bottom = -12;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 30;
    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sun, this.sunTarget);
    this.sun.target = this.sunTarget;

    const rim = new THREE.DirectionalLight(0xf97316, 1.8);
    rim.position.set(-5, 4, -6);
    this.scene.add(rim);

    this.cameraPosition = new THREE.Vector3();
    this.cameraLookAt = new THREE.Vector3();
    this.cameraDesired = new THREE.Vector3();
    this.cameraOffset = new THREE.Vector3(7.4, 7.4, 9.6);
  }

  createFloor() {
    const THREE = this.THREE;
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xd3d3d1,
      roughness: 0.98,
      metalness: 0,
    });
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.012;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    const grid = new THREE.GridHelper(180, 180, 0xb8b8b5, 0xc8c8c5);
    grid.position.y = -0.006;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    grid.material.depthWrite = false;
    this.scene.add(grid);
  }

  drawPhotoPanel(context, image, x, y, width, height) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const panelRatio = width / height;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (imageRatio > panelRatio) {
      sourceWidth = image.naturalHeight * panelRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else if (imageRatio < panelRatio) {
      sourceHeight = image.naturalWidth / panelRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height,
    );
  }

  createTapeAtlas() {
    const THREE = this.THREE;
    const panelCount = Math.max(1, this.photos.length);
    const panelSize = Math.max(
      128,
      Math.min(512, Math.floor(this.renderer.capabilities.maxTextureSize / panelCount)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = panelSize;
    canvas.height = panelSize * panelCount;
    const context = canvas.getContext("2d");

    const baseGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    baseGradient.addColorStop(0, "#858783");
    baseGradient.addColorStop(0.07, "#c6c7c2");
    baseGradient.addColorStop(0.5, "#e1e1dc");
    baseGradient.addColorStop(0.93, "#b2b3ae");
    baseGradient.addColorStop(1, "#777975");
    context.fillStyle = baseGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    this.photos.forEach((photo, photoIndex) => {
      this.drawPhotoPanel(
        context,
        photo,
        0,
        photoIndex * panelSize,
        panelSize,
        panelSize,
      );
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.textures.push(texture);
    return texture;
  }

  createCapTexture() {
    const THREE = this.THREE;
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    const center = size / 2;
    const gradient = context.createRadialGradient(center, center, 100, center, center, center);
    gradient.addColorStop(0, "#70716e");
    gradient.addColorStop(0.18, "#999a96");
    gradient.addColorStop(0.72, "#b8b9b5");
    gradient.addColorStop(1, "#777975");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    context.translate(center, center);
    for (let i = 0; i < 180; i += 1) {
      const radius = 185 + i * 1.7 + Math.random() * 3;
      context.strokeStyle = `rgba(${50 + Math.random() * 80},${50 + Math.random() * 80},${50 + Math.random() * 80},${0.16 + Math.random() * 0.3})`;
      context.lineWidth = 0.7 + Math.random() * 2;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.textures.push(texture);
    return texture;
  }

  createRoll() {
    const THREE = this.THREE;
    this.tapeAtlas = this.createTapeAtlas();
    this.photos = [];
    const capTexture = this.createCapTexture();
    const barrelTexture = this.tapeAtlas.clone();
    barrelTexture.needsUpdate = true;
    barrelTexture.wrapT = THREE.RepeatWrapping;
    barrelTexture.repeat.set(
      1,
      (Math.PI * 2 * this.rollRadius) / this.textureCycle,
    );
    this.textures.push(barrelTexture);

    this.rollGroup = new THREE.Group();
    this.spinner = new THREE.Group();
    this.rollGroup.add(this.spinner);
    this.scene.add(this.rollGroup);

    const barrelGeometry = new THREE.CylinderGeometry(
      this.rollRadius,
      this.rollRadius,
      this.ribbonWidth,
      96,
      1,
      true,
    );
    const barrelUv = barrelGeometry.attributes.uv;
    for (let i = 0; i < barrelUv.count; i += 1) {
      const oldU = barrelUv.getX(i);
      const oldV = barrelUv.getY(i);
      barrelUv.setXY(i, oldV, oldU);
    }
    barrelGeometry.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(
      barrelGeometry,
      new THREE.MeshStandardMaterial({
        map: barrelTexture,
        emissive: 0xffffff,
        emissiveMap: barrelTexture,
        emissiveIntensity: 0.08,
        roughness: 0.86,
        metalness: 0.01,
      }),
    );
    barrel.castShadow = true;
    this.spinner.add(barrel);

    const capMaterial = new THREE.MeshStandardMaterial({
      map: capTexture,
      roughness: 0.98,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const capGeometry = new THREE.RingGeometry(
      this.innerRadius,
      this.rollRadius,
      96,
      1,
    );
    const capRight = new THREE.Mesh(capGeometry, capMaterial);
    capRight.rotation.y = Math.PI / 2;
    capRight.position.x = this.ribbonWidth / 2 + 0.004;
    capRight.castShadow = true;
    this.spinner.add(capRight);

    const capLeft = new THREE.Mesh(capGeometry, capMaterial);
    capLeft.rotation.y = -Math.PI / 2;
    capLeft.position.x = -this.ribbonWidth / 2 - 0.004;
    capLeft.castShadow = true;
    this.spinner.add(capLeft);

    const coreGeometry = new THREE.CylinderGeometry(
      this.innerRadius,
      this.innerRadius,
      this.ribbonWidth * 1.01,
      64,
      1,
      true,
    );
    coreGeometry.rotateZ(Math.PI / 2);
    const core = new THREE.Mesh(
      coreGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x777873,
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    this.spinner.add(core);

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowContext = shadowCanvas.getContext("2d");
    const shadowGradient = shadowContext.createRadialGradient(128, 128, 10, 128, 128, 120);
    shadowGradient.addColorStop(0, "rgba(0,0,0,.34)");
    shadowGradient.addColorStop(0.5, "rgba(0,0,0,.16)");
    shadowGradient.addColorStop(1, "rgba(0,0,0,0)");
    shadowContext.fillStyle = shadowGradient;
    shadowContext.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    this.textures.push(shadowTexture);
    this.rollShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(this.rollRadius * 3.8, this.ribbonWidth * 2.5),
      new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    this.rollShadow.rotation.x = -Math.PI / 2;
    this.rollShadow.position.y = 0.002;
    this.scene.add(this.rollShadow);
  }

  createRibbon() {
    const THREE = this.THREE;
    const maxSegments = this.maxPoints + this.curlSegments + 2;
    const vertexCount = (maxSegments + 1) * 2;
    this.ribbonPositions = new Float32Array(vertexCount * 3);
    this.ribbonNormals = new Float32Array(vertexCount * 3);
    this.ribbonUvs = new Float32Array(vertexCount * 2);
    const indices = new Uint16Array(maxSegments * 6);

    for (let i = 0; i < maxSegments; i += 1) {
      const vertex = i * 2;
      indices.set(
        [vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2],
        i * 6,
      );
    }

    this.ribbonGeometry = new THREE.BufferGeometry();
    this.ribbonGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.ribbonPositions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    this.ribbonGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(this.ribbonNormals, 3).setUsage(THREE.DynamicDrawUsage),
    );
    this.ribbonGeometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(this.ribbonUvs, 2).setUsage(THREE.DynamicDrawUsage),
    );
    this.ribbonGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    this.ribbonGeometry.setDrawRange(0, 0);

    this.ribbon = new THREE.Mesh(
      this.ribbonGeometry,
      new THREE.MeshBasicMaterial({
        map: this.tapeAtlas,
        color: 0xffffff,
        side: THREE.DoubleSide,
        shadowSide: THREE.FrontSide,
        toneMapped: true,
      }),
    );
    this.ribbon.frustumCulled = false;
    this.ribbon.castShadow = true;
    this.ribbon.receiveShadow = false;
    this.scene.add(this.ribbon);
  }

  writeVertex(index, x, y, z, nx, ny, nz, u, v) {
    const p = index * 3;
    const t = index * 2;
    this.ribbonPositions[p] = x;
    this.ribbonPositions[p + 1] = y;
    this.ribbonPositions[p + 2] = z;
    this.ribbonNormals[p] = nx;
    this.ribbonNormals[p + 1] = ny;
    this.ribbonNormals[p + 2] = nz;
    this.ribbonUvs[t] = u;
    this.ribbonUvs[t + 1] = v;
  }

  rebuildRibbon() {
    if (this.path.length < 2) {
      this.ribbonGeometry.setDrawRange(0, 0);
      return;
    }

    const halfWidth = this.ribbonWidth / 2;
    const tailDistance = this.path[0].s;
    let vertexIndex = 0;
    let previousTangentX = Math.sin(this.yaw);
    let previousTangentZ = Math.cos(this.yaw);

    for (let i = 0; i < this.path.length; i += 1) {
      const point = this.path[i];
      const before = this.path[Math.max(0, i - 1)];
      const after = this.path[Math.min(this.path.length - 1, i + 1)];
      let tangentX = after.x - before.x;
      let tangentZ = after.z - before.z;
      const length = Math.hypot(tangentX, tangentZ);

      if (length > 0.0001) {
        tangentX /= length;
        tangentZ /= length;
        if (tangentX * previousTangentX + tangentZ * previousTangentZ < 0) {
          tangentX = previousTangentX;
          tangentZ = previousTangentZ;
        }
      } else {
        tangentX = previousTangentX;
        tangentZ = previousTangentZ;
      }
      previousTangentX = tangentX;
      previousTangentZ = tangentZ;

      const sideX = tangentZ;
      const sideZ = -tangentX;
      const fade = Math.min(1, Math.max(0, (point.s - tailDistance) / 1.8));
      const width = halfWidth * fade;
      const y = 0.016 + (point.s - tailDistance) * 0.00045;
      const textureV = point.s / this.textureCycle;

      this.writeVertex(
        vertexIndex++,
        point.x + sideX * width,
        y,
        point.z + sideZ * width,
        0,
        1,
        0,
        0,
        textureV,
      );
      this.writeVertex(
        vertexIndex++,
        point.x - sideX * width,
        y,
        point.z - sideZ * width,
        0,
        1,
        0,
        1,
        textureV,
      );
    }

    const forwardX = Math.sin(this.yaw);
    const forwardZ = Math.cos(this.yaw);
    const sideX = forwardZ;
    const sideZ = -forwardX;
    const topY = 0.02 + (this.totalDistance - tailDistance) * 0.00045;

    this.writeVertex(
      vertexIndex++,
      this.position.x + sideX * halfWidth,
      topY,
      this.position.y + sideZ * halfWidth,
      0,
      1,
      0,
      0,
      this.totalDistance / this.textureCycle,
    );
    this.writeVertex(
      vertexIndex++,
      this.position.x - sideX * halfWidth,
      topY,
      this.position.y - sideZ * halfWidth,
      0,
      1,
      0,
      1,
      this.totalDistance / this.textureCycle,
    );

    const curlAngle = 0.95;
    for (let i = 1; i <= this.curlSegments; i += 1) {
      const angle = (i / this.curlSegments) * curlAngle;
      const radius = this.rollRadius + 0.012;
      const centerX = this.position.x + forwardX * Math.sin(angle) * radius;
      const centerZ = this.position.y + forwardZ * Math.sin(angle) * radius;
      const centerY = topY + radius * (1 - Math.cos(angle));
      const normalX = -forwardX * Math.sin(angle);
      const normalY = Math.cos(angle);
      const normalZ = -forwardZ * Math.sin(angle);
      const textureV =
        (this.totalDistance + angle * this.rollRadius) / this.textureCycle;

      this.writeVertex(
        vertexIndex++,
        centerX + sideX * halfWidth,
        centerY,
        centerZ + sideZ * halfWidth,
        normalX,
        normalY,
        normalZ,
        0,
        textureV,
      );
      this.writeVertex(
        vertexIndex++,
        centerX - sideX * halfWidth,
        centerY,
        centerZ - sideZ * halfWidth,
        normalX,
        normalY,
        normalZ,
        1,
        textureV,
      );
    }

    const segments = vertexIndex / 2 - 1;
    this.ribbonGeometry.setDrawRange(0, segments * 6);
    this.ribbonGeometry.attributes.position.needsUpdate = true;
    this.ribbonGeometry.attributes.normal.needsUpdate = true;
    this.ribbonGeometry.attributes.uv.needsUpdate = true;
    this.ribbonGeometry.computeBoundingSphere();
  }

  pushPathPoint() {
    this.path.push({
      x: this.position.x,
      z: this.position.y,
      s: this.totalDistance,
    });
    if (this.path.length > this.maxPoints) this.path.shift();
  }

  stepMotion(deltaTime) {
    const spring = 13.5;
    const damping = 5.1;
    const maxSpeed = 7.2;

    this.acceleration.copy(this.target).sub(this.position).multiplyScalar(spring);
    this.acceleration.addScaledVector(this.velocity, -damping);
    this.velocity.addScaledVector(this.acceleration, deltaTime);
    const speed = this.velocity.length();
    if (speed > maxSpeed) this.velocity.multiplyScalar(maxSpeed / speed);

    this.deltaPosition.copy(this.velocity).multiplyScalar(deltaTime);
    const distance = this.deltaPosition.length();
    if (distance < 0.000001) return;

    this.position.add(this.deltaPosition);
    this.totalDistance += distance;

    if (speed > 0.04) {
      const targetYaw = Math.atan2(this.velocity.x, this.velocity.y);
      this.yaw = this.lerpAngle(
        this.yaw,
        targetYaw,
        1 - Math.exp(-6.8 * deltaTime),
      );
    }

    const last = this.path[this.path.length - 1];
    if (!last || Math.hypot(this.position.x - last.x, this.position.y - last.z) >= this.sampleStep) {
      this.pushPathPoint();
    }
  }

  lerpAngle(from, to, amount) {
    let difference = to - from;
    while (difference > Math.PI) difference -= Math.PI * 2;
    while (difference < -Math.PI) difference += Math.PI * 2;
    return from + difference * amount;
  }

  updateTarget(time, deltaTime) {
    const pointerIdle = performance.now() - this.lastPointerTime > 2800;
    if (this.pointerActive && !pointerIdle) {
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      if (this.raycaster.ray.intersectPlane(this.floorPlane, this.floorHit)) {
        this.target.set(this.floorHit.x, this.floorHit.z);
        return;
      }
    }

    this.autoAngle +=
      deltaTime *
      (0.3 + Math.sin(time * 0.00031) * 0.42 + Math.sin(time * 0.00013 + 2) * 0.24);
    this.target.set(
      this.position.x + Math.sin(this.autoAngle) * 5.2,
      this.position.y + Math.cos(this.autoAngle) * 5.2,
    );
  }

  updateRoll() {
    this.rollGroup.position.set(
      this.position.x,
      this.rollRadius,
      this.position.y,
    );
    this.rollGroup.rotation.y = this.yaw;
    this.spinner.rotation.x = this.totalDistance / this.rollRadius;
    this.rollShadow.position.set(this.position.x, 0.002, this.position.y);
    this.rollShadow.rotation.z = this.yaw - Math.PI / 2;

    this.sun.position.set(this.position.x + 5, 11, this.position.y + 4);
    this.sunTarget.position.set(this.position.x, 0, this.position.y);
    this.sunTarget.updateMatrixWorld();
  }

  seedTrail() {
    this.path = [];
    this.position.set(0, 0);
    this.velocity.set(0, 0);
    this.target.set(0, 5);
    this.yaw = 0;
    this.totalDistance = 0;
    this.autoAngle = Math.PI * 0.22;
    this.pushPathPoint();

    const steps = window.matchMedia("(max-width: 720px)").matches ? 230 : 360;
    for (let i = 0; i < steps; i += 1) {
      const time = i / 60;
      this.autoAngle +=
        (1 / 60) *
        (0.3 + Math.sin(time * 0.31) * 0.42 + Math.sin(time * 0.13 + 2) * 0.24);
      this.target.set(
        this.position.x + Math.sin(this.autoAngle) * 5.2,
        this.position.y + Math.cos(this.autoAngle) * 5.2,
      );
      this.stepMotion(1 / 60);
    }
  }

  bindEvents() {
    this.onPointerMove = (event) => {
      const rect = this.stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      if (this.isOrbitMode && this.pointerDown) {
        const deltaX = event.clientX - this.lastPointer.x;
        const deltaY = event.clientY - this.lastPointer.y;
        this.orbitYaw -= deltaX * 0.006;
        this.orbitPitch = Math.max(
          0.12,
          Math.min(1.28, this.orbitPitch + deltaY * 0.005),
        );
      } else if (!this.isOrbitMode) {
        this.pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.pointerActive = true;
        this.lastPointerTime = performance.now();
        this.shell.classList.add("has-drawn");
      }

      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
    };

    this.onPointerDown = (event) => {
      event.preventDefault();
      this.stage.focus({ preventScroll: true });
      this.stage.setPointerCapture?.(event.pointerId);
      this.pointerDown = true;
      this.downInfo = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };
      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
      if (!this.isOrbitMode) this.onPointerMove(event);
    };

    this.onPointerUp = (event) => {
      if (!this.pointerDown) return;
      this.stage.releasePointerCapture?.(event.pointerId);
      this.pointerDown = false;

      if (this.isOrbitMode) return;
      const distanceSquared =
        (event.clientX - this.downInfo.x) ** 2 +
        (event.clientY - this.downInfo.y) ** 2;
      if (
        distanceSquared < 64 &&
        performance.now() - this.downInfo.time < 450
      ) {
        this.setPaused(!this.paused);
      }
    };

    this.onWheel = (event) => {
      if (!this.isOrbitMode) return;
      event.preventDefault();
      this.orbitDistance = Math.max(
        6.5,
        Math.min(18, this.orbitDistance + event.deltaY * 0.008),
      );
    };

    this.onKeyDown = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        this.rewind();
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        this.reset();
      } else if (event.key === "Tab") {
        event.preventDefault();
        this.toggleOrbit();
      }
    };

    this.stage.addEventListener("pointermove", this.onPointerMove);
    this.stage.addEventListener("pointerdown", this.onPointerDown);
    this.stage.addEventListener("pointerup", this.onPointerUp);
    this.stage.addEventListener("pointercancel", this.onPointerUp);
    this.stage.addEventListener("wheel", this.onWheel, { passive: false });
    this.stage.addEventListener("keydown", this.onKeyDown);
    this.ui.orbitButton.addEventListener("click", () => this.toggleOrbit());
    this.ui.rewindButton.addEventListener("click", () => this.rewind());
    this.ui.resetButton.addEventListener("click", () => this.reset());

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.stage);
    this.visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !document.hidden) this.startLoop();
        else this.stopLoop();
      },
      { threshold: 0.02 },
    );
    this.visibilityObserver.observe(this.shell);

    this.onVisibilityChange = () => {
      if (document.hidden) this.stopLoop();
      else if (this.isVisible) this.startLoop();
    };
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("beforeunload", () => this.dispose(), { once: true });
  }

  setPaused(paused) {
    this.paused = paused;
    this.updateUi(paused ? "Paused — click to resume" : "Rolling — move to steer");
  }

  toggleOrbit(force) {
    const next = typeof force === "boolean" ? force : !this.isOrbitMode;
    if (next === this.isOrbitMode) return;

    if (next) {
      this.pausedBeforeOrbit = this.paused;
      this.paused = true;
      const center = new this.THREE.Vector3(
        this.position.x,
        this.rollRadius * 0.7,
        this.position.y,
      );
      const offset = this.camera.position.clone().sub(center);
      this.orbitDistance = offset.length();
      this.orbitPitch = Math.asin(offset.y / this.orbitDistance);
      this.orbitYaw = Math.atan2(offset.x, offset.z);
    } else {
      this.paused = this.pausedBeforeOrbit;
    }

    this.isOrbitMode = next;
    this.shell.classList.toggle("is-orbit", next);
    this.stage.classList.toggle("is-orbiting", next);
    this.ui.orbitButton.setAttribute("aria-pressed", String(next));
    this.ui.orbitButton.textContent = `Orbit: ${next ? "On" : "Off"}`;
    this.ui.orbitStatus.textContent = next ? "On" : "Off";
    this.updateUi(next ? "Orbit view — drag to inspect" : "Rolling — move to steer");
  }

  rewind() {
    if (this.path.length < 3 || this.rewindState) return;
    this.paused = true;
    this.rewindState = { accumulator: 0 };
    this.updateUi("Rewinding");
  }

  updateRewind(deltaTime) {
    if (!this.rewindState) return;
    this.rewindState.accumulator += deltaTime * 220;
    const removeCount = Math.floor(this.rewindState.accumulator);
    if (removeCount < 1) return;
    this.rewindState.accumulator -= removeCount;

    for (let i = 0; i < removeCount && this.path.length > 2; i += 1) {
      this.path.pop();
    }

    const current = this.path[this.path.length - 1];
    const previous = this.path[this.path.length - 2];
    this.position.set(current.x, current.z);
    this.totalDistance = current.s;
    this.yaw = Math.atan2(current.x - previous.x, current.z - previous.z);
    this.velocity.set(0, 0);
    this.target.copy(this.position);

    if (this.path.length <= 2) {
      this.rewindState = null;
      this.paused = false;
      this.path = [];
      this.position.set(0, 0);
      this.target.set(0, 5);
      this.totalDistance = 0;
      this.yaw = 0;
      this.pushPathPoint();
      this.updateUi("Rewound — rolling again");
    }
  }

  reset() {
    this.rewindState = null;
    this.paused = false;
    this.pointerActive = false;
    this.path = [];
    this.position.set(0, 0);
    this.velocity.set(0, 0);
    this.target.set(0, 5);
    this.totalDistance = 0;
    this.yaw = 0;
    this.pushPathPoint();
    this.shell.classList.remove("has-drawn");
    this.updateRoll();
    this.rebuildRibbon();
    this.snapCamera();
    this.updateUi("Reset — rolling");
  }

  snapCamera() {
    this.cameraPosition.set(
      this.position.x + this.cameraOffset.x,
      this.cameraOffset.y,
      this.position.y + this.cameraOffset.z,
    );
    this.cameraLookAt.set(this.position.x, 0.58, this.position.y);
    this.camera.position.copy(this.cameraPosition);
    this.camera.lookAt(this.cameraLookAt);
  }

  updateCamera(deltaTime) {
    const center = this.cameraDesired.set(
      this.position.x,
      this.rollRadius * 0.7,
      this.position.y,
    );

    if (this.isOrbitMode) {
      const cosPitch = Math.cos(this.orbitPitch);
      this.camera.position.set(
        center.x + Math.sin(this.orbitYaw) * cosPitch * this.orbitDistance,
        center.y + Math.sin(this.orbitPitch) * this.orbitDistance,
        center.z + Math.cos(this.orbitYaw) * cosPitch * this.orbitDistance,
      );
      this.camera.lookAt(center);
      return;
    }

    const smoothing = 1 - Math.exp(-2.7 * deltaTime);
    this.cameraDesired.set(
      this.position.x + this.cameraOffset.x,
      this.cameraOffset.y,
      this.position.y + this.cameraOffset.z,
    );
    this.cameraPosition.lerp(this.cameraDesired, smoothing);
    this.cameraDesired.set(this.position.x, 0.58, this.position.y);
    this.cameraLookAt.lerp(this.cameraDesired, smoothing);
    this.camera.position.copy(this.cameraPosition);
    this.camera.lookAt(this.cameraLookAt);
  }

  updateUi(status) {
    if (status) this.ui.statusText.textContent = status;
    this.ui.pointCount.textContent = String(this.path.length).padStart(6, "0");
    const disabled = this.path.length < 3 || Boolean(this.rewindState);
    this.ui.rewindButton.disabled = disabled;
    this.ui.resetButton.disabled = Boolean(this.rewindState);
  }

  updateFps(time) {
    this.frameCount += 1;
    const elapsed = time - this.fpsStartedAt;
    if (elapsed < 650) return;
    const fps = Math.round((this.frameCount * 1000) / elapsed);
    this.ui.fps.textContent = String(Math.min(999, fps)).padStart(3, "0");
    this.frameCount = 0;
    this.fpsStartedAt = time;
  }

  resize() {
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    this.renderer.setSize(width, height, false);
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    if (this.rafId || this.isDisposed) return;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame((time) => this.tick(time));
  }

  stopLoop() {
    if (!this.rafId) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  tick(time) {
    this.rafId = 0;
    if (this.isDisposed || !this.isVisible || document.hidden) return;

    const deltaTime = Math.min((time - this.lastFrameTime) / 1000, 1 / 30);
    this.lastFrameTime = time;

    if (this.rewindState) {
      this.updateRewind(deltaTime);
    } else if (!this.paused && !this.isOrbitMode) {
      this.updateTarget(time, deltaTime);
      this.stepMotion(deltaTime);
    }

    this.updateRoll();
    this.rebuildRibbon();
    this.updateCamera(deltaTime);
    this.updateUi();
    this.updateFps(time);
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame((nextTime) => this.tick(nextTime));
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);

    this.scene.traverse((object) => {
      if (!object.isMesh && !object.isLineSegments) return;
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => material?.dispose());
    });
    this.textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
  }
}
