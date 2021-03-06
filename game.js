//Initializes the whole game with included json-file for game setup, character and enemies.
function init() {
	$.getJSON('gameSetup.json', function(data) {
		//reads the gameSetup-json and transforms it into an object for easy usage within JS
		gameSetup = data;
		gameSetup.assetsToLoad = [];
		
		//push json locations into an array. with these, files, sprites and objects will be generated
		gameSetup.assetsToLoad.push("resources/" + gameSetup.sideScroller.player);
		gameSetup.assetsToLoad.push("resources/" + gameSetup.sideScroller.mapGenerator.spritesheet);
		for(var enemy of gameSetup.sideScroller.enemies){
			gameSetup.assetsToLoad.push("resources/" + enemy);
		}
		
		//replace json location strings with actual objects
		$.getJSON("resources/" + gameSetup.sideScroller.player, function(dataPlayer) {
			gameSetup.sideScroller.player = dataPlayer.player;
		});
		
		for(var key in gameSetup.sideScroller.enemies){
			
			(function(key) {
				$.getJSON("resources/" + gameSetup.sideScroller.enemies[key], function(data) {
					gameSetup.sideScroller.enemies[key] = data.enemy;
				});
			})(key);
			
			// $.getJSON("resources/" + gameSetup.sideScroller.enemies[key], function(data) {
				// gameSetup.sideScroller.enemies[key] = data.enemy;
			// });
		}
		
		main = new Main();
		main.mainMenu = new MainMenu();
	});
}
//Updates the animation frame
function update(){
	// scroller.moveViewportXBy(5);
	
	renderer.render(stage);
	requestAnimFrame(update);
}

// ############
//Global vars
var TileHeight;

var state;

var gameSetup;



//##############
//The Far()-object for the farest background as shown in the documentation
function Far(){
	//loads the texture in the "resources"/" path
	var farTexture = PIXI.Texture.fromImage("resources/" + gameSetup.sideScroller.farBackground.texture);
	//sets object as TilingSprite
	PIXI.TilingSprite.call(this, farTexture, gameSetup.game.width, gameSetup.sideScroller.farBackground.height);
	this.position.x = 0;
	this.position.y = gameSetup.sideScroller.farBackground.y;
	this.tilePosition.x = 0;
	this.tilePosition.y = 0;
	this.viewportX = 0;
	//sets the scroll-speed
	this.DELTA_X = gameSetup.sideScroller.farBackground.deltaX;
}

Far.constructor = Far;
Far.prototype = Object.create(PIXI.TilingSprite.prototype);
// Far.DELTA_X = 0.064;

//updates the viewport-position
Far.prototype.setViewportX = function(newViewportX) {
	var distanceTravelled = newViewportX - this.viewportX;
	this.viewportX = newViewportX;
	this.tilePosition.x -= (distanceTravelled * this.DELTA_X);
};

// ##################

//The Mid()-Object for the middle background as shown in the documentation
//analogue to the Far()-Object
function Mid(){
	var midTexture = PIXI.Texture.fromImage("resources/" + gameSetup.sideScroller.nearBackground.texture);
	PIXI.TilingSprite.call(this, midTexture, gameSetup.game.width, gameSetup.sideScroller.nearBackground.height);
	this.position.x = 0;
	this.position.y = gameSetup.sideScroller.nearBackground.y;
	this.tilePosition.x = 0;
	this.tilePosition.y = 0;
	this.viewportX = 0;
	this.DELTA_X = gameSetup.sideScroller.nearBackground.deltaX;
}
Mid.constructor = Mid;
Mid.prototype = Object.create(PIXI.TilingSprite.prototype);
// Mid.DELTA_X = 0.32;

Mid.prototype.setViewportX = function(newViewportX) {
	var distanceTravelled = newViewportX - this.viewportX;
	this.viewportX = newViewportX;
	this.tilePosition.x -= (distanceTravelled * this.DELTA_X);
};

// ##################
//main menu
//MainMenu()-object for the main menu
function MainMenu(){
	//sets the state for other objects
	state = "mainmenu";
	//loads the background texture and sets it as Pixi.TilingSprite
		var backgroundTexture = new PIXI.Texture.fromImage("resources/" + gameSetup.mainMenu.backgroundTexture);
	this.background = new PIXI.TilingSprite(backgroundTexture, gameSetup.game.width, gameSetup.game.height);
	main.stage.addChild(this.background);
	
	//sets the game Title with css properties for font, fill, align, stroke, strokeThickness, anchor and position
	this.gameTitle = new PIXI.Text(gameSetup.mainMenu.gameTitle.text, {
		font: gameSetup.mainMenu.gameTitle.style.font, 
		fill: gameSetup.mainMenu.gameTitle.style.fill, 
		align: gameSetup.mainMenu.gameTitle.style.align, 
		stroke: gameSetup.mainMenu.gameTitle.style.stroke, 
		strokeThickness: gameSetup.mainMenu.gameTitle.style.strokeThickness
	});
	
	this.gameTitle.anchor.x = gameSetup.mainMenu.gameTitle.anchorX;
	this.gameTitle.anchor.y = gameSetup.mainMenu.gameTitle.anchorY;
	this.gameTitle.position.x = gameSetup.mainMenu.gameTitle.x;
	this.gameTitle.position.y = gameSetup.mainMenu.gameTitle.y;
	main.stage.addChild(this.gameTitle);
	
	//Sets the start button for playing the game
	var x = gameSetup.mainMenu.startButton.x;
	var y = gameSetup.mainMenu.startButton.y;
	var texture = gameSetup.mainMenu.startButton.texture;
	var texturePressed = gameSetup.mainMenu.startButton.texturePressed;
	this.startButton = new this.createButton("resources/" + texture, "resources/" + texturePressed, x, y);
	this.startButton.click = this.startButton.tap = function(data){
		main.stage.removeChild(main.mainMenu.startButton);
		main.stage.removeChild(main.mainMenu.background);
		main.stage.removeChild(main.mainMenu.gameTitle);
		for (var sprite of main.mainMenu.additionalButtons) {
			main.stage.removeChild(sprite);
		}
		
		main.loadSpriteSheet();
	}
	
	//sets additional buttons for facebook or similar, if wished
	this.additionalButtons = [];
	for (var key in gameSetup.mainMenu.additionalButtons){
		var addBut = this.createButton("resources/" + gameSetup.mainMenu.additionalButtons[key].texture, 
			"resources/" + gameSetup.mainMenu.additionalButtons[key].texturePressed, 
			gameSetup.mainMenu.additionalButtons[key].x, 
			gameSetup.mainMenu.additionalButtons[key].y);
		addBut.url = gameSetup.mainMenu.additionalButtons[key].url;
		
		addBut.openUrl = function(){
			window.open(this.url, '_blank')
		};
		
		addBut.click = addBut.tap = addBut.openUrl;
		this.additionalButtons.push(addBut);
	}
}

//sets buttons for the main menu with position, hover effects etc
MainMenu.prototype.createButton = function(texture, pressTexture, x, y){
	var button = new PIXI.Sprite(PIXI.Texture.fromImage(texture));
	
	button.position.x = x;
	button.position.y = y;
	
	button.interactive = true;
	
	button.mousedown = button.touchstart = function(data){
			
			this.isdown = true;
			this.setTexture(PIXI.Texture.fromImage(pressTexture));
			this.alpha = 1;
		}
	
	button.mouseup = button.touchend = function(data){
			this.setTexture(PIXI.Texture.fromImage(texture));
		}
	
	// set the mouseover callback..
	button.mouseover = function(data){
			
			this.isOver = true;
			
			if(this.isdown)return
			
			// this.setTexture(textureButtonOver)
		}
	
	// set the mouseout callback..
	button.mouseout = function(data){
			
			this.isOver = false;
			// if(this.isdown)return
			this.setTexture(PIXI.Texture.fromImage(texture))
		}
	
	button.click = null;
		
	button.tap = null;
	
	// add it to the stage
	main.stage.addChild(button);
	
	return button;
}

// ##################

//Scroller Object
//defines the main Object which loads all ressources for playing the game

function Scroller(stage) {
	///loads the far, mid and front layer
	this.far =  new Far("resources/bg-far.png", 512, 256);
	stage.addChild(this.far);
	
	this.mid = new Mid("resources/bg-mid.png", 512, 256);
	stage.addChild(this.mid);
	
	this.front = new Walls();
	stage.addChild(this.front);
	
	//creates the slices
	this.mapBuilder = new MapBuilder(this.front);
	
	this.char = new Character();
	
	this.enemyPool = [];
	// this.enemyPool.push(new Enemy(1450,"0"));
	// this.enemyPool.push(new Enemy(300,"0"));
	
	//creat red flash for the indicator that the char took damage.
	this.damageFlash = new PIXI.Sprite(PIXI.Texture.fromImage("resources/" + gameSetup.sideScroller.damageFlash.texture));
	this.damageFlash.alpha = 0;
	this.damageFlash.blendmode = PIXI.blendModes.MULTIPLY;
	this.damageFlash.duration = gameSetup.sideScroller.damageFlash.duration;
	stage.addChild(this.damageFlash);
	
	// create a text object with a nice stroke
	this.scoreCount = -1;
	this.score = new PIXI.Text("0", {font: gameSetup.sideScroller.score.style.font, fill: gameSetup.sideScroller.score.style.fill, align: gameSetup.sideScroller.score.style.align, stroke: gameSetup.sideScroller.score.style.stroke, strokeThickness: gameSetup.sideScroller.score.style.strokeThickness});this.score = new PIXI.Text("0", {font: gameSetup.sideScroller.score.style.font, fill: gameSetup.sideScroller.score.style.fill, align: gameSetup.sideScroller.score.style.align, stroke: gameSetup.sideScroller.score.style.stroke, strokeThickness: gameSetup.sideScroller.score.style.strokeThickness});
	// setting the anchor point to 0.5 will center align the text... great for spinning!
	// this.score.anchor.x = this.score.anchor.y = 0.5;
	this.score.anchor.x = gameSetup.sideScroller.score.anchorX;
	this.score.anchor.y = gameSetup.sideScroller.score.anchorY;
	this.score.position.x = gameSetup.sideScroller.score.x;
	this.score.position.y = gameSetup.sideScroller.score.y;
	
	stage.addChild(this.score);
	// stage.addChild(this.char);
	
	this.health = new PIXI.Text("0", {font: gameSetup.sideScroller.health.style.font, fill: gameSetup.sideScroller.health.style.fill, align: gameSetup.sideScroller.health.style.align, stroke: gameSetup.sideScroller.health.style.stroke, strokeThickness: gameSetup.sideScroller.health.style.strokeThickness});
	this.health.position.x = gameSetup.sideScroller.health.x;
	this.health.position.y = gameSetup.sideScroller.health.y;
	
	stage.addChild(this.health);
	
	this.viewportX = 0;
	
	//keyboard inputs
	this.up = keyboard(38);
	this.up.press = this.jumpDown;
	this.up.release = this.jumpUp;
	
	main.stage.mousedown = main.stage.touchstart = this.jumpDown;
	main.stage.mouseup = main.stage.touchend = this.jumpUp;
	
	//sets the state for other objects to communicate
	state = "play";
}

Scroller.constructor = Scroller;

//player presses the jump button
Scroller.prototype.jumpDown = function(){
	main.scroller.char.jumpPressed = true;
}

//player releases jump button
Scroller.prototype.jumpUp = function(){
	main.scroller.char.jumpPressed = false;
	if(state == "dead") return;
	state = "falling";
}
//updates the ViewportX
Scroller.prototype.setViewportX = function(viewportX) {
	this.viewportX = viewportX;
	this.mapBuilder.setViewportX(viewportX);
	this.far.setViewportX(viewportX);
	this.mid.setViewportX(viewportX);
	this.front.setViewportX(viewportX);
	this.char.setViewportX(viewportX);
	for (var value of this.enemyPool){
		value.setViewportX(viewportX);
	}
	if(this.damageFlash.alpha > 0){
		//remove and readd the sprite to the render to it is on top of every other sprite.
		main.stage.removeChild(this.damageFlash);
		this.damageFlash.alpha -= (this.damageFlash.duration / (60 * gameSetup.sideScroller.damageFlash.initialFlashAlpha));
		main.stage.addChild(this.damageFlash);
	}else{
		this.damageFlash.alpha = 0;
	}
	if(state != "dead")	this.score.setText(gameSetup.sideScroller.score.preText + ++this.scoreCount);
	this.health.setText(gameSetup.sideScroller.health.preText + this.char.health);
};

Scroller.prototype.moveViewportXBy = function(units) {
	var newViewportX = this.viewportX + units;
	this.setViewportX(newViewportX);
};

Scroller.prototype.getViewportX = function() {
	return this.viewportX;
};

//###############
//Enemy
//Enemy object with "pos" as position and "walkspeed" for moving speed
function Enemy(pos,index){
	//index is which enemytype in enemyarray

	this.start = pos;
	
	this.offsetY = gameSetup.sideScroller.enemies[index].offsetY;
	this.damage = gameSetup.sideScroller.enemies[index].damage;
	
	this.animationThresh = gameSetup.sideScroller.enemies[index].animationThresh;
	
	this.walkcycle = gameSetup.sideScroller.enemies[index].walkcycle;
	this.currentCycleFrame = -1;
	this.lastwalkcycle = -1;
	this.sprite = null;
	
	this.position = {};
	this.position.x = gameSetup.game.width;
	this.position.y = 0;
	
	this.minWalkSpeed = gameSetup.sideScroller.enemies[index].minWalkSpeed;
	this.maxWalkSpeed = gameSetup.sideScroller.enemies[index].maxWalkSpeed;
	
	if(this.minWalkSpeed == 0 && this.maxWalkSpeed == 0){
		this.walkspeed = 0;
	}else{		
		this.walkspeed = Math.random() * (this.maxWalkSpeed - this.minWalkSpeed + 1) + this.minWalkSpeed;
	}
	
	this.fallspeed = gameSetup.sideScroller.enemies[index].fallspeed;
	this.fallcycle = gameSetup.sideScroller.enemies[index].fallcycle;
	
	this.viewportX = 0;
	
	this.state = "walking";
}

//sets the viewport of the enemy
Enemy.prototype.setViewportX = function(newViewportX) {
	if(this.start - newViewportX <= 0){
		this.viewportX++;
		var offsetY = 0;
		if(this.sprite == null){
			this.sprite = PIXI.Sprite.fromFrame(this.walkcycle[0]);
			if(this.walkspeed < 0){
				this.sprite.scale.x = -1;
				this.sprite.anchor.x = 1;
			}
			this.sprite.position.x = this.position.x;
			main.stage.addChild(this.sprite);
			// this.setPosX(gameSetup.game.width);
			
			var sliceW = Math.floor(gameSetup.game.width / gameSetup.sideScroller.mapGenerator.tileWidth);
			var slices = main.scroller.front.slices;
			
			//set the enemy ontop of a tile, if it spawned on a gap, kill it
			var sliceHeight = slices[main.scroller.front.viewportSliceX + sliceW].y || gameSetup.game.height;
			// console.log(sliceHeight);
			offsetY = sliceHeight + this.offsetY;
			this.setPosY(offsetY);
		}
		// var mod = this.walkingspeed >= 0 ? -1 : 0;
		var slice1 = main.scroller.front.slices[Math.round(main.scroller.front.viewportSliceX + ( this.position.x / gameSetup.sideScroller.mapGenerator.tileWidth))].y || -1;
		var slice2 = main.scroller.front.slices[Math.ceil(main.scroller.front.viewportSliceX + ( this.position.x / gameSetup.sideScroller.mapGenerator.tileWidth))].y || -1;
		var currentSliceHeight = (slice1 + slice2) / 2; // = slice1 < slice2 ? slice2 : slice1;
		if(slice1 == -1 || slice2 ==-1){
			currentSliceHeight = -1;
		}else{
			if(this.walkspeed >=0){
				currentSliceHeight = slice1 > slice2 ? slice2 : slice1;
				if(slice1 < slice2) this.walkspeed = 0;
			}else{
				currentSliceHeight = slice1 < slice2 ? slice2 : slice1;
			}
		}
		
		if(this.walkspeed < 0){
			if(this.position.x < + this.sprite.width || this.position.y > gameSetup.game.height ){
				this.destroy();
			}
		}else{
			if(this.position.x < - this.sprite.width || this.position.y > gameSetup.game.height ){
				this.destroy();
			}
		}
		
		
		//move enemy in x-axis
		if(state != "dead")
			this.setPosX(this.position.x - (this.walkspeed + main.scrollSpeed));
		else
			this.setPosX(this.position.x - this.walkspeed);
		
		if(currentSliceHeight <= -1 || this.state == "falling"){
			this.state = "falling";
			this.setPosY(this.position.y + this.fallspeed);
		}else{
			offsetY = currentSliceHeight + this.offsetY;
			if ( (offsetY - this.fallspeed - 1) < this.position.y){
				//character is between falling speed and walking height
				if (!(this.walkspeed == 0))	this.setPosY(offsetY);
			}else{
				this.setPosY(this.position.y + this.fallspeed);
			}
		}
		//char loses hitpoints if colliding with enemy
		if(this.isColliding()){
			main.scroller.char.takeDamage(this.damage);
		}
		
		//change texture for walking animation
		if(this.walkspeed <= 0){
			if(this.walkspeed == 0){var speed = 1}
			else{var speed = -this.walkspeed;}
		}else{
			var speed = this.walkspeed;
		}
		if(this.walkspeed != 0 && (this.viewportX - this.lastwalkcycle > this.animationThresh / speed)){
			//animCycleThresh reached, time for a new animation frame
			this.lastwalkcycle = this.viewportX;
			
			if(++this.currentCycleFrame >= this.walkcycle.length){
				this.currentCycleFrame = 0;
			}
			this.sprite.setTexture(PIXI.Texture.fromFrame(this.walkcycle[this.currentCycleFrame]));
		}
	}
}
//method checks if enemy is colliding with player
Enemy.prototype.isColliding = function(){
	var char = main.scroller.char;
	return !(char.position.x > (this.position.x + this.sprite.width) || (char.position.x + char.sprite.width) < this.position.x || 
		char.position.y > (this.position.y + this.sprite.height) || (char.position.y + char.sprite.height) < this.position.y);
}

//sets the right y position of enemy
Enemy.prototype.setPosY = function(pos){
	this.position.y = pos;
	this.sprite.position.y = pos;
}
//method for destroying the enemy 
Enemy.prototype.destroy = function(pos){
	main.stage.removeChild(this.sprite);
			
	var index = main.scroller.enemyPool.indexOf(this);
	if(index > -1)	main.scroller.enemyPool.splice(index, 1);
}

Enemy.prototype.setPosX = function(pos){
	this.position.x = pos;
	this.sprite.position.x = pos;
}
//###############
//character Object with properties like position, fallspeed, jumpspeed, jumplength, different sounds, etc
function Character(){
	this.position = {};
	this.position.x = gameSetup.sideScroller.mapGenerator.tileWidth / 2;
	this.position.y = TileHeight;
	this.viewportX = 0;
	
	this.fallspeed = gameSetup.sideScroller.player.fallspeed;
	this.jumpspeed = gameSetup.sideScroller.player.jumpspeed;
	this.jumplength = gameSetup.sideScroller.player.jumplength;
	this.lastJump = -1;
	
	this.lastFallCycleFrame = -1;
	this.currentFallCycleFrame = -1
	this.fallcycle = gameSetup.sideScroller.player.fallcycle;
	
	this.walkcycle = gameSetup.sideScroller.player.walkcycle;
	this.lastWalkCycleFrame = -1;
	this.currentCycleFrame = -1;
	this.animCycleThresh = gameSetup.sideScroller.player.animationThresh;
	
	this.jumpcycle = gameSetup.sideScroller.player.jumpcycle;
	this.lastjumpCycleFrame = -1;
	this.currentjumpCycleFrame = -1;
	
	this.jumpsound = new Audio("resources/" + gameSetup.sideScroller.player.jumpsound);
	this.damagesound = new Audio("resources/" + gameSetup.sideScroller.player.damagesound);
	this.walksound = new Audio("resources/" + gameSetup.sideScroller.player.walksound);
	this.walksound.loop = true;
	this.walksound.volume = gameSetup.sideScroller.player.walksoundvolume;
	
	this.health = gameSetup.sideScroller.player.health;
	this.invulTime = gameSetup.sideScroller.player.invulTime;
	this.isInvul = false;
	
	this.offsetY = gameSetup.sideScroller.player.offsetY;
	
	this.jumpPressed = false;
	
	this.sprite = PIXI.Sprite.fromFrame(this.walkcycle[0]);
	this.sprite.position.x = this.position.x;
	this.sprite.position.y = this.position.y;
	this.sprite.viewportX = this.viewportX;
	main.stage.addChild(this.sprite);
	// up.press = this.char.jumpDown(this.char);
	
}
// Character.constructor = Character;
// Character.prototype = Object.create(PIXI.Sprite.prototype);

//if Character collides with enemy, this method will be called for getting damage
Character.prototype.takeDamage = function(amount){
	if(this.isInvul || state =="dead") return;
	this.health -= amount;
	if(this.health <= 0){
		this.health = 0;
		state = "dead";
		return;
	}
	this.isInvul = true;
	var sound=this.damagesound.cloneNode();
			sound.volume = 0.5;
			sound.play();
	main.scroller.damageFlash.alpha = gameSetup.sideScroller.damageFlash.initialFlashAlpha;
	setTimeout(function(){
		main.scroller.char.isInvul = false;
	}, this.invulTime * 1000);
}

//sets the right character position
Character.prototype.setPosY = function(pos){
	this.position.y = pos;
	this.sprite.position.y = pos;
}
//sets the first animationsprite for character
Character.prototype.bindSprite = function(){
	this.sprite = PIXI.Sprite.fromFrame("walk_01");
	this.sprite.position.x = this.position.x;
	this.sprite.position.y = this.position.y;
	this.sprite.viewportX = this.viewportX;
	main.stage.addChild(this.sprite);
	state = "play";
}

//viewportX method for character
Character.prototype.setViewportX = function(newViewportX) {
	this.viewportX = newViewportX;

	if( (state == "play" || state == "jumping" || this.jumplength == -1)&& this.jumpPressed){
		if(state == "dead") return;
		this.walksound.pause();
		if(state == "play" ){
			state = "jumping";
			this.lastJump = newViewportX;
			var sound=this.jumpsound.cloneNode();
			sound.volume = gameSetup.sideScroller.player.jumpsoundvolume;
			sound.play();
		}
		if(state == "falling" && this.jumplength == -1){
			state = "jumping";
		}
		
		if(newViewportX - this.lastJump > (this.jumplength * main.scrollSpeed) && this.jumplength != -1){
			state = "falling";
		}
		
		//char is in the air or about to start jumping up
		if(newViewportX - this.lastjumpCycleFrame > this.animCycleThresh){
				//animCycleThresh reached, time for a new animation frame
				this.lastjumpCycleFrame = this.viewportX;
				
				if(++this.currentjumpCycleFrame >= this.jumpcycle.length){
					this.currentjumpCycleFrame = 0;
				}
				this.sprite.setTexture(PIXI.Texture.fromFrame(this.jumpcycle[this.currentjumpCycleFrame]));
			}
		
		if ( this.position.y <= -this.sprite.height){
			this.setPosY(-this.sprite.height);
		}else{
			this.setPosY(this.position.y - this.jumpspeed);
		}
	}
	
	if(state == "falling" || state == "play"){
		if (this.position.y > gameSetup.game.height){
			state = "dead";
			return;
		}
		var distanceTravelled = newViewportX - this.viewportX;
		if(TileHeight == -1) TileHeight = -this.sprite.height -1;
		var offsetY = TileHeight + this.offsetY;
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
					this.sprite.setTexture( PIXI.Texture.fromFrame(this.walkcycle[this.currentCycleFrame]));
				}else{
					
				}
			}else{
				//Fall as regular
				this.setPosY(this.position.y + this.fallspeed);
				this.walksound.pause();
				if(newViewportX - this.lastFallCycleFrame > this.animCycleThresh){
					//animCycleThresh reached, time for a new animation frame
					this.lastFallCycleFrame = this.viewportX;
					
					if(++this.currentFallCycleFrame >= this.fallcycle.length){
						this.currentFallCycleFrame = 0;
					}
					this.sprite.setTexture(PIXI.Texture.fromFrame(this.fallcycle[this.currentFallCycleFrame]));
				}
				// this.sprite.setTexture(PIXI.Texture.fromFrame("fall_01"));

				state = "falling";
			}
		}
		else{
			state = "play";
			//character is walking
			if(newViewportX - this.lastWalkCycleFrame > this.animCycleThresh){
				//walkCycleThresh reached, time for a new animation frame
				this.lastWalkCycleFrame = this.viewportX;
				
				if(++this.currentCycleFrame >= this.walkcycle.length){
					this.currentCycleFrame = 0;
				}
				this.sprite.setTexture(PIXI.Texture.fromFrame(this.walkcycle[this.currentCycleFrame]));
			}
		}
	}
	
	// if(this.health <= 0) state = "dead";
	// this.tilePosition.x -= (distanceTravelled * Mid.DELTA_X);
};

// ####################
//function for keyboard input
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
//the main Object which creates the Stage with width, heigth and initial scrollspeed
function Main() {
	this.stage = new PIXI.Stage(0x000000);
	this.stage.interactive = true;
	this.renderer = new PIXI.autoDetectRenderer(
		gameSetup.game.width,
		gameSetup.game.height,
		// 512,
		// 384,
		{view:document.getElementById("game-canvas")}
	);

	// this.scroller = new Scroller(this.stage);
	state = "play";
	this.scrollSpeed = gameSetup.game.minScrollSpeed;
	requestAnimFrame(this.update.bind(this));
	// this.loadSpriteSheet();
	}

Main.constructor = Main;
// Main.SCROLL_SPEED = 5;
// Main.MIN_SCROLL_SPEED = 2;
// Main.MAX_SCROLL_SPEED = 10;
// Main.SCROLL_ACCELERATION = 0.0015;

//method for calling the death screen
Main.prototype.createDeathscreen = function(){
		this.deathScreen = new PIXI.DisplayObjectContainer();
		//loads ressources for deathscreen: sprites css properties etc
		this.deathScreen.width = gameSetup.game.width;
		this.deathScreen.height = gameSetup.game.height;
		
		var backgroundTexture = new PIXI.Texture.fromImage("resources/" + gameSetup.gameover.background);
		this.background = new PIXI.TilingSprite(backgroundTexture, gameSetup.game.width, gameSetup.game.height);
		this.background.alpha = gameSetup.gameover.backgroundOpacity;
		this.deathScreen.addChild(this.background);
		
		//shows the reached score
		this.score = new PIXI.Text(gameSetup.gameover.score.preText + main.scroller.scoreCount, {
			font: gameSetup.gameover.score.style.font, 
			fill: gameSetup.gameover.score.style.fill, 
			align: gameSetup.gameover.score.style.align, 
			stroke: gameSetup.gameover.score.style.stroke, 
			strokeThickness: gameSetup.gameover.score.style.strokeThickness});
		this.score.position.x = gameSetup.gameover.score.x;
		this.score.position.y = gameSetup.gameover.score.y;
		this.score.anchor.x = gameSetup.gameover.score.anchorX;
		this.score.anchor.y = gameSetup.gameover.score.anchorY;
		this.deathScreen.addChild(this.score);
		
		//shows the game over text
		this.gameovertext = new PIXI.Text(gameSetup.gameover.gameovertext.text, {
			font: gameSetup.gameover.gameovertext.style.font, 
			fill: gameSetup.gameover.gameovertext.style.fill, 
			align: gameSetup.gameover.gameovertext.style.align, 
			stroke: gameSetup.gameover.gameovertext.style.stroke, 
			strokeThickness: gameSetup.gameover.gameovertext.style.strokeThickness});
		this.gameovertext.position.x = gameSetup.gameover.gameovertext.x;
		this.gameovertext.position.y = gameSetup.gameover.gameovertext.y;
		this.gameovertext.anchor.x = gameSetup.gameover.gameovertext.anchorX;
		this.gameovertext.anchor.y = gameSetup.gameover.gameovertext.anchorY;
		this.deathScreen.addChild(this.gameovertext);
		
		//draws the retry button	
		this.retryButton = main.mainMenu.createButton("resources/" + gameSetup.gameover.retrybutton.texture, "resources/" + gameSetup.gameover.retrybutton.texturePressed, gameSetup.gameover.retrybutton.x, gameSetup.gameover.retrybutton.y);
		this.retryButton.anchor.x = gameSetup.gameover.retrybutton.anchorX;
		this.retryButton.anchor.y = gameSetup.gameover.retrybutton.anchorY;
		this.retryButton.click = this.retryButton.tap = function(data){
		
			//if clicked, the deathscreen will be disabled and properties for new game will be set
			for (var i = main.stage.children.length - 1; i >= 0; i--) {
				main.stage.removeChild(main.stage.children[i]);
			}
			main.deathScreen = null;
			main.scrollSpeed = gameSetup.game.minScrollSpeed;
			main.scroller = new Scroller(main.stage);
		}
		
		main.stage.addChild(this.deathScreen);
}

//Update method for checking ste state variable

Main.prototype.update = function() {
	// this.scroller.moveViewportXBy(this.SCROLL_SPEED);
	switch (state) {
		case "jumping":
		case "falling":
		case "play":
			this.scrollSpeed += gameSetup.game.scrollSpeedAcceleration;
			if (this.scrollSpeed > gameSetup.game.maxScrollSpeed){
				this.scrollSpeed = gameSetup.game.maxScrollSpeed;
			}
			this.scroller.moveViewportXBy(this.scrollSpeed);
			break;
		case "break":
			break;
		case "dead":
			this.scroller.moveViewportXBy(0);
			if(this.deathScreen == null) this.createDeathscreen();
			break;
		default:
			break;
	}
	this.renderer.render(this.stage);
	requestAnimFrame(this.update.bind(this));
};

//loads spritesheets
Main.prototype.loadSpriteSheet = function() {
	// var assetsToLoad = ["resources/wall.json"];
	for (var asset of gameSetup.assetsToLoad) console.log(asset);
	loader = new PIXI.AssetLoader(gameSetup.assetsToLoad);
	loader.onComplete = this.spriteSheetLoaded.bind(this);
	loader.load();
};

//creates scroller if spritesheets loaded
Main.prototype.spriteSheetLoaded = function() {
	this.scroller = new Scroller(this.stage);
	// requestAnimFrame(this.update.bind(this));
};

// ################

//wallsprites pool which includes the different tiles 
function WallSpritesPool() {
	this.createWindows();
	this.createDecorations();
	this.createFrontEdges();
	this.createBackEdges();
	this.createSteps();
}
//creates window tiles for the wallsprites pool and shuffles them
WallSpritesPool.prototype.createWindows = function() {
	this.windows = [];

	// this.addWindowSprites(6, "window_01");
	// this.addWindowSprites(6, "window_02");

	this.shuffle(this.windows);
};
//creates decoration tiles for the wallsprites pool and shuffles them

WallSpritesPool.prototype.createDecorations = function() {
	this.decorations = [];

	for (var decoration of gameSetup.sideScroller.mapGenerator.slicetypes.decoration){
		this.addDecorationSprites(6, decoration);
	}
	
	// this.addDecorationSprites(6, "decoration_01");
	// this.addDecorationSprites(6, "decoration_02");
	// this.addDecorationSprites(6, "decoration_03");

	this.shuffle(this.decorations);
};

//creates front tiles for the wallsprites pool and shuffles them

WallSpritesPool.prototype.createFrontEdges = function() {
	this.frontEdges = [];
	for (var edge of gameSetup.sideScroller.mapGenerator.slicetypes.edge){
		this.addFrontEdgeSprites(4, edge);
	}
	// this.addFrontEdgeSprites(2, "edge_01");
	// this.addFrontEdgeSprites(2, "edge_02");

	this.shuffle(this.frontEdges);
};

//creates back tiles for the wallsprites pool and shuffles them

WallSpritesPool.prototype.createBackEdges = function() {
	this.backEdges = [];

	for (var edge of gameSetup.sideScroller.mapGenerator.slicetypes.edge){
		this.addBackEdgeSprites(2, edge);
	}

	// this.addBackEdgeSprites(2, "edge_01");
	// this.addBackEdgeSprites(2, "edge_02");

	this.shuffle(this.backEdges);
};

//methods for creating, borrowing and returning different tiles
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

//method for shuffling tile array
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

//global variables for slice types
function SliceType() {}

SliceType.FRONT      = 0;
SliceType.BACK       = 1;
SliceType.STEP       = 2;
SliceType.DECORATION = 3;
SliceType.WINDOW     = 4;
SliceType.GAP        = 5;

// ################
//object for generating walls
function Walls() {
  PIXI.DisplayObjectContainer.call(this);
  
  this.pool = new WallSpritesPool();
  this.createLookupTables();
  
  this.slices = [];
  // this.createTestMap();
  
  this.viewportX = 0;
  this.viewportSliceX = 0;
  this.VIEWPORT_WIDTH = gameSetup.game.width;
  this.VIEWPORT_NUM_SLICES = Math.ceil(this.VIEWPORT_WIDTH/gameSetup.sideScroller.mapGenerator.tileWidth) + 1;
}

// WallSlice.WIDTH = 64;

Walls.constructor = Walls;
Walls.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);


function WallSlice(type, y) {
  this.type   = type;
  this.y      = y;
  this.sprite = null;
  this.WIDTH = gameSetup.sideScroller.mapGenerator.tileWidth;
}

Walls.prototype.addSlice = function(sliceType, y) {
  var slice = new WallSlice(sliceType, y);
  this.slices.push(slice);
};

//creates a lookup table for borrowing and returning wallsprites
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

//borrows wall slices
Walls.prototype.borrowWallSprite = function(sliceType) {
  return this.borrowWallSpriteLookup[sliceType].call(this.pool);
};

//returns wall slices
Walls.prototype.returnWallSprite = function(sliceType, sliceSprite) {
  return this.returnWallSpriteLookup[sliceType].call(this.pool, sliceSprite);
};

//sets the viewport 
Walls.prototype.setViewportX = function(viewportX) {
	this.viewportX = this.checkViewportXBounds(viewportX);
	var prevViewportSliceX = this.viewportSliceX;
	this.viewportSliceX = Math.floor(this.viewportX/gameSetup.sideScroller.mapGenerator.tileWidth);
	// if(this.slices[this.viewportSliceX + 1].y == null) return;
	TileHeight = this.slices[this.viewportSliceX + 1].y || -1;
	this.removeOldSlices(prevViewportSliceX);
	this.addNewSlices();
	// console.log(this.viewportSliceX + "	" + TileHeight);
};
//removes slice that has passed the viewport
Walls.prototype.removeOldSlices = function(prevViewportSliceX) {
	var numOldSlices = this.viewportSliceX - prevViewportSliceX;
	if (numOldSlices > this.VIEWPORT_NUM_SLICES)
	{
		numOldSlices = this.VIEWPORT_NUM_SLICES;
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

//adds new slices 
Walls.prototype.addNewSlices = function() {
	var firstX = -(this.viewportX % gameSetup.sideScroller.mapGenerator.tileWidth);
  for (var i = this.viewportSliceX, sliceIndex = 0;
           i < this.viewportSliceX + this.VIEWPORT_NUM_SLICES;
           i++, sliceIndex++)
  {
	  var slice = this.slices[i];
    if (slice.sprite == null && slice.type != SliceType.GAP)
    {
      // Associate the slice with a sprite and update the sprite's position
	  slice.sprite = this.borrowWallSprite(slice.type);

      slice.sprite.position.x = firstX + (sliceIndex * gameSetup.sideScroller.mapGenerator.tileWidth);
      slice.sprite.position.y = slice.y;

      this.addChild(slice.sprite);
    }
    else if (slice.sprite != null)
    {
      // The slice is already associated with a sprite. Just update its position
	  slice.sprite.position.x = firstX + (sliceIndex * gameSetup.sideScroller.mapGenerator.tileWidth);
    }
  }
};
//checks the viewport bounds 
Walls.prototype.checkViewportXBounds = function(viewportX) {
  var maxViewportX = (this.slices.length - this.VIEWPORT_NUM_SLICES) * gameSetup.sideScroller.mapGenerator.tileWidth;
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

//generates the wall map
function MapBuilder(walls) {
   this.walls = walls;
   MapBuilder.WALL_HEIGHTS = gameSetup.sideScroller.mapGenerator.platformHeights;
   this.minPlatformLength = gameSetup.sideScroller.mapGenerator.minPlatformLength;
   this.maxPlatformLength = gameSetup.sideScroller.mapGenerator.maxPlatformLength;
   this.allowSteppedPlatforms = gameSetup.sideScroller.mapGenerator.allowSteppedPlatforms;
   this.minEnemiesPerPlatform = gameSetup.sideScroller.mapGenerator.minEnemiesPerPlatform;
   this.maxEnemiesPerPlatform = gameSetup.sideScroller.mapGenerator.maxEnemiesPerPlatform;
   this.createMap();
}

//constant variables for different wall heights
MapBuilder.WALL_HEIGHTS = [
  // 256, // Lowest slice
  // 224,
  // 192,
  // 160,
  // 128  // Highest slice
];

MapBuilder.prototype.randomBetween = function(high, low){
	return Math.random()*(high-low+1)+low;
}

//function for adding new tiles before the player can see the last tile on screen
MapBuilder.prototype.setViewportX = function(viewportX){
	//generate new platforms if player is two viewport widths away from the last platform.
	if(this.walls.slices.length < this.walls.viewportSliceX + ((gameSetup.game.width / gameSetup.sideScroller.mapGenerator.tileWidth) * 2)){
		var stepped = gameSetup.sideScroller.mapGenerator.steppedPlatformsChance > Math.random() && this.allowSteppedPlatforms;
		var offset = 1;
		
		//go to the last tile that is not a gap
		while(this.walls.slices[this.walls.slices.length - offset].y == null){
			// console.log(this.walls.slices[this.walls.slices.length - offset].y);
			offset++;
		}
		var tileY = this.walls.slices[this.walls.slices.length - offset].y
		var lastHeightIndex;
		for(var key in MapBuilder.WALL_HEIGHTS) {
			if(MapBuilder.WALL_HEIGHTS[key] === tileY) {
				lastHeightIndex = key;
			}
		}
		// console.log(lastHeightIndex);
		
		if(stepped){
			var rngHeight = Math.floor((Math.random() * MapBuilder.WALL_HEIGHTS.length - 2) + 2);
			//if the height difference it too much, return and generate it next update with probable better values
			//this will be returned due to the stepped platform needing 2 heightvalue indexes difference
			if(lastHeightIndex < rngHeight && lastHeightIndex + gameSetup.sideScroller.mapGenerator.allowedJumpHeight < rngHeight) {
					// console.log("stepped: too hight");
					return;
			}
			var rngLength1 = Math.floor( (Math.random() * (this.maxPlatformLength/2)) + this.minPlatformLength + 1); //+1 in the end because of the edge sprite 
			var rngLength2 = Math.floor( (Math.random() * (this.maxPlatformLength/2)) + this.minPlatformLength + 1);
			this.createSteppedWallSpan(rngHeight, rngLength1, rngLength2);
			var rngLength = rngLength1 + rngLength2;
		}else{
			var rngHeight = Math.floor(Math.random() * MapBuilder.WALL_HEIGHTS.length);
			//if the height difference it too much take highest allowed tile jump
			if(lastHeightIndex < rngHeight && lastHeightIndex + gameSetup.sideScroller.mapGenerator.allowedJumpHeight < rngHeight){
				// console.log("too hight");
				rngHeight = gameSetup.sideScroller.mapGenerator.allowedJumpHeight;
			}
			var rngLength = Math.floor( (Math.random() * this.maxPlatformLength) + this.minPlatformLength + 2); // +2 for the front and end edge. Preventing cutoff
			this.createWallSpan(rngHeight, rngLength);
		}
		
		//place randomly enemies on the new platform
		var rngEnemyCount = Math.round( this.randomBetween(this.maxEnemiesPerPlatform, this.minEnemiesPerPlatform));
		var lastSlice = main.scroller.front.slices.length - 1;
		var firstSlice = main.scroller.front.slices.length - rngLength;
		// console.log("Spawning: " +rngEnemyCount);
		for(var i=0; i < rngEnemyCount; i++){
			//get the viewport in which the enemy should "spawn"
			//first get the the value corresponding to the slice index
			var viewport = this.randomBetween(lastSlice, firstSlice);
			
			//if we would convert this to viewport now the enemy would spawn when the player reaches said viewport value
			//the result would be the enemy would spawn on later platforms without any guarantee that it will spawn on one or not
			//we just add a negative offset in corresponse the renderer's width to fix this.
			viewport -= ((gameSetup.game.width / gameSetup.sideScroller.mapGenerator.tileWidth));
			//now we multiply it with the TileWidth to get the viewport value at which the enemy should spawn
			viewport *= gameSetup.sideScroller.mapGenerator.tileWidth;
			
			//select a random enemy type
			//get the keys of the enemytype array
			var keys = Object.keys(gameSetup.sideScroller.enemies);
			//select one randomly
			var key = Math.floor(Math.random() * keys.length );
			//spawn it and push it into the active enemy pool
			main.scroller.enemyPool.push(new Enemy(viewport, key));
		}
		
		var gapThresh =  Math.floor(main.scrollSpeed / gameSetup.sideScroller.mapGenerator.gapThreshhold) + 1;
		
		for(var i = 0; i < gapThresh; i++){
			this.createGap(1);
			// console.log("gap: " + i);
		}
	}
}
//creates the random map
MapBuilder.prototype.createMap = function() {
	var rngHeight = Math.floor(Math.random() * MapBuilder.WALL_HEIGHTS.length);
	var rngLength = Math.floor( (Math.random() * this.maxPlatformLength) + this.minPlatformLength + 5);
	TileHeight = MapBuilder.WALL_HEIGHTS[rngHeight] + gameSetup.sideScroller.player.offsetY;
	this.createWallSpan(rngHeight, rngLength, true);
	this.createGap(1);
	// this.createSteppedWallSpan(2, 5, 10);

};

//creates a gap for jumping
MapBuilder.prototype.createGap = function(spanLength) { 
  // TileHeight = 5000;
  for (var i = 0; i < spanLength; i++)
  {
    this.walls.addSlice(SliceType.GAP);
  }
};

//creates a wall span
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

//creates a step span
MapBuilder.prototype.createSteppedWallSpan = function(heightIndex, spanALength, spanBLength) {
	if (heightIndex < 2)
  {
    heightIndex = 2;
  }
  this.createWallSpan(heightIndex, spanALength, false, true);
  this.addWallStep(heightIndex - 2);
  this.createWallSpan(heightIndex - 2, spanBLength - 1, true, false);
};

//methods for adding the different wall types
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
    // if (i % 2 == 0)
    // {
      // this.walls.addSlice(SliceType.WINDOW, y);
    // }
    // else
    // {
      this.walls.addSlice(SliceType.DECORATION, y);
    // }
  }
};

MapBuilder.prototype.addWallStep = function(heightIndex) {
  var y = MapBuilder.WALL_HEIGHTS[heightIndex];
  this.walls.addSlice(SliceType.STEP, y);
};