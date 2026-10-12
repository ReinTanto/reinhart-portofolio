/**
 * stl-loader.js
 * Helper to load STL models with proper lighting and material.
 * Usage:
 *   const model = await loadSTL("models/product-a.stl", scene, {
 *     color: 0xa78bfa,
 *     scale: 1,
 *     position: [0, 0, 0],
 *   });
 */

async function loadSTL(url, scene, options = {}) {
  const {
    color = 0xcccccc,
    metalness = 0.5,
    roughness = 0.4,
    scale = 1,
    position = [0, 0, 0],
    autoRotate = true,
    rotSpeed = 0.005,
  } = options;

  // Dynamically import STLLoader from Three.js examples
  const { STLLoader } = await import(
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js"
  );

  const loader = new STLLoader();
  const geometry = await new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });

  geometry.center();
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    transparent: true,
    opacity: 0.95,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(scale);
  mesh.position.set(...position);
  mesh.userData.autoRotate = autoRotate;
  mesh.userData.rotSpeed = rotSpeed;

  scene.add(mesh);
  return mesh;
}

// Expose globally
window.loadSTL = loadSTL;
