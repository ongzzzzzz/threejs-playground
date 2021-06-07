// import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

// SCENE
const scene = new THREE.Scene();

const size = 1000;
const divisions = 100;

const gridHelper = new THREE.GridHelper(size, divisions);
gridHelper.rotation.x = Math.PI / 2;
scene.add(gridHelper);


const halfPI = Math.PI/2;

// CAR
const playerCar = Car();
// const playerCar = Tree();
const playerAngleInitial = Math.PI;
const speed = 0.0017; // radians per millisecond 

let carHitZoneRadius = 15;
let showHitBoxes = false;


let chb1 = new THREE.Mesh(
	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
	new THREE.MeshLambertMaterial({ color: 0xff0000 })
)
let chb2 = new THREE.Mesh(
	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
	new THREE.MeshLambertMaterial({ color: 0xff0000 })
)

chb1.position.x = 15;
chb1.position.z = 20; chb1.rotation.x = halfPI; 
chb2.position.x = -15; 
chb2.position.z = 20; chb2.rotation.x = halfPI;
playerCar.add(chb1); playerCar.add(chb2);

playerCar.position.x = 69;
playerCar.position.y = 69;
scene.add(playerCar);


const truck = Truck();
carHitZoneRadius *= (4/3)
let thb1 = new THREE.Mesh(
	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
	new THREE.MeshLambertMaterial({ color: 0xff0000 })
)
let thb2 = new THREE.Mesh(
	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
	new THREE.MeshLambertMaterial({ color: 0xff0000 })
)
let thb3 = new THREE.Mesh(
	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
	new THREE.MeshLambertMaterial({ color: 0xff0000 })
)
// let thb4 = new THREE.Mesh(
// 	new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
// 	new THREE.MeshLambertMaterial({ color: 0xff0000 })
// )

thb1.position.x = -37.5;
thb1.position.z = 20; thb1.rotation.x = halfPI; 
thb2.position.x = 0;
thb2.position.z = 20; thb2.rotation.x = halfPI; 
thb3.position.x = 37.5;
thb3.position.z = 20; thb3.rotation.x = halfPI; 
// thb4.position.x = 37.5;
// thb4.position.z = 20; thb4.rotation.x = halfPI; 

scene.add(thb1)
scene.add(thb2)
scene.add(thb3)
// scene.add(thb4)
scene.add(truck)

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 400);
scene.add(dirLight);


// CAMERA

/* 
Commented to design sprites:
* camera
* inside movePlayerCar() 
* playercar
* renderMap
*/

const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 200;
const cameraHeight = cameraWidth / aspectRatio;
const camera = new THREE.OrthographicCamera(
	cameraWidth / -2,
	cameraWidth / 2,
	cameraHeight / 2,
	cameraHeight / -2,
	0,
	1000
);
camera.position.set(200, -200, 300);
// // change upwards position to be z-axis; default is y pointing up 
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
render();

function render() {
	renderer.render(scene, camera);
}


const orbit = new OrbitControls(camera, renderer.domElement);
orbit.addEventListener('change', render);
