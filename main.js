import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Fountain } from './src/fountain'

let list

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

let times = []
let velocities = []
let descriptions = []
let windSpeeds = []

let controls
let scene
let camera
let renderer
let fountain1
let fountain2
let fountain3
let spread = 1.0

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
		velocity: 0,
		spread: spread,
		positionX: 50,
	})

	fountain2 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		spread: spread,
		positionX: 0,
	})

	fountain3 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		spread: spread,
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
	
	fountain1.velocity = velocities[0]
	fountain2.velocity = velocities[1]
	fountain3.velocity = velocities[2]

	fountain1.spread = windSpeeds[0]
	fountain2.spread = windSpeeds[1]
	fountain3.spread = windSpeeds[2]
}

Init()
Animate()
