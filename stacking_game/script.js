let camera, scene, renderer;
let world;

let gameStarted = false;

const originalBoxSize = 3;
const boxHeight = 1;

let stack = [];
let overhangs = [];

init();

window.addEventListener("click", () => {
	if (!gameStarted) {
		renderer.setAnimationLoop(animation);
		gameStarted = true;
	}
	else {
		handleEvent();
	}
});

function handleEvent() {

	// mouseClicked during game, add new layer
	const topLayer = stack[stack.length - 1];
	const previousLayer = stack[stack.length - 2];
	const direction = topLayer.direction;

	const delta =
		topLayer.threejs.position[direction] -
		previousLayer.threejs.position[direction];

	const overhangSize = Math.abs(delta);
	const size = direction == "x" ? topLayer.width : topLayer.depth;
	const overlap = size - overhangSize;

	if (overlap > 0) {

		// Cut layer
		const newWidth = direction == "x" ? overlap : topLayer.width;
		const newDepth = direction == "z" ? overlap : topLayer.depth;

		// Update metadata
		topLayer.width = newWidth;
		topLayer.depth = newDepth;

		// Update threejs model (scale and re-position)
		topLayer.threejs.scale[direction] = overlap / size;
		topLayer.threejs.position[direction] -= delta / 2;

		// Update cannonjs model 
		topLayer.cannonjs.position[direction] -= delta / 2;

		// Replace shape to a smaller one (can't scale in cannonjs)
		const shape = new CANNON.Box(
			new CANNON.Vec3( newWidth/2, boxHeight/2 , newDepth/2 )
		);
		topLayer.cannonjs.shapes = [];
		topLayer.cannonjs.addShape(shape);

		// Create overhang 
		const overhangShift = (overlap/2 + overhangSize/2) * Math.sign(delta);
		const overhangX = direction == "x" 
										? topLayer.threejs.position.x + overhangShift
										: topLayer.threejs.position.x;
		const overhangZ = direction == "z"
										? topLayer.threejs.position.z + overhangShift
										: topLayer.threejs.position.z;
		const overhangWidth = direction == "x" ? overhangSize : newWidth;
		const overhangDepth = direction == "z" ? overhangSize : newDepth;

		addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

		// Next layer
		let nextDirection = direction == "x" ? "z" : "x";
		let nextX = direction == "x" ? topLayer.threejs.position.x : -10;
		let nextZ = direction == "z" ? topLayer.threejs.position.z : -10;

		addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
	}


}

function animation() {
	const speed = 0.15; // pixel per second

	// animate top layer
	const topLayer = stack[stack.length - 1];
	topLayer.threejs.position[topLayer.direction] += speed;
	topLayer.cannonjs.position[topLayer.direction] += speed;

	// update camera position (initial pos is 4)
	// boxHeight * (stack.length-2) + 4, because initial stack size is 2
	if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
		camera.position.y += speed;
	}

	updatePhysics();
	// IMPORTANT!!!!!!
	renderer.render(scene, camera);

}

function updatePhysics() {
	world.step(1 / 60); // 60 fps, step in the physics world

	// Copy coords from CannonJS to ThreeJS
	overhangs.forEach(elem => {
		elem.threejs.position.copy(elem.cannonjs.position);
		elem.threejs.quaternion.copy(elem.cannonjs.quaternion);
	})
}


function init() {

	// Initialize CannonJS
	world = new CANNON.World();
	world.gravity.set(0, -10, 0); // gravity yayyy
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 40;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000); // Optional, black is default

	addLayer(0, 0, originalBoxSize, originalBoxSize);
	addLayer(-10, 0, originalBoxSize, originalBoxSize, "x");

	// Set up lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
	dirLight.position.set(10, 20, 0); // x, y, z
	scene.add(dirLight);

	// Orthographic camera
	const width = 10;
	const height = width * (window.innerHeight / window.innerWidth);
	camera = new THREE.OrthographicCamera(
		width / -2, // left
		width / 2, // right
		height / 2, // top
		height / -2, // bottom
		1, // near
		100 // far
	);

	camera.position.set(4, 4, 4);
	camera.lookAt(0, 0, 0);

	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);

	// Add it to HTML
	document.body.appendChild(renderer.domElement);

}


function addLayer(x, z, width, depth, direction) {
	let y = boxHeight * stack.length; // add box 1 layer higher

	let layer = generateBox(x, y, z, width, depth, false);
	layer.direction = direction;

	stack.push(layer);
}

function addOverhang(x, z, width, depth) {
	let y = boxHeight * (stack.length-1); // add box on highest layer

	const overhang = generateBox(x, y, z, width, depth, true);

	overhangs.push(overhang);
}


function generateBox(x, y, z, width, depth, falls) {
	// ThreeJS
	const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
	const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
	const material = new THREE.MeshLambertMaterial({ color });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	scene.add(mesh);

	// CannonJS
	const shape = new CANNON.Box(
		new CANNON.Vec3( width/2, boxHeight/2, depth/2 )
	); 
	// cannonjs dimensions meausre from center to side, so divide by 2
	let mass = falls ? 5 : 0;
	const body = new CANNON.Body({ mass, shape });
	body.position.set(x, y, z);
	world.addBody(body);

	return {
		threejs: mesh,
		cannonjs: body,
		width,
		depth,
	};
}
