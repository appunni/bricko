import { SceneManager } from './core/SceneManager.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const sceneManager = new SceneManager('canvas-container');
    const inputManager = new InputManager(sceneManager);
    const uiManager = new UIManager(inputManager, sceneManager);
});