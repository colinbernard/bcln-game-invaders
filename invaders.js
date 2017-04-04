/**
 * BCLearningNetwork.com
 * Perfect Squares Invaders
 * @author Colin Bernard (colinjbernard@hotmail.com)
 * March 2017
 */



//////////////////// VARIABLES ////////////////////////////////////

// unicode characters
var EXPONENT_2 = "\u00B2";
var SQUARE_ROOT = "\u221A";

var questions = [	{question:SQUARE_ROOT+"64",answer:8,options:[2,3,1,8]},
					{question:SQUARE_ROOT+"81",answer:9,options:[2,9,3,1]},
					{question:SQUARE_ROOT+"25",answer:5,options:[2,5,3,1]},
					{question:"9"+EXPONENT_2,answer:81,options:[81,2,3,1]},
					{question:SQUARE_ROOT+"16",answer:4,options:[4,2,3,1]},
					{question:SQUARE_ROOT+"9",answer:3,options:[2,3,1,3]},
					{question:SQUARE_ROOT+"49",answer:7,options:[2,3,7,1]},
					{question:"10"+EXPONENT_2,answer:100,options:[2,3,100,1]},
					{question:"2"+EXPONENT_2,answer:4,options:[2,3,1,4]},
					{question:"6"+EXPONENT_2,answer:36,options:[2,36,3,1]},
					{question:"11"+EXPONENT_2,answer:121,options:[2,3,1,121]},
					{question:SQUARE_ROOT+"36",answer:6,options:[6,2,3,1]},
					{question:"5"+EXPONENT_2,answer:25,options:[2,25,3,1]},
					{question:SQUARE_ROOT+"4",answer:2,options:[2,4,3,1]}
				 ];


var FPS = 24;
var mute = false;

// constants (set in init function)
var STAGE_WIDTH;
var STAGE_HEIGHT;

var gameStarted = false;
var questionCounter;
var score;
var ENEMY_SPEED = 2;
var DEFAULT_ENEMY_SPEED = 2;
var PLAYER_MOVE_SPEED = 6;
var MISSILE_SPEED = 8;
var ENEMY_SHIP_SPACING = 75;

// text
var scoreText;
var questionText;
var enemyText1;
var enemyText2;
var enemyText3;
var enemyText4;
var alertText;

// bitmap images
var playerImage;
var enemyImage;
var sidebarImage;
var starsImage;
var starsImage2;
var enemy1;
var enemy2;
var enemy3;
var enemy4;
var missileImage;

// animations
var explosionAnimation;

// key code constants
var KEYCODE_LEFT = 37,
    KEYCODE_RIGHT = 39,
    KEYCODE_UP = 38,
    KEYCODE_DOWN = 40,
    KEYCODE_SPACE = 32;

// used by keyboard listener
var leftArrow, rightArrow, upArrow, downArrow = false;

var missileFired = false;


/*
 * Handles initialization of game components
 * Called from HTML body onload.
 */
function init() {
	// set constants
	STAGE_WIDTH = document.getElementById("gameCanvas").getAttribute("width");
	STAGE_HEIGHT = document.getElementById("gameCanvas").getAttribute("height");

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	// add loading progress text (used by preload)
	progressText = new createjs.Text("", "20px 'Press Start 2P'", "white");
	progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
	progressText.y = 20;
	//stage.addChild(progressText);
	stage.update();

	setupManifest(); // preloadJS
	startPreload();

	score = 100; // reset game score
	questionCounter = 0;

	// keyboard handlers
	window.onkeyup = keyUpHandler;
	window.onkeydown = keyDownHandler;

	stage.update(); 
}

/*
 * Main update function
 */
 function tick(event) {
 	if (gameStarted) {

 		if (enemy1.y > STAGE_HEIGHT && enemy2.y > STAGE_HEIGHT && enemy3.y > STAGE_HEIGHT && enemy4.y > STAGE_HEIGHT) { // then spawn new enemies and switch the question

 			respawnEnemies();

 		}

 		if (missileFired) { // if a missile has been fired, update it

 			updateMissile();

 		}



 		loopStarsBackground(); // update scrolling background
 		updateEnemies();
 		move(); // update player space ship
 	}

 	stage.update(event);
 }

 //////////////////////////////////////////////////////////////////////////// PRELOADJS FUNCTIONS

function setupManifest() {
	manifest= [{
		src: "images/logo.png",
		id: "logo"
	},
	{
		src: "sounds/click.mp3",
		id: "click"
	},
	{
		src: "images/player.png",
		id: "player"
	},
	{
		src: "images/enemy.png",
		id: "enemy"
	},
	{
		src: "images/sidebar.png",
		id: "sidebar"
	},
	{
		src: "images/stars.png",
		id: "stars"
	},
	{
		src: "images/missile.png",
		id: "missile"
	}
	];
}

function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);          
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
    console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
   	if (event.item.id == "logo") {
   		//planeImages[0] = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "player") {
   		playerImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "enemy") {
   		enemyImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "sidebar") {
   		sidebarImage = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "stars") {
   		starsImage = new createjs.Bitmap(event.result);
   		starsImage2 = new createjs.Bitmap(event.result);
   	} else if (event.item.id == "missile") {
   		missileImage = new createjs.Bitmap(event.result);
   	}
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

function handleFileProgress(event) {
    progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    // display start screen
    startText = new createjs.Text("Click To Start", "50px 'Press Start 2P'", "white");
    startText.x = STAGE_WIDTH/2 - startText.getMeasuredWidth()/2;
    startText.y = STAGE_HEIGHT/2 - startText.getMeasuredHeight()/2;
    stage.addChild(startText);
    stage.update();
    stage.on("stagemousedown", startGame, null, false);
}

//////////////////////////////////////////////////////////////////////////////// END PRELOADJS FUNCTIONS

/*
 * Starts the game.
 */
function startGame(event) {
	playSound("click");

	event.remove();
	//ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", tick); // call tick function
	createjs.Tween.get(startText)
		.to({x:-500},500) // remove start text from visible canvas
		.call(initGraphics);
	stage.removeChild(progressText);

}

/*
 * Displays end game screen.
 */
function endGame() {
	gameStarted = false;
	var playAgainText = new createjs.Text("Click to play again", "40px 'Press Start 2P'", "white");
	playAgainText.x = STAGE_WIDTH/2 - playAgainText.getMeasuredWidth()/2;
    playAgainText.y = STAGE_HEIGHT/2 - playAgainText.getMeasuredHeight()/2 + 70;
    stage.addChild(playAgainText);
	stage.update();
	stage.on("stagemousedown", function() {
		playSound("click");
		location.reload(); // for now just reload the document
	});
}

/*
 * Adds images to stage and sets initial position
 */
function initGraphics() {

	// left side bar
	stage.addChild(sidebarImage);

	// score text
	scoreText = new createjs.Text("Score:" + score, "14px 'Press Start 2P'", "white");
	scoreText.x = sidebarImage.getBounds().width/2 - scoreText.getMeasuredWidth()/2;
	scoreText.y = 393;
	stage.addChild(scoreText);

	// question text
	questionText = new createjs.Text("[Question]", "40px Lato", "green");
	questionText.x = sidebarImage.getBounds().width/2 - questionText.getMeasuredWidth()/2;
	questionText.y = 138;
	stage.addChild(questionText);

	// alert text
	alertText = new createjs.Text("", "20px 'Press Start 2P'", "red");
	alertText.x = playerImage.x;
	alertText.y = playerImage.y - alertText.getMeasuredHeight() - 5;

	// scrolling stars
	starsImage.x = sidebarImage.getBounds().width;
	starsImage2.x = sidebarImage.getBounds().width;
	starsImage2.y = sidebarImage.getBounds().height;
	stage.addChild(starsImage);
	stage.addChild(starsImage2);

	// explosion animation
	var explosionSpriteData = {
		images: ["images/explosion.png"],
		frames: {width:100, height:100, count:81, regX:0, regY:0, spacing:0, margin:0},
		animations: {
			explode: [0, 81, false]
		}
	};
	explosionAnimation = new createjs.Sprite(new createjs.SpriteSheet(explosionSpriteData));

	setupPlayer();
	setupEnemies();

	gameStarted = true; // once graphics are loaded, game is started
}

/*
 * Setup enemies.
 */
function setupEnemies() {
 	enemy1 = Object.create(enemyImage);
	enemy2 = Object.create(enemyImage); 
	enemy3 = Object.create(enemyImage);
	enemy4 = Object.create(enemyImage);

	enemy1.x = sidebarImage.getBounds().width + ENEMY_SHIP_SPACING;
	enemy2.x = enemy1.x + enemyImage.getBounds().width + ENEMY_SHIP_SPACING;
	enemy3.x = enemy2.x + enemyImage.getBounds().width + ENEMY_SHIP_SPACING;
	enemy4.x = enemy3.x + enemyImage.getBounds().width + ENEMY_SHIP_SPACING;


	// listeners
	// enemy1.on("click", function() { handleClick(0); });
	// enemy2.on("click", function() { handleClick(1); });
	// enemy3.on("click", function() { handleClick(2); });
	// enemy4.on("click", function() { handleClick(3); });

	// enemy text
	enemyText1 = new createjs.Text("[]", "20px 'Press Start 2P'", "green");
	enemyText2 = new createjs.Text("[]", "20px 'Press Start 2P'", "green");
	enemyText3 = new createjs.Text("[]", "20px 'Press Start 2P'", "green");
	enemyText4 = new createjs.Text("[]", "20px 'Press Start 2P'", "green");
	centerEnemyLabels();
	enemyText1.y = enemy1.y + enemy1.getBounds().height;
	enemyText2.y = enemy1.y + enemy2.getBounds().height;
	enemyText3.y = enemy1.y + enemy3.getBounds().height;
	enemyText4.y = enemy1.y + enemy4.getBounds().height;


	stage.addChild(enemy1);
	stage.addChild(enemy2);
	stage.addChild(enemy3);
	stage.addChild(enemy4);
	stage.addChild(enemyText1);
	stage.addChild(enemyText2);
	stage.addChild(enemyText3);
	stage.addChild(enemyText4);


	// initial questions setup
	enemyText1.text = questions[0].options[0];
	enemyText2.text = questions[0].options[1];
	enemyText3.text = questions[0].options[2];
	enemyText4.text = questions[0].answer;
	enemy1.name = enemyText1.text;
	enemy2.name = enemyText2.text;
	enemy3.name = enemyText3.text;
	enemy4.name = enemyText4.text;
	updateQuestionText(questions[0].question);
	centerEnemyLabels();
}

/*
 * Respawns enemy ships back at top of screen.
 */
function respawnEnemies() {
	setAllShipsVisible();
	ENEMY_SPEED = DEFAULT_ENEMY_SPEED;

	var temp = 0;
	for (var e of [enemy1, enemy2, enemy3, enemy4]) {
		e.y = -e.getBounds().height-20; // move back to top
	}

	questionCounter++;

	if (questionCounter == questions.length) {

		endGame(); // out of questions

	} else { // there are still more questions

		updateQuestionText(questions[questionCounter].question);

		// update enemy labels
		enemyText1.text = questions[questionCounter].options[0];
		enemyText2.text = questions[questionCounter].options[1];
		enemyText3.text = questions[questionCounter].options[2];
		enemyText4.text = questions[questionCounter].options[3];
		enemy1.name = enemyText1.text;
		enemy2.name = enemyText2.text;
		enemy3.name = enemyText3.text;
		enemy4.name = enemyText4.text;
		centerEnemyLabels();

		stage.addChild(enemy1);
		stage.addChild(enemy2);
		stage.addChild(enemy3);
		stage.addChild(enemy4);
	}
}

 /*
  * Setup player spaceship.
  */
function setupPlayer() {
	playerImage.x = (STAGE_WIDTH - sidebarImage.getBounds().width)/2 + sidebarImage.getBounds().width - playerImage.getBounds().width/2;
	playerImage.y = STAGE_HEIGHT - playerImage.getBounds().height - 10;
	stage.addChild(playerImage);
}

/*
* An enemy ship was clicked.
*/
function handleClick(id) {

	// move to correct firing position
	createjs.Tween.get(playerImage)
		.to({x:getEnemyFromID(getCorrectEnemyID()).x}, 500);

	if (questions[questionCounter].options[id] == questions[questionCounter].answer) { // correct

		setTimeout(function() { fireMissile(id); }, 500);


	} else { // incorrect

		setTimeout(malfunction, 500);

	}
}

/*
 * Returns the enemy associated with an ID (because I was too lazy to make an array)
 */
function getEnemyFromID(id) {

	if (id == 0) {
		return enemy1;
	} else if (id == 1) {
		return enemy2;
	} else if (id == 2) {
		return enemy3;
	} else if (id == 3) {
		return enemy4;
	} else {
		return enemy4; // just in case
	}

}

/*
 * Gets the ID of the correct enemy
 */
function getCorrectEnemyID() {
	for (var i = 0; i < 4; i++) {
		if (questions[questionCounter].options[i] == questions[questionCounter].answer) {
			return i;
		}
	}
}

/*
 * Fire a missile and destroy the enemy ships.
 */
function fireMissile(id) {
	// initial missile position
	missileImage.x = playerImage.x;
	missileImage.y = playerImage.y;
	stage.addChild(missileImage);

	var correctEnemy = getEnemyFromID(id);

	createjs.Tween.get(missileImage)
		.to({y: correctEnemy.y}, 800)
		.call(function() {
			stage.removeChild(missileImage);
		});
}

/*
 * Updates position of missile and checks for collisions.
 */
function updateMissile() {
	missileImage.y -= MISSILE_SPEED; // move missile up

	var intersection = null;
	var enemyHitBitmap = null;

	intersection = ndgmr.checkRectCollision(missileImage, enemy1);
	if (intersection != null) { enemyHitBitmap = enemy1; }
	intersection = ndgmr.checkRectCollision(missileImage, enemy2);
	if (intersection != null) { enemyHitBitmap = enemy2; }
	intersection = ndgmr.checkRectCollision(missileImage, enemy3);
	if (intersection != null) { enemyHitBitmap = enemy3; }
	intersection = ndgmr.checkRectCollision(missileImage, enemy4);
	if (intersection != null) { enemyHitBitmap = enemy4; }

	if (enemyHitBitmap != null) {
		enemyHit(enemyHitBitmap);
		missileFired = false;
	}
}

/*
 * Missile malfunctions and player ship is damaged.
 */
function malfunction() {
	sendAlertMessage("Missile malfunction!");


	ENEMY_SPEED = 6;
}

/*
* Plays a sound if the game is not muted.
*/
function playSound(id) {
	if (!mute) {
		createjs.Sound.play(id);
	}
}

/*
* Sends an alert to the user.
*/
function sendAlertMessage(message) {
	alertText.text = message;
	alertText.x = playerImage.x;
	alertText.y = playerImage.y - alertText.getMeasuredHeight() - 5;
	stage.addChild(alertText);
	setTimeout(function() {
		stage.removeChild(alertText);
	}, 2000);
}

 /*
 * Updates game score (including displayed text)
 */
function updateScore(amount) {
	score += amount;
	scoreText.text = "Score:" + score;
	scoreText.x = sidebarImage.getBounds().width/2 - scoreText.getMeasuredWidth()/2;
}

/*
 * Updates the question text and maintains center position in sidebar.
 */
function updateQuestionText(text) {
	questionText.text = text;
	questionText.x = sidebarImage.getBounds().width/2 - questionText.getMeasuredWidth()/2;
}

/*
 * Re centeres the option text labels on enemy ships
 */
function centerEnemyLabels() {
	enemyText1.x = enemy1.x + enemy1.getBounds().width/2 - enemyText1.getMeasuredWidth()/2;
	enemyText2.x = enemy2.x + enemy2.getBounds().width/2 - enemyText2.getMeasuredWidth()/2;
	enemyText3.x = enemy3.x + enemy3.getBounds().width/2 - enemyText3.getMeasuredWidth()/2;
	enemyText4.x = enemy4.x + enemy4.getBounds().width/2 - enemyText4.getMeasuredWidth()/2;
}

/*
 * Called by update function. 
 * Scrolls the stars down, and loops them.
 */
function loopStarsBackground() {
 	starsImage.y+=0.5;
	starsImage2.y+0.5;
	if (starsImage.y > -5) {
		starsImage2.y = starsImage.y - starsImage2.getBounds().height;
	} 
	if (starsImage2.y > -5) {
		starsImage.y = starsImage2.y - starsImage.getBounds().height;
	}
}

/*
 * Called by update(tick) function.
 * Updates the position of the enemy ships.
 */
function updateEnemies() {

	for (var e of [enemy1, enemy2, enemy3, enemy4]) {
		if (e.y < STAGE_HEIGHT + 200) {
			e.y += ENEMY_SPEED;
		}
	}

	// update the texts
	enemyText1.y = enemy1.y + enemyImage.getBounds().height;
	enemyText2.y = enemy2.y + enemyImage.getBounds().height;
	enemyText3.y = enemy3.y + enemyImage.getBounds().height;
	enemyText4.y = enemy4.y + enemyImage.getBounds().height;
}

/*
 * Toggles mute variable. Called from HTML button.
 */
function toggleMute() {
	mute = !mute;

	if (mute) {
		document.getElementById("mute").firstElementChild.setAttribute("src", "images/mute.png");
		ambianceSound.stop();
		ambianceSound = null;
	} else {
		document.getElementById("mute").firstElementChild.setAttribute("src", "images/unmute.png");
		ambianceSound = createjs.Sound.play("ambiance", {loop:-1});
		ambianceSound.volume = 0.8;
	}
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

/*
 * Key down handler for arrow keys and space bar.
 */
function keyDownHandler(e) {
	switch (e.keyCode) {
		case KEYCODE_LEFT: leftArrow = true; break;
		case KEYCODE_RIGHT: rightArrow = true; break;
		case KEYCODE_SPACE: shoot(); break;
	}
}

/*
 * Key up handler for arrow keys and space bar.
 */
function keyUpHandler(e) {
	switch (e.keyCode) {
		case KEYCODE_LEFT: leftArrow = false; break;
		case KEYCODE_RIGHT: rightArrow = false; break;
		case KEYCODE_SPACE: /* do nothing */ break;
	}
}

/*
 * Move the spaceship to the left or right.
 */
function move() {
	if (leftArrow) {
		if (playerImage.x > sidebarImage.getBounds().width) {
			playerImage.x -= PLAYER_MOVE_SPEED;
		}
	}
	if (rightArrow) {
		if (playerImage.x < STAGE_WIDTH - playerImage.getBounds().width) {
			playerImage.x += PLAYER_MOVE_SPEED;
		}
	}
}

/*
 * Shoot a projectile.
 */
function shoot() {

	if (!missileFired) { // if the missile isnt already firing
		// initial missile position
		missileImage.alpha = 0;
		missileImage.x = playerImage.x + playerImage.getBounds().width/2 - missileImage.getBounds().width/2;
		missileImage.y = playerImage.y;
		stage.addChild(missileImage);
		createjs.Tween.get(missileImage).to({alpha:1},300);
		missileFired = true;

	}
}

/*
 * An enemy has been hit by the missile.
 */
function enemyHit(e) {


	stage.removeChild(missileImage); // remove the missile from stage

	// explode the ship that was hit
	explosionAnimation.x = e.x;
	explosionAnimation.y = e.y;
	explosionAnimation.scaleX = 1.3;
	explosionAnimation.scaleY = 1.3;
	stage.addChild(explosionAnimation);
	explosionAnimation.gotoAndPlay("explode");
	createjs.Tween.get(e).to({alpha:0},500);
	setTimeout(function removeHitShip() {
		e.y = STAGE_HEIGHT + 300;
		stage.removeChild(e);
	}, 1000);

	if (e.name == questions[questionCounter].answer) { // hit CORRECT enemy


		explodeOtherShips(e);


		if (e.y < STAGE_HEIGHT/2) { // if leader is hit in first half of screen +100pts

			updateScore(100);


		} else { // if leader is hit in second half of screen +80pts

			updateScore(80);

		}


	} else { // hit the WRONG enemy

		updateScore(-20);

	}
}

/*
 * Explodes all enemy ships except one that was already exploded.
 */
function explodeOtherShips(e) {
	setTimeout(function explodeOthers() {
			// explode all other ships
		for (var otherShip of [enemy1, enemy2, enemy3, enemy4]) {
			if (otherShip.name != e.name) { // then it is not the ship we just exploded
				var temp = Object.create(explosionAnimation);
				temp.x = otherShip.x;
				temp.y = otherShip.y;
				temp.scaleX = 1;
				temp.scaleY = 1;
				stage.addChild(temp);
				temp.gotoAndPlay("explode");
				createjs.Tween.get(otherShip).to({alpha:0},500).call(setAllShipsVisible);
			}
		}
	}, 500);

	setTimeout(function removeOtherShips() {
		enemy1.y = STAGE_HEIGHT + 300;
		enemy2.y = STAGE_HEIGHT + 300;
		enemy3.y = STAGE_HEIGHT + 300;
		enemy4.y = STAGE_HEIGHT + 300;
	}, 1000);
}

/*
 * Resets the alpha of all enemy ships to 1
 */
function setAllShipsVisible() {
	enemy1.alpha = 1;
	enemy2.alpha = 1;
	enemy3.alpha = 1;
	enemy4.alpha = 1;
}