import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Fountain } from './src/fountain'

let controls
let scene
let camera
let renderer
let fountain1
let fountain2
let fountain3
let velocity = 10
let spread = 5.0

function Init() {
	scene = new THREE.Scene()

	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#bg'),
		antialias: true
	})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1.0, 1000.0)
	camera.position.set(25, 10, 0)

	const grid = new THREE.GridHelper(200, 50)
	scene.add(grid)

	controls = new OrbitControls(camera, renderer.domElement)
	controls.update()

	const light = new THREE.AmbientLight(0x101010);
	scene.add(light);

	fountain1 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: velocity,
		spread: spread,
		positionX: 50,
	})

	fountain2 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 20,
		spread: 5.0,
		positionX: 0,
	})

	fountain3 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 15,
		spread: 3.0,
		positionX: -50,
	})

	renderer.render(scene, camera)
}

let prevAnimate = null
function Animate() {
	requestAnimationFrame((t) => {
		if (prevAnimate === null) {
			prevAnimate = t
		}

		Animate()

		renderer.render(scene, camera)
		animateFountain(t - prevAnimate)
		prevAnimate = t
	})
}

function animateFountain(timeElapsed) {
	const timeElapsedS = timeElapsed * 0.001

	fountain1.Step(timeElapsedS)
	fountain2.Step(timeElapsedS)
	fountain3.Step(timeElapsedS)
}

Init()
Animate()