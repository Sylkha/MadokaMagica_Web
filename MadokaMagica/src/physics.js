// auxiliar code for working with Box2D

// Box2D lib
var b2Vec2 = Box2D.Common.Math.b2Vec2
    ,   b2AABB = Box2D.Collision.b2AABB
    ,   b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,   b2Body = Box2D.Dynamics.b2Body
    ,   b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,   b2Fixture = Box2D.Dynamics.b2Fixture
    ,   b2World = Box2D.Dynamics.b2World
    ,   b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,   b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,   b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ,   b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    ,   b2Shape = Box2D.Collision.Shapes.b2Shape
    ,   b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ,   b2Joint = Box2D.Dynamics.Joints.b2Joint
    ,   b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
    ,   b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
    ,   b2PulleyJointDef = Box2D.Dynamics.Joints.b2PulleyJointDef
    ;

// 1 meter = 100 pixels
var scale = 100;
var gravity;
var world;

// aux function for creating boxes
function CreateBox (world, x, y, width, height, options)
{
    // default values
    let defaultOptions = {
    	density : 1.0,
    	friction: 1.0,
    	restitution : 0.5,
 
    	linearDamping : 0.0,
    	angularDamping: 0.0,
    	fixedRotation : true,
 
    	type : b2Body.b2_dynamicBody
    }
    options = Object.assign(defaultOptions, options);

    // Fixture: define physics properties (density, friction, restitution)
	var fix_def = new b2FixtureDef();
 
	fix_def.density = options.density;
	fix_def.friction = options.friction;
	fix_def.restitution = options.restitution;
 
	// Shape: 2d geometry (circle or polygon)
	fix_def.shape = new b2PolygonShape();
 
	fix_def.shape.SetAsBox(width, height);

    // Body: position of the object and its type (dynamic, static o kinetic)
	var body_def = new b2BodyDef();
	body_def.position.Set(x, y);
 
	body_def.linearDamping = options.linearDamping;
	body_def.angularDamping = options.angularDamping;
	body_def.fixedRotation = options.fixedRotation;
 
	body_def.type = options.type; // b2_dynamicBody
	body_def.userData = options.user_data;
 
	var b = world.CreateBody(body_def);
	var f = b.CreateFixture(fix_def);
 
	return b;
}

// aux function for creating balls
function CreateBall (world, x, y, radius, options)
{
	// default values
    let defaultOptions = {
    	density : 1.0,
    	friction: 1.0,
    	restitution : 0.5,
 
    	linearDamping : 0.1,
    	angularDamping: 0.1,
    	fixedRotation : true,
 
    	type : b2Body.b2_dynamicBody
    }
	options = Object.assign(defaultOptions, options);
	
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef;

	fix_def.density = options.density;
	fix_def.friction = options.friction;
	fix_def.restitution = options.restitution;

    // Shape: 2d geometry (circle or polygon)
    var shape = new b2CircleShape(radius);
	fix_def.shape = shape;
	
	body_def.position.Set(x, y);

    // friction
	body_def.linearDamping = options.linearDamping;
	body_def.angularDamping = options.angularDamping;
	body_def.fixedRotation = options.fixedRotation;

    body_def.type = options.type;
    body_def.userData = options.user_data;

    var b = world.CreateBody(body_def);
    var f = b.CreateFixture(fix_def);

    return b;
}

// Create a Box2D world object
function CreateWorld(ctx, gravity)
{
	var doSleep = false;
	var world = new b2World(gravity, doSleep);
 
	// DebugDraw is used to create the drawing with physics
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(scale);
	debugDraw.SetFillAlpha(0.5);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
 
	world.SetDebugDraw(debugDraw);
 
	return world;
}

function PreparePhysics(ctx)
{
    // create the gravity vector("down" with force 10)
    gravity = new b2Vec2(0, -20);

    // create the world
	world = CreateWorld(ctx, gravity);
	
	// prepare the collision event function
    Box2D.Dynamics.b2ContactListener.prototype.BeginContact = OnContactDetected;
}

function OnContactDetected (contact)
{
    var a = contact.GetFixtureA().GetBody().GetUserData();
    var b = contact.GetFixtureB().GetBody().GetUserData();

    if (a != null && b != null &&
        typeof(a.type) !== 'undefined' &&
        typeof(b.type) !== 'undefined')
    {
	//	console.log("collision between " + a.type + " and " + b.type);
		
		// Enemigos que van de esquina a esquina y te quitan vida cuando te alcanzan
		let enemy = null;
		if(b.type === "Melee")
			enemy = b;
		if(a.type === "Melee")
			enemy = a;

		// Enemigos a distancia
		let enemy_range = null;
		if(b.type === "Range")
			enemy_range = b;
		if(a.type === "Range")
			enemy_range = a;

		// Disparo de los enemigos a rango
		let minion_shot = null;
		if(b.type === "shot")
			minion_shot = b;
		if(a.type === "shot")
			minion_shot = a;

		// Disparo mortal del boss
		let boss_shot = null;
		if(b.type === "destructiveShot")
			boss_shot = b;
		if(a.type === "destructiveShot")
			boss_shot = a;

		// Jugador
		let player = null;
		if(b.type === "player")
			player = b;
		if(a.type === "player")
			player = a;

		// Disparo del jugador
		let player_shot = null;
		if(b.type === "ally")
			player_shot = b;
		if(a.type === "ally")
			player_shot = a;

		// Suelo o plataforma
		let floor = null;
		if(b.type === "floor")
			floor = b;
		if(a.type === "floor")
			floor = a;

		// Si el player toca el suelo:
		if(floor != null && player != null){
			let playerLinearVelocity = player.body.GetLinearVelocity();
			player.body.SetLinearVelocity(new b2Vec2(playerLinearVelocity.x, 0));

			player.canJump = true;
		}

		// Colisión entre un enemigo melé y el player o entre el disparo de un enemigo y el player 
		if((a.type === "player" && enemy != null || enemy != null && b.type === "player")
		 || (a.type === "player" && minion_shot != null || minion_shot != null && b.type === "player")){
			audioAssets.damage.audio.play();	
			player.live--;		
		}
		
		// Colisión entre el disparo del boss y el player
		if(a.type === "destructiveShot" && player != null || player != null && b.type === "destructiveShot"){
			audioAssets.damage.audio.play();
			player.live -= player.live;
		}

		// Colisión entre el disparo del player y los enemigos meles
		if(a.type === "ally" && enemy != null || enemy != null && b.type === "ally"){
			enemy.live -= 5;
		}

		// Colisión entre el disparo del player y los enemigos a rango
		if(a.type === "ally" && enemy_range != null || enemy_range != null && b.type === "ally"){
			enemy_range.live -= 2;
		}	
    }
}
