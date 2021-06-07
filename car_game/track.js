const trackRadius = 225;
const trackWidth = 45;
const innerTrackRadius = trackRadius - trackWidth;
const outerTrackRadius = trackRadius + trackWidth;

const arcAngle1 = Math.PI / 3;

const deltaY = Math.sin(arcAngle1) * innerTrackRadius;

const arcAngle2 = Math.asin(deltaY / outerTrackRadius);

const arcCenterX = (
	Math.cos(arcAngle1) * innerTrackRadius +
	Math.cos(arcAngle2) * outerTrackRadius
) / 2;

const arcAngle3 = Math.acos(arcCenterX / innerTrackRadius);

const arcAngle4 = Math.acos(arcCenterX / outerTrackRadius);




function renderMap(mapWidth, mapHeight) {

	// LINE MARKINGS USING CANVAS
	const lineMarkingsTexture = getLineMarkings(mapWidth, mapHeight);

	// 2D PLANE FOR THE GAME
	const planeGeometry = new THREE.PlaneBufferGeometry(mapWidth, mapHeight);
	const planeMaterial = new THREE.MeshLambertMaterial({
		// color: 0x546e90
		map: lineMarkingsTexture
	});
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(plane);

	// EXTRUDED ISLAND GEOMETRY 
	const islandLeft = getLeftIsland();
	const islandRight = getRightIsland();
	const islandMiddle = getMiddleIsland();
	const outerField = getOuterField(mapWidth, mapHeight);

	const fieldGeometry = new THREE.ExtrudeBufferGeometry(
		[islandLeft, islandRight, islandMiddle, outerField],
		{ depth: 6, bevelEnabled: false }
	);

	const fieldMesh = new THREE.Mesh(
		fieldGeometry,
		[
			new THREE.MeshLambertMaterial({ color: 0x67c240 }), // top color
			new THREE.MeshLambertMaterial({ color: 0x23311c }) // side color
		]
	);
	scene.add(fieldMesh);


}


function getLineMarkings(mapWidth, mapHeight) {
	const canvas = document.createElement("canvas");
	canvas.width = mapWidth;
	canvas.height = mapHeight;
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "#546E90";
	ctx.fillRect(0, 0, mapWidth, mapHeight);

	ctx.lineWidth = 2;
	ctx.strokeStyle = "#E0FFFF";
	ctx.setLineDash([10, 14]); // after 10 units of stroke, got 14 unit of gap

	// LEFT CIRCLE
	ctx.beginPath();
	ctx.arc(
		mapWidth / 2 - arcCenterX,
		mapHeight / 2,
		trackRadius,
		0,
		Math.PI * 2
	);
	ctx.stroke();

	// RIGHT CIRCLE
	ctx.beginPath();
	ctx.arc(
		mapWidth / 2 + arcCenterX,
		mapHeight / 2,
		trackRadius,
		0,
		Math.PI * 2
	);
	ctx.stroke();

	return new THREE.CanvasTexture(canvas);
}


function getLeftIsland() {
	const islandLeft = new THREE.Shape();

	islandLeft.absarc(
		-arcCenterX, // x
		0, // y
		innerTrackRadius, // arc radius
		arcAngle1, // start angle
		-arcAngle1, // end angle 
		false // clockwise?
	);

	islandLeft.absarc(
		arcCenterX,
		0,
		outerTrackRadius,
		Math.PI + arcAngle2,
		Math.PI - arcAngle2,
		true
	);

	// NOTE: both paths need to be continuous to be a THREE.Shape; else will cacat

	return islandLeft;
}

function getMiddleIsland() {
	const islandMiddle = new THREE.Shape();

	islandMiddle.absarc(
		-arcCenterX, // x
		0, // y
		innerTrackRadius, // arc radius
		arcAngle3, // start angle
		-arcAngle3, // end angle 
		true // clockwise?
	);

	islandMiddle.absarc(
		arcCenterX,
		0,
		innerTrackRadius,
		Math.PI + arcAngle3,
		Math.PI - arcAngle3,
		true
	);

	return islandMiddle;
}


function getRightIsland() {
	const islandRight = new THREE.Shape();

	islandRight.absarc(
		-arcCenterX, // x
		0, // y
		outerTrackRadius, // arc radius
		arcAngle2, // start angle
		-arcAngle2, // end angle 
		true // clockwise?
	);

	islandRight.absarc(
		arcCenterX,
		0,
		innerTrackRadius,
		Math.PI + arcAngle1,
		Math.PI - arcAngle1,
		false
	);

	return islandRight;
}

function getOuterField(mapWidth, mapHeight) {
	const field = new THREE.Shape();

	// start from bottom left corner
	field.moveTo(-mapWidth/2, -mapHeight/2);
	// draw line to middle bottom
	field.lineTo(0, -mapHeight/2);

	// draw arc around left circle
	field.absarc(
		-arcCenterX,
		0,
		outerTrackRadius,
		-arcAngle4,
		arcAngle4,
		true
	);
	// draw arc around right circle
	field.absarc(
		arcCenterX,
		0,
		outerTrackRadius,
		Math.PI - arcAngle4,
		Math.PI + arcAngle4,
		true
	);
	// draw line to middle bottom
	field.lineTo(0, -mapHeight/2);
	// draw line to bottom right
	field.lineTo(mapWidth/2, -mapHeight/2);
	// draw line to top right
	field.lineTo(mapWidth/2, mapHeight/2);
	// draw line to top left
	field.lineTo(-mapWidth/2, mapHeight/2);

	return field;
}