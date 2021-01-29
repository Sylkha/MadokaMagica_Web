
class Enemy
{
    constructor(initialPosition, player)
    {
        this.image = graphicAssets.enemy_idle.image;
        this.initialPosition = initialPosition;
        this.position = {};
        [this.position.x, this.position.y] = [initialPosition.x, initialPosition.y];

        this.player = player;

        // tag
        this.type = "Melee";

        // init the state machine
        this.state = "searching";

        this.rotation = 0;
        this.count = 0;
        this.maxCount = 3;
        this.speed = 500;

        this.radio = 32;

        this.live = 80;

        this.bossTime = false;

        // bullet pool
        this.bulletPool = new BulletPool(graphicAssets.enemy_shot.image, "destructiveShot");
        this.shot = false;

        // reference to the Animation object
        this.current_Animation = null;
        this.animation_Idle;
        this.animation_Run;
        this.animation_Attack;

        this.width = 0.40,
        this.height = 0.25;
        this.scale = 1;

        this.limit = 40;

        // movement flags
        this.mirrorX = false;
        this.mirrorY = false;

        // physics properties of the players body
        this.physicsOptions = {
            density: 1,
            fixedRotation: true,
            linearDamping: 1,
            user_data: player,
            type: b2Body.b2_dynamicBody,
            restitution: 0.0,
            friction: 0.5
        };

        // reference to the players body
        this.body = null;
    }
    
    Start()
    {
        this.bulletPool.Start();

        this.animation_Idle = new SSAnimation(graphicAssets.enemy_idle.image, 96, 79, [9, 2], 1/12); // Idle
        this.animation_Run = new SSAnimation(graphicAssets.enemy_run.image, 128, 75, [6], 1/12); // Run
        this.animation_Attack = new SSAnimation(graphicAssets.enemy_attack.image, 56.1, 95, [8], 1/12); // Attack
        this.animation_Attack.loop = false;

        this.current_Animation = this.animation_Idle;

        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsOptions);

        this.body.SetUserData(this);
        this.body.GetFixtureList().SetSensor(true);
    }

    Update(deltaTime)
    {
        if(!this.bossTime) return;
        // displacement vector
        let disp = { x: 0, y: 0 };       
        switch (this.state)
        {
            case "shoot":
                if(player.position.x - this.position.x > 0)
                    this.mirrorX = true;
                else
                    this.mirrorX = false;

                this.current_Animation = this.animation_Attack;

                // Rotamos a la posición + 90º
                this.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x)+ 1.5708;
                
                if(this.shot == false){
                    let bullet = this.bulletPool.EnableBullet();
                    bullet.body.SetActive(true);
                    
                    bullet.position.x = this.position.x;
                    bullet.position.y = this.position.y;
                    bullet.rotation = this.rotation - 1.5708;   // We dont need the 90º
                    bullet.speed = 1000;
                    bullet.active = true;
                    
                    this.shot = true;
                }
                
                if (!this.current_Animation.loop)
                {
                    if (this.current_Animation.ended){
                        this.mirrorX = false;
                        this.state = "searching";
                    }
                }
                break;

            case "searching":  
            
                if(player.position.x - this.position.x > 0)
                    this.mirrorY = false;
                else
                    this.mirrorY = true;
            
                this.current_Animation = this.animation_Idle;
                // TODO look for the player
                this.rotation = Math.atan2(this.player.position.y - this.position.y, this.player.position.x - this.position.x);               
                
                // TODO when the enemy has seen the player for x seconds, start moving in a straight line
                this.count += deltaTime;

                if(this.count >= this.maxCount){    //Ha pasado 1 segundo             
                    this.state = "moving";
                    this.count = 0;     //Reseteamos
                }
                break;

            case "moving":
                this.current_Animation = this.animation_Run;
                // go straight
                // TODO compute disp.x and disp.y
                // TODO normalize disp
                disp.x = Math.cos(this.rotation); //No necesitamos normalizarlo porque con el sin y el cos, nos lo da ya "normalizado"
                disp.y = Math.sin(this.rotation);

                // TODO update the position acordingly (with disp and a speed)
                this.position.x += disp.x * this.speed * deltaTime;
                this.position.y += disp.y * this.speed * deltaTime;                

                // TODO check for scenery limits
                // TODO if enemy reaches a limit, start shooting the player again.
                // Recolocate the boss cus it gets stuck
                let toReset = false;
                if (this.position.x <= this.limit)
                {
                    toReset = true;
                    this.position.x = this.limit + 1;
                }
                if (this.position.y <= this.limit)
                {
                    toReset = true;
                    this.position.y = this.limit + 1;
                }
                if (this.position.x >= canvas.width - this.limit)
                {
                    toReset = true;
                    this.position.x = canvas.width - this.limit + 1;
                }
                if (this.position.y >= canvas.height - this.limit)
                {
                    toReset = true;
                    this.position.y = canvas.height - this.limit - 10;
                }

                if (toReset){
                    this.animation_Attack.Reset();
                    this.shot = false;
                    this.state = "shoot";
                }
                break;
        }

        this.body.SetPosition(new b2Vec2(this.position.x / scale, (canvas.height - this.position.y) / scale));
        this.body.SetAngle(-this.rotation);
        // draw the bullets
        this.bulletPool.Update(deltaTime);

        // update the animation
        this.current_Animation.Update(deltaTime);

        if(this.live <= 0 && win == false){
            this.live = 0;
            
            audioPlay(audioAssets.music_win.audio, 0.3);

            win = true;
        }
    }

    Draw(ctx)
    {
        // draw the enemy ship sprite
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        
        // Draw life bar
        ctx.fillStyle = "green";
        if(this.bossTime)
            ctx.fillRect(-25, -this.image.height/2 + 30, this.live, 10);

        ctx.rotate(this.rotation);

        if (this.mirrorY)
            ctx.scale(1, -1);
        if (this.mirrorX)
            ctx.scale(-1, -1);
        
        this.current_Animation.Draw(ctx);
        
        ctx.restore();

        // draw the bullets
        this.bulletPool.Draw(ctx);
    }
}