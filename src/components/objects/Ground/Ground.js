import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Ground extends THREE.Mesh {
    constructor(material = undefined) {

        // Sphere material and geometry
        const planeGeometry = new THREE.PlaneGeometry(40, 40);
        const normalMaterial = new THREE.MeshNormalMaterial();
        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0x3E3117, //soil: https://www.color-hex.com/color-palette/15769
            flatShading: true,
        });

        // Call parent Mesh() constructor
        super(planeGeometry, phongMaterial);

        this.name = 'ground';

        // Default position and orientation for the plane
        this.rotateX(-Math.PI / 2);
        this.position.x = 0;
        this.position.y = -10;

        // Define the shape and physical properties of the plane
        const planeShape = new CANNON.Plane()
        this.body = new CANNON.Body({ mass: 0, material: material })
        this.body.addShape(planeShape)
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

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

export default Ground;