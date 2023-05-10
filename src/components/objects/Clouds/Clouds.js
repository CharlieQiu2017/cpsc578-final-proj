import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import text from './Untitled.png';

class Clouds extends THREE.Mesh {
    constructor(altitude) {

        // Sphere material and geometry
        const planeGeometry = new THREE.PlaneGeometry(100, 10);
        const texture = new THREE.TextureLoader().load(text);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10,1);

        const TextureMaterial = new THREE.MeshPhongMaterial({
            transparent: true,
            map: texture
        });

        // Call parent Mesh() constructor
        super(planeGeometry, TextureMaterial);

        this.name = 'clouds';

        // Default position for the sphere
        console.log(altitude);
        this.position.copy(new THREE.Vector3(0, altitude, 20));
    }

    update(){
        this.material.map.offset.x += 0.001;

    }
}

export default Clouds;