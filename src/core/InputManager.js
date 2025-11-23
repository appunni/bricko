import * as THREE from 'three';
import { CONFIG, STATE } from '../config.js';
import { BrickFactory } from '../components/BrickFactory.js';
import { PlaceBrickCommand, RemoveBrickCommand } from './CommandManager.js';

export class InputManager {
    constructor(sceneManager, commandManager) {
        this.sceneManager = sceneManager;
        this.commandManager = commandManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.ghostBrick = null;
        
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        
        this.updateGhost();
    }

    updateGhost() {
        if(this.ghostBrick) {
            this.sceneManager.remove(this.ghostBrick);
            this.ghostBrick = null;
        }
        
        const mesh = BrickFactory.createBrickMesh(STATE.brickType.w, STATE.brickType.d, STATE.brickType.h, STATE.color);
        
        mesh.children.forEach(c => {
            c.material = c.material.clone();
            c.material.transparent = true;
            c.material.opacity = 0.5;
            c.material.emissive = new THREE.Color(STATE.color);
            c.material.emissiveIntensity = 0.2;
        });
        
        this.ghostBrick = mesh;
        this.ghostBrick.visible = false;
        this.sceneManager.add(this.ghostBrick);
    }

    onMouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        
        const objects = [this.sceneManager.basePlate, ...STATE.bricks.map(b => b.children[0])];
        const intersects = this.raycaster.intersectObjects(objects, true);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const point = intersect.point;
            const normal = intersect.face.normal;
            
            const pos = point.clone().add(normal.clone().multiplyScalar(0.1));
            const snap = CONFIG.unitSize;
            
            const wUnits = STATE.brickType.w;
            const dUnits = STATE.brickType.d;
            
            const xOffset = (wUnits % 2 === 0) ? 0 : snap / 2;
            const zOffset = (dUnits % 2 === 0) ? 0 : snap / 2;
            
            const x = Math.round((pos.x - xOffset) / snap) * snap + xOffset;
            const z = Math.round((pos.z - zOffset) / snap) * snap + zOffset;
            
            let y = 0;
            let hitObject = intersect.object;
            while(hitObject.parent && !hitObject.userData.isBrick && !hitObject.userData.isBaseplate) {
                hitObject = hitObject.parent;
            }
            
            if (hitObject.userData.isBaseplate) {
                y = 0;
            } else if (hitObject.userData.isBrick) {
                const brickData = hitObject.userData;
                if (normal.y > 0.5) {
                    y = hitObject.position.y + brickData.h;
                } else {
                    y = hitObject.position.y; 
                }
            }

            if (this.ghostBrick) {
                this.ghostBrick.position.set(x, y, z);
                this.ghostBrick.visible = true;
            }
        } else {
            if (this.ghostBrick) this.ghostBrick.visible = false;
        }
    }

    onMouseDown(event) {
        // Check if click is on UI panel
        if (event.target.closest('#ui-panel') || event.target.closest('.history-controls')) return;

        if (event.button === 0) { // Left click: Place
            if (this.ghostBrick && this.ghostBrick.visible) {
                const command = new PlaceBrickCommand(
                    this.sceneManager,
                    { ...STATE.brickType, color: STATE.color },
                    this.ghostBrick.position
                );
                this.commandManager.execute(command);
            }
        } else if (event.button === 2) { // Right click: Remove
            this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
            const objects = STATE.bricks.map(b => b.children[0]);
            const intersects = this.raycaster.intersectObjects(objects);
            
            if (intersects.length > 0) {
                const hitObj = intersects[0].object;
                const brickGroup = hitObj.parent;
                
                const command = new RemoveBrickCommand(this.sceneManager, brickGroup);
                this.commandManager.execute(command);
            }
        }
    }
}