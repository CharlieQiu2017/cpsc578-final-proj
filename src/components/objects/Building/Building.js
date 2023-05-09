import * as THREE from 'three';

class Building extends THREE.Mesh {
    constructor(width = 7, height = 20, pos = new THREE.Vector3(0, 0, 0), size = 1) {

        // Cube material and geometry
        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0x000015, 
            flatShading: true,
            transparent: true,
            opacity: 0.5
        });
        const rectangleGeometry = new THREE.PlaneGeometry(width, height);

        // Call parent Mesh() constructor
        super(rectangleGeometry, phongMaterial);

        this.name = 'building';
        this.receiveShadow = true;
        this.castShadow = true;

        // Default position for the cube
        this.position.x = pos.x;
        this.position.y = pos.y;
        this.position.z = pos.z;
    }
    
    /**
     * Set position of the object. Use this instead of accessing this.position
     * directly since the Cannon.js body position also needs updating.
     * @param {THREE.Vector3} vec
     */
    setPosition(vec) {
        this.position.copy(vec);
    }
}

export default Building;