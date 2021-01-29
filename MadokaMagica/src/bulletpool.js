
class Bullet
{
    constructor (image, index = -1, type)
    {
        this.type = type;

        this.image = image;
        this.pivot = {
            x: image.width / 2,
            y: image.height / 2
        }

        this.index = index;
        this.active = false;
        
        this.position = { x: 0, y: 0 },
        this.rotation = 0;
        this.speed = 0;
        this.damage = 0;

        this.width = 0.3;
        this.height = 0.1;

        // physics properties of the players body
        this.physicsOptions = {
            density: 1,
            fixedRotation: true,
            linearDamping: 1,
            user_data: enemy, //shot
            type: b2Body.b2_dynamicBody,
            restitution: 0.0,
            friction: 0.5
        };

        // reference to the players body
        this.body = null;
    }
    Start(){
        this.body = CreateBox(world,
            this.position.x / scale, this.position.y / scale,
            this.width, this.height, this.physicsOptions);

        this.body.SetUserData(this);
        this.body.GetFixtureList().SetSensor(true);

        this.body.SetActive(false);
    }

    Update(deltaTime)
    {
        this.position.x += Math.cos(this.rotation) * this.speed * deltaTime;
        this.position.y += Math.sin(this.rotation) * this.speed * deltaTime;

        this.body.SetPosition(new b2Vec2(this.position.x / scale, (canvas.height - this.position.y) / scale));
        this.body.SetAngle(-this.rotation);
    }

    Draw(ctx)
    {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(0.25, 0.25);

        ctx.drawImage(this.image, -this.pivot.x, -this.pivot.y);

        ctx.restore();
    }
}

class BulletPool
{
    constructor (bulletImage, type)
    {
        this.bulletImage = bulletImage;
        this.type = type;

        this.bulletArray = [];
        this.initialSize = 3;
        this.bulletCount = 0;
    }

    Start()
    {
        this.bulletArray = [];
        for (var i = 0; i < this.initialSize; i++)
        {
            let bullet = new Bullet(this.bulletImage, i, this.type);
            bullet.Start();
            this.bulletArray.push(bullet);
        }
    }

    Update(deltaTime)
    {
        for (let i = 0; i < this.bulletArray.length; i++)
        {
            let bullet = this.bulletArray[i];

            if (bullet.active) {
                bullet.Update(deltaTime);

                // check screen bounds
                if (bullet.position.y < 0 || bullet.position.y > canvas.height || bullet.position.x < 0 || bullet.position.x > canvas.width)
                    this.DisableBullet(bullet);
            }
        }
    }

    Draw(ctx)
    {
        this.bulletArray.forEach(function(bullet) {
            if (bullet.active)
                bullet.Draw(ctx);
        });
    }

    EnableBullet()
    {
        // search for the first unactive bullet
        let bullet = null;
        let found = false;
        let i = 0;
        while (!found && i < this.bulletArray.length)
        {
            if (!this.bulletArray[i].active)
            {
                found = true;
                bullet = this.bulletArray[i];
            }
            else
                i++;
        }

        if (!found)
        {
            // all the bullets are active: create a new one
            bullet = new Bullet(this.bulletImage, this.bulletArray.length);
            
            this.bulletArray.push(bullet);
        }

        this.bulletCount++;

        return bullet;
    }

    DisableBullet(bullet)
    {
        // disable the bullet
        this.bulletCount--;
        bullet.body.SetActive(false);
        bullet.active = false;
    }
}