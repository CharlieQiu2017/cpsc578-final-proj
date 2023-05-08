import * as THREE from 'three';
import * as CANNON from 'cannon-es';


class Shard extends THREE.Mesh {
    constructor(material = undefined, verts, index, pos, v0) {

        // Sphere material and geometry
        // const normalMaterial = new THREE.MeshNormalMaterial();
        const normalMaterial = new THREE.MeshNormalMaterial();
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.setAttribute("position", new THREE.BufferAttribute( verts, 3 ));
        bufferGeometry.setIndex(index);
        bufferGeometry.computeVertexNormals();

        // Call parent Mesh() constructor
        super(bufferGeometry, normalMaterial);

        this.name = 'shard';

        // Default position for the sphere
        // this.position.copy(pos)

        // Define the shape and physical properties of the sphere
        const index2 = [];
        const verts2 = [];
        for (var i = 0; i < 4; i ++) {
            index2.push([index[3 * i], index[3 * i + 1], index[3 * i + 2]]);
            verts2.push(new CANNON.Vec3(verts[3 * i] + pos.x, verts[3 * i + 1] + pos.y, verts[3 * i + 2] + pos.z));
        };


        const shardShape = new CANNON.ConvexPolyhedron(verts2, index2);
        this.body = new CANNON.Body({ mass: 1 });
        this.body.addShape(shardShape);
        this.body.velocity = v0;
        shardShape.vertices = verts2;

        // console.log(this.body.position);
        // Update the position of the physical shape to be the same as
        // that of the mesh
        var centroid = new CANNON.Vec3(0.0, 0.0, 0.0);
        centroid = centroid.vadd(verts2[0]);
        centroid = centroid.vadd(verts2[1]);
        centroid = centroid.vadd(verts2[2]);
        centroid = centroid.vadd(verts2[3]);
        centroid = centroid.scale(1/ 4);
        this.body.position.copy(centroid);
        // console.log(this.body.position);
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