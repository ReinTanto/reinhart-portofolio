/**
 * three-scene.js
 * Reusable Three.js scene with scroll-driven camera, floating shapes,
 * particles, and mouse parallax.
 */

(function () {
  // ── Setup ──
  const canvas = document.getElementById("three-canvas");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 12);

  // ── Lights ──
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const pointLight1 = new THREE.PointLight(0xa78bfa, 1.5, 30);
  pointLight1.position.set(-5, 3, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x38bdf8, 1.5, 30);
  pointLight2.position.set(5, -3, 5);
  scene.add(pointLight2);

  // ── Floating shapes ──
  const shapes = [];
  const shapeConfigs = [
    { geo: new THREE.IcosahedronGeometry(1.2, 0), color: 0xa78bfa, pos: [-4, 2, 0] },
    { geo: new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16), color: 0x38bdf8, pos: [4, -1, -2] },
    { geo: new THREE.OctahedronGeometry(1, 0), color: 0x34d399, pos: [0, 4, -4] },
    { geo: new THREE.TorusGeometry(1, 0.3, 16, 60), color: 0xf472b6, pos: [-3, -3, -3] },
    { geo: new THREE.DodecahedronGeometry(0.9, 0), color: 0xfb923c, pos: [5, 3, -5] },
    { geo: new THREE.ConeGeometry(0.8, 1.6, 6), color: 0x818cf8, pos: [2, -4, -6] },
    { geo: new THREE.SphereGeometry(0.6, 32, 32), color: 0x67e8f9, pos: [-6, -1, -4] },
    { geo: new THREE.CylinderGeometry(0.5, 0.5, 1.4, 8), color: 0xfbbf24, pos: [6, 1, -7] },
  ];

  shapeConfigs.forEach((cfg, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      metalness: 0.6,
      roughness: 0.3,
      wireframe: i % 3 === 0,
      transparent: true,
      opacity: i % 3 === 0 ? 0.4 : 0.85,
    });
    const mesh = new THREE.Mesh(cfg.geo, mat);
    mesh.position.set(...cfg.pos);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.userData = {
      baseY: cfg.pos[1],
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatAmp: 0.3 + Math.random() * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  });

  // ── Particle field ──
  const particleCount = 600;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color(0xa78bfa),
    new THREE.Color(0x38bdf8),
    new THREE.Color(0x34d399),
    new THREE.Color(0xf472b6),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Scroll state ──
  let scrollY = 0;
  let scrollVelocity = 0;
  let lastScrollY = 0;

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // ── Mouse parallax ──
  let mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── Resize ──
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation loop ──
  const clock = new THREE.Clock();
  let isVisible = true;
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Scroll velocity
    scrollVelocity = (scrollY - lastScrollY) * 0.1;
    lastScrollY = scrollY;

    // Camera: move along Y based on scroll, slight X based on mouse
    const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    camera.position.y = -scrollProgress * 15;
    camera.position.x = mouseX * 0.8;
    camera.position.z = 12 - Math.abs(scrollVelocity) * 0.5;
    camera.lookAt(0, camera.position.y - 2, 0);

    // Animate shapes
    shapes.forEach((mesh) => {
      const d = mesh.userData;
      mesh.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
      mesh.rotation.x += d.rotSpeed;
      mesh.rotation.y += d.rotSpeed * 0.7;

      // Pulse scale with scroll velocity
      const pulse = 1 + Math.min(Math.abs(scrollVelocity) * 0.02, 0.3);
      mesh.scale.setScalar(pulse);
    });

    // Slowly rotate particles
    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    // Animate lights
    pointLight1.position.x = Math.sin(t * 0.5) * 6;
    pointLight1.position.y = Math.cos(t * 0.3) * 4;
    pointLight2.position.x = Math.cos(t * 0.4) * 6;
    pointLight2.position.y = Math.sin(t * 0.6) * 4;

    renderer.render(scene, camera);
  }

  animate();
})();
