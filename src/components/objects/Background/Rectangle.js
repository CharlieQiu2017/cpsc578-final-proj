import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class Rectangle extends THREE.Mesh {
    constructor() {

        // Cube material and geometry
        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0xB7410E, //0xC08955,
            flatShading: true,
        });
        const rectangleGeometry = new THREE.BoxGeometry(250, 80, 10, 20, 10, 5);
        rectangleGeometry.mergeVertices();

        var randomFloorVertexPos;

        rectangleGeometry.vertices.forEach(function(floorVertex){
            randomFloorVertexPos = Math.floor(Math.random() * ((0) - 
            (-90)) + (-90));

            // if (floorVertex.y > -16 && floorVertex.y < 16) {
                floorVertex.z = randomFloorVertexPos;
                rectangleGeometry.verticesNeedUpdate = true;
            // }

        });

        // Call parent Mesh() constructor
        super(rectangleGeometry, phongMaterial);

        this.name = 'rectangle';
        this.receiveShadow = true;
        this.castShadow = true;

        // Default position for the cube
        this.position.x = 0
        this.position.y = 7
        this.position.z = -25
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

export default Rectangle;