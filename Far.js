//Global vars
var TileHeight;

var state;

//##############

function Far(texture, width, height){
	var farTexture = PIXI.Texture.fromImage(texture);
	PIXI.TilingSprite.call(this, farTexture, width, height);
	this.position.x = 0;
	this.position.y = 0;
	this.tilePosition.x = 0;
	this.tilePosition.y = 0;
	this.viewportX = 0;
}

Far.constructor = Far;
Far.prototype = Object.create(PIXI.TilingSprite.prototype);
Far.DELTA_X = 0.064;

Far.prototype.setViewportX = function(newViewportX) {
	var distanceTravelled = newViewportX - this.viewportX;
	this.viewportX = newViewportX;
	this.tilePosition.x -= (distanceTravelled * Far.DELTA_X);
};

// ##################

function Mid(texture, width, height){
	var midTexture = PIXI.Texture.fromImage(texture);
	PIXI.TilingSprite.call(this, midTexture, width, height);
	this.position.x = 0;
	this.position.y = 128;
	this.tilePosition.x = 0;
	this.tilePosition.y = 0;
	this.viewportX = 0;
}
Mid.constructor = Mid;
Mid.prototype = Object.create(PIXI.TilingSprite.prototype);
Mid.DELTA_X = 0.32;

Mid.prototype.setViewportX = function(newViewportX) {
	var distanceTravelled = newViewportX - this.viewportX;
	this.viewportX = newViewportX;
	this.tilePosition.x -= (distanceTravelled * Mid.DELTA_X);
};

// ##################

function Scroller(stage) {
	this.far =  new Far("resources/bg-far.png", 512, 256);
	stage.addChild(this.far);
	
	this.mid = new Mid("resources/bg-mid.png", 512, 256);
	stage.addChild(this.mid);
	
	this.front = new Walls();
	stage.addChild(this.front);
	
	this.mapBuilder = new MapBuilder(this.front);
	
	this.char = new Character("resources/char.png");
	
	// stage.addChild(this.char);
	
	this.viewportX = 0;
	
}

Scroller.constructor = Scroller;

Scroller.prototype.setViewportX = function(viewportX) {
	this.viewportX = viewportX;
	this.far.setViewportX(viewportX);
	this.mid.setViewportX(viewportX);
	this.front.setViewportX(viewportX);
	this.char.setViewportX(viewportX);
};

Scroller.prototype.moveViewportXBy = function(units) {
	var newViewportX = this.viewportX + units;
	this.setViewportX(newViewportX);
};

Scroller.prototype.getViewportX = function() {
	return this.viewportX;
};

//###############
//character

function Character(texture){
	var assetsToLoad = ["resources/char.json"];
	var charloader = new PIXI.AssetLoader(assetsToLoad);
	charloader.onComplete = this.bindSprite.bind(this);
	state = "pause";
	charloader.load();
	
	this.sprite = null; //PIXI.Sprite.fromFrame("walk_01");
	// var sprite = PIXI.Sprite.fromFrame(frameId)
	// var charTexture = PIXI.Texture.fromImage(texture);
	// PIXI.TilingSprite.call(this, charTexture, 32, 64);
	this.position = {};
	this.position.x = 32;
	this.position.y = 0;
	this.viewportX = 0;
	this.fallspeed = 3;
	this.jumpspeed = 5;
	this.jumplength = 20;
	this.lastJump = -1;
	
	this.walkcycle = ["walk_01", "walk_02", "walk_03", "walk_04", "walk_05", "walk_06", "walk_07", "walk_08", "walk_09", "walk_10",];
	this.lastWalkCycleFrame = -1;
	this.currentCycleFrame = -1;
	this.walkCycleThresh = 10;
	
	this.jumpcycle = ["jump_01", "jump_02"];
	this.lastjumpCycleFrame = -1;
	this.currentjumpCycleFrame = -1;
	
	this.left = keyboard(37);
	this.up = keyboard(38);
	this.right = keyboard(39);
	this.down = keyboard(40);
	
	this.jumpsound = new Audio("resources/sound/jump.m4a");
	this.walksound = new Audio("resources/sound/concrete1.wav");
	this.walksound.loop = true;
		
	// up.press = this.char.jumpDown(this.char);
	this.up.release = this.jumpUp;
}
// Character.constructor = Character;
// Character.prototype = Object.create(PIXI.Sprite.prototype);

Character.prototype.setPosY = function(pos){
	this.position.y = pos;
	this.sprite.position.y = pos;
}
Character.prototype.bindSprite = function(){
	this.sprite = PIXI.Sprite.fromFrame("walk_01");
	this.sprite.position.x = this.position.x;
	this.sprite.position.y = this.position.y;
	this.sprite.viewportX = this.viewportX;
	main.stage.addChild(this.sprite);
	state = "play";
}
	
Character.prototype.jumpUp = function(){
	if(state == "dead") return;
	state = "falling";
	// console.log(state);
}

Character.prototype.setViewportX = function(newViewportX) {
	this.viewportX = newViewportX;
	// console.log(this.position.y + "	" + this.sprite.position.y);
	if( (state == "play" || state == "jumping" || this.jumplength == -1) && this.up.isDown){
		this.walksound.pause();
		if(state == "play" ){
			state = "jumping";
			this.lastJump = newViewportX;
			var sound=this.jumpsound.cloneNode();
			sound.volume = 0.08;
			sound.play();
		}
		if(state == "falling" && this.jumplength == -1){
			state = "jumping";
		}
		
		if(newViewportX - this.lastJump > (this.jumplength * main.scrollSpeed) && this.jumplength != -1){
			state = "falling";
		}
		
		//char is in the air or about to start jumping up
		if(newViewportX - this.lastjumpCycleFrame > this.walkCycleThresh){
				//walkCycleThresh reached, time for a new animation frame
				main.stage.removeChild(this.sprite);
				this.lastjumpCycleFrame = this.viewportX;
				
				if(++this.currentjumpCycleFrame >= this.jumpcycle.length){
					this.currentjumpCycleFrame = 0;
				}
				// console.log(this.jumpcycle[this.currentjumpCycleFrame]);
				this.sprite = PIXI.Sprite.fromFrame(this.jumpcycle[this.currentjumpCycleFrame]);
				this.sprite.position.x = this.position.x;
				this.sprite.position.y = this.position.y;
				this.sprite.viewportX = this.viewportX;
				main.stage.addChild(this.sprite);
			}
		
		if ( this.position.y <= 0){
			this.setPosY(0);
		}else{
			this.setPosY(this.position.y - this.jumpspeed);
		}
	}
	
	if(state == "falling" || state == "play"){
		if (this.position.y > 384){
			state = "dead";
			return;
		}
		var distanceTravelled = newViewportX - this.viewportX;
		var offsetY = TileHeight - 15;
		if( offsetY != this.position.y){
			if ( (offsetY + this.fallspeed - 1) > this.position.y && (offsetY - this.fallspeed - 1) < this.position.y ){
				//character is between falling speed and walking height
				this.setPosY(offsetY);
				this.walksound.play();
				if(state != "play"){
					//character just landed or slided
					state = "play";
					this.lastWalkCycleFrame = this.viewportX;
					this.currentCycleFrame = 0;
					main.stage.removeChild(this.sprite);
					this.sprite = PIXI.Sprite.fromFrame(this.walkcycle[this.currentCycleFrame]);
					this.sprite.position.x = this.position.x;
					this.sprite.position.y = this.position.y;
					this.sprite.viewportX = this.viewportX;
					main.stage.addChild(this.sprite);
				}else{
					
				}
			}else{
				//Fall as regular
				this.setPosY(this.position.y + this.fallspeed);
				this.walksound.pause();
				
				main.stage.removeChild(this.sprite);
				this.sprite = PIXI.Sprite.fromFrame("fall_01");
				this.sprite.position.x = this.position.x;
				this.sprite.position.y = this.position.y;
				this.sprite.viewportX = this.viewportX;
				main.stage.addChild(this.sprite);
				
				state = "falling";
			}
		}
		else{
			state = "play";
			//character is walking
			if(newViewportX - this.lastWalkCycleFrame > this.walkCycleThresh){
				//walkCycleThresh reached, time for a new animation frame
				main.stage.removeChild(this.sprite);
				this.lastWalkCycleFrame = this.viewportX;
				
				if(++this.currentCycleFrame >= this.walkcycle.length){
					this.currentCycleFrame = 0;
				}
				this.sprite = PIXI.Sprite.fromFrame(this.walkcycle[this.currentCycleFrame]);
				// console.log(this.sprite);
				this.sprite.position.x = this.position.x;
				this.sprite.position.y = this.position.y;
				this.sprite.viewportX = this.viewportX;
				main.stage.addChild(this.sprite);
			}
		}
	}
	
	// this.tilePosition.x -= (distanceTravelled * Mid.DELTA_X);
};

// ####################

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}
// ####################

function Main() {
	this.stage = new PIXI.Stage(0x66FF99);
	this.renderer = new PIXI.autoDetectRenderer(
		512,
		384,
		{view:document.getElementById("game-canvas")}
	);

	// this.scroller = new Scroller(this.stage);
	state = "play";
	this.scrollSpeed = Main.MIN_SCROLL_SPEED;
	this.loadSpriteSheet();
	// requestAnimFrame(this.update.bind(this));
	}

Main.constructor = Main;
// Main.SCROLL_SPEED = 5;
Main.MIN_SCROLL_SPEED = 2;
Main.MAX_SCROLL_SPEED = 10;
Main.SCROLL_ACCELERATION = 0.0015;

Main.prototype.update = function() {
	// this.scroller.moveViewportXBy(this.SCROLL_SPEED);
	switch (state) {
		case "jumping":
		case "falling":
		case "play":
			this.scroller.moveViewportXBy(this.scrollSpeed);
			break;
		case "break":
			break;
		case "dead":
			this.scroller.moveViewportXBy(0);
			break;
		default:
			break;
	}
	this.scrollSpeed += Main.SCROLL_ACCELERATION;
	  if (this.scrollSpeed > Main.MAX_SCROLL_SPEED)
	  {
		this.scrollSpeed = Main.MAX_SCROLL_SPEED;
	  }
	this.renderer.render(this.stage);
	requestAnimFrame(this.update.bind(this));
};

Main.prototype.loadSpriteSheet = function() {
	var assetsToLoad = ["resources/wall.json"];
	loader = new PIXI.AssetLoader(assetsToLoad);
	loader.onComplete = this.spriteSheetLoaded.bind(this);
	loader.load();
};

Main.prototype.spriteSheetLoaded = function() {
	this.scroller = new Scroller(this.stage);
	requestAnimFrame(this.update.bind(this));
};

Main.prototype.borrowWallSprites = function(num) {
	for (var i = 0; i < num; i++)
	{
		// var sprite = this.pool.borrowWindow();
		if (i % 2 == 0) {
			var sprite = this.pool.borrowWindow();
		} else {
			var sprite = this.pool.borrowDecoration();
		}
		sprite.position.x = -32 + (i * 64);
		sprite.position.y = 0;

		this.wallSlices.push(sprite);

		this.stage.addChild(sprite);
	}
};

Main.prototype.returnWallSprites = function() {
	for (var i = 0; i < this.wallSlices.length; i++)
	{
		var sprite = this.wallSlices[i];
		this.stage.removeChild(sprite);
		if (i % 2 == 0) {
			var sprite = this.pool.borrowWindow();
		} else {
			var sprite = this.pool.borrowDecoration();
		}
	}

	this.wallSlices = [];
};

Main.prototype.generateTestWallSpan = function() {
  var lookupTable = [
    this.pool.borrowFrontEdge,  // 1st slice
    this.pool.borrowWindow,     // 2nd slice
    this.pool.borrowDecoration, // 3rd slice
    this.pool.borrowStep,       // 4th slice
    this.pool.borrowWindow,     // 5th slice
    this.pool.borrowBackEdge    // 6th slice
  ];
  
  var yPos = [
    128, // 1st slice
    128, // 2nd slice
    128, // 3rd slice
    192, // 4th slice
    192, // 5th slice
    192  // 6th slice
  ];
  
  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];

    var sprite = func.call(this.pool);
    sprite.position.x = 32 + (i * 64);
    sprite.position.y = yPos[i];

    this.wallSlices.push(sprite);

    this.stage.addChild(sprite);
  }
}

Main.prototype.clearTestWallSpan = function() {
  var lookupTable = [
    this.pool.returnFrontEdge,  // 1st slice
    this.pool.returnWindow,     // 2nd slice
    this.pool.returnDecoration, // 3rd slice
    this.pool.returnStep,       // 4th slice
    this.pool.returnWindow,     // 5th slice
    this.pool.returnBackEdge    // 6th slice
  ];

  for (var i = 0; i < lookupTable.length; i++)
  {
    var func = lookupTable[i];
    var sprite = this.wallSlices[i];

    this.stage.removeChild(sprite);
    func.call(this.pool, sprite);
  }

  this.wallSlices = [];
};

// ################

function WallSpritesPool() {
	this.createWindows();
	this.createDecorations();
	this.createFrontEdges();
	this.createBackEdges();
	this.createSteps();
}

WallSpritesPool.prototype.createWindows = function() {
	this.windows = [];

	this.addWindowSprites(6, "window_01");
	this.addWindowSprites(6, "window_02");

	this.shuffle(this.windows);
};

WallSpritesPool.prototype.createDecorations = function() {
	this.decorations = [];

	this.addDecorationSprites(6, "decoration_01");
	this.addDecorationSprites(6, "decoration_02");
	this.addDecorationSprites(6, "decoration_03");

	this.shuffle(this.decorations);
};

WallSpritesPool.prototype.createFrontEdges = function() {
	  this.frontEdges = [];

	  this.addFrontEdgeSprites(2, "edge_01");
	  this.addFrontEdgeSprites(2, "edge_02");

	  this.shuffle(this.frontEdges);
};

WallSpritesPool.prototype.createBackEdges = function() {
	  this.backEdges = [];

	  this.addBackEdgeSprites(2, "edge_01");
	  this.addBackEdgeSprites(2, "edge_02");

	  this.shuffle(this.backEdges);
};

WallSpritesPool.prototype.borrowWindow = function() {
	return this.windows.shift();
};

WallSpritesPool.prototype.returnWindow = function(sprite) {
	this.windows.push(sprite);
};

WallSpritesPool.prototype.borrowDecoration = function() {
	return this.decorations.shift();
};
	
WallSpritesPool.prototype.returnDecoration = function(sprite) {
	this.decorations.push(sprite);
};

WallSpritesPool.prototype.addWindowSprites = function(amount, frameId) {
	for (var i = 0; i < amount; i++)
	{
		var sprite = PIXI.Sprite.fromFrame(frameId);
		this.windows.push(sprite);
	}
};

WallSpritesPool.prototype.addDecorationSprites = function(amount, frameId) {
	for (var i = 0; i < amount; i++)
	{
		var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
		this.decorations.push(sprite);
	}
};

WallSpritesPool.prototype.addFrontEdgeSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    this.frontEdges.push(sprite);
  }
};

WallSpritesPool.prototype.addBackEdgeSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    sprite.anchor.x = 1;
    sprite.scale.x = -1;
    this.backEdges.push(sprite);
  }
};

WallSpritesPool.prototype.createSteps = function() {
  this.steps = [];
  this.addStepSprites(2, "step_01");
};

WallSpritesPool.prototype.addStepSprites = function(amount, frameId) {
  for (var i = 0; i < amount; i++)
  {
    var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(frameId));
    sprite.anchor.y = 0.25;
    this.steps.push(sprite);
  }
};

WallSpritesPool.prototype.borrowStep = function() {
  return this.steps.shift();
};

WallSpritesPool.prototype.returnStep = function(sprite) {
  this.steps.push(sprite);
};

WallSpritesPool.prototype.shuffle = function(array) {
	var len = array.length;
	var shuffles = len * 3;
	for (var i = 0; i < shuffles; i++)
	{
		var wallSlice = array.pop();
		var pos = Math.floor(Math.random() * (len-1));
		array.splice(pos, 0, wallSlice);
	}
};

WallSpritesPool.prototype.borrowFrontEdge = function() {
  return this.frontEdges.shift();
};

WallSpritesPool.prototype.returnFrontEdge = function(sprite) {
  this.frontEdges.push(sprite);
};

WallSpritesPool.prototype.borrowBackEdge = function() {
  return this.backEdges.shift();
};

WallSpritesPool.prototype.returnBackEdge = function(sprite) {
  this.backEdges.push(sprite);
};

// ################

function SliceType() {}

SliceType.FRONT      = 0;
SliceType.BACK       = 1;
SliceType.STEP       = 2;
SliceType.DECORATION = 3;
SliceType.WINDOW     = 4;
SliceType.GAP        = 5;

// ################

function Walls() {
  PIXI.DisplayObjectContainer.call(this);
  
  this.pool = new WallSpritesPool();
  this.createLookupTables();
  
  this.slices = [];
  // this.createTestMap();
  
  this.viewportX = 0;
  this.viewportSliceX = 0;
}

WallSlice.WIDTH = 64;

Walls.constructor = Walls;
Walls.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Walls.VIEWPORT_WIDTH = 512;
Walls.VIEWPORT_NUM_SLICES = Math.ceil(Walls.VIEWPORT_WIDTH/WallSlice.WIDTH) + 1;

function WallSlice(type, y) {
  this.type   = type;
  this.y      = y;
  this.sprite = null;
}

Walls.prototype.addSlice = function(sliceType, y) {
  var slice = new WallSlice(sliceType, y);
  this.slices.push(slice);
};

Walls.prototype.createTestWallSpan = function() {
  this.addSlice(SliceType.FRONT, 192);
  this.addSlice(SliceType.WINDOW, 192);
  this.addSlice(SliceType.DECORATION, 192);
  this.addSlice(SliceType.WINDOW, 192);
  this.addSlice(SliceType.DECORATION, 192);
  this.addSlice(SliceType.WINDOW, 192);
  this.addSlice(SliceType.DECORATION, 192);
  this.addSlice(SliceType.WINDOW, 192);
  this.addSlice(SliceType.BACK, 192);
};

Walls.prototype.createTestSteppedWallSpan = function() {
  this.addSlice(SliceType.FRONT, 192);
  this.addSlice(SliceType.WINDOW, 192);
  this.addSlice(SliceType.DECORATION, 192);
 
  this.addSlice(SliceType.STEP, 256);
  this.addSlice(SliceType.WINDOW, 256);
  this.addSlice(SliceType.BACK, 256);
};

Walls.prototype.createTestGap = function() {
  this.addSlice(SliceType.GAP);
};

Walls.prototype.createTestMap = function() {
  for (var i = 0; i < 10; i++)
  {
    this.createTestWallSpan();
    this.createTestGap();
    this.createTestSteppedWallSpan();
    this.createTestGap();
  }
};

Walls.prototype.createLookupTables = function() {
  this.borrowWallSpriteLookup = [];
  this.borrowWallSpriteLookup[SliceType.FRONT] = this.pool.borrowFrontEdge;
  this.borrowWallSpriteLookup[SliceType.BACK] = this.pool.borrowBackEdge;
  this.borrowWallSpriteLookup[SliceType.STEP] = this.pool.borrowStep;
  this.borrowWallSpriteLookup[SliceType.DECORATION] = this.pool.borrowDecoration;
  this.borrowWallSpriteLookup[SliceType.WINDOW] = this.pool.borrowWindow;

  this.returnWallSpriteLookup = [];
  this.returnWallSpriteLookup[SliceType.FRONT] = this.pool.returnFrontEdge;
  this.returnWallSpriteLookup[SliceType.BACK] = this.pool.returnBackEdge;
  this.returnWallSpriteLookup[SliceType.STEP] = this.pool.returnStep;
  this.returnWallSpriteLookup[SliceType.DECORATION] = this.pool.returnDecoration;
  this.returnWallSpriteLookup[SliceType.WINDOW] = this.pool.returnWindow;
};

Walls.prototype.borrowWallSprite = function(sliceType) {
  return this.borrowWallSpriteLookup[sliceType].call(this.pool);
};

Walls.prototype.returnWallSprite = function(sliceType, sliceSprite) {
  return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
};

Walls.prototype.setViewportX = function(viewportX) {
	this.viewportX = this.checkViewportXBounds(viewportX);
	var prevViewportSliceX = this.viewportSliceX;
	this.viewportSliceX = Math.floor(this.viewportX/WallSlice.WIDTH);
	TileHeight = this.slices[this.viewportSliceX + 1].y || -1;
	this.removeOldSlices(prevViewportSliceX);
	this.addNewSlices();
	// console.log(this.viewportSliceX + "	" + TileHeight);
};

Walls.prototype.removeOldSlices = function(prevViewportSliceX) {
	var numOldSlices = this.viewportSliceX - prevViewportSliceX;
	if (numOldSlices > Walls.VIEWPORT_NUM_SLICES)
	{
		numOldSlices = Walls.VIEWPORT_NUM_SLICES;
	}
	for (var i = prevViewportSliceX; i < prevViewportSliceX + numOldSlices; i++)
	{
		var slice = this.slices[i];
		if (slice.sprite != null)
		{
		  this.returnWallSprite(slice.type, slice.sprite);
		  this.removeChild(slice.sprite);
		  slice.sprite = null;
		}
	}
};

Walls.prototype.addNewSlices = function() {
	var firstX = -(this.viewportX % WallSlice.WIDTH);
  for (var i = this.viewportSliceX, sliceIndex = 0;
           i < this.viewportSliceX + Walls.VIEWPORT_NUM_SLICES;
           i++, sliceIndex++)
  {
	  var slice = this.slices[i];
    if (slice.sprite == null && slice.type != SliceType.GAP)
    {
      // Associate the slice with a sprite and update the sprite's position
	  slice.sprite = this.borrowWallSprite(slice.type);

      slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH);
      slice.sprite.position.y = slice.y;

      this.addChild(slice.sprite);
    }
    else if (slice.sprite != null)
    {
      // The slice is already associated with a sprite. Just update its position
	  slice.sprite.position.x = firstX + (sliceIndex * WallSlice.WIDTH);
    }
  }
};

Walls.prototype.checkViewportXBounds = function(viewportX) {
  var maxViewportX = (this.slices.length - Walls.VIEWPORT_NUM_SLICES) * WallSlice.WIDTH;
  if (viewportX < 0)
  {
    viewportX = 0;
  }
  else if (viewportX > maxViewportX)
  {
    viewportX = maxViewportX;
  }

  return viewportX;
};

// #############

function MapBuilder(walls) {
   this.walls = walls;
   this.createMap();
}

MapBuilder.WALL_HEIGHTS = [
  256, // Lowest slice
  224,
  192,
  160,
  128  // Highest slice
];

MapBuilder.prototype.createMap = function() {
	this.createWallSpan(3, 9, true);
  this.createGap(1);
  this.createWallSpan(1, 30);
  this.createGap(1);
  this.createWallSpan(2, 18);
  this.createGap(1);
  this.createSteppedWallSpan(2, 5, 28);
  this.createGap(1);
  this.createWallSpan(1, 10);
  this.createGap(1);
  this.createWallSpan(2, 6); 
  this.createGap(1);
  this.createWallSpan(1, 8);
  this.createGap(1);
  this.createWallSpan(2, 6);
  this.createGap(1);
  this.createWallSpan(1, 8);
  this.createGap(1)
  this.createWallSpan(2, 7);
  this.createGap(1);
  this.createWallSpan(1, 16);
  this.createGap(1);
  this.createWallSpan(2, 6);
  this.createGap(1);
  this.createWallSpan(1, 22);
  this.createGap(2);
  this.createWallSpan(2, 14);
  this.createGap(2);
  this.createWallSpan(3, 8);
  this.createGap(2);
  this.createSteppedWallSpan(3, 5, 12);
  this.createGap(3);
  this.createWallSpan(0, 8);
  this.createGap(3);
  this.createWallSpan(1, 50);
  this.createGap(20);
};

MapBuilder.prototype.createGap = function(spanLength) { 
  // TileHeight = 5000;
  for (var i = 0; i < spanLength; i++)
  {
    this.walls.addSlice(SliceType.GAP);
  }
};

MapBuilder.prototype.createWallSpan = function(heightIndex, spanLength, noFront, noBack) {
	noFront = noFront || false;
	noBack = noBack || false;
	// TileHeight = MapBuilder.WALL_HEIGHTS[heightIndex];
	if (noFront == false && spanLength > 0)
	{
		this.addWallFront(heightIndex);
		spanLength--;
	}
	var midSpanLength = spanLength - (noBack ? 0 : 1);
	if (midSpanLength > 0)
	{
		this.addWallMid(heightIndex, midSpanLength)
		spanLength -= midSpanLength;
	}
	
	if (noBack == false && spanLength > 0)
	{
		this.addWallBack(heightIndex);
	}
};

MapBuilder.prototype.createSteppedWallSpan = function(heightIndex, spanALength, spanBLength) {
	if (heightIndex < 2)
  {
    heightIndex = 2;
  }
  this.createWallSpan(heightIndex, spanALength, false, true);
  this.addWallStep(heightIndex - 2);
  this.createWallSpan(heightIndex - 2, spanBLength - 1, true, false);
};

MapBuilder.prototype.addWallFront = function(heightIndex) {
  var y = MapBuilder.WALL_HEIGHTS[heightIndex];
  this.walls.addSlice(SliceType.FRONT, y);
};

MapBuilder.prototype.addWallBack = function(heightIndex) {
  var y = MapBuilder.WALL_HEIGHTS[heightIndex];
  this.walls.addSlice(SliceType.BACK, y);
};

MapBuilder.prototype.addWallMid = function(heightIndex, spanLength) {
  var y = MapBuilder.WALL_HEIGHTS[heightIndex];
  for (var i = 0; i < spanLength; i++)
  {
    if (i % 2 == 0)
    {
      this.walls.addSlice(SliceType.WINDOW, y);
    }
    else
    {
      this.walls.addSlice(SliceType.DECORATION, y);
    }
  }
};

MapBuilder.prototype.addWallStep = function(heightIndex) {
  var y = MapBuilder.WALL_HEIGHTS[heightIndex];
  this.walls.addSlice(SliceType.STEP, y);
};