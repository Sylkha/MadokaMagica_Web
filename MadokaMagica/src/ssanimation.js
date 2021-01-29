
class SSAnimation
{
    constructor(image, frameWidth, frameHeight, frameCount, framesDuration)
    {
        this.image = image;

        this.pivot = {
            x: 32,
            y: 32
        };

        this.framesDuration = framesDuration;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;

        this.halfFrameWidth = this.frameWidth / 2;
        this.halfFrameHeight = this.frameHeight / 2;

        this.loop = true;
        this.ended = false;
    }
    
    Start()
    {

    }

    Update(deltaTime)
    {
        this.actualFrameCountTime += deltaTime;
        if (this.actualFrameCountTime >= this.framesDuration)
        {
            // update the animation with the new frame
            this.actualFrame = (this.actualFrame + 1) % this.frameCount[this.actualAnimation];

            if (this.actualFrame == 0)
            {
                this.actualAnimation = (this.actualAnimation + 1) % this.frameCount.length;

                if (this.actualAnimation == 0)
                {
                    if (!this.loop)
                        this.ended = true;
                }
            }

            this.actualFrameCountTime = 0;
        }
    }

    Draw(ctx)
    {
        ctx.drawImage(this.image, this.actualFrame * this.frameWidth, this.actualAnimation * this.frameHeight, this.frameWidth, this.frameHeight, -this.halfFrameWidth, -this.halfFrameHeight, this.frameWidth, this.frameHeight);
    }

    PlayAnimationLoop(animationId)
    {
        this.actualAnimation = animationId;

        // reset the frame count
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
    }
    
    Reset()
    {
        this.actualAnimation = 0;
        this.actualFrame = 0;
        this.actualFrameCountTime = 0;
        this.ended = false;
    }
}