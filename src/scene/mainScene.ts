export class MainScene extends Phaser.Scene {
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  playerDirection: String;

  constructor() {
    super({ key: 'main', active: true });
  }

  preload(): void {
    // map infomation
    this.load.tilemapTiledJSON('house',"assets/map/house.json");

    // tilesets
    this.load.spritesheet('Wooden House','assets/images/tilesets/Wooden House.png', { frameWidth: 16, frameHeight: 16});

    // objects
    this.load.spritesheet('Basic Furniture', 'assets/images/objects/Basic Furniture.png', { frameWidth: 16, frameHeight: 16});

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

    // door
    this.anims.create({key: "door-open", frames: this.anims.generateFrameNumbers("Wooden House", {frames: [10, 24, 17], first: 10}), frameRate: 5, repeat: 0});

    // map
    const house = this.make.tilemap({ key: "house" });
    const tilesets = [];
    tilesets.push(house.addTilesetImage("Wooden House", "Wooden House"));

    // objects
    tilesets.push(house.addTilesetImage("Basic Furniture", "Basic Furniture"));

    // layer
    // layer from tilemap
    const floorLayer = house.createLayer("floor", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    const wallLayer = house.createLayer("wall", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    const overLayer = house.createLayer("over", tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    wallLayer.setCollisionByProperty({ collides: true });
    const objectLayer = this.add.layer();
    const characterLayer = this.add.layer();

    // layer depth setting
    floorLayer.setDepth(0);
    wallLayer.setDepth(1);
    objectLayer.setDepth(2);
    characterLayer.setDepth(3);
    overLayer.setDepth(4);

    // player
    const playerPoint = house.findObject("object", obj => obj.name === "player") as Phaser.Types.Tilemaps.TiledObject;
    this.player = this.physics.add.sprite(playerPoint.x as number, playerPoint.y as number, "player").play("player-down");
    characterLayer.add(this.player);
    this.player.setSize(14, 16);
    this.playerDirection = "down";
    
    this.physics.add.collider(this.player, wallLayer);

    // doors
    const doors = house.createFromObjects("object", {name: "door"});
    for(let door in doors) { 
      objectLayer.add(doors[door]);
      this.physics.world.enable(doors, Phaser.Physics.Arcade.STATIC_BODY);
      let collider = this.physics.add.collider(this.player, doors[door], (object1: any, object2: any) => {
        let door;
        if(object1.texture.key == "player") {
          door = object2;
        } else {
          door = object1;
        }
  
        this.openDoor(door, collider);
      });
    }

    // keyboard setting
    this.cursor = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    // camera setting
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  openDoor(door: any, collider: any): void {
    if(!door.open) {
      door.play("door-open");
      door.open = true;
      setTimeout(() => {
        this.physics.world.removeCollider(collider);
      }, 800);
    }
  }

  update(): void {
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