import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './Stick.gltf';

class Stick extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'stick';
	this.pos = 0.0;
	this.model = undefined;

        loader.load(MODEL, (gltf) => {
	    this.model = gltf;
	    this.model.scene.scale.set (3,3,3);
            this.add(this.model.scene);
        });
    }

    update() { if (this.model != undefined) this.model.scene.position.x = this.pos; }
}

export default Stick;
