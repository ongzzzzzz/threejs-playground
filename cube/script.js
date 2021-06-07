// SCENE: somewhere to shoot movie
const scene = new THREE.Scene()

// CAMERA: need someting to shoot movie
const camera = new THREE.PerspectiveCamera( 
	75, // FOV
	window.innerWidth / window.innerHeight, // Aspect Ratio
	0.1, // Near Clipping Plane (dont render too near)
	1000 // Far Clipping Plane (dont render too far)
)


// RENDERER: need somewhere to show the movie (like a theater)
const renderer = new THREE.WebGLRenderer({ antialias: true})

// resize movie theater
renderer.setSize( window.innerWidth, window.innerHeight )
// where to put movie theater
document.body.appendChild( renderer.domElement )


// shape of the object (vertices, faces etc.)
var geometry = new THREE.BoxGeometry(1, 1, 1) // width depth height

// what our object is made of
// eg. pebble and metal ball same shape but diff material, so look diff
// this material no reflect light
// var material = new THREE.MeshBasicMaterial({ color: 0xff0051 })
// this material got reflect light
var material = new THREE.MeshStandardMaterial({ color: 0xff0051 })

// geometry + material 
var cube = new THREE.Mesh ( geometry, material )

// add to our place where we film movie
scene.add( cube ) // default is added to 0, 0, 0



var geometry = new THREE.BoxGeometry( 3, 3, 3)
var material = new THREE.MeshBasicMaterial( {
 color: "#dadada", wireframe: true, transparent: true
})
var wireframeCube = new THREE.Mesh ( geometry, material )
scene.add( wireframeCube )



// soft lighting (no direction, everything just become brighter)
var ambientLight = new THREE.AmbientLight ( 0xffffff, 0.5)
scene.add( ambientLight )

// direct lighting (point source, got personality)
var pointLight = new THREE.PointLight( 0xffffff, 1 );
pointLight.position.set( 25, 50, 25 );
scene.add( pointLight );


// change camera position (now it's at same coords as box)
camera.position.z = 5

// show the scene from pov of our camera on the movie theater
renderer.render( scene, camera ) 


// runs every frame bc of requestAnimationFrame (60fps graphics)
function animate() {
 requestAnimationFrame( animate )
 wireframeCube.rotation.x -= 0.01;
 wireframeCube.rotation.y -= 0.01;
 cube.rotation.x += 0.04;
 cube.rotation.y += 0.04;
 renderer.render( scene, camera ) // rerender frame
}
animate()