class Platform{
    constructor(position, width, height){
        this.type = "floor";

        this.position = position;
        this.width = width;
        this.height = height;

        // physics properties of the players body
        this.physicsOptions = {
            user_data: this,
            type: b2Body.b2_kinematicBody,
        };

        this.body = null;

        this.image = graphicAssets.wall.image;
    }

    Start(){
        this.body = CreateBox(world, (this.position.x + this.width / 2) / scale, (canvas.height - this.position.y - this.height / 2) / scale, this.width / (scale * 2), this.height / (scale * 2), this.physicsOptions)
    }

    Draw(ctx){
       ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

}