import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Sphere extends THREE.Mesh {
    constructor(material = undefined, pos = new THREE.Vector3(-2, 20, 0)) {

        // Sphere material and geometry
        const normalMaterial = new THREE.MeshNormalMaterial();
        const sphereGeometry = new THREE.SphereGeometry();

        // Call parent Mesh() constructor
        super(sphereGeometry, normalMaterial);

        this.name = 'sphere';

        // Default position for the sphere
        this.position.copy(pos)

        // Define the shape and physical properties of the sphere
        const sphereShape = new CANNON.Sphere(1);
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(sphereShape);

        // Update the position of the physical shape to be the same as
        // that of the mesh
        this.body.position.x = this.position.x;
        this.body.position.y = this.position.y;
        this.body.position.z = this.position.z;
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

export default Sphere;