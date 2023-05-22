export class MainScene extends Phaser.Scene {
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  playerDirection: String;

  constructor() {
    super({ key: 'main', active: true });
  }

  preload(): void {
    // map infomation
    this.load.tilemapTiledJSON('map',"assets/map/map.json");

    // tilesets
    this.load.spritesheet('Fences','assets/images/tilesets/Fences.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Grass hill tiles v.2','assets/images/tilesets/Grass hill tiles v.2.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Grass tiles v.2','assets/images/tilesets/Grass tiles v.2.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Grass','assets/images/tilesets/Grass.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Hills','assets/images/tilesets/Hills.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Tall Grass hill tiles v.2','assets/images/tilesets/Tall Grass hill tiles v.2.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Tilled Dirt','assets/images/tilesets/Tilled Dirt.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Water','assets/images/tilesets/Water.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Wooden House','assets/images/tilesets/Wooden House.png', { frameWidth: 16, frameHeight: 16});

    // objects
    this.load.spritesheet('Basic Furniture', 'assets/images/objects/Basic Furniture.png', { frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('Basic Grass Biom things 1', 'assets/images/objects/Basic Grass Biom things 1.png', { frameWidth: 16, frameHeight: 16});

    // player
    this.load.spritesheet('player', 'assets/images/characters/Basic Character Spritesheet.png', { frameWidth: 16, frameHeight: 16, margin: 16, spacing: 32 });
  }

  create(): void {
    // sprite movements
    // player 
    // 자연스러운 움직임을 위해 시작 프레임은 3번째 부터
    this.anims.create({key: "player-up", frames: this.anims.generateFrameNumbers("player", {start: 4, end: 7, first: 6}), frameRate: 5, repeat: -1});
    this.anims.create({key: "player-left", frames: this.anims.generateFrameNumbers("player", {start: 8, end: 11, first: 10}), frameRate: 5, repeat: -1});
    this.anims.create({key: "player-right", frames: this.anims.generateFrameNumbers("player", {start: 12, end: 15, first: 14}), frameRate: 5, repeat: -1});
    this.anims.create({key: "player-down", frames: this.anims.generateFrameNumbers("player", {start: 0, end: 3, first: 2}), frameRate: 5, repeat: -1});

    // map
    const map = this.make.tilemap({ key: "map" });
    const tilesets = [];
    tilesets.push(map.addTilesetImage("Fences", "Fences"));
    tilesets.push(map.addTilesetImage("Grass hill tiles v.2", "Grass hill tiles v.2"));
    tilesets.push(map.addTilesetImage("Grass tiles v.2", "Grass tiles v.2"));
    tilesets.push(map.addTilesetImage("Grass", "Grass"));
    tilesets.push(map.addTilesetImage("Hills", "Hills"));
    tilesets.push(map.addTilesetImage("Tall Grass hill tiles v.2", "Tall Grass hill tiles v.2"));
    tilesets.push(map.addTilesetImage("Tilled Dirt", "Tilled Dirt"));
    tilesets.push(map.addTilesetImage("Water", "Water"));
    tilesets.push(map.addTilesetImage("Wooden House", "Wooden House"));

    // objects
    tilesets.push(map.addTilesetImage("Basic Furniture", "Basic Furniture"));
    tilesets.push(map.addTilesetImage("Basic Grass Biom things 1", "Basic Grass Biom things 1"));

    // layer
    const terrainLayer = map.createLayer("terrain", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    terrainLayer.setCollisionByProperty({ collides: true });
    const groundCollide = map.createLayer("ground-collide", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    groundCollide.setCollisionByProperty({ collides: true });
    const groundOverlap = map.createLayer("ground-overlap", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    const skyLayer = map.createLayer("sky", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;

    map.createFromObjects("object", {name: "door"}, true);

    const dynamicLayer = this.add.layer();
    terrainLayer.setDepth(0);
    groundCollide.setDepth(1);
    groundOverlap.setDepth(2);
    dynamicLayer.setDepth(3);
    skyLayer.setDepth(4);

    // player
    const playerPoint = map.findObject("object", obj => obj.name === "player") as Phaser.Types.Tilemaps.TiledObject;
    this.player = this.physics.add.sprite(playerPoint.x as number, playerPoint.y as number, "player").play("player-down");
    this.player.setSize(16, 8);
    this.playerDirection = "down";

    dynamicLayer.add(this.player);
    this.physics.add.collider(this.player, terrainLayer);
    this.physics.add.collider(this.player, groundCollide);

    // keyboard settings
    this.cursor = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  update(time: number, delta: number): void {
    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // 동시 키 입력 제한
    if (!(this.cursor.up.isDown && this.cursor.left.isDown || 
      this.cursor.up.isDown && this.cursor.right.isDown || 
      this.cursor.down.isDown && this.cursor.left.isDown || 
      this.cursor.down.isDown && this.cursor.right.isDown|| 
      this.cursor.up.isDown && this.cursor.down.isDown|| 
      this.cursor.right.isDown && this.cursor.left.isDown)
    ) {
      // Horizontal movement
      if (this.cursor.left.isDown) {
        if(this.playerDirection != "left") {
          this.player.play("player-left");
          this.playerDirection = "left";
        }
        this.player.body.setVelocityX(-100);
      } else if (this.cursor.right.isDown) {
        if(this.playerDirection != "right") {
          this.player.play("player-right");
          this.playerDirection = "right";
        }
        this.player.body.setVelocityX(100);
      }
      
      // Vertical movement
      if (this.cursor.up.isDown) {
        if(this.playerDirection != "up") {
          this.player.play("player-up");
          this.playerDirection = "up";
        }
        this.player.body.setVelocityY(-100);
      } else if (this.cursor.down.isDown) {
        if(this.playerDirection != "down") {
          this.player.play("player-down");
          this.playerDirection = "down";
        }
        this.player.body.setVelocityY(100);
      }
    }
  }

  destroy(): void {

  }
}