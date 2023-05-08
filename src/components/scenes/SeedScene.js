import * as Dat from 'dat.gui';
import { Scene, Color, Vector3, MeshPhongMaterial, PlaneGeometry, Mesh, Fog } from 'three';
import * as CANNON from 'cannon-es';
import { Stick } from 'objects';
import { BasicLights } from 'lights';
import Cube from '../objects/Cube/Cube';
import Ground from '../objects/Ground/Ground';
import Sphere from '../objects/Sphere/Sphere';
import Rectangle from '../objects/Background/Rectangle';
import Plane from '../objects/Plane/Plane';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        this.currentTime = 0; // Track passage of time

        // Values for random generation
        this.playableArea = {
            minX: -20,
            maxX: 20,
            minZ: -20,
            maxZ: 20, 
        }
        this.generateHeight = 15;
        this.lastGenerateTime = 0;
        this.generateDelay = 500; // In ms.
        this.generatedObjects = new Set();

        // Collision timings
        this.destructionDelay = 3000; // How long before object disappears after hitting ground
        this.invulnerableDelay = 500; // How long the player remains invulnerable
                                        // after being hit with an object
        this.lastStickCollisionTime = 0;

        // Init state
        this.defaultLives = 5;
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            leftPressed: false,
            rightPressed: false,
            upPressed: false,
            downPressed: false,
            isPaused: true,
            Score: 0,
            Lives: this.defaultLives
        };

        // Configure GUI
        const buttons = ["Start", "Pause", "Reset"];
        const apiMenu = {
            Start: () => {this.state.isPaused = false;},
            Pause: () => {this.state.isPaused = true;},
            Reset: () => {this.resetScene()}
        };
        const menu = this.state.gui.addFolder("Menu");
        buttons.forEach((button) => menu.add(apiMenu, button));
        menu.open();
        this.state.gui.add(this.state, 'Score');
        this.state.gui.add(this.state, 'Lives');

        // Set background to a nice color
        this.background = new Color(0x7ec0ee); //sky = 0x87CEEB

        // Initialize the world for the physics engine
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        });

        // Set friction between stick figure and ground to allow
        // for keyboard control
        const groundMaterial = new CANNON.Material();
        const stickMaterial = new CANNON.Material();
        const stickGroundContact = new CANNON.ContactMaterial(
            groundMaterial, stickMaterial, {friction: 0.0, restitution: 0.2});
        this.world.addContactMaterial(stickGroundContact);

        // Add objects to scene
        const lights = new BasicLights();
        this.add(lights);

        // Add stick figure
        this.stick = new Stick(stickMaterial);
        this.add(this.stick);
        this.world.addBody(this.stick.body);

        // Add plane under ground
        this.underground = new Plane();
        this.add(this.underground);
        
        // Add ground
        this.ground = new Ground(groundMaterial);
        this.add(this.ground);
        this.world.addBody(this.ground.body);

        // fog
        const color = 0x2F4F4F;  // white
        const near = 0;
        const far = 200;
        this.fog = new Fog(color, near, far);

        // Add world boundaries
        const boundaryAngles = [Math.PI / 2, -Math.PI / 2, 0, Math.PI];
        const boundaryDist = [
            new Vector3(this.playableArea.minX, 0, 0), new Vector3(this.playableArea.maxX, 0, 0),
            new Vector3(0, 0, this.playableArea.minZ), new Vector3(0, 0, this.playableArea.maxZ)];
        for (let i = 0; i < boundaryAngles.length; i++) {
            const planeShape = new CANNON.Plane();
            const planeBody = new CANNON.Body({ mass: 0, material: groundMaterial});
            planeBody.addShape(planeShape);
            planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), boundaryAngles[i]);
            planeBody.position.copy(boundaryDist[i]);
            this.world.addBody(planeBody);
        }

        // Add background
        this.background = new Rectangle();
        this.add(this.background);

        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    // Generate random falling object
    generateObj() {
        const newCube = new Cube(undefined, new Vector3(
            Math.random() * (this.playableArea.maxX - this.playableArea.minX) + this.playableArea.minX,
            this.generateHeight,
            Math.random() * (this.playableArea.maxZ - this.playableArea.minZ) + this.playableArea.minZ
        ), 3 + Math.random(), Math.random() * 20, Math.random() * 30);

        // Add some extra properties for the object
        newCube.body.hasCollidedWithGround = false;
        newCube.body.destructionTime = undefined;

        // Attach collision event listener
        newCube.body.addEventListener("collide", (collisionEvent) => {
            // If collision is with player
            if (collisionEvent.body === this.stick.body) {
                if (this.currentTime - this.lastStickCollisionTime >= this.invulnerableDelay) {
                    this.state.Lives -= 1;
                    this.lastStickCollisionTime = this.currentTime;
		    let pos_orig = collisionEvent.target.position;
		    collisionEvent.target.hasCollidedWithGround = true;
                    collisionEvent.target.destructionTime = this.currentTime;
		    for (let i = 0; i < 10; ++i) {
			let pos = pos_orig.clone ();
			pos.x += Math.random ();
			pos.y += Math.random ();
			pos.z += Math.random ();
			const splashCube = new Cube (undefined, pos, 1);
			this.add (splashCube);
			this.world.addBody (splashCube.body);
			this.generatedObjects.add (splashCube);
			splashCube.body.hasCollidedWithGround = true;
			splashCube.body.destructionTime = this.currentTime + this.destructionDelay;
		    }
                }
            }

            // If collision is with ground
            if (collisionEvent.body === this.ground.body) {
                if (!collisionEvent.target.hasCollidedWithGround) {
                    this.state.Score += 1;
                    collisionEvent.target.hasCollidedWithGround = true;
                    collisionEvent.target.destructionTime = this.currentTime + this.destructionDelay;
                }
            }
        });

        // Add to scene and physics world
        this.add(newCube);
        this.world.addBody(newCube.body);

        // Remember the new object
        this.generatedObjects.add(newCube);
    }

    checkAndDestroyObj() {
        const newGenObjects = new Set();
        this.generatedObjects.forEach((obj) => {
            if (obj.body.hasCollidedWithGround && obj.body.destructionTime <= this.currentTime) {
                this.world.removeBody(obj.body);
                this.remove(obj);
            } else {
                newGenObjects.add(obj);
            }
        })
        this.generatedObjects = newGenObjects;
    }

    resetScene() {
        // Remove all randomly generated objects
        this.generatedObjects.forEach((obj) => {
            this.world.removeBody(obj.body);
            this.remove(obj);
        })
        this.generatedObjects = new Set();

        // Reset stick figure
        this.stick.setPosition(new Vector3(0, 10, 0));

        // Reset score and lives
        this.state.Score = 0;
        this.state.Lives = this.defaultLives;
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        this.currentTime = timeStamp;

        // Update GUI
        for (var i in this.state.gui.__controllers) {
            this.state.gui.__controllers[i].updateDisplay();
        }

        // Pause the game if out of lives
        if (this.state.Lives <= 0) this.state.isPaused = true;

        // Skip the rest if the game is paused
        if (this.state.isPaused) return;

        // Generate random object
        if (timeStamp - this.lastGenerateTime >= this.generateDelay) {
            this.lastGenerateTime = timeStamp;
            this.generateObj();
        }

        // Physics
        this.world.fixedStep();
        this.stick.updatePosition();
        this.generatedObjects.forEach((obj) => obj.updatePosition());

        // Destroy any object that needs to be
        this.checkAndDestroyObj();

        // Move stick figure
        const movementInc = 0.5;

        // Left and right movement
        if (this.state.leftPressed) {
            this.stick.body.velocity.x -= movementInc;
        } else if (this.state.rightPressed) {
            this.stick.body.velocity.x += movementInc;
        } else if (Math.abs(this.stick.body.velocity.x) < movementInc) {
            this.stick.body.velocity.x = 0;
        } else if (this.stick.body.velocity.x > 0) {
            this.stick.body.velocity.x -= movementInc;
        } else {
            this.stick.body.velocity.x += movementInc
        }

        // Up and down movement
        if (this.state.upPressed) {
            this.stick.body.velocity.z -= movementInc;
        } else if (this.state.downPressed) {
            this.stick.body.velocity.z += movementInc;
        } else if (Math.abs(this.stick.body.velocity.z) < movementInc) {
            this.stick.body.velocity.z = 0;
        } else if (this.stick.body.velocity.z > 0) {
            this.stick.body.velocity.z -= movementInc;
        } else {
            this.stick.body.velocity.z += movementInc
        }
    }
}

export default SeedScene;
