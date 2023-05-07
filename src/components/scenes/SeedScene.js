import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import * as CANNON from 'cannon-es';
import { Stick } from 'objects';
import { BasicLights } from 'lights';
import Cube from '../objects/Cube/Cube';
import Ground from '../objects/Ground/Ground';
import Rectangle from '../objects/Background/Rectangle';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            leftPressed: false,
            rightPressed: false
        };

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
        this.cube = new Cube();
        this.add(this.cube);
        this.world.addBody(this.cube.body);

        // Add ground
        this.ground = new Ground(groundMaterial);
        this.add(this.ground);
        this.world.addBody(this.ground.body);

        // Add background
        this.background = new Rectangle();
        this.add(this.background);
        // this.world.addBody(this.ground.body);

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Physics
        this.world.fixedStep();
        this.cube.updatePosition();
        this.stick.updatePosition();

        // Move stick figure
        if (this.state.leftPressed) {
            this.stick.body.velocity.x = -10;
        } else if (this.state.rightPressed) {
            this.stick.body.velocity.x = 10;
        } else {
            this.stick.body.velocity.x = 0;
        }
    }
}

export default SeedScene;
