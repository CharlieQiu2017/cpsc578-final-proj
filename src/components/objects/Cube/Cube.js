import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Cube extends THREE.Mesh {
    constructor(material = undefined, pos = new THREE.Vector3(4, 15, 5), size = 4, mass = 1, yvelocity = 0) {

        // Cube material and geometry
        const normalMaterial = new THREE.MeshNormalMaterial();
        const cubeGeometry = new THREE.BoxGeometry(size, size, size);

        // Call parent Mesh() constructor
        super(cubeGeometry, normalMaterial);

        this.name = 'cube';

        // Default position for the cube
        this.position.copy(pos);

        // Define the shape and physical properties of the cube
        const cubeShape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
        this.body = new CANNON.Body({ mass: mass });
        this.body.velocity.y += yvelocity;
        this.body.addShape(cubeShape);

        // Update the position of the physical shape to be the same as
        // that of the mesh
        this.body.position.x = this.position.x;
        this.body.position.y = this.position.y;
        this.body.position.z = this.position.z;

        // Make cube cast shadow
        this.castShadow = true;
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

}

export default Cube;
