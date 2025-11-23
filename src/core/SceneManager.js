import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG } from '../config.js';

export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent to let CSS background show
        // this.scene.fog = new THREE.Fog(0xf0f5f9, 200, 1000);

        const aspect = window.innerWidth / window.innerHeight;
        const d = 200;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.minZoom = 0.5;
        this.controls.maxZoom = 3;

        this.setupLighting();
        this.setupBaseplate();
        
        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(100, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500;
        const shadowSize = 250;
        dirLight.shadow.camera.left = -shadowSize;
        dirLight.shadow.camera.right = shadowSize;
        dirLight.shadow.camera.top = shadowSize;
        dirLight.shadow.camera.bottom = -shadowSize;
        this.scene.add(dirLight);
    }

    setupBaseplate() {
        this.baseGroup = new THREE.Group();
        this.scene.add(this.baseGroup);

        const baseColor = 0x6AB04C; // Fresh Grass Green
        const baseSize = CONFIG.gridSize * CONFIG.unitSize;
        const baseGeo = new THREE.BoxGeometry(baseSize, 2, baseSize);
        const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
        this.basePlate = new THREE.Mesh(baseGeo, baseMat);
        this.basePlate.position.y = -1;
        this.basePlate.receiveShadow = true;
        this.basePlate.userData.isBaseplate = true;
        this.baseGroup.add(this.basePlate);

        const studGeo = new THREE.CylinderGeometry(CONFIG.studRadius, CONFIG.studRadius, CONFIG.studHeight, 16);
        const studMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
        const instancedStuds = new THREE.InstancedMesh(studGeo, studMat, CONFIG.gridSize * CONFIG.gridSize);
        instancedStuds.receiveShadow = true;
        instancedStuds.castShadow = true;
        
        let idx = 0;
        const dummy = new THREE.Object3D();
        const offset = (CONFIG.gridSize * CONFIG.unitSize) / 2 - (CONFIG.unitSize / 2);
        
        for (let x = 0; x < CONFIG.gridSize; x++) {
            for (let z = 0; z < CONFIG.gridSize; z++) {
                dummy.position.set(
                    x * CONFIG.unitSize - offset,
                    CONFIG.studHeight / 2,
                    z * CONFIG.unitSize - offset
                );
                dummy.updateMatrix();
                instancedStuds.setMatrixAt(idx++, dummy.matrix);
            }
        }
        this.baseGroup.add(instancedStuds);
    }

    onWindowResize() {
        const d = 200;
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }
}