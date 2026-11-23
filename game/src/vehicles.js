import * as THREE from './three.module.js';

/**
 * Solis City: Coral Coast - Vehicles & Traffic Management
 * Veloce GTS Supercar player vehicle, CPD pursuit interceptors, and civilian traffic.
 */

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.playerVehicle = null;

    this.buildPlayerSupercar();
    this.spawnCivilianTraffic();
  }

  buildPlayerSupercar() {
    const carGroup = new THREE.Group();

    // Veloce GTS Supercar Chassis (Low-slung, aerodynamic, exotic Italian styling)
    const bodyGeo = new THREE.BoxGeometry(2.2, 0.72, 4.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff, // Electric Cyan metallic finish
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    carGroup.add(body);

    // Aerodynamic tapered cockpit canopy
    const canopyGeo = new THREE.BoxGeometry(1.8, 0.62, 2.4);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x050a12,
      metalness: 0.95,
      roughness: 0.05,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 1.05, -0.2);
    carGroup.add(canopy);

    // Carbon fiber rear wing spoiler
    const wingGeo = new THREE.BoxGeometry(2.3, 0.08, 0.55);
    const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 1.25, -2.15);
    carGroup.add(wing);

    // Spoiler upright struts
    const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.15), carbonMat);
    strutL.position.set(-0.7, 1.0, -2.15);
    const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.15), carbonMat);
    strutR.position.set(0.7, 1.0, -2.15);
    carGroup.add(strutL, strutR);

    // Glowing LED Headlights
    const headlampMat = new THREE.MeshStandardMaterial({
      color: 0xf0faff,
      emissive: 0xd0f0ff,
      emissiveIntensity: 4.0,
    });
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.1), headlampMat);
    headL.position.set(-0.75, 0.6, 2.38);
    const headR = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.1), headlampMat);
    headR.position.set(0.75, 0.6, 2.38);
    carGroup.add(headL, headR);

    // Forward beam spot / point light
    const headBeam = new THREE.PointLight(0xe0f7ff, 3.5, 30);
    headBeam.position.set(0, 0.7, 2.6);
    carGroup.add(headBeam);

    // Neon Ruby Taillight Lightbar
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0xff0033,
      emissive: 0xff0022,
      emissiveIntensity: 4.5,
    });
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), tailMat);
    tailBar.position.set(0, 0.7, -2.39);
    carGroup.add(tailBar);

    // 4 High performance sport wheels
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.36, 20);
    wheelGeo.rotateZ(Math.PI / 2);

    const rimMat = new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.95, roughness: 0.2 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.9 });

    const wheelOffsets = [
      [-1.08, 0.44, 1.4],
      [1.08, 0.44, 1.4],
      [-1.08, 0.44, -1.4],
      [1.08, 0.44, -1.4],
    ];

    wheelOffsets.forEach(([x, y, z], idx) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(wheelGeo, tireMat);
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.37, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      carGroup.add(wGroup);
      wheels.push({ mesh: wGroup, isFront: idx < 2 });
    });

    carGroup.position.set(240, 0, 0); // Ocean Drive spawn position
    this.scene.add(carGroup);

    this.playerVehicle = {
      mesh: carGroup,
      wheels,
      speed: 0,
      maxSpeed: 48, // ~107 mph
      acceleration: 24,
      braking: 35,
      reverseSpeed: -14,
      turnSpeed: 2.2,
      steerAngle: 0,
      active: true,

      updatePhysics: (dt, throttle, brake, steer, handbrake) => {
        // Accelerate & brake
        if (throttle > 0) {
          this.playerVehicle.speed = Math.min(this.playerVehicle.maxSpeed, this.playerVehicle.speed + this.playerVehicle.acceleration * dt);
        } else if (brake > 0) {
          if (this.playerVehicle.speed > 0.5) {
            this.playerVehicle.speed = Math.max(0, this.playerVehicle.speed - this.playerVehicle.braking * dt);
          } else {
            this.playerVehicle.speed = Math.max(this.playerVehicle.reverseSpeed, this.playerVehicle.speed - this.playerVehicle.acceleration * 0.6 * dt);
          }
        } else {
          // Natural coasting friction
          this.playerVehicle.speed *= (1.0 - 0.7 * dt);
        }

        if (handbrake) {
          this.playerVehicle.speed *= (1.0 - 2.5 * dt);
        }

        // Steer angle
        const targetSteer = steer * 0.45;
        this.playerVehicle.steerAngle += (targetSteer - this.playerVehicle.steerAngle) * Math.min(1.0, dt * 10);

        // Turn vehicle
        if (Math.abs(this.playerVehicle.speed) > 0.2) {
          const turnDir = this.playerVehicle.speed > 0 ? 1 : -1;
          carGroup.rotation.y += this.playerVehicle.steerAngle * this.playerVehicle.turnSpeed * turnDir * dt;
        }

        // Move vehicle forward along yaw
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), carGroup.rotation.y);
        carGroup.position.addScaledVector(forward, this.playerVehicle.speed * dt);

        // Rotate wheels
        const wheelRoll = (this.playerVehicle.speed * dt) / 0.44;
        wheels.forEach(w => {
          w.mesh.rotation.x += wheelRoll;
          if (w.isFront) {
            w.mesh.rotation.y = this.playerVehicle.steerAngle;
          }
        });
      },
    };

    this.vehicles.push(this.playerVehicle);
  }

  spawnCivilianTraffic() {
    // Civilian cruisers and sports coupes roaming the city avenues
    const colors = [0xff0044, 0xf0f0f0, 0x111111, 0xffbb00, 0x2255ff, 0x5500aa];
    const trafficCount = 18;

    for (let i = 0; i < trafficCount; i++) {
      const car = new THREE.Group();
      const col = colors[i % colors.length];

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.8, 4.4),
        new THREE.MeshStandardMaterial({ color: col, metalness: 0.7, roughness: 0.3 })
      );
      body.position.y = 0.55;
      car.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.65, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x0a1018, metalness: 0.9, roughness: 0.1 })
      );
      cabin.position.set(0, 1.15, -0.1);
      car.add(cabin);

      // Random road placement along grid
      const avenues = [-180, -90, 0, 90, 180, 240];
      const roadX = avenues[i % avenues.length] + (i % 2 === 0 ? 3.5 : -3.5);
      const roadZ = (i * 45) - 300;

      car.position.set(roadX, 0, roadZ);
      car.rotation.y = (i % 2 === 0) ? 0 : Math.PI;

      this.scene.add(car);

      this.vehicles.push({
        mesh: car,
        speed: 12 + Math.random() * 8,
        direction: (i % 2 === 0) ? 1 : -1,
        active: false,
      });
    }
  }

  update(dt) {
    // Update ambient civilian traffic
    this.vehicles.forEach(v => {
      if (v === this.playerVehicle) return;
      // Drive forward along road
      v.mesh.position.z += v.speed * v.direction * dt;

      // Wrap around grid boundaries
      if (v.mesh.position.z > 350) v.mesh.position.z = -350;
      if (v.mesh.position.z < -350) v.mesh.position.z = 350;
    });
  }
}
