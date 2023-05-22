import Phaser from 'phaser';
import { MainScene } from './scene/mainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  zoom: 2,
  width: 320,
  height: 320,
  backgroundColor: 0x000,
  scene: [MainScene],
  audio: {
    noAudio: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);