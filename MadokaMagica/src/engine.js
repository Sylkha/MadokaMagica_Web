
var canvas;
var ctx;

var targetDT = 1 / 60;
var globalDT;
var time = 0,
    FPS  = 0,
    frames    = 0,
    acumDelta = 0;

window.requestAnimationFrame = (function (evt) {
    return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame     ||
        function (callback) {
            window.setTimeout(callback, targetDT * 1000);
        };
}) ();

window.onload = BodyLoaded;

var graphicAssets = {
    player_idle: {
        path: "assets/madoka_idle.png", // idle
        image: null
    },
    player_run:{
        path: "assets/madoka_run.png",  // run
         image: null
    },
    player_attack:{
        path: "assets/madoka_attack.png", // attack
        image: null
    },
    arrow: {
        path: "assets/arrow.png",
        image: null
    },
    enemy_idle: {
        path: "assets/kyubey_idle.png", // idle
        image: null
    },
    enemy_run: {
        path: "assets/kyubey_run.png", // run
        image: null
    },
    enemy_attack: {
        path: "assets/kyubey_attack.png", // attack
        image: null
    },
    enemy_shot:{
        path: "assets/ball.png",
        image:null
    },
    melee_idle:{
        path: "assets/sayaka_idle.png",
        image:null
    },
    melee_attack:{
        path: "assets/sayaka_attack.png",
        image:null
    },
    melee_dead:{
        path: "assets/sayaka_dead.png",
        image:null
    },
    range_idle:{
        path: "assets/mami_idle.png",
        image:null
    },
    range_attack:{
        path: "assets/mami_attack.png",
        image:null
    },
    range_dead:{
        path: "assets/mami_dead.png",
        image:null
    },
    heart: {
        path: "assets/heart.png",
        image: null
    },
    mountain: {
        path: "assets/mountain.png", // https://orig00.deviantart.net/fa75/f/2017/267/3/3/mountain_sprite_001_by_jonata_d-dbogk4i.png
        image: null
    },
    back_prop:{
        path:"assets/prop_Back.png",
        image: null
    },
    background:{
        path: "assets/background_02.png",
        image: null
    },
    wall: {
        path: "assets/wall.png",
        image: null
    }
};

var menu = true;
var play = false;

// game objects
var player = null;
var camera = null;

var platforms = [];

// Dist between hearts and hearts
var dist = null;
var hearts = [];

var colision = false;
var countCol = 0;

// Boss and minions
var enemy = null;
var minion_Range = null;
var minion_Melee = null;

// alpha for text menu and endings
var alpha = 1;

var win = false;
var lose = false;

// dis to click buttons
var distButton = 0;

var canMove = false;

var currentAudio;

// audio assets references
var audioAssets = {
    arrow: {
        path: "assets/Aud_Fx_Madoka_Arrow_Release.wav",
        audio: null
    },
    damage: {
        path: "assets/Aud_Fx_Madoka_TakingDamage.wav",
        audio: null
    },
    music_menu:{
        path: "assets/Music_Menu.mp3",
        audio: null
    },
    music_game:{
        path: "assets/Music_Combat.mp3",
        audio: null
    },
    music_win:{
        path: "assets/Music_Win.mp3",
        audio: null
    },
    music_lose:{
        path: "assets/Music_Lose.mp3",
        audio: null
    }
}

function LoadImages(assets, onloaded)
{
    let imagesToLoad = 0;
    
    const onload = () => --imagesToLoad === 0 && onloaded();

    // iterate through the object of assets and load every image
    for (let asset in assets)
    {
        if (assets.hasOwnProperty(asset))
        {
            imagesToLoad++; // one more image to load

            // create the new image and set its path and onload event
            const img = assets[asset].image = new Image;
            img.src = assets[asset].path;
            img.onload = onload;
        }
     }
    return assets;
}

function LoadAudio(assets){
    for (let asset in assets)
    {
        if (assets.hasOwnProperty(asset))
        {
            assets[asset].audio = document.createElement("audio");
            assets[asset].audio.src = assets[asset].path;
            assets[asset].audio.setAttribute("preload", "audio");
            assets[asset].audio.setAttribute("preload", "none");
            assets[asset].audio.display = "none";
            document.body.appendChild(assets[asset].audio);
        }
    }
}

function BodyLoaded()
{
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    // setup keyboard & mouse events
    SetupKeyboardEvents();
    SetupMouseEvents();

    PreparePhysics(ctx);

    LoadAudio(audioAssets); 

    LoadImages(graphicAssets, function() {
        Start();

        // first call to the game loop
        Loop();
    });
}

function Start()
{
    // create some objects for the world
    // left wall
    CreateBox(world, -0.5, 1, .1, 8, {type : b2Body.b2_staticBody});
    
    // right wall
    CreateBox(world, 8.5, 1, .1, 8, {type : b2Body.b2_staticBody});

    // create platform
    let newPlatform = new Platform({x: 200, y: 400}, 100, 62);
    newPlatform.Start();
    
    platforms.push(newPlatform);

    let newPlatform_02 = new Platform({x: 500, y: 400}, 100, 62);
    newPlatform_02.Start();
    
    platforms.push(newPlatform_02);

    let newPlatform_03 = new Platform({x: 0, y: canvas.height - 35}, canvas.width, 70);
    newPlatform_03.Start();
    
    platforms.push(newPlatform_03);
    
    // create the player
    player = new Player();
    player.Start();

    // create the camera
    camera = new Camera(player);

    // initialize background
    background.Start();

    // init the enemies
    enemy = new Enemy({x: 400, y: 100}, player);
    enemy.Start();
  
    var distance = 10;
    // init hearts
    for(let i = 0; i < player.live; i++){
        distance += 25;
        hearts[i] = new Hearts(graphicAssets.heart.image, {x: 30 + distance, y: 20});
        hearts[i].Start();
    }

    // Create minions
    minion_Range = new Minions({x: 150, y: 150}, player, "Range")
    minion_Range.Start();

    minion_Melee = new Minions({x: 700, y: 150}, player, "Melee")
    minion_Melee.Start();

    // If we put "mouseover" instead of click, the first time we play we get a minor error but we'll need to click anyway, 
    // but if we restart the game, music will play because of the mouseover and won't need another click. 
    // With just "click" we'll need to click everytime we start menu.
    document.addEventListener("click", function() { 
        if(!play){
            audioPlay(audioAssets.music_menu.audio, 0.3);
        }
    }); 

}

function Loop()
{
    // deltaTime
    let now = Date.now();
    let deltaTime = now - time;
    globalDT = deltaTime;

    if (deltaTime > 1000)
        deltaTime = 0;

    time = now;

    // frames counter
    frames++;
    acumDelta += deltaTime;

    if (acumDelta > 1000)
    {
        FPS = frames;
        frames = 0;
        acumDelta -= acumDelta;
    }

    requestAnimationFrame(Loop);
    Input.Update();
    
    Menu(deltaTime / 1000);

    // Game logic -------------------   
    Update(deltaTime / 1000);

    // Draw the game ----------------
    Draw(ctx);
    
    // reset input data
    Input.PostUpdate();
}

function audioPlay(audio, volume){  // paramos la música que hay actualmente y ponemos la que le pasamos.
    if(currentAudio != null)
        currentAudio.pause();

    currentAudio = audio;
    currentAudio.play();
    currentAudio.loop = true;
    currentAudio.volume = volume;  
}

function Menu(deltaTime){
    if(menu){   // Mouse vs button parameters (To calculate click and button collision)
        let mouseShipVector_Play = {
            x: Input.mouse.x - 250,
            y: Input.mouse.y - 200,
            w: Input.mouse.x - (250 + 300),
            z: Input.mouse.y - (200 + 75)
        };
        let mouseShipVector_Exit = {
            x: Input.mouse.x - 250,
            y: Input.mouse.y - 400,
            w: Input.mouse.x - (250 + 300),
            z: Input.mouse.y - (400 + 75)
        };
        // To start playing
        if(play == false && Input.IsMousePressed() && (distButton < mouseShipVector_Play.x && distButton < mouseShipVector_Play.y && distButton > mouseShipVector_Play.w && distButton > mouseShipVector_Play.z))
        {
            play = true;
            
            audioPlay(audioAssets.music_game.audio, 0.5);         
        }
        // In case we clicked on play, so we cant click exit
        else if(play == false && Input.IsMousePressed() && (distButton < mouseShipVector_Exit.x && distButton < mouseShipVector_Exit.y && distButton > mouseShipVector_Exit.w && distButton > mouseShipVector_Exit.z))
        {
            window.close();
        }
        if(play){  
            alpha -= deltaTime;

            canMove = true;

            if(alpha <= 0){
                menu = false;
            }
        }
    }
}

function Update(deltaTime)
{
    if(canMove){
        // update physics
        // Step(timestep , velocity iterations, position iterations)
        world.Step(deltaTime, 8, 3);
        world.ClearForces();
    
        // player update
        player.Update(deltaTime);
    
        // update the camera
        camera.Update(deltaTime);
    
        // update the enemies
        enemy.Update(deltaTime);
    
        // update minions
        minion_Range.Update(deltaTime);
        minion_Melee.Update(deltaTime);

        // activate the boss
        if(minion_Range.live <= 0 && minion_Melee.live <= 0){
            enemy.bossTime = true;
            currentAudio.playbackRate = 1.05;   // Change music speed
        }
    }

    // We died
    if(player.live == 0 && lose == false){
        lose = true;

        audioPlay(audioAssets.music_lose.audio, 0.4);
        
    }

    if(win || lose){
        canMove = false;
        alpha += deltaTime / 2;
        
        let mouseShipVector = {
            x: Input.mouse.x - 280,
            y: Input.mouse.y - 500,
            w: Input.mouse.x - (280 + 300),
            z: Input.mouse.y - (500 + 75)
        };

        // Play again (reload the page)
        if(lose == true && Input.IsMousePressed() && (distButton < mouseShipVector.x && distButton < mouseShipVector.y && distButton > mouseShipVector.w && distButton > mouseShipVector.z))
        {
            location.reload();
        }
    }

}

function Draw(ctx)
{
    // Text win
    if(win == true){
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha +')';
        ctx.fillRect( 0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha +')';
        ctx.font = "40px Verdana";
        ctx.fillText("Don't forget.", 250, 75);
        ctx.fillText("Always, somewhere,", 175, 150);
        ctx.fillText("someone is fighting for you.", 100, 225);
        ctx.fillText("As long as you remember her,", 100, 350);
        ctx.fillText("you are not alone", 225, 425);

        return;
    }  

    // Text lose
    if(lose == true){
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha +')';
        ctx.fillRect( 0, 0, canvas.width, canvas.height);
    
        // Text
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha +')';
        ctx.font = "40px Verdana";
        ctx.fillText("No matter what,", 250, 75);
        ctx.fillText("I will go back in time", 200, 150);
        ctx.fillText("over and over", 275, 225);
        ctx.fillText("just to prevent you ", 240, 350);
        ctx.fillText("from becoming a witch.", 200, 425);

        // Button
        ctx.fillRect( 280, 500, 300, 75);

        // Text Button
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha +')';
        ctx.fillText("Go back", 350, 550);

        return;
    }

    // clean the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the background layers
    background.Draw(ctx);

    // camera pre-draw
    camera.PreDraw();

    // draw the box2d world
    //DrawWorld(ctx, world);

    for(let i = 0; i < platforms.length; i++){
        platforms[i].Draw(ctx);
    }

    // draw the player
    player.Draw(ctx);
   
    // draw the enemies
    enemy.Draw(ctx);

    // draw minions
    minion_Range.Draw(ctx);
    minion_Melee.Draw(ctx);

    // draw the hearts
    for(let i = 0; i < player.live; i++){
        hearts[i].Draw(ctx);
    }

    // camera post-draw
    camera.PostDraw();

    // draw the FPS
    ctx.fillStyle = "white";
    ctx.font = "10px Comic Sans MS";
    ctx.fillText('FPS: ' + FPS, 10, 16);
    ctx.fillText('DT: ' + Math.round(1000 / globalDT), 10, 28);

    if(enemy.bossTime){
        ctx.font = "20px Verdana";
        ctx.fillText("If he hits you with the ball, he'll make you a witch!!", 200, 50);
    }

    if(menu == true){
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha +')';
        ctx.fillRect( 0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha +')';
        ctx.font = "40px Verdana";

        // Button
        ctx.fillRect( 250, 200, 300, 75);
        ctx.fillRect( 250, 400, 300, 75);

        // Text Button
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha +')';
        ctx.fillText("Play", 360, 250);
        ctx.fillText("Exit", 360, 450);

    }
    
}

function DrawWorld (ctx, world)
{
    // Transform the canvas coordinates to cartesias coordinates
    ctx.save();
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    world.DrawDebugData();
    ctx.restore();
}
