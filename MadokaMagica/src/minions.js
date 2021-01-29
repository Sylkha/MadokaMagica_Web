
class Minions
{
    constructor(initialPosition, player, type)
    {
        this.image = graphicAssets.enemy_idle.image;
        this.initialPosition = initialPosition;
        this.position = {};
        [this.position.x, this.position.y] = [initialPosition.x, initialPosition.y];

        this.player = player;
        this.type = type;
        this.status = type;

        this.rotation = 0;
        this.count = 0;
        this.maxCount = 3;
        this.speed = 500;

        this.radio = 32;

        this.live = 60;

        // bullet pool
        this.bulletPool = new BulletPool(graphicAssets.arrow.image, "shot");
        this.shot = false;

        this.frameShoot = 6;

        // reference to the Animation object
        this.current_Animation = null;
        this.animation_Idle;
        this.animation_Run;
        this.animation_Attack;

        this.width = 0.40,
        this.height = 0.35;
        this.scale = 1;

        this.limit = 80;

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

        // Diferenciar animaciones de las de rango a las de disparo
        if(this.type == "Melee"){
            this.animation_Idle = new SSAnimation(graphicAssets.melee_idle.image, 121, 140, [10], 1/12); // Idle
            this.animation_Attack = new SSAnimation(graphicAssets.melee_attack.image, 130.9, 130, [8], 1/12); // Attack
            this.animation_Dead = new SSAnimation(graphicAssets.melee_dead.image, 165, 130, [4, 4], 1/12); // Dead

            this.animation_Dead.loop = false;

            this.current_Animation = this.animation_Idle;
        }
        else if(this.type == "Range"){
            this.animation_Idle = new SSAnimation(graphicAssets.range_idle.image, 103, 130, [6], 1/12); // Idle
            this.animation_Attack = new SSAnimation(graphicAssets.range_attack.image, 115, 143, [7, 5], 1/12); // Attack
            this.animation_Dead = new SSAnimation(graphicAssets.range_dead.image, 136, 140, [6, 6, 1], 1/12); // Dead
            
            this.animation_Attack.loop = false;
            this.animation_Dead.loop = false;

            this.current_Animation = this.animation_Idle;
        }

        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsOptions);

        this.body.SetUserData(this);
        this.body.GetFixtureList().SetSensor(true);
    }

    Update(deltaTime)
    {
        // displacement vector
        let disp = { x: 0, y: 0 }; 
        
        if(this.live <= 0){  // Muerto
            this.live = 0;
            this.status = "Dead";
            this.body.SetActive(false);
            if(this.current_Animation.ended)                
                return;
            
        }

        switch (this.status)
        {
            // Range class
            case "shot":

                if(player.position.x - this.position.x > 0)
                    this.mirrorX = false;
                else
                    this.mirrorX = true;

                this.current_Animation = this.animation_Attack;

                //this.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x)+ 1.5708;
                
                if(this.shot == false){
                    if (this.animation_Attack.actualFrame == this.frameShoot && !this.currentAttackDone)
                    {
                        let bullet = this.bulletPool.EnableBullet();
                        bullet.body.SetActive(true);

                        bullet.position.x = this.position.x;
                        bullet.position.y = this.position.y;
                        bullet.rotation = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
                        bullet.speed = 1000;
                        bullet.active = true;
                        
                        this.shot = true;
                    }
                }
                
                if (!this.current_Animation.loop)
                {
                    if (this.current_Animation.ended){
                        this.mirrorX = false;
                        this.status = "Range";
                    }
                }
                break;

                case "Range":  
                    if(player.position.x - this.position.x > 0)
                        this.mirrorX = false;
                    else
                        this.mirrorX = true;
                
                    this.current_Animation = this.animation_Idle;
                    // TODO look for the player
                    //this.rotation = Math.atan2(this.player.position.y - this.position.y, this.player.position.x - this.position.x);               
                    
                    // TODO when the enemy has seen the player for x seconds, start moving in a straight line
                    this.count += deltaTime;

                    if(this.count >= this.maxCount){    //Ha pasado X segundos             
                        this.animation_Attack.Reset();
                        this.shot = false;
                        this.status = "shot";
                        this.count = 0;     //Reseteamos
                        this.mirrorY = false;
                    }
                    break;

            // Melee class
            case "atack":
 

                this.current_Animation = this.animation_Attack;
                // go straight
                // TODO compute disp.x and disp.y
                // TODO normalize disp
                disp.x = Math.cos(this.rotation); //No necesitamos normalizarlo porque con el sin y el cos, nos lo da ya "normalizado"
                disp.y = Math.sin(this.rotation);

                // TODO update the position acordingly (with disp and a speed)
                this.position.x += disp.x * this.speed * deltaTime;
                this.position.y += disp.y * this.speed * deltaTime;

                // TODO check for scenery limits
                // TODO if enemy reaches a limit, start searching for the player again
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
                    this.status = "Melee";
                }
                break;
                
                case "Melee":
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
                        this.status = "atack";
                        this.count = 0;     //Reseteamos
                    }
                    break;

                case "Dead":
                        this.current_Animation = this.animation_Dead;
                    break;
        }

        this.body.SetPosition(new b2Vec2(this.position.x / scale, (canvas.height - this.position.y) / scale));
        this.body.SetAngle(-this.rotation);

        // draw the bullets
        this.bulletPool.Update(deltaTime);

        // update the animation
        this.current_Animation.Update(deltaTime);

    }

    Draw(ctx)
    {
        if(this.live <= 0 && this.current_Animation.ended)                
                return;

        // draw the enemy ship sprite
        ctx.save();

        ctx.translate(this.position.x, this.position.y);

        // Draw life bar
        ctx.fillStyle = "green";
        ctx.fillRect(-25, -this.image.height/2 + 10, this.live, 10);

        ctx.rotate(this.rotation);
        
        if (this.mirrorY)
            ctx.scale(1, -1);
        if (this.mirrorX)
            ctx.scale(-1, 1);
        
        this.current_Animation.Draw(ctx);
                
        ctx.restore();

        // draw the bullets (we must do it after ctx.restore(), if not, the translation, scale, etc of the player, it will apply too to the bullet)
        this.bulletPool.Draw(ctx);
    }
}