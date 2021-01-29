
var background = {

    // background
    layer0: {
        position: {x: 0, y: -30},
        speed: 0.1,
        img: null,

        Start: function () {
            this.img = graphicAssets.background.image;
        },

        Draw: function (ctx) {
            ctx.drawImage(
                this.img,
                - (camera.position.x * this.speed + 150),
                canvas.height - this.img.height - (camera.position.y * this.speed)
            );
        }
    },

    // stars
    layer1: {
        position: {x: 0, y: 0},
        speed: 0.05,
        stars: [],

        Start: function () {
            // creamos un numero determinado de estrellas con posiciones y radio aleatorios
            let numberOfStars = 80;
            while (numberOfStars > 0)
            {
                let newStar = {
                    position: {
                        x: randomBetween(0, 900),
                        y: randomBetween(0, 340)
                    },
                    radius: randomBetween(0.5, 2.5)
                };
                this.stars.push(newStar);
                numberOfStars--;
            }
        },

        Draw: function (ctx) {
            for (let i = 0; i < this.stars.length; i++)
            {
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(
                    this.stars[i].position.x - (camera.position.x * this.speed),
                    this.stars[i].position.y - (camera.position.y * this.speed),
                    this.stars[i].radius,
                    0,
                    PI2,
                    false
                );
                ctx.fill();
            }
        }
    },

    // mountain
    layer2: {
        position: {x: 0, y: -30},
        speed: 0.3,
        img: null,

        Start: function () {
            this.img = graphicAssets.mountain.image;
        },

        Draw: function (ctx) {
            ctx.drawImage(
                this.img,
                - (camera.position.x * this.speed),
                canvas.height - this.img.height - (camera.position.y * this.speed)
            );
        }
    },

    // props
    layer3:{
        h_speed: 0.8,
        v_speed: 0.85,
        img: null,

        prop0: {
            position: {x: 0, y: -25}
        },

        prop1: {
            position: {x: 550, y: -25}
        },

        Start: function () {
            this.img = graphicAssets.back_prop.image;
        },

        Draw: function (ctx) {
            ctx.drawImage(
                this.img,
                - (camera.position.x * this.h_speed) + this.prop0.position.x,
                canvas.height - this.img.height - (camera.position.y * this.v_speed) + this.prop0.position.y
            );

            ctx.drawImage(
                this.img,
                - (camera.position.x * this.h_speed) + this.prop1.position.x,
                canvas.height - this.img.height - (camera.position.y * this.v_speed) + this.prop1.position.y
            );
        }
    },


    layers : null,

    // initializa the array of layers
    Start: function () {
        this.layers = new Array(this.layer0, this.layer1, this.layer2, this.layer3);
        for (let i = 0; i < this.layers.length; i++)
        {
            if (typeof(this.layers[i].Start) !== 'undefined')
                this.layers[i].Start();
        }
    },

    Draw: function (ctx) {
        for (let i = 0; i < this.layers.length; i++)
            this.layers[i].Draw(ctx);
    }

};
