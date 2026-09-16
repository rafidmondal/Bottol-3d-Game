import * as THREE from 'three';
import { FlipFeedback, FlipLandingOutcome, AiDifficulty, LevelConfig, ObstacleType, TargetObstacle } from '../types';
import { audio } from '../services/audio';

export interface RigidBottleState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  isGrounded: boolean;
  isInFlight: boolean;
  hasSettled: boolean;
  totalRotationPitch: number;
  bouncesCount: number;
  flightTime: number;
  settleTimer: number;
  startPosition: THREE.Vector3;
  initialThrowTime: number;
}

export class BottlePhysics {
  // Bottle physical specifications
  public readonly height = 0.46; // Total height (meters)
  public readonly radiusBase = 0.085; // Base radius
  public readonly radiusCap = 0.038; // Cap radius
  public readonly mass = 0.35; // kg (1/3 water filled)
  public readonly centerOfMassY = 0.14; // Low Center of Mass gives authentic bottom-heavy stability

  // Simulation state
  public state: RigidBottleState;
  public gravity = new THREE.Vector3(0, -9.2, 0);
  public wind = new THREE.Vector3(0, 0, 0);
  public sensitivityMultiplier = 1.0;

  // Table bounds
  public tableWidth = 1.9;
  public tableLength = 5.2;
  public tableTopY = 0;

  // Target & obstacles
  public obstacle: TargetObstacle | null = null;
  public targetCenter = new THREE.Vector3(0, 0, 1.8);
  public targetRadius = 0.8;

  // Slow motion replay support
  public slowmoFactor = 1.0;

  constructor() {
    this.state = this.createInitialState(new THREE.Vector3(0, this.centerOfMassY, 0));
  }

  public createInitialState(pos: THREE.Vector3): RigidBottleState {
    return {
      position: pos.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      quaternion: new THREE.Quaternion(),
      angularVelocity: new THREE.Vector3(0, 0, 0),
      isGrounded: true,
      isInFlight: false,
      hasSettled: true,
      totalRotationPitch: 0,
      bouncesCount: 0,
      flightTime: 0,
      settleTimer: 0,
      startPosition: pos.clone(),
      initialThrowTime: 0,
    };
  }

  public resetTo(pos: THREE.Vector3) {
    this.state = this.createInitialState(new THREE.Vector3(pos.x, this.centerOfMassY, pos.z));
    this.slowmoFactor = 1.0;
  }

  // Interactive Drag & Lift preview ("proper bottle tula")
  public previewDragLift(dragDx: number, dragDy: number) {
    if (this.state.isInFlight) return;
    const liftY = Math.min(Math.max(dragDy * 0.0035, 0), 0.40);
    const tiltPitch = -Math.min(Math.max(dragDy * 0.003, 0), 0.35);
    const steerX = Math.min(Math.max(dragDx * 0.002, -0.3), 0.3);

    this.state.position.set(
      this.state.startPosition.x + steerX,
      this.centerOfMassY + liftY,
      this.state.startPosition.z
    );
    this.state.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltPitch);
  }

  public cancelDragLift() {
    if (this.state.isInFlight) return;
    this.state.position.copy(this.state.startPosition);
    this.state.quaternion.identity();
  }

  public setObstacle(config: LevelConfig | null) {
    if (!config || config.obstacleType === 'none' || !config.obstacleType) {
      this.obstacle = null;
      this.targetCenter.set(0, 0, config ? config.targetDistance : 1.8);
      this.targetRadius = config ? config.targetRadius : 0.8;
      this.wind.set(config?.wind || 0, 0, 0);
      return;
    }

    this.wind.set(config.wind || 0, 0, 0);
    this.targetRadius = config.targetRadius;
    this.targetCenter.set(0, config.targetHeight, config.targetDistance);

    this.obstacle = {
      type: config.obstacleType,
      position: new THREE.Vector3(0, config.targetHeight * 0.5, config.targetDistance),
      size: new THREE.Vector3(
        config.targetRadius * 2,
        config.targetHeight,
        config.targetRadius * 2
      ),
      radius: config.targetRadius,
      movingSpeed: config.movingSpeed || 0,
      movingDistance: config.movingDistance || 0,
      initialX: 0,
    };
  }

  // Calculate launch velocity & spin directly from swipe parameters ("joto tuku sweep oto bottol omon hobe")
  public calculateLaunchParams(
    dragDx: number,
    dragDy: number,
    swipeDurationMs: number
  ) {
    const duration = Math.min(Math.max(swipeDurationMs, 45), 320);
    const effectiveDy = Math.max(dragDy, 18);
    const flickSpeed = effectiveDy / duration; // Typically 0.2 to 2.4 px/ms

    // Swipe power combines drag distance and release flick speed
    const swipePower = (effectiveDy * 0.008 + flickSpeed * 0.72) * this.sensitivityMultiplier;
    const clampedPower = Math.min(Math.max(swipePower, 0.45), 2.4);

    // Upward launch impulse: weak swipe = small hop, normal flick = ~7.3 m/s, hard flick = high launch
    const upwardImpulse = 4.4 + clampedPower * 2.9;

    // Forward impulse: allows clean flips across table, onto stools, and over long distances
    const forwardImpulse = 0.95 + clampedPower * 0.75;

    // Lateral impulse and roll from crooked or tilted swipe
    const sideImpulse = Math.min(Math.max((dragDx / duration) * 0.65, -1.8), 1.8) * this.sensitivityMultiplier;
    const rollSpin = Math.min(Math.max((-dragDx / duration) * 0.35, -2.5), 2.5) * this.sensitivityMultiplier;

    // Pitch spin rate (rad/s) directly determined by flick intensity:
    // Sweet spot (~power 1.0) achieves ~4.0 rad/s over ~1.6s flight = 360 degrees
    // Weak flick under-spins (< 300 deg, lands on side or head)
    // Strong flick over-spins (> 500 deg, bounces and topples)
    const spinRate = (1.9 + clampedPower * 2.1) * (1.0 + (Math.random() - 0.5) * 0.04);

    return {
      velocity: new THREE.Vector3(sideImpulse, upwardImpulse, forwardImpulse),
      angularVelocity: new THREE.Vector3(spinRate, (Math.random() - 0.5) * 0.04, rollSpin),
      speed: clampedPower,
    };
  }

  // Generate trajectory aiming arc points for UX visualization
  public getTrajectoryPoints(
    dragDx: number,
    dragDy: number,
    durationMs: number,
    steps = 14
  ): THREE.Vector3[] {
    const { velocity } = this.calculateLaunchParams(dragDx, dragDy, durationMs);
    const points: THREE.Vector3[] = [];
    const simPos = this.state.position.clone();
    const simVel = velocity.clone();
    const dt = 0.04;

    for (let i = 0; i < steps; i++) {
      points.push(simPos.clone());
      simVel.addScaledVector(this.gravity, dt);
      simPos.addScaledVector(simVel, dt);
      if (simPos.y < 0) break;
    }
    return points;
  }

  // HUMAN THROW: Execute launch
  public throwWithSwipe(
    dragDx: number,
    dragDy: number,
    swipeDurationMs: number
  ) {
    if (this.state.isInFlight) return;

    const { velocity, angularVelocity, speed } = this.calculateLaunchParams(
      dragDx,
      dragDy,
      swipeDurationMs
    );

    // Reset quaternion to clean initial orientation before launch
    this.state.quaternion.identity();
    this.state.velocity.copy(velocity);
    this.state.angularVelocity.copy(angularVelocity);
    this.state.isInFlight = true;
    this.state.isGrounded = false;
    this.state.hasSettled = false;
    this.state.totalRotationPitch = 0;
    this.state.bouncesCount = 0;
    this.state.flightTime = 0;
    this.state.settleTimer = 0;
    this.state.initialThrowTime = performance.now();

    audio.playRelease();
    audio.playWhoosh(speed);
  }

  // AI THROW: Robot player automatically takes turn (no external API, 100% deterministic & fun)
  public throwWithAi(difficulty: AiDifficulty, targetPos: THREE.Vector3) {
    if (this.state.isInFlight) return;

    // Reset orientation
    this.state.quaternion.identity();
    this.state.position.set(0, this.centerOfMassY, 0);

    const distZ = Math.max(targetPos.z - this.state.position.z, 1.4);
    const targetY = targetPos.y;

    // Human-like win rate requested by user (around 1 in 3 or 1 in 4 like a real person):
    let successChance = 0.25; // Easy: ~1 in 4 (25%)
    if (difficulty === 'medium') successChance = 0.35; // Medium: ~1 in 3 (35%)
    else if (difficulty === 'hard') successChance = 0.50; // Hard: ~1 in 2 (50%)

    const willLandUpright = Math.random() < successChance;

    const flightTime = 1.45;
    const g = Math.abs(this.gravity.y);
    const vz = distZ / flightTime;
    const vy = (targetY - this.state.position.y + 0.5 * g * flightTime * flightTime) / flightTime;
    let vx = (Math.random() - 0.5) * 0.08;

    let spinRate = (2 * Math.PI) / flightTime;
    if (!willLandUpright) {
      // Natural human-like miss variations (under-spin, over-spin, or slight tilt drift)
      const missMode = Math.random();
      if (missMode < 0.45) {
        // Under-spin: ~280-315 degrees, hits base edge and flops
        spinRate *= 0.76 + Math.random() * 0.08;
      } else if (missMode < 0.85) {
        // Over-spin: ~410-440 degrees, hits cap/side and bounces
        spinRate *= 1.18 + Math.random() * 0.12;
      } else {
        // Lateral drift miss: slight side angle drift
        vx = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.25);
        spinRate *= 0.88;
      }
    } else {
      spinRate *= 0.998 + (Math.random() - 0.5) * 0.003;
    }

    this.state.velocity.set(vx, vy, vz);
    this.state.angularVelocity.set(spinRate, (Math.random() - 0.5) * 0.04, 0);
    this.state.isInFlight = true;
    this.state.isGrounded = false;
    this.state.hasSettled = false;
    this.state.totalRotationPitch = 0;
    this.state.bouncesCount = 0;
    this.state.flightTime = 0;
    this.state.settleTimer = 0;
    this.state.initialThrowTime = performance.now();

    audio.playRelease();
    audio.playWhoosh(1.2);
  }

  // Physics update step at ~60fps
  public update(rawDt: number): FlipFeedback | null {
    if (!this.state.isInFlight && this.state.hasSettled) {
      this.updateMovingObstacle(rawDt);
      return null;
    }

    const dt = Math.min(rawDt * this.slowmoFactor, 0.033);
    this.state.flightTime += dt;

    this.updateMovingObstacle(rawDt);

    // 1. Aerodynamic drag & forces
    const airDragLinear = 0.998;
    const airDragAngular = 0.9995;

    this.state.velocity.addScaledVector(this.gravity, dt);
    this.state.velocity.addScaledVector(this.wind, dt * 0.8);
    this.state.velocity.multiplyScalar(airDragLinear);
    this.state.angularVelocity.multiplyScalar(airDragAngular);

    // Track total rotation around pitch axis
    this.state.totalRotationPitch += Math.abs(this.state.angularVelocity.x) * dt;

    // 2. Linear integration
    this.state.position.addScaledVector(this.state.velocity, dt);

    // 3. Angular integration using quaternion
    const omega = this.state.angularVelocity;
    const deltaRot = new THREE.Quaternion(
      omega.x * dt * 0.5,
      omega.y * dt * 0.5,
      omega.z * dt * 0.5,
      1.0
    ).normalize();
    this.state.quaternion.multiplyQuaternions(deltaRot, this.state.quaternion);
    this.state.quaternion.normalize();

    // 4. Contact & Collision Evaluation
    // Check horizontal collision with obstacle body (stool/books/box)
    if (this.obstacle && this.obstacle.radius && this.obstacle.size.y > 0.08) {
      const dx = this.state.position.x - this.obstacle.position.x;
      const dz = this.state.position.z - this.obstacle.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const obsTop = this.obstacle.position.y + this.obstacle.size.y * 0.5;
      const obsBottom = Math.max(0, this.obstacle.position.y - this.obstacle.size.y * 0.5);

      if (dist < this.obstacle.radius + this.radiusBase * 0.7 && this.state.position.y < obsTop - 0.03 && this.state.position.y >= obsBottom) {
        // Bottle struck side of obstacle body! Bounce realistically
        const nx = dx / (dist || 1);
        const nz = dz / (dist || 1);
        this.state.position.x = this.obstacle.position.x + nx * (this.obstacle.radius + this.radiusBase * 0.72);
        this.state.position.z = this.obstacle.position.z + nz * (this.obstacle.radius + this.radiusBase * 0.72);
        this.state.velocity.x = nx * 0.75;
        this.state.velocity.z = -Math.abs(this.state.velocity.z) * 0.4;
        this.state.angularVelocity.x = -2.5; // tumble backward
        audio.playTableImpact(0.7);
      }
    }

    const surfaceY = this.getSurfaceHeightAt(this.state.position.x, this.state.position.z);
    const lowestPoint = this.getLowestWorldPoint();

    // CRITICAL: Collision happens ONLY when bottle is descending (velocity.y <= 0.25) AND after clear launch window (> 0.10s)
    const isDescending = this.state.velocity.y <= 0.25 && this.state.flightTime > 0.10;
    if (isDescending && lowestPoint.y <= surfaceY) {
      const contactResult = this.handleSurfaceContact(surfaceY, lowestPoint, dt);
      if (contactResult) {
        return contactResult;
      }
    }

    // Check if bottle fell below table bounds into abyss
    if (this.state.position.y < -1.4) {
      this.state.isInFlight = false;
      this.state.hasSettled = true;
      audio.playFail();
      return {
        outcome: 'FAIL_OFF_TABLE',
        points: 0,
        text: 'FELL OFF TABLE!',
        color: '#ef4444',
        flipsCompleted: this.state.totalRotationPitch / (2 * Math.PI),
      };
    }

    // 5. Settling evaluation (Real-life physical settling criteria)
    if (this.state.isGrounded) {
      const linSpeed = this.state.velocity.length();
      const angSpeed = this.state.angularVelocity.length();
      const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.state.quaternion);
      const isUpright = upVector.y > 0.92; // within ~23 degrees tilt
      const isFlatOnSide = Math.abs(upVector.y) < 0.20;

      // Settle if either cleanly upright OR resting on its cylindrical side
      if (isUpright && linSpeed < 0.45 && angSpeed < 0.85) {
        this.state.settleTimer += dt;
        if (this.state.settleTimer > 0.08) {
          this.state.quaternion.identity();
          this.state.position.y = surfaceY + this.centerOfMassY;
          this.state.velocity.set(0, 0, 0);
          this.state.angularVelocity.set(0, 0, 0);
          this.state.hasSettled = true;
          this.state.isInFlight = false;
          return this.evaluateLanding();
        }
      } else if (isFlatOnSide && linSpeed < 0.15 && angSpeed < 0.40) {
        this.state.settleTimer += dt;
        if (this.state.settleTimer > 0.14) {
          this.state.position.y = surfaceY + this.radiusBase * 0.96;
          this.state.velocity.set(0, 0, 0);
          this.state.angularVelocity.set(0, 0, 0);
          this.state.hasSettled = true;
          this.state.isInFlight = false;
          return this.evaluateLanding();
        }
      } else {
        this.state.settleTimer = Math.max(0, this.state.settleTimer - dt * 0.5);
      }
    }

    // Failsafe timeout (3.6s max in flight): Guaranteed that turns never freeze, but enforces clean orientation
    if (this.state.flightTime > 3.6 && !this.state.hasSettled) {
      const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.state.quaternion);
      if (upVector.y > 0.90) {
        this.state.quaternion.identity();
        this.state.position.y = surfaceY + this.centerOfMassY;
      } else {
        // Lay flat on side
        const horizAxis = new THREE.Vector3(upVector.x, 0, upVector.z);
        if (horizAxis.lengthSq() < 0.001) horizAxis.set(1, 0, 0);
        horizAxis.normalize();
        this.state.quaternion.setFromAxisAngle(new THREE.Vector3(horizAxis.z, 0, -horizAxis.x), Math.PI / 2);
        this.state.position.y = surfaceY + this.radiusBase * 0.96;
      }
      this.state.velocity.set(0, 0, 0);
      this.state.angularVelocity.set(0, 0, 0);
      this.state.hasSettled = true;
      this.state.isInFlight = false;
      return this.evaluateLanding();
    }

    return null;
  }

  private updateMovingObstacle(dt: number) {
    if (
      this.obstacle &&
      this.obstacle.type === 'moving' &&
      this.obstacle.movingSpeed &&
      this.obstacle.movingDistance
    ) {
      const time = performance.now() * 0.001;
      this.obstacle.position.x =
        Math.sin(time * this.obstacle.movingSpeed) * this.obstacle.movingDistance;
      this.targetCenter.x = this.obstacle.position.x;
      if (this.obstacle.mesh) {
        this.obstacle.mesh.position.x = this.obstacle.position.x;
      }
    }
  }

  private getSurfaceHeightAt(x: number, z: number): number {
    // Check obstacle collision
    if (this.obstacle && this.obstacle.radius) {
      const dx = x - this.obstacle.position.x;
      const dz = z - this.obstacle.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= this.obstacle.radius + 0.05) {
        const obsTop = this.obstacle.position.y + this.obstacle.size.y * 0.5;
        // Obstacle top is active only when bottle lowest point is near or above obstacle top
        if (this.state.position.y >= obsTop - 0.08) {
          return obsTop;
        }
      }
    }

    // Table bounds check
    const halfW = this.tableWidth * 0.5 + 0.05;
    const minZ = -0.7;
    const maxZ = this.tableLength + 0.3;

    if (Math.abs(x) <= halfW && z >= minZ && z <= maxZ) {
      return this.tableTopY;
    }

    // Outside table: floor level is down below
    return -2.5;
  }

  // Accurate bottle contact points envelope (base rim, cap rim, and cylindrical body)
  private getLowestWorldPoint(): {
    y: number;
    isBase: boolean;
    isCap: boolean;
    isSide: boolean;
    contactPoint: THREE.Vector3;
    contactOffset: THREE.Vector3;
  } {
    const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.state.quaternion);
    const uy = THREE.MathUtils.clamp(upVector.y, -1, 1);
    const sinTheta = Math.sqrt(Math.max(0, 1 - uy * uy));

    // Direction vector of the lowest edge on any horizontal cross-section
    let lowestDir = new THREE.Vector3(0, 0, 0);
    if (sinTheta > 0.001) {
      lowestDir.set(
        (upVector.x * uy) / sinTheta,
        -sinTheta,
        (upVector.z * uy) / sinTheta
      ).normalize();
    }

    // 1. Base rim (local y = -centerOfMassY)
    const baseCenter = this.state.position.clone().addScaledVector(upVector, -this.centerOfMassY);
    const lowestBasePos = baseCenter.clone().addScaledVector(lowestDir, this.radiusBase);

    // 2. Cap rim (local y = height - centerOfMassY)
    const capHeightFromCoM = this.height - this.centerOfMassY;
    const capCenter = this.state.position.clone().addScaledVector(upVector, capHeightFromCoM);
    const lowestCapPos = capCenter.clone().addScaledVector(lowestDir, this.radiusCap);

    // 3. Cylindrical side lowest point (sample along the body waist)
    const bodyCenter = this.state.position.clone().addScaledVector(upVector, 0.08 - this.centerOfMassY);
    const lowestSidePos = bodyCenter.clone().addScaledVector(lowestDir, this.radiusBase * 0.98);

    // Determine the true lowest point among base, cap, and side
    let lowestPos = lowestBasePos;
    let isBase = true;
    let isCap = false;
    let isSide = false;

    if (lowestCapPos.y < lowestPos.y) {
      lowestPos = lowestCapPos;
      isBase = false;
      isCap = true;
      isSide = false;
    }

    if (lowestSidePos.y < lowestPos.y) {
      lowestPos = lowestSidePos;
      isBase = false;
      isCap = false;
      isSide = true;
    }

    return {
      y: lowestPos.y,
      isBase,
      isCap,
      isSide,
      contactPoint: lowestPos,
      contactOffset: lowestPos.clone().sub(this.state.position),
    };
  }

  // Realistic contact, toppling torque, and continuous rolling physics
  private handleSurfaceContact(
    surfaceY: number,
    lowest: {
      y: number;
      isBase: boolean;
      isCap: boolean;
      isSide: boolean;
      contactPoint: THREE.Vector3;
      contactOffset: THREE.Vector3;
    },
    dt: number
  ): FlipFeedback | null {
    const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.state.quaternion);
    const tiltAngleRad = upVector.angleTo(new THREE.Vector3(0, 1, 0)); // 0 = upright, PI = upside down
    const tiltAngleDeg = tiltAngleRad * (180 / Math.PI);

    // Prevent penetrating table surface
    const penetration = surfaceY - lowest.y;
    if (penetration > 0) {
      this.state.position.y += penetration;
    }

    const impactSpeed = Math.abs(this.state.velocity.y);
    if (impactSpeed > 0.25 && !this.state.isGrounded) {
      this.state.bouncesCount += 1;
      audio.playTableImpact(Math.min(1.5, impactSpeed));
    }

    // -------------------------------------------------------------
    // REGIME 1: UPRIGHT LANDING (Water Ballast & Snap-to-Feet Stabilization)
    // When the bottle touches down with its base (tilt <= 24 deg) and not on its cap:
    // The bottom water acts as a dynamic ballast and energy sink:
    // - Cancels bouncing and stabilizes lateral slip
    // - Smoothly rights the bottle without chaotic overshoot
    // - Settles crisp and triggers the win directly
    // -------------------------------------------------------------
    const isUprightLanding = tiltAngleDeg <= 24.0 && !lowest.isCap && impactSpeed < 4.8;
    if (isUprightLanding) {
      this.state.isGrounded = true;

      // Heavy liquid ballast impact absorption: absorb vertical bounce
      if (this.state.velocity.y < 0) {
        this.state.velocity.y = 0;
      }
      this.state.velocity.x *= 0.52;
      this.state.velocity.z *= 0.52;

      // Smooth water ballast restoration: damp angular spin heavily and align to upright
      this.state.angularVelocity.multiplyScalar(0.62);
      const uprightQuat = new THREE.Quaternion(); // (0, 0, 0, 1) = upright
      this.state.quaternion.slerp(uprightQuat, Math.min(1.0, 16.0 * dt));

      // Keep base pinned to the table surface
      this.state.position.y = surfaceY + this.centerOfMassY;

      // Settle upright directly once stabilized
      if (tiltAngleDeg <= 12.0 && this.state.angularVelocity.length() < 0.75 && this.state.velocity.length() < 0.38) {
        this.state.settleTimer += dt;
        if (this.state.settleTimer > 0.08) {
          this.state.quaternion.identity();
          this.state.position.y = surfaceY + this.centerOfMassY;
          this.state.velocity.set(0, 0, 0);
          this.state.angularVelocity.set(0, 0, 0);
          this.state.hasSettled = true;
          this.state.isInFlight = false;
          return this.evaluateLanding();
        }
      }

      return null;
    }

    // -------------------------------------------------------------
    // REGIME 2: TIPPED OVER / CAP HIT / ROLLING DYNAMICS
    // If the bottle lands on its side or cap (tilt > 24 deg):
    // Realistic toppling torque pulls it flat onto its cylindrical body and rolls
    // -------------------------------------------------------------
    this.state.isGrounded = true;

    // A. Impact bounce on side/cap
    if (this.state.velocity.y < -0.15) {
      const restitution = 0.22;
      this.state.velocity.y = -this.state.velocity.y * restitution;
      audio.playBounce();
    }

    // B. Gravity toppling torque:
    const rContact = this.state.position.clone().sub(lowest.contactPoint);
    const gravityForce = new THREE.Vector3(0, -9.81 * this.mass, 0);
    const toppleTorque = rContact.clone().cross(gravityForce).multiplyScalar(2.0);

    // Apply toppling torque to angular velocity
    this.state.angularVelocity.addScaledVector(toppleTorque, dt);

    // Damping on wobble
    this.state.angularVelocity.x *= 0.96;
    this.state.angularVelocity.z *= 0.96;

    // C. Flatten bottle onto its side as it reaches the table:
    const isNearlyFlat = Math.abs(upVector.y) < 0.22;
    if (isNearlyFlat) {
      // Bottle is on its side: keep center of mass at cylinder radius height
      this.state.position.y = surfaceY + this.radiusBase * 0.96;

      // Project the bottle's horizontal axis on the table plane
      const horizAxis = new THREE.Vector3(upVector.x, 0, upVector.z);
      if (horizAxis.lengthSq() > 0.001) {
        horizAxis.normalize();

        // Direction perpendicular to the cylinder axis = Rolling Direction!
        const rollDir = new THREE.Vector3(horizAxis.z, 0, -horizAxis.x);

        // Current velocity along rolling direction
        const currentRollSpeed = this.state.velocity.dot(rollDir);

        // Convert residual angular momentum into forward/backward roll
        const spinRollContribution = (this.state.angularVelocity.y * 0.05 + this.state.angularVelocity.x * 0.08);
        const targetRollSpeed = currentRollSpeed + spinRollContribution;

        // Apply rolling velocity
        this.state.velocity.set(
          rollDir.x * targetRollSpeed * 0.92,
          0,
          rollDir.z * targetRollSpeed * 0.92
        );

        // Rotate the bottle mesh around its own longitudinal axis as it rolls across the table
        const rollSpin = targetRollSpeed / (this.radiusBase || 0.08);
        const rollQuatDelta = new THREE.Quaternion().setFromAxisAngle(horizAxis, rollSpin * dt);
        this.state.quaternion.premultiply(rollQuatDelta);
      }

      // Smooth rolling friction
      this.state.velocity.multiplyScalar(0.982);
      this.state.angularVelocity.multiplyScalar(0.95);
    } else {
      // Still in active topple phase: preserve lateral momentum
      this.state.velocity.x *= 0.94;
      this.state.velocity.z *= 0.94;
    }

    // D. Table Edge Check: Did the bottle roll off the edge or corner?
    const isOffTableEdge =
      Math.abs(this.state.position.x) > this.tableWidth * 0.5 ||
      this.state.position.z < -0.7 ||
      this.state.position.z > this.tableLength + 0.3;

    if (isOffTableEdge) {
      // Rolled off table edge into empty air!
      this.state.isGrounded = false;
      this.state.velocity.y -= 1.8 * dt;
    }

    return null;
  }

  // Outcome scoring & feedback logic
  private evaluateLanding(): FlipFeedback {
    const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.state.quaternion);
    const tiltAngleRad = upVector.angleTo(new THREE.Vector3(0, 1, 0));
    const tiltAngleDeg = tiltAngleRad * (180 / Math.PI);

    const flipsCompleted = this.state.totalRotationPitch / (2 * Math.PI);
    const surfaceY = this.getSurfaceHeightAt(this.state.position.x, this.state.position.z);

    // 1. Did it fall off the table/obstacle?
    if (this.state.position.y < surfaceY - 0.2 || surfaceY < -1.0) {
      audio.playFail();
      return {
        outcome: 'FAIL_OFF_TABLE',
        points: 0,
        text: 'MISSED PLATFORM!',
        color: '#ef4444',
        flipsCompleted,
      };
    }

    // 2. Mandatory Rotation Rule: Must complete at least ~1/2 airborne spin (natural human flip)
    if (flipsCompleted < 0.54) {
      audio.playFail();
      return {
        outcome: 'FAIL_ROTATION',
        points: 0,
        text: 'NEED MORE SPIN! (0 pts)',
        color: '#f59e0b',
        flipsCompleted,
      };
    }

    // Check elevated obstacle target: must land atop the platform if target is elevated
    if (this.obstacle && this.obstacle.position.y > 0.08) {
      const obsTop = this.obstacle.position.y + this.obstacle.size.y * 0.5;
      if (surfaceY < obsTop - 0.05) {
        audio.playFail();
        return {
          outcome: 'FAIL_OFF_TABLE',
          points: 0,
          text: 'MISSED THE PLATFORM!',
          color: '#ef4444',
          flipsCompleted,
        };
      }
    }

    // 3. Upright Landing Evaluation (Physical threshold <= 20.0 degrees)
    if (tiltAngleDeg <= 20.0) {
      const dx = this.state.position.x - this.targetCenter.x;
      const dz = this.state.position.z - this.targetCenter.z;
      const distToTarget = Math.sqrt(dx * dx + dz * dz);

      // Check Edge Balance
      const isEdge =
        Math.abs(this.state.position.x) > this.tableWidth * 0.44 ||
        (this.obstacle && distToTarget > this.targetRadius * 0.85);

      if (isEdge && tiltAngleDeg <= 8) {
        audio.playPerfect();
        return {
          outcome: 'EDGE',
          points: 3,
          text: '⚡ EDGE BALANCE! (+3 pts)',
          color: '#8b5cf6',
          flipsCompleted,
        };
      }

      // Multi-flip bonuses
      if (flipsCompleted >= 2.6) {
        audio.playPerfect();
        return {
          outcome: 'TRIPLE_UPRIGHT',
          points: 5,
          text: '🔥 TRIPLE FLIP! (+5 pts)',
          color: '#ec4899',
          flipsCompleted,
        };
      } else if (flipsCompleted >= 1.7) {
        audio.playPerfect();
        return {
          outcome: 'DOUBLE_UPRIGHT',
          points: 3,
          text: '✨ DOUBLE FLIP! (+3 pts)',
          color: '#06b6d4',
          flipsCompleted,
        };
      }

      // Bounce-upright bonus
      if (this.state.bouncesCount >= 2) {
        audio.playLandSuccess();
        return {
          outcome: 'BOUNCE_UPRIGHT',
          points: 3,
          text: '🎯 BOUNCE & STICK! (+3 pts)',
          color: '#10b981',
          flipsCompleted,
        };
      }

      // Perfect Upright (Target Bullseye or < 3.5 degrees tilt)
      if (distToTarget <= 0.28 || tiltAngleDeg <= 3.5) {
        audio.playPerfect();
        return {
          outcome: 'PERFECT',
          points: 2,
          text: '⭐ PERFECT BULLSEYE! (+2 pts)',
          color: '#eab308',
          flipsCompleted,
        };
      }

      // Normal Upright landing
      audio.playLandSuccess();
      return {
        outcome: 'UPRIGHT',
        points: 1,
        text: '👍 CLEAN LANDING! (+1 pt)',
        color: '#3b82f6',
        flipsCompleted,
      };
    }

    // Tipped over failure
    audio.playFail();
    return {
      outcome: 'FAIL_TIPPED',
      points: 0,
      text: 'TIPPED OVER! (0 pts)',
      color: '#f97316',
      flipsCompleted,
    };
  }
}
