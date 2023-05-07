import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import * as CANNON from 'cannon-es';
import { Stick } from 'objects';
import { BasicLights } from 'lights';
import Cube from '../objects/Cube/Cube';
import Ground from '../objects/Ground/Ground';
import Sphere from '../objects/Sphere/Sphere';
import Rectangle from '../objects/Background/Rectangle';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        this.currentTime = 0; // Track passage of time

        // Values for random generation
        this.playableArea = {
            minX: -25,
            maxX: 25,
            minZ: -25,
            maxZ: 25, 
        }
        this.generateHeight = 15;
        this.lastGenerateTime = 0;
        this.generateDelay = 500; // In ms.
        this.generatedObjects = new Set();

        // Collision timings
        this.destructionDelay = 3000; // How long before object disappears after hitting ground
        this.invulnerableDelay = 2000; // How long the player remains invulnerable
                                        // after being hit with an object
        this.lastStickCollisionTime = 0;

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            leftPressed: false,
            rightPressed: false,
            upPressed: false,
            downPressed: false,
            isPaused: true,
            Score: 0
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

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

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

        // Test cube
        // this.shown = false;
        // this.cube = new Cube();
        // this.add(this.cube);
        // this.cube.body.addEventListener("collide", (e) => {
        //     if (this.stick.body === e.body) {
        //         this.state.Score += 1;
        //     }
        // });
        // this.world.addBody(this.cube.body);

        // Test sphere
        // this.sphere = new Sphere();
        // this.add(this.sphere);
        // this.world.addBody(this.sphere.body);

        // Add ground
        this.ground = new Ground(groundMaterial);
        this.add(this.ground);
        this.world.addBody(this.ground.body);

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
        ));

        // Add some extra properties for the object
        newCube.body.hasCollidedWithGround = false;
        newCube.body.destructionTime = undefined;

        // Attach collision event listener
        newCube.body.addEventListener("collide", (collisionEvent) => {
            // If collision is with player
            if (collisionEvent.body === this.stick.body) {
                if (this.currentTime - this.lastStickCollisionTime >= this.invulnerableDelay) {
                    console.log("ouch");
                    this.lastStickCollisionTime = this.currentTime;
                }
            }

            // If collision is with ground
            if (collisionEvent.body === this.ground.body) {
                if (!collisionEvent.target.hasCollidedWithGround) {
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
