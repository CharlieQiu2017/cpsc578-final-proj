import * as Dat from 'dat.gui';
import { Scene, Color, Vector3 } from 'three';
import * as CANNON from 'cannon-es';
import { Stick } from 'objects';
import { BasicLights } from 'lights';
import Cube from '../objects/Cube/Cube';
import Ground from '../objects/Ground/Ground';
import Sphere from '../objects/Sphere/Sphere';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: -5,
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
        this.cube = new Cube();
        this.add(this.cube);
        this.cube.body.addEventListener("collide", (e) => {
            if (this.stick.body === e.body || this.stick.body === e.target) {
                this.state.Score += 1;
            }
        });
        this.world.addBody(this.cube.body);

        // Test sphere
        this.sphere = new Sphere();
        this.add(this.sphere);
        this.world.addBody(this.sphere.body);

        // Add ground
        this.ground = new Ground(groundMaterial);
        this.add(this.ground);
        this.world.addBody(this.ground.body);

        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    resetScene() {
        this.cube.setPosition(new Vector3(1, 15, 0));
        this.stick.setPosition(new Vector3(0, 10, 0));
        this.sphere.setPosition(new Vector3(-2, 20, 0))
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        for (var i in this.state.gui.__controllers) {
            this.state.gui.__controllers[i].updateDisplay();
        }

        // Skip the rest if the game is paused
        if (this.state.isPaused) return;

        // Physics
        this.world.fixedStep();
        this.cube.updatePosition();
        this.stick.updatePosition();
        this.sphere.updatePosition();

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
