import * as THREE from 'three';
import * as CANNON from 'cannon-es';


class Shard extends THREE.Mesh {
    constructor(material = undefined, verts, faces, v0) {

        // Get shard verts for THREE.js mesh
        var shardVerts = [];
        verts.forEach((vert) => {shardVerts.push([vert.x, vert.y, vert.z])});
        shardVerts = shardVerts.flat();

        // Sphere material and geometry
        const normalMaterial = new THREE.MeshNormalMaterial();
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute("position", new THREE.BufferAttribute( new Float32Array(shardVerts), 3 ));
        bufferGeometry.setIndex(faces.flat());
        bufferGeometry.computeVertexNormals();

        // Call parent Mesh() constructor
        super(bufferGeometry, normalMaterial);

        this.name = 'shard';

        const shardShape = new CANNON.Trimesh(shardVerts, faces.flat());
        this.body = new CANNON.Body({ mass: 1/12 });
        this.body.addShape(shardShape);
        this.body.velocity = new CANNON.Vec3(v0.x * 5, v0.y * 5, v0.z * 5);
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

}

export default Shard;