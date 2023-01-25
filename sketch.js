var gameChar;
var spawningPoint_x;
var game_score;
var flagpole;
var restart;

var mapSize;
var gravity;
var floorPos_y;

var scrollPos;
var leftBorder;
var rightBorder;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isShootingLeft;
var isShootingRight;

var clouds;
var mountains;
var canyons;
var canyonsWithPlatforms;
var collectables;
var trees;
var bombs;
var enemies;

var jumpSound;
var plummentingSound;
var winSound;
var failSound;
var pickSound;
var enemyKickSound;
var explosionSound;
var soundFlag;

function preload()
{
    soundFormats('mp3','wav');
    
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    plummentingSound = loadSound('assets/plummenting.mp3');
    plummentingSound.setVolume(0.2);
    winSound = loadSound('assets/win.mp3');
    winSound.setVolume(0.2);
    failSound = loadSound('assets/fail.mp3');
    failSound.setVolume(0.2);
    pickSound = loadSound('assets/pick.mp3');
    pickSound.setVolume(0.15);
    enemyKickSound = loadSound('assets/enemyKick.mp3');
    enemyKickSound.setVolume(0.2);
    explosionSound = loadSound('assets/explosion.mp3');
    explosionSound.setVolume(0.2);
    
    soundFlag = false;
}

function setup()
{
	createCanvas(1024, 576);
    
    floorPos_y = height * 3/4;
    gravity = 4;
    mapSize = 2000;
    spawningPoint_x = width/2;
    
    startGame();
}

// ------------------------
// Initialisation functions
// ------------------------

function characterSpawn()
{
    isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	scrollPos = 0;
    leftBorder = 350;
    rightBorder = width-350;
    
    gameChar.x_pos = spawningPoint_x;
    gameChar.y_pos = floorPos_y;
    gameChar.y_speed = 0; 
    gameChar.inertia = 0;
}
function startGame()
{
    winSound.stop();
    failSound.stop();
    
    game_score = 0;
    restart = false;
    soundFlag = false;

    gameCharInitialisation();
    flagpoleInitialisation();
    bombsInitialisation();
    cloudsInitialisation(5);
    mountainsInitialisation(2);
    canyonsWithPlatformsInitialisation(1,1);
    canyonsInitialisation(1);
    collectablesInitialisation(4);
    treesInitialisation(3);
    enemiesInitialisation(1);
    
    characterSpawn();
}

function gameCharInitialisation()
{
    gameChar = {x_pos: spawningPoint_x, 
                y_pos: floorPos_y,
                x_speed: 6, 
                y_speed: 0,
                inertia: 0,
                jumpPower: 35,
                lives: 3}
}

function flagpoleInitialisation()
{
    flagpole = {x_pos: mapSize,
               isReached: false}
}

function bombsInitialisation()
{
    bombs = [];
}
function cloudsInitialisation(density)
{
    clouds = {allObjects: [],
              visibleObjects: [],
              leftIndexOutOfScreenObj: 0,
              rightIndexOutOfScreenObj: 1}
            
    var cloud = {x_pos: 200, y_pos: 100, size: 100}
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){
        let cloudClone = Object.assign({}, cloud);
        cloudClone.x_pos = i*offset+random(200);
        cloudClone.y_pos = random(200);
        cloudClone.size = random(cloud.size*0.5,cloud.size*1.5);
        clouds.allObjects.push(cloudClone);
    }
}

function mountainsInitialisation(density)
{
    mountains = {allObjects: [],
                 visibleObjects: [],
                 leftIndexOutOfScreenObj: 0,
                 rightIndexOutOfScreenObj: 1}
    
    var mountain = {x_pos: 20, size: 200}
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){
        let mountainClone = Object.assign({}, mountain);
        mountainClone.x_pos = i*offset+random(200);
        mountainClone.size = random(mountain.size*0.5,mountain.size*1.5);
        mountains.allObjects.push(mountainClone);
    }
}

function canyonsWithPlatformsInitialisation(density,avarageNumberOfPlatforms)
{
    canyonsWithPlatforms = {allObjects: [],
                            visibleObjects: [],
                            leftIndexOutOfScreenObj: 0,
                            rightIndexOutOfScreenObj: 1}
    
    var platform = {x_pos: 0, width: 0, speed: 2, leftBorder: 0, rightBorder: 0}
    var canyonWithPlatforms = {x_pos: spawningPoint_x, width: 300, platforms: []}
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){
        let canyonWithPlatformsClone = Object.assign({}, canyonWithPlatforms);        
                
        canyonWithPlatformsClone.width = random(canyonWithPlatforms.width*0.7,canyonWithPlatforms.width*1.3);
        
        var tries;
        for(tries = 0; (inCanyonWithPlatforms(canyonWithPlatformsClone) || isUnderSpawningPoint(canyonWithPlatformsClone) || isUnderFlagpole(canyonWithPlatformsClone)) && tries < 10; tries++)
            canyonWithPlatformsClone.x_pos = (i*offset+random(200))%mapSize;

        if(tries < 10){
            var numberOfPlatforms = Math.round(random(-1,1))+avarageNumberOfPlatforms;
            if(numberOfPlatforms <= 0)
                numberOfPlatforms = 1;

            var platforms = [];
            for(var j = 0; j < numberOfPlatforms; j++)                
                platforms.push(createPlatform(random(3,1),
                                              canyonWithPlatformsClone.width/numberOfPlatforms*0.4,
                                              j*canyonWithPlatformsClone.width/numberOfPlatforms,
                                              (j+1)*canyonWithPlatformsClone.width/numberOfPlatforms));     

            canyonWithPlatformsClone.platforms = platforms;
            canyonsWithPlatforms.allObjects.push(canyonWithPlatformsClone);
        }
    }
    
}
function createPlatform(speed, width, leftBorder, rightBorder)
{
    var platform = 
    {
        speed: undefined,
        width: undefined,
        leftBorder: undefined,
        rightBorder: undefined,
        x_pos: undefined,
        
        setup: function(speed, width, leftBorder, rightBorder)
        {
            this.speed = speed;
            this.width = width;
            this.leftBorder = leftBorder;
            this.rightBorder = rightBorder;
            this.x_pos = (leftBorder+rightBorder)/2 - (width*0.9);
        },
        
        draw: function(canyonWithPlatforms)
        {
            drawPlatform(canyonWithPlatforms,this);
        },
        
        update: function(canyonWithPlatforms)
        {
            if(this.x_pos+this.width >= this.rightBorder || this.x_pos <= this.leftBorder){            
                this.speed = (-1)*this.speed;

                if(isCharacterOnPlatform(canyonWithPlatforms,this))
                    gameChar.x_pos += this.speed*2;
            }

            this.x_pos += this.speed;
            if(isCharacterOnPlatform(canyonWithPlatforms,this)){
                gameChar.inertia = this.speed;   
            }
        }
    };

    platform.setup(speed, width, leftBorder, rightBorder);
    
    return platform;
}
function isCharacterOnPlatform(canyonWithPlatforms, platform)
{
    return gameChar.x_pos > canyonWithPlatforms.x_pos + platform.x_pos && 
           gameChar.x_pos < canyonWithPlatforms.x_pos + platform.x_pos+platform.width &&
           gameChar.lives > 0 && !isPlummeting && gameChar.y_pos == floorPos_y;
}

function canyonsInitialisation(density)
{
    canyons = {allObjects: [],
               visibleObjects: [],
               leftIndexOutOfScreenObj: 0,
               rightIndexOutOfScreenObj: 1}
    
    var canyon = {x_pos: 180, width: 50}
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){
        let canyonClone = Object.assign({}, canyon);
        canyonClone.x_pos = spawningPoint_x;
        
        var tries;
        for(tries = 0; (isUnderSpawningPoint(canyonClone) || inCanyonWithPlatforms(canyonClone)) && tries < 10; tries++)
            canyonClone.x_pos = i*offset+random(200)+offset/2;        
        
        if(tries != 10){
            canyonClone.width = random(canyon.width*0.7,canyon.width*1.5);
            canyons.allObjects.push(canyonClone);
        }
    }
}
function isUnderSpawningPoint(canyon)
{
    return spawningPoint_x+5 >= canyon.x_pos && 
           spawningPoint_x-5 <= canyon.x_pos+canyon.width
}
function isUnderFlagpole(canyon)
{
    return flagpole.x_pos+10 >= canyon.x_pos && 
           flagpole.x_pos-10 <= canyon.x_pos+canyon.width
}
function inCanyonWithPlatforms(canyon)
{
    for(var i = 0; i < canyonsWithPlatforms.allObjects.length; i++)
        if((canyon.x_pos-50 >= canyonsWithPlatforms.allObjects[i].x_pos && canyon.x_pos-50 <= canyonsWithPlatforms.allObjects[i].x_pos+canyonsWithPlatforms.allObjects[i].width) ||
          (canyon.x_pos+canyon.width+50 >= canyonsWithPlatforms.allObjects[i].x_pos && canyon.x_pos+canyon.width+50 <= canyonsWithPlatforms.allObjects[i].x_pos+canyonsWithPlatforms.allObjects[i].width) || 
          (canyon.x_pos >= canyonsWithPlatforms.allObjects[i].x_pos && canyon.x_pos <= canyonsWithPlatforms.allObjects[i].x_pos+canyonsWithPlatforms.allObjects[i].width) ||
          (canyon.x_pos+canyon.width >= canyonsWithPlatforms.allObjects[i].x_pos && canyon.x_pos+canyon.width <= canyonsWithPlatforms.allObjects[i].x_pos+canyonsWithPlatforms.allObjects[i].width) ||
          (canyon.x_pos <= canyonsWithPlatforms.allObjects[i].x_pos && canyon.x_pos+canyon.width >= canyonsWithPlatforms.allObjects[i].x_pos+canyonsWithPlatforms.allObjects[i].width))
            return true;
    
    return false;
}

function collectablesInitialisation(density)
{
    collectables = {allObjects: [],
                    visibleObjects: [],
                    leftIndexOutOfScreenObj: 0,
                    rightIndexOutOfScreenObj: 1}
    
    var collectable = {x_pos: 0, y_pos: floorPos_y-10, size: 10, isFound: false};
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){        
        let collectableClone = Object.assign({}, collectable);
        collectableClone.x_pos = 100+i*offset+random(200);
        
        if(collectableClone.x_pos+100 > flagpole.x_pos){
            collectableClone.x_pos -= collectableClone.x_pos - flagpole.x_pos + 100;
        }
        else if(collectableClone.x_pos+40 > spawningPoint_x && collectableClone.x_pos-40 < spawningPoint_x)
            collectableClone.x_pos -= 80;
        
        for(var j = 0; j < canyons.allObjects.length; j++)          
            if(isCollectableOverCanyon(collectableClone,canyons.allObjects[j])){                
                collectableClone.y_pos = calculateCollectablePositonOverCanyon(collectableClone,canyons.allObjects[j]); 
                collectableClone.x_pos += 20;
            }
        
        for(var j = 0; j < canyonsWithPlatforms.allObjects.length; j++)          
            if(isCollectableOverCanyon(collectableClone,canyonsWithPlatforms.allObjects[j]))                
                collectableClone.y_pos = random(floorPos_y-10, floorPos_y-80); 
        
        
        collectableClone.size = random(collectable.size*0.8,collectable.size*1.3);
        collectables.allObjects.push(collectableClone);
    }
}
function isCollectableOverCanyon(collectable, canyon)
{
    return collectable.x_pos >= canyon.x_pos && 
               collectable.x_pos <= (canyon.x_pos+canyon.width);
}
function calculateCollectablePositonOverCanyon(collectable, canyon)
{
    return floorPos_y - ((canyon.width - (collectable.x_pos - canyon.x_pos)) 
                     * 100 / canyon.width) - 20; 
}

function treesInitialisation(density)
{
    trees = {allObjects: [],
             visibleObjects: [],
             leftIndexOutOfScreenObj: 0,
             rightIndexOutOfScreenObj: 1}
    
    var tree = {x_pos: 0, y_pos: floorPos_y, size: 150}
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++){        
        let treeClone = Object.assign({}, tree);
        
        var tries;
        treeClone.x_pos = i*offset+random(200);
        for(tries = 0; overAnyCanyon(treeClone) && tries < 10; tries++)        
            treeClone.x_pos = i*offset+random(200);            
            
        if(tries < 10){
            treeClone.size = random(tree.size*0.8,tree.size*1.4);
            trees.allObjects.push(treeClone);
        }
    }
}
function overAnyCanyon(tree)
{
    for(var i = 0; i < canyons.allObjects.length; i++)      
        if(isTreeOverCanyon(tree,canyons.allObjects[i]))
            return true;
    for(var i = 0; i < canyonsWithPlatforms.allObjects.length; i++)      
        if(isTreeOverCanyon(tree,canyonsWithPlatforms.allObjects[i]))
            return true;
    return false;
}
function isTreeOverCanyon(tree, canyon)
{
    return tree.x_pos >= canyon.x_pos-10 && 
        tree.x_pos <= (canyon.x_pos+canyon.width+10);
}

function enemiesInitialisation(density)
{
    enemies = {allObjects: [],
               visibleObjects: [],
               leftIndexOutOfScreenObj: 0,
               rightIndexOutOfScreenObj: 1}
    
    var amount = mapSize/1000 * density;
    var offset = mapSize / amount;
    
    for(var i = 0; i < amount; i++)
        enemies.allObjects.push(createEnemy(i*offset+random(200),floorPos_y-10,random(1,3)));
    
}
function createEnemy(x_pos, y_pos, speed)
{
    var enemy = 
    {
        x_pos: undefined,
        y_pos: undefined,
        speed: undefined,
        leftWalkBorder: undefined,
        rightWalkBorder: undefined,
        isAlive: true,
        
        setup: function(x_pos, y_pos, speed)
        {
            this.x_pos = x_pos;
            this.y_pos = y_pos;
            this.speed = speed;
            this.leftWalkBorder = x_pos-200;
            this.rightWalkBorder = x_pos+200;
            
            if(this.leftWalkBorder < 0)
                this.leftWalkBorder = 0;
            if(this.rightWalkBorder > mapSize)
                this.rightWalkBorder = mapSize;
        },
        
        draw: function()
        {
            drawEnemy(this);
        },
        
        update: function()
        {
            this.x_pos += this.speed;
            if(this.x_pos >= this.rightWalkBorder || this.x_pos <= this.leftWalkBorder)
                this.speed = (-1)*this.speed;
        }
    };

    enemy.setup(x_pos, y_pos, speed);
    
    return enemy;
}

function bombsInitialisation()
{
    bombs = [];
}
function createBomb(x_pos, y_pos, x_speed, y_startForce, maxExplosionRadius)
{
    var bomb = 
    {
        x_pos: undefined,
        y_pos: undefined,
        x_speed: undefined,
        y_speed: 0,
        y_startSpeed: undefined,
        maxExplosionRadius: undefined,
        currentExplosionRadius: 0,
        explosionSpeed: 20,
        isExploding: false,
        hasExploded: false,
        
        setup: function(x_pos, y_pos, x_speed, y_startForce, maxExplosionRadius)
        {
            this.x_pos = x_pos;
            this.y_pos = y_pos;
            this.x_speed = x_speed;
            this.y_speed = y_startForce;
            this.y_startForce = y_startForce;
            this.maxExplosionRadius = maxExplosionRadius;
        },
        
        draw: function()
        {
            if(!this.isExploding)
                drawBomb(this);
            else
                drawExplosion(this);
        },
        
        update: function()
        {
            if(this.y_pos < floorPos_y){
                this.x_pos += this.x_speed;
                this.y_pos -= this.y_speed;
                this.y_speed -= gravity;
            }
            else{
                if(!this.isExploding){
                    this.isExploding = true;
                    this.y_pos = floorPos_y;
                    explosionSound.play();
                }                
                this.currentExplosionRadius += this.explosionSpeed;
                
                if(this.currentExplosionRadius >= this.maxExplosionRadius)
                    this.hasExploded = true;
            }
        }
    };

    bomb.setup(x_pos, y_pos, x_speed, y_startForce, maxExplosionRadius);
    
    return bomb;
}

// --------------
// Draw functions
// --------------

function draw()
{            
    translate(scrollPos, 0);   
    
    drawBackgroud()
    drawInteractableSurrounding();  
    
    if(flagpole.isReached)
        if(drawFinalScreen())
            return; 
   	
	drawGameChar();    
    
    sceneMovement();
}

function drawBackgroud()
{
    noStroke();
    background(100, 155, 255); 
	fill(0,155,0);
	rect(0, floorPos_y, mapSize+400, height/4);
    
    drawClouds();
    drawMountains();
    drawTrees();
    drawHealth();    
    drawScore();
}
function drawInteractableSurrounding()
{
    drawCanyons();
    drawCanyonsWithPlatforms();
    drawCollectables();    
    drawFlagpole();
    drawEnemies();
    drawBombs();
    
    if(!flagpole.isReached)
        checkFlagpole();
}

function drawClouds()
{
    checkVisibilityOfObjects(clouds);   
    for(var i = 0; i < clouds.visibleObjects.length; i++)
        drawColud(clouds.visibleObjects[i]);
}

function drawMountains()
{
    checkVisibilityOfObjects(mountains);
    for(var i = 0; i < mountains.visibleObjects.length; i++)
        drawMountain(mountains.visibleObjects[i]);
}

function drawTrees()
{
    checkVisibilityOfObjects(trees); 
    for(var i = 0; i < trees.visibleObjects.length; i++)
        drawTree(trees.visibleObjects[i]);
}

function drawCanyons()
{
    checkVisibilityOfObjects(canyons); 
    for(var i = 0; i < canyons.visibleObjects.length; i++){
        drawCanyon(canyons.visibleObjects[i]);
        
        if(isInCanyon(canyons.visibleObjects[i]))
            isPlummeting = true;
    }
}
function isInCanyon(canyon)
{
    return gameChar.x_pos > canyon.x_pos && 
           gameChar.x_pos < canyon.x_pos+canyon.width && 
           gameChar.y_pos >= floorPos_y;
}

function drawCanyonsWithPlatforms()
{
    checkVisibilityOfObjects(canyonsWithPlatforms);
    for(var i = 0; i < canyonsWithPlatforms.visibleObjects.length; i++){
        drawCanyonWithPlatforms(canyonsWithPlatforms.visibleObjects[i]);
        
        if(isInCanyonWithPlatforms(canyonsWithPlatforms.visibleObjects[i]))
            isPlummeting = true;
    }
}
function isInCanyonWithPlatforms(canyonWithPlatforms)
{
    var onPlatform = false;
    for(var i = 0; i < canyonWithPlatforms.platforms.length; i++){
        if(gameChar.x_pos > canyonWithPlatforms.x_pos + canyonWithPlatforms.platforms[i].x_pos && 
           gameChar.x_pos < canyonWithPlatforms.x_pos + canyonWithPlatforms.platforms[i].x_pos+canyonWithPlatforms.platforms[i].width){
            onPlatform = true;
            break;
        }
    }
    return gameChar.x_pos > canyonWithPlatforms.x_pos && 
           gameChar.x_pos < canyonWithPlatforms.x_pos+canyonWithPlatforms.width && 
           gameChar.y_pos >= floorPos_y && !onPlatform;
}

function drawCollectables()
{
    checkVisibilityOfObjects(collectables); 
    for(var i = 0; i < collectables.visibleObjects.length; i++){
        if(!collectables.visibleObjects[i].isFound)
            drawCollectable(collectables.visibleObjects[i]);
        
        if(isCharacterNearCollectable(collectables.visibleObjects[i]) && !collectables.visibleObjects[i].isFound){
            collectables.visibleObjects[i].isFound = true;
            game_score++;
            pickSound.play();
        }
    }
}
function isCharacterNearCollectable(collectable)
{
    return dist(gameChar.x_pos,gameChar.y_pos-10, 
                 collectable.x_pos+collectable.size/2, 
                 collectable.y_pos+collectable.size/2) < 30;
}

function drawEnemies()
{
    checkVisibilityOfObjects(enemies);
    for(var i = 0; i < enemies.visibleObjects.length; i++){
        if(enemies.visibleObjects[i].isAlive){
            enemies.visibleObjects[i].update();
            enemies.visibleObjects[i].draw();            
        
            if(isCharacterNearEnemy(enemies.visibleObjects[i]) && !isPlummeting){
                if(enemies.visibleObjects[i].x_pos > gameChar.x_pos)
                    gameChar.inertia = -10;
                else
                    gameChar.inertia = 10;
                
                if(!enemyKickSound.isPlaying())
                    enemyKickSound.play();
            }
        }            
    }
}
function isCharacterNearEnemy(enemy)
{
    return dist(enemy.x_pos,floorPos_y-40,gameChar.x_pos,floorPos_y-40) < 60;
}

function drawBombs()
{
    if(isShootingLeft){
        bombs.push(createBomb(gameChar.x_pos, gameChar.y_pos-20,-10,40,200));
        isShootingLeft = false;
    }
    else if(isShootingRight){
        bombs.push(createBomb(gameChar.x_pos, gameChar.y_pos-20,10,40,200));
        isShootingRight = false;
    }
    
    for(var i = 0; i < bombs.length; i++){
        bombs[i].draw();
        bombs[i].update();
        
        if(bombs[i].isExploding){
            for(var j = 0; j < enemies.visibleObjects.length; j++)
                if(isExplosionHittingEnemy(enemies.visibleObjects[j], bombs[i]))
                    enemies.visibleObjects[j].isAlive = false;
    
            if(bombs[i].hasExploded)
                bombs.shift();
        }
    }
}
function isExplosionHittingEnemy(enemy,bomb)
{
    return dist(enemy.x_pos, enemy.y_pos, bomb.x_pos, bomb.y_pos) <= bomb.currentExplosionRadius-80;
}

//conrolls which objects must be rendered
function checkVisibilityOfObjects(obj)
{
    if(obj.allObjects.length > 0){
        if(insideOfLeftBorder(obj)){
            obj.visibleObjects.unshift(obj.allObjects[obj.leftIndexOutOfScreenObj]);
            obj.leftIndexOutOfScreenObj -= 1;
        }
        if(outOfLeftBorder(obj)){
            obj.visibleObjects.shift();
            obj.leftIndexOutOfScreenObj += 1;
        }
        if(insideOfRightBorder(obj)){
            obj.visibleObjects.push(obj.allObjects[obj.rightIndexOutOfScreenObj]);
            obj.rightIndexOutOfScreenObj += 1;
        }
        if(outOfRightBorder(obj)){
            obj.visibleObjects.pop();
            obj.rightIndexOutOfScreenObj -= 1;
        }
    }
}
function insideOfLeftBorder(obj)
{
    return obj.leftIndexOutOfScreenObj >= 0 && obj.allObjects[obj.leftIndexOutOfScreenObj].x_pos > leftBorder-1000;
}
function outOfLeftBorder(obj)
{
    return obj.leftIndexOutOfScreenObj+1 < obj.allObjects.length && obj.allObjects[obj.leftIndexOutOfScreenObj+1].x_pos < leftBorder-1000;
}
function insideOfRightBorder(obj)
{
    return obj.rightIndexOutOfScreenObj < obj.allObjects.length && obj.allObjects[obj.rightIndexOutOfScreenObj].x_pos < rightBorder+800;
}
function outOfRightBorder(obj)
{
    return obj.allObjects[obj.rightIndexOutOfScreenObj-1].x_pos > rightBorder+800;
}

function sceneMovement()
{
    if(gameChar.x_pos < leftBorder){
        if(isLeft && !isPlummeting){        
            if(leftBorder > 100){
                scrollPos += (gameChar.x_speed-gameChar.inertia);
                leftBorder -= (gameChar.x_speed-gameChar.inertia);
                rightBorder -= (gameChar.x_speed-gameChar.inertia);
            }
        }
        else if(!isPlummeting){
            if(leftBorder > 100){
                scrollPos -= gameChar.inertia;
                leftBorder += gameChar.inertia;
                rightBorder += gameChar.inertia;
                if(isRight){
                    scrollPos -= gameChar.x_speed;
                    leftBorder += gameChar.x_speed;
                    rightBorder += gameChar.x_speed;
                }
            }
        }
	}
    else if(gameChar.x_pos > rightBorder){
	   if(isRight && !isPlummeting){        
            if(rightBorder < mapSize){
                scrollPos -= (gameChar.x_speed+gameChar.inertia);
                leftBorder += (gameChar.x_speed+gameChar.inertia);
                rightBorder += (gameChar.x_speed+gameChar.inertia);
            }
        }
        else if(!isPlummeting){
            if(rightBorder < mapSize){
                scrollPos -= gameChar.inertia;
                leftBorder += gameChar.inertia;
                rightBorder += gameChar.inertia;
                if(isLeft){
                    scrollPos += gameChar.x_speed;
                    leftBorder -= gameChar.x_speed;
                    rightBorder -= gameChar.x_speed;
                }
            }
        }        
	}
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
	if(key == 'A' || keyCode == 37)
		isLeft = true;    
	if(key == 'D' || keyCode == 39)
		isRight = true;
    
    if(!isPlummeting && gameChar.lives > 0 && !flagpole.isReached){
        if(keyCode == 32 && gameChar.y_pos >= floorPos_y){
            gameChar.y_speed = -gameChar.jumpPower;
            isFalling = true;
            jumpSound.play();
        }

        if(key == 'Q')
            isShootingLeft = true;
        if(key == 'E')
            isShootingRight = true;
    }
    
    if(keyCode == 13)
        restart = true;
}
function keyReleased()
{
	if(key == 'A' || keyCode == 37)
		isLeft = false;
	if(key == 'D' || keyCode == 39)
		isRight = false;
    
    if(keyCode == 13)
        restart = false;
}

// -------------------------------
// Game character render functions
// -------------------------------

function drawGameChar()
{    
	if(isLeft && isFalling && !isPlummeting){
        if(gameChar.y_pos <= floorPos_y)
            gameChar.y_pos += gameChar.y_speed; 
        
        if(gameChar.x_pos > 10)
            gameChar.x_pos -= (gameChar.x_speed-gameChar.inertia);
        
		jumpingToTheLeft();
	}
	else if(isRight && isFalling && !isPlummeting){
        if(gameChar.y_pos <= floorPos_y)
            gameChar.y_pos += gameChar.y_speed; 
        
        gameChar.x_pos += (gameChar.x_speed+gameChar.inertia);
		jumpingToTheRight();
	}
	else if(isLeft && !isPlummeting){
        if(gameChar.x_pos > 10)
            gameChar.x_pos -= (gameChar.x_speed-gameChar.inertia);
        
		walkingLeft();
	}
	else if(isRight && !isPlummeting){
        gameChar.x_pos += (gameChar.x_speed+gameChar.inertia);
		walkingRight();
	}
	else if(isPlummeting){
        gameChar.y_pos += gameChar.y_speed/2;        
        jumpingFront();
        if(!plummentingSound.isPlaying() && gameChar.lives > 0)
            plummentingSound.play();
	}
    else if(isFalling){
        gameChar.y_pos += gameChar.y_speed;   
        gameChar.x_pos += gameChar.inertia;
        jumpingFront();
    }
	else{
        standingFront();
        gameChar.x_pos += gameChar.inertia;
	}
            
    if(isFalling && gameChar.y_pos > floorPos_y-gameChar.y_speed){    
        isFalling = false;           
        gameChar.y_speed = 0;  
        gameChar.inertia = 0;
        gameChar.y_pos = floorPos_y;
    }
    
    if(isFalling || isPlummeting){
        gameChar.y_speed += gravity;
    }
    
    checkPlayerDie();

}
function checkPlayerDie()
{
    if(gameChar.y_pos > height){
        if(gameChar.lives <= 1){
            gameChar.lives--;
            drawFinalScreen();
        }
        else{
            if(plummentingSound.currentTime()*1.1 >= plummentingSound.duration()){
                gameChar.lives--;
                characterSpawn();
            }
        }
    }
}

function standingFront()
{    
    //arms
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 15,gameChar.y_pos - 27,gameChar.x_pos - 20,gameChar.y_pos - 42);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos - 15,gameChar.y_pos - 27,gameChar.x_pos - 18,gameChar.y_pos - 37);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 22.5,gameChar.y_pos - 42,gameChar.x_pos - 18,gameChar.y_pos - 43);
    line(gameChar.x_pos - 22.5,gameChar.y_pos - 42,gameChar.x_pos - 23.5,gameChar.y_pos - 45);
    line(gameChar.x_pos - 18,gameChar.y_pos - 43,gameChar.x_pos - 18.5,gameChar.y_pos - 46);    
    
    line(gameChar.x_pos + 15,gameChar.y_pos - 27,gameChar.x_pos + 20,gameChar.y_pos - 42);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos + 15,gameChar.y_pos - 27,gameChar.x_pos + 18,gameChar.y_pos - 37);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos + 22.5,gameChar.y_pos - 42,gameChar.x_pos + 18,gameChar.y_pos - 43);
    line(gameChar.x_pos + 22.5,gameChar.y_pos - 42,gameChar.x_pos + 23.5,gameChar.y_pos - 45);
    line(gameChar.x_pos + 18,gameChar.y_pos - 43,gameChar.x_pos + 18.5,gameChar.y_pos - 46);    
    noStroke();
    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 37,30,30);
    //legs
    fill(105,105,105);
    rect(gameChar.x_pos - 25,gameChar.y_pos - 17,10,20,2);
    rect(gameChar.x_pos + 15,gameChar.y_pos - 17,10,20,2);
    //head
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 47,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 12.5,gameChar.y_pos - 57,25,10,15);
    strokeWeight(1);
    stroke(1);
    fill(50,50,50);
    ellipse(gameChar.x_pos + 7.5,gameChar.y_pos - 52,5,5);
    point(gameChar.x_pos + 7,gameChar.y_pos - 52);
    fill(50,50,50);
    ellipse(gameChar.x_pos - 7.5,gameChar.y_pos - 52,5,5);
    point(gameChar.x_pos - 8,gameChar.y_pos - 52);
}
function jumpingFront()
{    
    //arms
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 15,gameChar.y_pos - 37,gameChar.x_pos - 20,gameChar.y_pos - 52);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos - 15,gameChar.y_pos - 37,gameChar.x_pos - 18,gameChar.y_pos - 47);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 22.5,gameChar.y_pos - 52,gameChar.x_pos - 18,gameChar.y_pos - 53);
    line(gameChar.x_pos - 22.5,gameChar.y_pos - 52,gameChar.x_pos - 23.5,gameChar.y_pos - 55);
    line(gameChar.x_pos - 18,gameChar.y_pos - 53,gameChar.x_pos - 18.5,gameChar.y_pos - 56);    
    
    line(gameChar.x_pos + 15,gameChar.y_pos - 37,gameChar.x_pos + 20,gameChar.y_pos - 52);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos + 15,gameChar.y_pos - 37,gameChar.x_pos + 18,gameChar.y_pos - 47);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos + 22.5,gameChar.y_pos - 52,gameChar.x_pos + 18,gameChar.y_pos - 53);
    line(gameChar.x_pos + 22.5,gameChar.y_pos - 52,gameChar.x_pos + 23.5,gameChar.y_pos - 55);
    line(gameChar.x_pos + 18,gameChar.y_pos - 53,gameChar.x_pos + 18.5,gameChar.y_pos - 56);
    noStroke();
    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 42,30,30);
    
    //legs
    fill(105,105,105);
    rect(gameChar.x_pos - 22,gameChar.y_pos - 22,7,25,2);
    rect(gameChar.x_pos + 15,gameChar.y_pos - 22,7,25,2);
    
    //head
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 52,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 12.5,gameChar.y_pos - 62,25,10,15);
    strokeWeight(1);
    stroke(1);
    fill(50,50,50);
    ellipse(gameChar.x_pos + 7.5,gameChar.y_pos - 57,5,5);
    point(gameChar.x_pos + 7,gameChar.y_pos - 57);
    fill(50,50,50);
    ellipse(gameChar.x_pos - 7.5,gameChar.y_pos - 57,5,5);
    point(gameChar.x_pos - 8,gameChar.y_pos - 57);
}
function walkingLeft()
{    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 37,30,30);
    
    //leg
    fill(105,105,105);
    stroke(0);
    strokeWeight(1);
    arc(gameChar.x_pos - 12, gameChar.y_pos-5, 12, 12, HALF_PI, PI+0.9);
    arc(gameChar.x_pos + 12, gameChar.y_pos-5, 12, 12, -HALF_PI+0.6, HALF_PI);
    arc(gameChar.x_pos, gameChar.y_pos-15, 15, 15, PI+0.6, -0.6);
    noStroke();
    
    rect(gameChar.x_pos-12, gameChar.y_pos-9, 24,10)
    quad(gameChar.x_pos-16, gameChar.y_pos-9, gameChar.x_pos-5, gameChar.y_pos-20,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos-15, gameChar.y_pos)
    quad(gameChar.x_pos+16, gameChar.y_pos-9, gameChar.x_pos+5, gameChar.y_pos-20,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos+15, gameChar.y_pos)
    rect(gameChar.x_pos-7, gameChar.y_pos-15, 15,15)
    
    stroke(0);
    ellipse(gameChar.x_pos-11.5, gameChar.y_pos-5.2, 10,10);
    ellipse(gameChar.x_pos+11.8, gameChar.y_pos-5.1, 8,8);
    strokeWeight(2);
    ellipse(gameChar.x_pos, gameChar.y_pos-17, 7,7);
    strokeWeight(1);
    line(gameChar.x_pos-16.5,gameChar.y_pos-10,gameChar.x_pos-6.5,gameChar.y_pos-20);
    line(gameChar.x_pos+15.5,gameChar.y_pos-10,gameChar.x_pos+5.5,gameChar.y_pos-20);
    line(gameChar.x_pos-12, gameChar.y_pos+0.5, gameChar.x_pos+12, gameChar.y_pos+0.5);
    
    //head
    noStroke();
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 47,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 10.5,gameChar.y_pos - 57,20,10,2);
    
    //arms
    strokeWeight(2);
    stroke(105,105,105);    
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos-20,gameChar.y_pos - 29);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos-15,gameChar.y_pos - 28.5);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 21.5,gameChar.y_pos - 26,gameChar.x_pos - 21,gameChar.y_pos - 32);
    line(gameChar.x_pos - 21.5,gameChar.y_pos - 26,gameChar.x_pos - 24,gameChar.y_pos - 26.2);
    line(gameChar.x_pos - 21,gameChar.y_pos - 32,gameChar.x_pos - 24,gameChar.y_pos - 32.2);
    strokeWeight(1);
}
function walkingRight()
{    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 37,30,30);
    
    //leg
    fill(105,105,105);
    stroke(0);
    strokeWeight(1);
    arc(gameChar.x_pos - 12, gameChar.y_pos-5, 12, 12, HALF_PI, PI+0.9);
    arc(gameChar.x_pos + 12, gameChar.y_pos-5, 12, 12, -HALF_PI+0.6, HALF_PI);
    arc(gameChar.x_pos, gameChar.y_pos-15, 15, 15, PI+0.6, -0.6);
    noStroke();
    
    rect(gameChar.x_pos-12, gameChar.y_pos-9, 24,10)
    quad(gameChar.x_pos-16, gameChar.y_pos-9, gameChar.x_pos-5, gameChar.y_pos-20,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos-15, gameChar.y_pos)
    quad(gameChar.x_pos+16, gameChar.y_pos-9, gameChar.x_pos+5, gameChar.y_pos-20,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos+15, gameChar.y_pos)
    rect(gameChar.x_pos-7, gameChar.y_pos-15, 15,15)
    
    stroke(0);
    ellipse(gameChar.x_pos-11.5, gameChar.y_pos-5.2, 10,10);
    ellipse(gameChar.x_pos+11.8, gameChar.y_pos-5.1, 8,8);
    strokeWeight(2);
    ellipse(gameChar.x_pos, gameChar.y_pos-17, 7,7);
    strokeWeight(1);
    line(gameChar.x_pos-16.5,gameChar.y_pos-10,gameChar.x_pos-6.5,gameChar.y_pos-20);
    line(gameChar.x_pos+15.5,gameChar.y_pos-10,gameChar.x_pos+5.5,gameChar.y_pos-20);
    line(gameChar.x_pos-12, gameChar.y_pos+0.5, gameChar.x_pos+12, gameChar.y_pos+0.5);
    
    //head
    noStroke();
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 47,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 10.5,gameChar.y_pos - 57,20,10,2);
    
    //arms
    strokeWeight(2);
    stroke(105,105,105);    
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos+20,gameChar.y_pos - 29);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos+15,gameChar.y_pos - 28.5);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos + 21.5,gameChar.y_pos - 26,gameChar.x_pos + 21,gameChar.y_pos - 32);
    line(gameChar.x_pos + 21.5,gameChar.y_pos - 26,gameChar.x_pos + 24,gameChar.y_pos - 26.2);
    line(gameChar.x_pos + 21,gameChar.y_pos - 32,gameChar.x_pos + 24,gameChar.y_pos - 32.2);
    strokeWeight(1);
}
function jumpingToTheRight()
{    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 37,30,30);
    
    //leg
    fill(105,105,105);
    stroke(0);
    strokeWeight(1);
    arc(gameChar.x_pos - 18, gameChar.y_pos-5, 12, 12, HALF_PI, PI+0.9);
    arc(gameChar.x_pos + 5, gameChar.y_pos-5, 12, 12, -HALF_PI+1.2, HALF_PI);
    arc(gameChar.x_pos, gameChar.y_pos-15, 15, 15, PI+0.9, -0.4);
    noStroke();
    
    rect(gameChar.x_pos-18, gameChar.y_pos-9, 24,10)
    quad(gameChar.x_pos-22, gameChar.y_pos-9, gameChar.x_pos-3.6, gameChar.y_pos-21,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos-20, gameChar.y_pos)
    quad(gameChar.x_pos+6.5, gameChar.y_pos-18, gameChar.x_pos-10, gameChar.y_pos-15,gameChar.x_pos-10, gameChar.y_pos-5,gameChar.x_pos+11, gameChar.y_pos-7)
    
    stroke(0);
    ellipse(gameChar.x_pos-17.5, gameChar.y_pos-5.2, 10,10);
    ellipse(gameChar.x_pos+5.8, gameChar.y_pos-5.1, 8,8);
    strokeWeight(2);
    ellipse(gameChar.x_pos, gameChar.y_pos-17, 7,7);
    strokeWeight(1);
    line(gameChar.x_pos-22.5,gameChar.y_pos-10,gameChar.x_pos-5,gameChar.y_pos-21.5);
    line(gameChar.x_pos+10,gameChar.y_pos-8,gameChar.x_pos+6.5,gameChar.y_pos-18.3);
    line(gameChar.x_pos-18, gameChar.y_pos+0.5, gameChar.x_pos+5, gameChar.y_pos+0.5);
    
    //head
    noStroke();
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 47,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 10.5,gameChar.y_pos - 57,20,10,2);
    
    //arms
    strokeWeight(2);
    stroke(105,105,105);    
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos-15,gameChar.y_pos - 39);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos-10.5,gameChar.y_pos - 35);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos - 17,gameChar.y_pos - 38,gameChar.x_pos - 14,gameChar.y_pos - 41);
    line(gameChar.x_pos - 17,gameChar.y_pos - 38,gameChar.x_pos - 19.5,gameChar.y_pos - 40);
    line(gameChar.x_pos - 14,gameChar.y_pos - 41,gameChar.x_pos - 16.5,gameChar.y_pos - 43);
    strokeWeight(1);
}
function jumpingToTheLeft()
{    
    //body
    fill(218,165,32);
    rect(gameChar.x_pos - 15,gameChar.y_pos - 37,30,30);
    
    //leg
    fill(105,105,105);
    stroke(0);
    strokeWeight(1);
    arc(gameChar.x_pos + 18, gameChar.y_pos-5, 12, 12, -HALF_PI+0.6, -PI-0.9);
    arc(gameChar.x_pos - 5, gameChar.y_pos-5, 12, 12, HALF_PI, PI+1);
    arc(gameChar.x_pos, gameChar.y_pos-15, 15, 15, PI+0.3, -1);
    noStroke();
    
    rect(gameChar.x_pos-5, gameChar.y_pos-9, 24,10)
    quad(gameChar.x_pos+21.8, gameChar.y_pos-9.2, gameChar.x_pos+3.6, gameChar.y_pos-21,gameChar.x_pos, gameChar.y_pos-15,gameChar.x_pos+20, gameChar.y_pos)
    quad(gameChar.x_pos-6.5, gameChar.y_pos-18, gameChar.x_pos+10, gameChar.y_pos-15,gameChar.x_pos+10, gameChar.y_pos-5,gameChar.x_pos-11, gameChar.y_pos-7)
    
    stroke(0);
    ellipse(gameChar.x_pos+17.5, gameChar.y_pos-5.2, 10,10);
    ellipse(gameChar.x_pos-5.8, gameChar.y_pos-5.1, 8,8);
    strokeWeight(2);
    ellipse(gameChar.x_pos, gameChar.y_pos-17, 7,7);
    strokeWeight(1);
    line(gameChar.x_pos+20.5,gameChar.y_pos-10.8,gameChar.x_pos+4,gameChar.y_pos-21.5);
    line(gameChar.x_pos-11.2,gameChar.y_pos-7.3,gameChar.x_pos-7.8,gameChar.y_pos-17.5);
    line(gameChar.x_pos+18.5, gameChar.y_pos+0.5, gameChar.x_pos-5.5, gameChar.y_pos+0.5);
    
    //head
    noStroke();
    fill(178,135,2);
    rect(gameChar.x_pos - 2.5,gameChar.y_pos - 47,5,10);
    fill(105,105,105);
    rect(gameChar.x_pos - 10.5,gameChar.y_pos - 57,20,10,2);
    
    //arms
    strokeWeight(2);
    stroke(105,105,105);    
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos+15,gameChar.y_pos - 39);
    strokeWeight(4);
    stroke(178,135,2);
    line(gameChar.x_pos,gameChar.y_pos - 27,gameChar.x_pos+10.5,gameChar.y_pos - 35);
    strokeWeight(2);
    stroke(105,105,105);
    line(gameChar.x_pos + 17,gameChar.y_pos - 38,gameChar.x_pos + 14,gameChar.y_pos - 41);
    line(gameChar.x_pos + 17,gameChar.y_pos - 38,gameChar.x_pos + 19.5,gameChar.y_pos - 40);
    line(gameChar.x_pos+ 14,gameChar.y_pos - 41,gameChar.x_pos + 16.5,gameChar.y_pos - 43);
    strokeWeight(1);
}

// ---------------------------
// Background render functions
// ---------------------------

function drawColud(cloud)
{
    noStroke();
    fill(255);
	ellipse(cloud.x_pos, cloud.y_pos,cloud.size,cloud.size);
    ellipse(cloud.x_pos+cloud.size/2, cloud.y_pos+cloud.size/2, cloud.size,cloud.size/2);
    ellipse(cloud.x_pos-cloud.size/5, cloud.y_pos,cloud.size, cloud.size*0.7);
    ellipse(cloud.x_pos+cloud.size/2, cloud.y_pos-cloud.size/5, cloud.size/2,cloud.size/2);
    ellipse(cloud.x_pos-cloud.size/2.5, cloud.y_pos-cloud.size/3.33, cloud.size*0.6,cloud.size*0.7);
    ellipse(cloud.x_pos-cloud.size/2.5, cloud.y_pos+cloud.size/3.33, cloud.size*0.6,cloud.size*0.7);
    ellipse(cloud.x_pos+cloud.size/1.6, cloud.y_pos+cloud.size/10, cloud.size*0.6,cloud.size*0.7);
    ellipse(cloud.x_pos-cloud.size/1.6, cloud.y_pos+cloud.size/10, cloud.size*0.6,cloud.size*0.7);
    ellipse(cloud.x_pos-cloud.size/1.25, cloud.y_pos+cloud.size/3.33, cloud.size*0.6,cloud.size*0.6);
    ellipse(cloud.x_pos+cloud.size/1.25, cloud.y_pos+cloud.size/6.66, cloud.size*0.6,cloud.size*0.6);
}
function drawMountain(mountain)
{
    fill(50);
	triangle(mountain.x_pos, floorPos_y, 
             mountain.x_pos+mountain.size/2, floorPos_y-mountain.size/1.5, 
             mountain.x_pos+mountain.size, floorPos_y);
    triangle(mountain.x_pos+mountain.size/3, floorPos_y, 
             mountain.x_pos+mountain.size/3+mountain.size/1.2, floorPos_y-mountain.size/1.2, 
             mountain.x_pos+mountain.size/3+mountain.size*1.5, floorPos_y);
    triangle(mountain.x_pos+mountain.size*1.2, floorPos_y, 
             mountain.x_pos+mountain.size*1.9, floorPos_y-mountain.size/2, 
             mountain.x_pos+mountain.size*2.5, floorPos_y);
    fill(255);
    triangle(mountain.x_pos+mountain.size/2.67, floorPos_y-mountain.size/2, 
             mountain.x_pos+mountain.size/2, floorPos_y-mountain.size/1.5, 
             mountain.x_pos+mountain.size-mountain.size/2.67, floorPos_y-mountain.size/2);
    triangle(mountain.x_pos+mountain.size/1.0427, floorPos_y-mountain.size/1.6, 
             mountain.x_pos+mountain.size/3+mountain.size/1.2, floorPos_y-mountain.size/1.2, 
             mountain.x_pos+mountain.size*1.3335, floorPos_y-mountain.size/1.6);
    triangle(mountain.x_pos+mountain.size*1.795, floorPos_y-mountain.size/2.35, 
             mountain.x_pos+mountain.size*1.9, floorPos_y-mountain.size/2, 
             mountain.x_pos+mountain.size*1.99, floorPos_y-mountain.size/2.35);
}
function drawTree(tree)
{
    fill(139, 69, 19);
	rect(tree.x_pos, tree.y_pos-tree.size, 30, tree.size);
    fill(0, 128, 0);
    ellipse(tree.x_pos+50, tree.y_pos-tree.size,60,60);
    ellipse(tree.x_pos-10, tree.y_pos-tree.size,60,60);
    ellipse(tree.x_pos+20, tree.y_pos-tree.size-40,60,60);
    ellipse(tree.x_pos-20, tree.y_pos-tree.size+40,60,60);
    ellipse(tree.x_pos+50, tree.y_pos-tree.size+40,60,60);
    ellipse(tree.x_pos, tree.y_pos-tree.size+60,60,60);
    ellipse(tree.x_pos+40, tree.y_pos-tree.size+50,60,60);
    ellipse(tree.x_pos+30, tree.y_pos-tree.size+15,60,60);
}
function drawScore()
{
    textSize(30);
    fill(0);
    noStroke();
    text(game_score + "/" + collectables.allObjects.length,leftBorder-230,30);
}
function drawHealth()
{
    for(var i = 0; i < gameChar.lives; i++){
        var offset = i*30;
        stroke(1);
        fill(0);
        rect(leftBorder-330+offset,20,15,30);
        rect(leftBorder-325+offset,7,5,2);
        fill(218, 165, 32);
        rect(leftBorder-330+offset,10,15,10);
    }
}
function drawFinalScreen()
{
    if(restart)
        startGame();
    
    textSize(50);
    noStroke();
    if(flagpole.isReached && game_score == collectables.allObjects.length && gameChar.lives > 0){
        fill(0,255,0);
        text("Congratulations! You won.\nYou have collected all " + collectables.allObjects.length + " items!\nPress enter to restart",leftBorder-150,300);
        if(!soundFlag){
            winSound.play();
            soundFlag = true;
        }
        return true;
    }
    else if(flagpole.isReached && game_score < collectables.allObjects.length){
        fill(255,0,0);
        text("What a pity! You lost. You \nhave not collected all " + collectables.allObjects.length + " items!\nPress enter to restart",leftBorder-150,300);
        if(!soundFlag){
            failSound.play();
            soundFlag = true;
        }
        return true;
    }
    else if(gameChar.lives < 1){
        fill(255,0,0);
        text("What a pity! You lost.\nYou died.\nPress enter to restart",leftBorder-80,300);
        if(!soundFlag){
            failSound.play();
            soundFlag = true;
        }
        return true;
    }
    return false;
}

// --------------------------------
// Interractable surrounding render
// --------------------------------

function drawCanyon(canyon)
{
    fill(0);
    beginShape();
    vertex(canyon.x_pos, floorPos_y);
    vertex(canyon.x_pos-15, 480);
    vertex(canyon.x_pos-5, 520);
    vertex(canyon.x_pos-35, 600);
    vertex(canyon.x_pos+canyon.width+50, 600);
    vertex(canyon.x_pos+canyon.width+40, 550);
    vertex(canyon.x_pos+canyon.width+30, 500);
    vertex(canyon.x_pos+canyon.width+15, 470);
    vertex(canyon.x_pos+canyon.width+5, floorPos_y);
    endShape();
    
    fill(50,2,5);
    beginShape();
    vertex(canyon.x_pos, floorPos_y);
    vertex(canyon.x_pos-15, 480);
    vertex(canyon.x_pos-5, 520);
    vertex(canyon.x_pos-35, 600);
    vertex(canyon.x_pos+5, 580);
    vertex(canyon.x_pos+15, 520);
    vertex(canyon.x_pos, 480);
    vertex(canyon.x_pos+10, floorPos_y);
    endShape();
    
    beginShape();
    vertex(canyon.x_pos+canyon.width+50, 600);
    vertex(canyon.x_pos+canyon.width+40, 550);
    vertex(canyon.x_pos+canyon.width+30, 500);
    vertex(canyon.x_pos+canyon.width+15, 470);
    vertex(canyon.x_pos+canyon.width+5, floorPos_y);
    vertex(canyon.x_pos+canyon.width-5, floorPos_y);
    vertex(canyon.x_pos+canyon.width, 470);
    vertex(canyon.x_pos+canyon.width+13, 500);
    vertex(canyon.x_pos+canyon.width+20, 550);
    vertex(canyon.x_pos+canyon.width+20, 600);
    endShape();
}

function drawCanyonWithPlatforms(canyonWithPlatforms)
{
    fill(0);
    beginShape();
    vertex(canyonWithPlatforms.x_pos, floorPos_y);
    vertex(canyonWithPlatforms.x_pos-15, 480);
    vertex(canyonWithPlatforms.x_pos-5, 520);
    vertex(canyonWithPlatforms.x_pos-35, 600);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+50, 600);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+40, 550);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+30, 500);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+15, 470);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+5, floorPos_y);
    endShape();
    
    fill(50,2,5);
    beginShape();
    vertex(canyonWithPlatforms.x_pos, floorPos_y);
    vertex(canyonWithPlatforms.x_pos-15, 480);
    vertex(canyonWithPlatforms.x_pos-5, 520);
    vertex(canyonWithPlatforms.x_pos-35, 600);
    vertex(canyonWithPlatforms.x_pos+5, 580);
    vertex(canyonWithPlatforms.x_pos+15, 520);
    vertex(canyonWithPlatforms.x_pos, 480);
    vertex(canyonWithPlatforms.x_pos+10, floorPos_y);
    endShape();
    
    beginShape();
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+50, 600);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+40, 550);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+30, 500);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+15, 470);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+5, floorPos_y);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width-5, floorPos_y);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width, 470);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+13, 500);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+20, 550);
    vertex(canyonWithPlatforms.x_pos+canyonWithPlatforms.width+20, 600);
    endShape();
    
    //movePlatforms(canyonWithPlatforms);
    for(var i = 0; i < canyonWithPlatforms.platforms.length; i++){
        canyonWithPlatforms.platforms[i].update(canyonWithPlatforms);
        canyonWithPlatforms.platforms[i].draw(canyonWithPlatforms);        
    }
}
function drawPlatform(canyonWithPlatforms,platform)
{
    noStroke();
    fill(200,100,50);
    rect(canyonWithPlatforms.x_pos+platform.x_pos, floorPos_y, platform.width, 30);
}

function drawCollectable(collectable)
{
    fill(100);
    rect(collectable.x_pos, collectable.y_pos, collectable.size, collectable.size*1.3);
    stroke(50);   
    fill(30);    
    ellipse(collectable.x_pos+collectable.size/2, 
            collectable.y_pos,collectable.size,collectable.size/2);    
    fill(100); 
    arc(collectable.x_pos+collectable.size/2, collectable.y_pos+collectable.size*1.3,
        collectable.size,collectable.size/2, 0, -PI); 
    arc(collectable.x_pos+collectable.size/2, collectable.y_pos,collectable.size,
        collectable.size, PI, 0);
    
    strokeWeight(0.5);   
    arc(collectable.x_pos+collectable.size/2, collectable.y_pos+collectable.size/3,
        collectable.size,collectable.size/2, 0, PI);   
    arc(collectable.x_pos+collectable.size/2 ,collectable.y_pos+collectable.size/1.5,
        collectable.size,collectable.size/2, 0, PI); 
    arc(collectable.x_pos+collectable.size/2, collectable.y_pos+collectable.size,
        collectable.size,collectable.size/2, 0, PI); 
}

function drawEnemy(enemy)
{
    noStroke();
    fill(100,0,0);
    ellipse(enemy.x_pos, enemy.y_pos - 30, 70, 40);
    fill(100);
    if(enemy.speed > 0){
        fill(0);
        arc(enemy.x_pos+40, enemy.y_pos-40, 30, 20, HALF_PI, -HALF_PI);
        noStroke();
        fill(255,0,0);
        arc(enemy.x_pos+40, enemy.y_pos-40, 10, 5, HALF_PI, -HALF_PI);
        strokeWeight(5);
        stroke(100);
        line(enemy.x_pos, enemy.y_pos - 30,enemy.x_pos+10, enemy.y_pos - 10);
        line(enemy.x_pos+10, enemy.y_pos - 10,enemy.x_pos+30, enemy.y_pos - 10);
        noStroke();
        fill(150,0,0);
        triangle(enemy.x_pos+30, enemy.y_pos,enemy.x_pos+30, enemy.y_pos - 20,enemy.x_pos+50, enemy.y_pos - 10);        
        fill(255,255,0);
        arc(enemy.x_pos+15, enemy.y_pos-31, 40, 35, 0.4, HALF_PI-0.5);
        fill(0);
        triangle(enemy.x_pos+33, enemy.y_pos - 23.5,enemy.x_pos+27, enemy.y_pos - 20 ,enemy.x_pos+27, enemy.y_pos - 26);        
        triangle(enemy.x_pos+27, enemy.y_pos - 26,enemy.x_pos+23, enemy.y_pos - 23 ,enemy.x_pos+22, enemy.y_pos - 28);        
        triangle(enemy.x_pos+22, enemy.y_pos - 28.1,enemy.x_pos+19, enemy.y_pos - 26 ,enemy.x_pos+18, enemy.y_pos - 29.8);        
        triangle(enemy.x_pos+20, enemy.y_pos - 21,enemy.x_pos+21, enemy.y_pos - 25 ,enemy.x_pos+18, enemy.y_pos - 25.3);        
        triangle(enemy.x_pos+23, enemy.y_pos - 16,enemy.x_pos+25, enemy.y_pos - 21 ,enemy.x_pos+20, enemy.y_pos - 21);
    }
    else{
        fill(0);
        arc(enemy.x_pos-40, enemy.y_pos-40, 30, 20, -HALF_PI, HALF_PI);
        noStroke();
        fill(255,0,0);
        arc(enemy.x_pos-40, enemy.y_pos-40, 10, 5, -HALF_PI, HALF_PI);
        strokeWeight(5);
        stroke(100);
        line(enemy.x_pos, enemy.y_pos - 30,enemy.x_pos-10, enemy.y_pos - 10);
        line(enemy.x_pos-10, enemy.y_pos - 10,enemy.x_pos-30, enemy.y_pos - 10);
        noStroke();
        fill(150,0,0);
        triangle(enemy.x_pos-30, enemy.y_pos,enemy.x_pos-30, enemy.y_pos - 20,enemy.x_pos-50, enemy.y_pos - 10);        
        fill(255,255,0);
        arc(enemy.x_pos-15, enemy.y_pos-31, 40, 35, PI-1.083, PI-0.4);
        fill(0);
        triangle(enemy.x_pos-33, enemy.y_pos - 23.5,enemy.x_pos-27, enemy.y_pos - 20 ,enemy.x_pos-27, enemy.y_pos - 26);        
        triangle(enemy.x_pos-27, enemy.y_pos - 26,enemy.x_pos-23, enemy.y_pos - 23 ,enemy.x_pos-22, enemy.y_pos - 28);        
        triangle(enemy.x_pos-22, enemy.y_pos - 28.1,enemy.x_pos-19, enemy.y_pos - 26 ,enemy.x_pos-18, enemy.y_pos - 29.8);        
        triangle(enemy.x_pos-20, enemy.y_pos - 21,enemy.x_pos-21, enemy.y_pos - 25 ,enemy.x_pos-18, enemy.y_pos - 25.3);        
        triangle(enemy.x_pos-23, enemy.y_pos - 16,enemy.x_pos-25, enemy.y_pos - 21 ,enemy.x_pos-20, enemy.y_pos - 21);
    }
}

function drawBomb(bomb)
{
    noStroke();
    fill(100);
    ellipse(bomb.x_pos, bomb.y_pos, 20, 20);
    fill(25);
    rect(bomb.x_pos-2, bomb.y_pos-15, 5, 5);
}
function drawExplosion(bomb)
{
    fill(255);                
    ellipse(bomb.x_pos,bomb.y_pos,bomb.currentExplosionRadius);
}

function drawFlagpole()
{
    if(flagpole.isReached){
        fill(49, 29, 1);
        rect(flagpole.x_pos,floorPos_y-210,20,210);
        fill(255,0,0);
        beginShape();
        vertex(flagpole.x_pos+20, floorPos_y-210);
        vertex(flagpole.x_pos+70, floorPos_y-210);
        vertex(flagpole.x_pos+60, floorPos_y-190);
        vertex(flagpole.x_pos+70, floorPos_y-170);
        vertex(flagpole.x_pos+20, floorPos_y-170);
        endShape();
    }
    else{
        fill(49, 29, 1);
        rect(flagpole.x_pos,floorPos_y-210,20,210);
        fill(255,0,0);
        beginShape();
        vertex(flagpole.x_pos+20, floorPos_y-40);
        vertex(flagpole.x_pos+70, floorPos_y-40);
        vertex(flagpole.x_pos+60, floorPos_y-20);
        vertex(flagpole.x_pos+70, floorPos_y);
        vertex(flagpole.x_pos+20, floorPos_y);
        endShape();
    }
}
function checkFlagpole()
{
    flagpole.isReached = gameChar.x_pos >= flagpole.x_pos;
}