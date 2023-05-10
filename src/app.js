/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SeedScene } from 'scenes';

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;

// Set up camera
// camera.position.set(0, 30, 50);
camera.position.set(0, 20, 80);
camera.lookAt(new Vector3(0, 0, 0));

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = false;
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 50;
controls.update();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    controls.update();
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

window.addEventListener("keydown", event => {
    if (event.key == "ArrowLeft") {
        scene.state.leftPressed = true;
        scene.state.rightPressed = false;
    } else if (event.key == "ArrowRight") {
        scene.state.rightPressed = true;
        scene.state.leftPressed = false;
    } else if (event.key == "ArrowUp") {
        scene.state.upPressed = true;
        scene.state.downPressed = false;
    } else if (event.key == "ArrowDown") {
        scene.state.downPressed = true;
        scene.state.upPressed = false;
    }
});

window.addEventListener("keyup", event => {
    if (event.key == "ArrowLeft") {
	    scene.state.leftPressed = false;
    } else if (event.key == "ArrowRight") {
	    scene.state.rightPressed = false;
    } else if (event.key == "ArrowUp") {
        scene.state.upPressed = false;
    } else if (event.key == "ArrowDown") {
        scene.state.downPressed = false;
    }
});
