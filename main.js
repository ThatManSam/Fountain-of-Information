import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { Fountain } from './src/fountain'

let list
let times = []
let velocities = []
let descriptions = []
let windSpeeds = []

let scene
let camera
let renderer
let labelRenderer
let fountain1, fountain2, fountain3
let f1, f2, f3
let env

// fetch data from weather api
function call() {
	fetch('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/3hourly?lat=-37.8&lon=175.3&units=metric&lang=en', {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': 'key',
			'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
		}
	})

		.then(response => response.json())
		.then(data => {
			list = data.data

			list.map((item) => {
				const time = item.timestamp_local
				const velocity = item.app_temp
				const description = item.weather.description
				const windSpeed = item.wind_spd

				times.push(time)
				velocities.push(velocity)
				descriptions.push(description)
				windSpeeds.push(windSpeed)
			})
		})
		.catch(err => {
			console.error(err)
		})
}
call()
// call api every 30 mins
setTimeout(call, 1800000)

function Init() {
	scene = new THREE.Scene()

	// initialise WebGL renderer
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#bg'),
		antialias: true
	})
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)
	
	// initialise HTML elements renderer
	labelRenderer = new CSS2DRenderer()
	labelRenderer.setSize(window.innerWidth, window.innerHeight)
	labelRenderer.domElement.style.position = 'absolute'
	labelRenderer.domElement.style.top = '0px'
	document.body.appendChild(labelRenderer.domElement)

	// initialise camera to a fixed point
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1.0, 1000.0)
	camera.position.set(30, 15, 0)
	camera.lookAt(0, 14, 0)

	const pointLight = new THREE.PointLight(0xFFFFFF)
	pointLight.position.set(0, 50, 0)
	scene.add(pointLight)
	
	const bg = new THREE.TextureLoader().load('./resources/bg1.png')
	scene.background = bg

	// initialise fountains
	fountain1 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		colour: new THREE.Color(0x6a72de),
		spread: 1.0,
		positionZ: 20,
	})

	fountain2 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		colour: new THREE.Color(0x6ade70),
		spread: 1.0,
		positionZ: 0,
	})

	fountain3 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		colour: new THREE.Color(0xde6ad0),
		spread: 1.0,
		positionZ: -20,
	})
	
	// load 3D environment
	env = new GLTFLoader()
	env.load('./resources/eng.glb', function(glb){
		const model = glb.scene
		scene.add(model)
		model.matrixAutoUpdate = false
	})
	
	// create labels for the fountains
	f1 = document.createElement('f1')
	f1.textContent = 'Text'
	const cPointLabel1 = new CSS2DObject(f1)
	scene.add(cPointLabel1)
	cPointLabel1.position.set(2, 0, 20)

	f2 = document.createElement('f2')
	f2.textContent = 'Text'
	const cPointLabel2 = new CSS2DObject(f2)
	scene.add(cPointLabel2)
	cPointLabel2.position.set(2, 0, 0)

	f3 = document.createElement('f3')
	f3.textContent = 'Text'
	const cPointLabel3 = new CSS2DObject(f3)
	scene.add(cPointLabel3)
	cPointLabel3.position.set(2, 0, -20)

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
	
	fountain1.velocity = velocities[0]
	fountain2.velocity = velocities[1]
	fountain3.velocity = velocities[2]

	fountain1.spread = windSpeeds[0]
	fountain2.spread = windSpeeds[1]
	fountain3.spread = windSpeeds[2]
}

Init()
Animate()
