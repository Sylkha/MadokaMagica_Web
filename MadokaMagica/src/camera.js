
class Camera
{
    constructor(player)
    {
        this.player = player;
        
        this.offset = {x: player.position.x, y: 600};
        this.position = {x: 0, y: 0};

        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
    }

    Update(deltaTime)
    {
        this.position.x = this.player.position.x - this.offset.x;
        this.position.y = (this.player.position.y - this.offset.y) * 0.2;

        // minX-maxX clamp
        this.position.x = Math.min(Math.max(this.position.x, this.minX), this.maxX);
    }

    PreDraw()
    {
        ctx.save();
        ctx.translate(-this.position.x, -this.position.y);
    }

    PostDraw()
    {
        ctx.restore();
    }
}
