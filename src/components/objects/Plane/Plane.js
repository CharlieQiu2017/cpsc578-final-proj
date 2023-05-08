import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import texture from './rockysoil.jpg';

class Plane extends THREE.Mesh {
    constructor(width = 140, height = 70, color = 0x1B1915/*0x060F01*/) {

        // Sphere material and geometry
        const planeGeometry = new THREE.PlaneGeometry(width, height);

        const loader = new THREE.TextureLoader();
        const meshTexture = loader.load(texture, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            // const material = new THREE.MeshBasicMaterial({
            //   map: texture,
            // });
        });

        const phongMaterial = new THREE.MeshPhongMaterial({
            color: color, //soil: https://www.color-hex.com/color-palette/15769
            flatShading: true,
            map: meshTexture
        });
        // Call parent Mesh() constructor
        super(planeGeometry, phongMaterial);

        // const phongMaterial = new THREE.MeshPhongMaterial({
        //     color: color, //soil: https://www.color-hex.com/color-palette/15769
        //     flatShading: true,
        // });
        // // Call parent Mesh() constructor
        // super(planeGeometry, phongMaterial);

        this.name = 'plane';

        // Default position and orientation for the plane
        this.rotateX(-Math.PI / 2);
        this.position.x = 0;
        this.position.y = -12;

        // Show shadows cast onto ground
        this.receiveShadow = true;
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

export default Plane;