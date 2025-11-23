import { SceneManager } from './core/SceneManager.js';
import { InputManager } from './core/InputManager.js';
import { UIManager } from './ui/UIManager.js';
import { CommandManager } from './core/CommandManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const sceneManager = new SceneManager('canvas-container');
    const commandManager = new CommandManager();
    const inputManager = new InputManager(sceneManager, commandManager);
    const uiManager = new UIManager(inputManager, sceneManager, commandManager);
});