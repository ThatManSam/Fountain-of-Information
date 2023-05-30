import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Fountain } from './src/fountain'

let list;
let item;

fetch('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/3hourly?lat=-37.8&lon=175.3&units=metric&lang=en', {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '44c686a889msh9cfed311931649bp1e2430jsn02f6698a3868',
		'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
	}
})

	.then(response => response.json())
	.then(data => {
		list = data.data;

		list.map((item) => {
			console.log(item) // See all the item.properties.
			const time = item.timestamp_local;
			const velocity = item.app_temp;
			const description = item.weather.description;
			const windSpeed = item.wind_spd;

			// Array to loop through fountain values.

			times.push(time);
			velocities.push(velocity);
			descriptions.push(description);
			windSpeeds.push(windSpeed);

			// Shows time as the heading, and then lists (horizontally) the other listed properties.. Hopefully..
			// const curWeather = `<li><h1>${time}</h1><h2>${weather}</h2><h3>${temperature}</h3><h4>${windSpeed}</h4></li>`
			// document.querySelector('.weather').innerHTML += curWeather;
		})
	})

	.catch(err => {
		console.error(err);
	});

// 
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
	
	fountain1.velocity = velocities[0]
	fountain2.velocity = velocities[1]
	fountain3.velocity = velocities[2]

	fountain1.spread = windSpeeds[0]
	fountain2.spread = windSpeeds[1]
	fountain3.spread = windSpeeds[2]
}

Init()
Animate()
