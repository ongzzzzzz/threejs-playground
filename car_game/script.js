/* TODO: 
spawn trees
mobile support (button)
multiplayer
chat?
*/

// SCENE
const scene = new THREE.Scene();


// CAR
const playerCar = Car();
// const playerCar = Tree();
const playerAngleInitial = Math.PI;
const speed = 0.0017; // radians per millisecond 

const halfPI = Math.PI / 2;

const carHitZoneRadius = 15;
let showHitBoxes = false;

scene.add(playerCar);

let pHitBox1, pHitBox2;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(100, -300, 400);
scene.add(dirLight);


// CAMERA
const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;
const camera = new THREE.OrthographicCamera(
	cameraWidth / -2,
	cameraWidth / 2,
	cameraHeight / 2,
	cameraHeight / -2,
	0,
	1000
);
camera.position.set(0, -210, 300);
// // change upwards position to be z-axis; default is y pointing up 
// camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

/* 
Commented to design sprites:
* camera
* inside movePlayerCar() 
* playercar
* renderMap
*/

// const aspectRatio = window.innerWidth / window.innerHeight;
// const cameraWidth = 200;
// const cameraHeight = cameraWidth / aspectRatio;
// const camera = new THREE.OrthographicCamera(
// 	cameraWidth / -2,
// 	cameraWidth / 2,
// 	cameraHeight / 2,
// 	cameraHeight / -2,
// 	0,
// 	1000
// );
// camera.position.set(200, -200, 300);
// // // change upwards position to be z-axis; default is y pointing up 
// camera.up.set(0, 0, 1);
// camera.lookAt(0, 0, 0);


renderMap(cameraWidth, cameraHeight * 2);


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);



// GAME LOGIC
let ready, score;
let playerAngleMoved;
const scoreElement = document.getElementById("score");
let otherVehicles = [];
let lastTimestamp;

let accelerate = false;
let decelerate = false;

reset();

function reset() {
	// score and position
	playerAngleMoved = 0;
	movePlayerCar(0);
	score = 0;
	scoreElement.innerText = "Up to accelerate Down to decelerate";
	lastTimestamp = undefined;

	// remove all otherVehicles
	otherVehicles.forEach((vehicle) => {
		scene.remove(vehicle.mesh);
		if (vehicle.hitboxes) {
			vehicle.hitboxes.forEach(hitbox => {
				scene.remove(hitbox)
			})
		}
	});
	otherVehicles = [];

	renderer.render(scene, camera);
	ready = true;
}

function startGame() {
	if (ready) {
		ready = false;
		scoreElement.innerText = score;
		renderer.setAnimationLoop(animation);
	}
}

function animation(timestamp) {
	if (!lastTimestamp) {
		lastTimestamp = timestamp;
		return;
	}

	const dt = timestamp - lastTimestamp;

	movePlayerCar(dt);

	// "how many 2pi there is"
	const laps = Math.floor(Math.abs(playerAngleMoved) / (2 * Math.PI));

	if (laps != score) {
		score = laps;
		scoreElement.innerText = score;
	}

	// add a vehicle every 5 laps
	if (otherVehicles.length < (laps + 1) / 5) addVehicle();

	moveOtherVehicles(dt);
	hitDetection();

	renderer.render(scene, camera);
	lastTimestamp = timestamp;
}





window.addEventListener("keydown", function (event) {
	if (event.key == "ArrowUp") {
		startGame();
		accelerate = true;
		return;
	}

	if (event.key == "ArrowDown") {
		decelerate = true;
		return;
	}

	if (event.key == "R" || event.key == "r") {
		reset();
		return;
	}
});

window.addEventListener("keyup", function (event) {
	if (event.key == "ArrowUp") {
		accelerate = false;
		return;
	}

	if (event.key == "ArrowDown") {
		decelerate = false;
		return;
	}
});






function movePlayerCar(dt) {
	let playerSpeed = getPlayerSpeed(); // rotation per millisecond
	playerAngleMoved -= playerSpeed * dt; // minus because going clockwise

	let totalPlayerAngle = playerAngleInitial + playerAngleMoved;

	let playerX = (Math.cos(totalPlayerAngle) * trackRadius) - arcCenterX;
	let playerY = (Math.sin(totalPlayerAngle) * trackRadius);

	playerCar.position.x = playerX;
	playerCar.position.y = playerY;

	playerCar.rotation.z = totalPlayerAngle - (halfPI);


	if (pHitBox1 && pHitBox2 && showHitBoxes) {
		let hb1 = getHitZonePosition(
			playerCar.position,
			playerAngleInitial + playerAngleMoved,
			true,
			carHitZoneRadius
		);
		let hb2 = getHitZonePosition(
			playerCar.position,
			playerAngleInitial + playerAngleMoved,
			true,
			-carHitZoneRadius
		);

		pHitBox1.position.x = hb1.x;
		pHitBox1.position.y = hb1.y;
		pHitBox2.position.x = hb2.x;
		pHitBox2.position.y = hb2.y;
	}

}

function getPlayerSpeed() {
	if (accelerate) return speed * 2;
	if (decelerate) return speed * 0.5;
	return speed;
}


function addVehicle() {
	const vehicleTypes = ["car", "truck"];

	const type = pickRandom(vehicleTypes);
	const mesh = type == "car" ? Car() : Truck();
	scene.add(mesh);

	const clockwise = Math.random() >= 0.5;
	const angle = clockwise ? halfPI : -halfPI;

	const speed = getVehicleSpeed(type);

	if (showHitBoxes) {
		if (type == "car") {

			let hitboxCoord1 = getHitZonePosition(
				{ x: Math.cos(angle) + arcCenterX, y: Math.sin(angle) },
				angle,
				true, -carHitZoneRadius
			);
			let hitbox1 = new THREE.Mesh(
				new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
				new THREE.MeshLambertMaterial({ color: 0xff0000 })
			);

			let hitboxCoord2 = getHitZonePosition(
				{ x: Math.cos(angle) + arcCenterX, y: Math.sin(angle) },
				angle,
				true, +carHitZoneRadius
			);
			let hitbox2 = new THREE.Mesh(
				new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
				new THREE.MeshLambertMaterial({ color: 0xff0000 })
			);
			hitbox1.position.x = hitboxCoord1.x;
			hitbox1.position.y = hitboxCoord1.y;
			hitbox1.position.z = 20;
			hitbox1.rotation.x = halfPI;

			scene.add(hitbox1)

			hitbox2.position.x = hitboxCoord2.x;
			hitbox2.position.y = hitboxCoord2.y;
			hitbox2.position.z = 20;
			hitbox2.rotation.x = halfPI;

			scene.add(hitbox2);

			otherVehicles.push({
				mesh, type, clockwise, angle, speed,
				hitboxes: [hitbox1, hitbox2]
			});

		}

		if (type == "truck") {

			let hitboxCoord1 = getHitZonePosition(
				{ x: Math.cos(angle) + arcCenterX, y: Math.sin(angle) },
				angle,
				true, -2.5 * carHitZoneRadius
			);
			let hitbox1 = new THREE.Mesh(
				new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
				new THREE.MeshLambertMaterial({ color: 0xff0000 })
			);
			hitbox1.position.x = hitboxCoord1.x;
			hitbox1.position.y = hitboxCoord1.y;
			hitbox1.position.z = 20;
			hitbox1.rotation.x = halfPI;

			scene.add(hitbox1)

			let hitboxCoord2 = getHitZonePosition(
				{ x: Math.cos(angle) + arcCenterX, y: Math.sin(angle) },
				angle,
				true, 0
			);
			let hitbox2 = new THREE.Mesh(
				new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
				new THREE.MeshLambertMaterial({ color: 0xff0000 })
			);
			hitbox2.position.x = hitboxCoord2.x;
			hitbox2.position.y = hitboxCoord2.y;
			hitbox2.position.z = 20;
			hitbox2.rotation.x = halfPI;

			scene.add(hitbox2);

			let hitboxCoord3 = getHitZonePosition(
				{ x: Math.cos(angle) + arcCenterX, y: Math.sin(angle) },
				angle,
				true, +2.5 * carHitZoneRadius
			);
			let hitbox3 = new THREE.Mesh(
				new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
				new THREE.MeshLambertMaterial({ color: 0xff0000 })
			);
			hitbox3.position.x = hitboxCoord3.x;
			hitbox3.position.y = hitboxCoord3.y;
			hitbox3.position.z = 20;
			hitbox3.rotation.x = halfPI;

			scene.add(hitbox3);

			otherVehicles.push({
				mesh, type, clockwise, angle, speed,
				hitboxes: [hitbox1, hitbox2, hitbox3]
			});
		}

	} else {
		otherVehicles.push({ mesh, type, clockwise, angle, speed });
	}

}


function getVehicleSpeed(type) {
	let minSpeed = 1;
	let maxSpeed = 2;

	if (type == "car") {
		minSpeed = 1;
		maxSpeed = 2;
	}
	if (type == "truck") {
		minSpeed = 0.6;
		maxSpeed = 1.5;
	}
	return minSpeed + (Math.random() * (maxSpeed - minSpeed));
}

function moveOtherVehicles(dt) {

	otherVehicles.forEach((vehicle) => {
		if (vehicle.clockwise) {
			vehicle.angle -= speed * vehicle.speed * dt;
		} else {
			vehicle.angle += speed * vehicle.speed * dt;
		}

		const vehicleX = (Math.cos(vehicle.angle) * trackRadius) + arcCenterX;
		const vehicleY = (Math.sin(vehicle.angle) * trackRadius);
		const vehicleRotation =
			vehicle.angle + (vehicle.clockwise ? -halfPI : halfPI);

		vehicle.mesh.position.x = vehicleX;
		vehicle.mesh.position.y = vehicleY;
		vehicle.mesh.rotation.z = vehicleRotation;

		if (vehicle.hitboxes) {

			if (vehicle.type == "car") {
				vehicle.hitboxes.forEach((hitbox, idx) => {
					const newHitbox = getHitZonePosition(
						vehicle.mesh.position,
						vehicle.angle,
						vehicle.clockwise,
						idx == 0 ? -carHitZoneRadius : +carHitZoneRadius
					);
					hitbox.position.x = newHitbox.x;
					hitbox.position.y = newHitbox.y;
				})
			}

			if (vehicle.type == "truck") {
				vehicle.hitboxes.forEach((hitbox, idx) => {
					const newHitbox = getHitZonePosition(
						vehicle.mesh.position,
						vehicle.angle,
						vehicle.clockwise,
						idx == 0 ? 
							-2.5 * carHitZoneRadius : 
							idx == 1 ? 0 :
								+2.5 * carHitZoneRadius
					);
					hitbox.position.x = newHitbox.x;
					hitbox.position.y = newHitbox.y;
				})
			}
		}
	})
}




function hitDetection() {


	const playerHitZone1 = getHitZonePosition(
		playerCar.position,
		playerAngleInitial + playerAngleMoved,
		true,
		carHitZoneRadius
	);

	const playerHitZone2 = getHitZonePosition(
		playerCar.position,
		playerAngleInitial + playerAngleMoved,
		true,
		-carHitZoneRadius
	);

	if ((!pHitBox1) && (!pHitBox2) && showHitBoxes) {
		pHitBox1 = new THREE.Mesh(
			new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
			new THREE.MeshLambertMaterial({ color: 0xff0000 })
		);
		pHitBox1.position.x = playerHitZone1.x;
		pHitBox1.position.y = playerHitZone1.y;
		pHitBox1.position.z = 20;
		pHitBox1.rotation.x = halfPI;

		scene.add(pHitBox1)

		pHitBox2 = new THREE.Mesh(
			new THREE.CylinderGeometry(carHitZoneRadius, carHitZoneRadius, 40),
			new THREE.MeshLambertMaterial({ color: 0xff0000 })
		);
		pHitBox2.position.x = playerHitZone2.x;
		pHitBox2.position.y = playerHitZone2.y;
		pHitBox2.position.z = 20;
		pHitBox2.rotation.x = halfPI;

		scene.add(pHitBox2)
	}

	const hit = otherVehicles.some((vehicle) => {

		if (vehicle.type == "car") {
			const vehicleHitZone1 = getHitZonePosition(
				vehicle.mesh.position,
				vehicle.angle,
				vehicle.clockwise,
				carHitZoneRadius
			);
			const vehicleHitZone2 = getHitZonePosition(
				vehicle.mesh.position,
				vehicle.angle,
				vehicle.clockwise,
				-carHitZoneRadius
			);

			if (
				(dist(playerHitZone1, vehicleHitZone1) <= 2 * carHitZoneRadius) ||
				(dist(playerHitZone1, vehicleHitZone2) <= 2 * carHitZoneRadius) ||
				(dist(playerHitZone2, vehicleHitZone1) <= 2 * carHitZoneRadius)
				// (dist(playerHitZone2, vehicleHitZone2) < 2*carHitZoneRadius)
			) {
				return true;
			}
		}

		if (vehicle.type == "truck") {
			const truckHitZone1 = getHitZonePosition(
				vehicle.mesh.position,
				vehicle.angle,
				vehicle.clockwise,
				-2.5 * carHitZoneRadius
			);
			const truckHitZone2 = getHitZonePosition(
				vehicle.mesh.position,
				vehicle.angle,
				vehicle.clockwise,
				0
			);
			const truckHitZone3 = getHitZonePosition(
				vehicle.mesh.position,
				vehicle.angle,
				vehicle.clockwise,
				2.5 * carHitZoneRadius
			);

			let radiusSum = (7 / 3) * carHitZoneRadius;

			if (
				dist(playerHitZone1, truckHitZone1) <= radiusSum ||
				dist(playerHitZone1, truckHitZone2) <= radiusSum ||
				dist(playerHitZone1, truckHitZone3) <= radiusSum ||

				dist(playerHitZone2, truckHitZone1) <= radiusSum ||
				dist(playerHitZone2, truckHitZone2) <= radiusSum ||
				dist(playerHitZone2, truckHitZone3) <= radiusSum
				// (dist(playerHitZone2, vehicleHitZone2) < 2*carHitZoneRadius)
			) {
				return true;
			}
		}

	});


	// stop game
	// can set other game logic here

	if (hit) {
		scoreElement.innerText = "Press R to restart"
		renderer.setAnimationLoop(null);
	}

}

function getHitZonePosition(center, angle, clockwise, distance) {
	const directionAngle = angle + (clockwise ? -halfPI : halfPI);

	return {
		x: center.x + (Math.cos(directionAngle) * distance),
		y: center.y + (Math.sin(directionAngle) * distance)
	};
}


function dist(p1, p2) {
	return Math.sqrt(
		((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2)
	);
}