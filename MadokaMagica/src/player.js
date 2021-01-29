
class Player
{
    constructor()
    {
        // we can use it as a tag for collisions
        this.type = 'player';

        this.position = {};
        [this.position.x, this.position.y] = [400, 200];
        this.rotation = 0;
        this.width = 0.24,
        this.height = 0.55;

        this.live = 5;
      
        // movement attr
        this.maxHorizontalVel = 3;
        this.maxVerticalVel = 10;
        this.jumpForce = 12;
        
        // movement flags
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;

        this.isGoingLeft = false;
        this.canJump = false;

        // reference to the Animation object
        this.current_Animation = null;
        this.animation_Idle = null;
        this.animation_Run = null;
        this.animation_Attack = null;

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

        // control if we attacked
        this.currentAttackDone = false;

        this.frameShoot = 4;

        // bullet pool
        this.bulletPool = new BulletPool(graphicAssets.arrow.image, "ally");
        this.bulletRot;
        this.bulletPos = {};

        this.countBtShot = 0;
    }

    Start()
    {
        this.animation_Idle = new SSAnimation(graphicAssets.player_idle.image, 83, 120, [8], 1/12); // Idle
        this.animation_Run = new SSAnimation(graphicAssets.player_run.image, 100, 130, [8], 1/12); // Run
        this.animation_Attack = new SSAnimation(graphicAssets.player_attack.image, 130, 140, [6, 3], 1/12); // Attack

        // this animation won't loop
        this.animation_Attack.loop = false;

        this.current_Animation = this.animation_Idle;

        // create bullet pool
        this.bulletPool.Start();

        // create box2d for the player
        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsOptions);

        this.body.SetUserData(this);
    }

    Update(deltaTime)
    {
        // control animations. If we finished attack's animation we can go idle (and in general, its usefull for other kind of animations that won't loop).
        if (!this.current_Animation.loop)
        {
            if (this.current_Animation.ended)
                this.current_Animation = this.animation_Idle;
        } // if we dont need the last animation to be finished and we won't change the animation to be idle, then we'll go idle 
        else {
            this.current_Animation = this.animation_Idle;
        }

        // input controls
        if (Input.IsKeyPressed(KEY_LEFT) || Input.IsKeyPressed(KEY_A)){
            this.moveLeft = true;
            if (this.current_Animation != this.animation_Attack)
                this.current_Animation = this.animation_Run;
        }

        if (Input.IsKeyPressed(KEY_RIGHT) || Input.IsKeyPressed(KEY_D)){
            this.moveRight = true;
            if (this.current_Animation != this.animation_Attack)
                this.current_Animation = this.animation_Run;
        }

        if (Input.IsKeyPressed(KEY_UP) || Input.IsKeyPressed(KEY_W) || Input.IsKeyPressed(KEY_SPACE)){
            this.Jump();
            if (this.current_Animation != this.animation_Attack)
                this.current_Animation = this.animation_Idle;
        }

        // movement
        if (this.moveRight)
        {
            this.ApplyVelocity(new b2Vec2(1, 0));
            this.moveRight = false;
            this.isGoingLeft = false;
        }

        if (this.moveLeft)
        {
            this.ApplyVelocity(new b2Vec2(-1, 0));
            this.moveLeft = false;
            this.isGoingLeft = true;
        }

        // jump
        if (this.moveUp)
        {
            this.ApplyVelocity(new b2Vec2(0, this.jumpForce));
            this.moveUp = false;
        }

        // update the position
        let bodyPosition = this.body.GetPosition();
        this.position.x = bodyPosition.x * scale;
        this.position.y = Math.abs((bodyPosition.y * scale) - ctx.canvas.height);
        
        // shoot. You can't shoot until the animation has ended
        if (Input.IsMousePressed() && this.countBtShot >= this.animation_Attack.framesDuration * 5)
        {        
            // prepare the attack animation
            this.current_Animation = this.animation_Attack;
            this.animation_Attack.Reset();
            this.currentAttackDone = false;

            // we need the position where we click. If we dont store it, the point will be the one in the actual frame of the bullet spawn
            [this.bulletPos.x, this.bulletPos.y] = [Input.mouse.x, Input.mouse.y]

            this.countBtShot = 0;
        }

        if (this.current_Animation == this.animation_Attack)
        {
            // wait for n frames to shot the arrow
            if (this.animation_Attack.actualFrame == this.frameShoot && !this.currentAttackDone)
            {
                audioAssets.arrow.audio.play();
                // rotation (face the mouse in the position we clicked before)
                let mouseShipVector = {
                    x: this.bulletPos.x - this.position.x,
                    y: this.bulletPos.y - this.position.y
                };

                this.rotation = Math.atan2(
                    mouseShipVector.y,
                    mouseShipVector.x
                );

                // call a bullet be shot in a specific frame.
                let bullet = this.bulletPool.EnableBullet();
                bullet.body.SetActive(true);

                bullet.position.x = this.position.x;
                bullet.position.y = this.position.y;
                bullet.rotation = this.rotation;
                bullet.speed = 1000;
                bullet.active = true;
                this.currentAttackDone = true;
            }
        }

        // count to shoot again
        this.countBtShot += deltaTime;

        // update the bullets
        this.bulletPool.Update(deltaTime);

        // update the animation current animation
        this.current_Animation.Update(deltaTime);
    }

    Draw(ctx)
    {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        
        if (this.isGoingLeft)
            ctx.scale(-1, 1);

        // draw the current animation
        this.current_Animation.Draw(ctx);
        
        ctx.restore();

        // draw the bullets
        this.bulletPool.Draw(ctx);
    }

    ApplyVelocity(vel)
    {
        let bodyVel = this.body.GetLinearVelocity();
        bodyVel.Add(vel);

        // horizontal movement cap
        if (Math.abs(bodyVel.x) > this.maxHorizontalVel)
            bodyVel.x = this.maxHorizontalVel * bodyVel.x / Math.abs(bodyVel.x);

        // vertical movement cap
        if (Math.abs(bodyVel.y) > this.maxVerticalVel)
            bodyVel.y = this.maxVerticalVel * bodyVel.y / Math.abs(bodyVel.y);

        this.body.SetLinearVelocity(bodyVel);
    }

    Jump()
    {
        if (Math.abs(this.body.GetLinearVelocity().y) > 0.1 || !this.canJump)
            return false;

        this.moveUp = true;
        this.canJump = false;
    }

}
