import './styles.css';
import * as THREE from 'three';
import { games } from './games.js';

const palettes = [
  { background: '#ece7dc', ink: '#292929', muted: '#625f58' },
  { background: '#dca65d', ink: '#231f1b', muted: '#4a4037' },
  { background: '#6f8c87', ink: '#ffffff', muted: '#eef4f2' },
  { background: '#9c6f77', ink: '#ffffff', muted: '#f4eaec' },
  { background: '#687694', ink: '#ffffff', muted: '#e9edf5' },
];

const palette = palettes[Math.floor(Math.random() * palettes.length)];
document.documentElement.style.setProperty('--hero-bg', palette.background);
document.documentElement.style.setProperty('--hero-ink', palette.ink);
document.documentElement.style.setProperty('--hero-muted', palette.muted);

document.documentElement.dataset.catalogSize =
  games.length >= 9 ? 'large' : games.length >= 5 ? 'medium' : 'small';

renderGames();
initHero();

function renderGames() {
  const grid = document.querySelector('#games-grid');

  games.forEach((game) => {
    const article = document.createElement('article');
    article.className = 'game-card';
    article.style.setProperty('--card-accent', game.accent);

    const link = document.createElement('a');
    link.className = 'game-card__link';
    link.href = game.url;
    link.setAttribute('aria-label', `Jugar a ${game.title}`);

    link.innerHTML = `
      <div class="game-card__visual" aria-hidden="true">
        <span>${game.icon}</span>
      </div>
      <div class="game-card__body">
        <h3>${game.title}</h3>
        <p>${game.description}</p>
        <span class="game-card__cta">Jugar <span aria-hidden="true">→</span></span>
      </div>
    `;

    article.append(link);
    grid.append(article);
  });
}

function initHero() {
  const mount = document.querySelector('#hero-scene');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
  } catch {
    mount.dataset.fallback = 'true';
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  scene.add(new THREE.AmbientLight(0xffffff, 2.2));
  const light = new THREE.DirectionalLight(0xffffff, 3.2);
  light.position.set(4, 6, 8);
  scene.add(light);

  const items = [
    makeApple('#b54434'),
    makePlane('#f2ce68'),
    makeRocket('#e86f51'),
    makeStar('#ffb400'),
    makeBlock('#7d6fc1'),
  ];

  const positions = [
    [-3.3, 1.25, -0.3],
    [3.2, 1.35, 0.1],
    [-3.5, -1.25, 0.25],
    [3.55, -1.2, -0.2],
    [0.0, 2.15, -0.7],
  ];

  items.forEach((item, index) => {
    item.group.position.set(...positions[index]);
    item.group.scale.setScalar(index === 4 ? 0.75 : 0.9);
    scene.add(item.group);
  });

  function resize() {
    const { width, height } = mount.getBoundingClientRect();
    if (!width || !height) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.z = width < 620 ? 14 : 12.5;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let frameId = null;
  let running = true;
  const clock = new THREE.Clock();

  function render() {
    if (!running) return;

    const elapsed = clock.getElapsedTime();

    items.forEach((item, index) => {
      const phase = index * 0.9;
      const base = positions[index];
      const floatAmount = reducedMotion ? 0 : Math.sin(elapsed * 0.8 + phase) * 0.14;
      const drift = reducedMotion ? 0 : Math.cos(elapsed * 0.45 + phase) * 0.08;

      item.group.position.x = base[0] + drift;
      item.group.position.y = base[1] + floatAmount;

      if (!reducedMotion) {
        item.group.rotation.y += item.spinY;
        item.group.rotation.x = Math.sin(elapsed * 0.35 + phase) * 0.08;
      }
    });

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(render);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      return;
    }

    if (!running) {
      running = true;
      clock.getDelta();
      render();
    }
  });

  render();

  function material(color) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.58,
      metalness: 0.02,
    });
  }

  function makeApple(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 20, 14),
      material(color),
    );
    body.scale.set(1, 0.88, 0.95);
    body.position.y = -0.03;
    group.add(body);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8),
      material('#6b5136'),
    );
    stem.position.y = 0.7;
    stem.rotation.z = -0.18;
    group.add(stem);

    return { group, spinY: 0.004 };
  }

  function makePlane(color) {
    const group = new THREE.Group();
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.9, -0.2, 0,
      0.95, 0, 0,
      -0.25, 0.25, 0,
      -0.25, 0.25, 0,
      0.95, 0, 0,
      -0.15, -0.55, 0.12,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: 0.75,
      }),
    );
    mesh.rotation.z = -0.28;
    group.add(mesh);
    return { group, spinY: 0.003 };
  }

  function makeRocket(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.34, 1.05, 12),
      material(color),
    );
    body.rotation.z = -0.22;
    group.add(body);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.27, 0.5, 12),
      material('#f6eee4'),
    );
    cone.position.y = 0.78;
    cone.rotation.z = -0.22;
    cone.position.x = -0.17;
    group.add(cone);

    group.rotation.z = -0.55;
    return { group, spinY: 0.005 };
  }

  function makeStar(color) {
    const shape = new THREE.Shape();
    const outer = 0.72;
    const inner = 0.32;
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 1,
    });
    geometry.center();

    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, material(color)));
    return { group, spinY: 0.006 };
  }

  function makeBlock(color) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.72, 0.72),
      material(color),
    );
    mesh.rotation.set(0.25, 0.35, -0.12);
    group.add(mesh);
    return { group, spinY: 0.0045 };
  }
}
