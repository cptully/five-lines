
const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2
}

class FallStrategy {
  constructor (private falling: boolean) {
    this.falling = falling;
  }
  isFalling() { return this.falling; }
  update(tile: Tile, x: number, y: number) { 
    this.falling = map[y + 1][x].isAir()
    this.drop(y, x, tile); 
  }

  private drop(y: number, x: number, tile: Tile) {
    if (this.falling) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }
}

interface Tile {
  isAir(): boolean;
  isFlux(): boolean;
  isStone(): boolean;
  isBox(): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  moveHorizontal(player: Player, dx: number): void;
  moveVertical(player: Player, dy: number): void;
  draw(x: number, y: number, g: CanvasRenderingContext2D): void;
  update(x: number, y: number): void;
}

class Air implements Tile {
  isAir() { return true; }
  isFlux() { return false; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) {
    player.moveToTile(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.moveToTile(0, dy);
  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {  }
  update(x: number, y: number) {  }
}

class Flux implements Tile {
  isAir() { return false; }
  isFlux() { return true; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) {
    player.moveToTile(dx, 0);
  }
  moveVertical(player: Player, dy: number) {
    player.moveToTile(0, dy);
  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {  }
}

class Unbreakable implements Tile {
  isAir() { return false; }
  isFlux() { return false; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) {  }
  moveVertical(player: Player, dy: number) {  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {  }
}

class PlayerTile implements Tile {
  isAir() { return false; }
  isFlux() { return false; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) {  }
  moveVertical(player: Player, dy: number) {  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {  }
  update(x: number, y: number) {  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  private pushStrategy: PushStrategy;

  constructor(falling: boolean) {
    this.fallStrategy = new FallStrategy(falling);
    this.pushStrategy = new PushStrategy();
  }
  isAir() { return false; }
  isFlux() { return false; }
  isStone() { return true; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) { 
    this.pushStrategy.moveHorizontal(player, this, dx) 
  }
  moveVertical(player: Player, dy: number) {  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  private pushStrategy: PushStrategy;

  constructor(falling: boolean) {
    this.fallStrategy = new FallStrategy(falling);
    this.pushStrategy = new PushStrategy();
  }
  isAir() { return false; }
  isFlux() { return false; }
  isStone() { return false; }
  isBox() { return true; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) { this.pushStrategy.moveHorizontal(player, this, dx) }
  moveVertical(player: Player, dy: number) {  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
}


class Key implements Tile{
  constructor(private keyConf: KeyConfiguration) {
    this.keyConf = keyConf;
  }
  isAir() { return false; }
  isFlux() { return false; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  moveHorizontal(player: Player, dx: number) {
    this.keyConf.removeLock();
    player.move(dx, 0);
    // moveToTile(player, player.getX() + dx, player.getY());
  }
  moveVertical(player: Player, dy: number) {
    this.keyConf.removeLock();
    player.move(0, dy);
    // moveToTile(player, player.getX(), player.getY() + dy);
  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {  }
}

class Lock implements Tile {
  constructor(private keyConf: KeyConfiguration) {
    this.keyConf = keyConf;
  }
  isAir() { return false; }
  isFlux() { return false; }
  isUnbreakable() { return false; }
  isPlayer() { return false; }
  isStone() { return false; }
  isBox() { return false; }
  isLock1() { return this.keyConf.is1(); }
  isLock2() { return !this.keyConf.is1(); }
  moveHorizontal(player: Player, dx: number) {  }
  moveVertical(player: Player, dy: number) {  }
  draw(x: number, y: number, g: CanvasRenderingContext2D) {
    this.keyConf.setColor(g);
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  update(x: number, y: number) {  }
}



class PushStrategy {
  moveHorizontal(player: Player, tile: Tile, dx: number) {
    player.pushHorizontal(tile, dx)
  }
}

enum RawInput {
  UP, DOWN, LEFT, RIGHT
}

interface Input2 {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;
  handle(player: Player): void;
}

class Right implements Input2 {
  isRight() { return true; }
  isLeft() { return false; }
  isUp() { return false; }
  isDown() { return false; }
  handle(player: Player) { player.move(1,0); }
}

class Left implements Input2 {
  isRight() { return false; }
  isLeft() { return true; }
  isUp() { return false; }
  isDown() { return false; }
  handle(player: Player) { player.move(-1,0); }
}

class Up implements Input2 {
  isRight() { return false; }
  isLeft() { return false; }
  isUp() { return true; }
  isDown() { return false; }
  handle(player: Player) { player.move(0,1); }
}

class Down implements Input2 {
  isRight() { return false; }
  isLeft() { return false; }
  isUp() { return false; }
  isDown() { return true; }
  handle(player: Player) { player.move(0,-1); }
}

function remove(shouldRemove: RemoveStrategy) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (shouldRemove.check(map[y][x])) {
        map[y][x] = new Air();
      }
    }
  }
}

function removeLock1() {
  remove(new RemoveLock1());
}

function removeLock2() {
  remove(new RemoveLock2)
}

interface RemoveStrategy {
  check(tile: Tile): boolean;
}

class RemoveLock1 implements RemoveStrategy {
  check(tile: Tile)  {
    return tile.isLock1();
  }
}

class RemoveLock2 implements RemoveStrategy {
  check(tile: Tile)  {
    return tile.isLock2();
  }
}

class KeyConfiguration {
  constructor(private color: string, private _1: boolean, private removeStrategy: RemoveStrategy) { }
  private getColor() { return this.color; }
  setColor(g: CanvasRenderingContext2D) { g.fillStyle = this.color; }
  is1() { return this._1; }
  removeLock() { this.removeStrategy; }
}

class Player {
  private x = 1;
  private y = 1;

  // private getX() { return this.x; }
  // getY() { return this.y; }
  // setX(x: number) { this.x = x; }
  // setY(y: number) { this.y = y; }

  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  moveHorizontal(dx: number) { map[this.y][this.x + dx].moveHorizontal(this, dx); }
  move(dx: number, dy: number) { this.moveToTile(this.x + dx, this.y + dy); }

  pushHorizontal(tile: Tile, dx: number) {
    if (map[this.y][this.x + dx + dx].isAir() && !map[this.y + 1][this.x + dx].isAir()) {
      map[this.y][this.x + dx + dx] = tile;
      this.moveToTile(this.x + dx, this.y);
    }
  }
  moveToTile(newx: number, newy: number) {
    map[this.y][this.x] = new Air();
    map[newy][newx] = new PlayerTile();
    this.x = newx;
    this.y = newy;
  }
}

let player = new Player();

const YELLOW_KEY = new KeyConfiguration("#ffcc00", true, new RemoveLock1());
const RED_KEY = new KeyConfiguration("cc00ff",false, new RemoveLock2());


let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

let map: Tile[][];

function assertExhausted(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function transformTile(tile: RawTile) {
  switch (tile) {
    case RawTile.AIR: return new Air();
    case RawTile.FLUX: return new Flux();
    case RawTile.UNBREAKABLE: return new Unbreakable();
    case RawTile.PLAYER: return new PlayerTile();
    case RawTile.STONE: return new Stone(false);
    case RawTile.FALLING_STONE: return new Stone(true);
    case RawTile.BOX: return new Box(false);
    case RawTile.FALLING_BOX: return new Box(true);
    case RawTile.KEY1: return new Key(YELLOW_KEY);
    case RawTile.LOCK1: return new Lock(YELLOW_KEY)
    case RawTile.KEY2: return new Key(RED_KEY)
    case RawTile.LOCK2: return new Lock(RED_KEY)
    default: assertExhausted(tile);
  }
}

function transformMap() {
  map = new Array(rawMap.length);
  for (let y = 0; y < rawMap.length; y++) {
    map[y] = new Array(rawMap[y].length);
    for (let x = 0; x < rawMap[y].length; x++) {
      map[y][x] = transformTile(rawMap[y][x]);
    }
  }
}

let inputs: Input2[] = [];

function update(player: Player) {
  handleInputs(player);
  updateMap();
}

function handleInputs(player: Player) {
  while (inputs.length > 0) {
    let input = inputs.pop();
    input.handle(player);
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].update(x, y);
    }
  }
}

function draw(player: Player) {
  let g = createGraphics();
  drawMap(g);
  player.draw(g);
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(x, y, g);
    }
  }
}

function gameLoop() {
  let before = Date.now();
  update(player);
  draw(player);
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(gameLoop, sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
}

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
window.addEventListener("keydown", e => {
  if (e.keyCode === LEFT_KEY || e.key === "a") inputs.push(new Left);
  else if (e.keyCode === UP_KEY || e.key === "w") inputs.push(new Up);
  else if (e.keyCode === RIGHT_KEY || e.key === "d") inputs.push(new Right);
  else if (e.keyCode === DOWN_KEY || e.key === "s") inputs.push(new Down);
});

