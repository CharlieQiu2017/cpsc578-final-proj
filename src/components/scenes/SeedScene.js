import * as Dat from 'dat.gui';
import { Scene, Color, Vector3, MeshPhongMaterial, PlaneGeometry, Mesh, Fog, PolyhedronGeometry, SpotLight, GridHelper } from 'three';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Stick } from 'objects';
import { BasicLights } from 'lights';
import Cube from '../objects/Cube/Cube';
import Ground from '../objects/Ground/Ground';
import Shard from '../objects/Shard/Shard';
import Clouds from '../objects/Clouds/Clouds';
import Rectangle from '../objects/Background/Rectangle';
import Plane from '../objects/Plane/Plane';
// import createBuilding from '../objects/Building/Building';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        this.currentTime = 0; // Track passage of time

        // Values for random generation
        this.playableArea = {
            minX: -20,
            maxX: 20,
            minZ: -20,
            maxZ: 20, 
        }
        this.cubeSizes = {
            min: 2,
            max: 10
        }
        this.generateHeight = 15;
        this.lastGenerateTime = 0;
        this.generateDelay = 5000; // In ms.
        this.generatedObjects = new Set();

        // Collision timings
        this.destructionDelay = 2000; // How long before object disappears after hitting ground
        this.invulnerableDelay = 500; // How long the player remains invulnerable
                                        // after being hit with an object
        this.lastStickCollisionTime = 0;

        // Init state
        this.defaultLives = 5;
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            updateList: [],
            leftPressed: false,
            rightPressed: false,
            upPressed: false,
            downPressed: false,
            isPaused: true,
            ShatterAnimation: false,
            Score: 0,
            Lives: this.defaultLives
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee); //sky = 0x87CEEB

        // Initialize the world for the physics engine
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        });

        // Set friction between stick figure and ground to allow
        // for keyboard control
        const groundMaterial = new CANNON.Material();
        const stickMaterial = new CANNON.Material();
        const stickGroundContact = new CANNON.ContactMaterial(
            groundMaterial, stickMaterial, {friction: 0.0, restitution: 0.2});
        this.world.addContactMaterial(stickGroundContact);

        // Add objects to scene
        const lights = new BasicLights();
        this.add(lights);

        // spot light
        // const moonlight = new SpotLight(0xffffff, 4, 10, 1, 0.3, 0);
        // moonlight.position.set(0, 20, 3);
        // moonlight.target.position.set(0,0,3);
        // this.add(moonlight);

        // Add stick figure
        this.stick = new Stick(stickMaterial);
        this.add(this.stick);
        this.world.addBody(this.stick.body);

        // Add clouds
        this.clouds = new Clouds(10);
        this.add(this.clouds);

        // Add plane under ground
        this.underground = new Plane();
        this.add(this.underground);
        
        // Add ground
        this.ground = new Ground(groundMaterial);
        this.add(this.ground);
        this.world.addBody(this.ground.body);

        // fog
        const color = 0x2F4F4F;  // white
        const near = 0;
        const far = 200;
        this.fog = new Fog(color, near, far);

        // Add world boundaries
        const boundaryAngles = [Math.PI / 2, -Math.PI / 2, 0, Math.PI];
        const boundaryDist = [
            new Vector3(this.playableArea.minX, 0, 0), new Vector3(this.playableArea.maxX, 0, 0),
            new Vector3(0, 0, this.playableArea.minZ), new Vector3(0, 0, this.playableArea.maxZ)];
        for (let i = 0; i < boundaryAngles.length; i++) {
            const planeShape = new CANNON.Plane();
            const planeBody = new CANNON.Body({ mass: 0, material: groundMaterial});
            planeBody.addShape(planeShape);
            planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), boundaryAngles[i]);
            planeBody.position.copy(boundaryDist[i]);
            this.world.addBody(planeBody);
        }

        // Add background
        this.background = new Rectangle();
        this.add(this.background);

        // Add buildings
        this.building1 = new createBuilding(7, 14, new Vector3(35, -7, -10));
        this.add(this.building1);
        this.building2 = new createBuilding(7, 9, new Vector3(27, -7, -10));
        this.add(this.building2);
        this.building3 = new createBuilding(7, 6, new Vector3(-47, -7, -10));
        this.add(this.building3);
        this.building4 = new createBuilding(7, 15, new Vector3(-39, -7, -10));
        this.add(this.building4);
        this.building5 = new createBuilding(5, 10, new Vector3(-25, -7, -10));
        this.add(this.building5);
        this.building6 = new createBuilding(8, 10, new Vector3(45, -7, -10));
        this.add(this.building6);
        this.building7 = new createBuilding(8, 10, new Vector3(-54, -7, -10));
        this.add(this.building7);

        // Configure GUI
        this.groundTexture = true;
        const buttons = ["Start", "Pause", "Reset", "ToggleGroundTexture"];
        const apiMenu = {
            Start: () => {this.state.isPaused = false;},
            Pause: () => {this.state.isPaused = true;},
            Reset: () => {this.resetScene()},
            ToggleGroundTexture: () => {
                this.groundTexture = !this.groundTexture;
                this.remove(this.underground);
                this.underground = new Plane(this.groundTexture);
                this.add(this.underground);
            }
        };
        const menu = this.state.gui.addFolder("Menu");
        buttons.forEach((button) => menu.add(apiMenu, button));
        menu.add(this.state, "ShatterAnimation");
        menu.open();
        this.state.gui.add(this.state, 'Score');
        this.state.gui.add(this.state, 'Lives');
    }

    // Generate random falling object
    generateObj() {
        const size = this.cubeSizes.min + (this.cubeSizes.max - this.cubeSizes.min) * Math.random();
        const cubeX =
            Math.random() * (this.playableArea.maxX - this.playableArea.minX - size) + this.playableArea.minX + size;
        const cubeZ =
            Math.random() * (this.playableArea.maxZ - this.playableArea.minZ - size) + this.playableArea.minZ + size;
        const newCube = new Cube(this.stickMaterial, new Vector3(cubeX, this.generateHeight, cubeZ),
                                this.cubeSizes.min + (this.cubeSizes.max - this.cubeSizes.min) * Math.random(),
                                1, Math.random() * 30);

        // Add some extra properties for the object
        newCube.body.hasCollidedWithGround = false;
        newCube.body.destructionTime = undefined;
        newCube.body.meshReference = newCube; // Reference to the cube mesh

        // Attach collision event listener
        newCube.body.addEventListener("collide", (collisionEvent) => {
            // If collision is with player
            if (collisionEvent.body === this.stick.body) {
                if (this.currentTime - this.lastStickCollisionTime >= this.invulnerableDelay) {
                    this.state.Score += 1;
                    this.lastStickCollisionTime = this.currentTime;

                    if (this.state.ShatterAnimation)
                        this.shatterCube(collisionEvent.target.meshReference);
                    else this.explodeCube(collisionEvent.target.meshReference);
                }
            }

            // If collision is with ground
            if (collisionEvent.body === this.ground.body) {
                if (!collisionEvent.target.hasCollidedWithGround) {
                    this.state.Lives -= 1;
                    collisionEvent.target.hasCollidedWithGround = true;
                    collisionEvent.target.destructionTime = this.currentTime;

                    if (this.state.ShatterAnimation)
                        this.shatterCube(collisionEvent.target.meshReference);
                    else this.explodeCube(collisionEvent.target.meshReference);
                }
            }
        });

        // Add to scene and physics world
        this.add(newCube);
        this.world.addBody(newCube.body);

        // Remember the new object
        this.generatedObjects.add(newCube);
    }

    // Explode the cube into multiple smaller cubes
    explodeCube(cube) {

        // Destroy cube
        cube.body.hasCollidedWithGround = true;
        cube.body.destructionTime = this.currentTime;

        // Generate 10 smaller cubes
        for (let i = 0; i < 10; ++i) {

            // Assign random position for smaller cube
            let pos = cube.body.position.clone();
            pos.x += Math.random();
            pos.y += Math.random();
            pos.z += Math.random();

            // Initialize small cube
            const splashCube = new Cube(undefined, pos, 1);
            this.add(splashCube);
            this.world.addBody(splashCube.body);
            this.generatedObjects.add(splashCube);

            // Set timer for destruction
            splashCube.body.hasCollidedWithGround = true;
            splashCube.body.destructionTime = this.currentTime + this.destructionDelay;
        }
    }

    // Break cube into more realistic looking shards
    shatterCube(cube) {

        // Position and vertices of cube
        const pos = cube.position;
        const verts = cube.geometry.vertices;

        // Get face indices, same for all shards
        const shardFaces = [
            [1, 2, 3],
            [1, 0, 2],
            [2, 0, 3],
            [3, 0, 1]];

        // Generate a shard for each triangular face of the cube
        cube.geometry.faces.forEach((face) => {

            // Get vertices
            const shardVerts = [pos,
                (new Vector3()).addVectors(verts[face.a], pos),
                (new Vector3()).addVectors(verts[face.b], pos),
                (new Vector3()).addVectors(verts[face.c], pos)];

            // Initialize shard
            const shard = new Shard(undefined, shardVerts, shardFaces, face.normal);
            this.add(shard);
            this.world.addBody(shard.body);
            this.generatedObjects.add(shard);
            shard.body.hasCollidedWithGround = true;
            shard.body.destructionTime = this.currentTime + this.destructionDelay;
        })
    }

    checkAndDestroyObj() {
        const newGenObjects = new Set();
        this.generatedObjects.forEach((obj) => {
            if (obj.body.hasCollidedWithGround && obj.body.destructionTime <= this.currentTime) {
                this.world.removeBody(obj.body);
                this.remove(obj);
            } else {
                newGenObjects.add(obj);
            }
        })
        this.generatedObjects = newGenObjects;
    }

    resetScene() {
        // Remove all randomly generated objects
        this.generatedObjects.forEach((obj) => {
            this.world.removeBody(obj.body);
            this.remove(obj);
        })
        this.generatedObjects = new Set();

        // Reset stick figure
        this.stick.setPosition(new Vector3(0, 10, 0));

        // Reset score and lives
        this.state.Score = 0;
        this.state.Lives = this.defaultLives;
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        // const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        this.currentTime = timeStamp;
        this.generateDelay = Math.max(3000 - 0.06 * this.currentTime, 1000);

        // Update GUI
        for (var i in this.state.gui.__controllers) {
            this.state.gui.__controllers[i].updateDisplay();
        }

        // Pause the game if out of lives
        if (this.state.Lives <= 0) this.state.isPaused = true;

        // Skip the rest if the game is paused
        if (this.state.isPaused) return;

        // Generate random object
        if (timeStamp - this.lastGenerateTime >= this.generateDelay) {
            this.lastGenerateTime = timeStamp;
            this.generateObj();
        }

        // Physics
        this.world.fixedStep();
        this.stick.updatePosition();
        this.generatedObjects.forEach((obj) => obj.updatePosition());

        // Destroy any object that needs to be
        this.checkAndDestroyObj();

        // Move clouds
        this.clouds.update();

        // Move stick figure
        const movementInc = 0.5;

        // Left and right movement
        if (this.state.leftPressed) {
            this.stick.body.velocity.x -= movementInc;
        } else if (this.state.rightPressed) {
            this.stick.body.velocity.x += movementInc;
        } else if (Math.abs(this.stick.body.velocity.x) < movementInc) {
            this.stick.body.velocity.x = 0;
        } else if (this.stick.body.velocity.x > 0) {
            this.stick.body.velocity.x -= movementInc;
        } else {
            this.stick.body.velocity.x += movementInc
        }

        // Up and down movement
        if (this.state.upPressed) {
            this.stick.body.velocity.z -= movementInc;
        } else if (this.state.downPressed) {
            this.stick.body.velocity.z += movementInc;
        } else if (Math.abs(this.stick.body.velocity.z) < movementInc) {
            this.stick.body.velocity.z = 0;
        } else if (this.stick.body.velocity.z > 0) {
            this.stick.body.velocity.z -= movementInc;
        } else {
            this.stick.body.velocity.z += movementInc
        }
    }
}

function createBuilding(width = 7, height = 20, pos = new THREE.Vector3(0, 0, 0)) {
    const building = new THREE.Group();

    // Cube material and geometry
    const phongMaterialDarkBlue = new THREE.MeshBasicMaterial({
        color: 0x000015,
        flatShading: true,
        transparent: true,
        opacity: 0.5
    });

    for(var i = 0; i < width; i++) {
        for(var j = 0; j < height; j++) {
            let color;
            if (i % 2 == 0 && j % 2 == 0) {
                color = new THREE.MeshPhongMaterial({
                    color: 0x16DBFF,
                    flatShading: true,
                    shininess: 150,
                    transparent: true,
                    opacity: Math.random()
                });
            } else {
                color = new THREE.MeshBasicMaterial({
                    color: 0x000015,
                    flatShading: true,
                    transparent: true,
                    opacity: Math.random() * 0.3
                });
            }

            const rectangle = new THREE.Mesh(
                new THREE.PlaneGeometry(1,2),
                color
            )
            
            rectangle.position.x = i;
            rectangle.position.y = j*2;

            building.add(rectangle);
        }
    }
    building.position.x = pos.x;
    building.position.y = pos.y;
    building.position.z = pos.z;

    return building;
}

export default SeedScene;
