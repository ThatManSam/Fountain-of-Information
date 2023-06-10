import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Fountain } from './src/fountain'

// api and array variables
let list
let times = []
let velocities = []
let velocitiesText = []
let descriptions = []
let windSpeeds = []

// scene and camera variables
let scene
let camera
let renderer
let env

// 3d variables
let fountain1, fountain2, fountain3
let f1, f2, f3
let f1Mesh, f2Mesh, f3Mesh
let d1, d2, d3
let d1Mesh, d2Mesh, d3Mesh

// console logs to check if data in array is correct
console.log(times)
console.log(velocities)
console.log(windSpeeds)
console.log(descriptions)

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
				velocities.push(velocity / 3) // divided by 3 to scale to fit screen
				descriptions.push(description)
				windSpeeds.push(windSpeed * 3) // multipied by 3 for accuracy
			})
		})
		.catch(err => {
			console.error(err)
		})
}
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
		colour: new THREE.Color(0xffffff),
		spread: 1.0,
		positionZ: 20,
	})

	fountain2 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		colour: new THREE.Color(0xffffff),
		spread: 1.0,
		positionZ: 0,
	})

	fountain3 = new Fountain({
		scene: scene,
		camera: camera,
		velocity: 0,
		colour: new THREE.Color(0xffffff),
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
	const fontLoader = new FontLoader()
	const ttfLoader = new TTFLoader()
	ttfLoader.load('./resources/fonts/ArchivoBlack-Regular.ttf', (json) => {
		const font = fontLoader.parse(json)
		f1 = new TextGeometry('----', {
			height: 0.5,
			size: 2,
			font: font
		})
		const texMat1 = new THREE.MeshNormalMaterial()
		f1Mesh = new THREE.Mesh(f1, texMat1)
		f1Mesh.position.set(4.5, 0.5, 23)
		f1Mesh.rotation.y = Math.PI / 2
		scene.add(f1Mesh)

		f2 = new TextGeometry('----', {
			height: 0.5,
			size: 2,
			font: font
		})
		const texMat2 = new THREE.MeshNormalMaterial()
		f2Mesh = new THREE.Mesh(f2, texMat2)
		f2Mesh.position.set(4.5, 0.5, 3)
		f2Mesh.rotation.y = Math.PI / 2
		scene.add(f2Mesh)

		f3 = new TextGeometry('----', {
			height: 0.5,
			size: 2,
			font: font
		})
		const texMat3 = new THREE.MeshNormalMaterial()
		f3Mesh = new THREE.Mesh(f3, texMat3)
		f3Mesh.position.set(4.5, 0.5, -15)
		f3Mesh.rotation.y = Math.PI / 2
		scene.add(f3Mesh)

		d1 = new TextGeometry('sky', {
			height: 0.3,
			size: 1,
			font: font
		})
		const dMat1 = new THREE.MeshNormalMaterial()
		d1Mesh = new THREE.Mesh(d1, dMat1)
		d1Mesh.position.set(7.5, 0.5, 23.5)
		d1Mesh.rotation.y = Math.PI / 2
		scene.add(d1Mesh)

		d2 = new TextGeometry('sky', {
			height: 0.3,
			size: 1,
			font: font
		})
		const dMat2 = new THREE.MeshNormalMaterial()
		d2Mesh = new THREE.Mesh(d2, dMat2)
		d2Mesh.position.set(7.5, 0.5, 3.5)
		d2Mesh.rotation.y = Math.PI / 2
		scene.add(d2Mesh)

		d3 = new TextGeometry('sky', {
			height: 0.3,
			size: 1,
			font: font
		})
		const dMat3 = new THREE.MeshNormalMaterial()
		d3Mesh = new THREE.Mesh(d3, dMat3)
		d3Mesh.position.set(7.5, 0.5, -15)
		d3Mesh.rotation.y = Math.PI / 2
		scene.add(d3Mesh)
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
		
		// update 3D text
		f1.dispose()
		f2.dispose()
		f3.dispose()
		d1.dispose()
		d2.dispose()
		d3.dispose()
		const fontLoader = new FontLoader()
		const ttfLoader = new TTFLoader()
		ttfLoader.load('./resources/fonts/ArchivoBlack-Regular.ttf', (json) => {
			const font = fontLoader.parse(json)
			f1 = new TextGeometry(getDate(times[0]), {
				height: 0.5,
				size: 2,
				font: font
			})
			f1Mesh.geometry = f1

			f2 = new TextGeometry(getDate(times[1]), {
				height: 0.5,
				size: 2,
				font: font
			})
			f2Mesh.geometry = f2

			f3 = new TextGeometry(getDate(times[2]), {
				height: 0.5,
				size: 2,
				font: font
			})
			f3Mesh.geometry = f3

			d1 = new TextGeometry(descriptions[0], {
				height: 0.3,
				size: 1,
				font: font
			})
			d1Mesh.geometry = d1

			d2 = new TextGeometry(descriptions[1], {
				height: 0.3,
				size: 1,
				font: font
			})
			d2Mesh.geometry = d2

			d3 = new TextGeometry(descriptions[2], {
				height: 0.3,
				size: 1,
				font: font
			})
			d3Mesh.geometry = d3
		})

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

	fountain1.colour = getColour(windSpeeds[0])
	fountain2.colour = getColour(windSpeeds[1])
	fountain3.colour = getColour(windSpeeds[2])
}

// gets date string from api, and converts from military to standard time
function getDate(apiString) {
	var timeString = apiString.substring(11, 13)
	var hour = Number(timeString)
	var hourString

	if (hour > 0 && hour <= 12) {
		return hourString = "" + hour + "AM"
	}
	else if (hour > 12) {
		return hourString = "" + (hour - 12) + "PM"
	}
	else if (hour == 0) {
		return hourString = "12AM"
	}
}

// gets wind speed value and assigns a colour to represent intensity
function getColour(windSpeedArr) {
	var windSpeed = Number(windSpeedArr)
	
	if (windSpeed <= 3){
		return new THREE.Color(0x2c8e08)
	}
	else if (windSpeed > 3 && windSpeed <= 6){
		return new THREE.Color(0x57a10a)
	}
	else if (windSpeed > 6 && windSpeed <= 9){
		return new THREE.Color(0x8bb90d)
	}
	else if (windSpeed > 9 && windSpeed <= 12){
		return new THREE.Color(0xbecf10)
	}
	else if (windSpeed > 12 && windSpeed <= 15){
		return new THREE.Color(0xeee512)
	}
	else if (windSpeed > 15 && windSpeed <= 18){
		return new THREE.Color(0xeee512)
	}
	else if (windSpeed > 18 && windSpeed <= 21){
		return new THREE.Color(0xf3b60f)
	}
	else if (windSpeed > 21 && windSpeed <= 24){
		return new THREE.Color(0xf4830c)
	}
	else if (windSpeed > 24 && windSpeed <= 27){
		return new THREE.Color(0xf54f09)
	}
	else if (windSpeed >= 30){
		return new THREE.Color(0xf71f06)
	}
	else {
		console.log("Wrong windspeed data")
	}

}

call()
Init()
Animate()
