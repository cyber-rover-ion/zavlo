/**
 * ZAVLO TECHNOLOGIES — 3D HERO WEBGL SCENE (STAGE 5 REFINED)
 * Engine: Three.js
 * Visual Target: Glossy 3D Z Emblem with Cyan-to-Teal gradient, Orbital Sphere & Subtle Lighting
 * Responsive & Mobile Optimized: Adaptive DPR, Touch Handling, Offscreen Pausing, Landscape Support
 */

(function () {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js library is not loaded.');
    return;
  }

  // DOM Elements
  const heroSection = document.getElementById('hero');
  const container = document.getElementById('webgl-container');
  const canvas = document.getElementById('hero-webgl-canvas');
  if (!container || !canvas) return;

  // Scene State Variables
  let scene, camera, renderer;
  let zRibbonMesh, orbitalRingMesh, sphereMesh, sphereGlowMesh;
  let ambientLight, keyLight, pointLightTeal, pointLightBlue;
  let animationFrameId = null;
  let isHeroVisible = true;
  let isTabActive = true;

  // Interaction & Responsive State
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;
  let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let isMobile = window.innerWidth <= 768;

  // Color Definitions matching Global System
  const COLOR_CYAN = new THREE.Color('#00A3FF');
  const COLOR_TEAL = new THREE.Color('#00F0B5');

  // --------------------------------------------------------------------------
  // 1. Scene Initialization
  // --------------------------------------------------------------------------
  function init() {
    // 1.1 Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#030508');

    // 1.2 Create Camera with responsive distance
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;
    
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    adjustCameraForViewport(width, height);

    // 1.3 Setup Renderer with Safe Adaptive DPR
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    const maxDPR = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(maxDPR);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;

    // 1.4 Add Lighting
    setupLighting();

    // 1.5 Create 3D Emblem Geometry & Objects
    createZRibbonEmblem();
    createOrbitalSphere();

    // 1.6 Event Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(onWindowResize, 150);
    }, { passive: true });

    if (!isTouchDevice && !isReducedMotion) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // Listen for reduced motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      isReducedMotion = e.matches;
    });

    // 1.7 Performance: Pause WebGL when Hero is offscreen
    if (heroSection && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible && isTabActive && !animationFrameId) {
            animate(performance.now());
          }
        });
      }, { rootMargin: '100px 0px 100px 0px', threshold: 0 });

      heroObserver.observe(heroSection);
    }

    // Handle Page Visibility for Performance
    document.addEventListener('visibilitychange', () => {
      isTabActive = !document.hidden;
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (isHeroVisible && !animationFrameId) {
        animate(performance.now());
      }
    });

    // Start Animation Loop
    animate(0);
  }

  function adjustCameraForViewport(width, height) {
    if (!camera) return;
    const isLandscapeShort = height < 520 && width > height;
    const isSmallScreen = width < 480;

    if (isLandscapeShort) {
      camera.position.set(0, 0.2, 8.2);
    } else if (isSmallScreen) {
      camera.position.set(0, 0.45, 7.8);
    } else if (width <= 768) {
      camera.position.set(0, 0.4, 7.5);
    } else {
      camera.position.set(0, 0.4, 7.2);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Lighting Setup
  // --------------------------------------------------------------------------
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x0a101d, 1.2);
    scene.add(ambientLight);

    keyLight = new THREE.DirectionalLight(0xe1f5fe, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x002b49, 1.5);
    fillLight.position.set(-5, -3, -2);
    scene.add(fillLight);

    pointLightTeal = new THREE.PointLight(0x00f0b5, 3.5, 10);
    pointLightTeal.position.set(-2, -2, 3);
    scene.add(pointLightTeal);

    pointLightBlue = new THREE.PointLight(0x00a3ff, 4.0, 10);
    pointLightBlue.position.set(2, 2.5, 3);
    scene.add(pointLightBlue);
  }

  // --------------------------------------------------------------------------
  // 3. Create Sculptural 3D Z Ribbon
  // --------------------------------------------------------------------------
  function createZRibbonEmblem() {
    const shape = new THREE.Shape();

    // Smooth sweeping Z geometry contour
    shape.moveTo(-1.6, 1.15);
    shape.bezierCurveTo(-1.0, 1.45, 0.8, 1.45, 1.7, 1.1);
    shape.bezierCurveTo(2.1, 0.95, 2.0, 0.65, 1.5, 0.55);
    shape.bezierCurveTo(0.6, 0.35, -0.4, 0.05, -0.9, -0.45);
    shape.bezierCurveTo(-1.3, -0.85, -1.0, -1.35, 0.4, -1.4);
    shape.bezierCurveTo(1.3, -1.45, 1.7, -1.3, 1.85, -1.05);
    shape.bezierCurveTo(1.95, -0.85, 1.65, -0.65, 1.3, -0.7);
    shape.bezierCurveTo(0.1, -0.8, -0.4, -0.6, -0.1, -0.15);
    shape.bezierCurveTo(0.3, 0.35, 1.2, 0.75, -0.9, 0.82);
    shape.bezierCurveTo(-1.6, 0.82, -1.85, 0.95, -1.6, 1.15);

    const extrudeSettings = {
      steps: 2,
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.22,
      bevelSize: 0.16,
      bevelOffset: 0,
      bevelSegments: 8,
      curveSegments: 32
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColorCyan: { value: COLOR_CYAN },
        uColorTeal: { value: COLOR_TEAL },
        uLightPos: { value: new THREE.Vector3(5, 8, 5) },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorCyan;
        uniform vec3 uColorTeal;
        uniform vec3 uLightPos;
        uniform float uTime;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          float heightFactor = clamp((vWorldPosition.y + 1.2) / 2.4, 0.0, 1.0);
          vec3 baseColor = mix(uColorTeal, uColorCyan, heightFactor);

          vec3 lightDir = normalize(uLightPos - vWorldPosition);
          float diff = max(dot(normal, lightDir), 0.0);
          
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);

          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          vec3 fresnelColor = mix(uColorTeal, uColorCyan, 0.5);

          vec3 ambient = vec3(0.04, 0.07, 0.12);
          vec3 finalColor = ambient + (baseColor * diff * 0.85) + (vec3(1.0) * spec * 0.45) + (fresnelColor * fresnel * 0.6);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    zRibbonMesh = new THREE.Mesh(geometry, customMaterial);
    
    // Scale slightly for mobile viewports
    const baseScale = window.innerWidth < 480 ? 0.88 : 0.95;
    zRibbonMesh.scale.set(baseScale, baseScale, baseScale);
    scene.add(zRibbonMesh);
  }

  // --------------------------------------------------------------------------
  // 4. Create Orbital Glowing Sphere & Ring
  // --------------------------------------------------------------------------
  function createOrbitalSphere() {
    const ringGeometry = new THREE.TorusGeometry(2.1, 0.012, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0b5,
      transparent: true,
      opacity: 0.35
    });

    orbitalRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    orbitalRingMesh.rotation.x = Math.PI * 0.38;
    orbitalRingMesh.rotation.y = Math.PI * 0.15;
    scene.add(orbitalRingMesh);

    const sphereGeometry = new THREE.SphereGeometry(0.14, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0b5,
      emissive: 0x00f0b5,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.8
    });
    sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    const glowGeometry = new THREE.SphereGeometry(0.26, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: COLOR_TEAL }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, intensity * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    sphereGlowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sphereGlowMesh);
  }

  // --------------------------------------------------------------------------
  // 5. Interaction Event Handlers
  // --------------------------------------------------------------------------
  function onMouseMove(event) {
    if (isTouchDevice) return;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouse.targetX = (event.clientX - windowHalfX) / windowHalfX;
    mouse.targetY = (event.clientY - windowHalfY) / windowHalfY;
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroHeight = container.clientHeight || window.innerHeight;
    scrollProgress = Math.min(Math.max(scrollY / heroHeight, 0), 1);
  }

  function onWindowResize() {
    isMobile = window.innerWidth <= 768;
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    camera.aspect = width / height;
    adjustCameraForViewport(width, height);
    camera.updateProjectionMatrix();

    const maxDPR = isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(maxDPR);
    renderer.setSize(width, height);

    if (zRibbonMesh) {
      const baseScale = width < 480 ? 0.88 : 0.95;
      zRibbonMesh.scale.set(baseScale, baseScale, baseScale);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Animation Loop
  // --------------------------------------------------------------------------
  function animate(timestamp) {
    if (!isHeroVisible || !isTabActive) {
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animate);

    const time = timestamp * 0.001;

    // 6.1 Mouse Interpolation (Lerp) on Desktop only
    if (!isReducedMotion && !isTouchDevice && !isMobile) {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
    } else {
      mouse.x = 0;
      mouse.y = 0;
    }

    // 6.2 Z Ribbon Emblem Movements
    if (zRibbonMesh) {
      const baseScale = (window.innerWidth < 480 ? 0.88 : 0.95) - (scrollProgress * 0.15);
      zRibbonMesh.scale.set(baseScale, baseScale, baseScale);

      if (!isReducedMotion) {
        // Subtle automatic sway (gentle on mobile)
        const floatSpeed = isMobile ? 0.6 : 0.8;
        const floatAmp = isMobile ? 0.05 : 0.08;
        zRibbonMesh.position.y = Math.sin(time * floatSpeed) * floatAmp + (scrollProgress * -0.6);

        const baseRotY = Math.sin(time * 0.35) * (isMobile ? 0.06 : 0.1);
        zRibbonMesh.rotation.y = baseRotY + (mouse.x * 0.14);
        zRibbonMesh.rotation.x = (mouse.y * -0.1) + (scrollProgress * 0.2);
      } else {
        zRibbonMesh.position.y = scrollProgress * -0.6;
        zRibbonMesh.rotation.set(0, 0, 0);
      }

      if (zRibbonMesh.material.uniforms) {
        zRibbonMesh.material.uniforms.uTime.value = time;
      }
    }

    // 6.3 Orbital Ring & Sphere Orbit Calculation
    if (sphereMesh && orbitalRingMesh) {
      const orbitRadius = 2.1;
      const orbitSpeed = isReducedMotion ? 0.3 : time * (isMobile ? 0.45 : 0.6);
      
      const rawX = Math.cos(orbitSpeed) * orbitRadius;
      const rawZ = Math.sin(orbitSpeed) * orbitRadius;

      const cosX = Math.cos(orbitalRingMesh.rotation.x);
      const sinX = Math.sin(orbitalRingMesh.rotation.x);
      const cosY = Math.cos(orbitalRingMesh.rotation.y);
      const sinY = Math.sin(orbitalRingMesh.rotation.y);

      const posX = rawX * cosY - rawZ * sinY;
      const posY = (rawZ * cosY + rawX * sinY) * sinX;
      const posZ = (rawZ * cosY + rawX * sinY) * cosX;

      sphereMesh.position.set(posX, posY, posZ);
      if (sphereGlowMesh) {
        sphereGlowMesh.position.set(posX, posY, posZ);
      }

      if (!isReducedMotion && sphereMesh.material) {
        sphereMesh.material.emissiveIntensity = 1.6 + Math.sin(time * 2.0) * 0.4;
      }
    }

    // 6.4 Render Scene
    renderer.render(scene, camera);
  }

  // --------------------------------------------------------------------------
  // 7. Initialization Trigger
  // --------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
