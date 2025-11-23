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
        this.isValidPlacement = true;
        
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseleave', () => {
            this.resetHighlights();
            if (this.ghostBrick) this.ghostBrick.visible = false;
        });
        
        this.updateGhost();
    }

    updateGhost() {
        if(this.ghostBrick) {
            this.sceneManager.remove(this.ghostBrick);
            this.ghostBrick = null;
        }

        if (STATE.mode === 'destroy') return;
        
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
        if (event.target.closest('#ui-panel') || event.target.closest('.history-controls')) {
            this.resetHighlights();
            if (this.ghostBrick) this.ghostBrick.visible = false;
            return;
        }

        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        
        if (STATE.mode === 'destroy') {
            const objects = STATE.bricks.map(b => b.children[0]);
            const intersects = this.raycaster.intersectObjects(objects);
            
            // Reset all emissive
            this.resetHighlights();

            if (intersects.length > 0) {
                const hitObj = intersects[0].object;
                const brickGroup = hitObj.parent;
                
                brickGroup.children.forEach(c => {
                    if (!c.userData.originalEmissive) {
                        c.userData.originalEmissive = c.material.emissive.clone();
                    }
                    c.material.emissive.setHex(0xFF0000);
                    c.material.emissiveIntensity = 0.5;
                });
            }
            return;
        }

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

                const collision = this.checkCollision(this.ghostBrick.position);
                const supported = this.checkSupport(this.ghostBrick.position);

                if (collision || !supported) {
                    this.setGhostColor(0xFF4757, 0.8); // Super Red
                    this.isValidPlacement = false;
                } else {
                    this.setGhostColor(STATE.color, 0.5);
                    this.isValidPlacement = true;
                }
            }
        } else {
            if (this.ghostBrick) this.ghostBrick.visible = false;
        }
    }

    onMouseDown(event) {
        // Check if click is on UI panel
        if (event.target.closest('#ui-panel') || event.target.closest('.history-controls')) return;

        if (STATE.mode === 'destroy') {
            if (event.button === 0) {
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
            return;
        }

        if (event.button === 0) { // Left click: Place
            if (this.ghostBrick && this.ghostBrick.visible && this.isValidPlacement) {
                const command = new PlaceBrickCommand(
                    this.sceneManager,
                    { ...STATE.brickType, color: STATE.color },
                    this.ghostBrick.position
                );
                this.commandManager.execute(command);
            }
        } else if (event.button === 2) { // Right click: Remove (Legacy support)
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

    checkSupport(position) {
        const w = STATE.brickType.w * CONFIG.unitSize;
        const d = STATE.brickType.d * CONFIG.unitSize;
        
        const minX = position.x - w / 2 + 0.1;
        const maxX = position.x + w / 2 - 0.1;
        const minZ = position.z - d / 2 + 0.1;
        const maxZ = position.z + d / 2 - 0.1;

        // Check Baseplate
        if (Math.abs(position.y) < 0.1) {
            const baseSize = CONFIG.gridSize * CONFIG.unitSize;
            const halfBase = baseSize / 2;
            return (minX >= -halfBase && maxX <= halfBase && 
                    minZ >= -halfBase && maxZ <= halfBase);
        }

        // Check Bricks below
        const supportY = position.y;
        
        for (const brick of STATE.bricks) {
            const bData = brick.userData;
            const bTopY = brick.position.y + bData.h;
            
            if (Math.abs(bTopY - supportY) < 0.1) {
                const bW = bData.w * CONFIG.unitSize;
                const bD = bData.d * CONFIG.unitSize;
                
                const bMinX = brick.position.x - bW / 2;
                const bMaxX = brick.position.x + bW / 2;
                const bMinZ = brick.position.z - bD / 2;
                const bMaxZ = brick.position.z + bD / 2;

                if (maxX > bMinX && minX < bMaxX &&
                    maxZ > bMinZ && minZ < bMaxZ) {
                    return true;
                }
            }
        }
        return false;
    }

    checkCollision(position) {
        const w = STATE.brickType.w * CONFIG.unitSize;
        const d = STATE.brickType.d * CONFIG.unitSize;
        const h = STATE.brickType.h === 'brick' ? CONFIG.brickHeight : CONFIG.plateHeight;
        
        const minX = position.x - w / 2 + 0.1;
        const maxX = position.x + w / 2 - 0.1;
        const minY = position.y + 0.1;
        const maxY = position.y + h - 0.1;
        const minZ = position.z - d / 2 + 0.1;
        const maxZ = position.z + d / 2 - 0.1;

        for (const brick of STATE.bricks) {
            const bPos = brick.position;
            const bData = brick.userData;
            const bW = bData.w * CONFIG.unitSize;
            const bD = bData.d * CONFIG.unitSize;
            const bH = bData.h;

            const bMinX = bPos.x - bW / 2;
            const bMaxX = bPos.x + bW / 2;
            const bMinY = bPos.y;
            const bMaxY = bPos.y + bH;
            const bMinZ = bPos.z - bD / 2;
            const bMaxZ = bPos.z + bD / 2;

            if (maxX > bMinX && minX < bMaxX &&
                maxY > bMinY && minY < bMaxY &&
                maxZ > bMinZ && minZ < bMaxZ) {
                return true;
            }
        }
        return false;
    }

    setGhostColor(color, opacity = 0.5) {
        if (!this.ghostBrick) return;
        this.ghostBrick.children.forEach(c => {
            c.material.emissive.setHex(color);
            c.material.opacity = opacity;
        });
    }

    resetHighlights() {
        STATE.bricks.forEach(b => {
            b.children.forEach(c => {
                c.material.emissive.setHex(0x000000);
                c.material.emissiveIntensity = 1;
            });
        });
    }
}