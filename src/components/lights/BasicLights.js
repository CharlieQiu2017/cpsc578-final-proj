import { Group, SpotLight, AmbientLight, HemisphereLight, DirectionalLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x404040, 1.32);
        const hemi = new HemisphereLight(0xffffbb, 0x080820, 1);
        const sun = new DirectionalLight(0xffffff, 1)
        sun.castShadow = true;
        sun.position.set(0, 50, 0);
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -20;

        dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);

        // this.add(ambi, hemi, dir, sun);
        // this.add(ambi);
        this.add(hemi);
        // this.add(dir);
        this.add(sun);
    }
}

export default BasicLights;
