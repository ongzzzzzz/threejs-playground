const vehicleColors = [0xa52523, 0xbdb638, 0x78b14b];

/* 
car: 60x30
*/

function Wheel() {
	const wheel = new THREE.Mesh(
		new THREE.BoxBufferGeometry(12, 33, 12),
		new THREE.MeshLambertMaterial({ color: 0x333333 })
	);
	// shift upwards by half its height (so not sink into floor)
	wheel.position.z = 6;
	return wheel;
}

function pickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)]
}

function Car() {
	const car = new THREE.Group();

	const color = pickRandom(vehicleColors)

	const main = new THREE.Mesh(
		new THREE.BoxBufferGeometry(60, 30, 15),
		new THREE.MeshLambertMaterial({ color })
	);
	main.position.z = 12;
	car.add(main);


	let carFrontTexture = getCarFrontTexture(),
		carBackTexture = getCarFrontTexture(),
		carRightTexture = getCarSideTexture(),
		carLeftTexture = getCarSideTexture();

	carFrontTexture.center = new THREE.Vector2(0.5, 0.5);
	carFrontTexture.rotation = Math.PI / 2;

	carBackTexture.center = new THREE.Vector2(0.5, 0.5);
	carBackTexture.rotation = -Math.PI / 2;

	carLeftTexture.flipY = false;

	const cabin = new THREE.Mesh(
		new THREE.BoxBufferGeometry(33, 24, 12),
		[
			new THREE.MeshLambertMaterial({ map: carFrontTexture }),
			new THREE.MeshLambertMaterial({ map: carBackTexture }),
			new THREE.MeshLambertMaterial({ map: carLeftTexture }),
			new THREE.MeshLambertMaterial({ map: carRightTexture }),
			new THREE.MeshLambertMaterial({ color: 0xffffff }), // top
			new THREE.MeshLambertMaterial({ color: 0xffffff })	// bottom
		]
	);
	cabin.position.x = -6;
	cabin.position.z = 25.5;
	car.add(cabin);

	const backWheel = Wheel();
	backWheel.position.x = -18;
	car.add(backWheel);

	const frontWheel = Wheel();
	frontWheel.position.x = 18;
	car.add(frontWheel);

	return car;
}


// image from HTML5 Canvas like whuttttt
function getCarFrontTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 64;
	canvas.height = 32;

	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, 64, 32);

	ctx.fillStyle = "#666666";
	ctx.fillRect(8, 8, 48, 24);

	return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 128;
	canvas.height = 32;

	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, 128, 32);

	ctx.fillStyle = "#666666";
	ctx.fillRect(10, 8, 38, 24);
	ctx.fillRect(58, 8, 60, 24);

	return new THREE.CanvasTexture(canvas);
}




function Truck() {
	const truck = new THREE.Group();
	const color = pickRandom(vehicleColors);

	const base = new THREE.Mesh(
		new THREE.BoxBufferGeometry(100, 25, 5),
		new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
	);
	base.position.z = 10;
	truck.add(base);

	const cargo = new THREE.Mesh(
		new THREE.BoxBufferGeometry(75, 30, 40),
		new THREE.MeshLambertMaterial({ color: 0xffffff }) // 0xb4c6fc
	);
	cargo.position.x = -15;
	cargo.position.z = 30;
	truck.add(cargo);

	const truckFrontTexture = getTruckFrontTexture();
	truckFrontTexture.center = new THREE.Vector2(0.5, 0.5);
	truckFrontTexture.rotation = Math.PI / 2;

	const truckLeftTexture = getTruckSideTexture();
	truckLeftTexture.flipY = false;

	const truckRightTexture = getTruckSideTexture();

	const cabin = new THREE.Mesh(
		new THREE.BoxBufferGeometry(25, 30, 30),
		[
			new THREE.MeshLambertMaterial({ color, map: truckFrontTexture }),
			new THREE.MeshLambertMaterial({ color }), // back
			new THREE.MeshLambertMaterial({ color, map: truckLeftTexture }),
			new THREE.MeshLambertMaterial({ color, map: truckRightTexture }),
			new THREE.MeshLambertMaterial({ color }), // top
			new THREE.MeshLambertMaterial({ color }) // bottom
		]
	);
	cabin.position.x = 40;
	cabin.position.z = 20;
	truck.add(cabin);

	const backWheel = Wheel();
	backWheel.position.x = -30;
	truck.add(backWheel);

	const middleWheel = Wheel();
	middleWheel.position.x = 10;
	truck.add(middleWheel);

	const frontWheel = Wheel();
	frontWheel.position.x = 38;
	truck.add(frontWheel);

	return truck;
}


function getTruckFrontTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 32);

	context.fillStyle = "#666666";
	context.fillRect(0, 5, 32, 10);

	return new THREE.CanvasTexture(canvas);
}

function getTruckSideTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 32;
	canvas.height = 32;
	const context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, 32, 32);

	context.fillStyle = "#666666";
	context.fillRect(17, 5, 15, 10);

	return new THREE.CanvasTexture(canvas);
}


function Tree() {
	const tree = new THREE.Group();

	const treeHeights = [45, 60, 75];
	const height = pickRandom(treeHeights);

	const trunk = new THREE.Mesh(
		new THREE.BoxBufferGeometry(15, 15, height + 20),
		new THREE.MeshLambertMaterial({ color: 0x4b3f2f })
	);
	trunk.position.z = 10;
	trunk.matrixAutoUpdate = false;
	tree.add(trunk);

	

	const crown = new THREE.Mesh(
		new THREE.SphereGeometry(height / 2, 30, 30),
		new THREE.MeshLambertMaterial({ color: 0x498c2c })
	);
	crown.position.z = height / 2 + 30;
	tree.add(crown);

	return tree;
}



// AUTO HITBOX
// function HitBox(spriteWidth){
// 	let centerOffset = 
// 		carHitZoneRadius + ((spriteWidth % carHitZoneRadius) / 2);
// 	let evenPattern = (Math.floor(spriteWidth / carHitZoneRadius) % 2) == 0; 
// }