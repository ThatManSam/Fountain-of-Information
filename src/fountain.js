/*
The Fountain class is used to create a "fountain" using particle system
*/
import * as THREE from 'three'
import { LinearSpline } from './linearSpline'

const vertShader = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`

const fragShader = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`

class Fountain {
  constructor(params) {
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load('./resources/particle.png')
      },
      pointMultiplier: {
        value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
      }
    };

    this.scene = params.scene
    this.camera = params.camera
    this.velocity = params.velocity
    this.colour = params.colour
    this.spread = params.spread
    this.positionZ = params.positionZ
    this.particles = []

    // define the particle material using the ShaderMaterial
    this.particleMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      blending: THREE.NormalBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    })

    // create a buffer geometry for the particles
    this.particleGeo = new THREE.BufferGeometry()
    
    // initialse attributes for the buffer geometry
    this.particleGeo.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    this.particleGeo.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
    this.particleGeo.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
    this.particleGeo.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))

    // create a points mesh for the water particles
    this.water = new THREE.Points(this.particleGeo, this.particleMat)

    // add particles to scene
    this.scene.add(this.water)

    // alpha spline to control how the change in transparency behaves
    this.alphaSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a)
    })
    this.alphaSpline.AddPoint(0.0, 0.0)
    this.alphaSpline.AddPoint(1.0, 1.0)

    // colour spline to control how the change in colour behaves
    this.colourSpline = new LinearSpline((t, a, b) => {
      const c = a.clone()
      return c.lerp(b, t)
    })
    this.colourSpline.AddPoint(0.0, this.colour) // starting colour
    this.colourSpline.AddPoint(1.0, this.colour)

    // size spline to control how the change in size behaves
    this.sizeSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a)
    })
    this.sizeSpline.AddPoint(0.0, 0.3)
    this.sizeSpline.AddPoint(1.0, this.spread) // Change "5.0" to control spread (higher = more spread)
    this.UpdateGeometry()
  }

  // defines a particle when added
  AddParticles(timeElapsed) {
    // calculate the number of particles to be generated based on timeElapsed
    if (!this.numParticles) {
      this.numParticles = 0.0
    }
    this.numParticles += timeElapsed
    const num = Math.floor(this.numParticles * 75.0)
    this.numParticles -= num / 75.0

    // particle definition
    for (let i = 0; i < num; i++) {
      this.particles.push({
        position: new THREE.Vector3(0, 0.5, this.positionZ),
        size: (Math.random() * 0.5 + 0.5) * 4.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: 5.0,
        maxLife: 5.0,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: new THREE.Vector3(0, this.velocity, 0),
      })
    }
  }

  // assigns attributes to a particle
  // size, colour, transparency, rotation angle
  UpdateGeometry() {
    // create an array for each attribute
    const positions = []
    const sizes = []
    const colours = []
    const angles = []

    // assign each attribute to their designated arrays
    for (let p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z)
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
      sizes.push(p.currentSize)
      angles.push(p.rotation)
    }

    // use the attribute arrays to define the particle's attributes
    this.particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.particleGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    this.particleGeo.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
    this.particleGeo.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))

    this.particleGeo.attributes.position.needsUpdate = true
    this.particleGeo.attributes.size.needsUpdate = true
    this.particleGeo.attributes.colour.needsUpdate = true
    this.particleGeo.attributes.angle.needsUpdate = true
  }

  // updates the particle's attributes
  // rotation, alpha, size, colour
  UpdateParticles(timeElapsed) {
    for (let p of this.particles) {
      p.life -= timeElapsed
    }

    this.particles = this.particles.filter(p => {
      return p.life > 0.0
    });

    for (let p of this.particles) {
      const t = 1.0 - p.life / p.maxLife

      p.rotation += timeElapsed * 0.5
      p.alpha = this.alphaSpline.Get(t)
      p.currentSize = p.size * this.sizeSpline.Get(t)
      p.colour.copy(this.colourSpline.Get(t))

      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))
    }
  }

  Step(timeElapsed) {
    this.AddParticles(timeElapsed)
    this.UpdateParticles(timeElapsed)
    this.UpdateGeometry()
  }
}

export { Fountain }
