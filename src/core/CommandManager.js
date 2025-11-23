import { STATE } from '../config.js';
import { BrickFactory } from '../components/BrickFactory.js';

export class CommandManager {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
    }

    execute(command) {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        command.execute();
        this.history.push(command);
        this.historyIndex++;
        this.updateUI();
    }

    undo() {
        if (this.historyIndex >= 0) {
            this.history[this.historyIndex].undo();
            this.historyIndex--;
            this.updateUI();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.history[this.historyIndex].execute();
            this.updateUI();
        }
    }
    
    updateUI() {
        const event = new CustomEvent('historyChanged', {
            detail: {
                canUndo: this.historyIndex >= 0,
                canRedo: this.historyIndex < this.history.length - 1
            }
        });
        window.dispatchEvent(event);
    }
}

export class PlaceBrickCommand {
    constructor(sceneManager, brickData, position) {
        this.sceneManager = sceneManager;
        this.brickData = brickData;
        this.position = position.clone();
        this.brickRef = null;
    }

    execute() {
        if (!this.brickRef) {
            this.brickRef = BrickFactory.createBrickMesh(
                this.brickData.w, 
                this.brickData.d, 
                this.brickData.h, 
                this.brickData.color
            );
            this.brickRef.position.copy(this.position);
        }
        
        this.sceneManager.add(this.brickRef);
        STATE.bricks.push(this.brickRef);
        
        this.brickRef.scale.set(0,0,0);
        let s = 0;
        const anim = () => {
            s += 0.2;
            if(s < 1) {
                this.brickRef.scale.set(s,s,s);
                requestAnimationFrame(anim);
            } else {
                this.brickRef.scale.set(1,1,1);
            }
        };
        anim();
    }

    undo() {
        if (this.brickRef) {
            this.sceneManager.remove(this.brickRef);
            STATE.bricks = STATE.bricks.filter(b => b !== this.brickRef);
        }
    }
}

export class RemoveBrickCommand {
    constructor(sceneManager, brickRef) {
        this.sceneManager = sceneManager;
        this.brickRef = brickRef;
    }

    execute() {
        this.sceneManager.remove(this.brickRef);
        STATE.bricks = STATE.bricks.filter(b => b !== this.brickRef);
    }

    undo() {
        this.sceneManager.add(this.brickRef);
        STATE.bricks.push(this.brickRef);
        
        this.brickRef.scale.set(0,0,0);
        let s = 0;
        const anim = () => {
            s += 0.2;
            if(s < 1) {
                this.brickRef.scale.set(s,s,s);
                requestAnimationFrame(anim);
            } else {
                this.brickRef.scale.set(1,1,1);
            }
        };
        anim();
    }
}
