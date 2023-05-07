import { Mesh, Vector3 } from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './Stick.gltf';

class Stick extends Mesh {

    /**
     * Constructor for Stick object with position and material arguments
     * */
    constructor(material = undefined, pos = new Vector3(0, 10, 5)) {
        // Call parent Mesh() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'stick';
        this.pos = 0.0;
        this.model = undefined;

        loader.load(MODEL, (gltf) => {
            this.model = gltf.scene.children[0];
            console.log(this.model.geometry);
            this.model.scale.set(1, 1, 1);
            this.add(this.model);
        });

        // Define simple physics model for the stick figure
        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 2.5, 0.5)),
            velocity: new CANNON.Vec3(10, 0, 0),
            material: material
        })
        this.position.copy(pos);
        this.body.position.copy(this.position);
    }

    /**
     * Set position of the object. Use this instead of accessing this.position
     * directly since the Cannon.js body position also needs updating.
     * @param {THREE.Vector3} vec
     */
     setPosition(vec) {
        this.position.copy(vec);
        this.body.position.copy(vec);
    }

    /**
     * Function for updating the displayed position of the object mesh to
     * the physical position calculated by the physics engine.
    */
    updatePosition() {
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);
    }

    // update() { if (this.model != undefined) this.model.position.x = this.pos; }
}

export default Stick;
