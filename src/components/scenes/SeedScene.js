// import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
// import { Flower, Land } from 'objects';
import { Stick } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
	    leftPressed: false,
	    rightPressed: false
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        // const land = new Land();
        // const flower = new Flower(this);
	this.stick = new Stick();
        const lights = new BasicLights();
        this.add(this.stick, lights);

        // Populate GUI
        // this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        //const { rotationSpeed, updateList } = this.state;
        //this.rotation.y = (rotationSpeed * timeStamp) / 10000;

	// Move stick figure
	if (this.state.leftPressed && this.stick.pos >= -10.0) {
	    this.stick.pos -= 0.2;
	} else if (this.state.rightPressed && this.stick.pos <= 8.0) {
	    this.stick.pos += 0.2;
	}
	this.stick.update ();
    }
}

export default SeedScene;
