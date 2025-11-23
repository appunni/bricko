import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CONFIG } from '../config.js';

const geometryCache = new Map();

export class BrickFactory {
    static createBrickMesh(widthUnits, depthUnits, heightType, colorHex) {
        const key = `${widthUnits}-${depthUnits}-${heightType}`;
        // Note: We are not strictly caching geometries here for simplicity in this refactor, 
        // but in a real app we would cache the geometries to save memory.
        
        const height = heightType === 'brick' ? CONFIG.brickHeight : CONFIG.plateHeight;
        
        const group = new THREE.Group();
        
        // Material
        const material = new THREE.MeshStandardMaterial({ 
            color: colorHex, 
            roughness: 0.2, 
            metalness: 0.1 
        });

        const brickWidth = widthUnits * CONFIG.unitSize;
        const brickDepth = depthUnits * CONFIG.unitSize;
        
        // Body
        const bodyGeo = new RoundedBoxGeometry(brickWidth - 0.2, height, brickDepth - 0.2, 4, 1);
        bodyGeo.translate(0, height / 2, 0);
        const body = new THREE.Mesh(bodyGeo, material);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Studs
        const studGeo = new THREE.CylinderGeometry(CONFIG.studRadius, CONFIG.studRadius, CONFIG.studHeight, 16);
        studGeo.translate(0, height + CONFIG.studHeight/2, 0);
        
        const startX = -(brickWidth / 2) + (CONFIG.unitSize / 2);
        const startZ = -(brickDepth / 2) + (CONFIG.unitSize / 2);

        for(let x=0; x<widthUnits; x++) {
            for(let z=0; z<depthUnits; z++) {
                const s = new THREE.Mesh(studGeo, material);
                s.position.x = startX + (x * CONFIG.unitSize);
                s.position.z = startZ + (z * CONFIG.unitSize);
                s.castShadow = true;
                s.receiveShadow = true;
                group.add(s);
            }
        }
        
        // Metadata for logic
        group.userData = {
            isBrick: true,
            w: widthUnits,
            d: depthUnits,
            h: height,
            type: heightType
        };
        
        return group;
    }
}