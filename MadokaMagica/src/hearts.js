class Hearts
{
    constructor(image, initialPosition)
    {
        this.image = image;
        this.initialPosition = initialPosition;
        this.position = {};
        [this.position.x, this.position.y] = [initialPosition.x, initialPosition.y];

        this.pivot = {
            x: this.image.width / 2,
            y: this.image.height / 2
        };

        this.rotation = 0;
    }

    Start()
    {
    }

    Draw(ctx)
    {
        ctx.save();

     
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(this.image, -this.pivot.x, -this.pivot.y);

        ctx.restore();
    }
}