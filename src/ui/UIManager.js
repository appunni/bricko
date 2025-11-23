import * as THREE from 'three';
import { CONFIG, STATE } from '../config.js';
import { BrickFactory } from '../components/BrickFactory.js';

export class UIManager {
    constructor(inputManager, sceneManager, commandManager) {
        this.inputManager = inputManager;
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        
        this.initUI();
        this.initPreview();
        this.initHistoryControls();
    }

    initHistoryControls() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        undoBtn.addEventListener('click', () => this.commandManager.undo());
        redoBtn.addEventListener('click', () => this.commandManager.redo());

        window.addEventListener('historyChanged', (e) => {
            undoBtn.disabled = !e.detail.canUndo;
            redoBtn.disabled = !e.detail.canRedo;
        });
    }

    initUI() {
        // Toggle Panel
        const minimizeBtn = document.getElementById('minimize-btn');
        const uiContent = document.getElementById('ui-content');
        
        minimizeBtn.addEventListener('click', () => {
            uiContent.classList.toggle('hidden');
            minimizeBtn.textContent = uiContent.classList.contains('hidden') ? '+' : '−';
        });

        const colorSelect = document.getElementById('color-select');
        CONFIG.colors.forEach((c) => {
            const option = document.createElement('option');
            option.value = c.hex;
            option.textContent = c.name;
            colorSelect.appendChild(option);
        });
        
        colorSelect.addEventListener('change', (e) => {
            STATE.color = parseInt(e.target.value);
            this.inputManager.updateGhost();
            this.updatePreview();
        });

        const brickSelect = document.getElementById('brick-select');
        CONFIG.bricks.forEach((b, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = b.label;
            brickSelect.appendChild(option);
        });
        
        brickSelect.addEventListener('change', (e) => {
            STATE.brickType = CONFIG.bricks[parseInt(e.target.value)];
            this.inputManager.updateGhost();
            this.updatePreview();
        });

        document.getElementById('clear-btn').onclick = () => {
            STATE.bricks.forEach(b => this.sceneManager.remove(b));
            STATE.bricks = [];
        };
    }

    initPreview() {
        const previewContainer = document.getElementById('brick-preview');
        this.previewScene = new THREE.Scene();
        this.previewScene.background = null; // Allow CSS background to show through
        
        this.previewCamera = new THREE.PerspectiveCamera(45, previewContainer.clientWidth / previewContainer.clientHeight, 0.1, 1000);
        this.previewCamera.position.set(20, 20, 20);
        this.previewCamera.lookAt(0, 0, 0);
        
        this.previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.previewRenderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        this.previewRenderer.shadowMap.enabled = true;
        this.previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        previewContainer.appendChild(this.previewRenderer.domElement);
        
        const previewAmbient = new THREE.AmbientLight(0xffffff, 0.6);
        this.previewScene.add(previewAmbient);
        
        const previewDirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        previewDirLight.position.set(10, 20, 10);
        previewDirLight.castShadow = true;
        this.previewScene.add(previewDirLight);
        
        this.previewMesh = null;
        
        this.updatePreview();
        this.animatePreview();
    }

    updatePreview() {
        if (this.previewMesh) this.previewScene.remove(this.previewMesh);
        
        this.previewMesh = BrickFactory.createBrickMesh(STATE.brickType.w, STATE.brickType.d, STATE.brickType.h, STATE.color);
        
        // Center the mesh
        const box = new THREE.Box3().setFromObject(this.previewMesh);
        const center = box.getCenter(new THREE.Vector3());
        this.previewMesh.position.sub(center);
        
        this.previewScene.add(this.previewMesh);
    }

    animatePreview() {
        requestAnimationFrame(this.animatePreview.bind(this));
        if (this.previewMesh) {
            this.previewMesh.rotation.y += 0.01;
        }
        this.previewRenderer.render(this.previewScene, this.previewCamera);
    }
}